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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-21');
const port = 4331;
const baseUrl = `http://127.0.0.1:${port}`;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

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
    } catch (_error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-21 server');
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

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /현재 지시 승인/);
    assert.match(appJs, /기존 pending builder 승인 기록을 그대로 재사용하며, 세부 태스크\/로그\/아티팩트\/결정함 제어는 관제실에 남깁니다\./);
    assert.match(appJs, /지휘 승인선/);

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep the primary approval CTA bounded to the existing builder approval only.',
      goal: 'Verify that Execution can approve the current builder gate without opening Advanced Ops first.',
      title: 'Primary approval CTA smoke',
    });

    const mission = missionPayload.mission;
    const approveCouncilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );

    const task = approveCouncilPayload.task;
    const pendingApproval = approveCouncilPayload.approval;
    const pendingInboxItemId = pendingApproval.inboxItemId;

    assert.equal(pendingApproval.status, 'pending');
    assert.equal(pendingApproval.allowedNextAction, 'builder-live-mutation');

    const approveGatePayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(pendingInboxItemId)}/actions`,
      { verb: 'approve' },
    );

    const approvedTask = approveGatePayload.snapshot.tasks[task.id];
    const approvedApproval = approveGatePayload.snapshot.approvals[pendingApproval.id];
    const builderGuard =
      approveGatePayload.derived.taskGuardSummaries[task.id].builderLiveMutation;

    assert.equal(approveGatePayload.mutation.kind, 'decision-inbox-action');
    assert.equal(approvedApproval.status, 'approved');
    assert.equal(approveGatePayload.snapshot.decisionInboxItems[pendingInboxItemId].status, 'resolved');
    assert.equal(approvedTask.flags.waitingApproval, false);
    assert.equal(builderGuard.allowed, true);
    assert.equal(builderGuard.latestApprovalStatus, 'approved');
    assert.equal(approveGatePayload.snapshot.missions[mission.id].status, 'executing');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            linkedTaskId: task.id,
            status: approveGatePayload.snapshot.missions[mission.id].status,
          },
          approval: {
            approvalId: pendingApproval.id,
            inboxItemId: pendingInboxItemId,
            status: approvedApproval.status,
          },
          builderGuard: {
            allowed: builderGuard.allowed,
            latestApprovalStatus: builderGuard.latestApprovalStatus,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
