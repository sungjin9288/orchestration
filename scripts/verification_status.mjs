import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const defaultRequiredChecks = [
  {
    id: 'knowledge-work-pack',
    script: 'scripts/smoke-knowledge-work-pack.mjs',
    purpose: 'Knowledge-work runtime and live-provider pack gate stays green as one synthetic verification bundle',
  },
];

const defaultInformationalChecks = [
  {
    id: 'ui-qa-status',
    script: 'scripts/ui_qa_status.mjs',
    purpose:
      'Frozen shell UI QA status stays visible from the top-level verification surface without mixing the longer browser matrix into the blocking lane',
    evaluation: {
      kind: 'json-field',
      okField: 'allChecksOk',
      summaryFields: ['ok', 'allChecksOk', 'counts', 'lanes', 'browserAutomation'],
    },
  },
  {
    id: 'openspace-wiring',
    script: 'scripts/smoke-openspace-slice-01.mjs',
    purpose: 'OpenSpace wiring and local skill discovery stay connected to the repo without treating host execute_task timeout as a runtime blocker',
  },
];

const defaultOnDemandChecks = [
  {
    id: 'optional-browser-qa',
    script: 'scripts/smoke-qa-browser-pack.mjs',
    purpose:
      'Optional Playwright browser matrix remains reproducible as one longer on-demand bundle after the fast top-level status stays green',
  },
];

function parseArgs(argv) {
  return {
    includeOnDemand: argv.includes('--include-on-demand'),
  };
}

function readChecksOverride(envName, fallbackChecks) {
  const raw = process.env[envName];
  if (!raw) {
    return fallbackChecks;
  }

  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${envName} must be a JSON array of check objects.`);
  }

  return parsed;
}

function runNodeScript(relativeScriptPath) {
  const absoluteScriptPath = path.isAbsolute(relativeScriptPath)
    ? relativeScriptPath
    : path.join(repoRoot, relativeScriptPath);
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

function getHostRestrictionSkipReason(check, result) {
  if (check.id !== 'optional-browser-qa') {
    return null;
  }

  const combinedOutput = `${result.stdout}\n${result.stderr}`;
  if (!combinedOutput.includes('listen EPERM: operation not permitted 127.0.0.1')) {
    return null;
  }

  return 'Localhost browser harness binding is not permitted in the current sandbox, so the on-demand browser bundle is skipped.';
}

function executeChecks(checks, blocking) {
  return checks.map((check) => {
    const result = runNodeScript(check.script);
    let ok = result.ok;
    let parsedStatus = null;
    let parseError = null;
    let summary = null;
    let skipped = false;
    let skipReason = null;

    if (check.evaluation?.kind === 'json-field') {
      try {
        parsedStatus = JSON.parse(result.stdout);
        ok = Boolean(getValueAtPath(parsedStatus, check.evaluation.okField));
        summary = pickSummaryFields(parsedStatus, check.evaluation.summaryFields || []);
      } catch (error) {
        ok = false;
        parseError = error instanceof Error ? error.message : String(error);
      }
    }

    skipReason = getHostRestrictionSkipReason(check, result);
    if (skipReason) {
      skipped = true;
      ok = true;
    }

    return {
      id: check.id,
      script: check.script,
      purpose: check.purpose,
      blocking,
      ok: result.ok,
      computedOk: ok,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout,
      stderr: result.stderr,
      parsedStatus,
      parseError,
      summary,
      skipped,
      skipReason,
    };
  });
}

const options = parseArgs(process.argv.slice(2));
const requiredChecks = readChecksOverride(
  'VERIFICATION_STATUS_REQUIRED_CHECKS_JSON',
  defaultRequiredChecks,
);
const informationalChecks = readChecksOverride(
  'VERIFICATION_STATUS_INFORMATIONAL_CHECKS_JSON',
  defaultInformationalChecks,
);
const onDemandChecks = readChecksOverride(
  'VERIFICATION_STATUS_ON_DEMAND_CHECKS_JSON',
  defaultOnDemandChecks,
);
const requiredResults = executeChecks(requiredChecks, true);
const informationalResults = executeChecks(informationalChecks, false);
const onDemandResults = options.includeOnDemand ? executeChecks(onDemandChecks, false) : [];
const executedResults = [...requiredResults, ...informationalResults, ...onDemandResults];

const failedRequiredChecks = requiredResults.filter((check) => !check.computedOk).length;
const passedRequiredChecks = requiredResults.length - failedRequiredChecks;
const failedInformationalChecks = informationalResults.filter((check) => !check.computedOk).length;
const passedInformationalChecks = informationalResults.length - failedInformationalChecks;
const skippedOnDemandChecks = onDemandResults.filter((check) => check.skipped).length;
const failedOnDemandChecks = onDemandResults.filter((check) => !check.computedOk && !check.skipped).length;
const passedOnDemandChecks = onDemandResults.filter((check) => check.computedOk && !check.skipped).length;

const report = {
  ok: failedRequiredChecks === 0,
  allChecksOk:
    failedRequiredChecks === 0 &&
    failedInformationalChecks === 0 &&
    (!options.includeOnDemand || failedOnDemandChecks === 0),
  mode: 'synthetic-verification-status',
  options,
  counts: {
    totalChecks: executedResults.length,
    requiredChecks: requiredResults.length,
    passedRequiredChecks,
    failedRequiredChecks,
    informationalChecks: informationalResults.length,
    passedInformationalChecks,
    failedInformationalChecks,
    availableOnDemandChecks: onDemandChecks.length,
    executedOnDemandChecks: onDemandResults.length,
    passedOnDemandChecks,
    failedOnDemandChecks,
    skippedOnDemandChecks,
  },
  lanes: {
    required: {
      totalChecks: requiredResults.length,
      passedChecks: passedRequiredChecks,
      failedChecks: failedRequiredChecks,
    },
    informational: {
      totalChecks: informationalResults.length,
      passedChecks: passedInformationalChecks,
      failedChecks: failedInformationalChecks,
    },
    onDemand: {
      availableChecks: onDemandChecks.length,
      executedChecks: onDemandResults.length,
      passedChecks: passedOnDemandChecks,
      failedChecks: failedOnDemandChecks,
      skippedChecks: skippedOnDemandChecks,
      requested: options.includeOnDemand,
    },
  },
  required: requiredResults.map((check) => ({
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: check.computedOk,
    status: check.status,
    summary: check.summary,
  })),
  informational: informationalResults.map((check) => ({
    id: check.id,
    script: check.script,
    purpose: check.purpose,
    ok: check.computedOk,
    status: check.status,
    summary: check.summary,
    parseError: check.parseError,
  })),
  onDemand: onDemandChecks.map((check) => {
    const executedResult = onDemandResults.find((result) => result.id === check.id);
    if (!executedResult) {
      return {
        id: check.id,
        script: check.script,
        purpose: check.purpose,
        requested: false,
        executed: false,
        ok: null,
        status: null,
        summary: null,
      };
    }

    return {
      id: executedResult.id,
      script: executedResult.script,
      purpose: executedResult.purpose,
      requested: true,
      executed: true,
      skipped: executedResult.skipped,
      ok: executedResult.computedOk,
      status: executedResult.status,
      summary: executedResult.summary,
      parseError: executedResult.parseError,
      skipReason: executedResult.skipReason,
    };
  }),
  failures: executedResults
    .filter((check) => !check.computedOk && !check.skipped)
    .map((check) => ({
      id: check.id,
      script: check.script,
      blocking: check.blocking,
      status: check.status,
      signal: check.signal,
      summary: check.summary,
      parseError: check.parseError,
      skipReason: check.skipReason,
      stdout: check.stdout,
      stderr: check.stderr,
    })),
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
