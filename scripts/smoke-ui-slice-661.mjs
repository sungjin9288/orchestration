import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMissionExecutionPlanBundle,
  getMissionLearningCandidatePersistenceSummary,
  getMissionLearningCandidatePreviewSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-661');
const port = 7800 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-661-durable-learning-candidate-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_661_KEEP_FIXTURE === '1';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function fetchJson(pathname, options = {}) {
  return fetch(`${baseUrl}${pathname}`, options).then(async (response) => ({
    response,
    payload: await response.json(),
  }));
}

function postJson(pathname, body, contentType = 'application/json') {
  return fetchJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
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
  throw new Error('Timed out waiting for ui-slice-661 server');
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
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed LearningCandidate fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedCompletedMission();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
  const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', seeded.runtimeRoot],
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
    assert.match(appSource, /data-action="persist-learning-candidate"/);
    assert.match(appSource, /LearningCandidate 기록/);
    assert.match(appSource, /Durable LearningCandidate evidence/);
    assert.match(appSource, /persisted:true/);
    assert.match(appSource, /review-required evidence only/);
    assert.match(appSource, /missionLearningCandidate = null/);
    assert.match(appSource, /\/persist-learning-candidate/);
    assert.match(appSource, /\/learning-candidate/);
    assert.doesNotMatch(appSource, /data-action="accept-learning-candidate"/);
    assert.doesNotMatch(appSource, /data-action="reject-learning-candidate"/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-memory"/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-skill"/);
    assert.match(signalSource, /getMissionLearningCandidatePersistenceSummary/);
    assert.match(signalSource, /currentPreview\.expiry/);
    assert.match(stylesSource, /\.learning-candidate-record/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.learning-candidate-grid,[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const snapshot = snapshotResult.payload.snapshot;
    assert.equal(snapshot.schemaVersion, 17);
    assert.deepEqual(snapshot.learningCandidates, {});
    const stateBytesBeforeGet = fs.readFileSync(statePath, 'utf8');
    const absent = await fetchJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate`,
    );
    assert.equal(absent.response.status, 200);
    assert.equal(absent.payload.persisted, false);
    assert.equal(absent.payload.learningCandidate, null);
    assert.equal(Object.prototype.hasOwnProperty.call(absent.payload, 'runtimeRoot'), false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBeforeGet);

    const mission = snapshot.missions[seeded.missionId];
    const councilSession = snapshot.councilSessions[mission.councilSessionId];
    const bundle = getMissionExecutionPlanBundle(snapshot, councilSession.id);
    const deliveryPreview = await fetchJson(
      `/api/execution-plans/${encodeURIComponent(bundle.executionPlan.id)}/delivery-preview`,
    );
    const summary = getMissionLearningCandidatePreviewSummary(
      mission,
      deliveryPreview.payload.deliveryPackagePreview,
      bundle,
      bundle.latestDeliveryPackage,
      bundle.latestDeliveryPackageAcceptance,
      bundle.latestMissionCloseOut,
    );
    const { missionId: _missionId, ...previewBody } = seeded.previewRequest;
    const previewResult = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate-preview`,
      previewBody,
    );
    assert.equal(previewResult.response.status, 200);
    const preview = previewResult.payload.learningCandidatePreview;
    assert.equal(
      getMissionLearningCandidatePersistenceSummary(
        preview,
        null,
        seeded.missionId,
      ).canPersist,
      true,
    );

    const {
      previewId: sourceDeliveryPreviewId,
      ...sourceTuple
    } = summary.source;
    const persistenceBody = {
      ...sourceTuple,
      sourceDeliveryPreviewId,
      retrospectiveSpec: previewBody.retrospectiveSpec,
      previewId: preview.previewId,
      candidateDigest: preview.candidateDigest,
      decision: 'persist',
    };
    const created = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/persist-learning-candidate`,
      persistenceBody,
    );
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.learningCandidate.persisted, true);
    assert.equal(created.payload.learningCandidate.reviewerStatus, 'review-required');
    assert.equal(created.payload.learningCandidate.promotionStatus, 'proposed');
    assert.equal(created.payload.mutation.stoppedAt, 'learning-candidate-review-required');
    assert.equal(Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(created.payload, 'snapshot'), false);
    assert.equal(
      getMissionLearningCandidatePersistenceSummary(
        preview,
        created.payload.learningCandidate,
        seeded.missionId,
      ).canPersist,
      false,
    );

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const readBack = await fetchJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/learning-candidate`,
    );
    assert.equal(readBack.response.status, 200);
    assert.deepEqual(readBack.payload.learningCandidate, created.payload.learningCandidate);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const replay = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/persist-learning-candidate`,
      persistenceBody,
    );
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const stale = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/persist-learning-candidate`,
      { ...persistenceBody, candidateDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /candidateDigest/);
    const malformed = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/persist-learning-candidate`,
      { ...persistenceBody, rawArtifactBody: 'forbidden' },
    );
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const wrongContentType = await postJson(
      `/api/missions/${encodeURIComponent(seeded.missionId)}/persist-learning-candidate`,
      persistenceBody,
      'text/plain',
    );
    assert.equal(wrongContentType.response.status, 415);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            absentGetReadOnly: true,
            exactPersistenceStatus: created.response.status,
            exactReplayStatus: replay.response.status,
            staleStatus: stale.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            runtimePathRedacted: true,
            sourceBytesUnchanged: true,
          },
          ui: {
            explicitPersistenceAction: true,
            readOnlyDurableEvidence: true,
            refreshHydrationRoute: true,
            responseOnlyPreviewCompatible: true,
            expiredPreviewGate: true,
            downstreamControlsAbsent: true,
            desktopColumns: 2,
            mobileColumns: 1,
          },
        },
        null,
        2,
      )}\n`,
    );
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => server.once('exit', resolve));
    if (!keepFixture) {
      fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    }
    assert.equal(stderr, '');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
