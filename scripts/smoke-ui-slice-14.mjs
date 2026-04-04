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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-14');
const port = 4324;
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

  throw new Error('Timed out waiting for ui-slice-14 server');
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
    assert.match(indexHtml, /data-surface="council"/);
    assert.match(indexHtml, /surface-council/);
    assert.match(appJs, /참모 회의 초안 만들기/);
    assert.match(appJs, /회의 결론 승인/);
    assert.deepEqual(initialSnapshot.snapshot.councilSessions, {});

    const missionPayload = await postJson('/api/missions', {
      constraints: 'Keep the first slice bounded and preserve current engine semantics.',
      goal: 'Show a visible multi-role council before the user drops into task-level execution.',
      title: 'Council surface smoke',
    });
    const mission = missionPayload.mission;

    const councilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/draft-council`,
    );
    const councilSession = councilPayload.councilSession;

    assert.equal(councilPayload.mutation.kind, 'draft-council-for-mission');
    assert.equal(councilPayload.snapshot.selectedMissionId, mission.id);
    assert.equal(councilPayload.snapshot.missions[mission.id].status, 'aligning');
    assert.equal(councilPayload.snapshot.missions[mission.id].councilSessionId, councilSession.id);
    assert.equal(councilSession.status, 'pending-alignment');
    assert.equal(councilSession.participants.length, 4);
    assert.equal(councilSession.transcript.length, 4);
    assert.equal(councilSession.alignment.status, 'pending');
    assert.ok(councilSession.recommendation);
    assert.ok(councilSession.selectedPlan?.title);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            status: councilPayload.snapshot.missions[mission.id].status,
          },
          councilSession: {
            id: councilSession.id,
            alignment: councilPayload.snapshot.councilSessions[councilSession.id].alignment.status,
            participants: councilSession.participants.length,
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
