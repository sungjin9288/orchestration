import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import previewModule from '../src/runtime/memory-candidate-preview.js';
import candidateModule from '../src/runtime/learning-candidates.js';
import reviewModule from '../src/runtime/learning-candidate-reviews.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const {
  BLOCKED_ACTIONS,
  NON_PERSISTENCE_STATEMENT,
  REDACTION_ACKNOWLEDGEMENT,
} = previewModule;
const { computeLearningCandidateRecordDigest } = candidateModule;
const { computeLearningCandidateReviewDigest } = reviewModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot =
  process.env.ORCHESTRATION_MEMORY_CANDIDATE_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-memory-candidate-preview-smoke');
const keepFixture = process.env.ORCHESTRATION_MEMORY_CANDIDATE_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_MEMORY_CANDIDATE_SEED_ONLY === '1';
const MODE = 'ai-company-memory-candidate-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('MemoryCandidate preview must not call a provider');
      },
      executeSynthesis() {
        throw new Error('MemoryCandidate preview must not call a provider');
      },
    },
  });
}

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(
    path.join(runtimeRoot, 'state.json'),
    `${JSON.stringify(state, null, 2)}\n`,
  );
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
      seeded.stderr || seeded.stdout || 'Failed to seed completed Mission fixture',
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

function buildReviewRequest(candidate, decision = 'accept') {
  return {
    learningCandidateId: candidate.id,
    previewId: candidate.previewId,
    candidateDigest: candidate.candidateDigest,
    candidateRecordDigest: candidate.recordDigest,
    decision,
    rationale: '현재 source evidence와 제한 사항을 사람이 검토했습니다.',
    evidenceRefs: candidate.sourceEvidenceRefs.slice(0, 3),
    reviewerAcknowledgement: 'human-reviewed',
  };
}

function seedAcceptedReview() {
  const seed = seedCompletedMission();
  const runtime = createRuntime(seed.runtimeRoot);
  const learningPreview = runtime.previewMissionLearningCandidate(seed.previewRequest);
  const candidate = runtime.persistMissionLearningCandidate(
    buildPersistenceRequest(seed.previewRequest, learningPreview),
  ).learningCandidate;
  const review = runtime.reviewLearningCandidate(
    buildReviewRequest(candidate),
  ).learningCandidateReview;
  return { ...seed, runtime, candidate, review };
}

function buildMemoryPreviewRequest(seed) {
  const { candidate, review } = seed;
  const evaluatedAt = new Date().toISOString();
  return {
    learningCandidateId: candidate.id,
    learningCandidateReviewId: review.id,
    previewId: candidate.previewId,
    candidateDigest: candidate.candidateDigest,
    candidateRecordDigest: candidate.recordDigest,
    reviewDigest: review.reviewDigest,
    evaluatedAt,
    memorySpec: {
      summary: 'Preserve exact reviewed delivery evidence before reuse.',
      workspaceScope: {
        projectId: candidate.projectId,
      },
      applicability: {
        summary: 'Apply only to the approved project paths and verification commands.',
        targetPathAllowlist: [...candidate.applicability.targetPathAllowlist],
        verificationCommands: [...candidate.applicability.verificationCommands],
      },
      evidenceRefs: [...review.evidenceRefs],
      negativeEvidenceRefs: [
        ...new Set(
          candidate.negativeEvidence.map((entry) => entry.sourceEvidenceRef),
        ),
      ],
      redactionRefs: [candidate.id, review.id],
      reviewRefs: [review.id],
      expiresAt: candidate.expiry.expiresAt,
      redactionAcknowledgement: REDACTION_ACKNOWLEDGEMENT,
      nonPersistenceStatement: NON_PERSISTENCE_STATEMENT,
    },
  };
}

function deepFrozen(value) {
  if (!value || typeof value !== 'object') return true;
  return Object.isFrozen(value) && Object.values(value).every(deepFrozen);
}

function snapshotCounts(state) {
  return Object.fromEntries(
    Object.entries(state)
      .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
      .map(([key, value]) => [key, Object.keys(value).length]),
  );
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

function writeReviewDecisionVariant(seed, decision) {
  const runtimeRoot = path.join(tempRoot, `review-${decision}`);
  const state = seed.runtime.getSnapshot();
  const review = state.learningCandidateReviews[seed.review.id];
  review.decision = decision;
  review.reviewDigest = computeLearningCandidateReviewDigest(review);
  writeState(runtimeRoot, state);
  return {
    runtimeRoot,
    request: {
      ...buildMemoryPreviewRequest(seed),
      reviewDigest: review.reviewDigest,
      learningCandidateReviewId: review.id,
    },
  };
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seed = seedAcceptedReview();
    const request = buildMemoryPreviewRequest(seed);
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(seed.projectPath, 'src/runtime/runtime-service.js');
    const stateBefore = seed.runtime.getSnapshot();
    const countsBefore = snapshotCounts(stateBefore);
    const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');

    assert.equal(stateBefore.schemaVersion, 18);
    assert.equal(seed.review.decision, 'accepted');
    assert.equal(
      Object.prototype.hasOwnProperty.call(stateBefore, 'memoryCandidates'),
      false,
    );

    if (seedOnly) {
      process.stdout.write(
        `${JSON.stringify(
          {
            ok: true,
            mode: MODE,
            seedOnly: true,
            runtimeRoot: seed.runtimeRoot,
            projectPath: seed.projectPath,
            missionId: seed.candidate.sourceMissionId,
            learningCandidate: seed.candidate,
            learningCandidateReview: seed.review,
            memoryPreviewRequest: request,
          },
          null,
          2,
        )}\n`,
      );
      return;
    }

    const missingStateRoot = path.join(tempRoot, 'missing-state');
    assert.throws(
      () => createRuntime(missingStateRoot).previewLearningCandidateMemory(request),
      /state file does not exist/,
    );
    assert.equal(fs.existsSync(missingStateRoot), false);

    const legacyRoot = path.join(tempRoot, 'legacy-state');
    writeState(legacyRoot, { schemaVersion: 12 });
    assertNoWrite(
      legacyRoot,
      () => createRuntime(legacyRoot).previewLearningCandidateMemory(request),
      /current state|schema v14|missing/,
    );

    let saveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) saveCount += 1;
      return originalRenameSync(source, target);
    };
    let preview;
    try {
      preview = seed.runtime.previewLearningCandidateMemory(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(saveCount, 0);
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'review-ready');
    assert.equal(preview.projectId, seed.candidate.projectId);
    assert.equal(preview.sourceLearningCandidateId, seed.candidate.id);
    assert.equal(preview.sourceLearningCandidateReviewId, seed.review.id);
    assert.equal(preview.previewId, seed.candidate.previewId);
    assert.equal(preview.candidateDigest, seed.candidate.candidateDigest);
    assert.equal(preview.candidateRecordDigest, seed.candidate.recordDigest);
    assert.equal(preview.reviewDigest, seed.review.reviewDigest);
    assert.equal(preview.redactionStatus, 'review-required');
    assert.equal(preview.storageStatus, 'not-approved');
    assert.equal(preview.promotionStatus, 'blocked');
    assert.equal(preview.nonPersistenceStatement, NON_PERSISTENCE_STATEMENT);
    assert.deepEqual(preview.blockedActions, BLOCKED_ACTIONS);
    assert.match(preview.id, /^memory-candidate-preview-[a-f0-9]{16}$/);
    assert.match(preview.previewDigest, /^[a-f0-9]{64}$/);
    assert.equal(deepFrozen(preview), true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);
    assert.deepEqual(snapshotCounts(seed.runtime.getSnapshot()), countsBefore);
    assert.equal(
      Object.prototype.hasOwnProperty.call(seed.runtime.getSnapshot(), 'memoryCandidates'),
      false,
    );

    const replay = seed.runtime.previewLearningCandidateMemory(request);
    assert.deepEqual(replay, preview);
    const changed = seed.runtime.previewLearningCandidateMemory({
      ...request,
      memorySpec: {
        ...request.memorySpec,
        summary: `${request.memorySpec.summary} Keep review explicit.`,
      },
    });
    assert.notEqual(changed.id, preview.id);
    assert.notEqual(changed.previewDigest, preview.previewDigest);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    for (const [label, mutate, pattern] of [
      [
        'stale-candidate-digest',
        (value) => ({ ...value, candidateDigest: '0'.repeat(64) }),
        /candidateDigest/,
      ],
      [
        'stale-review-digest',
        (value) => ({ ...value, reviewDigest: '0'.repeat(64) }),
        /reviewDigest/,
      ],
      [
        'cross-workspace',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            workspaceScope: { projectId: 'project-other' },
          },
        }),
        /workspaceScope/,
      ],
      [
        'unsupported-path',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            applicability: {
              ...value.memorySpec.applicability,
              targetPathAllowlist: ['src/not-approved.js'],
            },
          },
        }),
        /unsupported source value/,
      ],
      [
        'unsupported-command',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            applicability: {
              ...value.memorySpec.applicability,
              verificationCommands: ['node forbidden-command.mjs'],
            },
          },
        }),
        /unsupported source value/,
      ],
      [
        'unsupported-evidence',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            evidenceRefs: ['unsupported-evidence'],
          },
        }),
        /unsupported source value/,
      ],
      [
        'unsupported-negative-evidence',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            negativeEvidenceRefs: ['unsupported-negative-evidence'],
          },
        }),
        /unsupported source value/,
      ],
      [
        'unsupported-redaction',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            redactionRefs: ['unsupported-redaction'],
          },
        }),
        /unsupported source value/,
      ],
      [
        'unsupported-review',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            reviewRefs: ['unsupported-review'],
          },
        }),
        /unsupported source value/,
      ],
      [
        'credential-marker',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            summary: 'authorization=Bearer-secret-token',
          },
        }),
        /credential marker/,
      ],
      [
        'raw-content-field',
        (value) => ({ ...value, rawArtifactBody: 'forbidden' }),
        /unexpected or missing fields/,
      ],
      [
        'expiry-widening',
        (value) => ({
          ...value,
          memorySpec: {
            ...value.memorySpec,
            expiresAt: new Date(
              Date.parse(seed.candidate.expiry.expiresAt) + 1000,
            ).toISOString(),
          },
        }),
        /must not exceed/,
      ],
    ]) {
      assertNoWrite(
        seed.runtimeRoot,
        () => seed.runtime.previewLearningCandidateMemory(mutate(request)),
        pattern,
      );
    }

    for (const decision of ['rejected', 'changes-requested']) {
      const variant = writeReviewDecisionVariant(seed, decision);
      assertNoWrite(
        variant.runtimeRoot,
        () =>
          createRuntime(variant.runtimeRoot).previewLearningCandidateMemory(
            variant.request,
          ),
        /not accepted/,
      );
    }

    const expiredRoot = path.join(tempRoot, 'expired-candidate');
    const expiredState = seed.runtime.getSnapshot();
    const expiredCandidate = expiredState.learningCandidates[seed.candidate.id];
    const expiredReview = expiredState.learningCandidateReviews[seed.review.id];
    expiredCandidate.expiry.expiresAt = new Date(
      Date.parse(expiredReview.createdAt) + 1,
    ).toISOString();
    expiredCandidate.recordDigest =
      computeLearningCandidateRecordDigest(expiredCandidate);
    expiredReview.candidateRecordDigest = expiredCandidate.recordDigest;
    expiredReview.reviewDigest = computeLearningCandidateReviewDigest(expiredReview);
    writeState(expiredRoot, expiredState);
    assertNoWrite(
      expiredRoot,
      () =>
        createRuntime(expiredRoot).previewLearningCandidateMemory({
          ...request,
          candidateRecordDigest: expiredCandidate.recordDigest,
          reviewDigest: expiredReview.reviewDigest,
        }),
      /expired/,
    );

    assert.deepEqual(
      seed.runtime.getLearningCandidateReview(seed.candidate.id)
        .learningCandidateReview,
      seed.review,
    );
    assert.deepEqual(
      seed.runtime.previewMissionLearningCandidate(seed.previewRequest)
        .candidateDigest,
      seed.candidate.candidateDigest,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          memoryCandidatePreview: {
            id: preview.id,
            previewDigest: preview.previewDigest,
            status: preview.status,
            persisted: preview.persisted,
            sourceReviewDecision: seed.review.decision,
            exactReplayDeterministic: true,
            deepFrozen: true,
          },
          safety: {
            schemaVersion: 14,
            saveStateCount: saveCount,
            stateBytesUnchanged: true,
            sourceBytesUnchanged: true,
            rejectedAndChangesRequestedBlocked: true,
            staleExpiredMalformedCrossWorkspaceCredentialBlocked: true,
            snapshotRecordAbsent: true,
            providerAndDownstreamAuthorityClosed: true,
          },
          compatibility: {
            learningCandidatePreview: true,
            durableLearningCandidate: true,
            learningCandidateReview: true,
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
