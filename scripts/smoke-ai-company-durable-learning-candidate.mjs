import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_DURABLE_LEARNING_CANDIDATE_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-durable-learning-candidate-smoke');
const keepFixture = process.env.ORCHESTRATION_DURABLE_LEARNING_CANDIDATE_KEEP_FIXTURE === '1';
const MODE = 'ai-company-durable-learning-candidate-smoke';

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
        throw new Error('Durable LearningCandidate must not call a provider');
      },
      executeSynthesis() {
        throw new Error('Durable LearningCandidate must not call a provider');
      },
    },
  });
}

function seedCompletedMission() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-learning-candidate-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_LEARNING_CANDIDATE_KEEP_FIXTURE: '1',
        ORCHESTRATION_LEARNING_CANDIDATE_SEED_ONLY: '1',
        ORCHESTRATION_LEARNING_CANDIDATE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(
      seeded.stderr || seeded.stdout || 'Failed to seed LearningCandidate preview fixture',
    );
  }
  return JSON.parse(seeded.stdout);
}

function toSchemaV11(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 11;
  delete previous.sequences.learningCandidate;
  delete previous.learningCandidates;
  return previous;
}

function buildPersistenceRequest(previewRequest, preview) {
  const {
    previewId: sourceDeliveryPreviewId,
    ...sourceTuple
  } = previewRequest;
  return {
    ...sourceTuple,
    sourceDeliveryPreviewId,
    previewId: preview.previewId,
    candidateDigest: preview.candidateDigest,
    decision: 'persist',
  };
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

function withoutLearningState(state) {
  const copy = structuredClone(state);
  delete copy.learningCandidates;
  delete copy.sequences.learningCandidate;
  copy.schemaVersion = 11;
  return copy;
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seed = seedCompletedMission();
    const runtime = createRuntime(seed.runtimeRoot);
    const preview = runtime.previewMissionLearningCandidate(seed.previewRequest);
    const persistenceRequest = buildPersistenceRequest(seed.previewRequest, preview);
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(seed.projectPath, 'src/runtime/runtime-service.js');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    const schemaV12Baseline = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const schemaV11Baseline = toSchemaV11(schemaV12Baseline);
    writeState(seed.runtimeRoot, schemaV11Baseline);
    const schemaV11Bytes = fs.readFileSync(statePath, 'utf8');
    const migrationRuntime = createRuntime(seed.runtimeRoot);

    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.persistMissionLearningCandidate({
          ...persistenceRequest,
          closeOutDigest: '0'.repeat(64),
        }),
      /closeOutDigest/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.persistMissionLearningCandidate({
          ...persistenceRequest,
          decision: 'accept',
        }),
      /decision must be persist/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.persistMissionLearningCandidate({
          ...persistenceRequest,
          rawTranscript: 'forbidden',
        }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.persistMissionLearningCandidate({
          ...persistenceRequest,
          retrospectiveSpec: {
            ...persistenceRequest.retrospectiveSpec,
            lesson: 'authorization=Bearer-secret-token',
          },
        }),
      /credential marker/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV11Bytes);

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = migrationRuntime.persistMissionLearningCandidate(persistenceRequest);
    } finally {
      fs.renameSync = originalRenameSync;
    }
    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.learningCandidate.persisted, true);
    assert.equal(created.learningCandidate.previewId, preview.previewId);
    assert.equal(created.learningCandidate.candidateDigest, preview.candidateDigest);
    assert.equal(created.learningCandidate.redactionStatus, 'review-required');
    assert.equal(created.learningCandidate.reviewerStatus, 'review-required');
    assert.equal(created.learningCandidate.promotionStatus, 'proposed');
    assert.equal(
      Object.values(created.learningCandidate.authoritySummary).every(
        (value) => value === false,
      ),
      true,
    );
    assert.match(created.learningCandidate.recordDigest, /^[a-f0-9]{64}$/);

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 13);
    assert.equal(persisted.sequences.learningCandidate, 1);
    assert.deepEqual(
      withoutLearningState(persisted),
      withoutLearningState(schemaV12Baseline),
    );
    assert.equal(Object.keys(persisted.learningCandidates).length, 1);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = migrationRuntime.persistMissionLearningCandidate(persistenceRequest);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.learningCandidate, created.learningCandidate);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const changedPreviewRequest = {
      ...seed.previewRequest,
      retrospectiveSpec: {
        ...seed.previewRequest.retrospectiveSpec,
        lesson: `${seed.previewRequest.retrospectiveSpec.lesson} Keep review explicit.`,
      },
    };
    const changedPreview = migrationRuntime.previewMissionLearningCandidate(changedPreviewRequest);
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.persistMissionLearningCandidate(
          buildPersistenceRequest(changedPreviewRequest, changedPreview),
        ),
      /already has a different LearningCandidate/,
    );

    const expiredRoot = path.join(tempRoot, 'expired');
    writeState(expiredRoot, schemaV11Baseline);
    const expiredRuntime = createRuntime(expiredRoot);
    assertNoWrite(
      expiredRoot,
      () =>
        expiredRuntime.persistMissionLearningCandidate({
          ...persistenceRequest,
          retrospectiveSpec: {
            ...persistenceRequest.retrospectiveSpec,
            expiresAt: schemaV11Baseline.missionCloseOuts[
              persistenceRequest.missionCloseOutId
            ].createdAt,
          },
        }),
      /expiresAt must be after MissionCloseOut creation/,
    );

    const migrationOnlyRoot = path.join(tempRoot, 'migration-only');
    writeState(migrationOnlyRoot, schemaV11Baseline);
    const migratedOnly = createFileStore({ runtimeRoot: migrationOnlyRoot }).loadState();
    assert.equal(migratedOnly.schemaVersion, 13);
    assert.equal(migratedOnly.sequences.learningCandidate, 0);
    assert.deepEqual(migratedOnly.learningCandidates, {});
    const migrationOnlyBytes = fs.readFileSync(
      path.join(migrationOnlyRoot, 'state.json'),
      'utf8',
    );
    const absent = createRuntime(migrationOnlyRoot).getMissionLearningCandidate(
      persistenceRequest.missionId,
    );
    assert.equal(absent.persisted, false);
    assert.equal(absent.learningCandidate, null);
    assert.equal(
      fs.readFileSync(path.join(migrationOnlyRoot, 'state.json'), 'utf8'),
      migrationOnlyBytes,
    );

    const reloaded = createRuntime(seed.runtimeRoot);
    const readBack = reloaded.getMissionLearningCandidate(persistenceRequest.missionId);
    assert.equal(readBack.persisted, true);
    assert.deepEqual(readBack.learningCandidate, created.learningCandidate);

    const partialRoot = path.join(tempRoot, 'partial-v12');
    const partial = structuredClone(persisted);
    delete partial.learningCandidates;
    writeState(partialRoot, partial);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadState(),
      /missing LearningCandidate fields/,
    );
    const futureRoot = path.join(tempRoot, 'future');
    writeState(futureRoot, { ...persisted, schemaVersion: 14 });
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadState(),
      /Unsupported runtime state/,
    );
    const corruptRoot = path.join(tempRoot, 'corrupt');
    const corrupt = structuredClone(persisted);
    corrupt.learningCandidates[created.learningCandidate.id].promotionStatus = 'promoted';
    writeState(corruptRoot, corrupt);
    assert.throws(
      () => createFileStore({ runtimeRoot: corruptRoot }).loadStateReadonly(),
      /invalid immutable status/,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          migration: {
            from: 11,
            to: 12,
            candidateBootstrap: false,
            validPromotionSaveCount: saveCount,
            priorDomainValuesPreserved: true,
          },
          learningCandidate: {
            id: created.learningCandidate.id,
            previewId: created.learningCandidate.previewId,
            candidateDigest: created.learningCandidate.candidateDigest,
            recordDigest: created.learningCandidate.recordDigest,
            persisted: true,
            reviewerStatus: created.learningCandidate.reviewerStatus,
            promotionStatus: created.learningCandidate.promotionStatus,
            exactReplayIdempotent: true,
            divergentReplayRejected: true,
            reloadVerified: true,
          },
          safety: {
            staleMalformedExpiredCredentialInputNoWrite: true,
            partialFutureAndCorruptStateRejected: true,
            passiveReadCreatesNoCandidate: true,
            sourceBytesUnchanged: true,
            downstreamAuthorityClosed: true,
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
