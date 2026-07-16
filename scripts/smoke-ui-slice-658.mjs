import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMissionDeliveryPackageAcceptanceSummary,
  getMissionExecutionPlanBundle,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-658');
const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
const projectPath = path.join(tempRoot, 'source', 'project');
const sourcePath = path.join(projectPath, 'src/runtime/runtime-service.js');
const port = 7200 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-658-delivery-package-acceptance-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_658_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-658 server');
}

function seedReviewRequiredPackage() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-delivery-package-acceptance.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DELIVERY_ACCEPTANCE_KEEP_FIXTURE: '1',
        ORCHESTRATION_DELIVERY_ACCEPTANCE_SEED_ONLY: '1',
        ORCHESTRATION_DELIVERY_ACCEPTANCE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed package acceptance fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedReviewRequiredPackage();
  const deliveryPackage = seeded.deliveryPackage;
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourceBefore = fs.readFileSync(sourcePath, 'utf8');
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
    assert.match(appSource, /패키지 승인/);
    assert.match(appSource, /Acceptance Evidence/);
    assert.match(appSource, /data-action="accept-delivery-package"/);
    assert.match(appSource, /decision: 'accept'/);
    assert.match(appSource, /Current evidence가 일치하면 Mission과 linked control task를 한 transaction으로 종료할 수 있습니다/);
    assert.doesNotMatch(appSource, /data-action="reject-delivery-package"/);
    assert.doesNotMatch(appSource, /data-action="complete-mission-from-delivery-package"/);
    assert.doesNotMatch(appSource, /data-action="close-task-from-delivery-package"/);
    assert.match(signalSource, /getMissionDeliveryPackageAcceptanceSummary/);
    assert.match(signalSource, /tupleCurrent && !acceptance/);
    assert.match(stylesSource, /\.delivery-package-acceptance/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.delivery-package-results[\s\S]*grid-template-columns: 1fr/,
    );

    const beforeReads = fs.readFileSync(statePath, 'utf8');
    const [snapshotResult, previewResult, acceptanceBefore] = await Promise.all([
      fetchJson('/api/snapshot'),
      fetchJson(`/api/execution-plans/${encodeURIComponent(seeded.executionPlanId)}/delivery-preview`),
      fetchJson(`/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/acceptance`),
    ]);
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(previewResult.response.status, 200);
    assert.equal(acceptanceBefore.response.status, 200);
    assert.equal(acceptanceBefore.payload.acceptance, null);
    assert.equal(acceptanceBefore.payload.reviewStatus, 'review-required');
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReads);

    const snapshot = snapshotResult.payload.snapshot;
    const mission = snapshot.missions[deliveryPackage.missionId];
    const councilSession = snapshot.councilSessions[mission.councilSessionId];
    const bundle = getMissionExecutionPlanBundle(snapshot, councilSession.id);
    const preview = previewResult.payload.deliveryPackagePreview;
    const summary = getMissionDeliveryPackageAcceptanceSummary(
      preview,
      bundle,
      deliveryPackage,
      null,
    );
    assert.equal(summary.tupleCurrent, true);
    assert.equal(summary.canAccept, true);
    assert.equal(summary.accepted, false);

    const body = {
      previewId: deliveryPackage.previewId,
      sourceDigest: deliveryPackage.sourceDigest,
      packageDigest: deliveryPackage.packageDigest,
      checkpointId: deliveryPackage.terminalCheckpointId,
      checkpointDigest: deliveryPackage.terminalCheckpointDigest,
      decision: 'accept',
    };
    const beforeStale = fs.readFileSync(statePath, 'utf8');
    const stale = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      { ...body, packageDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /packageDigest/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const extra = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      { ...body, unexpected: true },
    );
    assert.equal(extra.response.status, 400);
    assert.match(extra.payload.error, /unexpected or missing fields/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const rejectedDecision = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      { ...body, decision: 'reject' },
    );
    assert.equal(rejectedDecision.response.status, 409);
    assert.match(rejectedDecision.payload.error, /must be accept/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeStale);

    const accepted = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      body,
    );
    assert.equal(accepted.response.status, 201);
    assert.equal(accepted.payload.deliveryPackageReviewStatus, 'accepted');
    assert.equal(accepted.payload.deliveryPackageAcceptance.decision, 'accepted');
    assert.match(accepted.payload.deliveryPackageAcceptance.acceptanceDigest, /^[a-f0-9]{64}$/);
    assert.deepEqual(accepted.payload.durableDeliveryPackage, deliveryPackage);
    assert.equal(accepted.payload.snapshot.schemaVersion, 11);
    assert.equal(Object.keys(accepted.payload.snapshot.deliveryPackageAcceptances).length, 1);
    assert.equal(accepted.payload.executionPlanBundle.mission.status, 'executing');
    assert.equal(accepted.payload.executionPlanBundle.executionPlan.status, 'delivery-ready');
    assert.notEqual(accepted.payload.executionPlanBundle.controlTask.lifecycleState, 'Done');
    assert.equal(
      accepted.payload.mutation.stoppedAt,
      'delivery-package-accepted-review-evidence',
    );

    const acceptedSummary = getMissionDeliveryPackageAcceptanceSummary(
      preview,
      getMissionExecutionPlanBundle(
        accepted.payload.snapshot,
        councilSession.id,
      ),
      accepted.payload.durableDeliveryPackage,
      accepted.payload.deliveryPackageAcceptance,
    );
    assert.equal(acceptedSummary.accepted, true);
    assert.equal(acceptedSummary.canAccept, false);

    const beforeReplay = fs.readFileSync(statePath, 'utf8');
    const replay = await postJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/accept`,
      body,
    );
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), beforeReplay);

    const acceptanceAfter = await fetchJson(
      `/api/delivery-packages/${encodeURIComponent(deliveryPackage.id)}/acceptance`,
    );
    assert.equal(acceptanceAfter.response.status, 200);
    assert.deepEqual(
      acceptanceAfter.payload.acceptance,
      accepted.payload.deliveryPackageAcceptance,
    );
    assert.deepEqual(acceptanceAfter.payload.deliveryPackage, deliveryPackage);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBefore);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        readOnlyHydration: true,
        exactTupleRequired: true,
        staleInputStatus: stale.response.status,
        malformedInputStatus: extra.response.status,
        acceptedStatus: accepted.payload.deliveryPackageReviewStatus,
        replayIdempotent: true,
      },
      ui: {
        acceptanceCommandGated: true,
        durableEvidenceRendered: true,
        downstreamControlsAbsent: true,
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
