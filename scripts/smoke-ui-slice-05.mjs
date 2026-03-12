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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-05');
const port = 4317;
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

  throw new Error('Timed out waiting for ui-slice-05 server');
}

async function runThroughTaskBreaker(taskId) {
  const plannerPayload = await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);
  const architectPayload = await postJson(
    `/api/tasks/${encodeURIComponent(taskId)}/run-architect`,
  );
  const taskBreakerPayload = await postJson(
    `/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`,
  );

  return {
    architectPayload,
    plannerPayload,
    taskBreakerPayload,
  };
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
    assert.match(appJs, /Run Builder Preflight/);
    assert.match(appJs, /Latest Builder Preflight/);
    assert.match(appJs, /renderStructuredPreflight/);
    assert.match(appJs, /compact summary/);
    assert.equal((appJs.match(/applyTaskInboxPreselect: true/g) || []).length, 3);
    assert.match(stylesCss, /\.compact-list/);

    const readyTaskPayload = await postJson('/api/tasks', {
      title: 'Builder preflight UI happy path',
      intent: 'Run planner, architect, task-breaker, and builder preflight without live mutation.',
    });
    const readyTask = readyTaskPayload.task;
    const readySetup = await runThroughTaskBreaker(readyTask.id);
    const readyBuilderPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-builder-preflight`,
    );
    const readyArtifact = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(readyBuilderPayload.mutation.artifactId)}`,
    );

    assert.equal(readyBuilderPayload.mutation.kind, 'run-builder-preflight');
    assert.equal(readyBuilderPayload.mutation.taskId, readyTask.id);
    assert.equal(readyBuilderPayload.mutation.inboxItemId, null);
    assert.equal(readyBuilderPayload.mutation.normalizedResult.nextStage, 'reviewer');
    assert.deepEqual(readyBuilderPayload.mutation.inputArtifactIds, [
      readySetup.plannerPayload.mutation.artifactId,
      readySetup.architectPayload.mutation.artifactId,
      readySetup.taskBreakerPayload.mutation.artifactId,
    ]);
    assert.equal(
      readyBuilderPayload.snapshot.tasks[readyTask.id].latestRunId,
      readyBuilderPayload.mutation.runId,
    );
    assert.equal(
      readyBuilderPayload.snapshot.artifacts[readyBuilderPayload.mutation.artifactId].type,
      'preflight',
    );
    assert.match(readyArtifact.artifact.content, /^# Builder Preflight:/m);
    assert.match(readyArtifact.artifact.content, /^## Target Files$/m);
    assert.match(readyArtifact.artifact.content, /^## Escalation Triggers$/m);

    const blockingTaskPayload = await postJson('/api/tasks', {
      title: 'Builder preflight UI blocking decision',
      intent:
        'Builder preflight should surface a blocking risk before live execution because human approval before live execution is still required.',
    });
    const blockingTask = blockingTaskPayload.task;

    await runThroughTaskBreaker(blockingTask.id);
    const blockingBuilderPayload = await postJson(
      `/api/tasks/${encodeURIComponent(blockingTask.id)}/run-builder-preflight`,
    );
    const blockingInboxItem =
      blockingBuilderPayload.snapshot.decisionInboxItems[
        blockingBuilderPayload.mutation.inboxItemId
      ];

    assert.ok(blockingBuilderPayload.mutation.inboxItemId);
    assert.equal(blockingBuilderPayload.mutation.normalizedResult.nextStage, 'human gate');
    assert.equal(blockingInboxItem.kind, 'decision');
    assert.equal(blockingInboxItem.status, 'pending');
    assert.equal(blockingInboxItem.blocksTask, true);

    const approvalTask = runtime.createTask({
      projectId: runtime.getSnapshot().activeProjectId,
      title: 'Builder preflight UI approve action',
      intent: 'Confirm approval actions update the current task state before preflight runs.',
    });
    const approvalSetup = await runThroughTaskBreaker(approvalTask.id);
    const approvalRecord = runtime.createApprovalPlaceholder({
      taskId: approvalTask.id,
      allowedNextAction: 'commit',
      prompt: 'Approval is still pending before builder preflight may continue.',
      scope: 'commit',
      title: 'Approval required before builder preflight',
    });
    const approvalBlockedError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(approvalTask.id)}/run-builder-preflight`,
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
    const approvedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(approvalRecord.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const approvedBuilderPayload = await postJson(
      `/api/tasks/${encodeURIComponent(approvalTask.id)}/run-builder-preflight`,
    );

    assert.match(
      approvalBlockedError.error,
      /cannot run builder preflight while gates remain active: pending approvals/i,
    );
    assert.equal(approvedPayload.mutation.kind, 'decision-inbox-action');
    assert.equal(approvedPayload.mutation.verb, 'approve');
    assert.equal(approvedPayload.snapshot.approvals[approvalRecord.id].status, 'approved');
    assert.equal(approvedPayload.snapshot.tasks[approvalTask.id].flags.waitingApproval, false);
    assert.equal(approvedBuilderPayload.mutation.kind, 'run-builder-preflight');
    assert.deepEqual(approvedBuilderPayload.mutation.inputArtifactIds, [
      approvalSetup.plannerPayload.mutation.artifactId,
      approvalSetup.architectPayload.mutation.artifactId,
      approvalSetup.taskBreakerPayload.mutation.artifactId,
    ]);

    const rejectTask = runtime.createTask({
      projectId: runtime.getSnapshot().activeProjectId,
      title: 'Builder preflight UI reject action',
      intent: 'Confirm reject mirrors the server snapshot without changing semantics in the UI slice.',
    });

    await runThroughTaskBreaker(rejectTask.id);
    const rejectedApproval = runtime.createApprovalPlaceholder({
      taskId: rejectTask.id,
      allowedNextAction: 'commit',
      prompt: 'Approval is still pending before builder preflight may continue.',
      scope: 'commit',
      title: 'Approval required before builder preflight',
    });
    const rejectedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(rejectedApproval.inboxItemId)}/actions`,
      { verb: 'reject' },
    );

    assert.equal(rejectedPayload.mutation.kind, 'decision-inbox-action');
    assert.equal(rejectedPayload.mutation.verb, 'reject');
    assert.equal(rejectedPayload.snapshot.approvals[rejectedApproval.id].status, 'rejected');
    assert.equal(rejectedPayload.snapshot.tasks[rejectTask.id].flags.waitingApproval, false);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          happyPath: {
            artifactId: readyBuilderPayload.mutation.artifactId,
            runId: readyBuilderPayload.mutation.runId,
          },
          blockingDecision: {
            inboxItemId: blockingBuilderPayload.mutation.inboxItemId,
            taskId: blockingTask.id,
          },
          approvalActions: {
            approvedInboxItemId: approvalRecord.inboxItemId,
            rejectedInboxItemId: rejectedApproval.inboxItemId,
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
