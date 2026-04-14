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

const expectedPrimaryHarnessId =
  payload.nextAction?.harnessId ??
  payload.readyHarnessIds[0] ??
  payload.deferredHarnessIds[0] ??
  payload.policyBlockedHarnessIds[0] ??
  null;

assert.equal(payload.summary.primaryHarnessId, expectedPrimaryHarnessId);
assert.equal(payload.summary.primaryHarnessId, 'markitdown');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      primaryHarnessId: payload.summary.primaryHarnessId,
    },
    null,
    2,
  ),
);
