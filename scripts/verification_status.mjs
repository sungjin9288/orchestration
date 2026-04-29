import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

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

const requiredResults = executeChecks(requiredChecks, true);
const informationalResults = executeChecks(informationalChecks, false);
const allResults = [...requiredResults, ...informationalResults];

const failedRequiredChecks = requiredResults.filter((check) => !check.ok).length;
const passedRequiredChecks = requiredResults.length - failedRequiredChecks;
const failedInformationalChecks = informationalResults.filter((check) => !check.ok).length;
const passedInformationalChecks = informationalResults.length - failedInformationalChecks;

const report = {
  ok: failedRequiredChecks === 0,
  mode: 'synthetic-verification-status',
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

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
