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

const expectedPrimaryRecommendedAction =
  payload.nextAction?.recommendedAction ??
  (payload.readyHarnessIds.length > 0
    ? 'run-approved-harness'
    : payload.deferredHarnessIds.length > 0
      ? 'keep-outside-current-v1-path'
      : payload.policyBlockedHarnessIds.length > 0
        ? 'do-not-run'
        : 'none');

assert.equal(payload.summary.primaryRecommendedAction, expectedPrimaryRecommendedAction);
assert.equal(payload.summary.primaryRecommendedAction, 'review-install-and-install-locally');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      primaryRecommendedAction: payload.summary.primaryRecommendedAction,
    },
    null,
    2,
  ),
);
