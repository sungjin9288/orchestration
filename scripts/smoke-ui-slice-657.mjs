import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMissionDeliveryPackagePersistenceSummary,
  getMissionExecutionPlanBundle,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-657');
const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
const projectPath = path.join(tempRoot, 'source', 'project');
const targetPath = 'src/runtime/runtime-service.js';
const port = 6900 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-657-durable-delivery-package-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_657_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-657 server');
}

function seedDeliveryReadyFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-durable-delivery-package.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DURABLE_DELIVERY_KEEP_FIXTURE: '1',
        ORCHESTRATION_DURABLE_DELIVERY_SEED_ONLY: '1',
        ORCHESTRATION_DURABLE_DELIVERY_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed durable delivery fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedDeliveryReadyFixture();
  const executionPlanId = seeded.executionPlanId;
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourcePath = path.join(projectPath, targetPath);
  const sourceBeforeServer = fs.readFileSync(sourcePath, 'utf8');
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
    assert.match(appSource, /DeliveryPackage 기록/);
    assert.match(appSource, /DeliveryPackage Record/);
    assert.match(appSource, /review-required/);
    assert.match(appSource, /data-action="persist-delivery-package"/);
    assert.match(appSource, /data-action="accept-delivery-package"/);
    assert.doesNotMatch(appSource, /data-action="complete-mission-from-delivery-package"/);
    assert.match(signalSource, /getMissionDeliveryPackagePersistenceSummary/);
    assert.match(signalSource, /durablePersistenceAllowed === true/);
    assert.match(stylesSource, /\.delivery-package-record/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.delivery-package-results[\s\S]*grid-template-columns: 1fr/,
    );

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    const [snapshot, previewResult, durableBefore] = await Promise.all([
      fetchJson('/api/snapshot'),
      fetchJson(`/api/execution-plans/${encodeURIComponent(executionPlanId)}/delivery-preview`),
      fetchJson(`/api/execution-plans/${encodeURIComponent(executionPlanId)}/delivery-package`),
    ]);
    assert.equal(snapshot.response.status, 200);
    assert.equal(previewResult.response.status, 200);
    assert.equal(durableBefore.response.status, 200);
    assert.equal(durableBefore.payload.deliveryPackage, null);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);

    const mission = Object.values(snapshot.payload.snapshot.missions).find(
      (entry) => entry.id === seeded.preview.missionId,
    );
    const bundle = getMissionExecutionPlanBundle(
      snapshot.payload.snapshot,
      mission.councilSessionId,
    );
    const preview = previewResult.payload.deliveryPackagePreview;
    const summary = getMissionDeliveryPackagePersistenceSummary(preview, bundle, null);
    assert.equal(summary.tupleCurrent, true);
    assert.equal(summary.canPersist, true);
    assert.equal(summary.persisted, false);

    const exactTuple = {
      previewId: preview.id,
      sourceDigest: preview.sourceDigest,
      packageDigest: preview.packageDigest,
      checkpointId: preview.terminalCheckpointId,
      checkpointDigest: preview.terminalCheckpointDigest,
    };
    const beforeStale = fs.readFileSync(statePath, 'utf8');
    const stale = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/persist-delivery-package`,
      { ...exactTuple, packageDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /packageDigest/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const persisted = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/persist-delivery-package`,
      exactTuple,
    );
    assert.equal(persisted.response.status, 201);
    assert.equal(persisted.payload.durableDeliveryPackage.status, 'review-required');
    assert.equal(persisted.payload.durableDeliveryPackage.packageDigest, preview.packageDigest);
    assert.equal(persisted.payload.snapshot.schemaVersion, 16);
    assert.deepEqual(persisted.payload.snapshot.deliveryPackageAcceptances, {});
    assert.equal(persisted.payload.executionPlanBundle.mission.status, 'executing');
    assert.equal(persisted.payload.executionPlanBundle.executionPlan.status, 'delivery-ready');
    assert.equal(persisted.payload.mutation.stoppedAt, 'delivery-package-review-required');

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const replay = await postJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/persist-delivery-package`,
      exactTuple,
    );
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);
    const durableAfter = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(executionPlanId)}/delivery-package`,
    );
    assert.deepEqual(
      durableAfter.payload.deliveryPackage,
      persisted.payload.durableDeliveryPackage,
    );
    const acceptanceBefore = await fetchJson(
      `/api/delivery-packages/${encodeURIComponent(persisted.payload.durableDeliveryPackage.id)}/acceptance`,
    );
    assert.equal(acceptanceBefore.response.status, 200);
    assert.equal(acceptanceBefore.payload.acceptance, null);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBeforeServer);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        readOnlyHydration: true,
        exactTupleRequired: true,
        staleInputStatus: stale.response.status,
        persistedStatus: persisted.payload.durableDeliveryPackage.status,
        replayIdempotent: true,
      },
      ui: {
        persistenceCommandGated: true,
        durableEvidenceRendered: true,
        missionAndCloseOutControlsAbsent: true,
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
