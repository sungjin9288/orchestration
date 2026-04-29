import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const triageScriptPath = path.join(repoRoot, 'scripts', 'v1-kickoff-evidence-triage.mjs');
const verificationStatusPath = path.join(repoRoot, 'scripts', 'verification_status.mjs');
const runbookPath = path.join(repoRoot, 'docs', '15_v1-start-runbook.md');
const handoffPath = path.join(repoRoot, 'docs', '04_codex-handoff-master-brief.md');

const triageScript = fs.readFileSync(triageScriptPath, 'utf8');
const verificationStatus = fs.readFileSync(verificationStatusPath, 'utf8');
const runbook = fs.readFileSync(runbookPath, 'utf8');
const handoff = fs.readFileSync(handoffPath, 'utf8');

assert.match(triageScript, /mode: 'v1-kickoff-evidence-triage'/);
assert.match(triageScript, /scripts\/v1-kickoff-status\.mjs/);
assert.match(triageScript, /V1_KICKOFF_TRIAGE_SKIP_KICKOFF_STATUS/);
assert.match(triageScript, /Clean Published Kickoff Evidence/);
assert.match(triageScript, /V1_KICKOFF_ALLOW_DIRTY/);
assert.match(triageScript, /nextImplementationRequiresConcreteIssue: true/);
assert.match(triageScript, /do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue/);
assert.match(triageScript, /doesNotExecuteDogfood: true/);
assert.match(triageScript, /doesNotMutateRuntime: true/);
assert.match(triageScript, /doesNotPush: true/);

const result = spawnSync(process.execPath, [triageScriptPath], {
  cwd: repoRoot,
  encoding: 'utf8',
  env: {
    ...process.env,
    V1_KICKOFF_TRIAGE_SKIP_KICKOFF_STATUS: '1',
  },
});
const report = JSON.parse(result.stdout);

assert.equal(result.status, 0);
assert.equal(report.ok, true);
assert.equal(report.mode, 'v1-kickoff-evidence-triage');
assert.equal(report.kickoffStatus.statusOk, true);
assert.equal(report.kickoffStatus.skippedForAggregate, true);
assert.equal(report.kickoffStatus.verificationOk, null);
assert.equal(typeof report.kickoffStatus.mainPublished, 'boolean');
assert.equal(report.evidence.cleanPublishedProofRecorded, true);
assert.equal(report.evidence.outputFilesPresent, true);
assert.deepEqual(report.implementationGate.detectedConcreteIssues, []);
assert.equal(report.implementationGate.nextImplementationRequiresConcreteIssue, true);
assert.equal(typeof report.implementationGate.readyForIssueDrivenSlice, 'boolean');
assert.equal(
  report.implementationGate.recommendation,
  'do-not-open-new-implementation-without-a-concrete-regression-or-usability-issue',
);
assert.equal(report.safetyBoundary.readOnly, true);
assert.equal(report.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(report.safetyBoundary.doesNotPush, true);

assert.match(verificationStatus, /v1-kickoff-evidence-triage/);
assert.match(verificationStatus, /scripts\/smoke-v1-kickoff-evidence-triage\.mjs/);
assert.match(runbook, /node scripts\/v1-kickoff-evidence-triage\.mjs/);
assert.match(runbook, /do not open a new implementation slice without a concrete regression or usability issue/);
assert.match(handoff, /node scripts\/v1-kickoff-evidence-triage\.mjs/);

console.log(
  JSON.stringify(
    {
      ok: true,
      v1KickoffEvidenceTriage: {
        readOnlyStatus: 'scripts/v1-kickoff-evidence-triage.mjs',
        recommendation: report.implementationGate.recommendation,
        verifiedEvidenceFiles: report.evidence.artifactFiles.length + report.evidence.runFiles.length,
      },
    },
    null,
    2,
  ),
);
