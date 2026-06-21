import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const watchScript = path.join(repoRoot, 'scripts', 'growth-regression-watch-status.mjs');

function runWatchStatus(args = []) {
  const result = spawnSync(process.execPath, [watchScript, ...args], {
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

const result = runWatchStatus();
assert.equal(result.status, 0, `growth-regression-watch-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-regression-watch-status');
assert.equal(payload.posture, 'local-read-only-post-acceptance-regression-watch-contract');
assert.equal(payload.schemaVersion, 'growth-regression-watch-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchDocumented, true);
assert.equal(payload.sourceSummary.engineStatusImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterImplemented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopImplemented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryImplemented, true);
assert.equal(payload.sourceSummary.regressionWatchImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsRegressionWatch, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsRegressionWatch, true);
assert.equal(payload.sourceSummary.ledgerMentionsRegressionWatch, true);
assert.equal(payload.sourceSummary.verificationIncludesRegressionWatch, true);
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
assert.equal(payload.sourceSummary.negativeEvidenceDocumented, true);
assert.equal(payload.sourceSummary.aggregateVerificationDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewDocumented, true);
assert.equal(payload.sourceSummary.remediationBlocked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.watchSignalTypes.includes('accepted-record-drift'));
assert.ok(payload.vocabulary.watchSignalTypes.includes('negative-evidence-reappeared'));
assert.ok(payload.vocabulary.watchSignalTypes.includes('aggregate-verification-regression'));
assert.ok(payload.vocabulary.watchSignalTypes.includes('memory-boundary-regression'));
assert.ok(payload.vocabulary.watchStates.includes('regression-confirmed'));
assert.ok(payload.vocabulary.watchStates.includes('rollback-review-recommended'));
assert.ok(payload.vocabulary.watchStates.includes('false-positive'));
assert.ok(payload.vocabulary.watchSeverities.includes('blocking'));
assert.ok(payload.vocabulary.watchSeverities.includes('rollback-review-needed'));
assert.ok(payload.vocabulary.watchEvidenceTypes.includes('accepted-registry-record'));
assert.ok(payload.vocabulary.watchEvidenceTypes.includes('current-smoke-output'));
assert.ok(payload.vocabulary.watchEvidenceTypes.includes('current-aggregate-verification'));
assert.ok(payload.vocabulary.watchDecisionTypes.includes('recommend-rollback-review'));
assert.ok(payload.vocabulary.watchDecisionTypes.includes('hold-baseline'));

assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('registryId'));
assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('acceptedRecordRef'));
assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('beforeEvidenceRefs'));
assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('afterEvidenceRefs'));
assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('currentEvidenceRefs'));
assert.ok(payload.watchSchema.acceptedRecordWatch.required.includes('rollbackReviewAllowed'));
assert.ok(payload.watchSchema.observedRegression.required.includes('expectedSignal'));
assert.ok(payload.watchSchema.observedRegression.required.includes('observedSignal'));
assert.ok(payload.watchSchema.observedRegression.required.includes('allowedNextAction'));
assert.ok(payload.watchSchema.watchDecision.required.includes('decisionType'));
assert.ok(payload.watchSchema.watchIndex.required.includes('severityCounts'));
assert.ok(payload.watchRules.some((rule) => rule.id === 'watch-requires-accepted-record'));
assert.ok(payload.watchRules.some((rule) => rule.id === 'before-after-current-comparison-required'));
assert.ok(payload.watchRules.some((rule) => rule.id === 'blocking-signal-recommends-review-only'));
assert.ok(payload.watchRules.some((rule) => rule.id === 'watch-does-not-authorize-action'));

assert.equal(payload.watchState.realWatchFileAdopted, false);
assert.equal(payload.watchState.discoveredWatchRecords, 0);
assert.equal(payload.watchState.watchMutationAllowed, false);
assert.equal(payload.watchState.acceptedRecordMutationAllowed, false);
assert.equal(payload.watchState.rollbackReviewTriggered, false);
assert.equal(payload.watchState.remediationExecutionAllowed, false);
assert.equal(payload.watchState.currentStatus, 'contract-only-no-active-regression-watch-records');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.watchRecordTypes, 4);
assert.equal(payload.readiness.acceptedRecordRequired, true);
assert.equal(payload.readiness.beforeAfterCurrentComparisonRequired, true);
assert.equal(payload.readiness.blockingSignalReviewOnly, true);
assert.equal(payload.readiness.rollbackReviewApplicationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForRollbackReviewStatus, true);
assert.equal(payload.readiness.rollbackReviewStatusImplemented, true);
assert.equal(payload.readiness.readyForRemediationPlanStatus, true);
assert.equal(payload.readiness.remediationPlanStatusImplemented, true);
assert.equal(payload.readiness.readyForRemediationApprovalStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-request-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotMutateAcceptedRecords, true);
assert.equal(payload.safetyBoundary.doesNotTriggerRollbackReview, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRemediation, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runWatchStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-regression-watch-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Tenth Implemented Slice: `growth-regression-watch-status`/);
assert.match(plan, /node scripts\/growth-regression-watch-status\.mjs/);
assert.match(plan, /post-acceptance regression watch signals/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-regression-watch-status\.mjs/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-regression-watch-status\.mjs/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-regression-watch-status-readonly-post-m7-817/);
assert.match(todo, /growth-rollback-review-status-readonly-post-m7-818/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRegressionWatchStatus: {
        command: 'node scripts/growth-regression-watch-status.mjs',
        schemaVersion: payload.schemaVersion,
        watchRecordTypes: payload.readiness.watchRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
