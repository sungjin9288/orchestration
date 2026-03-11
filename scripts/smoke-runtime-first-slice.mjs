import assert from 'node:assert/strict';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtime = createRuntimeService({
  runtimeRoot: path.join(process.cwd(), 'var', 'runtime'),
});

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Runtime first slice smoke',
  intent: 'Create the minimum runtime path for project, task, run, log, artifact, and review pending.',
});

const run = runtime.startPlaceholderRun({ taskId: task.id });

runtime.appendLog({
  runId: run.id,
  message: 'placeholder run started',
});

const artifact = runtime.recordArtifact({
  taskId: task.id,
  runId: run.id,
  content: '# runtime-first-slice\n\nplaceholder artifact\n',
});

runtime.finishRunWithReviewPending({ runId: run.id });

const projectRead = runtime.getProject(project.id);
const taskRead = runtime.getTask(task.id);
const runRead = runtime.getRun(run.id);
const logsRead = runtime.getLogs(run.id);
const artifactRead = runtime.getArtifact(artifact.id);
const snapshot = runtime.getSnapshot();

assert.equal(Object.keys(snapshot.projects).length, 1);
assert.equal(Object.keys(snapshot.tasks).length, 1);
assert.equal(Object.keys(snapshot.runs).length, 1);
assert.equal(Object.keys(snapshot.artifacts).length, 1);
assert.equal(projectRead.projectPath, process.cwd());
assert.equal(taskRead.projectId, project.id);
assert.equal(taskRead.lifecycleState, 'Review');
assert.equal(taskRead.review.status, 'pending');
assert.equal(taskRead.latestRunId, run.id);
assert.deepEqual(taskRead.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.equal(runRead.status, 'completed');
assert.equal(logsRead.length, 1);
assert.equal(logsRead[0].message, 'placeholder run started');
assert.equal(artifactRead.runId, run.id);
assert.equal(artifactRead.type, 'output');
assert.match(artifactRead.content, /placeholder artifact/);

console.log(
  JSON.stringify(
    {
      ok: true,
      counts: {
        projects: Object.keys(snapshot.projects).length,
        tasks: Object.keys(snapshot.tasks).length,
        runs: Object.keys(snapshot.runs).length,
        artifacts: Object.keys(snapshot.artifacts).length,
        logs: logsRead.length,
      },
      task: {
        id: taskRead.id,
        lifecycleState: taskRead.lifecycleState,
        reviewStatus: taskRead.review.status,
      },
    },
    null,
    2,
  ),
);
