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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-04');
const port = 4316;
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function fetchExpectedError(url, expectedStatus, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  assert.equal(response.status, expectedStatus);
  return payload;
}

async function postJson(pathname, body = {}) {
  return fetchJson(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
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

  throw new Error('Timed out waiting for ui-slice-04 server');
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

    runtime.createProject({
      name: 'orchestration',
      projectPath: repoRoot,
    });

    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();
    const stylesResponse = await fetch(`${baseUrl}/styles.css`);
    const stylesCss = await stylesResponse.text();

    assert.equal(appJsResponse.status, 200);
    assert.equal(stylesResponse.status, 200);
    assert.match(appJs, /태스크 분해 실행/);
    assert.match(appJs, /생성된 하위 작업/);
    assert.match(appJs, /run-task-breaker/);
    assert.match(stylesCss, /\.breakdown-structured/);

    const readyTaskPayload = await postJson('/api/tasks', {
      title: 'Task-breaker UI happy path',
      intent: 'Run planner, architect, then task-breaker and inspect the saved breakdown artifact.',
    });
    const readyTask = readyTaskPayload.task;
    const readyPlannerPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-planner`,
    );
    const readyArchitectPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-architect`,
    );
    const readyTaskBreakerPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-task-breaker`,
    );
    const readyPersistedBreakdown = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(readyTaskBreakerPayload.mutation.artifactId)}`,
    );

    assert.equal(readyTaskBreakerPayload.mutation.kind, 'run-task-breaker');
    assert.equal(readyTaskBreakerPayload.mutation.taskId, readyTask.id);
    assert.equal(readyTaskBreakerPayload.mutation.inboxItemId, null);
    assert.deepEqual(readyTaskBreakerPayload.mutation.inputArtifactIds, [
      readyPlannerPayload.mutation.artifactId,
      readyArchitectPayload.mutation.artifactId,
    ]);
    assert.equal(readyTaskBreakerPayload.mutation.normalizedResult.needsDecision, false);
    assert.equal(readyTaskBreakerPayload.mutation.normalizedResult.nextStage, 'builder');
    assert.equal(readyTaskBreakerPayload.snapshot.tasks[readyTask.id].latestRunId, readyTaskBreakerPayload.mutation.runId);
    assert.deepEqual(readyTaskBreakerPayload.snapshot.tasks[readyTask.id].artifactIds, [
      readyPlannerPayload.mutation.artifactId,
      readyArchitectPayload.mutation.artifactId,
      readyTaskBreakerPayload.mutation.artifactId,
    ]);
    assert.equal(readyTaskBreakerPayload.snapshot.artifacts[readyTaskBreakerPayload.mutation.artifactId].type, 'breakdown');
    assert.equal(readyTaskBreakerPayload.runLogs.logs.length, 7);
    assert.match(readyTaskBreakerPayload.runLogs.logs[0].message, /task-breaker run started/);
    assert.match(readyTaskBreakerPayload.artifactDetail.content, /^# Task Breakdown:/m);
    assert.match(readyTaskBreakerPayload.artifactDetail.content, /^## Ordered Sub-Tasks$/m);
    assert.match(readyTaskBreakerPayload.artifactDetail.content, /^## Execution Boundary Summary$/m);
    assert.equal(readyPersistedBreakdown.artifact.id, readyTaskBreakerPayload.mutation.artifactId);

    const blockingTaskPayload = await postJson('/api/tasks', {
      title: 'Task-breaker UI blocking decision',
      intent:
        'Run task-breaker, but an operator choice is still required before builder handoff.',
    });
    const blockingTask = blockingTaskPayload.task;

    await postJson(`/api/tasks/${encodeURIComponent(blockingTask.id)}/run-planner`);
    await postJson(`/api/tasks/${encodeURIComponent(blockingTask.id)}/run-architect`);
    const blockingTaskBreakerPayload = await postJson(
      `/api/tasks/${encodeURIComponent(blockingTask.id)}/run-task-breaker`,
    );
    const blockingInboxItem =
      blockingTaskBreakerPayload.snapshot.decisionInboxItems[
        blockingTaskBreakerPayload.mutation.inboxItemId
      ];

    assert.equal(blockingTaskBreakerPayload.mutation.kind, 'run-task-breaker');
    assert.equal(blockingTaskBreakerPayload.mutation.normalizedResult.needsDecision, true);
    assert.equal(blockingTaskBreakerPayload.mutation.normalizedResult.nextStage, 'human gate');
    assert.ok(blockingTaskBreakerPayload.mutation.inboxItemId);
    assert.equal(blockingInboxItem.kind, 'decision');
    assert.equal(blockingInboxItem.status, 'pending');
    assert.equal(blockingInboxItem.blocksTask, true);
    assert.equal(blockingTaskBreakerPayload.snapshot.tasks[blockingTask.id].flags.blocked, true);
    assert.equal(
      blockingTaskBreakerPayload.snapshot.tasks[blockingTask.id].flags.waitingDecision,
      true,
    );

    const noArchitectureTaskPayload = await postJson('/api/tasks', {
      title: 'Task-breaker guard without architecture',
      intent: 'Confirm task-breaker returns 400 before any run starts when architecture is missing.',
    });
    const noArchitectureTask = noArchitectureTaskPayload.task;
    await postJson(`/api/tasks/${encodeURIComponent(noArchitectureTask.id)}/run-planner`);
    const noArchitectureBefore = await fetchJson(`${baseUrl}/api/snapshot`);
    const noArchitectureError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(noArchitectureTask.id)}/run-task-breaker`,
      400,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );
    const noArchitectureAfter = await fetchJson(`${baseUrl}/api/snapshot`);

    assert.match(
      noArchitectureError.error,
      /latest architecture artifact required|Architecture artifact is required before task-breaker run|최신 설계 아티팩트가 필요합니다\./i,
    );
    assert.equal(
      Object.keys(noArchitectureAfter.snapshot.runs).length,
      Object.keys(noArchitectureBefore.snapshot.runs).length,
    );
    assert.equal(
      Object.keys(noArchitectureAfter.snapshot.artifacts).length,
      Object.keys(noArchitectureBefore.snapshot.artifacts).length,
    );

    const approvalBlockedTask = runtime.createTask({
      projectId: runtime.getSnapshot().activeProjectId,
      title: 'Task-breaker guard with approval',
      intent: 'Confirm server guard returns 400 while a pending approval still exists.',
    });

    await postJson(`/api/tasks/${encodeURIComponent(approvalBlockedTask.id)}/run-planner`);
    await postJson(`/api/tasks/${encodeURIComponent(approvalBlockedTask.id)}/run-architect`);
    runtime.createApprovalPlaceholder({
      taskId: approvalBlockedTask.id,
      allowedNextAction: 'commit',
      prompt: 'Approval is still pending before task-breaker may continue.',
      scope: 'commit',
      title: 'Approval required before task-breaker',
    });

    const approvalBlockedBefore = await fetchJson(`${baseUrl}/api/snapshot`);
    const approvalBlockedError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(approvalBlockedTask.id)}/run-task-breaker`,
      400,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );
    const approvalBlockedAfter = await fetchJson(`${baseUrl}/api/snapshot`);

    assert.match(
      approvalBlockedError.error,
      /cannot run task-breaker while gates remain active: pending approvals|대기 중인 승인/i,
    );
    assert.equal(
      Object.keys(approvalBlockedAfter.snapshot.runs).length,
      Object.keys(approvalBlockedBefore.snapshot.runs).length,
    );
    assert.equal(
      Object.keys(approvalBlockedAfter.snapshot.artifacts).length,
      Object.keys(approvalBlockedBefore.snapshot.artifacts).length,
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          happyPath: {
            breakdownArtifactId: readyTaskBreakerPayload.mutation.artifactId,
            runId: readyTaskBreakerPayload.mutation.runId,
          },
          blockingDecision: {
            inboxItemId: blockingTaskBreakerPayload.mutation.inboxItemId,
            taskId: blockingTask.id,
          },
          guardedTasks: {
            approvalBlockedTaskId: approvalBlockedTask.id,
            noArchitectureTaskId: noArchitectureTask.id,
          },
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
