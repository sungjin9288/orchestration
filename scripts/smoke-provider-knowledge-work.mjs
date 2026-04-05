import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const smokeChecks = [
  {
    id: 'prd-live-provider',
    script: 'scripts/smoke-provider-slice-08.mjs',
    purpose: 'PRD live provider path keeps missing-file baseline and rubric enforcement pinned',
  },
  {
    id: 'checklist-live-provider',
    script: 'scripts/smoke-provider-slice-09.mjs',
    purpose: 'Checklist live provider path keeps checklist-item and rubric enforcement pinned',
  },
  {
    id: 'decision-memo-live-provider',
    script: 'scripts/smoke-provider-slice-10.mjs',
    purpose: 'Decision-memo live provider path keeps generic required-section enforcement pinned',
  },
  {
    id: 'execution-plan-live-provider',
    script: 'scripts/smoke-provider-slice-11.mjs',
    purpose: 'Execution-plan live provider path keeps planning-section enforcement pinned',
  },
  {
    id: 'research-brief-live-provider',
    script: 'scripts/smoke-provider-slice-12.mjs',
    purpose: 'Research-brief live provider path keeps final deliverable-specific section enforcement pinned',
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
  mode: 'synthetic-provider-knowledge-work',
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
