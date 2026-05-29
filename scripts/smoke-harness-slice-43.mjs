#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const wrapperScript = path.join(repoRoot, 'scripts', 'markitdown-convert.mjs');
const baselineDoc = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markitdown-policy-report-'));
const inputPath = path.join(tempDir, 'input.txt');
const outputPath = path.join(tempDir, 'output.md');

fs.writeFileSync(inputPath, 'Policy report fixture\n', 'utf8');

const result = spawnSync(process.execPath, [wrapperScript, '--policy-report', inputPath, outputPath], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `markitdown policy report failed: ${result.stderr}`);
assert.equal(fs.existsSync(outputPath), false, 'policy report must not write the output file');

const payload = JSON.parse(result.stdout);
assert.equal(payload.ok, true);
assert.equal(payload.mode, 'markitdown-policy-report');
assert.equal(payload.input.resolvedPath, inputPath);
assert.equal(payload.input.exists, true);
assert.equal(payload.output.resolvedPath, outputPath);
assert.equal(payload.output.wouldWrite, true);
assert.equal(payload.pathPolicy.executesConversion, false);
assert.equal(payload.pathPolicy.readsWithCurrentProcessPrivileges, true);
assert.equal(payload.pathPolicy.writesWithCurrentProcessPrivileges, false);
assert.equal(payload.pathPolicy.shellHooksInstalled, false);
assert.equal(payload.pathPolicy.runtimeMutation, false);
assert.match(payload.pathPolicy.guidance, /current process privileges/i);

const unknownFlagOutputPath = path.join(tempDir, 'unknown-flag-output.md');
const unknownFlagResult = spawnSync(
  process.execPath,
  [wrapperScript, '--policy-reprot', inputPath, unknownFlagOutputPath],
  {
    cwd: repoRoot,
    encoding: 'utf8',
  },
);

assert.equal(unknownFlagResult.status, 2, 'unknown flags must fail closed before conversion');
assert.equal(fs.existsSync(unknownFlagOutputPath), false, 'unknown flag failure must not write output');

const unknownFlagPayload = JSON.parse(unknownFlagResult.stderr);
assert.equal(unknownFlagPayload.ok, false);
assert.equal(unknownFlagPayload.mode, 'markitdown-convert');
assert.equal(unknownFlagPayload.error, 'invalid-arguments');
assert.match(unknownFlagPayload.message, /Unknown flag: --policy-reprot/);
assert.deepEqual(unknownFlagPayload.unknownFlags, ['--policy-reprot']);
assert.deepEqual(unknownFlagPayload.allowedFlags, ['--policy-report', '--dry-run']);
assert.match(unknownFlagPayload.guidance, /before input reads/i);

const extraOutputPath = path.join(tempDir, 'extra-output.md');
const extraArgResult = spawnSync(
  process.execPath,
  [wrapperScript, '--policy-report', inputPath, extraOutputPath, 'unexpected-extra-path'],
  {
    cwd: repoRoot,
    encoding: 'utf8',
  },
);

assert.equal(extraArgResult.status, 2, 'extra positional args must fail closed before conversion');
assert.equal(fs.existsSync(extraOutputPath), false, 'extra positional failure must not write output');

const extraArgPayload = JSON.parse(extraArgResult.stderr);
assert.equal(extraArgPayload.ok, false);
assert.equal(extraArgPayload.mode, 'markitdown-convert');
assert.equal(extraArgPayload.error, 'invalid-arguments');
assert.match(extraArgPayload.message, /Expected at most one input path/);
assert.deepEqual(extraArgPayload.unexpectedArgs, ['unexpected-extra-path']);
assert.equal(extraArgPayload.positionalArgumentLimit, 2);
assert.match(extraArgPayload.guidance, /before input reads/i);

const missingInputOutputPath = path.join(tempDir, 'missing-input-output.md');
const missingInputResult = spawnSync(
  process.execPath,
  [wrapperScript, path.join(tempDir, 'missing-input.txt'), missingInputOutputPath],
  {
    cwd: repoRoot,
    encoding: 'utf8',
  },
);

assert.equal(missingInputResult.status, 2, 'missing input must fail closed before conversion');
assert.equal(fs.existsSync(missingInputOutputPath), false, 'missing input failure must not write output');

const missingInputPayload = JSON.parse(missingInputResult.stderr);
assert.equal(missingInputPayload.ok, false);
assert.equal(missingInputPayload.mode, 'markitdown-convert');
assert.equal(missingInputPayload.error, 'input-not-found');
assert.match(missingInputPayload.message, /Input not found/);
assert.equal(missingInputPayload.providedPath, path.join(tempDir, 'missing-input.txt'));
assert.equal(missingInputPayload.resolvedPath, path.join(tempDir, 'missing-input.txt'));
assert.match(missingInputPayload.guidance, /before CLI availability checks/i);

const unavailableCliOutputPath = path.join(tempDir, 'unavailable-cli-output.md');
const unavailableCliResult = spawnSync(process.execPath, [wrapperScript, inputPath, unavailableCliOutputPath], {
  cwd: repoRoot,
  encoding: 'utf8',
  env: {
    ...process.env,
    PATH: '',
  },
});

assert.equal(unavailableCliResult.status, 2, 'missing markitdown CLI must fail closed');
assert.equal(fs.existsSync(unavailableCliOutputPath), false, 'missing CLI failure must not write output');

const unavailableCliPayload = JSON.parse(unavailableCliResult.stderr);
assert.equal(unavailableCliPayload.ok, false);
assert.equal(unavailableCliPayload.mode, 'markitdown-convert');
assert.equal(unavailableCliPayload.error, 'dependency-unavailable');
assert.equal(unavailableCliPayload.command, 'markitdown');
assert.match(unavailableCliPayload.installHint, /pipx install markitdown/);
assert.match(unavailableCliPayload.guidance, /before conversion or output writes/i);

const doc = fs.readFileSync(baselineDoc, 'utf8');
assert.match(doc, /--policy-report/);
assert.match(doc, /current process privileges/);
assert.match(doc, /unknown flags/);
assert.match(doc, /extra positional arguments/);
assert.match(doc, /missing input paths/);
assert.match(doc, /dependency-unavailable/);

console.log(
  JSON.stringify(
    {
      ok: true,
      markitdownPolicyReport: {
        mode: payload.mode,
        executesConversion: payload.pathPolicy.executesConversion,
        wouldWrite: payload.output.wouldWrite,
        unknownFlagRejected: unknownFlagPayload.unknownFlags[0],
        extraArgRejected: extraArgPayload.unexpectedArgs[0],
        missingInputRejected: true,
        missingCliRejected: true,
      },
    },
    null,
    2,
  ),
);
