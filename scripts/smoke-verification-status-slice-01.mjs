import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const verificationStatusScript = path.join(repoRoot, 'scripts/verification_status.mjs');

function createFixtureChecks(onDemandScriptPath) {
  return {
    required: [
      {
        id: 'required-fixture',
        script: path.join(repoRoot, 'scripts/verification-status-fixture-pass.mjs'),
        purpose: 'Required verification fixture stays green for verification-status smoke.',
      },
    ],
    informational: [
      {
        id: 'ui-qa-status',
        script: path.join(repoRoot, 'scripts/verification-status-fixture-ui-qa-pass.mjs'),
        purpose: 'Structured UI QA fixture stays green for verification-status smoke.',
        evaluation: {
          kind: 'json-field',
          okField: 'allChecksOk',
          summaryFields: ['ok', 'allChecksOk', 'counts', 'lanes', 'browserAutomation'],
        },
      },
      {
        id: 'openspace-wiring',
        script: path.join(repoRoot, 'scripts/verification-status-fixture-pass.mjs'),
        purpose: 'Informational pass fixture stays green for verification-status smoke.',
      },
    ],
    onDemand: [
      {
        id: 'optional-browser-qa',
        script: onDemandScriptPath,
        purpose: 'On-demand browser fixture for verification-status smoke.',
      },
    ],
  };
}

function runScenario(onDemandFixtureScriptName) {
  const checks = createFixtureChecks(path.join(repoRoot, 'scripts', onDemandFixtureScriptName));
  const result = spawnSync(process.execPath, [verificationStatusScript, '--include-on-demand'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      VERIFICATION_STATUS_REQUIRED_CHECKS_JSON: JSON.stringify(checks.required),
      VERIFICATION_STATUS_INFORMATIONAL_CHECKS_JSON: JSON.stringify(checks.informational),
      VERIFICATION_STATUS_ON_DEMAND_CHECKS_JSON: JSON.stringify(checks.onDemand),
    },
  });

  assert.equal(result.status, 0, `verification_status should keep exit code 0 for on-demand-only scenarios: ${result.stderr}`);
  const report = JSON.parse(result.stdout);
  return report;
}

const skipReport = runScenario('verification-status-fixture-on-demand-eperm.mjs');
assert.equal(skipReport.ok, true);
assert.equal(skipReport.allChecksOk, true);
assert.equal(skipReport.counts.executedOnDemandChecks, 1);
assert.equal(skipReport.counts.skippedOnDemandChecks, 1);
assert.equal(skipReport.counts.failedOnDemandChecks, 0);
assert.equal(skipReport.lanes.onDemand.requested, true);
assert.equal(skipReport.lanes.onDemand.skippedChecks, 1);
assert.equal(skipReport.onDemand[0].executed, true);
assert.equal(skipReport.onDemand[0].skipped, true);
assert.equal(skipReport.onDemand[0].ok, true);
assert.match(skipReport.onDemand[0].skipReason, /Localhost browser harness binding is not permitted/);
assert.equal(skipReport.failures.length, 0);

const failReport = runScenario('verification-status-fixture-on-demand-fail.mjs');
assert.equal(failReport.ok, true);
assert.equal(failReport.allChecksOk, false);
assert.equal(failReport.counts.executedOnDemandChecks, 1);
assert.equal(failReport.counts.skippedOnDemandChecks, 0);
assert.equal(failReport.counts.failedOnDemandChecks, 1);
assert.equal(failReport.lanes.onDemand.failedChecks, 1);
assert.equal(failReport.onDemand[0].executed, true);
assert.equal(failReport.onDemand[0].skipped, false);
assert.equal(failReport.onDemand[0].ok, false);
assert.equal(failReport.failures.length, 1);
assert.equal(failReport.failures[0].id, 'optional-browser-qa');
assert.match(
  `${failReport.failures[0].stdout}\n${failReport.failures[0].stderr}`,
  /Synthetic on-demand browser regression sentinel/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      mode: 'synthetic-verification-status-slice-01',
      counts: {
        scenarios: 2,
      },
      scenarios: [
        {
          name: 'on-demand-skip',
          skippedOnDemandChecks: skipReport.counts.skippedOnDemandChecks,
          failedOnDemandChecks: skipReport.counts.failedOnDemandChecks,
          allChecksOk: skipReport.allChecksOk,
        },
        {
          name: 'on-demand-hard-fail',
          skippedOnDemandChecks: failReport.counts.skippedOnDemandChecks,
          failedOnDemandChecks: failReport.counts.failedOnDemandChecks,
          allChecksOk: failReport.allChecksOk,
        },
      ],
    },
    null,
    2,
  ),
);
