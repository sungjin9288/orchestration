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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-19');
const port = 4329;
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

  throw new Error('Timed out waiting for ui-slice-19 server');
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
    assert.match(appJs, /Create Mission/);
    assert.match(appJs, /autoDraftCouncil: true/);
    assert.match(appJs, /state\.surface = payload\.councilSession\?\.id \? 'council' : 'mission'/);
    assert.match(indexHtml, /data-surface="council"/);

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep the handoff bounded and stop before execution auto chain.',
      goal: 'Verify mission creation can immediately produce a council session for the next visible step.',
      title: 'Mission autodraft smoke',
    });

    const mission = missionPayload.mission;
    const councilSession = missionPayload.councilSession;

    assert.equal(missionPayload.mutation.kind, 'create-mission-autodraft-council');
    assert.ok(councilSession);
    assert.equal(missionPayload.snapshot.selectedMissionId, mission.id);
    assert.equal(missionPayload.snapshot.missions[mission.id].councilSessionId, councilSession.id);
    assert.equal(missionPayload.snapshot.missions[mission.id].status, 'aligning');
    assert.equal(missionPayload.snapshot.councilSessions[councilSession.id].status, 'pending-alignment');
    assert.equal(missionPayload.snapshot.councilSessions[councilSession.id].alignment.status, 'pending');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            status: missionPayload.snapshot.missions[mission.id].status,
          },
          councilSession: {
            id: councilSession.id,
            status: missionPayload.snapshot.councilSessions[councilSession.id].status,
            alignment: missionPayload.snapshot.councilSessions[councilSession.id].alignment.status,
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
