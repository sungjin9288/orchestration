#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');
const statusScript = path.join(repoRoot, 'scripts', 'harness-status.mjs');

const statusResult = spawnSync(process.execPath, [statusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(statusResult.status, 0, `harness-status failed: ${statusResult.stderr}`);

const statusPayload = JSON.parse(statusResult.stdout);
const markitdownStatus = statusPayload.harnesses.find((harness) => harness.id === 'markitdown');
const mempalaceStatus = statusPayload.harnesses.find((harness) => harness.id === 'mempalace');
assert.ok(markitdownStatus, 'markitdown status missing');
assert.ok(mempalaceStatus, 'mempalace status missing');
assert.equal(markitdownStatus.executable, true);
assert.equal(mempalaceStatus.executable, false);

const markitdownInfoResult = spawnSync(process.execPath, [runScript, 'info', 'markitdown'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(markitdownInfoResult.status, 0, `markitdown info failed: ${markitdownInfoResult.stderr}`);
const markitdownInfo = JSON.parse(markitdownInfoResult.stdout);
assert.equal(markitdownInfo.harness.available, markitdownStatus.available);
assert.equal(markitdownInfo.harness.executable, true);

const mempalaceInfoResult = spawnSync(process.execPath, [runScript, 'info', 'mempalace'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(mempalaceInfoResult.status, 0, `mempalace info failed: ${mempalaceInfoResult.stderr}`);
const mempalaceInfo = JSON.parse(mempalaceInfoResult.stdout);
assert.equal(mempalaceInfo.harness.available, mempalaceStatus.available);
assert.equal(mempalaceInfo.harness.executable, false);

console.log(
  JSON.stringify(
    {
      ok: true,
      syncedHarnesses: ['markitdown', 'mempalace'],
    },
    null,
    2,
  ),
);
