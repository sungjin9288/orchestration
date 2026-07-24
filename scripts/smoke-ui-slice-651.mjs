import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';
import { getLatestRealCouncilPositions } from '../ui/council-signals.js';
import { startHistoricalUnboundRealCouncilFixture } from './ai-company-council-fixtures.mjs';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { createRuntimeService } = runtimeServiceModule;
const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-651');
const port = 4800 + (process.pid % 500);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-651-real-council-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

async function fetchJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`${response.status}: ${payload.error || 'request failed'}`);
  }

  return payload;
}

function postJson(pathname, body = {}) {
  return fetchJson(pathname, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the local server is ready.
    }

    await delay(150);
  }

  throw new Error('Timed out waiting for ui-slice-651 server');
}

async function main() {
  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  const bootstrapRuntime = createRuntimeService({ runtimeRoot });
  bootstrapRuntime.resetRuntime();
  const project = bootstrapRuntime.createProject({
    name: 'ui-slice-651',
    projectPath: repoRoot,
  });
  const revisionMission = bootstrapRuntime.createMission({
    projectId: project.id,
    title: 'Historical Real Council API and UI',
    goal: 'Expose independent position and synthesis evidence.',
    constraints: 'Preserve an existing unbound local-stub session.',
  });
  const stopMission = bootstrapRuntime.createMission({
    projectId: project.id,
    title: 'Stop historical Real Council',
    goal: 'Prove stop creates no downstream task.',
    constraints: 'Stop before handoff.',
  });
  const approveMission = bootstrapRuntime.createMission({
    projectId: project.id,
    title: 'Approve historical Real Council',
    goal: 'Reuse the existing bounded execution handoff.',
    constraints: 'Stop at the existing approval boundary.',
  });
  const revisionFixture = startHistoricalUnboundRealCouncilFixture({
    runtimeRoot,
    missionId: revisionMission.id,
  });
  const stopFixture = startHistoricalUnboundRealCouncilFixture({
    runtimeRoot,
    missionId: stopMission.id,
  });
  const approveFixture = startHistoricalUnboundRealCouncilFixture({
    runtimeRoot,
    missionId: approveMission.id,
  });

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
    const appResponse = await fetch(`${baseUrl}/app.js`);
    const appSource = await appResponse.text();
    const signalResponse = await fetch(`${baseUrl}/council-signals.js`);
    const signalSource = await signalResponse.text();
    const modeSource = fs.readFileSync(
      path.join(repoRoot, 'ui', 'mission-council-mode.js'),
      'utf8',
    );

    assert.equal(appResponse.status, 200);
    assert.equal(signalResponse.status, 200);
    assert.match(appSource, /createMissionCouncilModeView/);
    assert.match(modeSource, /label: '독립 역할'/);
    assert.match(modeSource, /value: 'real-local-stub'/);
    assert.match(appSource, /renderRealCouncilEvidence/);
    assert.match(appSource, /남은 쟁점/);
    assert.match(appSource, /종합 판단/);
    assert.match(appSource, /approve-real-council-session/);
    assert.match(appSource, /request-revision-real-council-session/);
    assert.match(appSource, /stop-real-council-session/);
    assert.match(
      appSource,
      /<div class="field">\s*\$\{renderRealCouncilAlignmentControls\(selectedCouncilSession\)\}/,
    );
    assert.match(signalSource, /getCurrentRealCouncilAttempt/);
    assert.match(signalSource, /positionStatus/);

    const blockedMission = await postJson('/api/missions', {
      title: 'Blocked direct Real Council API',
      goal: 'Require a StaffingEntry before local Council starts.',
      constraints: 'Do not bypass the durable staffing boundary.',
    });
    const blockedStartResponse = await fetch(
      `${baseUrl}/api/missions/${encodeURIComponent(blockedMission.mission.id)}/council/start`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mode: 'real-local-stub' }),
      },
    );
    const blockedStartPayload = await blockedStartResponse.json();
    assert.equal(blockedStartResponse.status, 409);
    assert.equal(blockedStartPayload.code, 'STAFFING_PLAN_ENTRY_REQUIRED');

    const snapshotPayload = await fetchJson('/api/snapshot');
    const session = snapshotPayload.snapshot.councilSessions[revisionFixture.councilSession.id];
    assert.equal(session.mode, 'real-local-stub');
    assert.equal(session.phase, 'awaiting-alignment');
    assert.equal(session.attempts[0].positions.length, 3);
    assert.ok(session.attempts[0].synthesis);
    assert.equal(snapshotPayload.snapshot.schemaVersion, 18);

    const revisionPayload = await postJson(
      `/api/council-sessions/${encodeURIComponent(session.id)}/decision`,
      {
        action: 'request-revision',
        note: 'Recheck the architecture boundary only.',
        targetAgentIds: ['agent-architect'],
      },
    );
    assert.equal(revisionPayload.mutation.kind, 'decide-real-council-session');
    assert.equal(revisionPayload.mutation.action, 'request-revision');
    assert.equal(revisionPayload.attempt.positions.length, 1);
    assert.equal(revisionPayload.attempt.positions[0].role, 'architect');
    assert.equal(revisionPayload.councilSession.attempts.length, 2);
    assert.deepEqual(
      getLatestRealCouncilPositions(revisionPayload.councilSession).map((position) => position.role),
      ['strategist', 'architect', 'decomposer'],
    );

    const taskCountBeforeStop = Object.keys(snapshotPayload.snapshot.tasks).length;
    const stopPayload = await postJson(
      `/api/council-sessions/${encodeURIComponent(stopFixture.councilSession.id)}/decision`,
      { action: 'stop' },
    );
    assert.equal(stopPayload.councilSession.terminalReason, 'operator-stopped');
    assert.equal(stopPayload.mission.linkedTaskId, null);
    assert.equal(Object.keys(stopPayload.snapshot.tasks).length, taskCountBeforeStop);

    const approvePayload = await postJson(
      `/api/council-sessions/${encodeURIComponent(approveFixture.councilSession.id)}/decision`,
      { action: 'approve' },
    );
    assert.equal(approvePayload.mutation.action, 'approve');
    assert.equal(approvePayload.councilSession.terminalReason, 'operator-approved');
    assert.ok(approvePayload.task?.id);
    assert.equal(approvePayload.mission.linkedTaskId, approvePayload.task.id);
    assert.ok(
      ['builder-preflight', 'request-builder-live-mutation-approval'].includes(
        approvePayload.mutation.autoChain.stoppedAt,
      ),
    );

    const legacyMission = await postJson('/api/missions', {
      title: 'Legacy Council route',
      goal: 'Preserve deterministic transcript behavior.',
      constraints: 'Use the legacy route.',
    });
    const legacyPayload = await postJson(
      `/api/missions/${encodeURIComponent(legacyMission.mission.id)}/draft-council`,
    );
    assert.equal(legacyPayload.mutation.kind, 'draft-council-for-mission');
    assert.equal(Object.hasOwn(legacyPayload.councilSession, 'mode'), false);
    assert.equal(legacyPayload.councilSession.transcript.length, 4);
    assert.equal(legacyPayload.councilSession.status, 'pending-alignment');

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            directStartBlocked: true,
            historicalSessionRead: true,
            revision: true,
            stop: true,
            approveHandoff: true,
            legacyRoutePreserved: true,
          },
          ui: {
            modeGatedEvidence: true,
            roleStatus: true,
            positions: true,
            conflictAndDissent: true,
            synthesis: true,
            alignmentControlLayout: 'field-column',
            alignmentActions: ['approve', 'request-revision', 'stop'],
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    server.kill('SIGTERM');
    await delay(150);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
