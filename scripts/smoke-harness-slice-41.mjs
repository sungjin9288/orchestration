#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const guardScript = path.join(repoRoot, 'scripts', 'work-quality-guard.mjs');

const result = spawnSync(process.execPath, [guardScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `work-quality guard failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'work-quality-guard');
assert.equal(payload.referenceSignal, 'andrej-karpathy-skills');
assert.equal(payload.posture, 'repo-native-guideline-guard');
assert.equal(payload.dependencyRequired, false);
assert.equal(payload.runtimeMutation, false);
assert.equal(payload.failures.missingFiles.length, 0);
assert.equal(payload.failures.missingAnchors.length, 0);

const checkIds = payload.checks.map((check) => check.id);
assert.deepEqual(checkIds, [
  'think-before-coding',
  'simplicity-first',
  'surgical-changes',
  'verification-required',
  'local-ops-boundary',
  'review-before-done',
]);

for (const check of payload.checks) {
  assert.equal(check.ok, true, `${check.id} should be anchored`);
  assert.ok(check.evidence.length > 0, `${check.id} evidence missing`);
}

console.log(
  JSON.stringify(
    {
      ok: true,
      workQualityGuard: {
        mode: payload.mode,
        referenceSignal: payload.referenceSignal,
        checkCount: payload.checks.length,
      },
    },
    null,
    2,
  ),
);
