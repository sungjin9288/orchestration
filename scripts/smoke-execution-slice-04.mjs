import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { readFileSync } from 'node:fs';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-04');
const runtime = createRuntimeService({ runtimeRoot });

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

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
}

function hashFile(relativePath) {
  return createHash('sha256')
    .update(readFileSync(path.join(repoRoot, relativePath)))
    .digest('hex');
}

function hashFiles(relativePaths) {
  return Object.fromEntries(relativePaths.map((relativePath) => [relativePath, hashFile(relativePath)]));
}

async function runThroughTaskBreaker(task, scopeStatement) {
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });

  return {
    architectResult,
    plannerResult,
    taskBreakerResult,
  };
}

const noWriteFiles = [
  'src/execution/execution-coordinator.js',
  'src/execution/providers/local-stub-adapter.js',
  'src/runtime/runtime-service.js',
  'prompts/builder.md',
  'scripts/serve-ui-slice-01.mjs',
  'ui/app.js',
];

const readyTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder preflight happy path smoke',
  intent: 'Generate a no-write builder preflight artifact from the approved slice without mutating code.',
});

const readySetup = await runThroughTaskBreaker(
  readyTask,
  'Prepare a builder preflight artifact using the latest plan, architecture, and breakdown artifacts without live execution.',
);
const readyHashesBefore = hashFiles(noWriteFiles);
const readyBuilderResult = await coordinator.runBuilderPreflight({
  taskId: readyTask.id,
});
const readyHashesAfter = hashFiles(noWriteFiles);
const readyTaskAfter = runtime.getTask(readyTask.id);
const readyLogs = runtime.getLogs(readyBuilderResult.run.id);
const readyPreflightArtifact = runtime.getArtifact(readyBuilderResult.artifact.id);

assert.deepEqual(readyHashesAfter, readyHashesBefore);
assert.equal(readyTaskAfter.lifecycleState, 'In Progress');
assert.equal(readyTaskAfter.latestRunId, readyBuilderResult.run.id);
assert.deepEqual(readyTaskAfter.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.deepEqual(readyTaskAfter.artifactIds, [
  readySetup.plannerResult.artifact.id,
  readySetup.architectResult.artifact.id,
  readySetup.taskBreakerResult.artifact.id,
  readyBuilderResult.artifact.id,
]);
assert.equal(readyBuilderResult.decisionInboxItem, null);
assert.equal(readyBuilderResult.nextStage, 'reviewer');
assert.equal(readyBuilderResult.normalizedResult.needsDecision, false);
assert.equal(readyBuilderResult.normalizedResult.blockers.length, 0);
assert.deepEqual(
  readyBuilderResult.inputArtifacts.map((artifact) => artifact.id),
  [
    readySetup.plannerResult.artifact.id,
    readySetup.architectResult.artifact.id,
    readySetup.taskBreakerResult.artifact.id,
  ],
);
assert.equal(readyBuilderResult.run.summary.executionMode, 'preflight');
assert.equal(readyBuilderResult.run.summary.mutationAllowed, false);
assert.equal(readyLogs.length, 8);
assert.match(readyLogs[0].message, /builder preflight run started/);
assert.match(readyLogs[4].message, /loaded breakdown artifact/);
assert.match(readyLogs[7].message, /saved builder preflight artifact/);
assert.equal(readyPreflightArtifact.type, 'preflight');
assert.match(readyPreflightArtifact.content, /^# Builder Preflight:/m);
assert.match(readyPreflightArtifact.content, /^## Target Files$/m);
assert.match(readyPreflightArtifact.content, /^## Intended Changes$/m);
assert.match(readyPreflightArtifact.content, /^## Risks$/m);
assert.match(readyPreflightArtifact.content, /^## Verification Plan$/m);
assert.match(readyPreflightArtifact.content, /^## Review Evidence Expectations$/m);
assert.match(readyPreflightArtifact.content, /^## Escalation Triggers$/m);
assert.match(readyPreflightArtifact.content, /mutation allowed: no/i);

const missingBreakdownTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder preflight missing breakdown guard',
  intent: 'Confirm builder preflight refuses to start until the latest breakdown artifact exists.',
});

const missingPlannerResult = await coordinator.runPlanner({
  taskId: missingBreakdownTask.id,
  routingOutcome: createRoutingOutcome(
    'Prepare builder preflight inputs, but do not create a breakdown artifact yet.',
  ),
});
const missingArchitectResult = await coordinator.runArchitect({
  taskId: missingBreakdownTask.id,
});
const missingSnapshotBefore = runtime.getSnapshot();

await assert.rejects(
  () =>
    coordinator.runBuilderPreflight({
      taskId: missingBreakdownTask.id,
    }),
  /Breakdown artifact is required before builder preflight run/i,
);

const missingTaskAfter = runtime.getTask(missingBreakdownTask.id);
const missingSnapshotAfter = runtime.getSnapshot();

assert.equal(missingTaskAfter.latestRunId, missingArchitectResult.run.id);
assert.deepEqual(missingTaskAfter.artifactIds, [
  missingPlannerResult.artifact.id,
  missingArchitectResult.artifact.id,
]);
assert.equal(
  Object.keys(missingSnapshotAfter.runs).length,
  Object.keys(missingSnapshotBefore.runs).length,
);
assert.equal(
  Object.keys(missingSnapshotAfter.artifacts).length,
  Object.keys(missingSnapshotBefore.artifacts).length,
);

const blockingRiskTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder preflight blocking risk smoke',
  intent:
    'Builder preflight should surface a blocking risk before live execution because human approval before live execution is still required.',
});

const blockingRiskSetup = await runThroughTaskBreaker(
  blockingRiskTask,
  'Prepare a builder preflight artifact while preserving the approved boundary.',
);
const blockingRiskResult = await coordinator.runBuilderPreflight({
  taskId: blockingRiskTask.id,
});
const blockingRiskTaskAfter = runtime.getTask(blockingRiskTask.id);
const blockingRiskLogs = runtime.getLogs(blockingRiskResult.run.id);
const blockingRiskArtifact = runtime.getArtifact(blockingRiskResult.artifact.id);
const blockingRiskInboxItems = runtime.listDecisionInboxItems({
  status: 'pending',
  taskId: blockingRiskTask.id,
});

assert.equal(blockingRiskTaskAfter.latestRunId, blockingRiskResult.run.id);
assert.equal(blockingRiskTaskAfter.flags.blocked, true);
assert.equal(blockingRiskTaskAfter.flags.waitingDecision, true);
assert.equal(blockingRiskTaskAfter.flags.waitingApproval, false);
assert.deepEqual(blockingRiskTaskAfter.artifactIds, [
  blockingRiskSetup.plannerResult.artifact.id,
  blockingRiskSetup.architectResult.artifact.id,
  blockingRiskSetup.taskBreakerResult.artifact.id,
  blockingRiskResult.artifact.id,
]);
assert.ok(blockingRiskResult.decisionInboxItem);
assert.equal(blockingRiskResult.decisionInboxItem.id, blockingRiskInboxItems[0].id);
assert.equal(blockingRiskResult.decisionInboxItem.blocksTask, true);
assert.equal(blockingRiskResult.nextStage, 'human gate');
assert.equal(blockingRiskResult.normalizedResult.needsDecision, true);
assert.equal(blockingRiskResult.normalizedResult.blockers.length, 1);
assert.match(blockingRiskResult.normalizedResult.blockers[0], /blocking risk/i);
assert.equal(blockingRiskArtifact.type, 'preflight');
assert.match(
  blockingRiskLogs[blockingRiskLogs.length - 1].message,
  /created builder preflight decision inbox item/,
);

const approvalBlockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Builder preflight approval gate smoke',
  intent: 'Verify builder preflight refuses to start while a pending approval still exists.',
});

const approvalBlockedSetup = await runThroughTaskBreaker(
  approvalBlockedTask,
  'Prepare builder preflight inputs after planner, architect, and task-breaker complete.',
);

runtime.createApprovalPlaceholder({
  taskId: approvalBlockedTask.id,
  allowedNextAction: 'commit',
  prompt: 'Approval is still pending before builder preflight may continue.',
  scope: 'commit',
  title: 'Approval required before builder preflight',
});

const approvalBlockedSnapshotBefore = runtime.getSnapshot();

await assert.rejects(
  () =>
    coordinator.runBuilderPreflight({
      taskId: approvalBlockedTask.id,
    }),
  /cannot run builder preflight while gates remain active: pending approvals/i,
);

const approvalBlockedTaskAfter = runtime.getTask(approvalBlockedTask.id);
const approvalBlockedSnapshotAfter = runtime.getSnapshot();

assert.equal(approvalBlockedTaskAfter.latestRunId, approvalBlockedSetup.taskBreakerResult.run.id);
assert.equal(approvalBlockedTaskAfter.flags.waitingApproval, true);
assert.deepEqual(approvalBlockedTaskAfter.artifactIds, [
  approvalBlockedSetup.plannerResult.artifact.id,
  approvalBlockedSetup.architectResult.artifact.id,
  approvalBlockedSetup.taskBreakerResult.artifact.id,
]);
assert.equal(
  Object.keys(approvalBlockedSnapshotAfter.runs).length,
  Object.keys(approvalBlockedSnapshotBefore.runs).length,
);
assert.equal(
  Object.keys(approvalBlockedSnapshotAfter.artifacts).length,
  Object.keys(approvalBlockedSnapshotBefore.artifacts).length,
);

const snapshot = runtime.getSnapshot();

assert.equal(Object.keys(snapshot.tasks).length, 4);
assert.equal(Object.keys(snapshot.approvals).length, 1);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 2);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      happyPath: {
        artifactId: readyBuilderResult.artifact.id,
        runId: readyBuilderResult.run.id,
      },
      blockingRisk: {
        inboxItemId: blockingRiskResult.decisionInboxItem.id,
        taskId: blockingRiskTask.id,
      },
      noWriteFiles,
    },
    null,
    2,
  ),
);
