import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import memoryRecallModule from '../src/runtime/memory-recalls.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const { computeMemoryRecallRecordDigest } = memoryRecallModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_DURABLE_MEMORY_RECALL_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-durable-memory-recall-smoke');
const keepFixture = process.env.ORCHESTRATION_DURABLE_MEMORY_RECALL_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_DURABLE_MEMORY_RECALL_SEED_ONLY === '1';
const MODE = 'ai-company-durable-memory-recall-smoke';

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
        throw new Error('Durable MemoryRecall must not call a provider');
      },
      executeSynthesis() {
        throw new Error('Durable MemoryRecall must not call a provider');
      },
    },
  });
}

function seedRecallPreview() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-memory-recall-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MEMORY_RECALL_KEEP_FIXTURE: '1',
        ORCHESTRATION_MEMORY_RECALL_SEED_ONLY: '1',
        ORCHESTRATION_MEMORY_RECALL_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryRecall preview');
  }
  return JSON.parse(seeded.stdout);
}

function toSchemaV14(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 14;
  delete previous.sequences.memoryRecall;
  delete previous.memoryRecalls;
  return previous;
}

function withoutMemoryRecallState(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 14;
  delete previous.sequences.memoryRecall;
  delete previous.memoryRecalls;
  return previous;
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
    const seed = seedRecallPreview();
    const seededRuntime = createRuntime(seed.runtimeRoot);
    const preview = seededRuntime.previewMemoryItemRecall(seed.recallPreviewRequest);
    const schemaV14 = toSchemaV14(seededRuntime.getSnapshot());
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(repoRoot, 'src', 'runtime', 'runtime-service.js');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    writeState(seed.runtimeRoot, schemaV14);
    const schemaV14Bytes = fs.readFileSync(statePath, 'utf8');
    const runtime = createRuntime(seed.runtimeRoot);
    const request = {
      ...seed.recallPreviewRequest,
      memoryRecallPreviewId: preview.id,
      memoryRecallPreviewDigest: preview.previewDigest,
      recordApproval: {
        decision: 'record',
        acknowledgement: 'reviewed-exact-memory-recall-for-local-audit',
        rationale: '프로젝트 범위와 negative evidence를 검토한 exact recall audit입니다.',
        reviewedAt: seed.recallPreviewRequest.evaluatedAt,
      },
    };

    if (seedOnly) {
      writeState(seed.runtimeRoot, seededRuntime.getSnapshot());
      process.stdout.write(
        `${JSON.stringify(
          {
            ok: true,
            mode: MODE,
            seedOnly: true,
            runtimeRoot: seed.runtimeRoot,
            memoryItem: seed.memoryItem,
            learningCandidate: seed.learningCandidate,
            memoryRecallPreview: preview,
            memoryRecallPersistenceRequest: request,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    assertNoWrite(
      seed.runtimeRoot,
      () => runtime.getMemoryItemRecall(seed.memoryItem.id),
      /current state|schema v15/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistMemoryItemRecall({
          ...request,
          memoryRecallPreviewDigest: '0'.repeat(64),
        }),
      /does not match current recomputation/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () => runtime.persistMemoryItemRecall({ ...request, rawArtifactBody: 'forbidden' }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistMemoryItemRecall({
          ...request,
          recordApproval: {
            ...request.recordApproval,
            rationale: 'authorization=Bearer-secret-token',
          },
        }),
      /credential marker/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistMemoryItemRecall({
          ...request,
          recallSpec: {
            ...request.recallSpec,
            workspaceScope: { projectId: 'project-outside-workspace' },
          },
        }),
      /workspaceScope/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistMemoryItemRecall({
          ...request,
          recordApproval: {
            ...request.recordApproval,
            decision: 'apply',
          },
        }),
      /recordApproval.decision/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV14Bytes);

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = runtime.persistMemoryItemRecall(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.memoryRecall.id, 'memory-recall-0001');
    assert.equal(created.memoryRecall.persisted, true);
    assert.equal(created.memoryRecall.status, 'recorded');
    assert.equal(created.memoryRecall.sourceMemoryItemId, seed.memoryItem.id);
    assert.equal(created.memoryRecall.sourceMemoryItemRecordDigest, seed.memoryItem.recordDigest);
    assert.equal(created.memoryRecall.sourceMemoryRecallPreviewId, preview.id);
    assert.equal(created.memoryRecall.sourceMemoryRecallPreviewDigest, preview.previewDigest);
    assert.equal(created.memoryRecall.retrievalMode, 'exact-id-operator-selected');
    assert.equal(created.memoryRecall.recommendationStatus, 'blocked');
    assert.equal(created.memoryRecall.applicationStatus, 'blocked');
    assert.equal(created.memoryRecall.missionInjectionStatus, 'blocked');
    assert.equal(
      created.memoryRecall.nonApplicationStatement,
      'recall-preview-not-runtime-application',
    );
    assert.ok(created.memoryRecall.blockedActions.includes('history'));
    assert.ok(created.memoryRecall.blockedActions.includes('search'));
    assert.ok(created.memoryRecall.blockedActions.includes('mission-injection'));
    assert.equal(
      computeMemoryRecallRecordDigest(created.memoryRecall),
      created.memoryRecall.recordDigest,
    );

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 16);
    assert.equal(persisted.sequences.memoryRecall, 1);
    assert.equal(Object.keys(persisted.memoryRecalls).length, 1);
    assert.deepEqual(withoutMemoryRecallState(persisted), schemaV14);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = runtime.persistMemoryItemRecall(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.memoryRecall, created.memoryRecall);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        runtime.persistMemoryItemRecall({
          ...request,
          recordApproval: {
            ...request.recordApproval,
            rationale: '같은 MemoryItem에 다른 audit rationale을 제출합니다.',
          },
        }),
      /already has a different MemoryRecall/,
    );

    const inspected = runtime.getMemoryItemRecall(seed.memoryItem.id);
    assert.equal(inspected.persisted, true);
    assert.deepEqual(inspected.memoryRecall, created.memoryRecall);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const migrationOnlyRoot = path.join(tempRoot, 'migration-only');
    writeState(migrationOnlyRoot, schemaV14);
    const migratedOnly = createFileStore({ runtimeRoot: migrationOnlyRoot }).loadState();
    assert.equal(migratedOnly.schemaVersion, 16);
    assert.equal(migratedOnly.sequences.memoryRecall, 0);
    assert.deepEqual(migratedOnly.memoryRecalls, {});

    const corruptRoot = path.join(tempRoot, 'corrupt-memory-recall');
    const corruptState = structuredClone(persisted);
    corruptState.memoryRecalls[created.memoryRecall.id].applicationStatus = 'active';
    writeState(corruptRoot, corruptState);
    assertNoWrite(
      corruptRoot,
      () => createFileStore({ runtimeRoot: corruptRoot }).loadStateReadonly(),
      /invalid immutable status or blocked authority/,
    );

    const partialRoot = path.join(tempRoot, 'partial-schema');
    const partialState = structuredClone(persisted);
    delete partialState.memoryRecalls;
    writeState(partialRoot, partialState);
    assertNoWrite(
      partialRoot,
      () => createFileStore({ runtimeRoot: partialRoot }).loadStateReadonly(),
      /missing MemoryRecall fields/,
    );

    const futureRoot = path.join(tempRoot, 'future-schema');
    writeState(futureRoot, { ...persisted, schemaVersion: 17 });
    assertNoWrite(
      futureRoot,
      () => createFileStore({ runtimeRoot: futureRoot }).loadStateSupportedReadonly(),
      /Unsupported runtime state schemaVersion/,
    );

    const rollbackRoot = path.join(tempRoot, 'rollback-retention');
    writeState(rollbackRoot, persisted);
    assert.deepEqual(
      createFileStore({ runtimeRoot: rollbackRoot }).loadStateReadonly().memoryRecalls,
      persisted.memoryRecalls,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          migration: {
            fromSchemaVersion: 14,
            toSchemaVersion: persisted.schemaVersion,
            atomicSaveCount: saveCount,
            migrationOnlyCreatedNoRecall: true,
          },
          memoryRecall: {
            id: created.memoryRecall.id,
            recordDigest: created.memoryRecall.recordDigest,
            sourceMemoryItemId: created.memoryRecall.sourceMemoryItemId,
            sourceMemoryRecallPreviewId: created.memoryRecall.sourceMemoryRecallPreviewId,
            status: created.memoryRecall.status,
            exactReplayIdempotent: true,
          },
          safety: {
            staleMalformedCredentialCrossWorkspaceApprovalNoWrite: true,
            sourceRecordsAndBytesUnchanged: true,
            listHistorySearchRecommendationInjectionApplicationBlocked: true,
            futurePartialAndCorruptStateRejected: true,
            rollbackRetentionProved: true,
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
