import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const smokeChecks = [
  {
    id: 'mission-bootstrap-worktree-closeout',
    script: 'scripts/smoke-qa-slice-01.mjs',
    purpose:
      'Mission bootstrap landing, Taskboard handoff, linked-worktree relation state, and close-out readiness fixture stay green as one optional browser smoke',
  },
  {
    id: 'mission-provider-opt-in',
    script: 'scripts/smoke-qa-slice-02.mjs',
    purpose:
      'Mission-first provider opt-in browser summary and fail-closed planner path stay aligned with the current shell',
  },
  {
    id: 'planner-architect-task-breaker-browser',
    script: 'scripts/smoke-qa-slice-04.mjs',
    purpose:
      'Planner, architect, and task-breaker synthetic browser QA keeps live-provider summary shallow and downstream role state grounded through API assertions',
  },
  {
    id: 'builder-preflight-browser',
    script: 'scripts/smoke-qa-slice-05.mjs',
    purpose:
      'Builder preflight synthetic browser QA keeps launch, artifacts landing, and selected preflight visibility pinned',
  },
  {
    id: 'builder-live-mutation-browser',
    script: 'scripts/smoke-qa-slice-06.mjs',
    purpose:
      'Builder live-mutation synthetic browser QA keeps approval, run launch, logs landing, and change-summary visibility pinned',
  },
  {
    id: 'reviewer-browser',
    script: 'scripts/smoke-qa-slice-07.mjs',
    purpose:
      'Reviewer synthetic browser QA keeps review launch, logs selection, and review artifact visibility pinned',
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

const checkResults = smokeChecks.map((check) => {
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

const passedChecks = checkResults.filter((check) => check.ok).length;
const failedChecks = checkResults.length - passedChecks;

const report = {
  ok: failedChecks === 0,
  mode: 'synthetic-optional-browser-qa',
  counts: {
    totalChecks: checkResults.length,
    passedChecks,
    failedChecks,
  },
  checks: checkResults.map((check) => ({
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: check.ok,
    status: check.status,
  })),
  failures: checkResults
    .filter((check) => !check.ok)
    .map((check) => ({
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
