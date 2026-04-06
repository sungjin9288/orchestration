import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const defaultSmokeChecks = [
  {
    id: 'ui-qa-status',
    script: 'scripts/ui_qa_status.mjs',
    purpose: 'Frozen-shell UI QA status stays green as a repo-native status entrypoint.',
    evaluation: {
      kind: 'json-field',
      okField: 'allChecksOk',
      summaryFields: ['ok', 'allChecksOk', 'counts', 'lanes'],
    },
  },
  {
    id: 'verification-status',
    script: 'scripts/verification_status.mjs',
    purpose: 'Top-level verification status stays green on the default fast lane.',
    args: [],
    evaluation: {
      kind: 'json-field',
      okField: 'allChecksOk',
      summaryFields: ['ok', 'allChecksOk', 'counts', 'lanes'],
    },
  },
  {
    id: 'verification-status-skip-smoke',
    script: 'scripts/smoke-verification-status-slice-01.mjs',
    purpose: 'Verification-status deterministic smoke keeps on-demand skip and hard-fail semantics pinned.',
  },
];

function parseArgs(argv) {
  return {
    includeOnDemand: argv.includes('--include-on-demand'),
  };
}

function getSmokeChecks(options) {
  return defaultSmokeChecks.map((check) => {
    if (check.id !== 'verification-status') {
      return check;
    }

    return {
      ...check,
      purpose: options.includeOnDemand
        ? 'Top-level verification status stays green when the aggregate bundle opts into the longer on-demand browser lane.'
        : check.purpose,
      args: options.includeOnDemand ? ['--include-on-demand'] : [],
    };
  });
}

function runNodeScript(relativeScriptPath, args = []) {
  const absoluteScriptPath = path.join(repoRoot, relativeScriptPath);
  const result = spawnSync(process.execPath, [absoluteScriptPath, ...args], {
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

function getValueAtPath(payload, dottedPath) {
  return dottedPath.split('.').reduce((current, segment) => {
    if (current === null || current === undefined) {
      return undefined;
    }
    return current[segment];
  }, payload);
}

function pickSummaryFields(payload, fieldPaths) {
  return fieldPaths.reduce((summary, fieldPath) => {
    summary[fieldPath] = getValueAtPath(payload, fieldPath);
    return summary;
  }, {});
}

const options = parseArgs(process.argv.slice(2));
const smokeChecks = getSmokeChecks(options);

const checkResults = smokeChecks.map((check) => {
  const result = runNodeScript(check.script, check.args || []);
  let ok = result.ok;
  let summary = null;
  let parseError = null;

  if (check.evaluation?.kind === 'json-field') {
    try {
      const payload = JSON.parse(result.stdout);
      ok = Boolean(getValueAtPath(payload, check.evaluation.okField));
      summary = pickSummaryFields(payload, check.evaluation.summaryFields || []);
    } catch (error) {
      ok = false;
      parseError = error instanceof Error ? error.message : String(error);
    }
  }

  return {
    id: check.id,
    script: check.script,
    args: check.args || [],
    purpose: check.purpose,
    ok,
    status: result.status,
    signal: result.signal,
    stdout: result.stdout,
    stderr: result.stderr,
    summary,
    parseError,
  };
});

const passedChecks = checkResults.filter((check) => check.ok).length;
const failedChecks = checkResults.length - passedChecks;

const report = {
  ok: failedChecks === 0,
  mode: 'synthetic-status-entrypoints',
  options,
  counts: {
    totalChecks: checkResults.length,
    passedChecks,
    failedChecks,
  },
  checks: checkResults.map((check) => ({
    id: check.id,
    script: check.script,
    args: check.args || [],
    purpose: check.purpose,
    ok: check.ok,
    status: check.status,
    summary: check.summary,
    parseError: check.parseError,
  })),
  failures: checkResults
    .filter((check) => !check.ok)
    .map((check) => ({
      id: check.id,
      script: check.script,
      args: check.args || [],
      status: check.status,
      signal: check.signal,
      summary: check.summary,
      parseError: check.parseError,
      stdout: check.stdout,
      stderr: check.stderr,
    })),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
