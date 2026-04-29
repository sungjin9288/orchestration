import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lockRoot = path.join(repoRoot, 'var', 'locks');
const lockPath = path.join(lockRoot, 'verification_status.lock');
const lockWaitMs = 120_000;
const staleLockMs = 10 * 60_000;

const requiredChecks = [
  {
    id: 'knowledge-work-pack',
    script: 'scripts/smoke-knowledge-work-pack.mjs',
    purpose: 'Knowledge-work runtime and live-provider pack gate stays green as one synthetic verification bundle',
  },
];

const informationalChecks = [
  {
    id: 'openspace-wiring',
    script: 'scripts/smoke-openspace-slice-01.mjs',
    purpose: 'OpenSpace wiring and local skill discovery stay connected to the repo without treating host execute_task timeout as a runtime blocker',
  },
  {
    id: 'openspace-doc-status',
    script: 'scripts/smoke-openspace-slice-02.mjs',
    purpose: 'OpenSpace integration documentation keeps repo wiring acceptance separate from host credential follow-up',
  },
  {
    id: 'openspace-skill-credential-boundary',
    script: 'scripts/smoke-openspace-slice-03.mjs',
    purpose: 'OpenSpace repo-local skills keep discovery and execute_task host credential readiness separate',
  },
  {
    id: 'v1-start-runbook',
    script: 'scripts/smoke-v1-start-runbook.mjs',
    purpose: 'V1 start runbook keeps local gate, push deferral, and host-dependent lanes explicit',
  },
  {
    id: 'v1-dogfood-triage',
    script: 'scripts/smoke-v1-dogfood-triage.mjs',
    purpose: 'V1 dogfood triage evidence keeps local run results, linked-worktree mutation/review evidence, and destructive cleanup boundary explicit',
  },
  {
    id: 'v1-dogfood-runner',
    script: 'scripts/smoke-v1-dogfood-runner.mjs',
    purpose: 'V1 linked-worktree dogfood runner stays dry-run by default and requires explicit execute plus slug before mutating an isolated worktree',
  },
  {
    id: 'v1-dogfood-evidence-inventory',
    script: 'scripts/smoke-v1-dogfood-evidence-inventory.mjs',
    purpose: 'V1 dogfood retained linked-worktree evidence stays visible while destructive cleanup remains approval-gated',
  },
  {
    id: 'v1-operator-status',
    script: 'scripts/smoke-v1-operator-status.mjs',
    purpose: 'V1 local operator status keeps push, cleanup, and execute-dogfood choices explicit and approval-gated',
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

function executeChecks(checks, blocking) {
  return checks.map((check) => {
    const result = runNodeScript(check.script);
    return {
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      blocking,
      ok: result.ok,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  });
}

function sleepSync(milliseconds) {
  const buffer = new SharedArrayBuffer(4);
  const view = new Int32Array(buffer);
  Atomics.wait(view, 0, 0, milliseconds);
}

function removeLockIfStale(now) {
  try {
    const stats = fs.statSync(lockPath);
    if (now - stats.mtimeMs < staleLockMs) {
      return false;
    }
    fs.rmSync(lockPath, { recursive: true, force: true });
    return true;
  } catch (_error) {
    return false;
  }
}

function acquireVerificationLock() {
  fs.mkdirSync(lockRoot, { recursive: true });
  const startTime = Date.now();

  while (Date.now() - startTime <= lockWaitMs) {
    try {
      fs.mkdirSync(lockPath);
      fs.writeFileSync(
        path.join(lockPath, 'owner.json'),
        `${JSON.stringify(
          {
            host: os.hostname(),
            pid: process.pid,
            startedAt: new Date().toISOString(),
          },
          null,
          2,
        )}\n`,
      );
      return { acquired: true, path: lockPath };
    } catch (error) {
      if (error?.code !== 'EEXIST') {
        throw error;
      }
      removeLockIfStale(Date.now());
      sleepSync(250);
    }
  }

  throw new Error(`Timed out waiting for verification_status lock: ${lockPath}`);
}

function releaseVerificationLock(lock) {
  if (!lock?.acquired) {
    return;
  }
  fs.rmSync(lock.path, { recursive: true, force: true });
}

function buildReport() {
  const requiredResults = executeChecks(requiredChecks, true);
  const informationalResults = executeChecks(informationalChecks, false);
  const allResults = [...requiredResults, ...informationalResults];

  const failedRequiredChecks = requiredResults.filter((check) => !check.ok).length;
  const passedRequiredChecks = requiredResults.length - failedRequiredChecks;
  const failedInformationalChecks = informationalResults.filter((check) => !check.ok).length;
  const passedInformationalChecks = informationalResults.length - failedInformationalChecks;

  return {
    ok: failedRequiredChecks === 0,
    mode: 'synthetic-verification-status',
    concurrency: {
      lockPath: path.relative(repoRoot, lockPath),
      serialized: true,
    },
    counts: {
      totalChecks: allResults.length,
      requiredChecks: requiredResults.length,
      passedRequiredChecks,
      failedRequiredChecks,
      informationalChecks: informationalResults.length,
      passedInformationalChecks,
      failedInformationalChecks,
    },
    required: requiredResults.map((check) => ({
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      ok: check.ok,
      status: check.status,
    })),
    informational: informationalResults.map((check) => ({
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      ok: check.ok,
      status: check.status,
    })),
    failures: allResults
      .filter((check) => !check.ok)
      .map((check) => ({
        id: check.id,
        script: check.script,
        blocking: check.blocking,
        status: check.status,
        signal: check.signal,
        stdout: check.stdout,
        stderr: check.stderr,
      })),
  };
}

const lock = acquireVerificationLock();
let exitCode = 1;

try {
  const report = buildReport();
  exitCode = report.ok ? 0 : 1;
  console.log(JSON.stringify(report, null, 2));
} finally {
  releaseVerificationLock(lock);
}

process.exit(exitCode);
