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
assert.equal(payload.sourceMode, 'harness-run-doctor');
assert.ok(payload.statusCard, 'consumer statusCard missing');

const typoResult = spawnSync(process.execPath, [consumerScript, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(typoResult.status, 2);
assert.equal(typoResult.stdout, '');

const typoPayload = JSON.parse(typoResult.stderr);
assert.equal(typoPayload.ok, false);
assert.equal(typoPayload.mode, 'harness-consumer-status');
assert.equal(typoPayload.error, 'invalid-arguments');
assert.deepEqual(typoPayload.allowedFlags, []);
assert.deepEqual(typoPayload.receivedArgs, ['--typo']);

const expectedStatusCardKeys = [
  'currentHostState',
  'primaryHarnessId',
  'primaryPosture',
  'primaryKind',
  'primaryHarnessState',
  'primaryCommand',
  'primaryRunner',
  'primaryExecutable',
  'primaryAvailable',
  'primaryReady',
  'primaryActionShort',
  'primaryActionMessage',
];

assert.deepEqual(Object.keys(payload.statusCard), expectedStatusCardKeys);
assert.equal(payload.statusCard.currentHostState, 'runnable');
assert.equal(payload.statusCard.primaryHarnessId, 'markitdown');
assert.equal(payload.statusCard.primaryPosture, 'approved-now');
assert.equal(payload.statusCard.primaryKind, 'local-cli-wrapper');
assert.equal(payload.statusCard.primaryHarnessState, 'ready');
assert.equal(payload.statusCard.primaryCommand, 'markitdown');
assert.equal(payload.statusCard.primaryRunner, 'scripts/markitdown-convert.mjs');
assert.equal(payload.statusCard.primaryExecutable, true);
assert.equal(payload.statusCard.primaryAvailable, true);
assert.equal(payload.statusCard.primaryReady, true);
assert.equal(payload.statusCard.primaryActionShort, 'run-now');
assert.equal(
  payload.statusCard.primaryActionMessage,
  'Run markitdown now through node scripts/harness-run.mjs markitdown <input-file> [output-file].',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      consumerScript,
      statusCard: payload.statusCard,
      typoRejected: true,
    },
    null,
    2,
  ),
);
