#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const result = spawnSync(process.execPath, [runScript, 'doctor'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness doctor failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'harness-run-doctor');
assert.equal(payload.ok, true);
assert.ok(payload.summary, 'doctor summary missing');

assert.equal(payload.summary.totalHarnesses, payload.counts.total);
assert.equal(payload.summary.readyHarnessCount, payload.readyHarnessIds.length);
assert.equal(payload.summary.installRequiredHarnessCount, payload.installRequiredHarnessIds.length);
assert.equal(payload.summary.deferredHarnessCount, payload.deferredHarnessIds.length);
assert.equal(payload.summary.policyBlockedHarnessCount, payload.policyBlockedHarnessIds.length);
assert.equal(payload.summary.runnableNow, payload.readyHarnessIds.length > 0);
assert.equal(payload.summary.setupRequiredNow, payload.installRequiredHarnessIds.length > 0);
assert.equal(payload.summary.nextActionState, payload.nextAction?.state ?? 'none');
assert.equal(payload.summary.nextActionState, 'install-required');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      totalHarnesses: payload.summary.totalHarnesses,
      nextActionState: payload.summary.nextActionState,
    },
    null,
    2,
  ),
);
