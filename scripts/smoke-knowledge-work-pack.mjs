import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const smokeChecks = [
  {
    id: 'runtime-prd-pass',
    script: 'scripts/smoke-runtime-slice-07.mjs',
    purpose: 'Knowledge-work runtime PRD happy path keeps pack routing and reviewer pass pinned',
  },
  {
    id: 'runtime-checklist-pass',
    script: 'scripts/smoke-runtime-slice-08.mjs',
    purpose: 'Knowledge-work runtime checklist path keeps template-specific deliverable output pinned',
  },
  {
    id: 'runtime-review-negative',
    script: 'scripts/smoke-runtime-slice-09.mjs',
    purpose: 'Knowledge-work runtime reviewer keeps changes_requested and fail paths pinned',
  },
  {
    id: 'provider-live-bundle',
    script: 'scripts/smoke-provider-knowledge-work.mjs',
    purpose: 'Knowledge-work live-provider deliverable matrix stays green as one aggregate gate',
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
  mode: 'synthetic-knowledge-work-pack',
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
