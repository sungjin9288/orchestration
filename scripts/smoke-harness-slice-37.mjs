#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');
const consumerStatusScript = path.join(repoRoot, 'scripts', 'harness-consumer-status.mjs');
const consumerBriefScript = path.join(repoRoot, 'scripts', 'harness-consumer-brief.mjs');
const expectedTemplate = 'node scripts/harness-run.mjs markitdown <input-file> [output-file]';
const expectedMessage =
  'Run markitdown now through node scripts/harness-run.mjs markitdown <input-file> [output-file].';

const bareDispatchResult = spawnSync(process.execPath, [runScript, 'markitdown'], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(bareDispatchResult.status, 2, `bare markitdown dispatch should require args: ${bareDispatchResult.stderr}`);
assert.match(
  bareDispatchResult.stderr,
  /Usage: markitdown-convert\.mjs <input-file> \[output-file\]/,
);

const consumerStatusResult = spawnSync(process.execPath, [consumerStatusScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(consumerStatusResult.status, 0, `harness consumer status failed: ${consumerStatusResult.stderr}`);
const consumerStatusPayload = JSON.parse(consumerStatusResult.stdout);
assert.equal(consumerStatusPayload.operatorAction?.repoNativeCommand, expectedTemplate);
assert.equal(consumerStatusPayload.operatorAction?.message, expectedMessage);

const consumerBriefResult = spawnSync(process.execPath, [consumerBriefScript], {
  cwd: repoRoot,
  encoding: 'utf8',
});
assert.equal(consumerBriefResult.status, 0, `harness consumer brief failed: ${consumerBriefResult.stderr}`);
const consumerBriefPayload = JSON.parse(consumerBriefResult.stdout);
assert.equal(consumerBriefPayload.brief?.actionCommand, expectedTemplate);
assert.equal(consumerBriefPayload.brief?.actionMessage, expectedMessage);

console.log(
  JSON.stringify(
    {
      ok: true,
      commandTemplateTruth: {
        bareDispatchStatus: bareDispatchResult.status,
        commandTemplate: expectedTemplate,
        message: expectedMessage,
      },
    },
    null,
    2,
  ),
);
