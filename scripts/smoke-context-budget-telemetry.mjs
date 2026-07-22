import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import telemetryModule from '../src/runtime/context-budget-telemetry.js';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const { compileContextBudgetTelemetry } = telemetryModule;
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tempRoot = path.join(repoRoot, 'var', 'context-budget-telemetry-smoke');
const port = 9840 + (process.pid % 120);
const baseUrl = `http://127.0.0.1:${port}`;
const MODE = 'context-budget-telemetry-smoke';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

function buildInput() {
  return {
    evaluatedAt: '2030-01-01T00:00:00.000Z',
    operatorAcknowledgement: 'measurement-only-no-payload-rewrite',
    payload: {
      executionPlanId: 'execution-plan-0001',
      sourceDigest: 'a'.repeat(64),
      targetPath: 'src/runtime/runtime-service.js',
      verificationCommands: ['node --check src/runtime/runtime-service.js'],
      approval: { decision: 'approved', approvalId: 'approval-0001' },
      negativeEvidenceRefs: ['negative-evidence-0001'],
      description: `RECOVERABLE-DESCRIPTION-${'가'.repeat(80)}`,
      toolSummary: `RECOVERABLE-TOOL-SUMMARY-${'x'.repeat(120)}`,
      nested: { status: 'current', note: 'short exact note' },
    },
    telemetrySpec: {
      gistPathAllowlist: ['/description', '/toolSummary'],
      truncationThresholdBytes: 64,
    },
  };
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
  throw new Error('Timed out waiting for context telemetry API smoke server');
}

async function postReport(body, contentType = 'application/json') {
  const response = await fetch(`${baseUrl}/api/telemetry/context-budget-report`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': contentType },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { response, payload: await response.json() };
}

async function main() {
  const input = buildInput();
  const before = structuredClone(input);
  const report = compileContextBudgetTelemetry(input);
  assert.deepEqual(input, before);
  assert.equal(report.status, 'measurement-ready');
  assert.equal(report.persisted, false);
  assert.equal(report.metrics.gist.fieldCount, 2);
  assert.equal(report.metrics.truncationEligible.fieldCount, 2);
  assert.ok(report.metrics.exact.fieldCount >= 8);
  assert.ok(report.metrics.payloadUtf8Bytes > report.metrics.payloadCharacterCount);
  assert.equal(report.authority.payloadRewriteAllowed, false);
  assert.equal(report.authority.truncationAllowed, false);
  assert.equal(report.authority.providerCallAllowed, false);
  assert.ok(Object.isFrozen(report));
  assert.ok(Object.isFrozen(report.fields));
  assert.deepEqual(compileContextBudgetTelemetry(input), report);
  assert.doesNotMatch(JSON.stringify(report), /RECOVERABLE-DESCRIPTION/);
  assert.doesNotMatch(JSON.stringify(report), /RECOVERABLE-TOOL-SUMMARY/);
  assert.throws(
    () => compileContextBudgetTelemetry({
      ...input,
      telemetrySpec: { ...input.telemetrySpec, gistPathAllowlist: ['/sourceDigest'] },
    }),
    /Protected exact field/,
  );
  assert.throws(
    () => compileContextBudgetTelemetry({
      ...input,
      telemetrySpec: { ...input.telemetrySpec, gistPathAllowlist: ['/verificationCommands'] },
    }),
    /Protected exact field/,
  );
  assert.throws(
    () => compileContextBudgetTelemetry({ ...input, extra: true }),
    /unexpected or missing fields/,
  );

  fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', tempRoot],
    { cwd: repoRoot, stdio: ['ignore', 'pipe', 'pipe'] },
  );
  let stderr = '';
  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });
  try {
    await waitForServer();
    const apiReport = await postReport(input);
    assert.equal(apiReport.response.status, 200);
    assert.equal(apiReport.payload.contextBudgetReport.reportDigest, report.reportDigest);
    const protectedGist = await postReport({
      ...input,
      telemetrySpec: { ...input.telemetrySpec, gistPathAllowlist: ['/approval'] },
    });
    assert.equal(protectedGist.response.status, 400);
    const wrongContentType = await postReport(input, 'text/plain');
    assert.equal(wrongContentType.response.status, 415);
    const oversized = await postReport(JSON.stringify({
      ...input,
      payload: { description: 'x'.repeat(129 * 1024) },
    }));
    assert.equal(oversized.response.status, 413);

    console.log(JSON.stringify({
      ok: true,
      mode: MODE,
      reportStatus: report.status,
      metrics: report.metrics,
      defaultClassification: 'exact',
      explicitGistPaths: report.telemetrySpec.gistPathAllowlist,
      protectedExactFields: true,
      rawValuesReturned: false,
      apiStatuses: {
        report: apiReport.response.status,
        protectedGist: protectedGist.response.status,
        unsupportedMedia: wrongContentType.response.status,
        oversized: oversized.response.status,
      },
      blocked: ['payload-rewrite', 'truncation', 'compression', 'provider-call', 'persistence'],
    }, null, 2));
  } finally {
    server.kill('SIGTERM');
    await Promise.race([
      new Promise((resolve) => server.once('exit', resolve)),
      delay(2000),
    ]);
    if (stderr.trim()) process.stderr.write(stderr);
    fs.rmSync(tempRoot, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
