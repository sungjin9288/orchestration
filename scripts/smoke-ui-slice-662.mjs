import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  getLearningCandidateReviewSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-662');
const port = 8100 + (process.pid % 300);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-662-learning-candidate-review-outcome-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_662_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-662 server');
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
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed review UI fixture');
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
    assert.match(appSource, /data-action="review-learning-candidate"/);
    assert.match(appSource, /LearningCandidate Review/);
    assert.match(appSource, /Durable LearningCandidate review evidence/);
    assert.match(appSource, /value="accept"/);
    assert.match(appSource, /value="reject"/);
    assert.match(appSource, /value="changes-requested"/);
    assert.match(appSource, /human-reviewed/);
    assert.match(appSource, /\/api\/learning-candidates\/\$\{encodeURIComponent\(candidate\.id\)\}\/review/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-memory"/);
    assert.doesNotMatch(appSource, /data-action="promote-learning-skill"/);
    assert.doesNotMatch(appSource, /data-action="revise-learning-candidate"/);
    assert.match(signalSource, /getLearningCandidateReviewSummary/);
    assert.match(stylesSource, /\.learning-candidate-review-form/);
    assert.match(stylesSource, /\.learning-candidate-review-record/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.learning-candidate-grid,[\s\S]*grid-template-columns: 1fr/,
    );

    const { missionId, ...previewBody } = seeded.previewRequest;
    const previewResult = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/learning-candidate-preview`,
      previewBody,
    );
    assert.equal(previewResult.response.status, 200);
    const preview = previewResult.payload.learningCandidatePreview;
    const {
      missionId: _sourceMissionId,
      previewId: sourceDeliveryPreviewId,
      ...sourceTuple
    } = seeded.previewRequest;
    const candidateResult = await postJson(
      `/api/missions/${encodeURIComponent(missionId)}/persist-learning-candidate`,
      {
        ...sourceTuple,
        sourceDeliveryPreviewId,
        previewId: preview.previewId,
        candidateDigest: preview.candidateDigest,
        decision: 'persist',
      },
    );
    assert.equal(candidateResult.response.status, 201);
    const candidate = candidateResult.payload.learningCandidate;

    const absentBytes = fs.readFileSync(statePath, 'utf8');
    const absent = await fetchJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
    );
    assert.equal(absent.response.status, 200);
    assert.equal(absent.payload.reviewed, false);
    assert.equal(absent.payload.learningCandidateReview, null);
    assert.equal(Object.prototype.hasOwnProperty.call(absent.payload, 'runtimeRoot'), false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), absentBytes);
    assert.equal(
      getLearningCandidateReviewSummary(candidate, null, missionId).canReview,
      true,
    );

    const reviewBody = {
      previewId: candidate.previewId,
      candidateDigest: candidate.candidateDigest,
      candidateRecordDigest: candidate.recordDigest,
      decision: 'accept',
      rationale: '현재 source evidence를 확인하고 이 후보를 검토했습니다.',
      evidenceRefs: candidate.sourceEvidenceRefs.slice(0, 3),
      reviewerAcknowledgement: 'human-reviewed',
    };
    const created = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      reviewBody,
    );
    assert.equal(created.response.status, 201);
    assert.equal(created.payload.learningCandidateReview.decision, 'accepted');
    assert.equal(created.payload.mutation.stoppedAt, 'learning-candidate-review-recorded');
    assert.equal(created.payload.learningCandidate.recordDigest, candidate.recordDigest);
    assert.equal(created.payload.learningCandidate.reviewerStatus, 'review-required');
    assert.equal(created.payload.learningCandidate.promotionStatus, 'proposed');
    assert.equal(
      getLearningCandidateReviewSummary(
        candidate,
        created.payload.learningCandidateReview,
        missionId,
      ).canReview,
      false,
    );

    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const readBack = await fetchJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
    );
    assert.equal(readBack.response.status, 200);
    assert.deepEqual(
      readBack.payload.learningCandidateReview,
      created.payload.learningCandidateReview,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const replay = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      reviewBody,
    );
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    const divergent = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      { ...reviewBody, decision: 'reject' },
    );
    assert.equal(divergent.response.status, 409);
    assert.match(divergent.payload.error, /already has a different review/);
    const stale = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      { ...reviewBody, candidateRecordDigest: '0'.repeat(64) },
    );
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /candidateRecordDigest/);
    const malformed = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      { ...reviewBody, rawArtifactBody: 'forbidden' },
    );
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const wrongContentType = await postJson(
      `/api/learning-candidates/${encodeURIComponent(candidate.id)}/review`,
      reviewBody,
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
            exactReviewStatus: created.response.status,
            exactReplayStatus: replay.response.status,
            divergentStatus: divergent.response.status,
            staleStatus: stale.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            runtimePathRedacted: true,
            sourceBytesUnchanged: true,
          },
          ui: {
            explicitReviewAction: true,
            acceptedRejectedChangesRequestedOptions: true,
            readOnlyDurableEvidence: true,
            refreshHydrationRoute: true,
            idempotentReplay: true,
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
