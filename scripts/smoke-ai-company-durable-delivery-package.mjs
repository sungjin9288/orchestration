import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = process.env.ORCHESTRATION_DURABLE_DELIVERY_TEMP_ROOT ||
  path.join(repoRoot, 'var', 'runtime-ai-company-durable-delivery-package-smoke');
const targetPath = 'src/runtime/runtime-service.js';
const MODE = 'ai-company-durable-delivery-package-smoke';
const keepFixture = process.env.ORCHESTRATION_DURABLE_DELIVERY_KEEP_FIXTURE === '1';
const seedOnly = process.env.ORCHESTRATION_DURABLE_DELIVERY_SEED_ONLY === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: [targetPath],
  expectedArtifacts: ['Builder mutation, independent review, and QA evidence'],
  verificationCommands: [`node --check ${targetPath}`],
  stopConditions: ['Stop before Mission done, task close-out, commit, push, release, or learning'],
};

function createResolvedCouncilAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'durable-delivery-resolved-local-stub',
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
    name: 'durable-delivery-targeted-local-stub',
    async execute(request) {
      if (request.role !== 'builder' || request.executionMode !== 'live-mutation') {
        return base.execute(request);
      }
      const absoluteTarget = path.join(request.project.projectPath, targetPath);
      const content = `${fs.readFileSync(absoluteTarget, 'utf8').trimEnd()}\n// durable delivery fixture\n`;
      return {
        providerRunId: `durable-delivery-builder-${request.task.id}`,
        model: 'durable-delivery-targeted-local-stub-v1',
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'reviewer',
          summary: 'Prepared one bounded syntax-safe update.',
        },
        outputText: `# Builder Live Mutation\n\n## Change Summary\n- prepared file updates: 1\n\n## Target Files\n- ${targetPath}\n\n## File Updates\n### ${targetPath}\n\`\`\`base64\n${Buffer.from(content).toString('base64')}\n\`\`\`\n`,
        usage: { inputTokens: 0, outputTokens: 0 },
      };
    },
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

function createContext() {
  const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
  const projectPath = path.join(tempRoot, 'source', 'project');
  const fixtureFiles = [
    'prompts/builder.md',
    'src/execution/execution-coordinator.js',
    'src/execution/providers/local-stub-adapter.js',
    targetPath,
    'scripts/smoke-execution-slice-05.mjs',
    'scripts/serve-ui-slice-01.mjs',
    'ui/app.js',
  ];
  for (const relativePath of fixtureFiles) {
    const absolutePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(
      absolutePath,
      relativePath.endsWith('.md')
        ? '# Durable delivery fixture\n'
        : `'use strict';\n\nmodule.exports = { durableDeliveryReady: false };\n`,
    );
  }
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedCouncilAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name: 'Durable delivery smoke', projectPath });
  const mission = runtime.createMission({
    projectId: project.id,
    title: 'Persist one reviewed DeliveryPackage',
    goal: 'Prove one exact durable review-required record.',
    constraints: 'Local-stub only; stop before acceptance, done, commit, push, or release.',
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
    mission,
    persisted,
    projectPath,
    runtime,
    runtimeRoot,
    coordinator: createExecutionCoordinator({
      repoRoot,
      runtimeService: runtime,
      providerAdapter: createTargetedProviderAdapter(),
    }),
  };
}

async function reachDeliveryReady(context) {
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
  const terminalApproval = runtime.requestBuilderLiveMutationApproval({ taskId: task.id });
  runtime.finalizeSequentialWorkOrderExecution({
    executionPlanId: persisted.executionPlan.id,
    workOrderId: started.executionPlan.activeWorkOrderId,
    stageResults: [
      stageRecord('planner', planner),
      stageRecord('architect', architect),
      stageRecord('task-breaker', taskBreaker),
      stageRecord('builder-preflight', preflight),
      stageRecord('request-builder-live-mutation-approval', {
        approval: terminalApproval,
        item: runtime.getDecisionInboxItem(terminalApproval.inboxItemId),
      }),
    ],
    stopReason: 'waiting-approval',
    stoppedAt: 'request-builder-live-mutation-approval',
    terminalGateApprovalId: terminalApproval.id,
  });
  runtime.resolveDecisionInboxItem({
    itemId: terminalApproval.inboxItemId,
    action: 'approved',
  });
  runtime.beginReviewedDeliveryContinuation({
    executionPlanId: persisted.executionPlan.id,
    terminalGateApprovalId: terminalApproval.id,
    sourceDigest: persisted.executionPlan.sourceDigest,
  });
  const builder = await coordinator.runBuilderLiveMutation({ taskId: task.id });
  runtime.completeReviewedDeliveryBuilder({
    executionPlanId: persisted.executionPlan.id,
    runId: builder.run.id,
    changeSummaryArtifactId: builder.artifacts.changeSummary.id,
    patchArtifactId: builder.artifacts.patch.id,
    diffArtifactId: builder.artifacts.diff.id,
    changedFiles: builder.changedFiles,
  });
  runtime.beginReviewedDeliveryReviewer({ executionPlanId: persisted.executionPlan.id });
  const reviewer = await coordinator.runReviewer({ taskId: task.id });
  runtime.completeReviewedDeliveryReviewer({
    executionPlanId: persisted.executionPlan.id,
    runId: reviewer.run.id,
    reviewArtifactId: reviewer.artifact.id,
    reviewStatus: reviewer.run.summary.mappedReviewStatus,
    decisionInboxItemId: reviewer.decisionInboxItem?.id || null,
  });
  const qaReady = runtime.beginReviewedDeliveryQa({
    executionPlanId: persisted.executionPlan.id,
  });
  const byRole = Object.fromEntries(qaReady.workOrders.map((entry) => [entry.role, entry]));
  const qa = await coordinator.runQaWorkOrder({
    taskId: task.id,
    executionPlanId: persisted.executionPlan.id,
    workOrderId: byRole.qa.id,
    builderRunId: byRole.builder.completionRunId,
    reviewerRunId: byRole.reviewer.completionRunId,
    sourceDigest: persisted.executionPlan.sourceDigest,
    changedFiles: byRole.builder.changedFiles,
    targetPathAllowlist: byRole.qa.targetPathAllowlist,
    commands: byRole.qa.verificationCommands,
  });
  return runtime.completeReviewedDeliveryQa({
    executionPlanId: persisted.executionPlan.id,
    runId: qa.run.id,
    qaEvidenceArtifactId: qa.artifact.id,
  });
}

function writeState(runtimeRoot, state) {
  fs.mkdirSync(runtimeRoot, { recursive: true });
  fs.writeFileSync(path.join(runtimeRoot, 'state.json'), `${JSON.stringify(state, null, 2)}\n`);
}

function stripV9Fields(state) {
  const clone = structuredClone(state);
  clone.schemaVersion = 8;
  delete clone.sequences.deliveryPackage;
  delete clone.sequences.deliveryPackageAcceptance;
  delete clone.sequences.staffingPlan;
  delete clone.deliveryPackages;
  delete clone.deliveryPackageAcceptances;
  delete clone.staffingPlans;
  for (const plan of Object.values(clone.executionPlans)) {
    delete plan.deliveryPackageRefs;
    delete plan.latestDeliveryPackageId;
  }
  return clone;
}

function snapshotCounts(state) {
  return Object.fromEntries(
    ['missions', 'tasks', 'runs', 'artifacts', 'approvals', 'decisionInboxItems', 'workflowCheckpoints']
      .map((key) => [key, Object.keys(state[key]).length]),
  );
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });
  try {
    const context = createContext();
    const deliveryReady = await reachDeliveryReady(context);
    const executionPlanId = context.persisted.executionPlan.id;
    const statePath = path.join(context.runtimeRoot, 'state.json');
    const targetFile = path.join(context.projectPath, targetPath);
    assert.equal(deliveryReady.executionPlan.status, 'delivery-ready');
    assert.equal(deliveryReady.latestCheckpoint.stage, 'delivery-ready');
    assert.equal(deliveryReady.latestCheckpoint.status, 'terminal');

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    const preview = context.runtime.previewExecutionPlanDelivery({ executionPlanId });
    assert.equal(context.runtime.getExecutionPlanDeliveryPackage(executionPlanId).deliveryPackage, null);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);
    assert.equal(preview.persisted, false);
    assert.equal(preview.missionDone, false);
    assert.equal(preview.authoritySummary.durablePersistenceAllowed, true);
    assert.equal(preview.authoritySummary.packageAcceptanceAllowed, false);
    assert.match(preview.packageDigest, /^[a-f0-9]{64}$/);
    assert.equal(Object.isFrozen(preview), true);
    assert.deepEqual(context.runtime.previewExecutionPlanDelivery({ executionPlanId }), preview);

    const currentState = JSON.parse(beforeReads);
    const migrationRoot = path.join(tempRoot, 'migration');
    const schema8 = stripV9Fields(currentState);
    writeState(migrationRoot, schema8);
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 17);
    assert.equal(migrated.sequences.deliveryPackage, 0);
    assert.equal(migrated.sequences.deliveryPackageAcceptance, 0);
    assert.deepEqual(migrated.deliveryPackages, {});
    assert.deepEqual(migrated.deliveryPackageAcceptances, {});
    assert.equal(migrated.sequences.missionCloseOut, 0);
    assert.deepEqual(migrated.missionCloseOuts, {});
    assert.deepEqual(migrated.executionPlans[executionPlanId].checkpointRefs, schema8.executionPlans[executionPlanId].checkpointRefs);
    assert.equal(migrated.executionPlans[executionPlanId].latestCheckpointId, schema8.executionPlans[executionPlanId].latestCheckpointId);
    assert.deepEqual(migrated.executionPlans[executionPlanId].deliveryPackageRefs, []);

    const partialRoot = path.join(tempRoot, 'partial-v9');
    const partial = structuredClone(currentState);
    delete partial.deliveryPackages;
    writeState(partialRoot, partial);
    assert.throws(() => createFileStore({ runtimeRoot: partialRoot }).loadState(), /missing DeliveryPackage fields/);
    const futureRoot = path.join(tempRoot, 'future');
    writeState(futureRoot, { ...currentState, schemaVersion: 18 });
    assert.throws(() => createFileStore({ runtimeRoot: futureRoot }).loadState(), /Unsupported runtime state/);

    const exactTuple = {
      executionPlanId,
      previewId: preview.id,
      sourceDigest: preview.sourceDigest,
      packageDigest: preview.packageDigest,
      checkpointId: preview.terminalCheckpointId,
      checkpointDigest: preview.terminalCheckpointDigest,
    };
    if (seedOnly) {
      process.stdout.write(`${JSON.stringify({
        ok: true,
        mode: MODE,
        seedOnly: true,
        runtimeRoot: context.runtimeRoot,
        projectPath: context.projectPath,
        executionPlanId,
        preview,
      }, null, 2)}\n`);
      return;
    }
    for (const field of ['previewId', 'sourceDigest', 'packageDigest', 'checkpointId', 'checkpointDigest']) {
      const beforeInvalid = fs.readFileSync(statePath, 'utf8');
      assert.throws(
        () => context.runtime.persistExecutionPlanDeliveryPackage({
          ...exactTuple,
          [field]: `${exactTuple[field]}-stale`,
        }),
        new RegExp(field),
      );
      assert.equal(fs.readFileSync(statePath, 'utf8'), beforeInvalid);
    }

    const beforePersist = context.runtime.getSnapshot();
    const countsBefore = snapshotCounts(beforePersist);
    const sourceBefore = fs.readFileSync(targetFile, 'utf8');
    const result = context.runtime.persistExecutionPlanDeliveryPackage(exactTuple);
    assert.equal(result.idempotent, false);
    assert.equal(result.deliveryPackage.status, 'review-required');
    assert.equal(result.deliveryPackage.packageDigest, preview.packageDigest);
    assert.equal(result.deliveryPackage.terminalCheckpointDigest, preview.terminalCheckpointDigest);
    assert.equal(result.executionPlan.status, 'delivery-ready');
    assert.equal(result.mission.status, 'executing');
    assert.equal(result.controlTask.lifecycleState, beforePersist.tasks[result.controlTask.id].lifecycleState);
    assert.equal(result.executionPlan.deliveryPackageRefs.length, 1);
    assert.equal(result.executionPlan.latestDeliveryPackageId, result.deliveryPackage.id);
    const afterPersist = context.runtime.getSnapshot();
    assert.equal(afterPersist.sequences.deliveryPackage, 1);
    assert.equal(Object.keys(afterPersist.deliveryPackages).length, 1);
    assert.equal(afterPersist.sequences.deliveryPackageAcceptance, 0);
    assert.deepEqual(afterPersist.deliveryPackageAcceptances, {});
    assert.deepEqual(snapshotCounts(afterPersist), countsBefore);
    assert.equal(fs.readFileSync(targetFile, 'utf8'), sourceBefore);
    assert.ok(
      Object.values(afterPersist.artifacts).every(
        (artifact) => !['commit-package', 'commit-result', 'release-package', 'close-out'].includes(artifact.type),
      ),
    );

    const extraFieldRoot = path.join(tempRoot, 'invalid-extra-field');
    const extraFieldState = structuredClone(afterPersist);
    extraFieldState.deliveryPackages[result.deliveryPackage.id].rawProviderOutput = 'forbidden';
    writeState(extraFieldRoot, extraFieldState);
    const extraFieldBefore = fs.readFileSync(path.join(extraFieldRoot, 'state.json'), 'utf8');
    assert.throws(
      () => createFileStore({ runtimeRoot: extraFieldRoot }).loadState(),
      /unexpected or missing fields/,
    );
    assert.equal(fs.readFileSync(path.join(extraFieldRoot, 'state.json'), 'utf8'), extraFieldBefore);

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const replay = context.runtime.persistExecutionPlanDeliveryPackage(exactTuple);
    assert.equal(replay.idempotent, true);
    assert.equal(replay.deliveryPackage.id, result.deliveryPackage.id);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);

    const reloaded = createRuntimeService({
      runtimeRoot: context.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    });
    const durable = reloaded.getExecutionPlanDeliveryPackage(executionPlanId).deliveryPackage;
    assert.deepEqual(durable, result.deliveryPackage);
    assert.equal(reloaded.getSnapshot().schemaVersion, 17);
    assert.equal(reloaded.getDeliveryPackageAcceptance(durable.id).acceptance, null);
    assert.equal(typeof reloaded.acceptDeliveryPackage, 'function');
    assert.equal(typeof reloaded.completeMissionFromDeliveryPackage, 'undefined');

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      migration: {
        from: 8,
        to: 11,
        packageBootstrap: false,
        acceptanceBootstrap: false,
        checkpointPreserved: true,
      },
      persistence: {
        status: durable.status,
        packageId: durable.id,
        exactTupleBound: true,
        idempotent: true,
        reloadVerified: true,
      },
      unchanged: {
        missionStatus: reloaded.getMission(context.mission.id).status,
        executionPlanStatus: reloaded.getExecutionPlan(executionPlanId).executionPlan.status,
        sourceMutation: false,
        downstreamAuthority: false,
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
