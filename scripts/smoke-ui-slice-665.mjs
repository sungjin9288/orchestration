import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { getMemoryRecallPreviewSummary } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-665');
const port = 8800 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-665-memory-recall-preview-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_665_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-665 server');
}

function seedStoredMemoryItem() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-memory-recall-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MEMORY_RECALL_KEEP_FIXTURE: '1',
        ORCHESTRATION_MEMORY_RECALL_SEED_ONLY: '1',
        ORCHESTRATION_MEMORY_RECALL_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed MemoryRecall fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedStoredMemoryItem();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const sourceState = JSON.parse(stateBytesBefore);
  const sourceItem = structuredClone(sourceState.memoryItems[seeded.memoryItem.id]);
  const sourceCandidate = structuredClone(
    sourceState.learningCandidates[seeded.memoryItem.sourceLearningCandidateId],
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

    assert.match(appSource, /data-form="preview-memory-recall"/);
    assert.match(appSource, /data-action="preview-memory-recall"/);
    assert.match(appSource, /operator-selected-exact-memory-item-for-read-only-recall/);
    assert.match(appSource, /recall-preview-not-runtime-application/);
    assert.match(appSource, /MemoryRecall response evidence/);
    assert.match(appSource, /retrievalMode/);
    assert.doesNotMatch(appSource, /data-action="search-memory-items"/);
    assert.doesNotMatch(appSource, /data-action="rank-memory-items"/);
    assert.doesNotMatch(appSource, /data-action="recommend-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="apply-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="inject-memory-into-mission"/);
    assert.match(signalSource, /getMemoryRecallPreviewSummary/);
    assert.match(stylesSource, /\.memory-recall-panel/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.memory-candidate-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(snapshotResult.payload.snapshot.schemaVersion, 16);
    assert.equal(
      Object.prototype.hasOwnProperty.call(snapshotResult.payload.snapshot, 'memoryRecalls'),
      true,
    );
    assert.deepEqual(snapshotResult.payload.snapshot.memoryRecalls, {});
    const item = snapshotResult.payload.snapshot.memoryItems[seeded.memoryItem.id];
    assert.deepEqual(item, sourceItem);

    const summary = getMemoryRecallPreviewSummary(item, null, sourceCandidate);
    assert.equal(summary.canPreview, true);
    assert.equal(Boolean(summary.currentPreview), false);
    const {
      memoryItemId: _memoryItemId,
      ...previewBody
    } = seeded.recallPreviewRequest;
    const previewPath =
      `/api/memory-items/${encodeURIComponent(item.id)}/recall-preview`;

    const noGetStatus = (await fetch(`${baseUrl}${previewPath}`)).status;
    assert.equal(noGetStatus, 404);

    const stale = await postJson(previewPath, {
      ...previewBody,
      memoryItemRecordDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /recordDigest does not match/);
    const malformed = await postJson(previewPath, {
      ...previewBody,
      rawArtifactBody: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const wrongContentType = await postJson(previewPath, previewBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await postJson(previewPath, {
      ...previewBody,
      recallSpec: {
        ...previewBody.recallSpec,
        purpose: 'x'.repeat(70 * 1024),
      },
    });
    assert.equal(oversized.response.status, 413);
    const crossWorkspace = await postJson(previewPath, {
      ...previewBody,
      recallSpec: {
        ...previewBody.recallSpec,
        workspaceScope: { projectId: 'project-other' },
      },
    });
    assert.equal(crossWorkspace.response.status, 400);
    assert.match(crossWorkspace.payload.error, /workspaceScope/);
    const missingNegativeEvidence = await postJson(previewPath, {
      ...previewBody,
      recallSpec: {
        ...previewBody.recallSpec,
        negativeEvidenceRefs: [],
      },
    });
    assert.equal(missingNegativeEvidence.response.status, 400);
    assert.match(missingNegativeEvidence.payload.error, /non-empty array|preserve every source value/);
    const credential = await postJson(previewPath, {
      ...previewBody,
      recallSpec: {
        ...previewBody.recallSpec,
        purpose: 'authorization=Bearer-secret-token',
      },
    });
    assert.equal(credential.response.status, 400);
    assert.match(credential.payload.error, /credential marker/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const created = await postJson(previewPath, previewBody);
    assert.equal(created.response.status, 200);
    const preview = created.payload.memoryRecallPreview;
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'recall-ready');
    assert.equal(preview.retrievalMode, 'exact-id-operator-selected');
    assert.equal(preview.sourceMemoryItemId, item.id);
    assert.equal(preview.sourceMemoryItemRecordDigest, item.recordDigest);
    assert.equal(preview.applicationStatus, 'blocked');
    assert.equal(preview.missionInjectionStatus, 'blocked');
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const replay = await postJson(previewPath, previewBody);
    assert.equal(replay.response.status, 200);
    assert.deepEqual(replay.payload.memoryRecallPreview, preview);
    assert.deepEqual(
      getMemoryRecallPreviewSummary(item, preview, sourceCandidate).currentPreview,
      preview,
    );
    const refreshed = await fetchJson('/api/snapshot');
    assert.deepEqual(refreshed.payload.snapshot.memoryItems[item.id], sourceItem);
    assert.equal(
      Object.prototype.hasOwnProperty.call(refreshed.payload.snapshot, 'memoryRecallPreview'),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            previewStatus: created.response.status,
            replayStatus: replay.response.status,
            noGetStatus,
            staleStatus: stale.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            oversizedBodyStatus: oversized.response.status,
            crossWorkspaceStatus: crossWorkspace.response.status,
            missingNegativeEvidenceStatus: missingNegativeEvidence.response.status,
            credentialStatus: credential.response.status,
            snapshotPersistedPreviewAbsent: true,
          },
          ui: {
            exactIdOperatorSelection: true,
            browserMemoryOnlyPreview: true,
            downstreamControlsAbsent: true,
            stateBytesUnchanged: true,
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
    throw new Error(`ui-slice-665 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
