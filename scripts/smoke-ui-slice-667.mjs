import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  computeMissionMemoryContextTargetDigest,
  getMissionMemoryContextPreviewSummary,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-667');
const runtimeRoot = path.join(tempRoot, 'source', 'runtime');
const port = 9200 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-667-mission-memory-context-preview-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_667_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-667 server');
}

function seedMissionMemoryContextFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-mission-memory-context-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_MISSION_MEMORY_CONTEXT_KEEP_FIXTURE: '1',
        ORCHESTRATION_MISSION_MEMORY_CONTEXT_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(
      seeded.stderr || seeded.stdout || 'Failed to seed MissionMemoryContext fixture',
    );
  }
}

function buildContextSpec(memoryRecall) {
  return {
    purpose: '현재 draft Mission에서 source-contained evidence 범위를 검토합니다.',
    workspaceScope: { projectId: memoryRecall.projectId },
    applicability: {
      summary: memoryRecall.applicability.summary,
      targetPathAllowlist: [...memoryRecall.applicability.targetPathAllowlist],
      verificationCommands: [...memoryRecall.applicability.verificationCommands],
    },
    evidenceRefs: [...memoryRecall.evidenceRefs],
    negativeEvidenceRefs: [...memoryRecall.negativeEvidenceRefs],
    redactionRefs: [...memoryRecall.redactionRefs],
    reviewRefs: [...memoryRecall.reviewRefs],
    acknowledgement:
      'operator-selected-recorded-recall-for-mission-context-review',
    nonInjectionStatement:
      'memory-context-preview-not-mission-or-prompt-injection',
  };
}

async function main() {
  seedMissionMemoryContextFixture();
  const statePath = path.join(runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const sourceState = JSON.parse(stateBytesBefore);
  const memoryRecall = Object.values(sourceState.memoryRecalls)[0];
  const memoryItem = sourceState.memoryItems[memoryRecall.sourceMemoryItemId];
  const targetMission = Object.values(sourceState.missions).find(
    (mission) => mission.status === 'draft' && mission.projectId === memoryRecall.projectId,
  );
  const completedMission = sourceState.missions[memoryItem.sourceMissionId];
  assert.ok(memoryRecall);
  assert.ok(memoryItem);
  assert.ok(targetMission);
  assert.notEqual(completedMission.status, 'draft');

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

    assert.match(appSource, /data-form="preview-mission-memory-context"/);
    assert.match(appSource, /data-action="preview-mission-memory-context"/);
    assert.match(appSource, /operator-selected-recorded-recall-for-mission-context-review/);
    assert.match(appSource, /memory-context-preview-not-mission-or-prompt-injection/);
    assert.match(appSource, /missionMemoryContextPreview = null/);
    assert.match(appSource, /Object\.prototype\.hasOwnProperty\.call\(payload, 'snapshot'\)/);
    assert.doesNotMatch(appSource, /data-action="apply-mission-memory-context"/);
    assert.doesNotMatch(appSource, /data-action="inject-mission-memory-context"/);
    assert.doesNotMatch(appSource, /data-action="recommend-mission-memory-context"/);
    assert.doesNotMatch(appSource, /data-action="search-memory-context"/);
    assert.doesNotMatch(appSource, /data-action="persist-mission-memory-context"/);
    assert.match(signalSource, /computeMissionMemoryContextTargetDigest/);
    assert.match(signalSource, /getMissionMemoryContextPreviewSummary/);
    assert.match(stylesSource, /\.mission-memory-context-panel/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.memory-candidate-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(snapshotResult.payload.snapshot.schemaVersion, 19);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        snapshotResult.payload.snapshot,
        'missionMemoryContextPreviews',
      ),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const targetMissionDigest = await computeMissionMemoryContextTargetDigest(
      targetMission,
    );
    const contextPath =
      `/api/missions/${encodeURIComponent(targetMission.id)}/memory-context-preview`;
    const requestBody = {
      memoryRecallId: memoryRecall.id,
      memoryRecallRecordDigest: memoryRecall.recordDigest,
      memoryItemId: memoryItem.id,
      memoryItemRecordDigest: memoryItem.recordDigest,
      targetMissionDigest,
      evaluatedAt: new Date().toISOString(),
      contextSpec: buildContextSpec(memoryRecall),
    };

    const malformed = await postJson(contextPath, {
      ...requestBody,
      rawArtifactBody: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const stale = await postJson(contextPath, {
      ...requestBody,
      targetMissionDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /targetMissionDigest/);
    const wrongContentType = await postJson(contextPath, requestBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const crossProject = await postJson(contextPath, {
      ...requestBody,
      contextSpec: {
        ...requestBody.contextSpec,
        workspaceScope: { projectId: 'project-other' },
      },
    });
    assert.equal(crossProject.response.status, 409);
    assert.match(crossProject.payload.error, /workspaceScope/);
    const providerAttempt = await postJson(contextPath, {
      ...requestBody,
      contextSpec: {
        ...requestBody.contextSpec,
        providerMode: 'openai-responses',
      },
    });
    assert.equal(providerAttempt.response.status, 400);
    assert.match(providerAttempt.payload.error, /unexpected or missing fields/);
    const oversized = await fetchJson(contextPath, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(65 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const created = await postJson(contextPath, requestBody);
    assert.equal(created.response.status, 200);
    const preview = created.payload.missionMemoryContextPreview;
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'context-review-ready');
    assert.equal(preview.selectionMode, 'exact-id-operator-selected');
    assert.equal(preview.targetMissionId, targetMission.id);
    assert.equal(preview.targetMissionDigest, targetMissionDigest);
    assert.equal(preview.sourceMemoryRecallId, memoryRecall.id);
    assert.equal(preview.sourceMemoryItemId, memoryItem.id);
    assert.equal(preview.applicationStatus, 'blocked');
    assert.equal(preview.missionInjectionStatus, 'blocked');
    assert.equal(preview.workOrderInjectionStatus, 'blocked');
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'snapshot'),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const replay = await postJson(contextPath, requestBody);
    assert.equal(replay.response.status, 200);
    assert.deepEqual(replay.payload.missionMemoryContextPreview, preview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const nonDraftPath =
      `/api/missions/${encodeURIComponent(completedMission.id)}/memory-context-preview`;
    const nonDraft = await postJson(nonDraftPath, {
      ...requestBody,
      targetMissionDigest,
    });
    assert.equal(nonDraft.response.status, 400);
    assert.match(nonDraft.payload.error, /target Mission must be current draft evidence/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const summary = getMissionMemoryContextPreviewSummary(
      memoryItem,
      memoryRecall,
      targetMission,
      preview,
    );
    assert.equal(summary.canPreview, true);
    assert.equal(summary.targetCurrent, true);
    assert.deepEqual(summary.currentPreview, preview);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            previewStatus: created.response.status,
            replayStatus: replay.response.status,
            malformedStatus: malformed.response.status,
            staleStatus: stale.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            crossProjectStatus: crossProject.response.status,
            providerAttemptStatus: providerAttempt.response.status,
            oversizedStatus: oversized.response.status,
            nonDraftStatus: nonDraft.response.status,
          },
          ui: {
            explicitExactIdForm: true,
            browserMemoryInvalidation: true,
            responseOnlyEvidence: true,
            downstreamControlsAbsent: true,
            sourceStateBytesUnchanged: true,
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
    throw new Error(`ui-slice-667 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
