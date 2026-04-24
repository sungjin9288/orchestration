#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const inputPath = args[0];
const outputPath = args[1];

if (!inputPath) {
  console.error('Usage: markitdown-convert.mjs <input-file> [output-file]');
  process.exit(2);
}

const resolvedInput = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedInput)) {
  console.error(`Input not found: ${resolvedInput}`);
  process.exit(2);
}

const versionCheck = spawnSync('markitdown', ['--version'], {
  stdio: 'ignore',
});

if (versionCheck.status !== 0) {
  console.error('markitdown CLI is not available in PATH.');
  console.error('Install: pipx install markitdown (or pip install markitdown) and retry.');
  process.exit(2);
}

const outputArgs = [resolvedInput];
if (outputPath) {
  outputArgs.push('-o', path.resolve(process.cwd(), outputPath));
}

const result = spawnSync('markitdown', outputArgs, {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
