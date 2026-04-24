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

const missingInfoResult = spawnSync(process.execPath, [runScript, 'info'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(missingInfoResult.status, 2, 'missing info target should fail');
assert.match(missingInfoResult.stderr, /Usage: harness-run\.mjs info <harness-id>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      checkedHarnesses: ['markitdown', 'mempalace'],
    },
    null,
    2,
  ),
);
