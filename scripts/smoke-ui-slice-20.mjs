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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-20');
const port = 4330;
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

  throw new Error('Timed out waiting for ui-slice-20 server');
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
    assert.match(indexHtml, /data-surface="deliverables"/);
    assert.match(appJs, /승인 라인 현황/);
    assert.match(appJs, /현재 승인 안건/);
    assert.match(appJs, /다음 운영 단계/);
    assert.match(appJs, /승인은 실행에서 처리합니다\. 산출물은 요약만 남깁니다\./);
    assert.match(appJs, /여기서는 리뷰 라인, 승인선, 종료 보고 경로를 먼저 봅니다\./);

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep the bridge summary UI-only and stop at the existing pending builder approval.',
      goal: 'Verify the primary orchestration surfaces explain the current approval target and the next operator step after council alignment.',
      title: 'Mission execution approval bridge smoke',
    });

    const mission = missionPayload.mission;
    const approvePayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );

    const task = approvePayload.task;
    const snapshot = approvePayload.snapshot;
    const linkedMission = snapshot.missions[mission.id];
    const approvals = Object.values(snapshot.approvals)
      .filter((approval) => approval.taskId === task.id)
      .sort((left, right) => {
        const leftValue = left.updatedAt || left.createdAt || '';
        const rightValue = right.updatedAt || right.createdAt || '';
        return rightValue.localeCompare(leftValue);
      });
    const latestApproval = approvals[0];
    const approvalItem = latestApproval?.inboxItemId
      ? snapshot.decisionInboxItems[latestApproval.inboxItemId]
      : null;
    const targetArtifact = latestApproval?.targetArtifactId
      ? snapshot.artifacts[latestApproval.targetArtifactId]
      : null;

    assert.equal(linkedMission.status, 'executing');
    assert.equal(linkedMission.linkedTaskId, task.id);
    assert.ok(latestApproval);
    assert.equal(latestApproval.status, 'pending');
    assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');
    assert.ok(approvalItem);
    assert.equal(approvalItem.kind, 'approval');
    assert.equal(approvalItem.status, 'pending');
    assert.ok(targetArtifact);
    assert.equal(targetArtifact.type, 'preflight');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            linkedTaskId: task.id,
            status: linkedMission.status,
          },
          approvalBridge: {
            approvalId: latestApproval.id,
            inboxItemId: approvalItem.id,
            allowedNextAction: latestApproval.allowedNextAction,
            targetArtifactId: targetArtifact.id,
            targetArtifactType: targetArtifact.type,
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
