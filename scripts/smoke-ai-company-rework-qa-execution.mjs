import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import coordinatorModule from '../src/execution/execution-coordinator.js';
import localStubModule from '../src/execution/providers/local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';
import reworkQaModule from '../src/runtime/rework-qa-execution.js';
import qaRunnerModule from '../src/execution/qa-node-check-runner.js';
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
  digestSpecialistInputPathDigests,
  runSpecialistSourceBoundNodeChecks,
} = qaRunnerModule;
const {
  REQUEST_KEYS,
  QA_REQUEST_KEYS,
  computeReworkQaExecutionRequestDigest,
  normalizeReworkQaExecutionRequest,
} = reworkQaModule;
const { computeWorkOrderAttemptRecordDigest } = workOrderAttemptsModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MODE = 'ai-company-rework-qa-execution-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function readState() {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
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
  let reviewerCalls = 0;
  return {
    adapter: {
      name: 'local-stub',
      async execute(request, context) {
        if (request.role !== 'reviewer' || request.executionMode !== 'rework-reviewer') {
          return base.execute(request, context);
        }
        reviewerCalls += 1;
        return {
          providerRunId: 'rework-qa-smoke-reviewer',
          model: 'local-stub-rework-qa-smoke',
          normalizedResult: { needsDecision: false, nextStage: 'qa-ready' },
          outputText: createReviewerOutput(request),
        };
      },
    },
    get reviewerCalls() {
      return reviewerCalls;
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

function buildQaRequest(ready, rationale = 'Run one exact source-bound syntax check.') {
  const reviewedAt = new Date().toISOString();
  return {
    ...ready.requestSource,
    evaluatedAt: reviewedAt,
    qaRequest: {
      decision: 'run-rework-qa-once',
      acknowledgement:
        'run-only-source-bound-node-checks-and-stop-before-delivery-package',
      rationale,
      reviewedAt,
    },
  };
}

async function prepareQaReadyContext(options = {}) {
  const fixture = await prepareWaitingGate({ withReviewerDecision: true });
  const approvalReady = fixture.runtime.getBuilderReworkMutationApproval(
    fixture.reworkPlan.id,
  );
  const requestedApproval = fixture.runtime.requestBuilderReworkMutationApproval({
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
  const approved = fixture.runtime.getBuilderReworkMutationApproval(fixture.reworkPlan.id);
  const provider = createProviderAdapter();
  const coordinator = createExecutionCoordinator({
    runtimeService: fixture.runtime,
    repoRoot,
    providerAdapter: provider.adapter,
    reworkQaNodeCheckRunner: options.reworkQaNodeCheckRunner,
  });
  await coordinator.runBuilderReworkSourceMutation({
    reworkPlanId: fixture.reworkPlan.id,
    ...buildMutationRequest(approved),
  });
  const reviewerReady = fixture.runtime.getReviewerReexecution(fixture.reworkPlan.id);
  await coordinator.runReviewerReexecution({
    reworkPlanId: fixture.reworkPlan.id,
    request: buildReviewerRequest(reviewerReady),
  });
  const ready = fixture.runtime.getReworkQaExecution(fixture.reworkPlan.id);
  return { ...fixture, coordinator, provider, ready };
}

function findQaAttempt(state, executionPlanId) {
  return Object.values(state.workOrderAttempts).find(
    (attempt) =>
      attempt.executionPlanId === executionPlanId &&
      attempt.role === 'qa' &&
      attempt.action === 'run-qa',
  );
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function createFakeChild({ error = null, output = '', closeCode = 0, hang = false }) {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  child.stdin = { end() {} };
  child.kill = () => {
    queueMicrotask(() => child.emit('close', closeCode));
    return true;
  };
  queueMicrotask(() => {
    if (error) {
      child.emit('error', error);
      return;
    }
    if (output) child.stderr.emit('data', Buffer.from(output));
    if (!hang) child.emit('close', closeCode);
  });
  return child;
}

async function runWorkerBoundarySmoke() {
  const workerRoot = path.join(tempRoot, 'worker-boundary');
  fs.mkdirSync(workerRoot, { recursive: true });
  const relativePath = 'target.js';
  const targetFile = path.join(workerRoot, relativePath);
  const sourceBytes = Buffer.from('export const answer = 42;\n');
  fs.writeFileSync(targetFile, sourceBytes);
  const inputPathDigests = [{
    path: relativePath,
    sha256: sha256(sourceBytes),
    byteLength: sourceBytes.length,
  }];
  let invocation = null;
  const passed = await runSpecialistSourceBoundNodeChecks(
    {
      projectRoot: workerRoot,
      inputPathDigests,
      changedFiles: [relativePath],
      targetPathAllowlist: [relativePath],
      commands: [`node --check ${relativePath}`],
      deadlineAt: new Date(Date.now() + 1_000).toISOString(),
    },
    {
      spawnImpl(command, argv, options) {
        invocation = { command, argv, options };
        return createFakeChild({});
      },
    },
  );
  assert.equal(passed.resultSummary.verdict, 'passed');
  assert.equal(invocation.command, process.execPath);
  assert.deepEqual(invocation.argv, ['--check', '-']);
  assert.equal(invocation.options.shell, false);
  assert.deepEqual(invocation.options.env, {});

  await assert.rejects(
    () =>
      runSpecialistSourceBoundNodeChecks(
        {
          projectRoot: workerRoot,
          inputPathDigests,
          changedFiles: [relativePath],
          targetPathAllowlist: [relativePath],
          commands: [`node --check ${relativePath}`],
          deadlineAt: new Date(Date.now() + 1_000).toISOString(),
        },
        { spawnImpl: () => createFakeChild({ output: 'x'.repeat(128) }), outputCapBytes: 1 },
      ),
    /qa-output-cap-exceeded/,
  );
  await assert.rejects(
    () =>
      runSpecialistSourceBoundNodeChecks(
        {
          projectRoot: workerRoot,
          inputPathDigests,
          changedFiles: [relativePath],
          targetPathAllowlist: [relativePath],
          commands: [`node --check ${relativePath}`],
          deadlineAt: new Date(Date.now() + 1_000).toISOString(),
        },
        { spawnImpl: () => createFakeChild({ error: new Error('synthetic spawn failure') }) },
      ),
    /qa-spawn-failed/,
  );
  await assert.rejects(
    () =>
      runSpecialistSourceBoundNodeChecks(
        {
          projectRoot: workerRoot,
          inputPathDigests,
          changedFiles: [relativePath],
          targetPathAllowlist: [relativePath],
          commands: [`node --check ${relativePath}`],
          deadlineAt: new Date(Date.now() + 20).toISOString(),
        },
        { spawnImpl: () => createFakeChild({ hang: true }) },
      ),
    /cell-deadline-exceeded/,
  );
  fs.writeFileSync(targetFile, 'export const answer = 43;\n');
  await assert.rejects(
    () =>
      runSpecialistSourceBoundNodeChecks({
        projectRoot: workerRoot,
        inputPathDigests,
        changedFiles: [relativePath],
        targetPathAllowlist: [relativePath],
        commands: [`node --check ${relativePath}`],
        deadlineAt: new Date(Date.now() + 1_000).toISOString(),
      }),
    /source-drift-before-worker/,
  );
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
        // The server has not bound the port yet.
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    throw new Error(`local API server did not start: ${stderr}`);
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => {
      if (child.exitCode !== null) resolve();
      else child.once('exit', resolve);
    });
  }
}

async function runPassAndReplaySmoke() {
  const context = await prepareQaReadyContext();
  const request = buildQaRequest(context.ready);
  const normalized = normalizeReworkQaExecutionRequest(request);
  const requestDigest = computeReworkQaExecutionRequestDigest(normalized);

  assert.deepEqual(Object.keys(normalized).sort(), [...REQUEST_KEYS].sort());
  assert.deepEqual(Object.keys(normalized.qaRequest).sort(), [...QA_REQUEST_KEYS].sort());
  assert.equal(normalized.evaluatedAt, normalized.qaRequest.reviewedAt);
  assert.equal(context.ready.status, 'ready');
  assert.equal(context.ready.persisted, false);
  assert.match(context.ready.requestSource.qaWorkOrderId, /-qa$/);

  const before = readState();
  const started = context.runtime.beginReworkQaExecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  const active = readState();
  const activeAttempt = findQaAttempt(active, context.bundle.executionPlan.id);
  const activeRun = active.runs[activeAttempt.runRefs[0]];
  const activeCheckpoint = active.workflowCheckpoints[
    active.executionPlans[context.bundle.executionPlan.id].latestCheckpointId
  ];
  assert.equal(started.idempotent, false);
  assert.equal(active.schemaVersion, 26);
  assert.equal(Object.keys(active.workOrders).length, 3);
  assert.equal(activeAttempt.attemptNumber, 1);
  assert.equal(activeAttempt.status, 'active');
  assert.deepEqual(activeAttempt.runRefs, [activeRun.id]);
  assert.equal(activeAttempt.recordDigest, computeWorkOrderAttemptRecordDigest(activeAttempt));
  assert.equal(activeRun.status, 'running');
  assert.equal(activeRun.metadata.executionMode, 'rework-qa-node-check');
  assert.equal(activeRun.metadata.requestDigest, requestDigest);
  assert.equal(activeRun.metadata.workOrderAttemptId, activeAttempt.id);
  assert.equal(activeRun.metadata.qaInputDigest, request.qaInputDigest);
  assert.equal(activeAttempt.checkpointRef, activeCheckpoint.id);
  assert.equal(activeAttempt.completedAt, null);
  assert.equal(activeAttempt.stopReason, null);
  assert.equal(active.executionPlans[context.bundle.executionPlan.id].latestCheckpointId, activeCheckpoint.id);
  assert.equal(activeCheckpoint.status, 'consumed');
  assert.equal(activeCheckpoint.stopReason, 'rework-qa-execution-started');
  assert.equal(Object.keys(active.runs).length, Object.keys(before.runs).length + 1);

  const stateBytes = fs.readFileSync(statePath);
  const exactReplay = context.runtime.beginReworkQaExecution({
    reworkPlanId: context.reworkPlan.id,
    request,
  });
  assert.equal(exactReplay.idempotent, true);
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);
  assert.throws(
    () =>
      context.runtime.beginReworkQaExecution({
        reworkPlanId: context.reworkPlan.id,
        request: buildQaRequest(context.ready, 'A divergent request must not start another QA attempt.'),
      }),
    /divergent QA execution/,
  );
  assert.deepEqual(fs.readFileSync(statePath), stateBytes);

  const tampered = JSON.parse(stateBytes);
  tampered.workOrderAttempts[activeAttempt.id].runRefs = [];
  tampered.workOrderAttempts[activeAttempt.id].recordDigest =
    computeWorkOrderAttemptRecordDigest(tampered.workOrderAttempts[activeAttempt.id]);
  fs.writeFileSync(statePath, `${JSON.stringify(tampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Stage 5H|Active WorkOrderAttempt|QA lineage/,
  );
  fs.writeFileSync(statePath, stateBytes);

  const checkpointTampered = JSON.parse(stateBytes);
  const unrelatedCheckpointId = Object.keys(checkpointTampered.workflowCheckpoints).find(
    (checkpointId) => checkpointId !== activeCheckpoint.id,
  );
  assert.ok(unrelatedCheckpointId);
  checkpointTampered.workOrderAttempts[activeAttempt.id].checkpointRef =
    unrelatedCheckpointId;
  checkpointTampered.workOrderAttempts[activeAttempt.id].recordDigest =
    computeWorkOrderAttemptRecordDigest(
      checkpointTampered.workOrderAttempts[activeAttempt.id],
    );
  fs.writeFileSync(statePath, `${JSON.stringify(checkpointTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Stage 5H|checkpoint|QA lineage/,
  );
  fs.writeFileSync(statePath, stateBytes);

  const digestTampered = JSON.parse(stateBytes);
  digestTampered.runs[activeRun.id].metadata.qaInputDigest = '0'.repeat(64);
  fs.writeFileSync(statePath, `${JSON.stringify(digestTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Stage 5H|QA input|QA lineage/,
  );
  fs.writeFileSync(statePath, stateBytes);

  const requestDigestTampered = JSON.parse(stateBytes);
  const divergentRequest = normalizeReworkQaExecutionRequest(
    buildQaRequest(
      context.ready,
      'A changed request digest cannot replace its normalized durable request.',
    ),
  );
  requestDigestTampered.runs[activeRun.id].metadata.requestDigest =
    computeReworkQaExecutionRequestDigest(divergentRequest);
  fs.writeFileSync(statePath, `${JSON.stringify(requestDigestTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /Stage 5H|request|QA lineage/,
  );
  fs.writeFileSync(statePath, stateBytes);

  const passContext = await prepareQaReadyContext();
  const passRequest = buildQaRequest(passContext.ready);
  const result = await passContext.coordinator.runReworkQaExecution({
    reworkPlanId: passContext.reworkPlan.id,
    request: passRequest,
  });
  const terminalState = readState();
  const plan = terminalState.executionPlans[passContext.bundle.executionPlan.id];
  const attempt = findQaAttempt(terminalState, plan.id);
  const run = terminalState.runs[attempt.runRefs[0]];
  const artifact = terminalState.artifacts[attempt.artifactRefs[0]];
  const terminalCheckpoint = terminalState.workflowCheckpoints[plan.latestCheckpointId];
  assert.equal(result.reworkQaExecution.status, 'completed');
  assert.equal(run.summary.verdict, 'passed');
  assert.equal(artifact.type, 'qa-evidence');
  const qaEvidence = JSON.parse(fs.readFileSync(artifact.path, 'utf8'));
  assert.deepEqual(qaEvidence.result.checks[0].argv, [process.execPath, '--check', '-']);
  assert.equal(plan.status, 'delivery-ready');
  assert.equal(plan.stopReason, 'separate-delivery-package-decision-required');
  assert.equal(terminalCheckpoint.stage, 'delivery-ready');
  assert.equal(terminalCheckpoint.status, 'terminal');
  assert.equal(attempt.checkpointRef, terminalCheckpoint.id);
  assert.equal(terminalCheckpoint.resumedFromCheckpointId, passContext.ready.requestSource.qaReadyCheckpointId);
  assert.equal(attempt.completedAt, run.finishedAt);
  assert.equal(attempt.stopReason, null);
  assert.equal(plan.latestCheckpointId, terminalCheckpoint.id);
  assert.ok(plan.runRefs.includes(run.id));
  assert.ok(plan.artifactRefs.includes(artifact.id));
  assert.equal(Object.keys(terminalState.deliveryPackages).length, 0);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const qaArtifactBytes = fs.readFileSync(artifact.path);
  const argvTamperedState = structuredClone(terminalState);
  const argvTamperedEvidence = structuredClone(qaEvidence);
  argvTamperedState.runs[run.id].summary.resultSummary.checks[0].argv[2] =
    argvTamperedState.runs[run.id].summary.resultSummary.checks[0].relativePath;
  argvTamperedEvidence.result.checks[0].argv[2] =
    argvTamperedEvidence.result.checks[0].relativePath;
  fs.writeFileSync(statePath, `${JSON.stringify(argvTamperedState, null, 2)}\n`);
  fs.writeFileSync(artifact.path, `${JSON.stringify(argvTamperedEvidence, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /completed Stage 5H|QA state/,
  );
  fs.writeFileSync(statePath, `${JSON.stringify(terminalState, null, 2)}\n`);
  fs.writeFileSync(artifact.path, qaArtifactBytes);

  const envelopeTamperedEvidence = structuredClone(qaEvidence);
  envelopeTamperedEvidence.schemaVersion = 2;
  fs.writeFileSync(artifact.path, `${JSON.stringify(envelopeTamperedEvidence, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /completed Stage 5H|QA state/,
  );
  fs.writeFileSync(artifact.path, qaArtifactBytes);

  const terminalTampered = structuredClone(terminalState);
  terminalTampered.workflowCheckpoints[terminalCheckpoint.id].resumedFromCheckpointId = 'checkpoint-9999';
  fs.writeFileSync(statePath, `${JSON.stringify(terminalTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /checkpoint|Stage 5H|WorkflowCheckpoint/,
  );
  fs.writeFileSync(statePath, `${JSON.stringify(terminalState, null, 2)}\n`);

  const terminalAttemptTampered = structuredClone(terminalState);
  terminalAttemptTampered.workOrderAttempts[attempt.id].checkpointRef =
    passContext.ready.requestSource.qaReadyCheckpointId;
  terminalAttemptTampered.workOrderAttempts[attempt.id].recordDigest =
    computeWorkOrderAttemptRecordDigest(
      terminalAttemptTampered.workOrderAttempts[attempt.id],
    );
  fs.writeFileSync(statePath, `${JSON.stringify(terminalAttemptTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /completed Stage 5H|checkpoint|QA state/,
  );
  fs.writeFileSync(statePath, `${JSON.stringify(terminalState, null, 2)}\n`);

  const terminalBytes = fs.readFileSync(statePath);
  const replay = await passContext.coordinator.runReworkQaExecution({
    reworkPlanId: passContext.reworkPlan.id,
    request: passRequest,
  });
  assert.equal(replay.idempotent, true);
  assert.deepEqual(fs.readFileSync(statePath), terminalBytes);
}

async function runFailedCheckSmoke() {
  const context = await prepareQaReadyContext({
    async reworkQaNodeCheckRunner(input) {
      return {
        observedInputDigest: digestSpecialistInputPathDigests(input.inputPathDigests),
        resultSummary: {
          kind: 'node-syntax-check',
          checks: input.commands.map((command) => ({
            argv: [process.execPath, '--check', '-'],
            exitCode: 1,
            passed: false,
            relativePath: command.slice('node --check '.length),
            stderrDigest: 'b'.repeat(64),
            stdoutDigest: 'a'.repeat(64),
            timedOut: false,
            truncated: false,
          })),
          mutationDetected: false,
          reasons: ['synthetic failed syntax check'],
          verdict: 'failed',
        },
      };
    },
  });
  const result = await context.coordinator.runReworkQaExecution({
    reworkPlanId: context.reworkPlan.id,
    request: buildQaRequest(context.ready),
  });
  const state = readState();
  const plan = state.executionPlans[context.bundle.executionPlan.id];
  const attempt = findQaAttempt(state, plan.id);
  assert.equal(result.reworkQaExecution.status, 'failed');
  assert.equal(attempt.status, 'failed');
  assert.equal(plan.status, 'blocked');
  assert.equal(plan.stopReason, 'rework-qa-failed-no-retry-authority');
  assert.equal(attempt.checkpointRef, null);
  assert.equal(attempt.stopReason, 'rework-qa-failed-no-retry-authority');
  assert.equal(attempt.completedAt, state.runs[attempt.runRefs[0]].finishedAt);
  assert.equal(attempt.artifactRefs.length, 1);
  assert.equal(state.artifacts[attempt.artifactRefs[0]].type, 'qa-evidence');
  assert.equal(Object.keys(state.deliveryPackages).length, 0);
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const refsTampered = structuredClone(state);
  refsTampered.executionPlans[plan.id].artifactRefs = refsTampered.executionPlans[plan.id].artifactRefs
    .filter((artifactId) => artifactId !== attempt.artifactRefs[0]);
  fs.writeFileSync(statePath, `${JSON.stringify(refsTampered, null, 2)}\n`);
  assert.throws(
    () => createFileStore({ runtimeRoot }).loadStateSupportedReadonly(),
    /failed Stage 5H|QA state/,
  );
}

async function runSourceDriftSettlementSmoke() {
  const context = await prepareQaReadyContext();
  const request = buildQaRequest(context.ready);
  const relativePath = context.ready.sourceDigests[0].path;
  const sourcePath = path.join(projectPath, relativePath);
  const originalBytes = fs.readFileSync(sourcePath);
  const originalGetWorkerInput = context.runtime.getReworkQaExecutionWorkerInput.bind(context.runtime);
  context.runtime.getReworkQaExecutionWorkerInput = (input) => {
    fs.writeFileSync(sourcePath, 'export const drifted = true;\n');
    try {
      return originalGetWorkerInput(input);
    } finally {
      fs.writeFileSync(sourcePath, originalBytes);
    }
  };

  await assert.rejects(
    () => context.coordinator.runReworkQaExecution({
      reworkPlanId: context.reworkPlan.id,
      request,
    }),
    /source|drift|current|targets/i,
  );
  const state = readState();
  const attempt = findQaAttempt(state, context.bundle.executionPlan.id);
  const run = state.runs[attempt.runRefs[0]];
  assert.equal(attempt.status, 'failed');
  assert.equal(run.status, 'completed');
  assert.equal(run.summary.verdict, 'failed');
  assert.equal(attempt.artifactRefs.length, 1);
  assert.equal(state.artifacts[attempt.artifactRefs[0]].type, 'qa-evidence');
  createFileStore({ runtimeRoot }).loadStateSupportedReadonly();

  const interrupted = await prepareQaReadyContext();
  const interruptedRequest = buildQaRequest(interrupted.ready);
  interrupted.runtime.getReworkQaExecutionWorkerInput = () => {
    throw new Error('synthetic worker input interruption');
  };
  interrupted.runtime.failReworkQaExecution = () => {
    throw new Error('synthetic settlement interruption');
  };
  await assert.rejects(
    () => interrupted.coordinator.runReworkQaExecution({
      reworkPlanId: interrupted.reworkPlan.id,
      request: interruptedRequest,
    }),
    /synthetic worker input interruption/,
  );
  const interruptedState = readState();
  const interruptedAttempt = findQaAttempt(
    interruptedState,
    interrupted.bundle.executionPlan.id,
  );
  assert.equal(interruptedAttempt.status, 'active');
  assert.equal(interruptedState.runs[interruptedAttempt.runRefs[0]].status, 'running');
  assert.equal(interruptedAttempt.artifactRefs.length, 0);
}

async function runApiSmoke() {
  const context = await prepareQaReadyContext();
  const request = buildQaRequest(context.ready);
  await withLocalApiServer(async (baseUrl) => {
    const endpoint = `${baseUrl}/api/rework-plans/${encodeURIComponent(context.reworkPlan.id)}/qa-execution`;
    const initial = await fetch(endpoint);
    assert.equal(initial.status, 200);
    assert.equal((await initial.json()).reworkQaExecution.status, 'ready');

    const malformed = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reworkPlanId: context.reworkPlan.id }),
    });
    assert.equal(malformed.status, 400);

    const started = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(started.status, 201);
    assert.equal((await started.json()).reworkQaExecution.status, 'completed');

    const replay = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    assert.equal(replay.status, 200);
    assert.equal((await replay.json()).idempotent, true);
  });
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    await runPassAndReplaySmoke();
    await runFailedCheckSmoke();
    await runSourceDriftSettlementSmoke();
    await runApiSmoke();
    await runWorkerBoundarySmoke();
    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: 25,
      proofs: {
        exactRequestContract: true,
        atomicAttemptAndRun: true,
        activeReplayNoWrite: true,
        divergentReplayRefused: true,
        bidirectionalRunBinding: true,
        tamperRefused: true,
        sourceBoundStdinPass: true,
        deliveryPackageAbsent: true,
        failedCheckBlocksWithoutRetry: true,
        exactHttpGetPost: true,
        workerTimeoutOutputSpawnAndDriftGuards: true,
        sourceDriftSettlesOrRemainsInterrupted: true,
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
