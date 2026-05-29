#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const briefScript = path.join(repoRoot, 'scripts', 'verification-output-brief.mjs');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verification-output-brief-'));

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
assert.equal(payload.limits.maxLines, 4);
assert.equal(payload.limits.maxLinesSource, '--max-lines');
assert.equal(payload.limits.maxChars, 4000);
assert.equal(payload.limits.maxCharsSource, 'default');
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

const charLimitResult = spawnSync(
  process.execPath,
  [briefScript, '--max-lines', '1', '--max-chars', '12'],
  {
    cwd: repoRoot,
    input: 'Error: this failure line should be truncated for operator preview checks\n',
    encoding: 'utf8',
  },
);

assert.equal(
  charLimitResult.status,
  0,
  `verification output brief char limit failed: ${charLimitResult.stderr}`,
);

const charLimitPayload = JSON.parse(charLimitResult.stdout);

assert.equal(charLimitPayload.limits.maxLines, 1);
assert.equal(charLimitPayload.limits.maxChars, 12);
assert.equal(charLimitPayload.limits.maxCharsSource, '--max-chars');
assert.equal(charLimitPayload.briefLines.length, 1);
assert.equal(charLimitPayload.briefLines[0].text, 'Error: this ...');

const invalidLimitResult = spawnSync(process.execPath, [briefScript, '--max-lines', 'nope'], {
  cwd: repoRoot,
  input: sampleOutput,
  encoding: 'utf8',
});

assert.equal(invalidLimitResult.status, 2);

const invalidLimitPayload = JSON.parse(invalidLimitResult.stderr);

assert.equal(invalidLimitPayload.ok, false);
assert.equal(invalidLimitPayload.mode, 'verification-output-brief');
assert.equal(invalidLimitPayload.error, 'invalid-arguments');
assert.match(invalidLimitPayload.message, /--max-lines must be an integer/);
assert.deepEqual(invalidLimitPayload.allowedFlags, ['--file', '--max-lines', '--max-chars']);

const unknownFlagResult = spawnSync(process.execPath, [briefScript, '--max-liness', '1'], {
  cwd: repoRoot,
  input: sampleOutput,
  encoding: 'utf8',
});

assert.equal(unknownFlagResult.status, 2);

const unknownFlagPayload = JSON.parse(unknownFlagResult.stderr);

assert.equal(unknownFlagPayload.ok, false);
assert.equal(unknownFlagPayload.mode, 'verification-output-brief');
assert.equal(unknownFlagPayload.error, 'invalid-arguments');
assert.match(unknownFlagPayload.message, /Unknown argument: --max-liness/);
assert.deepEqual(unknownFlagPayload.allowedFlags, ['--file', '--max-lines', '--max-chars']);

const missingValueResult = spawnSync(process.execPath, [briefScript, '--file', '--max-lines', '1'], {
  cwd: repoRoot,
  input: sampleOutput,
  encoding: 'utf8',
});

assert.equal(missingValueResult.status, 2);

const missingValuePayload = JSON.parse(missingValueResult.stderr);

assert.equal(missingValuePayload.ok, false);
assert.equal(missingValuePayload.mode, 'verification-output-brief');
assert.equal(missingValuePayload.error, 'invalid-arguments');
assert.match(missingValuePayload.message, /--file requires a value/);
assert.deepEqual(missingValuePayload.allowedFlags, ['--file', '--max-lines', '--max-chars']);

const emptyInputResult = spawnSync(process.execPath, [briefScript], {
  cwd: repoRoot,
  input: '',
  encoding: 'utf8',
});

assert.equal(emptyInputResult.status, 2);
assert.equal(emptyInputResult.stdout, '');

const emptyInputPayload = JSON.parse(emptyInputResult.stderr);

assert.equal(emptyInputPayload.ok, false);
assert.equal(emptyInputPayload.mode, 'verification-output-brief');
assert.equal(emptyInputPayload.error, 'input-empty');
assert.match(emptyInputPayload.message, /requires non-empty stdin/);
assert.equal(emptyInputPayload.input.source, 'stdin');
assert.equal(emptyInputPayload.input.sourcePath, null);
assert.equal(emptyInputPayload.input.charCount, 0);
assert.match(emptyInputPayload.guidance, /before emitting a successful output brief/);

const missingFilePath = path.join(tempDir, 'missing-output.txt');
const missingFileResult = spawnSync(process.execPath, [briefScript, '--file', missingFilePath], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(missingFileResult.status, 2);
assert.equal(missingFileResult.stdout, '');

const missingFilePayload = JSON.parse(missingFileResult.stderr);

assert.equal(missingFilePayload.ok, false);
assert.equal(missingFilePayload.mode, 'verification-output-brief');
assert.equal(missingFilePayload.error, 'input-not-found');
assert.match(missingFilePayload.message, /Input file not found/);
assert.equal(missingFilePayload.providedPath, missingFilePath);
assert.equal(missingFilePayload.resolvedPath, missingFilePath);
assert.match(missingFilePayload.guidance, /before reading or emitting a successful output brief/);

console.log(
  JSON.stringify(
    {
      ok: true,
      verificationOutputBrief: {
        mode: payload.mode,
        referenceSignal: payload.referenceSignal,
        briefLineCount: payload.briefLines.length,
        charLimit: charLimitPayload.limits.maxChars,
        unknownFlagRejected: true,
        missingValueRejected: true,
        emptyInputRejected: true,
        missingFileRejected: true,
      },
    },
    null,
    2,
  ),
);
