import assert from 'node:assert/strict';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-execution-slice-03');
const runtime = createRuntimeService({ runtimeRoot });

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot: process.cwd(),
  runtimeService: runtime,
});

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

async function runPlannerAndArchitect(task, scopeStatement) {
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });

  return {
    architectResult,
    plannerResult,
  };
}

const readyTask = runtime.createTask({
  projectId: project.id,
  title: 'Task-breaker ready smoke',
  intent: 'Break the approved slice into an executable sequence without widening scope or mutating code.',
});

const readyScope =
  'Break the approved slice into builder-ready checkpoints using the stored plan and architecture artifacts.';
const readySetup = await runPlannerAndArchitect(readyTask, readyScope);
const readyTaskBreakerResult = await coordinator.runTaskBreaker({
  taskId: readyTask.id,
});
const readyTaskAfter = runtime.getTask(readyTask.id);
const readyLogs = runtime.getLogs(readyTaskBreakerResult.run.id);
const readyBreakdownArtifact = runtime.getArtifact(readyTaskBreakerResult.artifact.id);

assert.equal(readyTaskAfter.lifecycleState, 'In Progress');
assert.equal(readyTaskAfter.latestRunId, readyTaskBreakerResult.run.id);
assert.deepEqual(readyTaskAfter.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.deepEqual(readyTaskAfter.artifactIds, [
  readySetup.plannerResult.artifact.id,
  readySetup.architectResult.artifact.id,
  readyTaskBreakerResult.artifact.id,
]);
assert.equal(readyTaskBreakerResult.decisionInboxItem, null);
assert.equal(readyTaskBreakerResult.nextStage, 'builder');
assert.equal(readyTaskBreakerResult.normalizedResult.needsDecision, false);
assert.equal(readyTaskBreakerResult.normalizedResult.blockers.length, 0);
assert.deepEqual(
  readyTaskBreakerResult.inputArtifacts.map((artifact) => artifact.id),
  [readySetup.plannerResult.artifact.id, readySetup.architectResult.artifact.id],
);
assert.equal(readyLogs.length, 7);
assert.match(readyLogs[0].message, /task-breaker run started/);
assert.match(readyLogs[2].message, /loaded planner artifact/);
assert.match(readyLogs[3].message, /loaded architecture artifact/);
assert.match(readyLogs[6].message, /saved breakdown artifact/);
assert.equal(readyBreakdownArtifact.type, 'breakdown');
assert.match(readyBreakdownArtifact.content, /^# Task Breakdown:/m);
assert.match(readyBreakdownArtifact.content, /^## Ordered Sub-Tasks$/m);
assert.match(readyBreakdownArtifact.content, /^## Execution Boundary Summary$/m);

const blockedBreakdownTask = runtime.createTask({
  projectId: project.id,
  title: 'Task-breaker blocked smoke',
  intent:
    'Break the approved slice, but an operator choice is still required to fix the checkpoint order before builder handoff.',
});

const blockedBreakdownSetup = await runPlannerAndArchitect(
  blockedBreakdownTask,
  'Break the approved slice while preserving the existing boundary, but keep the operator choice visible.',
);
const blockedTaskBreakerResult = await coordinator.runTaskBreaker({
  taskId: blockedBreakdownTask.id,
});
const blockedBreakdownTaskAfter = runtime.getTask(blockedBreakdownTask.id);
const blockedTaskBreakerLogs = runtime.getLogs(blockedTaskBreakerResult.run.id);
const blockedBreakdownArtifact = runtime.getArtifact(blockedTaskBreakerResult.artifact.id);
const blockedBreakdownInboxItems = runtime.listDecisionInboxItems({
  status: 'pending',
  taskId: blockedBreakdownTask.id,
});

assert.equal(blockedBreakdownTaskAfter.lifecycleState, 'In Progress');
assert.equal(blockedBreakdownTaskAfter.latestRunId, blockedTaskBreakerResult.run.id);
assert.equal(blockedBreakdownTaskAfter.flags.blocked, true);
assert.equal(blockedBreakdownTaskAfter.flags.waitingDecision, true);
assert.equal(blockedBreakdownTaskAfter.flags.waitingApproval, false);
assert.deepEqual(blockedBreakdownTaskAfter.artifactIds, [
  blockedBreakdownSetup.plannerResult.artifact.id,
  blockedBreakdownSetup.architectResult.artifact.id,
  blockedTaskBreakerResult.artifact.id,
]);
assert.ok(blockedTaskBreakerResult.decisionInboxItem);
assert.equal(blockedTaskBreakerResult.decisionInboxItem.id, blockedBreakdownInboxItems[0].id);
assert.equal(blockedTaskBreakerResult.decisionInboxItem.blocksTask, true);
assert.equal(blockedTaskBreakerResult.nextStage, 'human gate');
assert.equal(blockedTaskBreakerResult.normalizedResult.needsDecision, true);
assert.equal(blockedTaskBreakerResult.normalizedResult.blockers.length, 1);
assert.match(
  blockedTaskBreakerResult.normalizedResult.blockers[0],
  /unresolved operator choice/i,
);
assert.equal(blockedBreakdownArtifact.type, 'breakdown');
assert.match(blockedBreakdownArtifact.content, /^## Stop-And-Escalate Conditions$/m);
assert.match(
  blockedTaskBreakerLogs[blockedTaskBreakerLogs.length - 1].message,
  /created task-breaker decision inbox item/,
);

const approvalBlockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Task-breaker approval gate smoke',
  intent: 'Verify task-breaker refuses to start while an approval gate is still pending.',
});

const approvalBlockedSetup = await runPlannerAndArchitect(
  approvalBlockedTask,
  'Break the approved slice into builder-ready checkpoints after planner and architect complete.',
);

runtime.createApprovalPlaceholder({
  taskId: approvalBlockedTask.id,
  allowedNextAction: 'commit',
  prompt: 'Approval is still pending before task-breaker may continue.',
  scope: 'commit',
  title: 'Approval required before task-breaker',
});

const approvalBlockedTaskBefore = runtime.getTask(approvalBlockedTask.id);
const approvalBlockedSnapshotBefore = runtime.getSnapshot();

await assert.rejects(
  () =>
    coordinator.runTaskBreaker({
      taskId: approvalBlockedTask.id,
    }),
  /cannot run task-breaker while gates remain active: pending approvals/i,
);

const approvalBlockedTaskAfter = runtime.getTask(approvalBlockedTask.id);
const approvalBlockedSnapshotAfter = runtime.getSnapshot();

assert.equal(approvalBlockedTaskBefore.latestRunId, approvalBlockedSetup.architectResult.run.id);
assert.equal(approvalBlockedTaskAfter.latestRunId, approvalBlockedSetup.architectResult.run.id);
assert.equal(approvalBlockedTaskAfter.flags.waitingApproval, true);
assert.deepEqual(approvalBlockedTaskAfter.artifactIds, [
  approvalBlockedSetup.plannerResult.artifact.id,
  approvalBlockedSetup.architectResult.artifact.id,
]);
assert.equal(
  Object.keys(approvalBlockedSnapshotAfter.runs).length,
  Object.keys(approvalBlockedSnapshotBefore.runs).length,
);
assert.equal(
  Object.keys(approvalBlockedSnapshotAfter.artifacts).length,
  Object.keys(approvalBlockedSnapshotBefore.artifacts).length,
);

const decisionBlockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Task-breaker decision gate smoke',
  intent: 'Verify task-breaker refuses to start while a blocking decision from architect is still pending.',
});

const decisionBlockedPlannerResult = await coordinator.runPlanner({
  taskId: decisionBlockedTask.id,
  routingOutcome: createRoutingOutcome(
    'Change provider strategy for the execution runtime while preserving the current shell and runtime state model.',
  ),
});
const decisionBlockedArchitectResult = await coordinator.runArchitect({
  taskId: decisionBlockedTask.id,
});
const decisionBlockedTaskBefore = runtime.getTask(decisionBlockedTask.id);
const decisionBlockedSnapshotBefore = runtime.getSnapshot();

await assert.rejects(
  () =>
    coordinator.runTaskBreaker({
      taskId: decisionBlockedTask.id,
    }),
  /cannot run task-breaker while gates remain active: blocking decision items/i,
);

const decisionBlockedTaskAfter = runtime.getTask(decisionBlockedTask.id);
const decisionBlockedSnapshotAfter = runtime.getSnapshot();

assert.equal(decisionBlockedArchitectResult.nextStage, 'human gate');
assert.ok(decisionBlockedArchitectResult.decisionInboxItem);
assert.equal(decisionBlockedTaskBefore.latestRunId, decisionBlockedArchitectResult.run.id);
assert.equal(decisionBlockedTaskAfter.latestRunId, decisionBlockedArchitectResult.run.id);
assert.equal(decisionBlockedTaskAfter.flags.blocked, true);
assert.equal(decisionBlockedTaskAfter.flags.waitingDecision, true);
assert.deepEqual(decisionBlockedTaskAfter.artifactIds, [
  decisionBlockedPlannerResult.artifact.id,
  decisionBlockedArchitectResult.artifact.id,
]);
assert.equal(
  Object.keys(decisionBlockedSnapshotAfter.runs).length,
  Object.keys(decisionBlockedSnapshotBefore.runs).length,
);
assert.equal(
  Object.keys(decisionBlockedSnapshotAfter.artifacts).length,
  Object.keys(decisionBlockedSnapshotBefore.artifacts).length,
);

const snapshot = runtime.getSnapshot();

assert.equal(Object.keys(snapshot.tasks).length, 4);
assert.equal(Object.keys(snapshot.runs).length, 10);
assert.equal(Object.keys(snapshot.artifacts).length, 10);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 3);
assert.equal(Object.keys(snapshot.approvals).length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      readyTaskBreakerRun: {
        id: readyTaskBreakerResult.run.id,
        nextStage: readyTaskBreakerResult.nextStage,
      },
      blockedTaskBreakerRun: {
        id: blockedTaskBreakerResult.run.id,
        inboxItemId: blockedTaskBreakerResult.decisionInboxItem.id,
        nextStage: blockedTaskBreakerResult.nextStage,
      },
      guardedTasks: {
        approvalBlockedTaskId: approvalBlockedTask.id,
        decisionBlockedTaskId: decisionBlockedTask.id,
      },
      counts: {
        approvals: Object.keys(snapshot.approvals).length,
        artifacts: Object.keys(snapshot.artifacts).length,
        decisionInboxItems: Object.keys(snapshot.decisionInboxItems).length,
        runs: Object.keys(snapshot.runs).length,
        tasks: Object.keys(snapshot.tasks).length,
      },
    },
    null,
    2,
  ),
);
