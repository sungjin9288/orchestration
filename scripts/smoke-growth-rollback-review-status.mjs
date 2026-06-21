import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reviewScript = path.join(repoRoot, 'scripts', 'growth-rollback-review-status.mjs');

function runReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [reviewScript, ...args], {
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

const result = runReviewStatus();
assert.equal(result.status, 0, `growth-rollback-review-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-rollback-review-status');
assert.equal(payload.posture, 'local-read-only-rollback-review-contract');
assert.equal(payload.schemaVersion, 'growth-rollback-review-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.regressionWatchDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanDocumented, true);
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
assert.equal(payload.sourceSummary.rollbackReviewImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsRollbackReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsRollbackReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsRollbackReview, true);
assert.equal(payload.sourceSummary.verificationIncludesRollbackReview, true);
assert.equal(payload.sourceSummary.remediationPlanNextDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchSignalsDocumented, true);
assert.equal(payload.sourceSummary.aggregateVerificationDocumented, true);
assert.equal(payload.sourceSummary.reviewerNoteDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.rollbackExecutionBlocked, true);
assert.equal(payload.sourceSummary.remediationCreationBlocked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.rollbackReviewTriggerTypes.includes('blocking-regression-watch'));
assert.ok(payload.vocabulary.rollbackReviewTriggerTypes.includes('negative-evidence-confirmed'));
assert.ok(payload.vocabulary.rollbackReviewTriggerTypes.includes('operator-request'));
assert.ok(payload.vocabulary.rollbackReviewStates.includes('rollback-recommended'));
assert.ok(payload.vocabulary.rollbackReviewStates.includes('rollback-rejected'));
assert.ok(payload.vocabulary.rollbackReviewStates.includes('false-positive'));
assert.ok(payload.vocabulary.rollbackReviewSeverities.includes('rollback-candidate'));
assert.ok(payload.vocabulary.rollbackReviewEvidenceTypes.includes('regression-watch-record'));
assert.ok(payload.vocabulary.rollbackReviewEvidenceTypes.includes('aggregate-verification'));
assert.ok(payload.vocabulary.rollbackReviewEvidenceTypes.includes('source-of-truth-doc'));
assert.ok(payload.vocabulary.rollbackReviewDecisionTypes.includes('recommend-remediation-plan'));
assert.ok(payload.vocabulary.rollbackReviewDecisionTypes.includes('hold-baseline'));

assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('watchId'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('registryId'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('acceptedRecordRef'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('watchRecordRef'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('regressionEvidenceRefs'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewRecord.required.includes('remediationPlanAllowed'));
assert.ok(payload.rollbackReviewSchema.rollbackDecision.required.includes('executionAllowed'));
assert.ok(payload.rollbackReviewSchema.rollbackRiskAssessment.required.includes('rollbackExecutionBlocked'));
assert.ok(payload.rollbackReviewSchema.rollbackRiskAssessment.required.includes('remediationPlanRef'));
assert.ok(payload.rollbackReviewSchema.rollbackReviewIndex.required.includes('triggerCounts'));
assert.ok(payload.rollbackReviewRules.some((rule) => rule.id === 'review-requires-regression-watch'));
assert.ok(payload.rollbackReviewRules.some((rule) => rule.id === 'review-is-not-execution'));
assert.ok(payload.rollbackReviewRules.some((rule) => rule.id === 'decision-requires-evidence-chain'));
assert.ok(payload.rollbackReviewRules.some((rule) => rule.id === 'approval-remains-separate'));

assert.equal(payload.rollbackReviewState.realRollbackReviewFileAdopted, false);
assert.equal(payload.rollbackReviewState.discoveredRollbackReviewRecords, 0);
assert.equal(payload.rollbackReviewState.rollbackReviewMutationAllowed, false);
assert.equal(payload.rollbackReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.rollbackReviewState.rollbackExecutionAllowed, false);
assert.equal(payload.rollbackReviewState.remediationCreationAllowed, false);
assert.equal(payload.rollbackReviewState.remediationExecutionAllowed, false);
assert.equal(payload.rollbackReviewState.currentStatus, 'contract-only-no-active-rollback-review-records');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.rollbackReviewRecordTypes, 4);
assert.equal(payload.readiness.regressionWatchRequired, true);
assert.equal(payload.readiness.evidenceChainRequired, true);
assert.equal(payload.readiness.reviewAndApprovalSeparate, true);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationCreationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
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
assert.equal(payload.safetyBoundary.doesNotExecuteRollback, true);
assert.equal(payload.safetyBoundary.doesNotCreateRemediation, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRemediation, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-rollback-review-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Eleventh Implemented Slice: `growth-rollback-review-status`/);
assert.match(plan, /node scripts\/growth-rollback-review-status\.mjs/);
assert.match(plan, /rollback review trigger/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-rollback-review-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-rollback-review-status\.mjs/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-rollback-review-status-readonly-post-m7-818/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRollbackReviewStatus: {
        command: 'node scripts/growth-rollback-review-status.mjs',
        schemaVersion: payload.schemaVersion,
        rollbackReviewRecordTypes: payload.readiness.rollbackReviewRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
