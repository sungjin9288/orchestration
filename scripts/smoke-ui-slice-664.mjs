import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMemoryItemPersistenceSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-664');
const port = 8500 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-664-durable-memory-item-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_664_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-664 server');
}

function seedAcceptedReview() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-memory-candidate-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MEMORY_CANDIDATE_KEEP_FIXTURE: '1',
        ORCHESTRATION_MEMORY_CANDIDATE_SEED_ONLY: '1',
        ORCHESTRATION_MEMORY_CANDIDATE_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryItem fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedAcceptedReview();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
  const sourceBytesBefore = fs.readFileSync(sourcePath, 'utf8');
  const sourceState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const sourceCandidate = structuredClone(
    sourceState.learningCandidates[seeded.learningCandidate.id],
  );
  const sourceReview = structuredClone(
    sourceState.learningCandidateReviews[seeded.learningCandidateReview.id],
  );
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

    assert.match(appSource, /data-form="persist-memory-item"/);
    assert.match(appSource, /data-action="persist-memory-item"/);
    assert.match(appSource, /MemoryItem 저장/);
    assert.match(appSource, /reviewed-memory-candidate-for-local-project-storage/);
    assert.match(appSource, /Durable MemoryItem evidence/);
    assert.match(appSource, /application:\$\{durableItem\.applicationStatus\}/);
    assert.match(appSource, /promotion:\$\{durableItem\.promotionStatus\}/);
    assert.doesNotMatch(appSource, /data-action="retrieve-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="apply-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="export-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="delete-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="promote-memory-item"/);
    assert.match(signalSource, /getMemoryItemPersistenceSummary/);
    assert.match(stylesSource, /\.memory-item-record/);
    assert.match(stylesSource, /\.memory-item-storage-form/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.memory-candidate-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const snapshot = snapshotResult.payload.snapshot;
    assert.equal(snapshot.schemaVersion, 15);
    assert.deepEqual(snapshot.memoryItems, {});
    const candidate = snapshot.learningCandidates[seeded.learningCandidate.id];
    const review = snapshot.learningCandidateReviews[seeded.learningCandidateReview.id];
    const itemPath =
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/memory-item`;
    const emptyInspection = await fetchJson(itemPath);
    assert.equal(emptyInspection.response.status, 200);
    assert.equal(emptyInspection.payload.memoryItem, null);
    assert.equal(emptyInspection.payload.persisted, false);
    const stateBytesBefore = fs.readFileSync(statePath, 'utf8');

    const {
      learningCandidateId: _learningCandidateId,
      ...previewBody
    } = seeded.memoryPreviewRequest;
    const previewPath =
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/memory-candidate-preview`;
    const previewResult = await postJson(previewPath, previewBody);
    assert.equal(previewResult.response.status, 200);
    const preview = previewResult.payload.memoryCandidatePreview;
    assert.equal(preview.persisted, false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const persistenceSummary = getMemoryItemPersistenceSummary(
      preview,
      null,
      candidate,
      review,
      seeded.missionId,
    );
    assert.equal(persistenceSummary.canPersist, true);
    const persistBody = {
      ...previewBody,
      memoryCandidatePreviewId: preview.id,
      memoryCandidatePreviewDigest: preview.previewDigest,
      storageApproval: {
        decision: 'store',
        acknowledgement: 'reviewed-memory-candidate-for-local-project-storage',
        rationale: 'Project-only scope와 negative evidence를 검토했습니다.',
        reviewedAt: new Date().toISOString(),
      },
    };
    const persistPath =
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/persist-memory-item`;

    const stale = await postJson(persistPath, {
      ...persistBody,
      memoryCandidatePreviewDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /does not match current recomputation/);
    const malformed = await postJson(persistPath, {
      ...persistBody,
      rawArtifactBody: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const wrongContentType = await postJson(persistPath, persistBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const created = await postJson(persistPath, persistBody);
    assert.equal(created.response.status, 201);
    const item = created.payload.memoryItem;
    assert.equal(item.persisted, true);
    assert.equal(item.status, 'stored');
    assert.equal(item.applicationStatus, 'blocked');
    assert.equal(item.promotionStatus, 'blocked');
    assert.deepEqual(item.exportRefs, []);
    assert.deepEqual(item.deletionRefs, []);
    assert.equal(created.payload.mutation.stoppedAt,
      'memory-item-stored-application-blocked');
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'),
      false,
    );

    const replay = await postJson(persistPath, persistBody);
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.deepEqual(replay.payload.memoryItem, item);
    const divergent = await postJson(persistPath, {
      ...persistBody,
      storageApproval: {
        ...persistBody.storageApproval,
        rationale: 'Different storage approval rationale.',
      },
    });
    assert.equal(divergent.response.status, 409);
    assert.match(divergent.payload.error, /already has a different MemoryItem/);

    const inspected = await fetchJson(itemPath);
    assert.equal(inspected.response.status, 200);
    assert.equal(inspected.payload.persisted, true);
    assert.deepEqual(inspected.payload.memoryItem, item);
    const refreshed = await fetchJson('/api/snapshot');
    assert.deepEqual(refreshed.payload.snapshot.memoryItems[item.id], item);
    assert.deepEqual(
      refreshed.payload.snapshot.learningCandidates[candidate.id],
      sourceCandidate,
    );
    assert.deepEqual(
      refreshed.payload.snapshot.learningCandidateReviews[review.id],
      sourceReview,
    );
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);
    assert.equal(
      getMemoryItemPersistenceSummary(
        preview,
        item,
        candidate,
        review,
        seeded.missionId,
      ).canPersist,
      false,
    );

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            emptyInspectionStatus: emptyInspection.response.status,
            previewStatus: previewResult.response.status,
            persistStatus: created.response.status,
            replayStatus: replay.response.status,
            divergentStatus: divergent.response.status,
            staleStatus: stale.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            reloadHydration: true,
          },
          ui: {
            explicitStorageApproval: true,
            exactDurableEvidence: true,
            responseOnlyPreviewPreserved: true,
            downstreamControlsAbsent: true,
            sourceRecordsUnchanged: true,
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
  }

  if (stderr.trim()) {
    throw new Error(`ui-slice-664 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
