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
assert.ok(Array.isArray(payload.actionQueue), 'doctor actionQueue missing');
assert.equal(payload.actionQueue.length, payload.harnesses.length);

const [firstAction, secondAction, thirdAction, fourthAction] = payload.actionQueue;

assert.ok(firstAction, 'expected first doctor action');
assert.equal(firstAction.harnessId, 'markitdown');
assert.equal(firstAction.state, 'ready');
assert.equal(firstAction.recommendedAction, 'run-approved-harness');

assert.ok(secondAction, 'expected second doctor action');
assert.equal(secondAction.harnessId, 'mempalace');
assert.equal(secondAction.state, 'deferred');

assert.ok(thirdAction, 'expected third doctor action');
assert.equal(thirdAction.harnessId, 'openscreen');
assert.equal(thirdAction.state, 'deferred');

assert.ok(fourthAction, 'expected fourth doctor action');
assert.equal(fourthAction.state, 'policy-blocked');
assert.ok(['hermes-agent', 'free-code'].includes(fourthAction.harnessId));

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      actionQueueLength: payload.actionQueue.length,
      firstAction: firstAction.harnessId,
    },
    null,
    2,
  ),
);
