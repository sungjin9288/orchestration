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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-16');
const port = 4326;
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

  throw new Error('Timed out waiting for ui-slice-16 server');
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
    assert.match(indexHtml, /data-surface="deliverables"/);
    assert.match(indexHtml, /surface-deliverables/);
    assert.match(appJs, /Latest Artifact Package/);
    assert.match(appJs, /Latest Review State/);
    assert.match(appJs, /Latest Approval State/);

    const missionPayload = await postJson('/api/missions', {
      constraints: 'Keep deliverables summary read-only and preserve current downstream semantics.',
      goal: 'Create one mission that reaches deliverables summary after council alignment and upstream execution auto chain.',
      title: 'Deliverables summary smoke',
    });
    const mission = missionPayload.mission;

    await postJson(`/api/missions/${encodeURIComponent(mission.id)}/draft-council`);
    const approvalPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );

    const task = approvalPayload.task;
    const snapshot = approvalPayload.snapshot;
    const linkedTask = snapshot.tasks[task.id];
    const linkedMission = snapshot.missions[mission.id];
    const taskArtifacts = Object.values(snapshot.artifacts).filter((artifact) => artifact.taskId === task.id);
    const latestArtifact = [...taskArtifacts].sort((left, right) => {
      const leftValue = left.updatedAt || left.createdAt || '';
      const rightValue = right.updatedAt || right.createdAt || '';
      return rightValue.localeCompare(leftValue);
    })[0];
    const latestApproval = Object.values(snapshot.approvals)
      .filter((approval) => approval.taskId === task.id)
      .sort((left, right) => {
        const leftValue = left.updatedAt || left.createdAt || '';
        const rightValue = right.updatedAt || right.createdAt || '';
        return rightValue.localeCompare(leftValue);
      })[0];

    assert.equal(linkedMission.status, 'executing');
    assert.ok(linkedMission.linkedTaskId);
    assert.equal(taskArtifacts.length >= 4, true);
    assert.equal(taskArtifacts.some((artifact) => artifact.type === 'preflight'), true);
    assert.equal(linkedTask.review.status, 'pending');
    assert.ok(latestArtifact);
    assert.ok(latestApproval);
    assert.equal(latestApproval.status, 'pending');
    assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            status: linkedMission.status,
            linkedTaskId: linkedMission.linkedTaskId,
          },
          deliverables: {
            latestArtifactId: latestArtifact.id,
            latestArtifactType: latestArtifact.type,
            reviewStatus: linkedTask.review.status,
            approvalId: latestApproval.id,
            approvalStatus: latestApproval.status,
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
