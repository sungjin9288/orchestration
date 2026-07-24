import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import memoryItemModule from '../src/runtime/memory-items.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const { computeMemoryItemRecordDigest } = memoryItemModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_DURABLE_MEMORY_ITEM_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-durable-memory-item-smoke');
const keepFixture = process.env.ORCHESTRATION_DURABLE_MEMORY_ITEM_KEEP_FIXTURE === '1';
const MODE = 'ai-company-durable-memory-item-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
}

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('Durable MemoryItem must not call a provider');
      },
      executeSynthesis() {
        throw new Error('Durable MemoryItem must not call a provider');
      },
    },
  });
}

function seedAcceptedMemoryPreview() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-memory-candidate-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MEMORY_CANDIDATE_KEEP_FIXTURE: '1',
        ORCHESTRATION_MEMORY_CANDIDATE_SEED_ONLY: '1',
        ORCHESTRATION_MEMORY_CANDIDATE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryCandidate');
  }
  return JSON.parse(seeded.stdout);
}

function toSchemaV13(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 13;
  delete previous.sequences.memoryItem;
  delete previous.sequences.memoryRecall;
  delete previous.sequences.staffingPlan;
  delete previous.memoryItems;
  delete previous.memoryRecalls;
  delete previous.staffingPlans;
  return previous;
}

function withoutMemoryItemState(state) {
  const copy = structuredClone(state);
  delete copy.sequences.memoryItem;
  delete copy.sequences.memoryRecall;
  delete copy.sequences.staffingPlan;
  delete copy.memoryItems;
  delete copy.memoryRecalls;
  delete copy.staffingPlans;
  copy.schemaVersion = 13;
  return copy;
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seed = seedAcceptedMemoryPreview();
    const currentRuntime = createRuntime(seed.runtimeRoot);
    const preview = currentRuntime.previewLearningCandidateMemory(
      seed.memoryPreviewRequest,
    );
    const currentState = currentRuntime.getSnapshot();
    const schemaV13 = toSchemaV13(currentState);
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(seed.projectPath, 'src/runtime/runtime-service.js');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    writeState(seed.runtimeRoot, schemaV13);
    const schemaV13Bytes = fs.readFileSync(statePath, 'utf8');
    const runtime = createRuntime(seed.runtimeRoot);
    const request = {
      ...seed.memoryPreviewRequest,
      memoryCandidatePreviewId: preview.id,
      memoryCandidatePreviewDigest: preview.previewDigest,
      storageApproval: {
        decision: 'store',
        acknowledgement: 'reviewed-memory-candidate-for-local-project-storage',
        rationale: '프로젝트 범위와 negative evidence를 검토한 뒤 로컬 저장을 승인합니다.',
        reviewedAt: seed.memoryPreviewRequest.evaluatedAt,
      },
    };

    assertNoWrite(
      seed.runtimeRoot,
      () => runtime.getLearningCandidateMemoryItem(seed.learningCandidate.id),
      /current state|schema v14/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          memoryCandidatePreviewDigest: '0'.repeat(64),
        }),
      /does not match current recomputation/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          rawTranscript: 'forbidden',
        }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          storageApproval: {
            ...request.storageApproval,
            rationale: 'authorization=Bearer-secret-token',
          },
        }),
      /credential marker/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          memorySpec: {
            ...request.memorySpec,
            workspaceScope: { projectId: 'project-outside-workspace' },
          },
        }),
      /workspaceScope/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          storageApproval: {
            ...request.storageApproval,
            reviewedAt: request.memorySpec.expiresAt,
          },
        }),
      /precede preview expiry|too far in the future/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV13Bytes);

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = runtime.persistLearningCandidateMemoryItem(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.memoryItem.id, 'memory-item-0001');
    assert.equal(created.memoryItem.persisted, true);
    assert.equal(created.memoryItem.status, 'stored');
    assert.equal(created.memoryItem.applicationStatus, 'blocked');
    assert.equal(created.memoryItem.promotionStatus, 'blocked');
    assert.equal(created.memoryItem.redactionStatus, 'review-required');
    assert.equal(created.memoryItem.sourceMemoryCandidatePreviewId, preview.id);
    assert.equal(
      created.memoryItem.sourceMemoryCandidatePreviewDigest,
      preview.previewDigest,
    );
    assert.equal(created.memoryItem.nonPersistenceStatement,
      'source-readiness-was-not-storage-approval');
    assert.deepEqual(created.memoryItem.exportRefs, []);
    assert.deepEqual(created.memoryItem.deletionRefs, []);
    assert.ok(created.memoryItem.negativeEvidenceRefs.length > 0);
    assert.ok(created.memoryItem.blockedActions.includes('retrieval'));
    assert.ok(created.memoryItem.blockedActions.includes('skill-promotion'));
    assert.equal(
      computeMemoryItemRecordDigest(created.memoryItem),
      created.memoryItem.recordDigest,
    );

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 19);
    assert.equal(persisted.sequences.memoryItem, 1);
    assert.equal(Object.keys(persisted.memoryItems).length, 1);
    assert.deepEqual(withoutMemoryItemState(persisted), schemaV13);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.persistLearningCandidateMemoryItem(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.memoryItem, created.memoryItem);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistLearningCandidateMemoryItem({
          ...request,
          storageApproval: {
            ...request.storageApproval,
            rationale: '같은 source review에 다른 승인 근거를 제출합니다.',
          },
        }),
      /already has a different MemoryItem/,
    );

    const inspected = runtime.getLearningCandidateMemoryItem(seed.learningCandidate.id);
    assert.equal(inspected.persisted, true);
    assert.deepEqual(inspected.memoryItem, created.memoryItem);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const migrationOnlyRoot = path.join(tempRoot, 'migration-only');
    writeState(migrationOnlyRoot, schemaV13);
    const migratedOnly = createFileStore({ runtimeRoot: migrationOnlyRoot }).loadState();
    assert.equal(migratedOnly.schemaVersion, 19);
    assert.equal(migratedOnly.sequences.memoryItem, 0);
    assert.deepEqual(migratedOnly.memoryItems, {});
    assert.equal(migratedOnly.sequences.memoryRecall, 0);
    assert.deepEqual(migratedOnly.memoryRecalls, {});

    const corruptRoot = path.join(tempRoot, 'corrupt-memory-item');
    const corruptState = structuredClone(persisted);
    corruptState.memoryItems[created.memoryItem.id].applicationStatus = 'active';
    writeState(corruptRoot, corruptState);
    assertNoWrite(
      corruptRoot,
      () => createFileStore({ runtimeRoot: corruptRoot }).loadStateReadonly(),
      /invalid immutable status or blocked authority/,
    );

    const futureRoot = path.join(tempRoot, 'future-schema');
    writeState(futureRoot, { ...persisted, schemaVersion: 20 });
    assertNoWrite(
      futureRoot,
      () => createFileStore({ runtimeRoot: futureRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion/,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          migration: {
            fromSchemaVersion: 13,
            toSchemaVersion: persisted.schemaVersion,
            atomicSaveCount: saveCount,
            migrationOnlyCreatedNoItem: true,
          },
          memoryItem: {
            id: created.memoryItem.id,
            recordDigest: created.memoryItem.recordDigest,
            status: created.memoryItem.status,
            sourceMemoryCandidatePreviewId:
              created.memoryItem.sourceMemoryCandidatePreviewId,
            exactReplayIdempotent: true,
          },
          safety: {
            passiveReadCreatedNoItem: true,
            staleMalformedCredentialCrossWorkspaceExpiredNoWrite: true,
            applicationPromotionExportDeletionBlocked: true,
            sourceBytesUnchanged: true,
            futureAndCorruptStateRejected: true,
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
