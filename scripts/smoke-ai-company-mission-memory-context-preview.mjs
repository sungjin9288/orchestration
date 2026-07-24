import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import contextModule from '../src/runtime/mission-memory-context-preview.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const {
  BLOCKED_ACTIONS,
  computeMissionMemoryContextTargetDigest,
} = contextModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_MISSION_MEMORY_CONTEXT_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-mission-memory-context-smoke');
const keepFixture = process.env.ORCHESTRATION_MISSION_MEMORY_CONTEXT_KEEP_FIXTURE === '1';
const MODE = 'ai-company-mission-memory-context-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('MissionMemoryContext preview must not call a provider');
      },
      executeSynthesis() {
        throw new Error('MissionMemoryContext preview must not call a provider');
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

function assertNoWrite(statePath, operation, pattern) {
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

function buildContextSpec(memoryRecall) {
  return {
    purpose: '현재 draft Mission에서 과거 검증 evidence의 적용 범위를 사람이 검토합니다.',
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

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const runtimeRoot = seedDurableRecall();
    const runtime = createRuntime(runtimeRoot);
    const seededSnapshot = runtime.getSnapshot();
    const memoryRecall = Object.values(seededSnapshot.memoryRecalls)[0];
    const memoryItem = seededSnapshot.memoryItems[memoryRecall.sourceMemoryItemId];
    assert.ok(memoryRecall);
    assert.ok(memoryItem);
    assert.equal(seededSnapshot.schemaVersion, 19);

    const mission = runtime.createMission({
      projectId: memoryRecall.projectId,
      title: 'Recorded recall context 검토',
      goal: '과거 evidence가 현재 draft Mission에 참고 가능한 범위를 검토한다.',
      constraints: 'response-only이며 Mission과 prompt를 변경하지 않는다.',
      deliverableType: 'code-change',
    });
    assert.equal(mission.status, 'draft');
    const targetMissionDigest = computeMissionMemoryContextTargetDigest(mission);
    const evaluatedAt = new Date().toISOString();
    const request = {
      missionId: mission.id,
      memoryRecallId: memoryRecall.id,
      memoryRecallRecordDigest: memoryRecall.recordDigest,
      memoryItemId: memoryItem.id,
      memoryItemRecordDigest: memoryItem.recordDigest,
      targetMissionDigest,
      evaluatedAt,
      contextSpec: buildContextSpec(memoryRecall),
    };
    const statePath = path.join(runtimeRoot, 'state.json');
    const stateBytesBefore = fs.readFileSync(statePath, 'utf8');

    const preview = runtime.previewMissionMemoryContext(request);
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'context-review-ready');
    assert.equal(preview.selectionMode, 'exact-id-operator-selected');
    assert.equal(preview.projectId, memoryRecall.projectId);
    assert.equal(preview.targetMissionId, mission.id);
    assert.equal(preview.targetMissionDigest, targetMissionDigest);
    assert.equal(preview.targetMissionStatus, 'draft');
    assert.equal(preview.sourceMemoryRecallId, memoryRecall.id);
    assert.equal(preview.sourceMemoryRecallRecordDigest, memoryRecall.recordDigest);
    assert.equal(preview.sourceMemoryItemId, memoryItem.id);
    assert.equal(preview.sourceMemoryItemRecordDigest, memoryItem.recordDigest);
    assert.deepEqual(preview.evidenceRefs, [...memoryRecall.evidenceRefs].sort());
    assert.deepEqual(
      preview.negativeEvidenceRefs,
      [...memoryRecall.negativeEvidenceRefs].sort(),
    );
    assert.deepEqual(preview.redactionRefs, [...memoryRecall.redactionRefs].sort());
    assert.deepEqual(preview.reviewRefs, [...memoryRecall.reviewRefs].sort());
    assert.equal(preview.recommendationStatus, 'blocked');
    assert.equal(preview.applicationStatus, 'blocked');
    assert.equal(preview.missionInjectionStatus, 'blocked');
    assert.equal(preview.workOrderInjectionStatus, 'blocked');
    assert.deepEqual(preview.blockedActions, [...BLOCKED_ACTIONS]);
    assert.equal(
      preview.nonInjectionStatement,
      'memory-context-preview-not-mission-or-prompt-injection',
    );
    assert.match(preview.id, /^mission-memory-context-preview-[a-f0-9]{16}$/);
    assert.match(preview.previewDigest, /^[a-f0-9]{64}$/);
    assert.equal(Object.isFrozen(preview), true);
    assert.equal(Object.isFrozen(preview.applicability), true);
    assert.equal(Object.isFrozen(preview.evidenceRefs), true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const replay = runtime.previewMissionMemoryContext(request);
    assert.deepEqual(replay, preview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    assertNoWrite(
      statePath,
      () => runtime.previewMissionMemoryContext({ ...request, rawArtifactBody: 'forbidden' }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          memoryRecallRecordDigest: '0'.repeat(64),
        }),
      /memoryRecallRecordDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          memoryItemRecordDigest: '0'.repeat(64),
        }),
      /memoryItemRecordDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          targetMissionDigest: '0'.repeat(64),
        }),
      /targetMissionDigest/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          evaluatedAt: memoryRecall.expiresAt,
        }),
      /expired|too far in the future/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            workspaceScope: { projectId: 'project-outside-workspace' },
          },
        }),
      /workspaceScope/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            applicability: {
              ...request.contextSpec.applicability,
              targetPathAllowlist: ['src/not-approved.js'],
            },
          },
        }),
      /unsupported source value/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            negativeEvidenceRefs: request.contextSpec.negativeEvidenceRefs.slice(1),
          },
        }),
      /must preserve every source value|non-empty array/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            purpose: 'authorization=Bearer-secret-token',
          },
        }),
      /credential marker/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            providerMode: 'openai-responses',
          },
        }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          contextSpec: {
            ...request.contextSpec,
            applyToMission: true,
          },
        }),
      /unexpected or missing fields/,
    );

    const completedMission = seededSnapshot.missions[memoryItem.sourceMissionId];
    assert.ok(completedMission);
    assert.notEqual(completedMission.status, 'draft');
    assertNoWrite(
      statePath,
      () =>
        runtime.previewMissionMemoryContext({
          ...request,
          missionId: completedMission.id,
        }),
      /target Mission must be current draft evidence/,
    );

    const recallInspection = runtime.getMemoryItemRecall(memoryItem.id);
    assert.deepEqual(recallInspection.memoryRecall, memoryRecall);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          schemaVersion: seededSnapshot.schemaVersion,
          missionMemoryContextPreview: {
            id: preview.id,
            previewDigest: preview.previewDigest,
            targetMissionId: preview.targetMissionId,
            sourceMemoryRecallId: preview.sourceMemoryRecallId,
            sourceMemoryItemId: preview.sourceMemoryItemId,
            status: preview.status,
          },
          safety: {
            exactReplayStable: true,
            deeplyFrozen: true,
            stateBytesUnchanged: true,
            staleExpiredCrossProjectWidenedCredentialProviderApplicationRejected: true,
            missionPromptWorkOrderApplicationAuthoritiesBlocked: true,
            durableRecallInspectionCompatible: true,
          },
        },
        null,
        2,
      )}\n`,
    );
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
