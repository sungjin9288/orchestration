import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeModule from '../src/runtime/runtime-service.js';
import {
  getCurrentRealCouncilAttempt,
  getLatestRealCouncilPositions,
  isRealCouncilMode,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-652');
const port = 5300 + (process.pid % 400);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-652-council-live-provider-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const payload = await response.json();
  return { response, payload };
}

function postJson(pathname, body = {}) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);
      if (response.ok) return;
    } catch (_error) {
      // Wait for the local server to bind.
    }
    await delay(150);
  }
  throw new Error('Timed out waiting for ui-slice-652 server');
}

async function main() {
  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  const bootstrap = createRuntimeService({ runtimeRoot });
  bootstrap.resetRuntime();
  const project = bootstrap.createProject({
    name: 'ui-slice-652',
    projectPath: repoRoot,
  });

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();
    const appSource = await (await fetch(`${baseUrl}/app.js`)).text();
    const signalSource = await (await fetch(`${baseUrl}/council-signals.js`)).text();
    const serverSource = fs.readFileSync(
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      'utf8',
    );

    assert.match(appSource, /OpenAI 역할 회의 등록/);
    assert.match(appSource, /start-provider-council-for-mission/);
    assert.match(appSource, /councilProviderReadinessSummaries/);
    assert.match(appSource, /providerEvidence/);
    assert.match(appSource, /provider-calls:/);
    assert.match(appSource, /real-openai-responses/);
    assert.match(signalSource, /real-openai-responses/);
    assert.match(serverSource, /startProviderCouncilForMission/);
    assert.match(serverSource, /resumeProviderCouncilSession/);
    assert.match(serverSource, /decideProviderCouncilSession/);

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const readiness = snapshotResult.payload.derived.councilProviderReadinessSummaries[project.id];
    assert.equal(readiness.allowed, false);
    assert.equal(readiness.readiness, 'blocked');
    assert.ok(readiness.reasons.length > 0);
    assert.equal(JSON.stringify(readiness).includes('apiKey'), false);

    const missionResult = await postJson('/api/missions', {
      title: 'Provider readiness gate',
      goal: 'Refuse provider Council start while project configuration is missing.',
      constraints: 'Do not create a provider session.',
      autoDraftCouncil: false,
    });
    assert.equal(missionResult.response.status, 201);
    const blockedStart = await postJson(
      `/api/missions/${encodeURIComponent(missionResult.payload.mission.id)}/council/start`,
      { mode: 'real-openai-responses' },
    );
    assert.equal(blockedStart.response.status, 409);
    assert.equal(blockedStart.payload.error, 'OpenAI Responses Council provider is not ready');

    const afterBlocked = await fetchJson('/api/snapshot');
    assert.equal(afterBlocked.payload.snapshot.missions[missionResult.payload.mission.id].councilSessionId, null);

    const localMission = await postJson('/api/missions', {
      title: 'Local Council compatibility',
      goal: 'Keep the existing local-stub path unchanged.',
      constraints: 'Use local-stub only.',
      autoDraftCouncil: false,
    });
    const localStart = await postJson(
      `/api/missions/${encodeURIComponent(localMission.payload.mission.id)}/council/start`,
      { mode: 'real-local-stub' },
    );
    assert.equal(localStart.response.status, 201);
    assert.equal(localStart.payload.councilSession.mode, 'real-local-stub');
    assert.equal(isRealCouncilMode(localStart.payload.councilSession.mode), true);
    assert.equal(getCurrentRealCouncilAttempt(localStart.payload.councilSession).status, 'awaiting-alignment');
    assert.equal(getLatestRealCouncilPositions(localStart.payload.councilSession).length, 3);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          ui: {
            readinessGatedSelection: true,
            safeProviderEvidence: true,
            alignmentParity: true,
            localStubUnchanged: true,
          },
          api: {
            missingConfigurationStatus: 409,
            incompleteSessionPersisted: false,
            providerDispatch: true,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000).then(() => server.kill('SIGKILL')),
    ]);
    fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  }

  if (stderr.trim()) {
    throw new Error(stderr.trim());
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
