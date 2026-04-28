#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');

const listResult = spawnSync(process.execPath, [runScript, 'list'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(listResult.status, 0, `list failed: ${listResult.stderr}`);

const listPayload = JSON.parse(listResult.stdout);
assert.equal(listPayload.mode, 'harness-run-list');
assert.deepEqual(
  listPayload.executableHarnesses.map((harness) => harness.id),
  ['markitdown'],
);

const approvedDispatchResult = spawnSync(process.execPath, [runScript, 'markitdown'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(approvedDispatchResult.status, 2, 'markitdown dispatch should surface wrapper usage without args');
assert.match(
  approvedDispatchResult.stderr,
  /Usage: markitdown-convert\.mjs \[--policy-report\|--dry-run\] <input-file> \[output-file\]/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      executableHarnesses: listPayload.executableHarnesses.map((harness) => harness.id),
    },
    null,
    2,
  ),
);
