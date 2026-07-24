import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import fileStoreModule from '../src/runtime/file-store.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createEmptyState } = contractsModule;
const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createFileStore } = fileStoreModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(
  repoRoot,
  'var',
  'runtime-ai-company-operator-stepped-workorder-scheduler-smoke',
);
const targetPath = 'src/runtime/runtime-service.js';
const MODE = 'ai-company-operator-stepped-workorder-scheduler-smoke';
const fixtureFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];
const councilAgentIds = [
  'agent-conductor',
  'agent-strategist',
  'agent-architect',
  'agent-decomposer',
];
const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['One bounded Builder, Reviewer, and QA evidence chain'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, commit, push, release, or retry'],
};

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'operator-stepped-resolved-local-stub',
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
    name: 'operator-stepped-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const marker = `operator-stepped ${request.approval.id}`;
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// ${marker}\n`;
      return {
        providerRunId: `operator-stepped-builder-${request.task.id}`,
        model: 'operator-stepped-targeted-local-stub-v1',
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
    selectedAgentIds: [...councilAgentIds],
    selectionRationale: 'Bind one exact local Council to the operator-stepped scheduler.',
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
        ? `'use strict';\n\nmodule.exports = { operatorSteppedReady: false };\n`
        : relativePath.endsWith('.md')
          ? '# Operator-stepped scheduler smoke fixture\n'
          : `'use strict';\n`,
    );
  }
}

function createRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
}

function createBoundContext(name, existing = null, goal = null) {
  const runtimeRoot = existing?.runtimeRoot || path.join(tempRoot, name, 'runtime');
  const projectPath = existing?.project.projectPath || path.join(tempRoot, name, 'project');
  if (!existing) writeProjectFixture(projectPath);
  const currentRuntime = existing?.runtime || createRuntime(runtimeRoot);
  if (!existing) currentRuntime.resetRuntime();
  const currentProject = existing?.project || currentRuntime.createProject({
    name: `Scheduler ${name}`,
    projectPath,
  });
  const mission = currentRuntime.createMission({
    projectId: currentProject.id,
    title: `Operator-stepped ${name}`,
    goal: goal || 'Execute Builder, Reviewer, and QA through separate operator commands.',
    constraints: 'Local only. No retry, rework, provider, Git, release, or background loop.',
  });
  const evaluatedAt = new Date().toISOString();
  const staffingSpec = createStaffingSpec();
  const staffingPreview = currentRuntime.previewMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
  });
  const accepted = currentRuntime.acceptMissionStaffingPlan({
    missionId: mission.id,
    staffingSpec,
    evaluatedAt,
    previewId: staffingPreview.id,
    previewDigest: staffingPreview.previewDigest,
    sourceDigest: staffingPreview.sourceDigest,
    missionDigest: staffingPreview.missionDigest,
    blueprintDigest: staffingPreview.blueprintDigest,
    staffingSpecDigest: staffingPreview.staffingSpecDigest,
    acceptance: {
      decision: 'accept',
      acknowledgement: 'reviewed-exact-staffing-plan-for-local-record',
      rationale: 'Accept this exact local Council staffing evidence.',
      reviewedAt: evaluatedAt,
    },
  });
  const staffingPlan = accepted.staffingPlan;
  const entered = currentRuntime.enterStaffingPlanCouncil({
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval: {
      decision: 'enter',
      acknowledgement: 'bind-exact-accepted-staffing-plan-to-local-council',
      rationale: 'Bind this exact accepted plan to one local Council.',
      requestedAt: new Date().toISOString(),
    },
  });
  currentRuntime.decideRealCouncilSession({
    councilSessionId: entered.councilSession.id,
    action: 'approve',
  });
  const beforePreview = fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8');
  const preview = currentRuntime.previewMissionWorkOrders({
    councilSessionId: entered.councilSession.id,
    compileSpec,
  });
  assert.equal(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'), beforePreview);
  const persisted = currentRuntime.persistMissionWorkOrderPlan({
    councilSessionId: entered.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  currentRuntime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  return {
    mission,
    persisted,
    preview,
    project: currentProject,
    runtime: currentRuntime,
    runtimeRoot,
    staffingEntry: entered.staffingEntry,
    staffingPlan,
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

async function prepareWaitingGate(context, coordinator) {
  const statePath = path.join(context.runtimeRoot, 'state.json');
  const beforeMalformedStart = fs.readFileSync(statePath, 'utf8');
  assert.throws(
    () =>
      context.runtime.beginSequentialWorkOrderExecution({
        executionPlanId: context.persisted.executionPlan.id,
        approvalId: context.persisted.approval.id,
        unexpected: true,
      }),
    /unexpected or missing fields/,
  );
  assert.equal(fs.readFileSync(statePath, 'utf8'), beforeMalformedStart);
  const started = context.runtime.beginSequentialWorkOrderExecution({
    executionPlanId: context.persisted.executionPlan.id,
    approvalId: context.persisted.approval.id,
  });
  assert.equal(started.idempotent, false);
  assert.equal(started.workOrderAttempt.status, 'active');
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(context.runtimeRoot, 'state.json'))).workOrderAttempts[
      started.workOrderAttempt.id
    ].status,
    'active',
  );
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
  const stopped = context.runtime.finalizeSequentialWorkOrderExecution({
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
  assert.equal(stopped.latestWorkOrderAttempt.status, 'waiting-gate');
  assert.equal(stopped.workOrderAttempts.length, 1);
  const replay = context.runtime.beginSequentialWorkOrderExecution({
    executionPlanId: context.persisted.executionPlan.id,
    approvalId: context.persisted.approval.id,
  });
  assert.equal(replay.idempotent, true);
  assert.equal(replay.workOrderAttempts.length, 1);
  return { stopped, task, terminalApproval };
}

async function runThroughBuilder(context) {
  const coordinator = createExecutionCoordinator({
    repoRoot,
    runtimeService: context.runtime,
    providerAdapter: createTargetedProviderAdapter(),
  });
  const gate = await prepareWaitingGate(context, coordinator);
  context.runtime.resolveDecisionInboxItem({
    itemId: gate.terminalApproval.inboxItemId,
    action: 'approved',
  });

  let bundle = context.runtime.getExecutionPlan(context.persisted.executionPlan.id);
  const builderInput = buildStepInput(
    bundle,
    'continue-builder',
    gate.terminalApproval.id,
  );
  const builderStarted = context.runtime.beginOperatorSteppedWorkOrderStep(builderInput);
  assert.equal(builderStarted.workOrderAttempt.status, 'active');
  const builder = await coordinator.runBuilderLiveMutation({ taskId: gate.task.id });
  bundle = context.runtime.completeReviewedDeliveryBuilder({
    executionPlanId: bundle.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  assert.equal(bundle.latestWorkOrderAttempt.status, 'completed');
  assert.equal(bundle.latestCheckpoint.stage, 'reviewer-ready');
  assert.equal(bundle.workOrders.find((entry) => entry.role === 'reviewer').status, 'queued');
  return { bundle, coordinator, gate };
}

async function runPassPath(context) {
  let { bundle, coordinator, gate } = await runThroughBuilder(context);

  const reviewerInput = buildStepInput(bundle, 'run-reviewer');
  const reviewerStarted = context.runtime.beginOperatorSteppedWorkOrderStep(reviewerInput);
  assert.equal(reviewerStarted.workOrderAttempt.role, 'reviewer');
  const reviewer = await coordinator.runReviewer({ taskId: gate.task.id });
  bundle = context.runtime.completeReviewedDeliveryReviewer({
    executionPlanId: bundle.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  assert.equal(bundle.latestWorkOrderAttempt.status, 'completed');
  assert.equal(bundle.latestCheckpoint.stage, 'qa-ready');
  assert.equal(bundle.workOrders.find((entry) => entry.role === 'qa').status, 'queued');

  const qaInput = buildStepInput(bundle, 'run-qa');
  const qaStarted = context.runtime.beginOperatorSteppedWorkOrderStep(qaInput);
  assert.equal(qaStarted.workOrderAttempt.role, 'qa');
  const byRole = Object.fromEntries(
    qaStarted.workOrders.map((workOrder) => [workOrder.role, workOrder]),
  );
  const qa = await coordinator.runQaWorkOrder({
    taskId: gate.task.id,
    executionPlanId: bundle.executionPlan.id,
    workOrderId: byRole.qa.id,
    builderRunId: byRole.builder.completionRunId,
    reviewerRunId: byRole.reviewer.completionRunId,
    sourceDigest: bundle.executionPlan.sourceDigest,
    changedFiles: byRole.builder.changedFiles,
    targetPathAllowlist: byRole.qa.targetPathAllowlist,
    commands: byRole.qa.verificationCommands,
  });
  bundle = context.runtime.completeReviewedDeliveryQa({
    executionPlanId: bundle.executionPlan.id,
    runId: qa.run.id,
    qaEvidenceArtifactId: qa.artifact.id,
  });
  assert.equal(bundle.executionPlan.status, 'delivery-ready');
  assert.equal(bundle.latestCheckpoint.stage, 'delivery-ready');
  assert.deepEqual(
    bundle.workOrderAttempts.map((attempt) => [attempt.action, attempt.status]),
    [
      ['start-builder', 'waiting-gate'],
      ['continue-builder', 'completed'],
      ['run-reviewer', 'completed'],
      ['run-qa', 'completed'],
    ],
  );
  const replay = context.runtime.beginOperatorSteppedWorkOrderStep(qaInput);
  assert.equal(replay.idempotent, true);
  assert.equal(replay.workOrderAttempts.length, 4);
  const inspected = context.runtime.getWorkOrderAttempt(bundle.latestWorkOrderAttempt.id);
  assert.equal(inspected.persisted, true);
  assert.equal(inspected.workOrderAttempt.recordDigest, bundle.latestWorkOrderAttempt.recordDigest);
  return bundle;
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const migrationRoot = path.join(tempRoot, 'migration');
    fs.mkdirSync(migrationRoot, { recursive: true });
    const schemaV18 = createEmptyState();
    schemaV18.schemaVersion = 18;
    delete schemaV18.sequences.workOrderAttempt;
    delete schemaV18.workOrderAttempts;
    fs.writeFileSync(path.join(migrationRoot, 'state.json'), JSON.stringify(schemaV18));
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 19);
    assert.equal(migrated.sequences.workOrderAttempt, 0);
    assert.deepEqual(migrated.workOrderAttempts, {});

    const futureRoot = path.join(tempRoot, 'future');
    fs.mkdirSync(futureRoot, { recursive: true });
    const future = createEmptyState();
    future.schemaVersion = 20;
    fs.writeFileSync(path.join(futureRoot, 'state.json'), JSON.stringify(future));
    assert.throws(
      () => createFileStore({ runtimeRoot: futureRoot }).loadState(),
      /Unsupported runtime state schemaVersion: 20/,
    );

    const success = createBoundContext('success');
    const finalBundle = await runPassPath(success);
    const reloaded = createRuntime(success.runtimeRoot).getExecutionPlan(
      finalBundle.executionPlan.id,
    );
    assert.equal(reloaded.workOrderAttempts.length, 4);
    assert.equal(reloaded.latestWorkOrderAttempt.status, 'completed');

    const stale = createBoundContext('stale');
    const staleStatePath = path.join(stale.runtimeRoot, 'state.json');
    const staleState = JSON.parse(fs.readFileSync(staleStatePath));
    staleState.missions[stale.mission.id].goal = 'Divergent mission source';
    fs.writeFileSync(staleStatePath, JSON.stringify(staleState));
    assert.throws(
      () =>
        stale.runtime.beginSequentialWorkOrderExecution({
          executionPlanId: stale.persisted.executionPlan.id,
          approvalId: stale.persisted.approval.id,
        }),
      /stale source digest/,
    );

    const interrupted = createBoundContext('interrupted');
    const interruptedCoordinator = createExecutionCoordinator({
      repoRoot,
      runtimeService: interrupted.runtime,
      providerAdapter: createTargetedProviderAdapter(),
    });
    const interruptedGate = await prepareWaitingGate(interrupted, interruptedCoordinator);
    interrupted.runtime.resolveDecisionInboxItem({
      itemId: interruptedGate.terminalApproval.inboxItemId,
      action: 'approved',
    });
    const interruptedInput = buildStepInput(
      interrupted.runtime.getExecutionPlan(interrupted.persisted.executionPlan.id),
      'continue-builder',
      interruptedGate.terminalApproval.id,
    );
    interrupted.runtime.beginOperatorSteppedWorkOrderStep(interruptedInput);
    const interruptedReloaded = createRuntime(interrupted.runtimeRoot);
    assert.throws(
      () =>
        interruptedReloaded.beginOperatorSteppedWorkOrderStep(interruptedInput),
      /active and requires separately authorized recovery/,
    );
    interrupted.runtime.failReviewedDeliveryContinuation({
      executionPlanId: interrupted.persisted.executionPlan.id,
      reason: 'synthetic-coordinator-failure',
      stoppedAt: 'builder',
    });
    const failed = interrupted.runtime.getExecutionPlan(interrupted.persisted.executionPlan.id);
    assert.equal(failed.latestWorkOrderAttempt.status, 'failed');
    assert.equal(failed.executionPlan.status, 'blocked');

    const changesRequested = createBoundContext(
      'changes-requested',
      null,
      'Execute separate role commands and request changes during review.',
    );
    let changesFlow = await runThroughBuilder(changesRequested);
    const changesReviewerInput = buildStepInput(changesFlow.bundle, 'run-reviewer');
    changesRequested.runtime.beginOperatorSteppedWorkOrderStep(changesReviewerInput);
    const changesReviewer = await changesFlow.coordinator.runReviewer({
      taskId: changesFlow.gate.task.id,
    });
    const changesBundle = changesRequested.runtime.completeReviewedDeliveryReviewer({
      executionPlanId: changesFlow.bundle.executionPlan.id,
      runId: changesReviewer.run.id,
      reviewArtifactId: changesReviewer.artifact.id,
      reviewStatus: changesReviewer.run.summary.mappedReviewStatus,
      decisionInboxItemId: changesReviewer.decisionInboxItem?.id || null,
    });
    assert.equal(changesBundle.latestWorkOrderAttempt.status, 'changes-requested');
    assert.equal(changesBundle.executionPlan.status, 'blocked');
    assert.equal(
      changesBundle.workOrderAttempts.some((attempt) => attempt.action === 'run-qa'),
      false,
    );

    const qaFailed = createBoundContext('qa-failed');
    let qaFailureFlow = await runThroughBuilder(qaFailed);
    const qaFailureReviewerInput = buildStepInput(qaFailureFlow.bundle, 'run-reviewer');
    qaFailed.runtime.beginOperatorSteppedWorkOrderStep(qaFailureReviewerInput);
    const qaFailureReviewer = await qaFailureFlow.coordinator.runReviewer({
      taskId: qaFailureFlow.gate.task.id,
    });
    qaFailureFlow.bundle = qaFailed.runtime.completeReviewedDeliveryReviewer({
      executionPlanId: qaFailureFlow.bundle.executionPlan.id,
      runId: qaFailureReviewer.run.id,
      reviewArtifactId: qaFailureReviewer.artifact.id,
      reviewStatus: qaFailureReviewer.run.summary.mappedReviewStatus,
      decisionInboxItemId: qaFailureReviewer.decisionInboxItem?.id || null,
    });
    const qaFailureInput = buildStepInput(qaFailureFlow.bundle, 'run-qa');
    const qaFailureStarted = qaFailed.runtime.beginOperatorSteppedWorkOrderStep(qaFailureInput);
    fs.writeFileSync(
      path.join(qaFailed.project.projectPath, targetPath),
      `'use strict';\nconst = ;\n`,
    );
    const qaFailureByRole = Object.fromEntries(
      qaFailureStarted.workOrders.map((workOrder) => [workOrder.role, workOrder]),
    );
    const qaFailureResult = await qaFailureFlow.coordinator.runQaWorkOrder({
      taskId: qaFailureFlow.gate.task.id,
      executionPlanId: qaFailureFlow.bundle.executionPlan.id,
      workOrderId: qaFailureByRole.qa.id,
      builderRunId: qaFailureByRole.builder.completionRunId,
      reviewerRunId: qaFailureByRole.reviewer.completionRunId,
      sourceDigest: qaFailureFlow.bundle.executionPlan.sourceDigest,
      changedFiles: qaFailureByRole.builder.changedFiles,
      targetPathAllowlist: qaFailureByRole.qa.targetPathAllowlist,
      commands: qaFailureByRole.qa.verificationCommands,
    });
    const qaFailureBundle = qaFailed.runtime.completeReviewedDeliveryQa({
      executionPlanId: qaFailureFlow.bundle.executionPlan.id,
      runId: qaFailureResult.run.id,
      qaEvidenceArtifactId: qaFailureResult.artifact.id,
    });
    assert.equal(qaFailureBundle.latestWorkOrderAttempt.status, 'failed');
    assert.equal(qaFailureBundle.executionPlan.status, 'blocked');
    assert.equal(qaFailureBundle.executionPlan.stopReason, 'qa-failed');

    const overlapFirst = createBoundContext('overlap');
    const overlapSecond = createBoundContext('overlap-second', overlapFirst);
    overlapFirst.runtime.beginSequentialWorkOrderExecution({
      executionPlanId: overlapFirst.persisted.executionPlan.id,
      approvalId: overlapFirst.persisted.approval.id,
    });
    const overlapStatePath = path.join(overlapFirst.runtimeRoot, 'state.json');
    const beforeOverlap = fs.readFileSync(overlapStatePath, 'utf8');
    assert.throws(
      () =>
        overlapFirst.runtime.beginSequentialWorkOrderExecution({
          executionPlanId: overlapSecond.persisted.executionPlan.id,
          approvalId: overlapSecond.persisted.approval.id,
        }),
      /overlaps active attempt/,
    );
    assert.equal(fs.readFileSync(overlapStatePath, 'utf8'), beforeOverlap);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schema: {
        version: 19,
        migrationFrom: 18,
        futureRejected: 20,
      },
      scheduler: {
        attemptCount: finalBundle.workOrderAttempts.length,
        actions: finalBundle.workOrderAttempts.map((attempt) => attempt.action),
        oneRolePerCommand: true,
        activeBeforeCoordinator: true,
        exactReplay: true,
        exactInspection: true,
        malformedStartNoWrite: true,
        interruptedActiveBlocks: true,
        changesRequestedStops: true,
        qaFailureStops: true,
        overlappingBuilderTargetsBlock: true,
      },
      boundaries: {
        providerMode: 'local-stub',
        retry: false,
        rework: false,
        background: false,
        commit: false,
        push: false,
        release: false,
      },
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
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
