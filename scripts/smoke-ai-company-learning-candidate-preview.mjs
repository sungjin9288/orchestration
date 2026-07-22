import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = process.env.ORCHESTRATION_LEARNING_CANDIDATE_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-learning-candidate-preview-smoke');
const keepFixture = process.env.ORCHESTRATION_LEARNING_CANDIDATE_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_LEARNING_CANDIDATE_SEED_ONLY === '1';
const MODE = 'ai-company-learning-candidate-preview-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function seedCompletedMission() {
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-mission-task-close-out.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MISSION_CLOSE_OUT_KEEP_FIXTURE: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_SEED_ONLY: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed Mission close-out fixture');
  }
  const seed = JSON.parse(seeded.stdout);
  const runtime = createRuntimeService({
    runtimeRoot: seed.runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilLiveAdapter: {
      executePosition() {
        throw new Error('LearningCandidate preview must not call a provider');
      },
      executeSynthesis() {
        throw new Error('LearningCandidate preview must not call a provider');
      },
    },
  });
  const closed = runtime.closeOutMissionAndTask(seed.closeOutRequest);
  return { ...seed, runtime, closed };
}

function deepFrozen(value) {
  if (!value || typeof value !== 'object') return true;
  return Object.isFrozen(value) && Object.values(value).every(deepFrozen);
}

function snapshotCounts(state) {
  return Object.fromEntries(
    [
      'missions',
      'tasks',
      'runs',
      'artifacts',
      'approvals',
      'decisionInboxItems',
      'executionPlans',
      'workOrders',
      'handoffPackets',
      'workflowCheckpoints',
      'deliveryPackages',
      'deliveryPackageAcceptances',
      'missionCloseOuts',
      'proposalRecords',
      'proposalApplicationAttempts',
      'proposalSourceMutations',
    ].map((key) => [key, Object.keys(state[key] || {}).length]),
  );
}

function buildPreviewRequest(seed) {
  const state = seed.runtime.getSnapshot();
  const closeOut = seed.closed.missionCloseOut;
  const plan = state.executionPlans[closeOut.executionPlanId];
  const workOrders = plan.workOrderIds.map((id) => state.workOrders[id]);
  const deliveryPackage = state.deliveryPackages[closeOut.deliveryPackageId];
  const acceptance =
    state.deliveryPackageAcceptances[closeOut.deliveryPackageAcceptanceId];
  const targetPathAllowlist = [
    ...new Set(workOrders.flatMap((workOrder) => workOrder.targetPathAllowlist)),
  ];
  const verificationCommands = [
    ...new Set(workOrders.flatMap((workOrder) => workOrder.verificationCommands)),
  ];
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  return {
    missionId: closeOut.missionId,
    linkedTaskId: closeOut.linkedTaskId,
    executionPlanId: closeOut.executionPlanId,
    deliveryPackageId: closeOut.deliveryPackageId,
    deliveryPackageAcceptanceId: closeOut.deliveryPackageAcceptanceId,
    missionCloseOutId: closeOut.id,
    previewId: deliveryPackage.previewId,
    sourceDigest: deliveryPackage.sourceDigest,
    packageDigest: deliveryPackage.packageDigest,
    acceptanceDigest: acceptance.acceptanceDigest,
    checkpointId: deliveryPackage.terminalCheckpointId,
    checkpointDigest: deliveryPackage.terminalCheckpointDigest,
    closeOutDigest: closeOut.closeOutDigest,
    retrospectiveSpec: {
      lesson: 'Keep terminal learning proposals bound to reviewed Mission evidence.',
      applicabilitySummary:
        'Apply this only to the approved source paths and verification commands.',
      targetPathAllowlist,
      verificationCommands,
      negativeEvidence: [
        {
          sourceEvidenceRef: deliveryPackage.id,
          statement: deliveryPackage.acceptedRisks[0],
        },
      ],
      expiresAt,
      redactionAcknowledgement: 'source-summary-only',
    },
  };
}

function assertNoWrite(runtimeRoot, operation, pattern) {
  const statePath = path.join(runtimeRoot, 'state.json');
  const before = fs.readFileSync(statePath, 'utf8');
  assert.throws(operation, pattern);
  assert.equal(fs.readFileSync(statePath, 'utf8'), before);
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const seed = seedCompletedMission();
    const request = buildPreviewRequest(seed);
    const statePath = path.join(seed.runtimeRoot, 'state.json');
    const sourcePath = path.join(seed.projectPath, 'src/runtime/runtime-service.js');
    const stateBefore = seed.runtime.getSnapshot();
    const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
    const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
    const countsBefore = snapshotCounts(stateBefore);

    const missingStateRoot = path.join(tempRoot, 'learning-candidate-missing-state');
    const missingStateRuntime = createRuntimeService({
      runtimeRoot: missingStateRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    assert.throws(
      () => missingStateRuntime.previewMissionLearningCandidate(request),
      /state file does not exist/,
    );
    assert.equal(fs.existsSync(missingStateRoot), false);

    const legacyStateRoot = path.join(tempRoot, 'learning-candidate-legacy-state');
    const legacyStatePath = path.join(legacyStateRoot, 'state.json');
    fs.mkdirSync(legacyStateRoot, { recursive: true });
    fs.writeFileSync(legacyStatePath, '{"schemaVersion":10}\n');
    const legacyStateBytes = fs.readFileSync(legacyStatePath, 'utf8');
    const legacyStateRuntime = createRuntimeService({
      runtimeRoot: legacyStateRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    assert.throws(
      () => legacyStateRuntime.previewMissionLearningCandidate(request),
      /state must use current schema v16/,
    );
    assert.equal(fs.readFileSync(legacyStatePath, 'utf8'), legacyStateBytes);

    assert.equal(stateBefore.schemaVersion, 16);
    assert.equal(stateBefore.missions[request.missionId].status, 'completed');
    assert.equal(stateBefore.tasks[request.linkedTaskId].lifecycleState, 'Done');
    assert.equal(
      stateBefore.executionPlans[request.executionPlanId].workOrderIds.every(
        (id) => stateBefore.workOrders[id].status === 'completed',
      ),
      true,
    );

    if (seedOnly) {
      process.stdout.write(`${JSON.stringify({
        ok: true,
        mode: MODE,
        seedOnly: true,
        runtimeRoot: seed.runtimeRoot,
        projectPath: seed.projectPath,
        missionId: request.missionId,
        previewRequest: request,
      }, null, 2)}\n`);
      return;
    }

    let stateSaveCount = 0;
    const originalRenameSync = fs.renameSync;
    fs.renameSync = (source, target) => {
      if (target === statePath) stateSaveCount += 1;
      return originalRenameSync(source, target);
    };
    let preview;
    try {
      preview = seed.runtime.previewMissionLearningCandidate(request);
    } finally {
      fs.renameSync = originalRenameSync;
    }

    assert.equal(stateSaveCount, 0);
    assert.equal(preview.persisted, false);
    assert.equal(preview.sourceMissionId, request.missionId);
    assert.equal(preview.sourceMissionCloseOutId, request.missionCloseOutId);
    assert.equal(preview.redactionMode, 'source-summary-only');
    assert.equal(preview.redactionStatus, 'review-required');
    assert.equal(preview.reviewerStatus, 'review-required');
    assert.equal(preview.promotionStatus, 'proposed');
    assert.match(preview.previewId, /^learning-candidate-preview-[a-f0-9]{16}$/);
    assert.match(preview.candidateDigest, /^[a-f0-9]{64}$/);
    assert.equal(Object.values(preview.authoritySummary).every((value) => value === false), true);
    assert.equal(deepFrozen(preview), true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);
    assert.deepEqual(snapshotCounts(seed.runtime.getSnapshot()), countsBefore);
    assert.deepEqual(seed.runtime.getSnapshot().learningCandidates, {});

    const replay = seed.runtime.previewMissionLearningCandidate(request);
    assert.deepEqual(replay, preview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    const changed = seed.runtime.previewMissionLearningCandidate({
      ...request,
      retrospectiveSpec: {
        ...request.retrospectiveSpec,
        lesson: `${request.retrospectiveSpec.lesson} Use explicit review.`,
      },
    });
    assert.notEqual(changed.previewId, preview.previewId);
    assert.notEqual(changed.candidateDigest, preview.candidateDigest);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const qaWorkOrder = stateBefore.executionPlans[request.executionPlanId].workOrderIds
      .map((id) => stateBefore.workOrders[id])
      .find((workOrder) => workOrder.role === 'qa');
    const qaArtifact = stateBefore.artifacts[qaWorkOrder.qaEvidenceArtifactId];
    const qaArtifactPath = path.isAbsolute(qaArtifact.path)
      ? qaArtifact.path
      : path.join(seed.runtimeRoot, 'artifacts', qaArtifact.path);
    const qaArtifactBytes = fs.readFileSync(qaArtifactPath, 'utf8');
    try {
      fs.writeFileSync(qaArtifactPath, '{"verdict":"passed","checks":');
      assertNoWrite(
        seed.runtimeRoot,
        () => seed.runtime.previewMissionLearningCandidate(request),
        /not valid JSON/,
      );
    } finally {
      fs.writeFileSync(qaArtifactPath, qaArtifactBytes);
    }
    assert.equal(fs.readFileSync(qaArtifactPath, 'utf8'), qaArtifactBytes);

    for (const field of [
      'linkedTaskId',
      'executionPlanId',
      'deliveryPackageId',
      'deliveryPackageAcceptanceId',
      'missionCloseOutId',
      'previewId',
      'sourceDigest',
      'packageDigest',
      'acceptanceDigest',
      'checkpointId',
      'checkpointDigest',
      'closeOutDigest',
    ]) {
      assertNoWrite(
        seed.runtimeRoot,
        () => seed.runtime.previewMissionLearningCandidate({
          ...request,
          [field]: `${request[field]}-stale`,
        }),
        new RegExp(field),
      );
    }

    const invalidSpecs = [
      [
        'extra field',
        { ...request.retrospectiveSpec, rawArtifactBody: 'forbidden' },
        /unexpected or missing fields/,
      ],
      [
        'unsupported path',
        { ...request.retrospectiveSpec, targetPathAllowlist: ['src/not-approved.js'] },
        /unsupported source value/,
      ],
      [
        'traversal path',
        { ...request.retrospectiveSpec, targetPathAllowlist: ['../secret'] },
        /literal project-relative|traversal/,
      ],
      [
        'unsupported command',
        { ...request.retrospectiveSpec, verificationCommands: ['node unsupported.mjs'] },
        /unsupported source value/,
      ],
      [
        'unsupported evidence',
        {
          ...request.retrospectiveSpec,
          negativeEvidence: [{ sourceEvidenceRef: 'artifact-unknown', statement: 'missing' }],
        },
        /unsupported source value/,
      ],
      [
        'credential marker',
        { ...request.retrospectiveSpec, lesson: 'api_key=secret-value-123456' },
        /credential marker/,
      ],
      [
        'private key',
        {
          ...request.retrospectiveSpec,
          applicabilitySummary: '-----BEGIN PRIVATE KEY-----',
        },
        /credential marker/,
      ],
      [
        'wrong redaction acknowledgement',
        { ...request.retrospectiveSpec, redactionAcknowledgement: 'redacted' },
        /source-summary-only/,
      ],
      [
        'expired',
        { ...request.retrospectiveSpec, expiresAt: request.retrospectiveSpec.expiresAt.replace('203', '202') },
        /expired|after MissionCloseOut/,
      ],
      [
        'invalid expiry',
        { ...request.retrospectiveSpec, expiresAt: 'tomorrow' },
        /exact ISO timestamp/,
      ],
      [
        'empty negative evidence',
        { ...request.retrospectiveSpec, negativeEvidence: [] },
        /non-empty array/,
      ],
    ];
    invalidSpecs[8][1].expiresAt = new Date(
      Date.parse(seed.closed.missionCloseOut.createdAt) - 1,
    ).toISOString();
    for (const [, retrospectiveSpec, pattern] of invalidSpecs) {
      assertNoWrite(
        seed.runtimeRoot,
        () => seed.runtime.previewMissionLearningCandidate({
          ...request,
          retrospectiveSpec,
        }),
        pattern,
      );
    }
    assertNoWrite(
      seed.runtimeRoot,
      () => seed.runtime.previewMissionLearningCandidate({
        ...request,
        rawTranscript: 'forbidden',
      }),
      /unexpected or missing fields/,
    );
    assertNoWrite(
      seed.runtimeRoot,
      () => seed.runtime.previewMissionLearningCandidate(
        Object.fromEntries(
          Object.entries(request).filter(([field]) => field !== 'closeOutDigest'),
        ),
      ),
      /unexpected or missing fields/,
    );

    assert.deepEqual(seed.runtime.getMissionCloseOut(request.missionId).missionCloseOut, seed.closed.missionCloseOut);
    assert.equal(seed.runtime.getCouncilSession(
      stateBefore.missions[request.missionId].councilSessionId,
    ).id, stateBefore.missions[request.missionId].councilSessionId);
    assert.deepEqual(snapshotCounts(seed.runtime.getSnapshot()), countsBefore);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      preview: {
        previewId: preview.previewId,
        candidateDigest: preview.candidateDigest,
        persisted: preview.persisted,
        deepFrozen: true,
        exactReplayStable: true,
        changedInputDistinct: true,
      },
      safety: {
        schemaVersion: stateBefore.schemaVersion,
        stateSaveCount,
        stateBytesUnchanged: true,
        sourceBytesUnchanged: true,
        missingAndLegacyStateWriteRefused: true,
        currentDeliveryPreviewRecomputed: true,
        corruptQaEvidenceRejected: true,
        rawBodyRejected: true,
        obviousCredentialMarkersRejected: true,
        downstreamAuthorityClosed: true,
      },
      compatibility: {
        missionCloseOut: true,
        council: true,
        growthAndProposalStateUnchanged: true,
      },
    }, null, 2)}\n`);
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
