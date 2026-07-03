import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-06');
const port = 4318;
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

  throw new Error('Timed out waiting for ui-slice-06 server');
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
    const taskSummariesPath = path.join(repoRoot, 'ui', 'task-summaries.js');
    const taskSummaries = fs.readFileSync(taskSummariesPath, 'utf8');

    assert.equal(appJsResponse.status, 200);
    assert.equal(stylesResponse.status, 200);
    assert.match(appJs, /라이브 변경 승인 요청/);
    assert.match(appJs, /request-builder-live-mutation-approval/);
    assert.match(taskSummaries, /builderLiveMutationApprovalRequest/);
    assert.match(appJs, /현재 프리플라이트 아티팩트 기준으로 빌더 라이브 변경 승인 게이트가 생성된 상태입니다\./);
    assert.match(appJs, /preferredInboxItemId: payload\.mutation\.inboxItemId \|\| null/);
    assert.match(stylesCss, /\.guard-summary/);

    const noPreflightTaskPayload = await postJson('/api/tasks', {
      title: 'Live mutation approval request requires preflight',
      intent: 'Request creation must fail until a latest preflight exists.',
    });
    const noPreflightError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(noPreflightTaskPayload.task.id)}/request-builder-live-mutation-approval`,
      400,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetArtifactId: 'artifact-9999', targetRunId: 'run-9999' }),
      },
    );

    assert.match(noPreflightError.error, /latest preflight artifact required/i);

    const liveTaskPayload = await postJson('/api/tasks', {
      title: 'Live mutation approval request UI flow',
      intent: 'Show request status, server-side targeting, duplicate blocking, and stale/rejected re-request.',
    });
    const liveTask = liveTaskPayload.task;
    await runThroughTaskBreaker(liveTask.id);
    const firstPreflightPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/run-builder-preflight`,
    );

    const requestPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/request-builder-live-mutation-approval`,
      { targetArtifactId: 'artifact-9999', targetRunId: 'run-9999' },
    );

    assert.equal(requestPayload.mutation.kind, 'request-builder-live-mutation-approval');
    assert.ok(requestPayload.mutation.approvalId);
    assert.ok(requestPayload.mutation.inboxItemId);
    assert.equal(
      requestPayload.mutation.targetArtifactId,
      firstPreflightPayload.mutation.artifactId,
    );
    assert.equal(requestPayload.mutation.targetRunId, firstPreflightPayload.mutation.runId);
    assert.equal(
      requestPayload.snapshot.approvals[requestPayload.mutation.approvalId].targetArtifactId,
      firstPreflightPayload.mutation.artifactId,
    );
    assert.equal(
      requestPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation
        .latestApprovalDisplayStatus,
      'pending',
    );
    assert.equal(
      requestPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .allowed,
      false,
    );
    assert.equal(
      requestPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .conflict,
      true,
    );

    const duplicateRequestError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(liveTask.id)}/request-builder-live-mutation-approval`,
      409,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      },
    );

    assert.match(duplicateRequestError.error, /already pending/i);

    const rejectedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(requestPayload.mutation.inboxItemId)}/actions`,
      { verb: 'reject' },
    );

    assert.equal(
      rejectedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation
        .latestApprovalDisplayStatus,
      'rejected',
    );
    assert.equal(
      rejectedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .allowed,
      true,
    );

    const rerequestPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/request-builder-live-mutation-approval`,
    );

    const approvedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(rerequestPayload.mutation.inboxItemId)}/actions`,
      { verb: 'approve' },
    );

    assert.equal(
      approvedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation
        .latestApprovalDisplayStatus,
      'approved',
    );
    assert.equal(
      approvedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .allowed,
      false,
    );
    assert.equal(
      approvedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .conflict,
      true,
    );

    const secondPreflightPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/run-builder-preflight`,
    );

    assert.notEqual(secondPreflightPayload.mutation.artifactId, firstPreflightPayload.mutation.artifactId);
    assert.equal(
      secondPreflightPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation
        .latestApprovalDisplayStatus,
      'stale',
    );
    assert.equal(
      secondPreflightPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .allowed,
      true,
    );

    runtime.createDecisionInboxItem({
      taskId: liveTask.id,
      title: 'Blocking decision before refreshed approval request',
      prompt: 'Resolve a blocking decision before requesting a fresh live mutation approval.',
      blocksTask: true,
    });

    const blockingSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const blockingRequestError = await fetchExpectedError(
      `${baseUrl}/api/tasks/${encodeURIComponent(liveTask.id)}/request-builder-live-mutation-approval`,
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

    assert.equal(
      blockingSnapshot.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest
        .allowed,
      false,
    );
    assert.match(
      blockingSnapshot.derived.taskGuardSummaries[liveTask.id].builderLiveMutationApprovalRequest.reasons.join(
        '; ',
      ),
      /blocking decision items/i,
    );
    assert.match(blockingRequestError.error, /blocking decision items/i);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          taskId: liveTask.id,
          firstPreflightArtifactId: firstPreflightPayload.mutation.artifactId,
          secondPreflightArtifactId: secondPreflightPayload.mutation.artifactId,
          latestApprovalDisplayStatus:
            secondPreflightPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation
              .latestApprovalDisplayStatus,
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
