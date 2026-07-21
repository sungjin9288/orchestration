import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import contractsModule from '../src/runtime/contracts.js';
import councilAdapterModule from '../src/execution/providers/council-local-stub-adapter.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import fileStoreModule from '../src/runtime/file-store.js';
import runtimeModule from '../src/runtime/runtime-service.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createEmptyState } = contractsModule;
const { createCouncilLocalStubAdapter } = councilAdapterModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createFileStore } = fileStoreModule;
const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const blueprintPath = path.join(repoRoot, 'company', 'blueprint.json');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ai-company-workorder-persistence-smoke');
const MODE = 'ai-company-workorder-persistence-execution-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const compileSpec = {
  targetPathAllowlist: ['src/runtime/runtime-service.js'],
  expectedArtifacts: ['Builder preflight evidence'],
  verificationCommands: ['node --check src/runtime/runtime-service.js'],
  stopConditions: ['Stop before builder live mutation'],
};

function createResolvedAdapter() {
  const base = createCouncilLocalStubAdapter();
  return {
    id: 'workorder-persistence-resolved-local-stub',
    mode: 'local-stub',
    executePosition: (request) => base.executePosition(request),
    executeSynthesis(request) {
      return { ...base.executeSynthesis(request), unresolvedQuestions: [] };
    },
  };
}

function createApprovedContext(name) {
  const runtimeRoot = path.join(tempRoot, name);
  const runtime = createRuntimeService({
    runtimeRoot,
    companyBlueprintPath: blueprintPath,
    companyRepoRoot: repoRoot,
    councilAdapter: createResolvedAdapter(),
  });
  runtime.resetRuntime();
  const project = runtime.createProject({ name, projectPath: repoRoot });
  const mission = runtime.createMission({
    projectId: project.id,
    title: `Durable WorkOrder ${name}`,
    goal: 'Persist and dispatch one approval-bound Builder WorkOrder.',
    constraints: 'Stop before source mutation and keep Reviewer and QA blocked.',
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
  return { runtime, runtimeRoot, project, mission, session: started.councilSession, preview };
}

function persist(context) {
  return context.runtime.persistMissionWorkOrderPlan({
    councilSessionId: context.session.id,
    compileSpec,
    previewId: context.preview.previewId,
    sourceDigest: context.preview.sourceDigest,
  });
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

function sourceDigest() {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(repoRoot, 'src', 'runtime', 'runtime-service.js')))
    .digest('hex');
}

async function main() {
  fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(tempRoot, { recursive: true });

  try {
    const migrationRoot = path.join(tempRoot, 'migration');
    fs.mkdirSync(migrationRoot, { recursive: true });
    const legacy = createEmptyState();
    legacy.schemaVersion = 6;
    delete legacy.sequences.executionPlan;
    delete legacy.sequences.workOrder;
    delete legacy.sequences.handoffPacket;
    delete legacy.sequences.workflowCheckpoint;
    delete legacy.executionPlans;
    delete legacy.workOrders;
    delete legacy.handoffPackets;
    delete legacy.workflowCheckpoints;
    fs.writeFileSync(path.join(migrationRoot, 'state.json'), JSON.stringify(legacy));
    const migrated = createFileStore({ runtimeRoot: migrationRoot }).loadState();
    assert.equal(migrated.schemaVersion, 15);
    assert.deepEqual(
      [migrated.sequences.executionPlan, migrated.sequences.workOrder, migrated.sequences.handoffPacket],
      [0, 0, 0],
    );
    assert.equal(migrated.sequences.workflowCheckpoint, 0);
    assert.deepEqual(migrated.workflowCheckpoints, {});

    for (const invalidVersion of [8, 16]) {
      const invalidRoot = path.join(tempRoot, `invalid-${invalidVersion}`);
      fs.mkdirSync(invalidRoot, { recursive: true });
      const invalid = createEmptyState();
      invalid.schemaVersion = invalidVersion;
      if (invalidVersion === 8) delete invalid.workflowCheckpoints;
      fs.writeFileSync(path.join(invalidRoot, 'state.json'), JSON.stringify(invalid));
      assert.throws(
        () => createFileStore({ runtimeRoot: invalidRoot }).loadState(),
        invalidVersion === 8 ? /missing WorkflowCheckpoint fields/ : /Unsupported runtime state/,
      );
    }

    const partialRecordRoot = path.join(tempRoot, 'invalid-partial-record');
    fs.mkdirSync(partialRecordRoot, { recursive: true });
    const partialRecord = createEmptyState();
    partialRecord.executionPlans['execution-plan-partial'] = {
      id: 'execution-plan-partial',
      status: 'pending-approval',
      checkpointRefs: [],
      latestCheckpointId: null,
      deliveryPackageRefs: [],
      latestDeliveryPackageId: null,
    };
    fs.writeFileSync(path.join(partialRecordRoot, 'state.json'), JSON.stringify(partialRecord));
    assert.throws(
      () => createFileStore({ runtimeRoot: partialRecordRoot }).loadState(),
      /ExecutionPlan execution-plan-partial is missing projectId/,
    );

    const success = createApprovedContext('success');
    const statePath = path.join(success.runtimeRoot, 'state.json');
    const beforeInvalid = fs.readFileSync(statePath, 'utf8');
    assert.throws(
      () => success.runtime.persistMissionWorkOrderPlan({
        councilSessionId: success.session.id,
        compileSpec,
        previewId: `${success.preview.previewId}-stale`,
        sourceDigest: success.preview.sourceDigest,
      }),
      /previewId does not match/,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeInvalid);

    const first = persist(success);
    assert.equal(first.idempotent, false);
    assert.equal(first.executionPlan.status, 'pending-approval');
    assert.equal(first.approval.status, 'pending');
    assert.deepEqual(first.workOrders.map((entry) => entry.status), [
      'pending-approval',
      'blocked-dependency',
      'blocked-dependency',
    ]);
    assert.equal(first.workOrders[0].authority.executeAllowed, true);
    assert.ok(first.workOrders.slice(1).every((entry) => entry.authority.executeAllowed === false));
    assert.equal(first.executionPlan.authorityBoundary.mode, 'durable-gated');
    assert.equal(first.executionPlan.authorityBoundary.persistenceAllowed, true);
    assert.equal(first.executionPlan.authorityBoundary.executeAllowed, true);
    assert.ok(first.executionPlan.nonGoals.some((entry) => /Reviewer or QA/.test(entry)));
    assert.ok(first.handoffPackets.every((entry) => entry.authorityBoundary.persistenceAllowed));
    assert.equal(first.executionPlan.workOrderIds.length, 3);
    assert.equal(first.executionPlan.handoffPacketIds.length, 3);
    const countersAfterFirst = {
      ...success.runtime.getSnapshot().sequences,
    };
    const repeated = persist(success);
    assert.equal(repeated.idempotent, true);
    assert.deepEqual(success.runtime.getSnapshot().sequences, countersAfterFirst);

    success.runtime.resolveDecisionInboxItem({
      itemId: first.approval.inboxItemId,
      action: 'approved',
    });
    const approved = success.runtime.getExecutionPlan(first.executionPlan.id);
    assert.equal(approved.executionPlan.status, 'approved');
    assert.deepEqual(approved.workOrders.map((entry) => entry.status), [
      'queued',
      'blocked-dependency',
      'blocked-dependency',
    ]);

    const hashBeforeDispatch = sourceDigest();
    const started = success.runtime.beginSequentialWorkOrderExecution({
      executionPlanId: first.executionPlan.id,
      approvalId: first.approval.id,
    });
    assert.throws(
      () => success.runtime.beginSequentialWorkOrderExecution({
        executionPlanId: first.executionPlan.id,
        approvalId: first.approval.id,
      }),
      /not approved/,
    );

    const coordinator = createExecutionCoordinator({
      repoRoot,
      runtimeService: success.runtime,
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
    assert.equal(preflight.nextStage, 'request-builder-live-mutation-approval');
    const liveMutationApproval = success.runtime.requestBuilderLiveMutationApproval({ taskId: task.id });
    const stageResults = [
      stageRecord('planner', planner),
      stageRecord('architect', architect),
      stageRecord('task-breaker', taskBreaker),
      stageRecord('builder-preflight', preflight),
      stageRecord('request-builder-live-mutation-approval', {
        approval: liveMutationApproval,
        item: success.runtime.getDecisionInboxItem(liveMutationApproval.inboxItemId),
      }),
    ];
    const stopped = success.runtime.finalizeSequentialWorkOrderExecution({
      executionPlanId: first.executionPlan.id,
      workOrderId: started.executionPlan.activeWorkOrderId,
      stageResults,
      stopReason: 'waiting-approval',
      stoppedAt: 'request-builder-live-mutation-approval',
      terminalGateApprovalId: liveMutationApproval.id,
    });
    assert.equal(stopped.executionPlan.status, 'active');
    assert.equal(stopped.workOrders[0].status, 'waiting-gate');
    assert.equal(stopped.workOrders[0].runRefs.length, 4);
    assert.equal(stopped.workOrders[0].artifactRefs.length, 4);
    assert.ok(stopped.workOrders.slice(1).every((entry) => entry.status === 'blocked-dependency'));
    assert.equal(success.runtime.getApproval(liveMutationApproval.id).status, 'pending');
    assert.equal(sourceDigest(), hashBeforeDispatch);

    const reloaded = createRuntimeService({
      runtimeRoot: success.runtimeRoot,
      companyBlueprintPath: blueprintPath,
      companyRepoRoot: repoRoot,
    }).getExecutionPlan(first.executionPlan.id);
    assert.deepEqual(reloaded.executionPlan, stopped.executionPlan);
    assert.deepEqual(reloaded.workOrders, stopped.workOrders);
    assert.equal(JSON.parse(fs.readFileSync(statePath, 'utf8')).schemaVersion, 15);

    const rejected = createApprovedContext('rejected');
    const rejectedPlan = persist(rejected);
    rejected.runtime.resolveDecisionInboxItem({
      itemId: rejectedPlan.approval.inboxItemId,
      action: 'rejected',
    });
    const rejectedBundle = rejected.runtime.getExecutionPlan(rejectedPlan.executionPlan.id);
    assert.equal(rejectedBundle.executionPlan.status, 'rejected');
    assert.ok(rejectedBundle.workOrders.every((entry) => entry.status === 'cancelled'));
    assert.equal(rejectedBundle.handoffPackets.length, 3);

    const tamperedBinding = createApprovedContext('tampered-binding');
    const tamperedPlan = persist(tamperedBinding);
    tamperedBinding.runtime.resolveDecisionInboxItem({
      itemId: tamperedPlan.approval.inboxItemId,
      action: 'approved',
    });
    const tamperedStatePath = path.join(tamperedBinding.runtimeRoot, 'state.json');
    const tamperedState = JSON.parse(fs.readFileSync(tamperedStatePath, 'utf8'));
    tamperedState.approvals[tamperedPlan.approval.id].metadata.sourceDigest = 'tampered';
    fs.writeFileSync(tamperedStatePath, JSON.stringify(tamperedState));
    assert.throws(
      () => tamperedBinding.runtime.beginSequentialWorkOrderExecution({
        executionPlanId: tamperedPlan.executionPlan.id,
        approvalId: tamperedPlan.approval.id,
      }),
      /does not have the required approval/,
    );

    const providerBlocked = createApprovedContext('provider-blocked');
    const providerPlan = persist(providerBlocked);
    providerBlocked.runtime.resolveDecisionInboxItem({
      itemId: providerPlan.approval.inboxItemId,
      action: 'approved',
    });
    providerBlocked.runtime.setProjectProviderConfig({
      projectId: providerBlocked.project.id,
      provider: {
        mode: 'live',
        adapter: 'openai-responses',
        model: 'blocked-model',
        env: { apiKeyVar: 'UNCONFIGURED_WORKORDER_SMOKE_KEY' },
      },
    });
    assert.throws(
      () => providerBlocked.runtime.beginSequentialWorkOrderExecution({
        executionPlanId: providerPlan.executionPlan.id,
        approvalId: providerPlan.approval.id,
      }),
      /local-stub only/,
    );

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      schema: {
      version: 15,
        v6Migration: true,
        partialAndFutureRejected: true,
        atomicWrite: true,
      },
      persistence: {
        exactPreviewDigestRequired: true,
        approvalBindingRecheckedAtDispatch: true,
        idempotent: true,
        records: { executionPlans: 1, workOrders: 3, handoffPackets: 3 },
      },
      execution: {
        providerMode: 'local-stub',
        builderStatus: 'waiting-gate',
        stoppedAt: 'request-builder-live-mutation-approval',
        reviewerAndQaDispatched: false,
        sourceMutation: false,
      },
    }, null, 2)}\n`);
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
