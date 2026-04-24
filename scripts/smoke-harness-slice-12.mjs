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
assert.ok(Array.isArray(payload.installRequiredHarnessIds), 'doctor installRequiredHarnessIds missing');

const installRequiredHarnessesFromState = payload.harnesses
  .filter((harness) => harness.state === 'install-required')
  .map((harness) => harness.id);

assert.deepEqual(payload.installRequiredHarnessIds, installRequiredHarnessesFromState);
assert.deepEqual(payload.installRequiredHarnessIds, []);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      installRequiredHarnessCount: payload.installRequiredHarnessIds.length,
      firstInstallRequiredHarnessId: payload.installRequiredHarnessIds[0] ?? null,
    },
    null,
    2,
  ),
);
