import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';
import previewModule from '../src/runtime/rework-delivery-package-preview.js';
import durablePackageModule from '../src/runtime/rework-delivery-packages.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  buildApprovalRequest,
  prepareWaitingGate,
} from './smoke-ai-company-builder-rework-mutation-approval.mjs';
import {
  projectPath,
  runtimeRoot,
  statePath,
  targetPath,
  tempRoot,
} from './smoke-ai-company-reviewer-rework-preview.mjs';

const { createExecutionCoordinator } = coordinatorModule;
const { createLocalStubProviderAdapter } = localStubModule;
const { createFileStore } = fileStoreModule;
const {
  QUERY_KEYS,
  RESPONSE_KEYS,
  computeReworkDeliveryPackagePreviewDigest,
  normalizeReworkDeliveryPackagePreviewRequest,
} = previewModule;
const {
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  REWORK_DELIVERY_PACKAGE_RECORD_KEYS,
  computeReworkDeliveryPackageRecordDigest,
} = durablePackageModule;
const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const MODE = 'ai-company-durable-rework-delivery-package-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeState(state) {
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function createReviewerOutput(request) {
  return `# Reviewer Re-execution: ${request.task.title}

## Review Verdict
- verdict: pass
- source builder run: ${request.builderRun.id}
- preflight artifact: ${request.preflightArtifactId}
- change-summary artifact: ${request.changeSummaryArtifact.id}
- patch artifact: ${request.patchArtifact.id}
- diff artifact: ${request.diffArtifact.id}

## Evidence Reviewed
- exact DEC-203 mutation bundle

## Findings
- No blocking findings remain.

## Contract Compliance
- QA execution remains separately gated.

## Verification Evidence
- declared command: ${request.verificationCommands[0]}

## Accepted Risks
- none

## Next Action
- Stop at the separate QA execution decision.

## Follow-Up Gate
- blocking issue: no
- decision required: no
`;
}

function createProviderAdapter() {
  const base = createLocalStubProviderAdapter();
  return {
    name: 'local-stub',
    async execute(request, context) {
      if (
        request.role !== 'reviewer' ||
        request.executionMode !== 'rework-reviewer'
      ) {
        return base.execute(request, context);
      }
      return {
        providerRunId: 'rework-delivery-preview-reviewer',
        model: 'local-stub-rework-delivery-preview',
        normalizedResult: {
          needsDecision: false,
          nextStage: 'qa-ready',
        },
        outputText: createReviewerOutput(request),
      };
    },
  };
}

function buildMutationRequest(approved) {
  const reviewedAt = new Date(
    Math.max(Date.now(), Date.parse(approved.approval.resolvedAt)),
  ).toISOString();
  return {
    ...approved.readiness.requestSource,
    mutationApprovalId: approved.approval.id,
    mutationApprovalBindingDigest: approved.approval.metadata.bindingDigest,
    evaluatedAt: reviewedAt,
    mutationRequest: {
      decision: 'run-builder-rework-live-mutation',
      acknowledgement:
        'mutate-only-approved-rework-targets-and-stop-before-reviewer',
      rationale: 'Apply the exact approved rework target once.',
      reviewedAt,
    },
  };
}

function buildReviewerRequest(ready) {
  const reviewedAt = new Date().toISOString();
  return {
    ...ready.requestSource,
    evaluatedAt: reviewedAt,
    reviewerRequest: {
      decision: 'run-reviewer-reexecution',
      acknowledgement: 'review-exact-rework-result-once-and-stop-before-qa',
      rationale: 'Review the exact retained local mutation evidence once.',
      reviewedAt,
    },
  };
}

function buildQaRequest(ready) {
  const reviewedAt = new Date().toISOString();
  return {
    ...ready.requestSource,
    evaluatedAt: reviewedAt,
    qaRequest: {
      decision: 'run-rework-qa-once',
      acknowledgement:
        'run-only-source-bound-node-checks-and-stop-before-delivery-package',
      rationale: 'Run one exact source-bound syntax check.',
      reviewedAt,
    },
  };
}

function buildPreviewRequest(reworkPlanId, envelope, evaluatedAt = null) {
  return {
    reworkPlanId,
    qaWorkOrderAttemptId: envelope.workOrderAttempt.id,
    qaWorkOrderAttemptRecordDigest: envelope.workOrderAttempt.recordDigest,
    qaRunId: envelope.qaRun.id,
    qaEvidenceArtifactId: envelope.qaArtifact.id,
    deliveryReadyCheckpointId: envelope.terminalCheckpoint.id,
    checkpointDigest: envelope.terminalCheckpoint.checkpointDigest,
    sourceDigest: envelope.sourceDigest,
    qaInputDigest: envelope.qaInputDigest,
    evaluatedAt:
      evaluatedAt ||
      new Date(
        Math.max(Date.now(), Date.parse(envelope.qaRun.finishedAt)),
      ).toISOString(),
  };
}

async function prepareTerminalContext() {
  const fixture = await prepareWaitingGate({ withReviewerDecision: true });
  const approvalReady = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const requestedApproval =
    fixture.runtime.requestBuilderReworkMutationApproval({
      reworkPlanId: fixture.reworkPlan.id,
      ...buildApprovalRequest(
        approvalReady,
        'Approve one exact local Builder rework source mutation.',
      ),
    });
  fixture.runtime.resolveDecisionInboxItem({
    itemId: requestedApproval.decisionInboxItem.id,
    action: 'approved',
  });
  const approved = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const coordinator = createExecutionCoordinator({
    runtimeService: fixture.runtime,
    repoRoot,
    providerAdapter: createProviderAdapter(),
  });
  await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildMutationRequest(approved),
  });
  const reviewerReady = fixture.runtime.getReviewerReexecution(
    fixture.reworkPlan.id,
  );
  await coordinator.runReviewerReexecution({
    reworkPlanId: fixture.reworkPlan.id,
    request: buildReviewerRequest(reviewerReady),
  });
  const qaReady = fixture.runtime.getReworkQaExecution(fixture.reworkPlan.id);
  await coordinator.runReworkQaExecution({
    reworkPlanId: fixture.reworkPlan.id,
    request: buildQaRequest(qaReady),
  });
  const completed = fixture.runtime.getReworkQaExecution(
    fixture.reworkPlan.id,
  );
  return { ...fixture, completed, coordinator };
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function assertNoRawEvidence(preview) {
  const serialized = JSON.stringify(preview);
  assert.doesNotMatch(serialized, /export const fixed/);
  assert.doesNotMatch(serialized, /Reviewer Re-execution:/);
  assert.doesNotMatch(serialized, /"executionMode":"rework-qa-node-check"/);
}

async function reserveLocalPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
  });
}

async function withLocalApiServer(run) {
  const port = await reserveLocalPort();
  const child = spawn(
    process.execPath,
    [
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--runtime-root',
      runtimeRoot,
    ],
    { cwd: repoRoot, stdio: ['ignore', 'ignore', 'pipe'] },
  );
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (child.exitCode !== null) break;
      try {
        if ((await fetch(`${baseUrl}/api/snapshot`)).ok) {
          await run(baseUrl);
          return;
        }
      } catch {
        // Retry until the bounded local server is ready.
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error(`local API server did not start: ${stderr}`);
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
}

function toQuery(request) {
  return new URLSearchParams(
    Object.fromEntries(
      QUERY_KEYS.map((key) => [key, request[key]]),
    ),
  );
}

async function runRuntimeSmoke() {
  const context = await prepareTerminalContext();
  const fixtureTargetPath = path.join(projectPath, targetPath);
  const request = buildPreviewRequest(
    context.reworkPlan.id,
    context.completed,
  );
  const stateBefore = fs.readFileSync(statePath);
  const artifactBefore = fs.readFileSync(context.completed.qaArtifact.path);
  const preview =
    context.runtime.previewReworkDeliveryPackage(request);
  assert.deepEqual(Object.keys(preview), RESPONSE_KEYS);
  assert.equal(preview.schemaVersion, 24);
  assert.equal(preview.persisted, false);
  assert.equal(preview.status, 'rework-delivery-preview-ready');
  assert.equal(preview.reworkPlanId, context.reworkPlan.id);
  assert.equal(preview.qaWorkOrderAttemptId, request.qaWorkOrderAttemptId);
  assert.equal(preview.terminalCheckpointId, request.deliveryReadyCheckpointId);
  assert.equal(preview.generatedAt, context.completed.qaArtifact.createdAt);
  assert.equal(preview.verificationSummary.verdict, 'passed');
  assert.equal(preview.verificationSummary.mutationDetected, false);
  assert.equal(preview.verificationSummary.checkCount, 1);
  assert.equal(preview.verificationSummary.passedCheckCount, 1);
  assert.deepEqual(preview.workOrderResults.map((entry) => entry.role), [
    'builder',
    'reviewer',
    'qa',
  ]);
  assert.equal(preview.workOrderResults.every((entry) => entry.status === 'completed'), true);
  assert.equal(preview.allowedActions.length, 0);
  assert.equal(Object.values(preview.authoritySummary).every((value) => value === false), true);
  assert.equal(
    computeReworkDeliveryPackagePreviewDigest(preview),
    preview.previewDigest,
  );
  assert.equal(
    preview.id,
    `rework-delivery-package-preview-${preview.previewDigest.slice(0, 16)}`,
  );
  assertDeepFrozen(preview);
  assertNoRawEvidence(preview);
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  assert.deepEqual(
    fs.readFileSync(context.completed.qaArtifact.path),
    artifactBefore,
  );

  const laterRequest = {
    ...request,
    evaluatedAt: new Date(Date.parse(request.evaluatedAt) + 1).toISOString(),
  };
  const laterPreview =
    context.runtime.previewReworkDeliveryPackage(laterRequest);
  assert.equal(laterPreview.id, preview.id);
  assert.equal(laterPreview.previewDigest, preview.previewDigest);
  assert.equal(laterPreview.evaluatedAt, laterRequest.evaluatedAt);

  assert.deepEqual(
    normalizeReworkDeliveryPackagePreviewRequest(request, {
      now: request.evaluatedAt,
      qaCompletedAt: context.completed.qaRun.finishedAt,
    }),
    request,
  );
  assert.throws(
    () =>
      normalizeReworkDeliveryPackagePreviewRequest(
        { ...request, extra: 'blocked' },
        {
          now: request.evaluatedAt,
          qaCompletedAt: context.completed.qaRun.finishedAt,
        },
      ),
    /unexpected or missing/,
  );
  assert.throws(
    () =>
      context.runtime.previewReworkDeliveryPackage({
        ...request,
        qaInputDigest: '0'.repeat(64),
      }),
    /qaInputDigest/,
  );
  assert.throws(
    () =>
      context.runtime.previewReworkDeliveryPackage({
        ...request,
        evaluatedAt: new Date(
          Date.parse(context.completed.qaRun.finishedAt) - 1,
        ).toISOString(),
      }),
    /source-current window/,
  );
  assert.throws(
    () =>
      context.runtime.previewReworkDeliveryPackage({
        ...request,
        evaluatedAt: new Date(Date.now() + 6 * 60 * 1000).toISOString(),
      }),
    /source-current window/,
  );

  for (const invoke of [
    () =>
      context.runtime.previewExecutionPlanDelivery({
        executionPlanId: preview.executionPlanId,
      }),
    () =>
      context.runtime.persistExecutionPlanDeliveryPackage({
        executionPlanId: preview.executionPlanId,
        previewId: preview.id,
        sourceDigest: preview.sourceDigest,
        packageDigest: preview.previewDigest,
        checkpointId: preview.terminalCheckpointId,
        checkpointDigest: preview.terminalCheckpointDigest,
      }),
    () => context.runtime.acceptDeliveryPackage({}),
    () => context.runtime.closeOutMissionAndTask({}),
  ]) {
    assert.throws(invoke);
    assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  }

  const originalTargetBytes = fs.readFileSync(fixtureTargetPath);
  try {
    fs.writeFileSync(
      fixtureTargetPath,
      'export const previewDrift = true;\n',
    );
    assert.throws(
      () => context.runtime.previewReworkDeliveryPackage(request),
      /source|target|mutation/i,
    );
  } finally {
    fs.writeFileSync(fixtureTargetPath, originalTargetBytes);
  }

  const backupPath = `${fixtureTargetPath}.preview-backup`;
  try {
    fs.renameSync(fixtureTargetPath, backupPath);
    fs.symlinkSync(backupPath, fixtureTargetPath);
    assert.throws(
      () => context.runtime.previewReworkDeliveryPackage(request),
      /symlink|regular|contained|target/i,
    );
  } finally {
    fs.rmSync(fixtureTargetPath, { force: true });
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, fixtureTargetPath);
    }
  }

  try {
    fs.writeFileSync(
      context.completed.qaArtifact.path,
      Buffer.alloc(1024 * 1024 + 1, 0x61),
    );
    assert.throws(
      () => context.runtime.previewReworkDeliveryPackage(request),
      /Artifact|bounded|byte|QA/i,
    );
  } finally {
    fs.writeFileSync(context.completed.qaArtifact.path, artifactBefore);
  }

  const state = readState();
  const project = state.projects[context.bundle.executionPlan.projectId];
  const providerTampered = structuredClone(state);
  providerTampered.projects[project.id].provider = {
    adapter: 'openai-responses',
    mode: 'live',
    model: 'blocked-provider',
    env: { apiKeyVar: 'OPENAI_API_KEY' },
  };
  try {
    writeState(providerTampered);
    assert.throws(
      () => context.runtime.previewReworkDeliveryPackage(request),
      /provider|source|local/i,
    );
  } finally {
    writeState(state);
  }

  const downstreamTampered = structuredClone(state);
  downstreamTampered.executionPlans[preview.executionPlanId]
    .deliveryPackageRefs = ['delivery-package-9999'];
  downstreamTampered.executionPlans[preview.executionPlanId]
    .latestDeliveryPackageId = 'delivery-package-9999';
  try {
    writeState(downstreamTampered);
    assert.throws(
      () => context.runtime.previewReworkDeliveryPackage(request),
      /DeliveryPackage|not found|state/i,
    );
  } finally {
    writeState(state);
  }

  for (const mutateTask of [
    (task) => {
      task.lifecycleState = 'Done';
    },
    (task) => {
      task.projectId = 'project-stale';
    },
    (task) => {
      task.missionId = 'mission-stale';
    },
  ]) {
    const taskTampered = structuredClone(state);
    mutateTask(
      taskTampered.tasks[
        taskTampered.executionPlans[preview.executionPlanId].controlTaskId
      ],
    );
    try {
      writeState(taskTampered);
      assert.throws(
        () => context.runtime.previewReworkDeliveryPackage(request),
        /task|source|state|terminal/i,
      );
    } finally {
      writeState(state);
    }
  }

  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
  return { context, preview, request };
}

async function runApiSmoke(context, request, preview) {
  const stateBefore = fs.readFileSync(statePath);
  await withLocalApiServer(async (baseUrl) => {
    const endpoint =
      `${baseUrl}/api/rework-plans/${encodeURIComponent(context.reworkPlan.id)}` +
      `/delivery-package-preview`;
    const exact = await fetch(`${endpoint}?${toQuery(request)}`);
    assert.equal(exact.status, 200);
    const payload = await exact.json();
    assert.equal(payload.id, preview.id);
    assert.equal(payload.previewDigest, preview.previewDigest);
    assert.equal(payload.persisted, false);

    const missingQuery = new URLSearchParams(toQuery(request));
    missingQuery.delete('qaRunId');
    assert.equal(
      (await fetch(`${endpoint}?${missingQuery}`)).status,
      400,
    );

    const extraQuery = new URLSearchParams(toQuery(request));
    extraQuery.set('extra', 'blocked');
    assert.equal((await fetch(`${endpoint}?${extraQuery}`)).status, 400);

    const repeatedQuery = new URLSearchParams(toQuery(request));
    repeatedQuery.append('qaRunId', request.qaRunId);
    assert.equal(
      (await fetch(`${endpoint}?${repeatedQuery}`)).status,
      400,
    );

    const blankQuery = new URLSearchParams(toQuery(request));
    blankQuery.set('qaRunId', '');
    assert.equal((await fetch(`${endpoint}?${blankQuery}`)).status, 400);

    const malformedQuery = new URLSearchParams(toQuery(request));
    malformedQuery.set('checkpointDigest', 'invalid');
    assert.equal((await fetch(`${endpoint}?${malformedQuery}`)).status, 400);

    const noncanonicalQuery = new URLSearchParams(toQuery(request));
    noncanonicalQuery.set(
      'evaluatedAt',
      request.evaluatedAt.replace(/\.\d{3}Z$/, 'Z'),
    );
    assert.equal((await fetch(`${endpoint}?${noncanonicalQuery}`)).status, 400);

    const oversizedQuery = new URLSearchParams(toQuery(request));
    oversizedQuery.set('qaRunId', 'a'.repeat(4097));
    assert.equal((await fetch(`${endpoint}?${oversizedQuery}`)).status, 400);

    const staleQuery = new URLSearchParams(toQuery(request));
    staleQuery.set('checkpointDigest', '0'.repeat(64));
    assert.equal((await fetch(`${endpoint}?${staleQuery}`)).status, 409);

    assert.equal(
      (
        await fetch(`${endpoint}?${toQuery(request)}`, {
          method: 'POST',
        })
      ).status,
      405,
    );
  });
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
}

function buildPersistRequest(request, preview, reviewedAt = null) {
  return {
    ...request,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    reworkDeliveryEvidenceDigest: preview.reworkDeliveryEvidenceDigest,
    recordApproval: {
      decision: RECORD_APPROVAL_DECISION,
      acknowledgement: RECORD_APPROVAL_ACKNOWLEDGEMENT,
      rationale: 'Retain this exact rework delivery evidence for operator review.',
      reviewedAt:
        reviewedAt ||
        new Date(
          Math.max(Date.now(), Date.parse(preview.evaluatedAt)),
        ).toISOString(),
    },
  };
}

async function runDurableRuntimeSmoke(context, request, preview) {
  const schemaV25State = readState();
  const schemaV24State = structuredClone(schemaV25State);
  schemaV24State.schemaVersion = 24;
  delete schemaV24State.sequences.reworkDeliveryPackage;
  delete schemaV24State.sequences.reworkDeliveryPackageAcceptance;
  delete schemaV24State.reworkDeliveryPackages;
  delete schemaV24State.reworkDeliveryPackageAcceptances;
  writeState(schemaV24State);

  const persistRequest = buildPersistRequest(request, preview);
  const created = context.runtime.persistReworkDeliveryPackage(persistRequest);
  assert.equal(created.idempotent, false);
  const record = created.reworkDeliveryPackage;
  assert.equal(record.persisted, true);
  assert.equal(record.status, 'review-required');
  assert.equal(record.reworkPlanId, context.reworkPlan.id);
  assert.equal(record.previewId, preview.id);
  assert.equal(record.previewDigest, preview.previewDigest);
  assert.equal(
    record.reworkDeliveryEvidenceDigest,
    preview.reworkDeliveryEvidenceDigest,
  );
  assert.equal(record.createdAt, record.recordApproval.reviewedAt);
  assert.equal(record.allowedActions.length, 0);
  assert.equal(
    record.recordDigest,
    computeReworkDeliveryPackageRecordDigest(record),
  );
  assert.deepEqual(
    Object.keys(record).sort(),
    [...REWORK_DELIVERY_PACKAGE_RECORD_KEYS].sort(),
  );

  const persistedState = readState();
  assert.equal(persistedState.schemaVersion, 29);
  assert.equal(persistedState.sequences.reworkDeliveryPackage, 1);
  assert.deepEqual(
    Object.keys(persistedState.reworkDeliveryPackages),
    [record.id],
  );
  for (const [key, value] of Object.entries(schemaV24State)) {
    if (key === 'schemaVersion' || key === 'sequences') continue;
    assert.deepEqual(persistedState[key], value);
  }
  for (const [key, value] of Object.entries(schemaV24State.sequences)) {
    assert.equal(persistedState.sequences[key], value);
  }

  const bytesAfterCreate = fs.readFileSync(statePath);
  const replay = context.runtime.persistReworkDeliveryPackage(persistRequest);
  assert.equal(replay.idempotent, true);
  assert.equal(replay.reworkDeliveryPackage.recordDigest, record.recordDigest);
  assert.deepEqual(fs.readFileSync(statePath), bytesAfterCreate);

  assert.equal(
    context.runtime.getReworkDeliveryPackage(record.id)
      .reworkDeliveryPackage.recordDigest,
    record.recordDigest,
  );
  assert.equal(
    context.runtime.getReworkPlanDeliveryPackage(context.reworkPlan.id)
      .reworkDeliveryPackage.id,
    record.id,
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      context.runtime.getSnapshot(),
      'reworkDeliveryPackages',
    ),
    false,
  );
  assert.deepEqual(fs.readFileSync(statePath), bytesAfterCreate);

  const divergent = structuredClone(persistRequest);
  divergent.recordApproval.rationale = 'A different retention rationale.';
  assert.throws(
    () => context.runtime.persistReworkDeliveryPackage(divergent),
    /different ReworkDeliveryPackage/i,
  );
  assert.deepEqual(fs.readFileSync(statePath), bytesAfterCreate);

  const wrongAttemptDigest = {
    ...persistRequest,
    qaWorkOrderAttemptRecordDigest: '0'.repeat(64),
  };
  assert.throws(
    () => context.runtime.persistReworkDeliveryPackage(wrongAttemptDigest),
    /different ReworkDeliveryPackage/i,
  );
  assert.deepEqual(fs.readFileSync(statePath), bytesAfterCreate);

  const targetFile = path.join(projectPath, targetPath);
  const targetBytes = fs.readFileSync(targetFile);
  fs.appendFileSync(targetFile, '\n// post-record source drift\n');
  try {
    const driftReplay =
      context.runtime.persistReworkDeliveryPackage(persistRequest);
    assert.equal(driftReplay.idempotent, true);
  } finally {
    fs.writeFileSync(targetFile, targetBytes);
  }
  assert.deepEqual(fs.readFileSync(statePath), bytesAfterCreate);

  const partialCurrentState = readState();
  delete partialCurrentState.reworkDeliveryPackages;
  delete partialCurrentState.reworkDeliveryPackageAcceptances;
  writeState(partialCurrentState);
  try {
    assert.throws(
      () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
      /missing ReworkDeliveryPackage fields/,
    );
  } finally {
    fs.writeFileSync(statePath, bytesAfterCreate);
  }

  return { persistRequest, record };
}

async function runDurableApiSmoke(context, persistRequest, record) {
  const stateBefore = fs.readFileSync(statePath);
  await withLocalApiServer(async (baseUrl) => {
    const { reworkPlanId, ...body } = persistRequest;
    const persistResponse = await fetch(
      `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlanId)}/delivery-packages`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    assert.equal(persistResponse.status, 200);
    const replay = await persistResponse.json();
    assert.equal(replay.idempotent, true);
    assert.equal(replay.reworkDeliveryPackage.id, record.id);

    const exact = await fetch(
      `${baseUrl}/api/rework-delivery-packages/${encodeURIComponent(record.id)}`,
    );
    assert.equal(exact.status, 200);
    assert.equal(
      (await exact.json()).reworkDeliveryPackage.recordDigest,
      record.recordDigest,
    );

    const bounded = await fetch(
      `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlanId)}/delivery-package`,
    );
    assert.equal(bounded.status, 200);
    assert.equal(
      (await bounded.json()).reworkDeliveryPackage.id,
      record.id,
    );

    const missingBody = structuredClone(body);
    delete missingBody.previewDigest;
    assert.equal(
      (
        await fetch(
          `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlanId)}/delivery-packages`,
          {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(missingBody),
          },
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await fetch(
          `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlanId)}/delivery-packages`,
          {
            method: 'POST',
            headers: { 'content-type': 'text/plain' },
            body: JSON.stringify(body),
          },
        )
      ).status,
      415,
    );
    assert.equal(
      (
        await fetch(
          `${baseUrl}/api/rework-plans/${encodeURIComponent(reworkPlanId)}/delivery-package`,
          { method: 'POST' },
        )
      ).status,
      405,
    );
  });
  assert.deepEqual(fs.readFileSync(statePath), stateBefore);
}

async function main() {
  const keepFixture =
    process.env.ORCHESTRATION_DURABLE_REWORK_DELIVERY_KEEP_FIXTURE === '1';
  fs.rmSync(tempRoot, {
    recursive: true,
    force: true,
    maxRetries: 10,
    retryDelay: 50,
  });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const { context, preview, request } = await runRuntimeSmoke();
    await runApiSmoke(context, request, preview);
    const { persistRequest, record } = await runDurableRuntimeSmoke(
      context,
      request,
      preview,
    );
    await runDurableApiSmoke(context, persistRequest, record);
    const state = readState();
    process.stdout.write(
      `${JSON.stringify({
        ok: true,
        mode: MODE,
        schemaVersion: state.schemaVersion,
        queryKeys: QUERY_KEYS,
        responseFieldCount: RESPONSE_KEYS.length,
        previewId: preview.id,
        recordId: record.id,
        proofs: {
          exactTerminalLineage: true,
          deterministicDigest: true,
          stateBytesUnchanged: true,
          rawEvidenceExcluded: true,
          genericDeliveryPathsRejected: true,
          malformedStaleAndFutureRefused: true,
          sourceDriftSymlinkAndOversizeRefused: true,
          providerAndDownstreamRefused: true,
          openControlTaskBound: true,
          exactGetTransport: true,
          downstreamAuthorityAbsent: true,
          atomicCurrentSchemaMigrationAndAppend: true,
          immutableRecordAndDigests: true,
          exactReplayBeforeSourceRecompute: true,
          exactAndBoundedInspection: true,
          snapshotExclusion: true,
          partialSchemaRefused: true,
        },
      }, null, 2)}\n`,
    );
  } finally {
    if (!keepFixture) {
      fs.rmSync(tempRoot, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 50,
      });
    }
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
}

export {
  buildPersistRequest,
  readState,
  runDurableRuntimeSmoke,
  runRuntimeSmoke,
  withLocalApiServer,
  writeState,
};
