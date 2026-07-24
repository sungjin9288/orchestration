import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import {
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
} from '../ui/council-signals.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-668');
const runtimeRoot = path.join(tempRoot, 'source');
const port = 9400 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-668-workorder-verification-plan-preview-smoke';
const keepFixture = process.env.ORCHESTRATION_UI_SLICE_668_KEEP_FIXTURE === '1';

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
  throw new Error('Timed out waiting for ui-slice-668 server');
}

function seedFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const seeded = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-workorder-verification-plan-preview.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_WORKORDER_VERIFICATION_PREVIEW_KEEP_FIXTURE: '1',
        ORCHESTRATION_WORKORDER_VERIFICATION_PREVIEW_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (seeded.status !== 0) {
    throw new Error(
      seeded.stderr || seeded.stdout || 'Failed to seed WorkOrder verification fixture',
    );
  }
}

async function main() {
  seedFixture();
  const statePath = path.join(runtimeRoot, 'state.json');
  const stateBytesBefore = fs.readFileSync(statePath, 'utf8');
  const sourceState = JSON.parse(stateBytesBefore);
  const executionPlan = Object.values(sourceState.executionPlans)[0];
  const workOrder = sourceState.workOrders[executionPlan.workOrderIds[0]];
  const otherWorkOrder = sourceState.workOrders[executionPlan.workOrderIds[1]];
  assert.ok(executionPlan);
  assert.ok(workOrder);
  assert.ok(otherWorkOrder);

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

    assert.match(appSource, /data-action="preview-workorder-verification-plan"/);
    assert.match(appSource, /workOrderVerificationPlanPreview = null/);
    assert.match(appSource, /검증 기준 검토/);
    assert.match(appSource, /아직 실행되거나 통과된 기준은 없습니다/);
    assert.doesNotMatch(appSource, /data-action="persist-workorder-verification-plan"/);
    assert.doesNotMatch(appSource, /data-action="execute-workorder-verification-plan"/);
    assert.doesNotMatch(appSource, /data-action="complete-workorder-verification-plan"/);
    assert.match(appSource, /data-action="persist-workorder-acceptance-criteria"/);
    assert.match(signalSource, /computeExecutionPlanRecordDigest/);
    assert.match(signalSource, /computeWorkOrderRecordDigest/);
    assert.match(stylesSource, /\.mission-workorder-list/);
    assert.match(stylesSource, /overflow-wrap: anywhere/);

    const snapshotResult = await fetchJson('/api/snapshot');
    assert.equal(snapshotResult.response.status, 200);
    assert.equal(snapshotResult.payload.snapshot.schemaVersion, 19);
    assert.equal(
      Object.prototype.hasOwnProperty.call(
        snapshotResult.payload.snapshot,
        'workOrderVerificationPlanPreviews',
      ),
      false,
    );
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const endpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
      `/work-orders/${encodeURIComponent(workOrder.id)}/verification-plan-preview`;
    const requestBody = {
      executionPlanDigest: await computeExecutionPlanRecordDigest(executionPlan),
      workOrderDigest: await computeWorkOrderRecordDigest(workOrder),
      sourceDigest: executionPlan.sourceDigest,
      evaluatedAt: new Date().toISOString(),
    };

    const malformed = await postJson(endpoint, { ...requestBody, providerMode: 'forbidden' });
    assert.equal(malformed.response.status, 400);
    assert.match(malformed.payload.error, /unexpected or missing fields/);
    const stale = await postJson(endpoint, {
      ...requestBody,
      workOrderDigest: '0'.repeat(64),
    });
    assert.equal(stale.response.status, 409);
    assert.match(stale.payload.error, /workOrderDigest/);
    const wrongContentType = await postJson(endpoint, requestBody, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const crossedEndpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}` +
      `/work-orders/${encodeURIComponent(otherWorkOrder.id)}/verification-plan-preview`;
    const crossed = await postJson(crossedEndpoint, requestBody);
    assert.equal(crossed.response.status, 409);
    assert.match(crossed.payload.error, /workOrderDigest/);
    const oversized = await fetchJson(endpoint, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ padding: 'x'.repeat(65 * 1024) }),
    });
    assert.equal(oversized.response.status, 413);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const created = await postJson(endpoint, requestBody);
    assert.equal(created.response.status, 200);
    const preview = created.payload.workOrderVerificationPlanPreview;
    assert.equal(preview.persisted, false);
    assert.equal(preview.status, 'review-ready');
    assert.equal(preview.executionPlanId, executionPlan.id);
    assert.equal(preview.workOrderId, workOrder.id);
    assert.equal(preview.commandExecutionAllowed, false);
    assert.equal(preview.persistenceAllowed, false);
    assert.deepEqual(
      preview.criteria.map((criterion) => criterion.kind),
      ['happy-path', 'risk', 'regression', 'manual'],
    );
    assert.equal(Object.prototype.hasOwnProperty.call(created.payload, 'snapshot'), false);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

    const replay = await postJson(endpoint, requestBody);
    assert.equal(replay.response.status, 200);
    assert.deepEqual(replay.payload.workOrderVerificationPlanPreview, preview);
    assert.equal(fs.readFileSync(statePath, 'utf8'), stateBytesBefore);

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
            crossedStatus: crossed.response.status,
            oversizedStatus: oversized.response.status,
          },
          ui: {
            exactWorkOrderSelection: true,
            browserMemoryInvalidation: true,
            responseOnlyEvidence: true,
            executionAndCompletionControlsAbsent: true,
            separateDurableCriteriaControlPresent: true,
            sourceStateBytesUnchanged: true,
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
    throw new Error(`ui-slice-668 server stderr was not empty:\n${stderr}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
