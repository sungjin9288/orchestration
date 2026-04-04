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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-03');
const port = 4314;
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

  throw new Error('Timed out waiting for ui-slice-03 server');
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

    const project = runtime.createProject({
      name: 'orchestration',
      projectPath: repoRoot,
    });

    const noPlanTaskPayload = await postJson('/api/tasks', {
      title: 'Architect disabled without plan',
      intent: 'Confirm architect stays unavailable until planner stores a plan artifact.',
    });
    const noPlanTask = noPlanTaskPayload.task;

    const noPlanArchitectError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(noPlanTask.id)}/run-architect`,
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

    assert.match(noPlanArchitectError.error, /Plan artifact is required before architect run/i);

    const readyTaskPayload = await postJson('/api/tasks', {
      title: 'Architect happy path',
      intent: 'Run planner, then architect, and inspect the saved architecture artifact.',
    });
    const readyTask = readyTaskPayload.task;

    const plannerPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-planner`,
    );
    const architectPayload = await postJson(
      `/api/tasks/${encodeURIComponent(readyTask.id)}/run-architect`,
    );
    const persistedArchitectureArtifact = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(architectPayload.mutation.artifactId)}`,
    );

    assert.equal(plannerPayload.mutation.kind, 'run-planner');
    assert.equal(architectPayload.mutation.kind, 'run-architect');
    assert.equal(architectPayload.mutation.taskId, readyTask.id);
    assert.equal(architectPayload.mutation.inputArtifactId, plannerPayload.mutation.artifactId);
    assert.equal(architectPayload.mutation.inboxItemId, null);
    assert.equal(architectPayload.snapshot.tasks[readyTask.id].latestRunId, architectPayload.mutation.runId);
    assert.equal(architectPayload.snapshot.artifacts[architectPayload.mutation.artifactId].type, 'architecture');
    assert.match(persistedArchitectureArtifact.artifact.content, /^# Architecture Note:/m);

    const approvalApproveTask = runtime.createTask({
      projectId: project.id,
      title: 'Approval approve smoke',
      intent: 'Confirm approval items can be approved from the shell action route.',
    });
    const approvalApprove = runtime.createApprovalPlaceholder({
      taskId: approvalApproveTask.id,
      allowedNextAction: 'commit-ready',
      scope: 'commit',
      title: 'Approval required: commit-ready',
    });
    const approvePayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(approvalApprove.inboxItemId)}/actions`,
      { verb: 'approve' },
    );

    assert.equal(approvePayload.mutation.kind, 'decision-inbox-action');
    assert.equal(approvePayload.mutation.verb, 'approve');
    assert.equal(approvePayload.snapshot.approvals[approvalApprove.id].status, 'approved');
    assert.equal(
      approvePayload.snapshot.decisionInboxItems[approvalApprove.inboxItemId].status,
      'resolved',
    );
    assert.equal(approvePayload.snapshot.tasks[approvalApproveTask.id].flags.waitingApproval, false);

    const approvalRejectTask = runtime.createTask({
      projectId: project.id,
      title: 'Approval reject smoke',
      intent: 'Confirm approval items can be rejected from the shell action route.',
    });
    const approvalReject = runtime.createApprovalPlaceholder({
      taskId: approvalRejectTask.id,
      allowedNextAction: 'commit-ready',
      scope: 'commit',
      title: 'Approval required: commit-ready',
    });
    const rejectPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(approvalReject.inboxItemId)}/actions`,
      { verb: 'reject' },
    );

    assert.equal(rejectPayload.mutation.verb, 'reject');
    assert.equal(rejectPayload.snapshot.approvals[approvalReject.id].status, 'rejected');
    assert.equal(
      rejectPayload.snapshot.decisionInboxItems[approvalReject.inboxItemId].status,
      'resolved',
    );
    assert.equal(rejectPayload.snapshot.tasks[approvalRejectTask.id].flags.waitingApproval, false);

    const decisionTask = runtime.createTask({
      projectId: project.id,
      title: 'Decision resolve smoke',
      intent: 'Confirm decision items can be resolved from the shell action route.',
    });
    const decisionItem = runtime.createDecisionInboxItem({
      blocksTask: true,
      prompt: 'Resolve the pending architecture question.',
      taskId: decisionTask.id,
      title: 'Architecture decision required',
    });
    const resolvePayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(decisionItem.id)}/actions`,
      { verb: 'resolve' },
    );

    assert.equal(resolvePayload.mutation.verb, 'resolve');
    assert.equal(resolvePayload.snapshot.decisionInboxItems[decisionItem.id].status, 'resolved');
    assert.equal(resolvePayload.snapshot.tasks[decisionTask.id].flags.blocked, false);
    assert.equal(resolvePayload.snapshot.tasks[decisionTask.id].flags.waitingDecision, false);

    const resolvedAgainError = await fetchExpectedError(
      `${baseUrl}/api/decision-inbox/${encodeURIComponent(decisionItem.id)}/actions`,
      409,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verb: 'resolve' }),
      },
    );

    assert.match(resolvedAgainError.error, /이미 resolved 상태/i);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          noPlanTask: noPlanTask.id,
          readyTask: {
            architectureArtifactId: architectPayload.mutation.artifactId,
            id: readyTask.id,
            planArtifactId: plannerPayload.mutation.artifactId,
          },
          approvalActions: {
            approved: approvalApprove.id,
            rejected: approvalReject.id,
          },
          decisionAction: {
            id: decisionItem.id,
            status: resolvePayload.snapshot.decisionInboxItems[decisionItem.id].status,
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
