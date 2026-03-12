import assert from 'node:assert/strict';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-execution-slice-01');
const runtime = createRuntimeService({ runtimeRoot });

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Execution slice 01 smoke',
  intent: 'Verify planner-only execution through coordinator, adapter, logs, and plan artifact storage.',
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot: process.cwd(),
  runtimeService: runtime,
});

const result = await coordinator.runPlanner({
  taskId: task.id,
  routingOutcome: {
    classification: 'new task',
    scopeStatement:
      'Implement execution-slice-01 with a planner-only run path, single adapter boundary, runtime logs, and a stored plan artifact.',
    missingContext: [],
    decisionNote: '',
  },
});

const run = runtime.getRun(result.run.id);
const logs = runtime.getLogs(run.id);
const artifact = runtime.getArtifact(result.artifact.id);
const snapshot = runtime.getSnapshot();

assert.equal(run.kind, 'role');
assert.equal(run.role, 'planner');
assert.equal(run.status, 'completed');
assert.equal(run.summary.nextStage, 'architect');
assert.equal(run.summary.adapter, 'local-stub');
assert.equal(logs.length, 5);
assert.match(logs[0].message, /planner run started/);
assert.match(logs[1].message, /loaded planner prompt contract/);
assert.match(logs[2].message, /built planner execution request/);
assert.match(logs[3].message, /invoking provider adapter local-stub/);
assert.match(logs[4].message, /saved planner output artifact/);
assert.equal(artifact.type, 'plan');
assert.match(artifact.content, /^# Plan:/m);
assert.match(artifact.content, /^## Slice Goal$/m);
assert.match(artifact.content, /^## Verification Approach$/m);
assert.equal(Object.keys(snapshot.runs).length, 1);
assert.equal(Object.keys(snapshot.artifacts).length, 1);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 0);
assert.equal(Object.keys(snapshot.approvals).length, 0);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      run: {
        id: run.id,
        kind: run.kind,
        role: run.role,
        status: run.status,
      },
      artifact: {
        id: artifact.id,
        type: artifact.type,
      },
      counts: {
        tasks: Object.keys(snapshot.tasks).length,
        runs: Object.keys(snapshot.runs).length,
        artifacts: Object.keys(snapshot.artifacts).length,
      },
    },
    null,
    2,
  ),
);
