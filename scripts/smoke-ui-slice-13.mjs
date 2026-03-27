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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-13');
const port = 4323;
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

  throw new Error('Timed out waiting for ui-slice-13 server');
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
    const initialSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="mission"/);
    assert.match(indexHtml, /surface-mission/);
    assert.match(appJs, /Create Mission/);
    assert.match(appJs, /Open Advanced Ops Mode/);
    assert.match(appJs, /create-linked-task-for-mission/);
    assert.deepEqual(initialSnapshot.snapshot.missions, {});
    assert.equal(initialSnapshot.snapshot.selectedMissionId, null);

    const missionPayload = await postJson('/api/missions', {
      constraints: 'Keep the scope bounded to the existing runtime shell.',
      goal: 'Add a small mission-driven entry experience before dropping into task-level execution.',
      title: 'Mission slice smoke',
    });
    const mission = missionPayload.mission;

    assert.equal(missionPayload.mutation.kind, 'create-mission');
    assert.equal(missionPayload.snapshot.selectedMissionId, mission.id);
    assert.equal(missionPayload.snapshot.missions[mission.id].status, 'draft');
    assert.equal(missionPayload.snapshot.missions[mission.id].linkedTaskId, null);

    const linkedTaskPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/create-linked-task`,
    );
    const linkedTask = linkedTaskPayload.task;

    assert.equal(linkedTaskPayload.mutation.kind, 'create-linked-task-for-mission');
    assert.equal(linkedTaskPayload.snapshot.tasks[linkedTask.id].missionId, mission.id);
    assert.equal(linkedTaskPayload.snapshot.missions[mission.id].linkedTaskId, linkedTask.id);
    assert.equal(linkedTaskPayload.snapshot.missions[mission.id].status, 'executing');
    assert.equal(linkedTaskPayload.snapshot.selectedMissionId, mission.id);

    const secondMissionPayload = await postJson('/api/missions', {
      constraints: 'No council transcript yet.',
      goal: 'Create a second mission to verify explicit mission selection.',
      title: 'Mission selection smoke',
    });
    const secondMission = secondMissionPayload.mission;
    const selectMissionPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/select`,
    );

    assert.equal(secondMissionPayload.snapshot.selectedMissionId, secondMission.id);
    assert.equal(selectMissionPayload.mutation.kind, 'select-mission');
    assert.equal(selectMissionPayload.snapshot.selectedMissionId, mission.id);
    assert.equal(selectMissionPayload.snapshot.activeProjectId, mission.projectId);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            linkedTaskId: linkedTask.id,
            status: linkedTaskPayload.snapshot.missions[mission.id].status,
          },
          secondMission: {
            id: secondMission.id,
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
