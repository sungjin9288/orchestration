import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-02');
const port = 4312;
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (error) {
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-02 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stderr = '';

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const noProjectResponse = await fetch(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Should fail without project',
      }),
    });
    const noProjectPayload = await noProjectResponse.json();

    assert.equal(noProjectResponse.status, 400);
    assert.match(noProjectPayload.error, /Active project is required/i);

    const project = runtime.createProject({
      name: 'orchestration',
      projectPath: repoRoot,
    });

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.match(indexHtml, /Ops Shell/);
    assert.match(indexHtml, /Taskboard/);

    const createPayload = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'UI slice 02 smoke',
        intent: 'Create a task from the shell and start planner run from the same shell flow.',
      }),
    });

    const task = createPayload.task;

    assert.equal(createPayload.mutation.kind, 'create-task');
    assert.equal(createPayload.snapshot.activeProjectId, project.id);
    assert.equal(createPayload.snapshot.tasks[task.id].title, 'UI slice 02 smoke');
    assert.equal(Object.keys(createPayload.snapshot.tasks).length, 1);

    const runPayload = await fetchJson(`${baseUrl}/api/tasks/${encodeURIComponent(task.id)}/run-planner`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const taskAfterRun = runPayload.snapshot.tasks[task.id];

    assert.equal(runPayload.mutation.kind, 'run-planner');
    assert.equal(runPayload.mutation.taskId, task.id);
    assert.equal(runPayload.mutation.inboxItemId, null);
    assert.equal(runPayload.mutation.normalizedResult.needsDecision, false);
    assert.equal(runPayload.mutation.normalizedResult.blockers.length, 0);
    assert.equal(taskAfterRun.lifecycleState, 'In Progress');
    assert.equal(taskAfterRun.latestRunId, runPayload.mutation.runId);
    assert.deepEqual(taskAfterRun.artifactIds, [runPayload.mutation.artifactId]);
    assert.equal(runPayload.runLogs.run.id, runPayload.mutation.runId);
    assert.equal(runPayload.runLogs.logs.length, 5);
    assert.match(runPayload.runLogs.logs[0].message, /planner run started/);
    assert.equal(runPayload.artifactDetail.type, 'plan');
    assert.match(runPayload.artifactDetail.content, /^# Plan:/m);
    assert.equal(Object.keys(runPayload.snapshot.runs).length, 1);
    assert.equal(Object.keys(runPayload.snapshot.artifacts).length, 1);
    assert.equal(Object.keys(runPayload.snapshot.decisionInboxItems).length, 0);

    const persistedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const persistedLogs = await fetchJson(
      `${baseUrl}/api/runs/${encodeURIComponent(runPayload.mutation.runId)}/logs`,
    );
    const persistedArtifact = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(runPayload.mutation.artifactId)}`,
    );

    assert.equal(persistedSnapshot.snapshot.tasks[task.id].latestRunId, runPayload.mutation.runId);
    assert.equal(persistedLogs.logs.length, runPayload.runLogs.logs.length);
    assert.equal(persistedArtifact.artifact.id, runPayload.mutation.artifactId);
    assert.match(persistedArtifact.artifact.content, /^## Slice Goal$/m);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          task: {
            id: task.id,
            lifecycleState: taskAfterRun.lifecycleState,
          },
          run: {
            id: runPayload.mutation.runId,
            logCount: runPayload.runLogs.logs.length,
          },
          artifact: {
            id: runPayload.mutation.artifactId,
            type: runPayload.artifactDetail.type,
          },
          decisionInboxItems: Object.keys(runPayload.snapshot.decisionInboxItems).length,
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(150);

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

await main();
