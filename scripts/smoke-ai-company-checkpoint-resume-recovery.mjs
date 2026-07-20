import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import fileStoreModule from '../src/runtime/file-store.js';
import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createEmptyState } = contractsModule;
const { createFileStore } = fileStoreModule;
const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-checkpoint-recovery-smoke');
const targetPath = 'src/runtime/runtime-service.js';
const MODE = 'ai-company-checkpoint-resume-recovery-smoke';
const projectFiles = [
  'prompts/builder.md',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  targetPath,
  'scripts/smoke-execution-slice-05.mjs',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['Builder mutation, review, and QA evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, commit, push, or release'],
};

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'checkpoint-recovery-council-local-stub',
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
    name: 'checkpoint-recovery-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// checkpoint-recovery ${request.approval.id}\n`;
      return {
        providerRunId: `checkpoint-recovery-builder-${request.task.id}`,
        model: 'checkpoint-recovery-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded syntax-safe fixture update.',
        },
        outputText: `# Builder Live Mutation: ${request.task.title}\n\n## Change Summary\n- prepared file updates: 1\n\n## Target Files\n- ${targetPath}\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content, 'utf8').toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
  };
}

function openRuntime(runtimeRoot) {
  return createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
}

function openCoordinator(runtime) {
  return createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    providerAdapter: createTargetedProviderAdapter(),
  });
}

function createContext(name) {
  const root = path.join(tempRoot, name);
  const runtimeRoot = path.join(root, 'runtime');
  const projectPath = path.join(root, 'project');
  for (const relativePath of projectFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath === targetPath
        ? `'use strict';\n\nmodule.exports = { checkpointRecoveryReady: false };\n`
        : relativePath.endsWith('.md')
          ? '# Checkpoint recovery smoke fixture\n'
          : `'use strict';\n`,
    );
  }
  const runtime = openRuntime(runtimeRoot);
  runtime.resetRuntime();
  const project = runtime.createProject({ name, projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Checkpoint recovery ${name}`,
    goal: 'Prove one exact durable reviewed-delivery recovery path.',
    constraints: 'Local stub only. No automatic retry, commit, push, release, or Mission done.',
  });
  const started = runtime.startRealCouncilForMission({
    missionId: mission.id,
    mode: 'real-local-stub',
  });
  runtime.decideRealCouncilSession({
    councilSessionId: started.councilSession.id,
    action: 'approve',
  });
  const preview = runtime.previewMissionWorkOrders({
    councilSessionId: started.councilSession.id,
    compileSpec,
  });
  const persisted = runtime.persistMissionWorkOrderPlan({
    councilSessionId: started.councilSession.id,
    compileSpec,
    previewId: preview.previewId,
    sourceDigest: preview.sourceDigest,
  });
  runtime.resolveDecisionInboxItem({
    itemId: persisted.approval.inboxItemId,
    action: 'approved',
  });
  return {
    persisted,
    projectPath,
    runtime,
    runtimeRoot,
    coordinator: openCoordinator(runtime),
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

async function prepareBuilderWaitingGate(context) {
  const { runtime, coordinator, persisted } = context;
  const started = runtime.beginSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    approvalId: persisted.approval.id,
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
  const approval = runtime.requestBuilderLiveMutationApproval({ taskId: task.id });
  runtime.finalizeSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    workOrderId: started.executionPlan.activeWorkOrderId,
    stageResults: [
      stageRecord('planner', planner),
      stageRecord('architect', architect),
      stageRecord('task-breaker', taskBreaker),
      stageRecord('builder-preflight', preflight),
      stageRecord('request-builder-live-mutation-approval', {
        approval,
        item: runtime.getDecisionInboxItem(approval.inboxItemId),
      }),
    ],
    stopReason: 'waiting-approval',
    stoppedAt: 'request-builder-live-mutation-approval',
    terminalGateApprovalId: approval.id,
  });
  return { approval, task };
}

async function prepareReviewerReady(context) {
  const gate = await prepareBuilderWaitingGate(context);
  const { runtime, coordinator, persisted } = context;
  runtime.resolveDecisionInboxItem({ itemId: gate.approval.inboxItemId, action: 'approved' });
  runtime.beginReviewedDeliveryContinuation({
    executionPlanId: persisted.executionPlan.id,
    terminalGateApprovalId: gate.approval.id,
    sourceDigest: persisted.executionPlan.sourceDigest,
  });
  const builder = await coordinator.runBuilderLiveMutation({ taskId: gate.task.id });
  runtime.completeReviewedDeliveryBuilder({
    executionPlanId: persisted.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  return { builder, gate };
}

function exactCheckpointInput(executionPlanId, recovery, action) {
  const checkpoint = recovery.checkpoint || recovery;
  return {
    executionPlanId,
    checkpointId: checkpoint.id,
    checkpointDigest: checkpoint.checkpointDigest,
    inputDigest: checkpoint.inputDigest,
    authorityDigest: checkpoint.authorityDigest,
    action,
  };
}

function asSchemaV7(state) {
  const legacy = JSON.parse(JSON.stringify(state));
  legacy.schemaVersion = 7;
  delete legacy.sequences.workflowCheckpoint;
  delete legacy.workflowCheckpoints;
  for (const executionPlan of Object.values(legacy.executionPlans)) {
    delete executionPlan.checkpointRefs;
    delete executionPlan.latestCheckpointId;
  }
  return legacy;
}

async function completeResumedReviewer(context, resumed) {
  const coordinator = openCoordinator(context.runtime);
  const reviewer = await coordinator.runReviewer({ taskId: resumed.controlTask.id });
  const bundle = context.runtime.completeReviewedDeliveryReviewer({
    executionPlanId: resumed.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  return { bundle, reviewer };
}

async function main() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const migrationRoot = path.join(tempRoot, 'migration');
    fs.mkdirSync(migrationRoot, { recursive: true });
    const v7 = createEmptyState();
    v7.schemaVersion = 7;
    delete v7.sequences.workflowCheckpoint;
    delete v7.workflowCheckpoints;
    fs.writeFileSync(path.join(migrationRoot, 'state.json'), JSON.stringify(v7));
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 12);
    assert.equal(migrated.sequences.workflowCheckpoint, 0);
    assert.deepEqual(migrated.workflowCheckpoints, {});
    assert.equal(
      JSON.parse(fs.readFileSync(path.join(migrationRoot, 'state.json'), 'utf8')).schemaVersion,
      12,
    );

    const populatedMigration = createContext('populated-migration');
    const populatedStatePath = path.join(populatedMigration.runtimeRoot, 'state.json');
    const populatedV7 = asSchemaV7(JSON.parse(fs.readFileSync(populatedStatePath, 'utf8')));
    fs.writeFileSync(populatedStatePath, `${JSON.stringify(populatedV7, null, 2)}\n`);
    const populatedMigrated = createFileStore({
      runtimeRoot: populatedMigration.runtimeRoot,
    }).loadState();
    assert.equal(populatedMigrated.schemaVersion, 12);
    assert.deepEqual(asSchemaV7(populatedMigrated), populatedV7);
    assert.deepEqual(
      JSON.parse(fs.readFileSync(populatedStatePath, 'utf8')),
      populatedMigrated,
    );

    for (const [name, state, pattern] of [
      ['partial-v8', (() => {
        const value = createEmptyState();
        delete value.workflowCheckpoints;
        return value;
      })(), /missing WorkflowCheckpoint fields/],
      ['future-v13', { ...createEmptyState(), schemaVersion: 13 }, /Unsupported runtime state/],
    ]) {
      const root = path.join(tempRoot, name);
      fs.mkdirSync(root, { recursive: true });
      fs.writeFileSync(path.join(root, 'state.json'), JSON.stringify(state));
      assert.throws(() => createFileStore({ runtimeRoot: root }).loadState(), pattern);
    }

    const v7Reviewer = createContext('v7-reviewer-ready');
    const v7ReviewerBuilder = await prepareReviewerReady(v7Reviewer);
    const v7ReviewerPlanId = v7Reviewer.persisted.executionPlan.id;
    const v7ReviewerStatePath = path.join(v7Reviewer.runtimeRoot, 'state.json');
    fs.writeFileSync(
      v7ReviewerStatePath,
      `${JSON.stringify(
        asSchemaV7(JSON.parse(fs.readFileSync(v7ReviewerStatePath, 'utf8'))),
        null,
        2,
      )}\n`,
    );
    const migratedReviewerRuntime = openRuntime(v7Reviewer.runtimeRoot);
    const migratedReviewerRecovery = migratedReviewerRuntime.getExecutionPlanRecovery(
      v7ReviewerPlanId,
    );
    assert.equal(migratedReviewerRecovery.classification, 'ready');
    assert.equal(migratedReviewerRecovery.checkpoint.stage, 'reviewer-ready');
    assert.equal(migratedReviewerRecovery.checkpoint.attempt, 1);
    const migratedReviewerResume = migratedReviewerRuntime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(v7ReviewerPlanId, migratedReviewerRecovery, 'resume-reviewer'),
    );
    assert.equal(migratedReviewerResume.resumeStage, 'reviewer');
    assert.equal(
      migratedReviewerResume.workOrders.find((entry) => entry.role === 'builder').completionRunId,
      v7ReviewerBuilder.builder.run.id,
    );

    const v7Qa = createContext('v7-qa-ready');
    await prepareReviewerReady(v7Qa);
    const v7QaPlanId = v7Qa.persisted.executionPlan.id;
    const v7QaReviewerReady = v7Qa.runtime.getExecutionPlanRecovery(v7QaPlanId);
    const v7QaReviewer = v7Qa.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(v7QaPlanId, v7QaReviewerReady, 'resume-reviewer'),
    );
    await completeResumedReviewer(v7Qa, v7QaReviewer);
    const v7QaStatePath = path.join(v7Qa.runtimeRoot, 'state.json');
    fs.writeFileSync(
      v7QaStatePath,
      `${JSON.stringify(asSchemaV7(JSON.parse(fs.readFileSync(v7QaStatePath, 'utf8'))), null, 2)}\n`,
    );
    const migratedQaRuntime = openRuntime(v7Qa.runtimeRoot);
    const migratedQaRecovery = migratedQaRuntime.getExecutionPlanRecovery(v7QaPlanId);
    assert.equal(migratedQaRecovery.classification, 'ready');
    assert.equal(migratedQaRecovery.checkpoint.stage, 'qa-ready');
    assert.equal(migratedQaRecovery.checkpoint.attempt, 1);
    assert.equal(
      migratedQaRuntime.resumeExecutionPlanFromCheckpoint(
        exactCheckpointInput(v7QaPlanId, migratedQaRecovery, 'resume-qa'),
      ).resumeStage,
      'qa',
    );

    const success = createContext('restart-success');
    const { builder } = await prepareReviewerReady(success);
    const executionPlanId = success.persisted.executionPlan.id;
    let recovery = success.runtime.getExecutionPlanRecovery(executionPlanId);
    assert.equal(recovery.classification, 'ready');
    assert.equal(recovery.checkpoint.stage, 'reviewer-ready');
    assert.deepEqual(recovery.nextAllowedActions, ['resume-reviewer']);
    const beforeInvalid = fs.readFileSync(path.join(success.runtimeRoot, 'state.json'), 'utf8');
    assert.throws(
      () => success.runtime.resumeExecutionPlanFromCheckpoint({
        ...exactCheckpointInput(executionPlanId, recovery, 'resume-reviewer'),
        inputDigest: '0'.repeat(64),
      }),
      /inputDigest/,
    );
    assert.equal(fs.readFileSync(path.join(success.runtimeRoot, 'state.json'), 'utf8'), beforeInvalid);

    success.runtime = openRuntime(success.runtimeRoot);
    let resumed = success.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(executionPlanId, recovery, 'resume-reviewer'),
    );
    assert.equal(resumed.resumeStage, 'reviewer');
    assert.equal(resumed.workOrders.find((entry) => entry.role === 'builder').completionRunId, builder.run.id);
    const reviewerResult = await completeResumedReviewer(success, resumed);
    recovery = success.runtime.getExecutionPlanRecovery(executionPlanId);
    assert.equal(recovery.checkpoint.stage, 'qa-ready');
    assert.equal(recovery.checkpoint.resumedFromCheckpointId, resumed.checkpoint.id);
    assert.deepEqual(recovery.nextAllowedActions, ['resume-qa']);
    const runCountAfterReviewer = Object.keys(success.runtime.getSnapshot().runs).length;
    const repeatedReviewer = success.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(executionPlanId, resumed.checkpoint, 'resume-reviewer'),
    );
    assert.equal(repeatedReviewer.idempotent, true);
    assert.equal(Object.keys(success.runtime.getSnapshot().runs).length, runCountAfterReviewer);
    assert.throws(
      () => success.runtime.resumeExecutionPlanFromCheckpoint(
        exactCheckpointInput(executionPlanId, resumed.checkpoint, 'resume-qa'),
      ),
      /does not allow action resume-qa/,
    );

    success.runtime = openRuntime(success.runtimeRoot);
    resumed = success.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(executionPlanId, recovery, 'resume-qa'),
    );
    assert.equal(resumed.resumeStage, 'qa');
    const byRole = Object.fromEntries(resumed.workOrders.map((entry) => [entry.role, entry]));
    const qa = await openCoordinator(success.runtime).runQaWorkOrder({
      taskId: resumed.controlTask.id,
      executionPlanId,
      workOrderId: byRole.qa.id,
      builderRunId: byRole.builder.completionRunId,
      reviewerRunId: byRole.reviewer.completionRunId,
      sourceDigest: resumed.executionPlan.sourceDigest,
      changedFiles: byRole.builder.changedFiles,
      targetPathAllowlist: byRole.qa.targetPathAllowlist,
      commands: byRole.qa.verificationCommands,
    });
    const delivered = success.runtime.completeReviewedDeliveryQa({
      executionPlanId,
      runId: qa.run.id,
      qaEvidenceArtifactId: qa.artifact.id,
    });
    assert.equal(delivered.executionPlan.status, 'delivery-ready');
    recovery = success.runtime.getExecutionPlanRecovery(executionPlanId);
    assert.equal(recovery.classification, 'terminal');
    assert.equal(recovery.checkpoint.stage, 'delivery-ready');
    assert.equal(recovery.checkpoint.resumedFromCheckpointId, resumed.checkpoint.id);
    assert.equal(success.runtime.previewExecutionPlanDelivery({ executionPlanId }).persisted, false);
    assert.equal(success.runtime.getMission(delivered.mission.id).status, 'executing');

    const cancelled = createContext('cancelled');
    await prepareReviewerReady(cancelled);
    const cancelledPlanId = cancelled.persisted.executionPlan.id;
    const cancellable = cancelled.runtime.getExecutionPlanRecovery(cancelledPlanId);
    const cancelledResult = cancelled.runtime.cancelExecutionPlanCheckpoint({
      ...exactCheckpointInput(cancelledPlanId, cancellable, 'resume-reviewer'),
      reason: 'operator-cancelled-focused-smoke',
    });
    assert.equal(cancelledResult.checkpoint.status, 'cancelled');
    const cancelledReload = openRuntime(cancelled.runtimeRoot);
    assert.equal(cancelledReload.getExecutionPlanRecovery(cancelledPlanId).classification, 'cancelled');
    assert.throws(
      () => cancelledReload.resumeExecutionPlanFromCheckpoint(
        exactCheckpointInput(cancelledPlanId, cancellable, 'resume-reviewer'),
      ),
      /not the current ready checkpoint/,
    );

    const authorityDrift = createContext('authority-drift');
    await prepareReviewerReady(authorityDrift);
    const driftPlanId = authorityDrift.persisted.executionPlan.id;
    const driftStatePath = path.join(authorityDrift.runtimeRoot, 'state.json');
    const driftState = JSON.parse(fs.readFileSync(driftStatePath, 'utf8'));
    const reviewerWorkOrder = Object.values(driftState.workOrders).find(
      (entry) => entry.executionPlanId === driftPlanId && entry.role === 'reviewer',
    );
    reviewerWorkOrder.authority.executeAllowed = false;
    fs.writeFileSync(driftStatePath, `${JSON.stringify(driftState, null, 2)}\n`);
    const staleRuntime = openRuntime(authorityDrift.runtimeRoot);
    const staleRecovery = staleRuntime.getExecutionPlanRecovery(driftPlanId);
    assert.equal(staleRecovery.classification, 'stale');
    assert.equal(staleRecovery.nextAllowedActions.length, 0);

    const activeBuilder = createContext('active-builder');
    const activeBuilderGate = await prepareBuilderWaitingGate(activeBuilder);
    const builderWaitingRecovery = activeBuilder.runtime.getExecutionPlanRecovery(
      activeBuilder.persisted.executionPlan.id,
    );
    const builderWaitingState = fs.readFileSync(
      path.join(activeBuilder.runtimeRoot, 'state.json'),
      'utf8',
    );
    assert.throws(
      () => activeBuilder.runtime.cancelExecutionPlanCheckpoint({
        ...exactCheckpointInput(
          activeBuilder.persisted.executionPlan.id,
          builderWaitingRecovery,
          'resume-reviewer',
        ),
        reason: 'must-not-cancel-builder-waiting-gate',
      }),
      /stage is not cancellable/,
    );
    assert.equal(
      fs.readFileSync(path.join(activeBuilder.runtimeRoot, 'state.json'), 'utf8'),
      builderWaitingState,
    );
    activeBuilder.runtime.resolveDecisionInboxItem({
      itemId: activeBuilderGate.approval.inboxItemId,
      action: 'approved',
    });
    activeBuilder.runtime.beginReviewedDeliveryContinuation({
      executionPlanId: activeBuilder.persisted.executionPlan.id,
      terminalGateApprovalId: activeBuilderGate.approval.id,
      sourceDigest: activeBuilder.persisted.executionPlan.sourceDigest,
    });
    const quarantinedBuilder = openRuntime(activeBuilder.runtimeRoot).getExecutionPlanRecovery(
      activeBuilder.persisted.executionPlan.id,
    );
    assert.equal(quarantinedBuilder.classification, 'quarantined');
    assert.equal(quarantinedBuilder.stopReason, 'active-builder-stage-is-ambiguous');
    assert.equal(quarantinedBuilder.nextAllowedActions.length, 0);

    const activeReviewer = createContext('active-reviewer');
    await prepareReviewerReady(activeReviewer);
    const activePlanId = activeReviewer.persisted.executionPlan.id;
    const ready = activeReviewer.runtime.getExecutionPlanRecovery(activePlanId);
    activeReviewer.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(activePlanId, ready, 'resume-reviewer'),
    );
    const quarantined = openRuntime(activeReviewer.runtimeRoot).getExecutionPlanRecovery(activePlanId);
    assert.equal(quarantined.classification, 'quarantined');
    assert.equal(quarantined.stopReason, 'active-reviewer-stage-is-ambiguous');
    assert.equal(quarantined.nextAllowedActions.length, 0);

    const activeQa = createContext('active-qa');
    await prepareReviewerReady(activeQa);
    const activeQaPlanId = activeQa.persisted.executionPlan.id;
    const qaReviewerReady = activeQa.runtime.getExecutionPlanRecovery(activeQaPlanId);
    const activeQaReviewer = activeQa.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(activeQaPlanId, qaReviewerReady, 'resume-reviewer'),
    );
    await completeResumedReviewer(activeQa, activeQaReviewer);
    const qaReady = activeQa.runtime.getExecutionPlanRecovery(activeQaPlanId);
    activeQa.runtime.resumeExecutionPlanFromCheckpoint(
      exactCheckpointInput(activeQaPlanId, qaReady, 'resume-qa'),
    );
    const quarantinedQa = openRuntime(activeQa.runtimeRoot).getExecutionPlanRecovery(activeQaPlanId);
    assert.equal(quarantinedQa.classification, 'quarantined');
    assert.equal(quarantinedQa.stopReason, 'active-qa-stage-is-ambiguous');
    assert.equal(quarantinedQa.nextAllowedActions.length, 0);

    const persistedState = JSON.parse(
      fs.readFileSync(path.join(success.runtimeRoot, 'state.json'), 'utf8'),
    );
    assert.equal(persistedState.schemaVersion, 12);
    assert.equal(Object.keys(persistedState.workflowCheckpoints).length, 4);
    assert.equal(persistedState.executionPlans[executionPlanId].checkpointRefs.length, 4);
    assert.deepEqual(persistedState.deliveryPackages, {});
    assert.deepEqual(persistedState.executionPlans[executionPlanId].deliveryPackageRefs, []);
    assert.equal(persistedState.executionPlans[executionPlanId].latestDeliveryPackageId, null);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schema: {
        version: 12,
        v7Migration: true,
        partialAndFutureRejected: true,
        rollbackRetention: true,
      },
      recovery: {
        boundaries: ['builder-waiting-gate', 'reviewer-ready', 'qa-ready', 'delivery-ready'],
        resumedStages: ['reviewer', 'qa'],
        staleRefused: true,
        cancellationRetained: true,
        activeStagesQuarantined: ['builder', 'reviewer', 'qa'],
        duplicateRuns: false,
        attemptHistory: persistedState.executionPlans[executionPlanId].checkpointRefs.length,
      },
      blocked: ['builder-replay', 'auto-retry', 'provider-workorders', 'delivery-package-rejection', 'mission-done', 'commit', 'push', 'release'],
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
