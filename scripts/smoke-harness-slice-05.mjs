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
assert.equal(payload.counts.totalChecks, 30);
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
  'harness-doctor-summary',
  'harness-doctor-action-queue',
  'harness-doctor-next-action',
  'harness-doctor-ready-list',
  'harness-doctor-install-required-list',
  'harness-doctor-deferred-list',
  'harness-doctor-policy-blocked-list',
  'harness-doctor-summary-object',
  'harness-doctor-current-host-state',
  'harness-doctor-primary-harness',
  'harness-doctor-primary-harness-state',
  'harness-doctor-primary-recommended-action',
  'harness-doctor-primary-install-review',
  'harness-doctor-primary-note',
  'harness-doctor-primary-posture',
  'harness-doctor-primary-command',
  'harness-doctor-primary-runner',
  'harness-doctor-primary-executable',
  'harness-doctor-primary-available',
  'harness-doctor-primary-kind',
  'harness-doctor-primary-install-review-required',
  'harness-doctor-primary-ready',
  'harness-doctor-primary-action-short',
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
