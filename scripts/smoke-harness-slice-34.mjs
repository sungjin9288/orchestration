#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const runScript = path.join(repoRoot, 'scripts', 'harness-run.mjs');
const inputPath = path.join(repoRoot, 'docs', '13_harness-baseline.md');
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'harness-markitdown-ready-'));
const outputPath = path.join(tempDir, 'harness-baseline.md');

const result = spawnSync(process.execPath, [runScript, 'markitdown', inputPath, outputPath], {
  cwd: repoRoot,
  encoding: 'utf8',
});

assert.equal(result.status, 0, `repo-native markitdown run failed: ${result.stderr}`);
assert.equal(fs.existsSync(outputPath), true, 'markitdown output was not created');

const output = fs.readFileSync(outputPath, 'utf8');
assert.match(output, /Harness Baseline/i);

console.log(
  JSON.stringify(
    {
      ok: true,
      runScript,
      inputPath,
      outputPath,
    },
    null,
    2,
  ),
);
