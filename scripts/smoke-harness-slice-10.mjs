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
assert.ok(payload.nextAction, 'doctor nextAction missing');
assert.ok(Array.isArray(payload.actionQueue), 'doctor actionQueue missing');
assert.ok(payload.actionQueue.length > 0, 'doctor actionQueue should not be empty on current host');

assert.deepEqual(payload.nextAction, payload.actionQueue[0]);
assert.equal(payload.nextAction.harnessId, 'markitdown');
assert.equal(payload.nextAction.state, 'install-required');
assert.equal(payload.nextAction.recommendedAction, 'review-install-and-install-locally');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      nextActionHarnessId: payload.nextAction.harnessId,
      nextActionState: payload.nextAction.state,
    },
    null,
    2,
  ),
);
