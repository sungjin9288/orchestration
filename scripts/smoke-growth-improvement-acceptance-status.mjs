import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const acceptanceScript = path.join(repoRoot, 'scripts', 'growth-improvement-acceptance-status.mjs');

function runAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [acceptanceScript, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';
  let payload = null;

  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    payload,
    status: result.status,
    stderr,
    stdout,
  };
}

const result = runAcceptanceStatus();
assert.equal(result.status, 0, `growth-improvement-acceptance-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-improvement-acceptance-status');
assert.equal(payload.posture, 'local-read-only-improvement-acceptance-contract');
assert.equal(payload.schemaVersion, 'growth-improvement-acceptance-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.improvementAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.engineStatusImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterImplemented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsImprovementAcceptance, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsImprovementAcceptance, true);
assert.equal(payload.sourceSummary.ledgerMentionsImprovementAcceptance, true);
assert.equal(payload.sourceSummary.verificationIncludesImprovementAcceptance, true);
assert.equal(payload.sourceSummary.nextAcceptedRegistryDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusScriptPresent, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusImplemented, true);
assert.equal(payload.sourceSummary.regressionWatchNextDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusScriptPresent, true);
assert.equal(payload.sourceSummary.regressionWatchStatusDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusImplemented, true);
assert.equal(payload.sourceSummary.rollbackReviewNextDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusScriptPresent, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusScriptPresent, true);
assert.equal(payload.sourceSummary.remediationPlanStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanNextDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.sourceSummary.beforeAfterEvidenceDocumented, true);
assert.equal(payload.sourceSummary.blockingRegressionDocumented, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.acceptanceStates.includes('implemented-pending-verification'));
assert.ok(payload.vocabulary.acceptanceStates.includes('accepted'));
assert.ok(payload.vocabulary.acceptanceStates.includes('rejected'));
assert.ok(payload.vocabulary.evidenceTypes.includes('before-evidence'));
assert.ok(payload.vocabulary.evidenceTypes.includes('after-evidence'));
assert.ok(payload.vocabulary.evidenceTypes.includes('negative-evidence'));
assert.ok(payload.vocabulary.evidenceTypes.includes('aggregate-verification'));
assert.ok(payload.vocabulary.regressionClasses.includes('runtime-semantics'));
assert.ok(payload.vocabulary.regressionClasses.includes('gateway-authority'));
assert.ok(payload.vocabulary.regressionClasses.includes('documentation-drift'));
assert.ok(payload.vocabulary.decisionTypes.includes('request-more-evidence'));
assert.ok(payload.vocabulary.decisionTypes.includes('hold-baseline'));

assert.ok(payload.acceptanceSchema.acceptanceRecord.required.includes('beforeEvidenceRefs'));
assert.ok(payload.acceptanceSchema.acceptanceRecord.required.includes('afterEvidenceRefs'));
assert.ok(payload.acceptanceSchema.acceptanceRecord.required.includes('regressionChecks'));
assert.ok(payload.acceptanceSchema.acceptanceRecord.required.includes('acceptanceAllowed'));
assert.ok(payload.acceptanceSchema.regressionCheck.required.includes('regressionClass'));
assert.ok(payload.acceptanceSchema.regressionCheck.required.includes('blocking'));
assert.ok(payload.acceptanceSchema.evidenceComparison.required.includes('negativeEvidenceRefs'));
assert.ok(payload.acceptanceSchema.decisionRecord.required.includes('allowedNextAction'));
assert.ok(payload.acceptanceRules.some((rule) => rule.id === 'before-after-evidence-required'));
assert.ok(payload.acceptanceRules.some((rule) => rule.id === 'aggregate-verification-required'));
assert.ok(payload.acceptanceRules.some((rule) => rule.id === 'blocking-regression-stops-acceptance'));
assert.ok(payload.acceptanceRules.some((rule) => rule.id === 'acceptance-does-not-self-apply'));

assert.equal(payload.acceptanceChecklist.beforeEvidencePresent, false);
assert.equal(payload.acceptanceChecklist.afterEvidencePresent, false);
assert.equal(payload.acceptanceChecklist.verificationPassed, false);
assert.equal(payload.acceptanceState.realAcceptanceStoreAdopted, false);
assert.equal(payload.acceptanceState.discoveredAcceptanceRecords, 0);
assert.equal(payload.acceptanceState.acceptanceMutationAllowed, false);
assert.equal(payload.acceptanceState.improvementAdoptionAllowed, false);
assert.equal(payload.acceptanceState.currentStatus, 'contract-only-no-active-acceptance-records');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.acceptanceRecordTypes, 4);
assert.equal(payload.readiness.beforeAfterComparisonRequired, true);
assert.equal(payload.readiness.blockingRegressionStopsAcceptance, true);
assert.equal(payload.readiness.reviewAndApprovalRequired, true);
assert.equal(payload.readiness.acceptanceApplicationAllowed, false);
assert.equal(payload.readiness.acceptedImprovementRegistryStatusImplemented, true);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForAcceptedImprovementRegistry, true);
assert.equal(payload.readiness.readyForRegressionWatchStatus, true);
assert.equal(payload.readiness.regressionWatchStatusImplemented, true);
assert.equal(payload.readiness.readyForRollbackReviewStatus, true);
assert.equal(payload.readiness.rollbackReviewStatusImplemented, true);
assert.equal(payload.readiness.readyForRemediationPlanStatus, true);
assert.equal(payload.readiness.remediationPlanStatusImplemented, true);
assert.equal(payload.readiness.readyForRemediationApprovalStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotAcceptImprovements, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-improvement-acceptance-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Eighth Implemented Slice: `growth-improvement-acceptance-status`/);
assert.match(plan, /node scripts\/growth-improvement-acceptance-status\.mjs/);
assert.match(plan, /before\/after evidence/);
assert.match(plan, /blocking regression/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-improvement-acceptance-status\.mjs/);
assert.match(harnessBaseline, /growth-accepted-improvement-registry-status/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-improvement-acceptance-status\.mjs/);
assert.match(completionReadiness, /growth-accepted-improvement-registry-status/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-improvement-acceptance-status-readonly-post-m7-815/);
assert.match(todo, /growth-accepted-improvement-registry-status-readonly-post-m7-816/);
assert.match(todo, /growth-regression-watch-status-readonly-post-m7-817/);
assert.match(todo, /growth-rollback-review-status-readonly-post-m7-818/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthImprovementAcceptanceStatus: {
        command: 'node scripts/growth-improvement-acceptance-status.mjs',
        schemaVersion: payload.schemaVersion,
        acceptanceRecordTypes: payload.readiness.acceptanceRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
