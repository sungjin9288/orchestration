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

const typoResult = spawnSync(process.execPath, [briefScript, '--typo'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(typoResult.status, 2);
assert.equal(typoResult.stdout, '');

const typoPayload = JSON.parse(typoResult.stderr);
assert.equal(typoPayload.ok, false);
assert.equal(typoPayload.mode, 'harness-consumer-brief');
assert.equal(typoPayload.error, 'invalid-arguments');
assert.deepEqual(typoPayload.allowedFlags, []);
assert.deepEqual(typoPayload.receivedArgs, ['--typo']);

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
assert.equal(
  payload.brief.actionCommand,
  'node scripts/harness-run.mjs markitdown <input-file> [output-file]',
);
assert.equal(
  payload.brief.actionMessage,
  'Run markitdown now through node scripts/harness-run.mjs markitdown <input-file> [output-file].',
);

console.log(
  JSON.stringify(
    {
      ok: true,
      briefScript,
      brief: payload.brief,
      typoRejected: true,
    },
    null,
    2,
  ),
);
