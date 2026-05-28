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
assert.equal(payload.counts.totalChecks, 45);
assert.equal(payload.counts.failedChecks, 0);

const unknownArgResult = spawnSync(process.execPath, [statusScript, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
const unknownArgPayload = JSON.parse(unknownArgResult.stderr);

assert.equal(unknownArgResult.status, 2);
assert.equal(unknownArgResult.stdout, '');
assert.equal(unknownArgPayload.ok, false);
assert.equal(unknownArgPayload.mode, 'synthetic-harness-verification');
assert.equal(unknownArgPayload.error, 'invalid-arguments');
assert.deepEqual(unknownArgPayload.allowedFlags, []);
assert.deepEqual(unknownArgPayload.receivedArgs, ['--typo']);

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
  'harness-doctor-primary-action-message',
  'harness-doctor-summary-contract-freeze',
  'harness-consumer-status',
  'harness-markitdown-host-ready-run',
  'harness-consumer-operator-action',
  'harness-consumer-brief',
  'harness-command-template-alignment',
  'harness-memory-brief-preview',
  'harness-prompt-provenance-guard',
  'harness-external-reference-inventory-sync',
  'harness-work-quality-guard',
  'harness-verification-output-brief',
  'harness-markitdown-policy-report',
  'harness-hermes-agent-acp-bridge-boundary',
  'harness-hermes-agent-internal-composition',
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
