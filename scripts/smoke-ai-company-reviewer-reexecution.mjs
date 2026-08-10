import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';
import reviewerReexecutionModule from '../src/runtime/reviewer-reexecution.js';
import workOrderAttemptsModule from '../src/runtime/work-order-attempts.js';
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
  computeReviewerReexecutionRequestDigest,
  normalizeReviewerReexecutionRequest,
} = reviewerReexecutionModule;
const {
  computeWorkOrderAttemptRecordDigest,
} = workOrderAttemptsModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const MODE = 'ai-company-reviewer-reexecution-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function createReviewerOutput(request, verdict) {
  const finding = verdict === 'pass'
    ? 'No blocking findings remain in the exact rework mutation evidence.'
    : 'The exact rework mutation still requires a separately authorized change.';
  const nextAction = verdict === 'pass'
    ? 'Stop at the separate QA execution decision.'
    : 'Stop with no additional rework authority.';
  return `# Reviewer Re-execution: ${request.task.title}

## Review Verdict
- verdict: ${verdict}
- source builder run: ${request.builderRun.id}
- preflight artifact: ${request.preflightArtifactId}
- change-summary artifact: ${request.changeSummaryArtifact.id}
- patch artifact: ${request.patchArtifact.id}
- diff artifact: ${request.diffArtifact.id}

## Evidence Reviewed
- exact DEC-203 mutation bundle

## Findings
- ${finding}

## Contract Compliance
- QA execution, source mutation, retry, Git, and release remain blocked.

## Verification Evidence
- declared command: ${request.verificationCommands[0]}

## Accepted Risks
- none

## Next Action
- ${nextAction}

## Follow-Up Gate
- blocking issue: no
- decision required: no
`;
}

function createReviewerAdapter(mode = 'changes') {
  const base = createLocalStubProviderAdapter();
  let reviewerCalls = 0;

  return {
    adapter: {
      name: 'local-stub',
      async execute(request, context) {
        if (request.role !== 'reviewer' || request.executionMode !== 'rework-reviewer') {
          return base.execute(request, context);
        }
        reviewerCalls += 1;
        if (mode === 'throw') throw new Error('synthetic reviewer worker failure');
        if (mode === 'malformed') {
          return {
            providerRunId: 'synthetic-malformed-reviewer',
            model: 'local-stub-reviewer-reexecution-smoke',
            normalizedResult: { needsDecision: false, nextStage: 'qa-ready' },
            outputText: '# malformed reviewer output\n',
          };
        }
        if (mode === 'pass-with-decision') {
          return {
            providerRunId: 'synthetic-widened-reviewer',
            model: 'local-stub-reviewer-reexecution-smoke',
            normalizedResult: { needsDecision: true, nextStage: 'qa-ready' },
            outputText: createReviewerOutput(request, 'pass'),
          };
        }
        if (mode === 'pass') {
          return {
            providerRunId: 'synthetic-pass-reviewer',
            model: 'local-stub-reviewer-reexecution-smoke',
            normalizedResult: { needsDecision: false, nextStage: 'qa-ready' },
            outputText: createReviewerOutput(request, 'pass'),
          };
        }
        return base.execute(request, context);
      },
    },
    get reviewerCalls() {
      return reviewerCalls;
    },
  };
}

function createCoordinator(runtime, adapter) {
  return createExecutionCoordinator({
    runtimeService: runtime,
    repoRoot,
    providerAdapter: adapter,
  });
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

function buildReviewerRequest(ready, rationale = 'Review the exact retained local mutation evidence once.') {
  const reviewedAt = new Date().toISOString();
  return {
    ...ready.requestSource,
    evaluatedAt: reviewedAt,
    reviewerRequest: {
      decision: 'run-reviewer-reexecution',
      acknowledgement:
        'review-exact-rework-result-once-and-stop-before-qa',
      rationale,
      reviewedAt,
    },
  };
}

function findReviewerAttempt(state, executionPlanId, attemptNumber) {
  return Object.values(state.workOrderAttempts).find(
    (attempt) =>
      attempt.executionPlanId === executionPlanId &&
      attempt.role === 'reviewer' &&
      attempt.attemptNumber === attemptNumber,
  );
}

function buildOperatorStepInput(state, executionPlanId, action) {
  const plan = state.executionPlans[executionPlanId];
  const checkpoint = state.workflowCheckpoints[plan.latestCheckpointId];
  const role = action === 'run-qa' ? 'qa' : 'reviewer';
  const workOrder = plan.workOrderIds
    .map((id) => state.workOrders[id])
    .find((entry) => entry.role === role);
  return {
    executionPlanId,
    action,
    expectedWorkOrderId: workOrder.id,
    sourceDigest: plan.sourceDigest,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    terminalGateApprovalId: null,
    evaluatedAt: new Date().toISOString(),
  };
}

async function reserveLocalPort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close((error) => {
        if (error) reject(error);
        else resolve(address.port);
      });
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
    {
      cwd: repoRoot,
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  );
  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  const baseUrl = `http://127.0.0.1:${port}`;
  try {
    let reachable = false;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      if (child.exitCode !== null) break;
      try {
        const response = await fetch(`${baseUrl}/api/snapshot`);
        if (response.ok) {
          reachable = true;
          break;
        }
      } catch (_error) {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }
    assert.equal(reachable, true, `local API server did not start: ${stderr}`);
    await run(baseUrl);
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => {
      if (child.exitCode !== null) resolve();
      else child.once('exit', resolve);
    });
  }
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== 'object') return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function pickNonExecutionExpansion(snapshot) {
  return structuredClone({
    learningCandidates: snapshot.learningCandidates || {},
    learningCandidateReviews: snapshot.learningCandidateReviews || {},
    memoryItems: snapshot.memoryItems || {},
    memoryRecalls: snapshot.memoryRecalls || {},
  });
}

async function prepareMutation(adapterMode = 'changes') {
  const fixture = await prepareWaitingGate({ withReviewerDecision: true });
  const genericState = readState();
  const genericAttempt = findReviewerAttempt(
    genericState,
    fixture.bundle.executionPlan.id,
    1,
  );
  assert.equal(genericAttempt.status, 'changes-requested');
  assert.equal(genericAttempt.action, 'run-reviewer');
  assert.equal(genericAttempt.artifactRefs.length, 1);

  const readyForApproval = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const requestedApproval = fixture.runtime.requestBuilderReworkMutationApproval({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildApprovalRequest(
      readyForApproval,
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
  const adapter = createReviewerAdapter(adapterMode);
  const coordinator = createCoordinator(fixture.runtime, adapter.adapter);
  await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildMutationRequest(approved),
  });
  const ready = fixture.runtime.getReviewerReexecution(fixture.reworkPlan.id);
  const sourceBytes = fs.readFileSync(path.join(projectPath, targetPath));
  const state = readState();

  assert.equal(state.schemaVersion, 28);
  assert.equal(Object.keys(state.workOrders).length, 3);
  assert.equal(ready.status, 'ready');
  assert.equal(ready.persisted, false);
  assert.equal(ready.requestSource !== null, true);
  assert.deepEqual(Object.keys(ready.requestSource).sort(), [
    'builderReworkAttemptId',
    'builderReworkAttemptRecordDigest',
    'builderReworkDispatchDigest',
    'builderReworkDispatchId',
    'mutationEvidenceDigest',
    'mutationRunId',
    'reviewerWorkOrderDigest',
    'reviewerWorkOrderId',
    'sourceProgressDigest',
    'sourceReviewerAttemptId',
    'sourceReviewerAttemptRecordDigest',
  ]);
  assert.equal(ready.retainedFindings.length > 0, true);
  assert.deepEqual(ready.changedFiles, [targetPath]);
  assert.deepEqual(ready.targetPathAllowlist, [targetPath]);
  assert.equal(ready.verificationCommands.length, 1);
  assertDeepFrozen(ready);

  return {
    ...fixture,
    adapter,
    coordinator,
    genericAttempt,
    ready,
    sourceBytes,
  };
}

async function runAtomicStartAndFailureSmoke() {
  const context = await prepareMutation();
  const request = buildReviewerRequest(context.ready);
  const normalized = normalizeReviewerReexecutionRequest(request);
  const requestDigest = computeReviewerReexecutionRequestDigest(normalized);
  assert.equal(requestDigest, computeReviewerReexecutionRequestDigest(request));

  const before = readState();
  const previousDecisionIds = [
    ...before.reworkPlans[context.reworkPlan.id].evidenceRefs.decisionInboxItemRefs,
  ];
  const previousArtifactIds = [...context.genericAttempt.artifactRefs];
  const started = context.runtime.beginReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  const active = readState();
  const attempt = findReviewerAttempt(active, context.bundle.executionPlan.id, 2);
  const run = active.runs[attempt.runRefs[0]];

  assert.equal(started.idempotent, false);
  assert.equal(Object.keys(active.workOrders).length, Object.keys(before.workOrders).length);
  assert.equal(attempt.status, 'active');
  assert.equal(attempt.action, 'run-reviewer');
  assert.equal(run.status, 'running');
  assert.equal(run.metadata.executionMode, 'rework-reviewer');
  assert.equal(run.metadata.requestDigest, requestDigest);
  assert.deepEqual(
    previousArtifactIds,
    context.genericAttempt.artifactRefs,
    'prior generic Reviewer evidence stays immutable',
  );
  for (const itemId of previousDecisionIds) {
    assert.equal(active.decisionInboxItems[itemId].status, 'resolved');
    assert.equal(active.decisionInboxItems[itemId].resolution.action, 'rework-started');
  }
  assert.equal(context.adapter.reviewerCalls, 0);
  assert.equal(active.workOrders[context.ready.reviewerWorkOrder.id].status, 'active');
  assert.equal(
    active.workflowCheckpoints[active.executionPlans[context.bundle.executionPlan.id].latestCheckpointId].stage,
    'reviewer-ready',
  );

  const mutationArtifactPath = context.ready.mutationArtifacts[0].path;
  const mutationArtifactBytes = fs.readFileSync(mutationArtifactPath);
  const tamperedMutationArtifactBytes = Buffer.from(mutationArtifactBytes);
  tamperedMutationArtifactBytes[0] ^= 0xff;
  fs.writeFileSync(mutationArtifactPath, tamperedMutationArtifactBytes);
  assert.throws(
    () =>
      context.runtime.getReviewerReexecutionWorkerInput({
        reworkPlanId: context.reworkPlan.id,
        requestDigest,
      }),
    /Stage 5G Reviewer re-execution lineage|Stage 5G mutation evidence|mutation evidence|Artifact content/,
  );
  assert.throws(
    () =>
      context.runtime.failReviewerReexecution({
        reworkPlanId: context.reworkPlan.id,
        runId: run.id,
        requestDigest,
        mutationEvidenceDigest: context.ready.mutationEvidenceDigest,
        error: 'tampered mutation evidence must not settle',
      }),
    /Stage 5G Reviewer re-execution lineage|Stage 5G mutation evidence|mutation evidence|Artifact content/,
  );
  fs.writeFileSync(mutationArtifactPath, mutationArtifactBytes);

  context.runtime.failReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    runId: run.id,
    requestDigest,
    mutationEvidenceDigest: context.ready.mutationEvidenceDigest,
    error: 'synthetic interrupted worker',
  });
  const terminal = context.runtime.getReviewerReexecution(context.reworkPlan.id);
  assert.equal(terminal.status, 'failed');
  assert.equal(terminal.workOrderAttempt.status, 'failed');
  assert.equal(terminal.reviewArtifact, null);
}

async function runPassReplayAndReloadSmoke() {
  const context = await prepareMutation('pass');
  const request = buildReviewerRequest(context.ready);
  const beforeReview = context.runtime.getSnapshot();
  const result = await context.coordinator.runReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  const terminal = result.reviewerReexecution;
  const state = readState();
  const plan = state.executionPlans[context.bundle.executionPlan.id];
  const qa = Object.values(state.workOrders).find((workOrder) => workOrder.role === 'qa');

  assert.equal(terminal.status, 'completed');
  assert.equal(terminal.requestSource, null);
  assert.equal(terminal.workOrderAttempt.attemptNumber, 2);
  assert.equal(terminal.workOrderAttempt.status, 'completed');
  assert.equal(terminal.reviewerRun.status, 'completed');
  assert.equal(terminal.reviewArtifact.type, 'review');
  assert.deepEqual(terminal.attemptRefs.runRefs, [terminal.reviewerRun.id]);
  assert.deepEqual(terminal.attemptRefs.artifactRefs, [terminal.reviewArtifact.id]);
  assertDeepFrozen(terminal);
  assert.equal(plan.status, 'reviewing');
  assert.equal(plan.stopReason, 'separate-qa-execution-decision-required');
  assert.equal(qa.status, 'queued');
  assert.equal(
    state.workflowCheckpoints[plan.latestCheckpointId].stage,
    'qa-ready',
  );
  assert.equal(
    state.workflowCheckpoints[plan.latestCheckpointId].stopReason,
    'reviewer-reexecution-passed-qa-ready',
  );
  assert.equal(Object.values(state.runs).some((run) => run.role === 'qa'), false);
  assert.equal(Object.keys(state.workOrders).length, 3);
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), context.sourceBytes);
  assert.deepEqual(pickNonExecutionExpansion(context.runtime.getSnapshot()), pickNonExecutionExpansion(beforeReview));
  assert.equal(fs.existsSync(path.join(projectPath, '.git')), false);
  assert.throws(
    () =>
      context.runtime.beginOperatorSteppedWorkOrderStep(
        buildOperatorStepInput(
          state,
          context.bundle.executionPlan.id,
          'run-qa',
        ),
      ),
    /requires a separate execution decision/,
  );
  const recovery = context.runtime.getExecutionPlanRecovery(
    context.bundle.executionPlan.id,
  );
  assert.equal(recovery.current, true);
  assert.deepEqual(recovery.nextAllowedActions, []);
  await withLocalApiServer(async (baseUrl) => {
    const recoveryResponse = await fetch(
      `${baseUrl}/api/execution-plans/${encodeURIComponent(
        context.bundle.executionPlan.id,
      )}/recovery`,
    );
    assert.equal(recoveryResponse.status, 200);
    const recoveryPayload = await recoveryResponse.json();
    assert.deepEqual(
      recoveryPayload.executionPlanRecovery.nextAllowedActions,
      [],
    );

    const {
      executionPlanId: _executionPlanId,
      ...stepBody
    } = buildOperatorStepInput(
      state,
      context.bundle.executionPlan.id,
      'run-qa',
    );
    const stepResponse = await fetch(
      `${baseUrl}/api/execution-plans/${encodeURIComponent(
        context.bundle.executionPlan.id,
      )}/step`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stepBody),
      },
    );
    assert.equal(stepResponse.status, 409);
    assert.match(
      (await stepResponse.json()).error,
      /requires a separate execution decision/,
    );
  });

  const stateBytes = fs.readFileSync(statePath);
  const checkpointTamperedState = JSON.parse(stateBytes);
  checkpointTamperedState.workflowCheckpoints[plan.latestCheckpointId].checkpointDigest =
    '0'.repeat(64);
  fs.writeFileSync(statePath, `${JSON.stringify(checkpointTamperedState, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /terminal checkpoint digests|checkpoint tuple|Stage 5G/,
  );
  fs.writeFileSync(statePath, stateBytes);

  const authorityTamperedState = JSON.parse(stateBytes);
  const reviewerAttempt = findReviewerAttempt(
    authorityTamperedState,
    context.bundle.executionPlan.id,
    2,
  );
  reviewerAttempt.authorityDigest = '1'.repeat(64);
  reviewerAttempt.recordDigest = computeWorkOrderAttemptRecordDigest(reviewerAttempt);
  fs.writeFileSync(statePath, `${JSON.stringify(authorityTamperedState, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Reviewer authority digest/,
  );
  fs.writeFileSync(statePath, stateBytes);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const replay = await context.coordinator.runReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  assert.equal(replay.idempotent, true);
  assert.equal(context.adapter.reviewerCalls, 1);
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), context.sourceBytes);

  const mutationArtifactPath = terminal.mutationArtifacts[0].path;
  const mutationArtifactBytes = fs.readFileSync(mutationArtifactPath);
  const tamperedMutationArtifactBytes = Buffer.from(mutationArtifactBytes);
  tamperedMutationArtifactBytes[0] ^= 0xff;
  fs.writeFileSync(mutationArtifactPath, tamperedMutationArtifactBytes);
  assert.throws(
    () => context.runtime.getReviewerReexecution(context.reworkPlan.id),
    /Stage 5G Reviewer re-execution lineage|Stage 5G mutation evidence|durable replay evidence|Artifact content/,
  );
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Stage 5G Reviewer re-execution lineage|Stage 5G mutation evidence|Artifact content/,
  );
  await assert.rejects(
    () =>
      context.coordinator.runReviewerReexecution({
        reworkPlanId: context.reworkPlan.id,
        request,
      }),
    /Stage 5G Reviewer re-execution lineage|Stage 5G mutation evidence|durable replay evidence|Artifact content/,
  );
  fs.writeFileSync(mutationArtifactPath, mutationArtifactBytes);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const driftedSourceBytes = Buffer.from('module.exports = \"later source drift\";\n');
  fs.writeFileSync(path.join(projectPath, targetPath), driftedSourceBytes);
  const durableProjection = context.runtime.getReviewerReexecution(context.reworkPlan.id);
  const replayAfterSourceDrift = await context.coordinator.runReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  assert.equal(durableProjection.status, 'completed');
  assert.equal(replayAfterSourceDrift.idempotent, true);
  assert.equal(context.adapter.reviewerCalls, 1);
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  assert.deepEqual(fs.readFileSync(path.join(projectPath, targetPath)), driftedSourceBytes);
  await assert.rejects(
    () =>
      context.coordinator.runReviewerReexecution({
        reworkPlanId: context.reworkPlan.id,
        request: buildReviewerRequest(context.ready, 'A divergent request must not start another Reviewer.'),
      }),
    /divergent Reviewer re-execution/,
  );
  assert.equal(context.adapter.reviewerCalls, 1);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();
  fs.writeFileSync(path.join(projectPath, targetPath), context.sourceBytes);
}

async function runChangesRequestedSmoke() {
  const context = await prepareMutation('changes');
  const result = await context.coordinator.runReviewerReexecution({
    reworkPlanId: context.reworkPlan.id,
    request: buildReviewerRequest(context.ready),
  });
  const state = readState();
  const reviewerAttempts = Object.values(state.workOrderAttempts).filter(
    (attempt) => attempt.executionPlanId === context.bundle.executionPlan.id && attempt.role === 'reviewer',
  );
  const qa = Object.values(state.workOrders).find((workOrder) => workOrder.role === 'qa');

  assert.equal(result.reviewerReexecution.status, 'changes-requested');
  assert.equal(result.reviewerReexecution.workOrderAttempt.status, 'changes-requested');
  assert.equal(reviewerAttempts.filter((attempt) => attempt.attemptNumber === 2).length, 1);
  assert.equal(reviewerAttempts.some((attempt) => attempt.attemptNumber > 2), false);
  assert.equal(qa.status, 'blocked-dependency');
  assert.equal(state.executionPlans[context.bundle.executionPlan.id].status, 'blocked');
  assert.equal(
    state.executionPlans[context.bundle.executionPlan.id].stopReason,
    'reviewer-reexecution-changes-requested',
  );
  assert.equal(Object.values(state.runs).some((run) => run.role === 'qa'), false);
}

async function runFailClosedSettlementSmoke(mode, expectedMessage) {
  const context = await prepareMutation(mode);
  await assert.rejects(
    () =>
      context.coordinator.runReviewerReexecution({
        reworkPlanId: context.reworkPlan.id,
        request: buildReviewerRequest(context.ready),
      }),
    expectedMessage,
  );
  const terminal = context.runtime.getReviewerReexecution(context.reworkPlan.id);
  assert.equal(terminal.status, 'failed');
  assert.equal(terminal.workOrderAttempt.status, 'failed');
  assert.equal(terminal.reviewArtifact, null);
  assert.equal(terminal.attemptRefs.artifactRefs.length, 0);
  assert.equal(terminal.attemptRefs.runRefs.length, 1);
  assert.equal(context.adapter.reviewerCalls, 1);
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    await runAtomicStartAndFailureSmoke();
    await runPassReplayAndReloadSmoke();
    await runChangesRequestedSmoke();
    await runFailClosedSettlementSmoke('pass-with-decision', /malformed or widened/);
    await runFailClosedSettlementSmoke('malformed', /Reviewer artifact verdict/);
    await runFailClosedSettlementSmoke('throw', /synthetic reviewer worker failure/);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: 25,
      fixture: 'reused DEC-203 waiting-gate and mutation-approval helpers',
      proofs: {
        noNewWorkOrder: true,
        readyProjection: '11-key source',
        activeBeforeWorker: true,
        retainedGenericReviewerEvidence: true,
        passStopsAtQaReady: true,
        qaExecutionRequiresSeparateDecision: true,
        httpQaStepReturns409: true,
        changesRequestedStopsWithoutThirdAttempt: true,
        failClosedSettlement: true,
        rawArtifactTamperRefused: true,
        reloadRecomputesMutationEvidence: true,
        reloadRecomputesCheckpointAndAttemptAuthority: true,
        exactReplayNoWrite: true,
        durableReplaySurvivesLaterSourceDrift: true,
        divergentReplay409: true,
        reloadValidated: true,
        noSourceGitReleaseMemoryExpansion: true,
      },
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
