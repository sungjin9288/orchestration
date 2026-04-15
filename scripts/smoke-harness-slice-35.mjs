#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const consumerScript = path.join(repoRoot, 'scripts', 'harness-consumer-status.mjs');

const result = spawnSync(process.execPath, [consumerScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness consumer status failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'harness-consumer-status');
assert.equal(payload.ok, true);
assert.ok(payload.operatorAction, 'consumer operatorAction missing');

const expectedOperatorActionKeys = ['kind', 'harnessId', 'repoNativeCommand', 'message'];
assert.deepEqual(Object.keys(payload.operatorAction), expectedOperatorActionKeys);
assert.equal(payload.operatorAction.kind, 'repo-native-run');
assert.equal(payload.operatorAction.harnessId, 'markitdown');
assert.equal(
  payload.operatorAction.repoNativeCommand,
  'node scripts/harness-run.mjs markitdown <input-file> [output-file]',
);
assert.equal(
  payload.operatorAction.message,
  'Run markitdown now through node scripts/harness-run.mjs markitdown <input-file> [output-file].',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      consumerScript,
      operatorAction: payload.operatorAction,
    },
    null,
    2,
  ),
);
