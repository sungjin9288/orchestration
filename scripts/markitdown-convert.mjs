#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const allowedFlags = new Set(['--policy-report', '--dry-run']);
const usage = 'Usage: markitdown-convert.mjs [--policy-report|--dry-run] <input-file> [output-file]';
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
const positionalArgs = args.filter((arg) => !arg.startsWith('--'));
const inputPath = positionalArgs[0];
const outputPath = positionalArgs[1];
const unexpectedPositionalArgs = positionalArgs.slice(2);
const policyReportMode = flags.has('--policy-report') || flags.has('--dry-run');

function exitMarkitdownFailure(error, message, details = {}) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        mode: 'markitdown-convert',
        error,
        message,
        usage,
        allowedFlags: [...allowedFlags],
        ...details,
      },
      null,
      2,
    ),
  );
  process.exit(2);
}

function exitInvalidArguments(message, details = {}) {
  exitMarkitdownFailure('invalid-arguments', message, {
    ...details,
    guidance:
      'Invalid arguments are rejected before input reads, CLI availability checks, conversion, or output writes.',
  });
}

if (unknownFlags.length > 0) {
  exitInvalidArguments(`Unknown flag: ${unknownFlags.join(', ')}`, {
    unknownFlags,
  });
}

if (unexpectedPositionalArgs.length > 0) {
  exitInvalidArguments('Expected at most one input path and one optional output path.', {
    unexpectedArgs: unexpectedPositionalArgs,
    positionalArgumentLimit: 2,
  });
}

if (!inputPath) {
  exitInvalidArguments('Missing required input path.');
}

const resolvedInput = path.resolve(process.cwd(), inputPath);
if (!fs.existsSync(resolvedInput)) {
  exitMarkitdownFailure('input-not-found', `Input not found: ${resolvedInput}`, {
    providedPath: inputPath,
    resolvedPath: resolvedInput,
    guidance:
      'Missing input paths are rejected before CLI availability checks, conversion, or output writes.',
  });
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
  exitMarkitdownFailure('dependency-unavailable', 'markitdown CLI is not available in PATH.', {
    command: 'markitdown',
    installHint: 'pipx install markitdown (or pip install markitdown) and retry.',
    status: versionCheck.status,
    signal: versionCheck.signal ?? null,
    guidance:
      'CLI dependency failures are reported before conversion or output writes; --policy-report remains available without executing conversion.',
  });
}

const outputArgs = [resolvedInput];
if (resolvedOutput) {
  outputArgs.push('-o', resolvedOutput);
}

const result = spawnSync('markitdown', outputArgs, {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
