import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-05');
const runtime = createRuntimeService({ runtimeRoot });

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

async function runThroughBuilderPreflight(task) {
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(
      'Prepare the approved slice and capture a builder preflight artifact before any live mutation.',
    ),
  });
  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });
  const builderPreflightResult = await coordinator.runBuilderPreflight({
    taskId: task.id,
  });

  return {
    architectResult,
    builderPreflightResult,
    plannerResult,
    taskBreakerResult,
  };
}

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: repoRoot,
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Builder live mutation guard smoke',
  intent: 'Guard future builder live mutation behind latest preflight-targeted approval semantics.',
});

const setup = await runThroughBuilderPreflight(task);
const firstPreflight = runtime.getArtifact(setup.builderPreflightResult.artifact.id);

await assert.rejects(
  () =>
    coordinator.assertBuilderLiveMutationReady({
      taskId: task.id,
    }),
  /latest approval for builder-live-mutation is missing/i,
);

const pendingApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'builder',
  allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
  targetArtifactId: firstPreflight.id,
  targetRunId: firstPreflight.runId,
  title: 'Approval required: builder live mutation',
});

await assert.rejects(
  () =>
    coordinator.assertBuilderLiveMutationReady({
      taskId: task.id,
    }),
  /is pending/i,
);

runtime.resolveDecisionInboxItem({
  itemId: pendingApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve live mutation for first preflight.',
});

const snapshotBeforeReady = runtime.getSnapshot();
const readyContext = await coordinator.assertBuilderLiveMutationReady({
  taskId: task.id,
});
const snapshotAfterReady = runtime.getSnapshot();

assert.equal(readyContext.guardSummary.allowed, true);
assert.equal(readyContext.preflightArtifact.id, firstPreflight.id);
assert.equal(readyContext.preflightRun.id, firstPreflight.runId);
assert.equal(
  Object.keys(snapshotBeforeReady.runs).length,
  Object.keys(snapshotAfterReady.runs).length,
);
assert.equal(
  Object.keys(snapshotBeforeReady.artifacts).length,
  Object.keys(snapshotAfterReady.artifacts).length,
);

const secondPreflightResult = await coordinator.runBuilderPreflight({
  taskId: task.id,
});

await assert.rejects(
  () =>
    coordinator.assertBuilderLiveMutationReady({
      taskId: task.id,
    }),
  /stale for preflight/i,
);

const secondPreflight = runtime.getArtifact(secondPreflightResult.artifact.id);
const rejectedApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'builder',
  allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
  targetArtifactId: secondPreflight.id,
  targetRunId: secondPreflight.runId,
  title: 'Approval required: builder live mutation',
});

runtime.resolveDecisionInboxItem({
  itemId: rejectedApproval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject live mutation for second preflight.',
});

await assert.rejects(
  () =>
    coordinator.assertBuilderLiveMutationReady({
      taskId: task.id,
    }),
  /is rejected/i,
);

const approvedSecondApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'builder',
  allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
  targetArtifactId: secondPreflight.id,
  targetRunId: secondPreflight.runId,
  title: 'Approval required: builder live mutation',
});

runtime.resolveDecisionInboxItem({
  itemId: approvedSecondApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve live mutation for second preflight.',
});

const readyAgain = await coordinator.assertBuilderLiveMutationReady({
  taskId: task.id,
});

assert.equal(readyAgain.guardSummary.allowed, true);
assert.equal(readyAgain.preflightArtifact.id, secondPreflight.id);
assert.equal(readyAgain.guardSummary.latestApprovalId, approvedSecondApproval.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: task.id,
      firstPreflightArtifactId: firstPreflight.id,
      secondPreflightArtifactId: secondPreflight.id,
      latestApprovalId: readyAgain.guardSummary.latestApprovalId,
    },
    null,
    2,
  ),
);
