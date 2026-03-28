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
    assert.match(indexHtml, /AI Orchestration/);
    assert.match(indexHtml, /Advanced Ops Mode/);
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

    const architectPayload = await fetchJson(
      `${baseUrl}/api/tasks/${encodeURIComponent(task.id)}/run-architect`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    const taskAfterArchitect = architectPayload.snapshot.tasks[task.id];

    assert.equal(architectPayload.mutation.kind, 'run-architect');
    assert.equal(architectPayload.mutation.taskId, task.id);
    assert.equal(architectPayload.mutation.inputArtifactId, runPayload.mutation.artifactId);
    assert.equal(architectPayload.mutation.inboxItemId, null);
    assert.equal(architectPayload.mutation.normalizedResult.needsDecision, false);
    assert.equal(architectPayload.mutation.normalizedResult.blockers.length, 0);
    assert.equal(taskAfterArchitect.lifecycleState, 'In Progress');
    assert.equal(taskAfterArchitect.latestRunId, architectPayload.mutation.runId);
    assert.deepEqual(taskAfterArchitect.artifactIds, [
      runPayload.mutation.artifactId,
      architectPayload.mutation.artifactId,
    ]);
    assert.equal(architectPayload.runLogs.run.id, architectPayload.mutation.runId);
    assert.equal(architectPayload.runLogs.logs.length, 6);
    assert.match(architectPayload.runLogs.logs[0].message, /architect run started/);
    assert.equal(architectPayload.artifactDetail.type, 'architecture');
    assert.match(architectPayload.artifactDetail.content, /^# Architecture Note:/m);
    assert.equal(Object.keys(architectPayload.snapshot.runs).length, 2);
    assert.equal(Object.keys(architectPayload.snapshot.artifacts).length, 2);
    assert.equal(Object.keys(architectPayload.snapshot.decisionInboxItems).length, 0);

    const blockedCreatePayload = await fetchJson(`${baseUrl}/api/tasks`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Architect block smoke',
        intent:
          'Plan a provider strategy change for the execution runtime so architect must raise a blocking decision item.',
      }),
    });

    const blockedTask = blockedCreatePayload.task;

    const blockedPlannerPayload = await fetchJson(
      `${baseUrl}/api/tasks/${encodeURIComponent(blockedTask.id)}/run-planner`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    assert.equal(blockedPlannerPayload.mutation.kind, 'run-planner');
    assert.equal(blockedPlannerPayload.mutation.inboxItemId, null);
    assert.equal(blockedPlannerPayload.mutation.normalizedResult.needsDecision, false);

    const blockedArchitectPayload = await fetchJson(
      `${baseUrl}/api/tasks/${encodeURIComponent(blockedTask.id)}/run-architect`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    const blockedTaskAfterArchitect = blockedArchitectPayload.snapshot.tasks[blockedTask.id];

    const persistedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const persistedLogs = await fetchJson(
      `${baseUrl}/api/runs/${encodeURIComponent(architectPayload.mutation.runId)}/logs`,
    );
    const persistedArtifact = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(architectPayload.mutation.artifactId)}`,
    );

    assert.equal(blockedArchitectPayload.mutation.kind, 'run-architect');
    assert.equal(
      blockedArchitectPayload.mutation.inputArtifactId,
      blockedPlannerPayload.mutation.artifactId,
    );
    assert.equal(blockedArchitectPayload.mutation.normalizedResult.needsDecision, true);
    assert.equal(blockedArchitectPayload.mutation.normalizedResult.blockers.length, 1);
    assert.ok(blockedArchitectPayload.mutation.inboxItemId);
    assert.equal(blockedTaskAfterArchitect.latestRunId, blockedArchitectPayload.mutation.runId);
    assert.equal(blockedTaskAfterArchitect.flags.blocked, true);
    assert.equal(blockedTaskAfterArchitect.flags.waitingDecision, true);
    assert.equal(Object.keys(blockedArchitectPayload.snapshot.decisionInboxItems).length, 1);

    assert.equal(
      persistedSnapshot.snapshot.tasks[task.id].latestRunId,
      architectPayload.mutation.runId,
    );
    assert.equal(persistedLogs.logs.length, architectPayload.runLogs.logs.length);
    assert.equal(persistedArtifact.artifact.id, architectPayload.mutation.artifactId);
    assert.match(persistedArtifact.artifact.content, /^## Boundary Fit Assessment$/m);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          readyTask: {
            id: task.id,
            lifecycleState: taskAfterArchitect.lifecycleState,
          },
          readyArchitectRun: {
            id: architectPayload.mutation.runId,
            logCount: architectPayload.runLogs.logs.length,
          },
          readyArchitectureArtifact: {
            id: architectPayload.mutation.artifactId,
            type: architectPayload.artifactDetail.type,
          },
          blockedArchitectRun: {
            id: blockedArchitectPayload.mutation.runId,
            inboxItemId: blockedArchitectPayload.mutation.inboxItemId,
          },
          decisionInboxItems: Object.keys(blockedArchitectPayload.snapshot.decisionInboxItems).length,
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
