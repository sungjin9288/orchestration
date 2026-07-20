import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMissionCloseOutSummary,
  getMissionExecutionPlanBundle,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-659');
const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
const projectPath = path.join(tempRoot, 'source', 'project');
const sourcePath = path.join(projectPath, 'src/runtime/runtime-service.js');
const port = 7500 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-659-mission-task-close-out-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_659_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function fetchJson(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, options).then(async (response) => ({
    response,
    payload: await response.json(),
  }));
}

function postJson(pathname, body) {
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
  throw new Error('Timed out waiting for ui-slice-659 server');
}

function seedAcceptedPackage() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-mission-task-close-out.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MISSION_CLOSE_OUT_KEEP_FIXTURE: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_SEED_ONLY: '1',
        ORCHESTRATION_MISSION_CLOSE_OUT_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed Mission close-out fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedAcceptedPackage();
  const deliveryPackage = seeded.deliveryPackage;
  const acceptance = seeded.deliveryPackageAcceptance;
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourceBefore = fs.readFileSync(sourcePath, 'utf8');
  const packageBefore = structuredClone(deliveryPackage);
  const acceptanceBefore = structuredClone(acceptance);
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
    const [appSource, signalSource, stylesSource] = await Promise.all([
      fetch(`${baseUrl}/app.js`).then((response) => response.text()),
      fetch(`${baseUrl}/council-signals.js`).then((response) => response.text()),
      fetch(`${baseUrl}/styles.css`).then((response) => response.text()),
    ]);
    assert.match(appSource, /미션 종료/);
    assert.match(appSource, /Mission Close-out Evidence/);
    assert.match(appSource, /data-action="close-out-ai-company-mission"/);
    assert.match(appSource, /decision: 'close-out'/);
    assert.match(appSource, /missionExecutionPlanBundle\?\.latestMissionCloseOut/);
    assert.match(appSource, /MissionCloseOut.*missionCompletionArtifactId/);
    assert.match(appSource, /commit:blocked/);
    assert.match(appSource, /push:blocked/);
    assert.match(appSource, /release:blocked/);
    assert.doesNotMatch(appSource, /data-action="reopen-ai-company-mission"/);
    assert.doesNotMatch(appSource, /data-action="next-ai-company-mission"/);
    assert.match(signalSource, /getMissionCloseOutSummary/);
    assert.match(signalSource, /sourceReady && !missionCloseOut/);
    assert.match(stylesSource, /\.mission-close-out-evidence/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.delivery-package-results[\s\S]*grid-template-columns: 1fr/,
    );

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    const [snapshotResult, previewResult, closeOutBefore] = await Promise.all([
      fetchJson('/api/snapshot'),
      fetchJson(`/api/execution-plans/${encodeURIComponent(seeded.executionPlanId)}/delivery-preview`),
      fetchJson(`/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`),
    ]);
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(previewResult.response.status, 200);
    assert.equal(closeOutBefore.response.status, 200);
    assert.equal(closeOutBefore.payload.missionCloseOut, null);
    assert.equal(closeOutBefore.payload.closeOutStatus, 'ready-for-close-out-review');
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);

    const snapshot = snapshotResult.payload.snapshot;
    const mission = snapshot.missions[seeded.missionId];
    const councilSession = snapshot.councilSessions[mission.councilSessionId];
    const bundle = getMissionExecutionPlanBundle(snapshot, councilSession.id);
    const preview = previewResult.payload.deliveryPackagePreview;
    const summary = getMissionCloseOutSummary(
      mission,
      preview,
      bundle,
      deliveryPackage,
      acceptance,
      null,
    );
    assert.equal(summary.sourceReady, true);
    assert.equal(summary.canCloseOut, true);
    assert.equal(summary.completed, false);

    const { missionId: _missionId, ...body } = seeded.closeOutRequest;
    const beforeStale = fs.readFileSync(statePath, 'utf8');
    const stale = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`,
      { ...body, packageDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /packageDigest/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const extra = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`,
      { ...body, unexpected: true },
    );
    assert.equal(extra.response.status, 400);
    assert.match(extra.payload.error, /unexpected or missing fields/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const invalidDecision = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`,
      { ...body, decision: 'complete' },
    );
    assert.equal(invalidDecision.response.status, 409);
    assert.match(invalidDecision.payload.error, /must be close-out/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const concurrent = await Promise.all([
      postJson(`/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`, body),
      postJson(`/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`, body),
    ]);
    assert.deepEqual(
      concurrent.map((entry) => entry.response.status).sort(),
      [200, 201],
    );
    const created = concurrent.find((entry) => entry.response.status === 201);
    const replay = concurrent.find((entry) => entry.response.status === 200);
    assert.equal(created.payload.missionCloseOutStatus, 'closed-out');
    assert.equal(created.payload.missionCloseOut.decision, 'closed-out');
    assert.match(created.payload.missionCloseOut.closeOutDigest, /^[a-f0-9]{64}$/);
    assert.equal(created.payload.snapshot.schemaVersion, 13);
    assert.equal(Object.keys(created.payload.snapshot.missionCloseOuts).length, 1);
    assert.equal(created.payload.executionPlanBundle.mission.status, 'completed');
    assert.equal(created.payload.executionPlanBundle.controlTask.lifecycleState, 'Done');
    assert.equal(created.payload.mutation.stoppedAt, 'mission-and-linked-control-task-closed-out');
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.deepEqual(replay.payload.missionCloseOut, created.payload.missionCloseOut);
    assert.deepEqual(created.payload.snapshot.deliveryPackages[deliveryPackage.id], packageBefore);
    assert.deepEqual(
      created.payload.snapshot.deliveryPackageAcceptances[acceptance.id],
      acceptanceBefore,
    );

    const completedBundle = getMissionExecutionPlanBundle(
      created.payload.snapshot,
      councilSession.id,
    );
    const completedSummary = getMissionCloseOutSummary(
      created.payload.snapshot.missions[seeded.missionId],
      preview,
      completedBundle,
      packageBefore,
      acceptanceBefore,
      created.payload.missionCloseOut,
    );
    assert.equal(completedSummary.completed, true);
    assert.equal(completedSummary.canCloseOut, false);

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const exactReplay = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`,
      body,
    );
    assert.equal(exactReplay.response.status, 200);
    assert.equal(exactReplay.payload.mutation.idempotent, true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);

    const closeOutAfter = await fetchJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/close-out`,
    );
    assert.equal(closeOutAfter.response.status, 200);
    assert.deepEqual(closeOutAfter.payload.missionCloseOut, created.payload.missionCloseOut);
    assert.equal(closeOutAfter.payload.mission.status, 'completed');
    assert.equal(closeOutAfter.payload.linkedTask.lifecycleState, 'Done');
    assert.deepEqual(closeOutAfter.payload.deliveryPackage, packageBefore);
    assert.deepEqual(closeOutAfter.payload.deliveryPackageAcceptance, acceptanceBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBefore);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        readOnlyHydration: true,
        exactTupleRequired: true,
        staleInputStatus: stale.response.status,
        malformedInputStatus: extra.response.status,
        concurrentStatuses: concurrent.map((entry) => entry.response.status).sort(),
        replayIdempotent: true,
      },
      ui: {
        closeOutCommandGated: true,
        terminalEvidenceRendered: true,
        packageAcceptanceImmutable: true,
        downstreamControlsBlocked: true,
        desktopColumns: 3,
        mobileColumns: 1,
      },
    }, null, 2)}\n`);
  } finally {
    server.kill('SIGTERM');
    await Promise.race([new Promise((resolve) => server.once('exit', resolve)), delay(2_000)]);
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
    if (stderr.trim()) process.stderr.write(stderr);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
