#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const positionalArgs = args.filter((arg) => !arg.startsWith('--'));
const inputPath = positionalArgs[0];
const outputPath = positionalArgs[1];
const policyReportMode = flags.has('--policy-report') || flags.has('--dry-run');

if (!inputPath) {
  console.error('Usage: markitdown-convert.mjs [--policy-report|--dry-run] <input-file> [output-file]');
  process.exit(2);
}

const resolvedInput = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedInput)) {
  console.error(`Input not found: ${resolvedInput}`);
  process.exit(2);
}

const versionCheck = spawnSync('markitdown', ['--version'], {
  encoding: 'utf8',
});

const markitdownAvailable = versionCheck.status === 0;
const resolvedOutput = outputPath ? path.resolve(process.cwd(), outputPath) : null;
const pathPolicy = {
  executesConversion: !policyReportMode,
  readsWithCurrentProcessPrivileges: true,
  writesWithCurrentProcessPrivileges: Boolean(resolvedOutput) && !policyReportMode,
  shellHooksInstalled: false,
  runtimeMutation: false,
  guidance:
    'Review untrusted documents before conversion. The markitdown CLI reads input files with the current process privileges.',
};

if (policyReportMode) {
  console.log(
    JSON.stringify(
      {
        ok: true,
        mode: 'markitdown-policy-report',
        input: {
          providedPath: inputPath,
          resolvedPath: resolvedInput,
          exists: true,
          sizeBytes: fs.statSync(resolvedInput).size,
        },
        output: {
          providedPath: outputPath ?? null,
          resolvedPath: resolvedOutput,
          wouldWrite: Boolean(resolvedOutput),
        },
        markitdown: {
          available: markitdownAvailable,
          status: versionCheck.status,
          version: versionCheck.stdout?.trim() || null,
        },
        pathPolicy,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

if (!markitdownAvailable) {
  console.error('markitdown CLI is not available in PATH.');
  console.error('Install: pipx install markitdown (or pip install markitdown) and retry.');
  process.exit(2);
}

const outputArgs = [resolvedInput];
if (resolvedOutput) {
  outputArgs.push('-o', resolvedOutput);
}

const result = spawnSync('markitdown', outputArgs, {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
