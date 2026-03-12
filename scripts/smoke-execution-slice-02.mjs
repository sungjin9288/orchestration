import assert from 'node:assert/strict';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-execution-slice-02');
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

const readyTask = runtime.createTask({
  projectId: project.id,
  title: 'Planner ready smoke',
  intent: 'Verify planner run updates task, run, logs, and artifacts without opening a decision inbox item.',
});

const readyResult = await coordinator.runPlanner({
  taskId: readyTask.id,
  routingOutcome: {
    classification: 'new task',
    scopeStatement: 'Run planner for a normal thin slice and hand off to architect.',
    missingContext: [],
    decisionNote: '',
  },
});

const readyTaskAfter = runtime.getTask(readyTask.id);
const readyLogs = runtime.getLogs(readyResult.run.id);
const readyArtifact = runtime.getArtifact(readyResult.artifact.id);

assert.equal(readyTaskAfter.lifecycleState, 'In Progress');
assert.equal(readyTaskAfter.latestRunId, readyResult.run.id);
assert.deepEqual(readyTaskAfter.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.equal(readyResult.decisionInboxItem, null);
assert.equal(readyResult.normalizedResult.needsDecision, false);
assert.equal(readyResult.normalizedResult.blockers.length, 0);
assert.equal(readyResult.nextStage, 'architect');
assert.equal(readyLogs.length, 5);
assert.equal(readyArtifact.type, 'plan');

const blockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Planner blocked smoke',
  intent: 'Verify planner-only blocking output routes into the decision inbox.',
});

const blockedResult = await coordinator.runPlanner({
  taskId: blockedTask.id,
  routingOutcome: {
    classification: 'new task',
    scopeStatement: 'Plan a slice that still has missing context and needs a human decision.',
    missingContext: ['acceptance target'],
    decisionNote: 'Choose the exact artifact preview format before architect handoff.',
  },
});

const blockedTaskAfter = runtime.getTask(blockedTask.id);
const blockedLogs = runtime.getLogs(blockedResult.run.id);
const blockedArtifact = runtime.getArtifact(blockedResult.artifact.id);
const blockedInboxItems = runtime.listDecisionInboxItems({
  status: 'pending',
  taskId: blockedTask.id,
});

assert.equal(blockedTaskAfter.lifecycleState, 'In Progress');
assert.equal(blockedTaskAfter.latestRunId, blockedResult.run.id);
assert.equal(blockedTaskAfter.flags.blocked, true);
assert.equal(blockedTaskAfter.flags.waitingDecision, true);
assert.equal(blockedTaskAfter.flags.waitingApproval, false);
assert.ok(blockedResult.decisionInboxItem);
assert.equal(blockedResult.decisionInboxItem.id, blockedInboxItems[0].id);
assert.equal(blockedResult.decisionInboxItem.blocksTask, true);
assert.equal(blockedResult.normalizedResult.needsDecision, true);
assert.equal(blockedResult.normalizedResult.blockers.length, 1);
assert.equal(blockedResult.nextStage, 'human gate');
assert.match(blockedLogs[blockedLogs.length - 1].message, /created planner decision inbox item/);
assert.equal(blockedArtifact.type, 'plan');
assert.match(blockedArtifact.content, /^## Dependencies and Blockers$/m);

const snapshot = runtime.getSnapshot();

assert.equal(Object.keys(snapshot.tasks).length, 2);
assert.equal(Object.keys(snapshot.runs).length, 2);
assert.equal(Object.keys(snapshot.artifacts).length, 2);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      readyRun: {
        id: readyResult.run.id,
        nextStage: readyResult.nextStage,
      },
      blockedRun: {
        id: blockedResult.run.id,
        nextStage: blockedResult.nextStage,
        inboxItemId: blockedResult.decisionInboxItem.id,
      },
      counts: {
        tasks: Object.keys(snapshot.tasks).length,
        runs: Object.keys(snapshot.runs).length,
        artifacts: Object.keys(snapshot.artifacts).length,
        decisionInboxItems: Object.keys(snapshot.decisionInboxItems).length,
      },
    },
    null,
    2,
  ),
);
