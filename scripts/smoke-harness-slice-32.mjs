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

const expectedSummaryKeys = [
  'totalHarnesses',
  'readyHarnessCount',
  'installRequiredHarnessCount',
  'deferredHarnessCount',
  'policyBlockedHarnessCount',
  'runnableNow',
  'setupRequiredNow',
  'nextActionState',
  'currentHostState',
  'primaryHarnessId',
  'primaryHarnessState',
  'primaryRecommendedAction',
  'primaryInstallReview',
  'primaryNote',
  'primaryPosture',
  'primaryKind',
  'primaryCommand',
  'primaryRunner',
  'primaryExecutable',
  'primaryAvailable',
  'primaryInstallReviewRequired',
  'primaryReady',
  'primaryActionShort',
  'primaryActionMessage',
];

assert.deepEqual(Object.keys(payload.summary), expectedSummaryKeys);
assert.equal(payload.summary.totalHarnesses, 4);
assert.equal(payload.summary.currentHostState, 'setup-required');
assert.equal(payload.summary.primaryHarnessId, 'markitdown');
assert.equal(payload.summary.primaryHarnessState, 'install-required');
assert.equal(payload.summary.primaryAvailable, false);
assert.equal(payload.summary.primaryReady, false);
assert.equal(payload.summary.primaryActionShort, 'install');
assert.equal(
  payload.summary.primaryActionMessage,
  'Review pipx install markitdown and install markitdown locally before running it through the repo-native gate.',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      frozenSummaryKeys: expectedSummaryKeys,
      currentHostState: payload.summary.currentHostState,
      primaryHarnessId: payload.summary.primaryHarnessId,
    },
    null,
    2,
  ),
);
