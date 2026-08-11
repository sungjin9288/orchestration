import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import dispositionModule from '../src/runtime/ops-attempt-dispositions.js';
import resumeModule from '../src/runtime/ops-attempt-resumes.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import workOrderPreviewModule from '../src/runtime/workorder-verification-plan-preview.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const {
  OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  OPS_ATTEMPT_DISPOSITION_DECISION,
  OPS_ATTEMPT_DISPOSITION_REASON_CODE,
} = dispositionModule;
const {
  OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT,
  OPS_ATTEMPT_RESUME_ACTION,
  OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY,
  OPS_ATTEMPT_RESUME_DECISION,
  OPS_ATTEMPT_RESUME_RECORD_KEYS,
  OPS_ATTEMPT_RESUME_REQUEST_KEYS,
  computeOpsAttemptResumeRecordDigest,
} = resumeModule;
const { createRuntimeService } = runtimeModule;
const { computeExecutionPlanRecordDigest } = workOrderPreviewModule;

const MODE = 'ai-company-ops-safe-checkpoint-resume-smoke';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(
  repoRoot,
  'var',
  'runtime-ai-company-ops-safe-checkpoint-resume-smoke',
);
const targetPath = 'src/runtime/runtime-service.js';
const port = 10270 + (process.pid % 20);
const baseUrl = `http://127.0.0.1:${port}`;
const keepFixture = process.env.ORCHESTRATION_OPS_RESUME_KEEP_FIXTURE === '1';
const fixtureFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];
const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['One exact safe-checkpoint QA resume evidence chain'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before retry, package close-out, Git, or release'],
};

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'ops-resume-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function createTargetedProviderAdapter() {
  const base = createLocalStubProviderAdapter();
  return {
    name: 'ops-resume-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// safe-checkpoint fixture\n`;
      return {
        providerRunId: `ops-resume-builder-${request.task.id}`,
        model: 'ops-resume-targeted-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Applied one bounded syntax-safe fixture update.',
        },
        outputText: `# Builder Live Mutation\n\n## Change Summary\n- prepared file updates: 1\n\n## Target Files\n- ${targetPath}\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content).toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
  };
}

function createStaffingSpec() {
  return {
    mode: 'council',
    selectedAgentIds: [
      'agent-conductor',
      'agent-strategist',
      'agent-architect',
      'agent-decomposer',
    ],
    selectionRationale: 'Bind one exact local Council before safe QA resume.',
    parallelGroups: [],
    providerMode: 'local-stub',
    terminationPolicy: {
      maxProviderCalls: 0,
      maxTurnsPerAgent: 4,
      deadlineMs: 120000,
      stopOnRequiredRoleFailure: true,
    },
  };
}

function writeProjectFixture(projectPath) {
  for (const relativePath of fixtureFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\n\nmodule.exports = { safeCheckpointReady: false };\n`
        : relativePath.endsWith('.md')
          ? '# Safe-checkpoint resume smoke fixture\n'
          : `'use strict';\n`,
    );
  }
}

function createContext(name) {
  const runtimeRoot = path.join(tempRoot, name, 'runtime');
  const projectPath = path.join(tempRoot, name, 'project');
  writeProjectFixture(projectPath);
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name: `Ops resume ${name}`, projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Safe checkpoint ${name}`,
    goal: 'Resume exactly one quarantined QA attempt without widening authority.',
    constraints: 'Local only. No retry, provider, source mutation, Git, or release.',
  });
  const evaluatedAt = new Date().toISOString();
  const staffingSpec = createStaffingSpec();
  const preview = runtime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const staffingPlan = runtime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    sourceDigest: preview.sourceDigest,
    missionDigest: preview.missionDigest,
    blueprintDigest: preview.blueprintDigest,
    staffingSpecDigest: preview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept the exact local staffing evidence.',
      reviewedAt: evaluatedAt,
    },
  }).staffingPlan;
  const entered = runtime.enterStaffingPlanCouncil({
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Bind the exact accepted plan to one local Council.',
      requestedAt: new Date().toISOString(),
    },
  });
  runtime.decideRealCouncilSession({
    councilSessionId: entered.councilSession.id,
    action: 'approve',
  });
  const workOrderPreview = runtime.previewMissionWorkOrders({
    councilSessionId: entered.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: entered.councilSession.id,
    compileSpec,
    previewId: workOrderPreview.previewId,
    sourceDigest: workOrderPreview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  return {
    persisted,
    project,
    runtime,
    runtimeRoot,
    statePath: path.join(runtimeRoot, 'state.json'),
  };
}

function stageRecord(stage, result = {}) {
  return {
    stage,
    runId: result.run?.id || null,
    artifactId: result.artifact?.id || null,
    inboxItemId: result.decisionInboxItem?.id || result.item?.id || null,
    approvalId: result.approval?.id || null,
  };
}

function buildStepInput(bundle, action, terminalGateApprovalId = null) {
  const checkpoint = bundle.latestCheckpoint;
  const role =
    action === 'continue-builder'
      ? 'builder'
      : action === 'run-reviewer'
        ? 'reviewer'
        : 'qa';
  const workOrder = bundle.workOrders.find((entry) => entry.role === role);
  return {
    executionPlanId: bundle.executionPlan.id,
    action,
    expectedWorkOrderId: workOrder.id,
    sourceDigest: bundle.executionPlan.sourceDigest,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    terminalGateApprovalId,
    evaluatedAt: new Date().toISOString(),
  };
}

async function prepareActiveQa(context, qaNodeCheckRunner = null) {
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: context.runtime,
    providerAdapter: createTargetedProviderAdapter(),
    ...(qaNodeCheckRunner ? { qaNodeCheckRunner } : {}),
  });
  const started = context.runtime.beginSequentialWorkOrderExecution({
    executionPlanId: context.persisted.executionPlan.id,
    approvalId: context.persisted.approval.id,
  });
  const task = started.controlTask;
  const planner = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: {
      classification: 'new task',
      scopeStatement: task.intent,
      missingContext: [],
      decisionNote: '',
    },
  });
  const architect = await coordinator.runArchitect({ taskId: task.id });
  const taskBreaker = await coordinator.runTaskBreaker({ taskId: task.id });
  const preflight = await coordinator.runBuilderPreflight({ taskId: task.id });
  const terminalApproval = context.runtime.requestBuilderLiveMutationApproval({
    taskId: task.id,
  });
  let bundle = context.runtime.finalizeSequentialWorkOrderExecution({
    executionPlanId: context.persisted.executionPlan.id,
    workOrderId: started.executionPlan.activeWorkOrderId,
    stageResults: [
      stageRecord('planner', planner),
      stageRecord('architect', architect),
      stageRecord('task-breaker', taskBreaker),
      stageRecord('builder-preflight', preflight),
      stageRecord('request-builder-live-mutation-approval', {
        approval: terminalApproval,
        item: context.runtime.getDecisionInboxItem(terminalApproval.inboxItemId),
      }),
    ],
    stopReason: 'waiting-approval',
    stoppedAt: 'request-builder-live-mutation-approval',
    terminalGateApprovalId: terminalApproval.id,
  });
  context.runtime.resolveDecisionInboxItem({
    itemId: terminalApproval.inboxItemId,
    action: 'approved',
  });
  const builderStarted = context.runtime.beginOperatorSteppedWorkOrderStep(
    buildStepInput(bundle, 'continue-builder', terminalApproval.id),
  );
  const builder = await coordinator.runBuilderLiveMutation({ taskId: task.id });
  bundle = context.runtime.completeReviewedDeliveryBuilder({
    executionPlanId: bundle.executionPlan.id,
    workOrderAttemptId: builderStarted.workOrderAttempt.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  const reviewerStarted = context.runtime.beginOperatorSteppedWorkOrderStep(
    buildStepInput(bundle, 'run-reviewer'),
  );
  const reviewer = await coordinator.runReviewer({ taskId: task.id });
  bundle = context.runtime.completeReviewedDeliveryReviewer({
    executionPlanId: bundle.executionPlan.id,
    workOrderAttemptId: reviewerStarted.workOrderAttempt.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  const qaStarted = context.runtime.beginOperatorSteppedWorkOrderStep(
    buildStepInput(bundle, 'run-qa'),
  );
  return { bundle: qaStarted, coordinator, sourceAttempt: qaStarted.workOrderAttempt };
}

function quarantineSource(context, activeQa) {
  const evaluatedAt = activeQa.sourceAttempt.startedAt;
  const preview = context.runtime.getOpsSupervisionPreview({
    targetType: 'work-order-attempt',
    targetId: activeQa.sourceAttempt.id,
    parentId: activeQa.bundle.executionPlan.id,
    expectedTargetRecordDigest: activeQa.sourceAttempt.recordDigest,
    expectedParentDigest: computeExecutionPlanRecordDigest(
      activeQa.bundle.executionPlan,
    ),
    evaluatedAt,
  });
  const disposition = context.runtime.quarantineOpsAttempt({
    targetType: preview.targetType,
    targetId: preview.targetId,
    parentId: preview.parentId,
    expectedTargetRecordDigest: preview.targetRecordDigest,
    expectedParentDigest: preview.parentDigest,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    decision: OPS_ATTEMPT_DISPOSITION_DECISION,
    reasonCode: OPS_ATTEMPT_DISPOSITION_REASON_CODE,
    acknowledgement: OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  }).opsAttemptDisposition;
  return { disposition, preview };
}

function downgradeToV27(statePath) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  state.schemaVersion = 27;
  delete state.sequences.opsAttemptResume;

  delete state.sequences.missionContextAttachment;
  delete state.opsAttemptResumes;

  delete state.missionContextAttachments;
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function buildResumeRequest(activeQa, disposition) {
  const checkpoint = activeQa.bundle.latestCheckpoint;
  const confirmedAt = new Date(
    Math.max(Date.now(), Date.parse(disposition.createdAt)),
  ).toISOString();
  return {
    dispositionRecordDigest: disposition.recordDigest,
    sourceAttemptId: activeQa.sourceAttempt.id,
    sourceAttemptRecordDigest: activeQa.sourceAttempt.recordDigest,
    executionPlanId: activeQa.bundle.executionPlan.id,
    expectedExecutionPlanDigest: disposition.parentDigest,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    expectedWorkOrderId: activeQa.sourceAttempt.workOrderId,
    action: OPS_ATTEMPT_RESUME_ACTION,
    evaluatedAt: confirmedAt,
    sourceWorkerStopConfirmedAt: confirmedAt,
    decision: OPS_ATTEMPT_RESUME_DECISION,
    acknowledgement: OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT,
    expectedReplacementAttemptNumber: 2,
  };
}

function assertResumeRecord(record, request, disposition) {
  assert.deepEqual(Object.keys(record), OPS_ATTEMPT_RESUME_RECORD_KEYS);
  assert.equal(record.sourceDispositionId, disposition.id);
  assert.equal(record.sourceDispositionRecordDigest, disposition.recordDigest);
  assert.equal(record.sourceAttemptId, request.sourceAttemptId);
  assert.equal(record.sourceAttemptRecordDigest, request.sourceAttemptRecordDigest);
  assert.equal(record.sourceCheckpointId, request.checkpointId);
  assert.equal(record.sourceCheckpointDigest, request.checkpointDigest);
  assert.equal(record.sourceInputDigest, request.inputDigest);
  assert.equal(record.sourceAuthorityDigest, request.authorityDigest);
  assert.equal(record.action, OPS_ATTEMPT_RESUME_ACTION);
  assert.equal(record.role, 'qa');
  assert.equal(record.decision, OPS_ATTEMPT_RESUME_DECISION);
  assert.deepEqual(record.authoritySummary, OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY);
  assert.equal(computeOpsAttemptResumeRecordDigest(record), record.recordDigest);
  assert.doesNotMatch(
    JSON.stringify(record),
    /PRIVATE KEY|sk-proj-|authorization|password|stdout|stderr|provider payload/i,
  );
}

async function settleResumedQa(context, activeQa, started) {
  const byRole = Object.fromEntries(
    started.executionPlanBundle.workOrders.map((workOrder) => [workOrder.role, workOrder]),
  );
  const result = await activeQa.coordinator.runQaWorkOrder({
    taskId: started.executionPlanBundle.controlTask.id,
    executionPlanId: started.opsAttemptResume.executionPlanId,
    workOrderId: byRole.qa.id,
    workOrderAttemptId: started.replacementAttempt.id,
    opsAttemptResumeId: started.opsAttemptResume.id,
    builderRunId: byRole.builder.completionRunId,
    reviewerRunId: byRole.reviewer.completionRunId,
    sourceDigest: started.executionPlanBundle.executionPlan.sourceDigest,
    changedFiles: byRole.builder.changedFiles,
    targetPathAllowlist: byRole.qa.targetPathAllowlist,
    commands: byRole.qa.verificationCommands,
  });
  return context.runtime.completeReviewedDeliveryQa({
    executionPlanId: started.opsAttemptResume.executionPlanId,
    runId: result.run.id,
    qaEvidenceArtifactId: result.artifact.id,
    workOrderAttemptId: started.replacementAttempt.id,
    opsAttemptResumeId: started.opsAttemptResume.id,
  });
}

async function waitForServer(child) {
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk.toString(); });
  child.stderr.on('data', (chunk) => { output += chunk.toString(); });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`UI server exited early: ${output}`);
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch {
      // The bounded loopback server is still starting.
    }
    await delay(50);
  }
  throw new Error(`UI server did not start: ${output}`);
}

async function requestApi(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, body: await response.json() };
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  let server;
  try {
    assert.equal(OPS_ATTEMPT_RESUME_REQUEST_KEYS.length, 16);
    assert.equal(OPS_ATTEMPT_RESUME_RECORD_KEYS.length, 22);

    const passContext = createContext('pass');
    const passActiveQa = await prepareActiveQa(passContext);
    const passQuarantine = quarantineSource(passContext, passActiveQa);
    const sourceBytes = {
      attempt: JSON.stringify(passActiveQa.sourceAttempt),
      checkpoint: JSON.stringify(passActiveQa.bundle.latestCheckpoint),
      disposition: JSON.stringify(passQuarantine.disposition),
      executionPlan: JSON.stringify(passActiveQa.bundle.executionPlan),
      workOrder: JSON.stringify(
        passActiveQa.bundle.workOrders.find((entry) => entry.role === 'qa'),
      ),
    };
    downgradeToV27(passContext.statePath);
    const v27Bytes = fs.readFileSync(passContext.statePath, 'utf8');
    const passiveSnapshot = passContext.runtime.getSnapshot();
    assert.equal(passiveSnapshot.schemaVersion, 30);
    assert.equal('opsAttemptResumes' in passiveSnapshot, false);
    assert.equal(fs.readFileSync(passContext.statePath, 'utf8'), v27Bytes);

    const passRequest = buildResumeRequest(passActiveQa, passQuarantine.disposition);
    assert.throws(
      () => passContext.runtime.resumeOpsAttemptFromSafeCheckpoint(
        passQuarantine.disposition.id,
        { ...passRequest, extra: true },
      ),
      (error) => error.statusCode === 400,
    );
    assert.equal(fs.readFileSync(passContext.statePath, 'utf8'), v27Bytes);

    const passStarted = passContext.runtime.resumeOpsAttemptFromSafeCheckpoint(
      passQuarantine.disposition.id,
      passRequest,
    );
    assert.equal(passStarted.idempotent, false);
    assert.equal(passStarted.sourceAttempt.status, 'active');
    assert.equal(passStarted.replacementAttempt.status, 'active');
    assert.equal(passStarted.replacementAttempt.attemptNumber, 2);
    assertResumeRecord(
      passStarted.opsAttemptResume,
      passRequest,
      passQuarantine.disposition,
    );
    const startedState = JSON.parse(fs.readFileSync(passContext.statePath, 'utf8'));
    assert.equal(startedState.schemaVersion, 30);
    assert.equal(startedState.sequences.opsAttemptResume, 1);
    assert.equal(Object.keys(startedState.opsAttemptResumes).length, 1);
    assert.equal(
      JSON.stringify(startedState.workOrderAttempts[passActiveQa.sourceAttempt.id]),
      sourceBytes.attempt,
    );
    assert.equal(
      JSON.stringify(startedState.workflowCheckpoints[passActiveQa.bundle.latestCheckpoint.id]),
      sourceBytes.checkpoint,
    );
    assert.equal(
      JSON.stringify(startedState.opsAttemptDispositions[passQuarantine.disposition.id]),
      sourceBytes.disposition,
    );
    assert.equal(
      JSON.stringify(startedState.executionPlans[passActiveQa.bundle.executionPlan.id]),
      sourceBytes.executionPlan,
    );
    assert.equal(
      JSON.stringify(startedState.workOrders[passActiveQa.sourceAttempt.workOrderId]),
      sourceBytes.workOrder,
    );

    const startBytes = fs.readFileSync(passContext.statePath, 'utf8');
    const earlyReplay = passContext.runtime.resumeOpsAttemptFromSafeCheckpoint(
      passQuarantine.disposition.id,
      passRequest,
    );
    assert.equal(earlyReplay.idempotent, true);
    assert.equal(fs.readFileSync(passContext.statePath, 'utf8'), startBytes);
    assert.throws(
      () => passContext.runtime.failReviewedDeliveryContinuation({
        executionPlanId: passActiveQa.bundle.executionPlan.id,
        workOrderAttemptId: passActiveQa.sourceAttempt.id,
        reason: 'synthetic-late-source-result',
        stoppedAt: 'qa',
      }),
      /blocks settlement/,
    );
    assert.equal(fs.readFileSync(passContext.statePath, 'utf8'), startBytes);

    const passBundle = await settleResumedQa(passContext, passActiveQa, passStarted);
    const passSource = passBundle.workOrderAttempts.find(
      (attempt) => attempt.id === passActiveQa.sourceAttempt.id,
    );
    const passReplacement = passBundle.workOrderAttempts.find(
      (attempt) => attempt.id === passStarted.replacementAttempt.id,
    );
    assert.equal(passSource.status, 'active');
    assert.equal(passReplacement.status, 'completed');
    assert.equal(passBundle.executionPlan.status, 'delivery-ready');
    assert.equal(passBundle.latestCheckpoint.stage, 'delivery-ready');
    const passTerminalBytes = fs.readFileSync(passContext.statePath, 'utf8');
    const terminalReplay = passContext.runtime.resumeOpsAttemptFromSafeCheckpoint(
      passQuarantine.disposition.id,
      passRequest,
    );
    assert.equal(terminalReplay.idempotent, true);
    assert.equal(terminalReplay.replacementAttempt.status, 'completed');
    assert.equal(fs.readFileSync(passContext.statePath, 'utf8'), passTerminalBytes);
    assert.deepEqual(
      passContext.runtime.getOpsAttemptResume(passStarted.opsAttemptResume.id)
        .opsAttemptResume,
      passStarted.opsAttemptResume,
    );

    const failContext = createContext('fail');
    const failActiveQa = await prepareActiveQa(failContext, async (input) => ({
      changedFiles: input.changedFiles,
      checks: [{ command: `node --check ${targetPath}`, passed: false }],
      mutationDetected: false,
      reasons: ['synthetic-node-check-failure'],
      verdict: 'failed',
    }));
    const failQuarantine = quarantineSource(failContext, failActiveQa);
    const failRequest = buildResumeRequest(failActiveQa, failQuarantine.disposition);
    const failStarted = failContext.runtime.resumeOpsAttemptFromSafeCheckpoint(
      failQuarantine.disposition.id,
      failRequest,
    );
    const failBundle = await settleResumedQa(failContext, failActiveQa, failStarted);
    assert.equal(failBundle.executionPlan.status, 'blocked');
    assert.equal(failBundle.executionPlan.stopReason, 'qa-failed');
    assert.equal(
      failBundle.workOrderAttempts.find(
        (attempt) => attempt.id === failStarted.replacementAttempt.id,
      ).status,
      'failed',
    );

    const apiContext = createContext('api');
    const apiActiveQa = await prepareActiveQa(apiContext);
    const apiQuarantine = quarantineSource(apiContext, apiActiveQa);
    const apiRequest = buildResumeRequest(apiActiveQa, apiQuarantine.disposition);
    downgradeToV27(apiContext.statePath);
    server = spawn(
      process.execPath,
      [
        path.join(repoRoot, 'scripts/serve-ui-slice-01.mjs'),
        '--port',
        String(port),
        '--runtime-root',
        apiContext.runtimeRoot,
      ],
      { cwd: repoRoot, env: { ...process.env }, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    await waitForServer(server);
    const apiCreated = await requestApi(
      `/api/ops/attempt-dispositions/${apiQuarantine.disposition.id}/resume-safe-checkpoint`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(apiRequest),
      },
    );
    assert.equal(apiCreated.response.status, 201);
    assert.equal(apiCreated.body.idempotent, false);
    assert.equal(apiCreated.body.status, 'delivery-ready');
    const apiResumeId = apiCreated.body.opsAttemptResume.id;
    const apiReplayBytes = fs.readFileSync(apiContext.statePath, 'utf8');
    const apiReplay = await requestApi(
      `/api/ops/attempt-dispositions/${apiQuarantine.disposition.id}/resume-safe-checkpoint`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(apiRequest),
      },
    );
    assert.equal(apiReplay.response.status, 200);
    assert.equal(apiReplay.body.idempotent, true);
    assert.equal(fs.readFileSync(apiContext.statePath, 'utf8'), apiReplayBytes);
    const apiExact = await requestApi(`/api/ops/attempt-resumes/${apiResumeId}`);
    assert.equal(apiExact.response.status, 200);
    assert.equal(apiExact.body.opsAttemptResume.id, apiResumeId);
    const apiMalformed = await requestApi(
      `/api/ops/attempt-dispositions/${apiQuarantine.disposition.id}/resume-safe-checkpoint`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...apiRequest, extra: true }),
      },
    );
    assert.equal(apiMalformed.response.status, 400);
    const apiMissing = await requestApi(
      '/api/ops/attempt-resumes/ops-attempt-resume-9999',
    );
    assert.equal(apiMissing.response.status, 404);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: 29,
      migrationFrom: 27,
      futureRejected: 30,
      contract: {
        requestKeys: OPS_ATTEMPT_RESUME_REQUEST_KEYS.length,
        recordKeys: OPS_ATTEMPT_RESUME_RECORD_KEYS.length,
        canonicalDigest: true,
        exactReplay: true,
        exactInspection: true,
      },
      execution: {
        sourceAttemptPreservedActive: true,
        replacementAttemptNumber: 2,
        passStopsAt: 'delivery-ready',
        failureStopsAt: 'qa-failed',
        shellFreeQaCallsPerResume: 1,
      },
      boundaries: {
        builderReviewerSpecialistResume: false,
        cancellationOrRetry: false,
        providerCalls: 0,
        sourceMutation: false,
        packageCloseOut: false,
        gitOrRelease: false,
        memoryOrScheduling: false,
      },
    }, null, 2)}\n`);
  } finally {
    if (server) {
      server.kill('SIGTERM');
      await Promise.race([
        new Promise((resolve) => server.once('exit', resolve)),
        delay(1000),
      ]);
    }
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

main().catch((error) => {
  process.stderr.write(`${JSON.stringify({
    ok: false,
    mode: MODE,
    error: error.message,
    stack: error.stack,
  }, null, 2)}\n`);
  process.exitCode = 1;
});
