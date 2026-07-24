import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getMemoryCandidatePreviewSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-663');
const port = 8400 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-663-memory-candidate-preview-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_663_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-663 server');
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
    throw new Error(
      seeded.stderr || seeded.stdout || 'Failed to seed MemoryCandidate fixture',
    );
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedAcceptedReview();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const sourcePath = path.join(seeded.projectPath, 'src/runtime/runtime-service.js');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
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

    assert.match(appSource, /data-form="preview-memory-candidate"/);
    assert.match(appSource, /data-action="preview-memory-candidate"/);
    assert.match(appSource, /MemoryCandidate Preview/);
    assert.match(appSource, /review-ready/);
    assert.match(appSource, /persisted:false/);
    assert.match(appSource, /storage:\$\{currentPreview\.storageStatus\}/);
    assert.match(appSource, /promotion:\$\{currentPreview\.promotionStatus\}/);
    assert.match(appSource, /readiness-only-not-durable-memory/);
    assert.match(appSource, /state\.missionMemoryCandidatePreview = null/);
    assert.match(
      appSource,
      /state\.missionMemoryCandidateDraft\[event\.target\.name\] = event\.target\.value;[\s\S]*state\.missionMemoryCandidatePreview = null;[\s\S]*querySelector\('\.memory-candidate-result'\)[\s\S]*\.remove\(\);/,
    );
    assert.doesNotMatch(appSource, /data-action="persist-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="store-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="retrieve-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="apply-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="export-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="delete-memory-candidate"/);
    assert.doesNotMatch(appSource, /data-action="promote-memory-skill"/);
    assert.match(signalSource, /getMemoryCandidatePreviewSummary/);
    assert.match(signalSource, /review\.decision === 'accepted'/);
    assert.match(stylesSource, /\.memory-candidate-panel/);
    assert.match(stylesSource, /\.memory-candidate-grid/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.memory-candidate-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    const snapshot = snapshotResult.payload.snapshot;
    assert.equal(snapshot.schemaVersion, 19);
    assert.equal(
      Object.prototype.hasOwnProperty.call(snapshot, 'memoryCandidates'),
      false,
    );
    const candidate =
      snapshot.learningCandidates[seeded.learningCandidate.id];
    const review =
      snapshot.learningCandidateReviews[seeded.learningCandidateReview.id];
    assert.equal(review.decision, 'accepted');
    const summary = getMemoryCandidatePreviewSummary(
      candidate,
      review,
      seeded.missionId,
    );
    assert.equal(summary.canPreview, true);
    assert.equal(summary.workspaceProjectId, candidate.projectId);
    assert.equal(
      getMemoryCandidatePreviewSummary(
        candidate,
        { ...review, decision: 'rejected' },
        seeded.missionId,
      ).canPreview,
      false,
    );
    assert.equal(
      getMemoryCandidatePreviewSummary(
        candidate,
        { ...review, decision: 'changes-requested' },
        seeded.missionId,
      ).canPreview,
      false,
    );

    const {
      learningCandidateId: _learningCandidateId,
      ...body
    } = seeded.memoryPreviewRequest;
    const pathname =
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/memory-candidate-preview`;
    const created = await postJson(pathname, body);
    assert.equal(created.response.status, 200);
    const preview = created.payload.memoryCandidatePreview;
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'review-ready');
    assert.equal(preview.storageStatus, 'not-approved');
    assert.equal(preview.promotionStatus, 'blocked');
    assert.equal(preview.sourceLearningCandidateId, candidate.id);
    assert.equal(preview.sourceLearningCandidateReviewId, review.id);
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'snapshot'),
      false,
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    const replay = await postJson(pathname, body);
    assert.equal(replay.response.status, 200);
    assert.deepEqual(replay.payload.memoryCandidatePreview, preview);

    const noGet = await fetch(`${baseUrl}${pathname}`);
    assert.equal(noGet.status, 404);
    const stale = await postJson(pathname, {
      ...body,
      reviewDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /reviewDigest/);
    const crossWorkspace = await postJson(pathname, {
      ...body,
      memorySpec: {
        ...body.memorySpec,
        workspaceScope: { projectId: 'project-other' },
      },
    });
    assert.equal(crossWorkspace.response.status, 400);
    assert.match(crossWorkspace.payload.error, /workspaceScope/);
    const malformed = await postJson(pathname, {
      ...body,
      rawTranscript: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const credential = await postJson(pathname, {
      ...body,
      memorySpec: {
        ...body.memorySpec,
        summary: 'api_key=secret-value-that-must-not-pass',
      },
    });
    assert.equal(credential.response.status, 400);
    assert.match(credential.payload.error, /credential marker/);
    const wrongContentType = await postJson(pathname, body, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await postJson(pathname, {
      ...body,
      memorySpec: {
        ...body.memorySpec,
        summary: 'x'.repeat(70 * 1024),
      },
    });
    assert.equal(oversized.response.status, 413);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);
    assert.equal(fs.readFileSync(sourcePath, 'utf8'), sourceBytesBefore);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            exactPreviewStatus: created.response.status,
            exactReplayStatus: replay.response.status,
            noGetStatus: noGet.status,
            staleStatus: stale.response.status,
            crossWorkspaceStatus: crossWorkspace.response.status,
            malformedStatus: malformed.response.status,
            credentialStatus: credential.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            oversizedBodyStatus: oversized.response.status,
            runtimePathRedacted: true,
            stateAndSourceBytesUnchanged: true,
          },
          ui: {
            acceptedReviewOnlyForm: true,
            rejectedAndChangesRequestedBlocked: true,
            browserMemoryOnly: true,
            editAndRefreshInvalidation: true,
            sourceEvidenceReadOnly: true,
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
  }

  if (stderr.trim()) {
    throw new Error(`ui-slice-663 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
