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

const primaryHarnessId = payload.summary.primaryHarnessId;
const primaryHarnessState = payload.summary.primaryHarnessState;
const primaryInstallReview = payload.summary.primaryInstallReview;

const expectedMessage =
  primaryHarnessId === null
    ? 'No representative harness action is required for the current host.'
    : primaryHarnessState === 'ready'
      ? `Run ${primaryHarnessId} now through node scripts/harness-run.mjs ${primaryHarnessId}.`
      : primaryHarnessState === 'install-required'
        ? primaryInstallReview
          ? `Review ${primaryInstallReview} and install ${primaryHarnessId} locally before running it through the repo-native gate.`
          : `Install ${primaryHarnessId} locally before running it through the repo-native gate.`
        : primaryHarnessState === 'deferred'
          ? `Keep ${primaryHarnessId} outside the current v1 path and treat it as future-post-v1 only.`
          : primaryHarnessState === 'policy-blocked'
            ? `Do not run ${primaryHarnessId} in the current repo posture; keep it as signal-only.`
            : 'No representative harness action is required for the current host.';

assert.equal(payload.summary.primaryActionMessage, expectedMessage);
assert.equal(
  payload.summary.primaryActionMessage,
  'Run markitdown now through node scripts/harness-run.mjs markitdown.',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      primaryActionMessage: payload.summary.primaryActionMessage,
    },
    null,
    2,
  ),
);
