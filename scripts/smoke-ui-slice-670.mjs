import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-670');
const runtimeRoot = path.join(tempRoot, 'runtime');
const statePath = path.join(runtimeRoot, 'state.json');
const port = 9680 + (process.pid % 200);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'ui-slice-670-bounded-continuation-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function seedFixture() {
  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const result = spawnSync(
    process.execPath,
    ['scripts/smoke-ai-company-acceptance-criterion-proof.mjs'],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      env: {
        ...process.env,
        ORCHESTRATION_ACCEPTANCE_PROOF_KEEP_FIXTURE: '1',
        ORCHESTRATION_ACCEPTANCE_PROOF_SEED_STAGE: 'reviewer-ready-proven',
        ORCHESTRATION_ACCEPTANCE_PROOF_TEMP_ROOT: tempRoot,
      },
    },
  );
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || 'Failed to seed UI continuation fixture');
  }
}

async function requestJson(pathname, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  return { response, payload: await response.json() };
}

function postJson(pathname, body, contentType = 'application/json') {
  return requestJson(pathname, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
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
  throw new Error('Timed out waiting for ui-slice-670 server');
}

async function main() {
  seedFixture();
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  const executionPlan = Object.values(state.executionPlans)[0];
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
    const [appSource, stylesSource, recoveryResult] = await Promise.all([
      fetch(`${baseUrl}/app.js`).then((response) => response.text()),
      fetch(`${baseUrl}/styles.css`).then((response) => response.text()),
      requestJson(`/api/execution-plans/${encodeURIComponent(executionPlan.id)}/recovery`),
    ]);
    assert.match(appSource, /data-action="\$\{continuationReady \? 'resume-workflow-checkpoint' : 'preview-execution-continuation'\}"/);
    assert.match(appSource, /maxSteps: 1/);
    assert.match(appSource, /previousProgressDigest: null/);
    assert.match(appSource, /bounded continuation preview/);
    assert.doesNotMatch(appSource, /automatic-continuation/);
    assert.match(stylesSource, /\.execution-continuation-preview/);
    assert.match(stylesSource, /@media \(max-width: 760px\)/);
    assert.equal(recoveryResult.response.status, 200);

    const checkpoint = recoveryResult.payload.executionPlanRecovery.checkpoint;
    const action = recoveryResult.payload.executionPlanRecovery.nextAllowedActions[0];
    const evaluatedAt = '2030-01-01T00:00:00.000Z';
    const endpoint =
      `/api/execution-plans/${encodeURIComponent(executionPlan.id)}/continuation-preview`;
    const body = {
      checkpointId: checkpoint.id,
      checkpointDigest: checkpoint.checkpointDigest,
      inputDigest: checkpoint.inputDigest,
      authorityDigest: checkpoint.authorityDigest,
      action,
      evaluatedAt,
      continuationSpec: {
        cancellationRequested: false,
        deadlineAt: '2030-01-01T00:05:00.000Z',
        maxSteps: 1,
        previousProgressDigest: null,
      },
    };
    const before = fs.readFileSync(statePath);
    const ready = await postJson(endpoint, body);
    assert.equal(ready.response.status, 200);
    assert.equal(ready.payload.executionContinuationPreview.status, 'continuation-ready');
    assert.equal(ready.payload.executionContinuationPreview.persisted, false);

    const noProgress = await postJson(endpoint, {
      ...body,
      continuationSpec: {
        ...body.continuationSpec,
        previousProgressDigest: ready.payload.executionContinuationPreview.progressDigest,
      },
    });
    assert.equal(noProgress.response.status, 200);
    assert.equal(noProgress.payload.executionContinuationPreview.status, 'no-progress');

    const stale = await postJson(endpoint, { ...body, checkpointDigest: '0'.repeat(64) });
    assert.equal(stale.response.status, 409);
    const malformed = await postJson(endpoint, { executionPlanId: executionPlan.id });
    assert.equal(malformed.response.status, 409);
    const wrongContentType = await postJson(endpoint, body, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await postJson(
      endpoint,
      JSON.stringify({ ...body, padding: 'x'.repeat(17 * 1024) }),
    );
    assert.equal(oversized.response.status, 413);
    assert.deepEqual(fs.readFileSync(statePath), before);

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      schemaVersion: state.schemaVersion,
      apiStatuses: {
        ready: ready.response.status,
        noProgress: noProgress.response.status,
        stale: stale.response.status,
        malformed: malformed.response.status,
        unsupportedMedia: wrongContentType.response.status,
        oversized: oversized.response.status,
      },
      browserMemoryOnly: true,
      stateBytesStable: true,
      responsiveSourcePresent: true,
      blocked: ['automatic-continuation', 'background-scheduling', 'retry-loop'],
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000),
    ]);
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
    if (stderr.trim()) process.stderr.write(stderr);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
