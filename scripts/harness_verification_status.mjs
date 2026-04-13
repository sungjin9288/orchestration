#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const requiredChecks = [
  {
    id: 'harness-inventory-status',
    script: 'scripts/harness-status.mjs',
    purpose: 'Harness posture inventory and local availability report stays readable and executable.',
  },
  {
    id: 'harness-doc-baseline',
    script: 'scripts/smoke-harness-slice-01.mjs',
    purpose: 'Harness baseline doc and markitdown wrapper stay pinned.',
  },
  {
    id: 'harness-inventory-contract',
    script: 'scripts/smoke-harness-slice-02.mjs',
    purpose: 'Harness inventory posture contract stays pinned.',
  },
  {
    id: 'harness-policy-gate',
    script: 'scripts/smoke-harness-slice-03.mjs',
    purpose: 'Only approved-now harnesses remain executable through the repo-native gate.',
  },
  {
    id: 'harness-approved-dispatch',
    script: 'scripts/smoke-harness-slice-04.mjs',
    purpose: 'Approved harness dispatch remains self-describing and routes into wrapper usage.',
  },
  {
    id: 'harness-info-entrypoint',
    script: 'scripts/smoke-harness-slice-06.mjs',
    purpose: 'Per-harness info lookup stays available for approved and future harnesses.',
  },
  {
    id: 'harness-info-status-sync',
    script: 'scripts/smoke-harness-slice-07.mjs',
    purpose: 'Harness status and info outputs stay aligned on availability and executable truth.',
  },
];

function runNodeScript(relativeScriptPath) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  return {
    ok: result.status === 0,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

const results = requiredChecks.map((check) => {
  const result = runNodeScript(check.script);
  return {
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: result.ok,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
  };
});

const failedChecks = results.filter((check) => !check.ok);
const report = {
  ok: failedChecks.length === 0,
  mode: 'synthetic-harness-verification',
  counts: {
    totalChecks: results.length,
    passedChecks: results.length - failedChecks.length,
    failedChecks: failedChecks.length,
  },
  checks: results.map((check) => ({
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: check.ok,
    status: check.status,
  })),
  failures: failedChecks.map((check) => ({
    id: check.id,
    script: check.script,
    status: check.status,
    signal: check.signal,
    stdout: check.stdout,
    stderr: check.stderr,
  })),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
