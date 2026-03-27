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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-15');
const port = 4325;
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

  throw new Error('Timed out waiting for ui-slice-15 server');
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
    assert.match(indexHtml, /surface-execution/);
    assert.match(appJs, /Open Execution/);

    const missionPayload = await postJson('/api/missions', {
      constraints: 'Keep the first execution auto chain bounded to preflight and stop at the existing gate.',
      goal: 'Advance one mission from council approval into planner, architect, task-breaker, builder preflight, and live mutation approval request.',
      title: 'Execution auto chain smoke',
    });
    const mission = missionPayload.mission;

    const councilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/draft-council`,
    );
    const councilSession = councilPayload.councilSession;

    const approvalPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );

    const task = approvalPayload.task;
    const snapshot = approvalPayload.snapshot;
    const autoChain = approvalPayload.mutation.autoChain;
    const linkedTask = snapshot.tasks[task.id];
    const linkedMission = snapshot.missions[mission.id];
    const preflightArtifactId = approvalPayload.approval.targetArtifactId;
    const preflightArtifact = snapshot.artifacts[preflightArtifactId];
    const approval = snapshot.approvals[approvalPayload.approval.id];
    const approvalItem = snapshot.decisionInboxItems[approval.inboxItemId];

    assert.equal(approvalPayload.mutation.kind, 'approve-council-for-mission');
    assert.equal(linkedMission.councilSessionId, councilSession.id);
    assert.equal(linkedMission.linkedTaskId, task.id);
    assert.equal(linkedMission.status, 'executing');
    assert.equal(snapshot.councilSessions[councilSession.id].alignment.status, 'approved');
    assert.equal(snapshot.councilSessions[councilSession.id].status, 'approved');
    assert.equal(autoChain.linkedTaskCreated, true);
    assert.equal(autoChain.stoppedAt, 'request-builder-live-mutation-approval');
    assert.equal(autoChain.stopReason, 'waiting-approval');
    assert.deepEqual(
      autoChain.stageResults.map((stage) => stage.stage),
      [
        'planner',
        'architect',
        'task-breaker',
        'builder-preflight',
        'request-builder-live-mutation-approval',
      ],
    );
    assert.equal(linkedTask.missionId, mission.id);
    assert.equal(linkedTask.flags.waitingApproval, true);
    assert.equal(linkedTask.flags.waitingDecision, false);
    assert.ok(linkedTask.latestRunId);
    assert.equal(snapshot.runs[linkedTask.latestRunId].role, 'builder');
    assert.equal(snapshot.runs[linkedTask.latestRunId].summary.executionMode, 'preflight');
    assert.equal(snapshot.runs[linkedTask.latestRunId].summary.nextStage, 'request-builder-live-mutation-approval');
    assert.equal(preflightArtifact.type, 'preflight');
    assert.equal(approval.allowedNextAction, 'builder-live-mutation');
    assert.equal(approval.status, 'pending');
    assert.equal(approvalItem.kind, 'approval');
    assert.equal(approvalItem.status, 'pending');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            status: linkedMission.status,
            linkedTaskId: task.id,
          },
          autoChain: {
            stoppedAt: autoChain.stoppedAt,
            stopReason: autoChain.stopReason,
            stages: autoChain.stageResults.length,
          },
          approval: {
            id: approval.id,
            status: approval.status,
            targetArtifactId: approval.targetArtifactId,
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
