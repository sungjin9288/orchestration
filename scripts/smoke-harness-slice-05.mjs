#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const statusScript = path.join(repoRoot, 'scripts', 'harness_verification_status.mjs');

const result = spawnSync(process.execPath, [statusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness_verification_status failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'synthetic-harness-verification');
assert.equal(payload.ok, true);
assert.equal(payload.counts.totalChecks, 7);
assert.equal(payload.counts.failedChecks, 0);

const checkIds = payload.checks.map((check) => check.id);
assert.deepEqual(checkIds, [
  'harness-inventory-status',
  'harness-doc-baseline',
  'harness-inventory-contract',
  'harness-policy-gate',
  'harness-approved-dispatch',
  'harness-info-entrypoint',
  'harness-info-status-sync',
]);

console.log(
  JSON.stringify(
    {
      ok: true,
      statusScript,
      checkCount: payload.counts.totalChecks,
    },
    null,
    2,
  ),
);
