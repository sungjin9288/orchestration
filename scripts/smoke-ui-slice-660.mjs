import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMissionExecutionPlanBundle,
  getMissionLearningCandidatePreviewSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-660');
const port = 7500 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-660-learning-candidate-preview-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_660_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-660 server');
}

function seedCompletedMission() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-learning-candidate-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_LEARNING_CANDIDATE_KEEP_FIXTURE: '1',
        ORCHESTRATION_LEARNING_CANDIDATE_SEED_ONLY: '1',
        ORCHESTRATION_LEARNING_CANDIDATE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed learning preview fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedCompletedMission();
  const runtimeRoot = seeded.runtimeRoot;
  const statePath = path.join(runtimeRoot, 'state.json');
  const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
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
    assert.match(appSource, /data-form="preview-learning-candidate"/);
    assert.match(appSource, /data-action="preview-learning-candidate"/);
    assert.match(appSource, /학습 후보 미리보기/);
    assert.match(appSource, /response-only/);
    assert.match(appSource, /review-required/);
    assert.match(appSource, /persisted:false/);
    assert.match(appSource, /state\.missionLearningCandidatePreview = null/);
    assert.match(
      appSource,
      /state\.missionLearningCandidateDraft\[event\.target\.name\] = event\.target\.value;[\s\S]*state\.missionLearningCandidatePreview = null;[\s\S]*querySelector\('\.learning-candidate-result'\)[\s\S]*\.remove\(\);/,
    );
    assert.match(appSource, /sourceEvidenceRef :: statement/);
    assert.match(appSource, /data-action="persist-learning-candidate"/);
    assert.doesNotMatch(appSource, /data-action="accept-learning-candidate"/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-memory"/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-skill"/);
    assert.match(signalSource, /getMissionLearningCandidatePreviewSummary/);
    assert.match(signalSource, /targetPathAllowlist/);
    assert.match(signalSource, /negativeEvidenceRefs/);
    assert.match(stylesSource, /\.learning-candidate-panel/);
    assert.match(stylesSource, /\.learning-candidate-grid/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.learning-candidate-grid,[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const snapshot = snapshotResult.payload.snapshot;
    assert.equal(snapshot.schemaVersion, 13);
    assert.deepEqual(snapshot.learningCandidates, {});
    const mission = snapshot.missions[seeded.missionId];
    const councilSession = snapshot.councilSessions[mission.councilSessionId];
    const bundle = getMissionExecutionPlanBundle(snapshot, councilSession.id);
    const previewResult = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(bundle.executionPlan.id)}/delivery-preview`,
    );
    const deliveryPackage = bundle.latestDeliveryPackage;
    const acceptance = bundle.latestDeliveryPackageAcceptance;
    const closeOut = bundle.latestMissionCloseOut;
    const summary = getMissionLearningCandidatePreviewSummary(
      mission,
      previewResult.payload.deliveryPackagePreview,
      bundle,
      deliveryPackage,
      acceptance,
      closeOut,
    );
    assert.equal(summary.available, true);
    assert.equal(summary.persisted, false);
    assert.deepEqual(summary.source, {
      linkedTaskId: seeded.previewRequest.linkedTaskId,
      executionPlanId: seeded.previewRequest.executionPlanId,
      deliveryPackageId: seeded.previewRequest.deliveryPackageId,
      deliveryPackageAcceptanceId: seeded.previewRequest.deliveryPackageAcceptanceId,
      missionCloseOutId: seeded.previewRequest.missionCloseOutId,
      previewId: seeded.previewRequest.previewId,
      sourceDigest: seeded.previewRequest.sourceDigest,
      packageDigest: seeded.previewRequest.packageDigest,
      acceptanceDigest: seeded.previewRequest.acceptanceDigest,
      checkpointId: seeded.previewRequest.checkpointId,
      checkpointDigest: seeded.previewRequest.checkpointDigest,
      closeOutDigest: seeded.previewRequest.closeOutDigest,
    });
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const { missionId: _missionId, ...body } = seeded.previewRequest;
    const created = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      body,
    );
    assert.equal(created.response.status, 200);
    assert.equal(created.payload.learningCandidatePreview.persisted, false);
    assert.equal(created.payload.learningCandidatePreview.redactionStatus, 'review-required');
    assert.equal(created.payload.learningCandidatePreview.reviewerStatus, 'review-required');
    assert.equal(created.payload.learningCandidatePreview.promotionStatus, 'proposed');
    assert.equal(
      Object.values(created.payload.learningCandidatePreview.authoritySummary).every(
        (value) => value === false,
      ),
      true,
    );
    assert.equal(Object.prototype.hasOwnProperty.call(created.payload, 'snapshot'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'), false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const replay = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      body,
    );
    assert.equal(replay.response.status, 200);
    assert.deepEqual(replay.payload.learningCandidatePreview, created.payload.learningCandidatePreview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const stale = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      { ...body, closeOutDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /closeOutDigest/);
    const extra = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      { ...body, rawTranscript: 'forbidden' },
    );
    assert.equal(extra.response.status, 400);
    assert.match(extra.payload.error, /unexpected or missing fields/);
    const secret = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      {
        ...body,
        retrospectiveSpec: {
          ...body.retrospectiveSpec,
          lesson: 'authorization=Bearer-secret-token',
        },
      },
    );
    assert.equal(secret.response.status, 400);
    assert.match(secret.payload.error, /credential marker/);
    const wrongContentType = await fetchJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'text/plain' },
        body: JSON.stringify(body),
      },
    );
    assert.equal(wrongContentType.response.status, 415);
    assert.match(wrongContentType.payload.error, /application\/json/);
    const oversized = await fetchJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, padding: 'x'.repeat(70 * 1024) }),
      },
    );
    assert.equal(oversized.response.status, 413);
    assert.match(oversized.payload.error, /exceeds 65536 bytes/);
    const getPreview = await fetch(
      `${baseUrl}/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
    );
    assert.equal(getPreview.status, 404);

    const refreshed = await fetchJson('/api/snapshot');
    assert.equal(refreshed.response.status, 200);
    assert.deepEqual(refreshed.payload.snapshot.learningCandidates, {});
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    process.stdout.write(`${JSON.stringify({
      ok: true,
      mode: MODE,
      api: {
        exactTerminalTupleRequired: true,
        responseOnly: true,
        noPreviewGetRoute: true,
        staleInputStatus: stale.response.status,
        malformedInputStatus: extra.response.status,
        credentialMarkerStatus: secret.response.status,
        wrongContentTypeStatus: wrongContentType.response.status,
        oversizedBodyStatus: oversized.response.status,
        runtimePathRedacted: true,
        stateBytesUnchanged: true,
      },
      ui: {
        terminalOnlyForm: true,
        redactionAndReviewRequiredRendered: true,
        persistedFalseRendered: true,
        browserMemoryClearsOnHydration: true,
        draftResetsOnMissionHydration: true,
        stalePreviewClearsOnEdit: true,
        downstreamReviewAndPromotionControlsAbsent: true,
        desktopColumns: 2,
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
