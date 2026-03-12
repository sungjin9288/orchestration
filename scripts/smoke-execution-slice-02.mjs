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

const readyArchitectResult = await coordinator.runArchitect({
  taskId: readyTask.id,
});

const readyArchitectTaskAfter = runtime.getTask(readyTask.id);
const readyArchitectLogs = runtime.getLogs(readyArchitectResult.run.id);
const readyArchitectureArtifact = runtime.getArtifact(readyArchitectResult.artifact.id);

assert.equal(readyArchitectTaskAfter.lifecycleState, 'In Progress');
assert.equal(readyArchitectTaskAfter.latestRunId, readyArchitectResult.run.id);
assert.deepEqual(readyArchitectTaskAfter.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.deepEqual(readyArchitectTaskAfter.artifactIds, [
  readyResult.artifact.id,
  readyArchitectResult.artifact.id,
]);
assert.equal(readyArchitectResult.inputArtifact.id, readyResult.artifact.id);
assert.equal(readyArchitectResult.decisionInboxItem, null);
assert.equal(readyArchitectResult.nextStage, 'task-breaker');
assert.equal(readyArchitectLogs.length, 6);
assert.match(readyArchitectLogs[0].message, /architect run started/);
assert.match(readyArchitectLogs[1].message, /loaded architect prompt contract/);
assert.match(readyArchitectLogs[2].message, /loaded planner artifact/);
assert.match(readyArchitectLogs[5].message, /saved architecture note artifact/);
assert.equal(readyArchitectureArtifact.type, 'architecture');
assert.match(readyArchitectureArtifact.content, /^# Architecture Note:/m);
assert.match(
  readyArchitectureArtifact.content,
  new RegExp(`source artifact: ${readyResult.artifact.id}`),
);

const blockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Architect blocked smoke',
  intent:
    'Verify architect-only blocking output routes into the decision inbox when the plan implies a provider strategy change.',
});

const blockedPlannerResult = await coordinator.runPlanner({
  taskId: blockedTask.id,
  routingOutcome: {
    classification: 'new task',
    scopeStatement:
      'Change provider strategy for the execution runtime while preserving the current shell and runtime state model.',
    missingContext: [],
    decisionNote: '',
  },
});

const blockedPlannerTaskAfter = runtime.getTask(blockedTask.id);
const blockedPlannerLogs = runtime.getLogs(blockedPlannerResult.run.id);
const blockedPlanArtifact = runtime.getArtifact(blockedPlannerResult.artifact.id);

assert.equal(blockedPlannerTaskAfter.lifecycleState, 'In Progress');
assert.equal(blockedPlannerTaskAfter.latestRunId, blockedPlannerResult.run.id);
assert.deepEqual(blockedPlannerTaskAfter.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.equal(blockedPlannerResult.decisionInboxItem, null);
assert.equal(blockedPlannerResult.nextStage, 'architect');
assert.equal(blockedPlannerLogs.length, 5);
assert.equal(blockedPlanArtifact.type, 'plan');

const blockedArchitectResult = await coordinator.runArchitect({
  taskId: blockedTask.id,
});

const blockedTaskAfter = runtime.getTask(blockedTask.id);
const blockedLogs = runtime.getLogs(blockedArchitectResult.run.id);
const blockedArtifact = runtime.getArtifact(blockedArchitectResult.artifact.id);
const blockedInboxItems = runtime.listDecisionInboxItems({
  status: 'pending',
  taskId: blockedTask.id,
});

assert.equal(blockedTaskAfter.lifecycleState, 'In Progress');
assert.equal(blockedTaskAfter.latestRunId, blockedArchitectResult.run.id);
assert.equal(blockedTaskAfter.flags.blocked, true);
assert.equal(blockedTaskAfter.flags.waitingDecision, true);
assert.equal(blockedTaskAfter.flags.waitingApproval, false);
assert.deepEqual(blockedTaskAfter.artifactIds, [
  blockedPlannerResult.artifact.id,
  blockedArchitectResult.artifact.id,
]);
assert.ok(blockedArchitectResult.decisionInboxItem);
assert.equal(blockedArchitectResult.inputArtifact.id, blockedPlannerResult.artifact.id);
assert.equal(blockedArchitectResult.decisionInboxItem.id, blockedInboxItems[0].id);
assert.equal(blockedArchitectResult.decisionInboxItem.blocksTask, true);
assert.equal(blockedArchitectResult.normalizedResult.needsDecision, true);
assert.equal(blockedArchitectResult.normalizedResult.blockers.length, 1);
assert.equal(blockedArchitectResult.nextStage, 'human gate');
assert.match(blockedLogs[blockedLogs.length - 1].message, /created architect decision inbox item/);
assert.equal(blockedArtifact.type, 'architecture');
assert.match(blockedArtifact.content, /^## Blocking Architecture Issues$/m);

const snapshot = runtime.getSnapshot();

assert.equal(Object.keys(snapshot.tasks).length, 2);
assert.equal(Object.keys(snapshot.runs).length, 4);
assert.equal(Object.keys(snapshot.artifacts).length, 4);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      readyPlannerRun: {
        id: readyResult.run.id,
        nextStage: readyResult.nextStage,
      },
      readyArchitectRun: {
        id: readyArchitectResult.run.id,
        nextStage: readyArchitectResult.nextStage,
      },
      blockedPlannerRun: {
        id: blockedPlannerResult.run.id,
        nextStage: blockedPlannerResult.nextStage,
      },
      blockedArchitectRun: {
        id: blockedArchitectResult.run.id,
        nextStage: blockedArchitectResult.nextStage,
        inboxItemId: blockedArchitectResult.decisionInboxItem.id,
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
