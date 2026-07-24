import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { getMemoryRecallPersistenceSummary } from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-666');
const port = 9000 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-666-durable-memory-recall-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_666_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-666 server');
}

function seedRecallPreview() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-durable-memory-recall.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_DURABLE_MEMORY_RECALL_KEEP_FIXTURE: '1',
        ORCHESTRATION_DURABLE_MEMORY_RECALL_SEED_ONLY: '1',
        ORCHESTRATION_DURABLE_MEMORY_RECALL_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(seeded.stderr || seeded.stdout || 'Failed to seed durable MemoryRecall fixture');
  }
  return JSON.parse(seeded.stdout);
}

async function main() {
  const seeded = seedRecallPreview();
  const statePath = path.join(seeded.runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const sourceState = JSON.parse(stateBytesBefore);
  const sourceItem = structuredClone(sourceState.memoryItems[seeded.memoryItem.id]);
  const sourceCandidate = structuredClone(
    sourceState.learningCandidates[seeded.memoryItem.sourceLearningCandidateId],
  );
  const sourceCounts = {
    approvals: Object.keys(sourceState.approvals).length,
    artifacts: Object.keys(sourceState.artifacts).length,
    decisionInboxItems: Object.keys(sourceState.decisionInboxItems).length,
    runs: Object.keys(sourceState.runs).length,
  };
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

    assert.match(appSource, /data-form="persist-memory-recall"/);
    assert.match(appSource, /data-action="persist-memory-recall"/);
    assert.match(appSource, /reviewed-exact-memory-recall-for-local-audit/);
    assert.match(appSource, /Durable MemoryRecall evidence/);
    assert.match(appSource, /\/memory-recall`/);
    assert.doesNotMatch(appSource, /data-action="list-memory-recalls"/);
    assert.doesNotMatch(appSource, /data-action="search-memory-items"/);
    assert.doesNotMatch(appSource, /data-action="rank-memory-items"/);
    assert.doesNotMatch(appSource, /data-action="recommend-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="apply-memory-item"/);
    assert.doesNotMatch(appSource, /data-action="inject-memory-into-mission"/);
    assert.match(signalSource, /getMemoryRecallPersistenceSummary/);
    assert.match(stylesSource, /\.memory-recall-record/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);
    assert.match(
      stylesSource,
      /@media \(max-width: 720px\)[\s\S]*\.memory-candidate-grid[\s\S]*grid-template-columns: 1fr/,
    );

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(snapshotResult.payload.snapshot.schemaVersion, 18);
    assert.deepEqual(snapshotResult.payload.snapshot.memoryRecalls, {});
    const item = snapshotResult.payload.snapshot.memoryItems[seeded.memoryItem.id];
    assert.deepEqual(item, sourceItem);

    const recallPath = `/api/memory-items/${encodeURIComponent(item.id)}/memory-recall`;
    const persistPath =
      `/api/memory-items/${encodeURIComponent(item.id)}/persist-memory-recall`;
    const emptyInspection = await fetchJson(recallPath);
    assert.equal(emptyInspection.response.status, 200);
    assert.equal(emptyInspection.payload.persisted, false);
    assert.equal(emptyInspection.payload.memoryRecall, null);

    const {
      memoryItemId: _memoryItemId,
      ...persistenceBody
    } = seeded.memoryRecallPersistenceRequest;
    const stale = await postJson(persistPath, {
      ...persistenceBody,
      memoryRecallPreviewDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /does not match current recomputation/);
    const malformed = await postJson(persistPath, {
      ...persistenceBody,
      rawArtifactBody: 'forbidden',
    });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const wrongContentType = await postJson(persistPath, persistenceBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const crossWorkspace = await postJson(persistPath, {
      ...persistenceBody,
      recallSpec: {
        ...persistenceBody.recallSpec,
        workspaceScope: { projectId: 'project-other' },
      },
    });
    assert.equal(crossWorkspace.response.status, 400);
    assert.match(crossWorkspace.payload.error, /workspaceScope/);
    const credential = await postJson(persistPath, {
      ...persistenceBody,
      recordApproval: {
        ...persistenceBody.recordApproval,
        rationale: 'authorization=Bearer-secret-token',
      },
    });
    assert.equal(credential.response.status, 409);
    assert.match(credential.payload.error, /credential marker/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const created = await postJson(persistPath, persistenceBody);
    assert.equal(created.response.status, 201);
    const memoryRecall = created.payload.memoryRecall;
    assert.equal(memoryRecall.persisted, true);
    assert.equal(memoryRecall.status, 'recorded');
    assert.equal(memoryRecall.sourceMemoryItemId, item.id);
    assert.equal(memoryRecall.sourceMemoryItemRecordDigest, item.recordDigest);
    assert.equal(
      memoryRecall.sourceMemoryRecallPreviewId,
      seeded.memoryRecallPreview.id,
    );
    assert.equal(memoryRecall.applicationStatus, 'blocked');
    assert.equal(memoryRecall.recommendationStatus, 'blocked');
    assert.equal(memoryRecall.missionInjectionStatus, 'blocked');
    assert.ok(memoryRecall.blockedActions.includes('history'));
    assert.ok(memoryRecall.blockedActions.includes('search'));
    assert.equal(
      Object.prototype.hasOwnProperty.call(created.payload, 'runtimeRoot'),
      false,
    );

    const stateAfterCreate = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    assert.equal(stateAfterCreate.schemaVersion, 18);
    assert.deepEqual(stateAfterCreate.memoryItems[item.id], sourceItem);
    assert.deepEqual(stateAfterCreate.memoryRecalls[memoryRecall.id], memoryRecall);
    assert.deepEqual(
      {
        approvals: Object.keys(stateAfterCreate.approvals).length,
        artifacts: Object.keys(stateAfterCreate.artifacts).length,
        decisionInboxItems: Object.keys(stateAfterCreate.decisionInboxItems).length,
        runs: Object.keys(stateAfterCreate.runs).length,
      },
      sourceCounts,
    );

    const inspected = await fetchJson(recallPath);
    assert.equal(inspected.response.status, 200);
    assert.equal(inspected.payload.persisted, true);
    assert.deepEqual(inspected.payload.memoryRecall, memoryRecall);
    const persistedBytes = fs.readFileSync(statePath, 'utf8');
    const replay = await postJson(persistPath, persistenceBody);
    assert.equal(replay.response.status, 200);
    assert.equal(replay.payload.mutation.idempotent, true);
    assert.deepEqual(replay.payload.memoryRecall, memoryRecall);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const divergent = await postJson(persistPath, {
      ...persistenceBody,
      recordApproval: {
        ...persistenceBody.recordApproval,
        rationale: '같은 source item에 다른 durable recall rationale을 제출합니다.',
      },
    });
    assert.equal(divergent.response.status, 409);
    assert.match(divergent.payload.error, /already has a different MemoryRecall/);
    assert.equal(fs.readFileSync(statePath, 'utf8'), persistedBytes);

    const summary = getMemoryRecallPersistenceSummary(
      item,
      seeded.memoryRecallPreview,
      memoryRecall,
      sourceCandidate,
    );
    assert.equal(summary.persisted, true);
    assert.equal(summary.canPersist, false);
    assert.equal(summary.canPreview, false);
    assert.deepEqual(summary.memoryRecall, memoryRecall);

    process.stdout.write(
      `${JSON.stringify(
        {
          ok: true,
          mode: MODE,
          api: {
            emptyInspectionStatus: emptyInspection.response.status,
            persistStatus: created.response.status,
            replayStatus: replay.response.status,
            inspectionStatus: inspected.response.status,
            staleStatus: stale.response.status,
            malformedStatus: malformed.response.status,
            wrongContentTypeStatus: wrongContentType.response.status,
            crossWorkspaceStatus: crossWorkspace.response.status,
            credentialStatus: credential.response.status,
            divergentStatus: divergent.response.status,
            reloadHydration: true,
          },
          ui: {
            explicitRecordApproval: true,
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
    throw new Error(`ui-slice-666 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
