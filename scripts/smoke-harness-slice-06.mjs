#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const markitdownInfoResult = spawnSync(process.execPath, [runScript, 'info', 'markitdown'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(markitdownInfoResult.status, 0, `markitdown info failed: ${markitdownInfoResult.stderr}`);

const markitdownInfoPayload = JSON.parse(markitdownInfoResult.stdout);
assert.equal(markitdownInfoPayload.mode, 'harness-run-info');
assert.equal(markitdownInfoPayload.harness.id, 'markitdown');
assert.equal(markitdownInfoPayload.harness.posture, 'approved-now');
assert.equal(markitdownInfoPayload.harness.runner, 'scripts/markitdown-convert.mjs');

const mempalaceInfoResult = spawnSync(process.execPath, [runScript, 'info', 'mempalace'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(mempalaceInfoResult.status, 0, `mempalace info failed: ${mempalaceInfoResult.stderr}`);

const mempalaceInfoPayload = JSON.parse(mempalaceInfoResult.stdout);
assert.equal(mempalaceInfoPayload.harness.id, 'mempalace');
assert.equal(mempalaceInfoPayload.harness.posture, 'future-post-v1');
assert.equal(mempalaceInfoPayload.harness.runner, null);

const cl4r1t4sInfoResult = spawnSync(process.execPath, [runScript, 'info', 'CL4R1T4S'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(cl4r1t4sInfoResult.status, 0, `CL4R1T4S info failed: ${cl4r1t4sInfoResult.stderr}`);

const cl4r1t4sInfoPayload = JSON.parse(cl4r1t4sInfoResult.stdout);
assert.equal(cl4r1t4sInfoPayload.harness.id, 'CL4R1T4S');
assert.equal(cl4r1t4sInfoPayload.harness.posture, 'signal-only');
assert.equal(cl4r1t4sInfoPayload.harness.runner, null);
assert.equal(cl4r1t4sInfoPayload.harness.executable, false);
assert.equal(cl4r1t4sInfoPayload.harness.state, 'policy-blocked');

const missingInfoResult = spawnSync(process.execPath, [runScript, 'info'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(missingInfoResult.status, 2, 'missing info target should fail');

const missingInfoPayload = JSON.parse(missingInfoResult.stderr);
assert.equal(missingInfoPayload.ok, false);
assert.equal(missingInfoPayload.mode, 'harness-run');
assert.equal(missingInfoPayload.error, 'invalid-arguments');
assert.match(missingInfoPayload.message, /info requires a harness id/);
assert.equal(missingInfoPayload.usage, 'harness-run.mjs info <harness-id>');

const extraInfoResult = spawnSync(process.execPath, [runScript, 'info', 'markitdown', '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(extraInfoResult.status, 2, 'info should reject extra args');

const extraInfoPayload = JSON.parse(extraInfoResult.stderr);
assert.equal(extraInfoPayload.ok, false);
assert.equal(extraInfoPayload.mode, 'harness-run');
assert.equal(extraInfoPayload.error, 'invalid-arguments');
assert.match(extraInfoPayload.message, /info accepts exactly one harness id/);
assert.deepEqual(extraInfoPayload.unexpectedArgs, ['--typo']);
assert.equal(extraInfoPayload.usage, 'harness-run.mjs info <harness-id>');

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      checkedHarnesses: ['markitdown', 'mempalace', 'CL4R1T4S'],
      extraInfoArgRejected: true,
    },
    null,
    2,
  ),
);
