#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

function runHarness(args) {
  return spawnSync(process.execPath, [runScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function parseFailure(result) {
  assert.equal(result.status, 2);
  assert.equal(result.stdout, '');
  return JSON.parse(result.stderr);
}

const missingIdPayload = parseFailure(runHarness([]));
assert.equal(missingIdPayload.ok, false);
assert.equal(missingIdPayload.mode, 'harness-run');
assert.equal(missingIdPayload.error, 'invalid-arguments');
assert.match(missingIdPayload.message, /Missing required harness id/);
assert.equal(missingIdPayload.usage, 'harness-run.mjs <harness-id> [args...]');
assert.deepEqual(missingIdPayload.allowedSubcommands, ['list', 'info', 'doctor']);

const unknownHarnessPayload = parseFailure(runHarness(['unknown-harness']));
assert.equal(unknownHarnessPayload.ok, false);
assert.equal(unknownHarnessPayload.mode, 'harness-run');
assert.equal(unknownHarnessPayload.error, 'invalid-arguments');
assert.match(unknownHarnessPayload.message, /Unknown harness: unknown-harness/);
assert.equal(unknownHarnessPayload.harnessId, 'unknown-harness');
assert.equal(unknownHarnessPayload.usage, 'harness-run.mjs <harness-id> [args...]');

const unknownInfoPayload = parseFailure(runHarness(['info', 'unknown-harness']));
assert.equal(unknownInfoPayload.ok, false);
assert.equal(unknownInfoPayload.mode, 'harness-run');
assert.equal(unknownInfoPayload.error, 'invalid-arguments');
assert.match(unknownInfoPayload.message, /Unknown harness: unknown-harness/);
assert.equal(unknownInfoPayload.harnessId, 'unknown-harness');
assert.equal(unknownInfoPayload.usage, 'harness-run.mjs info <harness-id>');

const nonExecutablePayload = parseFailure(runHarness(['hermes-agent']));
assert.equal(nonExecutablePayload.ok, false);
assert.equal(nonExecutablePayload.mode, 'harness-run');
assert.equal(nonExecutablePayload.error, 'harness-not-executable');
assert.match(nonExecutablePayload.message, /not executable in the current repo posture/);
assert.equal(nonExecutablePayload.harnessId, 'hermes-agent');
assert.equal(nonExecutablePayload.posture, 'future-post-v1');
assert.equal(nonExecutablePayload.state, 'deferred');
assert.equal(nonExecutablePayload.executable, false);
assert.equal(nonExecutablePayload.runner, null);
assert.match(nonExecutablePayload.guidance, /Future ACP harness reference only/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunTargetFailureContract: {
        missingIdRejected: true,
        unknownHarnessRejected: true,
        unknownInfoRejected: true,
        nonExecutableRejected: true,
      },
    },
    null,
    2,
  ),
);
