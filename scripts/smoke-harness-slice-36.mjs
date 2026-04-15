#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const briefScript = path.join(repoRoot, 'scripts', 'harness-consumer-brief.mjs');

const result = spawnSync(process.execPath, [briefScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `harness consumer brief failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);
assert.equal(payload.mode, 'harness-consumer-brief');
assert.equal(payload.ok, true);
assert.equal(payload.sourceMode, 'harness-consumer-status');
assert.ok(payload.brief, 'consumer brief missing');

const expectedBriefKeys = [
  'currentHostState',
  'primaryHarnessId',
  'headline',
  'actionLabel',
  'actionCommand',
  'actionMessage',
];

assert.deepEqual(Object.keys(payload.brief), expectedBriefKeys);
assert.equal(payload.brief.currentHostState, 'runnable');
assert.equal(payload.brief.primaryHarnessId, 'markitdown');
assert.equal(payload.brief.headline, 'markitdown is ready on this host.');
assert.equal(payload.brief.actionLabel, 'Run approved harness');
assert.equal(payload.brief.actionCommand, 'node scripts/harness-run.mjs markitdown');
assert.equal(
  payload.brief.actionMessage,
  'Run markitdown now through node scripts/harness-run.mjs markitdown.',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      briefScript,
      brief: payload.brief,
    },
    null,
    2,
  ),
);
