import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import attachmentModule from '../src/runtime/mission-context-attachments.js';
import contextModule from '../src/runtime/mission-memory-context-preview.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const {
  ATTACHMENT_REVIEW_ACKNOWLEDGEMENT,
  MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS,
  computeMissionContextAttachmentRecordDigest,
} = attachmentModule;
const { computeMissionMemoryContextTargetDigest } = contextModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_REVIEWED_MISSION_CONTEXT_ATTACHMENT_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-reviewed-mission-context-attachment-smoke');
const keepFixture =
  process.env.ORCHESTRATION_REVIEWED_MISSION_CONTEXT_ATTACHMENT_KEEP_FIXTURE === '1';
const mode = 'ai-company-reviewed-mission-context-attachment-smoke';

requireNoCliArgs(process.argv.slice(2), { mode });

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('MissionContextAttachment must not call a provider');
      },
      executeSynthesis() {
        throw new Error('MissionContextAttachment must not call a provider');
      },
    },
  });
}

function seedDurableRecall() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-durable-memory-recall.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DURABLE_MEMORY_RECALL_KEEP_FIXTURE: '1',
        ORCHESTRATION_DURABLE_MEMORY_RECALL_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryRecall');
  }
  return path.join(tempRoot, 'source', 'runtime');
}

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function toSchemaV28(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 28;
  delete previous.sequences.missionContextAttachment;
  delete previous.missionContextAttachments;
  return previous;
}

function buildContextSpec(memoryRecall) {
  return {
    purpose: '현재 draft Mission에서 검토된 memory evidence의 참고 범위를 고정합니다.',
    workspaceScope: { projectId: memoryRecall.projectId },
    applicability: {
      summary: memoryRecall.applicability.summary,
      targetPathAllowlist: [...memoryRecall.applicability.targetPathAllowlist],
      verificationCommands: [...memoryRecall.applicability.verificationCommands],
    },
    evidenceRefs: [...memoryRecall.evidenceRefs],
    negativeEvidenceRefs: [...memoryRecall.negativeEvidenceRefs],
    redactionRefs: [...memoryRecall.redactionRefs],
    reviewRefs: [...memoryRecall.reviewRefs],
    acknowledgement:
      'operator-selected-recorded-recall-for-mission-context-review',
    nonInjectionStatement:
      'memory-context-preview-not-mission-or-prompt-injection',
  };
}

function assertNoWrite(statePath, operation, pattern) {
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function waitForServer(child, port) {
  const deadline = Date.now() + 10_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error('API server exited before readiness');
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/snapshot`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('API server readiness timed out');
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const runtimeRoot = seedDurableRecall();
    const sourceRuntime = createRuntime(runtimeRoot);
    const sourceSnapshot = sourceRuntime.getSnapshot();
    const memoryRecall = Object.values(sourceSnapshot.memoryRecalls)[0];
    const memoryItem = sourceSnapshot.memoryItems[memoryRecall.sourceMemoryItemId];
    const mission = sourceRuntime.createMission({
      projectId: memoryRecall.projectId,
      title: 'Reviewed memory context attachment',
      goal: '검토된 memory evidence를 immutable Mission sidecar로 기록한다.',
      constraints: 'Role consumption, prompt injection, source mutation은 금지한다.',
      deliverableType: 'code-change',
    });
    const statePath = path.join(runtimeRoot, 'state.json');
    const schemaV28 = toSchemaV28(JSON.parse(fs.readFileSync(statePath, 'utf8')));
    writeState(runtimeRoot, schemaV28);
    const schemaV28Bytes = fs.readFileSync(statePath, 'utf8');
    const runtime = createRuntime(runtimeRoot);
    const evaluatedAt = new Date().toISOString();
    const previewRequest = {
      missionId: mission.id,
      memoryRecallId: memoryRecall.id,
      memoryRecallRecordDigest: memoryRecall.recordDigest,
      memoryItemId: memoryItem.id,
      memoryItemRecordDigest: memoryItem.recordDigest,
      targetMissionDigest: computeMissionMemoryContextTargetDigest(mission),
      evaluatedAt,
      contextSpec: buildContextSpec(memoryRecall),
    };

    const passiveInspection = runtime.getMissionContextAttachment(mission.id);
    assert.equal(passiveInspection.attached, false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV28Bytes);
    const preview = runtime.previewMissionMemoryContext(previewRequest);
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV28Bytes);

    const request = {
      ...previewRequest,
      sourcePreviewId: preview.id,
      sourcePreviewDigest: preview.previewDigest,
      attachmentReview: {
        decision: 'attach',
        acknowledgement: ATTACHMENT_REVIEW_ACKNOWLEDGEMENT,
        rationale: 'Source tuple, negative evidence, blocked authority를 직접 검토했습니다.',
        reviewedAt: evaluatedAt,
      },
    };
    assertNoWrite(
      statePath,
      () => runtime.attachReviewedMissionContext({ ...request, rawArtifactBody: 'forbidden' }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      statePath,
      () => runtime.attachReviewedMissionContext({ ...request, sourcePreviewDigest: '0'.repeat(64) }),
      /current recomputation/,
    );
    assertNoWrite(
      statePath,
      () => runtime.attachReviewedMissionContext({
        ...request,
        attachmentReview: { ...request.attachmentReview, decision: 'inject' },
      }),
      /decision must be attach/,
    );

    const sourceRecordsBefore = {
      mission: JSON.stringify(schemaV28.missions[mission.id]),
      recall: JSON.stringify(schemaV28.memoryRecalls[memoryRecall.id]),
      item: JSON.stringify(schemaV28.memoryItems[memoryItem.id]),
    };
    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = runtime.attachReviewedMissionContext(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    const attachment = created.missionContextAttachment;
    assert.equal(attachment.id, 'mission-context-attachment-0001');
    assert.equal(attachment.persisted, true);
    assert.equal(attachment.status, 'attached');
    assert.equal(attachment.targetMissionId, mission.id);
    assert.equal(attachment.sourcePreviewId, preview.id);
    assert.equal(attachment.sourcePreviewDigest, preview.previewDigest);
    assert.equal(attachment.roleConsumptionStatus, 'blocked');
    assert.equal(attachment.policyInjectionStatus, 'blocked');
    assert.deepEqual(
      attachment.blockedActions,
      [...MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS],
    );
    assert.equal(
      computeMissionContextAttachmentRecordDigest(attachment),
      attachment.recordDigest,
    );
    assert.equal(Object.isFrozen(attachment), true);
    assert.equal(Object.isFrozen(attachment.attachmentReview), true);

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 30);
    assert.equal(persisted.sequences.missionContextAttachment, 1);
    assert.equal(Object.keys(persisted.missionContextAttachments).length, 1);
    assert.equal(JSON.stringify(persisted.missions[mission.id]), sourceRecordsBefore.mission);
    assert.equal(JSON.stringify(persisted.memoryRecalls[memoryRecall.id]), sourceRecordsBefore.recall);
    assert.equal(JSON.stringify(persisted.memoryItems[memoryItem.id]), sourceRecordsBefore.item);

    const snapshot = runtime.getSnapshot();
    assert.equal(
      Object.prototype.hasOwnProperty.call(snapshot, 'missionContextAttachments'),
      false,
    );
    const inspected = runtime.getMissionContextAttachment(mission.id);
    assert.equal(inspected.attached, true);
    assert.deepEqual(inspected.missionContextAttachment, attachment);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.attachReviewedMissionContext(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.missionContextAttachment, attachment);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    assertNoWrite(
      statePath,
      () => runtime.attachReviewedMissionContext({
        ...request,
        attachmentReview: {
          ...request.attachmentReview,
          rationale: '다른 attachment rationale입니다.',
        },
      }),
      /already has a different/,
    );
    assert.deepEqual(
      createRuntime(runtimeRoot).getMissionContextAttachment(mission.id)
        .missionContextAttachment,
      attachment,
    );

    const port = 47629;
    const server = spawn(
      process.execPath,
      ['scripts/serve-ui-slice-01.mjs', '--runtime-root', runtimeRoot, '--port', String(port)],
      { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    try {
      await waitForServer(server, port);
      const getResponse = await fetch(
        `http://127.0.0.1:${port}/api/missions/${mission.id}/context-attachment`,
      );
      assert.equal(getResponse.status, 200);
      assert.equal((await getResponse.json()).missionContextAttachment.id, attachment.id);
      const postResponse = await fetch(
        `http://127.0.0.1:${port}/api/missions/${mission.id}/context-attachments`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(Object.fromEntries(
            Object.entries(request).filter(([key]) => key !== 'missionId'),
          )),
        },
      );
      assert.equal(postResponse.status, 200);
      assert.equal((await postResponse.json()).mutation.idempotent, true);
    } finally {
      server.kill('SIGTERM');
      await new Promise((resolve) => server.once('exit', resolve));
    }

    const partialRoot = path.join(tempRoot, 'partial-v29');
    const partial = structuredClone(persisted);
    delete partial.missionContextAttachments;
    writeState(partialRoot, partial);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadStateReadonly(),
      /missing MissionContextAttachment fields/,
    );
    const futureRoot = path.join(tempRoot, 'future-v31');
    writeState(futureRoot, { ...persisted, schemaVersion: 31 });
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion/,
    );
    const rollbackRoot = path.join(tempRoot, 'rollback-retention');
    writeState(rollbackRoot, persisted);
    assert.deepEqual(
      createFileStore({ runtimeRoot: rollbackRoot }).loadStateReadonly()
        .missionContextAttachments,
      persisted.missionContextAttachments,
    );

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode,
      migration: {
        fromSchemaVersion: 28,
        toSchemaVersion: persisted.schemaVersion,
        atomicSaveCount: saveCount,
        passiveCreationCount: 0,
      },
      attachment: {
        id: attachment.id,
        recordDigest: attachment.recordDigest,
        targetMissionId: attachment.targetMissionId,
        sourcePreviewId: attachment.sourcePreviewId,
        status: attachment.status,
      },
      safety: {
        exactTenKeyApiAndMissionBoundGet: true,
        exactReplayWithoutSave: true,
        sourceRecordsByteEquivalent: true,
        genericSnapshotExcluded: true,
        staleDivergentMalformedNoWrite: true,
        rolePromptPolicyCouncilPlanWorkOrderConsumptionBlocked: true,
        rollbackRetentionProved: true,
      },
    }, null, 2)}\n`);
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
