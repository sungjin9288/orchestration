#!/usr/bin/env node
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const briefScript = path.join(repoRoot, 'scripts', 'verification-output-brief.mjs');

const sampleOutput = [
  'node scripts/smoke-harness-slice-41.mjs',
  'ok work-quality guard passed',
  'warning optional live provider skipped',
  'Error: stale expectation detected',
  'context line that should stay lower priority',
].join('\n');

const result = spawnSync(process.execPath, [briefScript, '--max-lines', '4'], {
  cwd: repoRoot,
  input: sampleOutput,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `verification output brief failed: ${result.stderr}`);

const payload = JSON.parse(result.stdout);

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'verification-output-brief');
assert.equal(payload.referenceSignal, 'rtk');
assert.equal(payload.posture, 'explicit-local-output-brief');
assert.equal(payload.dependencyRequired, false);
assert.equal(payload.installsShellHooks, false);
assert.equal(payload.rewritesCommands, false);
assert.equal(payload.input.source, 'stdin');
assert.equal(payload.countsByType.fail, 1);
assert.equal(payload.countsByType.warn, 1);
assert.equal(payload.countsByType.pass, 1);
assert.equal(payload.countsByType.command, 1);
assert.equal(payload.truncated, true);
assert.deepEqual(
  payload.briefLines.map((line) => line.type),
  ['fail', 'warn', 'pass', 'command'],
);

console.log(
  JSON.stringify(
    {
      ok: true,
      verificationOutputBrief: {
        mode: payload.mode,
        referenceSignal: payload.referenceSignal,
        briefLineCount: payload.briefLines.length,
      },
    },
    null,
    2,
  ),
);
