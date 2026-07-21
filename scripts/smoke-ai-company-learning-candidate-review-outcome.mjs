import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import fileStoreModule from '../src/runtime/file-store.js';
import reviewModule from '../src/runtime/learning-candidate-reviews.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createFileStore } = fileStoreModule;
const {
  LEARNING_CANDIDATE_REVIEW_AUTHORITY,
  computeLearningCandidateReviewDigest,
} = reviewModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_LEARNING_CANDIDATE_REVIEW_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-learning-candidate-review-smoke');
const keepFixture = process.env.ORCHESTRATION_LEARNING_CANDIDATE_REVIEW_KEEP_FIXTURE === '1';
const MODE = 'ai-company-learning-candidate-review-outcome-smoke';

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
        throw new Error('LearningCandidate review must not call a provider');
      },
      executeSynthesis() {
        throw new Error('LearningCandidate review must not call a provider');
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
      seeded.stderr || seeded.stdout || 'Failed to seed LearningCandidate review fixture',
    );
  }
  return JSON.parse(seeded.stdout);
}

function buildPersistenceRequest(previewRequest, preview) {
  const { previewId: sourceDeliveryPreviewId, ...sourceTuple } = previewRequest;
  return {
    ...sourceTuple,
    sourceDeliveryPreviewId,
    previewId: preview.previewId,
    candidateDigest: preview.candidateDigest,
    decision: 'persist',
  };
}

function toSchemaV12(state) {
  const previous = structuredClone(state);
  previous.schemaVersion = 12;
  delete previous.sequences.learningCandidateReview;
  delete previous.learningCandidateReviews;
  return previous;
}

function buildReviewRequest(candidate, decision = 'accept') {
  return {
    learningCandidateId: candidate.id,
    previewId: candidate.previewId,
    candidateDigest: candidate.candidateDigest,
    candidateRecordDigest: candidate.recordDigest,
    decision,
    rationale: '현재 Mission evidence와 제한 사항을 사람이 검토했습니다.',
    evidenceRefs: candidate.sourceEvidenceRefs.slice(0, 3),
    reviewerAcknowledgement: 'human-reviewed',
  };
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
    const seed = seedCompletedMission();
    const runtime = createRuntime(seed.runtimeRoot);
    const preview = runtime.previewMissionLearningCandidate(seed.previewRequest);
    const persistedCandidate = runtime.persistMissionLearningCandidate(
      buildPersistenceRequest(seed.previewRequest, preview),
    ).learningCandidate;
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(seed.projectPath, 'src/runtime/runtime-service.js');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    const schemaV13Baseline = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    const schemaV12Baseline = toSchemaV12(schemaV13Baseline);
    writeState(seed.runtimeRoot, schemaV12Baseline);
    const schemaV12Bytes = fs.readFileSync(statePath, 'utf8');
    const migrationRuntime = createRuntime(seed.runtimeRoot);
    const request = buildReviewRequest(persistedCandidate);

    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.reviewLearningCandidate({
          ...request,
          candidateRecordDigest: '0'.repeat(64),
        }),
      /candidateRecordDigest/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.reviewLearningCandidate({
          ...request,
          rationale: 'authorization=Bearer-secret-token',
        }),
      /credential marker/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.reviewLearningCandidate({
          ...request,
          evidenceRefs: ['unsupported-evidence'],
        }),
      /unsupported source value/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.reviewLearningCandidate({
          ...request,
          rawArtifactBody: 'forbidden',
        }),
      /unexpected or missing fields/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), schemaV12Bytes);

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let created;
    try {
      created = migrationRuntime.reviewLearningCandidate(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }
    assert.equal(saveCount, 1);
    assert.equal(created.idempotent, false);
    assert.equal(created.learningCandidateReview.decision, 'accepted');
    assert.equal(created.learningCandidateReview.reviewerAcknowledgement, 'human-reviewed');
    assert.equal(
      created.learningCandidateReview.reviewDigest,
      computeLearningCandidateReviewDigest(created.learningCandidateReview),
    );
    assert.deepEqual(
      created.learningCandidateReview.authoritySummary,
      LEARNING_CANDIDATE_REVIEW_AUTHORITY,
    );
    assert.equal(created.learningCandidate.reviewerStatus, 'review-required');
    assert.equal(created.learningCandidate.promotionStatus, 'proposed');

    const persisted = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(persisted.schemaVersion, 14);
    assert.equal(persisted.sequences.learningCandidateReview, 1);
    assert.equal(Object.keys(persisted.learningCandidateReviews).length, 1);
    assert.deepEqual(
      persisted.learningCandidates[persistedCandidate.id],
      schemaV12Baseline.learningCandidates[persistedCandidate.id],
    );
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = migrationRuntime.reviewLearningCandidate(request);
    assert.equal(replay.idempotent, true);
    assert.deepEqual(replay.learningCandidateReview, created.learningCandidateReview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    assertNoWrite(
      seed.runtimeRoot,
      () =>
        migrationRuntime.reviewLearningCandidate({
          ...request,
          decision: 'reject',
        }),
      /already has a different review/,
    );

    const decisionResults = {};
    for (const [decision, storedDecision] of [
      ['reject', 'rejected'],
      ['changes-requested', 'changes-requested'],
    ]) {
      const root = path.join(tempRoot, decision);
      writeState(root, schemaV12Baseline);
      const result = createRuntime(root).reviewLearningCandidate(
        buildReviewRequest(persistedCandidate, decision),
      );
      assert.equal(result.learningCandidateReview.decision, storedDecision);
      assert.equal(
        Object.values(result.learningCandidateReview.authoritySummary)
          .slice(1)
          .every((value) => value === false),
        true,
      );
      decisionResults[decision] = storedDecision;
    }

    const expiredRoot = path.join(tempRoot, 'expired');
    const expiredState = structuredClone(schemaV12Baseline);
    expiredState.learningCandidates[persistedCandidate.id].expiry.expiresAt =
      persistedCandidate.createdAt;
    expiredState.learningCandidates[persistedCandidate.id].recordDigest =
      persistedCandidate.recordDigest;
    writeState(expiredRoot, expiredState);
    assertNoWrite(
      expiredRoot,
      () => createRuntime(expiredRoot).reviewLearningCandidate(request),
      /invalid expiry|recordDigest/,
    );

    const migrationOnlyRoot = path.join(tempRoot, 'migration-only');
    writeState(migrationOnlyRoot, schemaV12Baseline);
    const migratedOnly = createFileStore({ runtimeRoot: migrationOnlyRoot }).loadState();
    assert.equal(migratedOnly.schemaVersion, 14);
    assert.equal(migratedOnly.sequences.learningCandidateReview, 0);
    assert.deepEqual(migratedOnly.learningCandidateReviews, {});
    const migratedOnlyBytes = fs.readFileSync(
      path.join(migrationOnlyRoot, 'state.json'),
      'utf8',
    );
    const absent = createRuntime(migrationOnlyRoot).getLearningCandidateReview(
      persistedCandidate.id,
    );
    assert.equal(absent.reviewed, false);
    assert.equal(absent.learningCandidateReview, null);
    assert.equal(
      fs.readFileSync(path.join(migrationOnlyRoot, 'state.json'), 'utf8'),
      migratedOnlyBytes,
    );

    const reloaded = createRuntime(seed.runtimeRoot).getLearningCandidateReview(
      persistedCandidate.id,
    );
    assert.equal(reloaded.reviewed, true);
    assert.deepEqual(reloaded.learningCandidateReview, created.learningCandidateReview);

    const partialRoot = path.join(tempRoot, 'partial-v13');
    const partial = structuredClone(persisted);
    delete partial.learningCandidateReviews;
    writeState(partialRoot, partial);
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRoot }).loadState(),
      /missing LearningCandidateReview fields/,
    );
    const futureRoot = path.join(tempRoot, 'future');
    writeState(futureRoot, { ...persisted, schemaVersion: 15 });
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadState(),
      /Unsupported runtime state/,
    );
    const corruptRoot = path.join(tempRoot, 'corrupt');
    const corrupt = structuredClone(persisted);
    corrupt.learningCandidateReviews[
      created.learningCandidateReview.id
    ].authoritySummary.promoteMemoryAllowed = true;
    writeState(corruptRoot, corrupt);
    assert.throws(
      () => createFileStore({ runtimeRoot: corruptRoot }).loadStateReadonly(),
      /invalid authoritySummary/,
    );
    for (const [label, mutate] of [
      [
        'oversized-rationale',
        (review) => {
          review.rationale = 'x'.repeat(1025);
        },
      ],
      [
        'credential-marked-rationale',
        (review) => {
          review.rationale = 'api_key=secret-value-that-must-not-load';
        },
      ],
      [
        'oversized-evidence-refs',
        (review, candidate) => {
          review.evidenceRefs = Array.from(
            { length: 65 },
            (_, index) =>
              candidate.sourceEvidenceRefs[index % candidate.sourceEvidenceRefs.length],
          );
        },
      ],
    ]) {
      const tamperedRoot = path.join(tempRoot, label);
      const tampered = structuredClone(persisted);
      const tamperedReview =
        tampered.learningCandidateReviews[created.learningCandidateReview.id];
      const tamperedCandidate =
        tampered.learningCandidates[tamperedReview.learningCandidateId];
      mutate(tamperedReview, tamperedCandidate);
      tamperedReview.reviewDigest = computeLearningCandidateReviewDigest(tamperedReview);
      writeState(tamperedRoot, tampered);
      assert.throws(
        () => createFileStore({ runtimeRoot: tamperedRoot }).loadStateReadonly(),
        /invalid evidenceRefs|invalid normalized content/,
        `${label} must remain invalid even when its digest is recomputed`,
      );
    }

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          migration: {
            from: 12,
            to: 13,
            reviewBootstrap: false,
            validReviewSaveCount: saveCount,
            sourceCandidatePreserved: true,
          },
          learningCandidateReview: {
            id: created.learningCandidateReview.id,
            decision: created.learningCandidateReview.decision,
            reviewDigest: created.learningCandidateReview.reviewDigest,
            exactReplayIdempotent: true,
            divergentReplayRejected: true,
            otherDecisions: decisionResults,
            reloadVerified: true,
          },
          safety: {
            staleMalformedCredentialRawInputNoWrite: true,
            partialFutureCorruptAndTamperedStateRejected: true,
            passiveReadCreatesNoReview: true,
            sourceBytesUnchanged: true,
            candidateImmutable: true,
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
