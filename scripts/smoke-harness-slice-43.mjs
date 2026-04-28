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

const doc = fs.readFileSync(baselineDoc, 'utf8');
assert.match(doc, /--policy-report/);
assert.match(doc, /current process privileges/);

console.log(
  JSON.stringify(
    {
      ok: true,
      markitdownPolicyReport: {
        mode: payload.mode,
        executesConversion: payload.pathPolicy.executesConversion,
        wouldWrite: payload.output.wouldWrite,
      },
    },
    null,
    2,
  ),
);
