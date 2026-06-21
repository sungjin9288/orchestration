import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyResultAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
);

function runApplyResultAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [applyResultAcceptanceScript, ...args], {
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

const result = runApplyResultAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-result-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-result-acceptance-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-result-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-apply-result-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyResultAcceptance, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationApplyResultAcceptance,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyResultAcceptance, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyResultAcceptance, true);
assert.equal(payload.sourceSummary.sourceMutationApplyClosureNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultReviewDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultDocumented, true);
assert.equal(payload.sourceSummary.currentApplyExecutionDocumented, true);
assert.equal(payload.sourceSummary.currentApplyDispatchDocumented, true);
assert.equal(payload.sourceSummary.currentApplyExecutionReadinessDocumented, true);
assert.equal(payload.sourceSummary.currentApplyPreflightDocumented, true);
assert.equal(payload.sourceSummary.currentApplyAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.cleanBaselineProofDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.operatorDispatchIntentDocumented, true);
assert.equal(payload.sourceSummary.reviewerNoteDocumented, true);
assert.equal(payload.sourceSummary.acceptanceCriteriaDocumented, true);
assert.equal(payload.sourceSummary.acceptanceDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.applyResultAcceptanceSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyClosureStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceStates.includes(
    'source-mutation-apply-result-acceptance-ready-for-apply-closure-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceStates.includes(
    'needs-current-apply-result-review',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceStates.includes(
    'needs-acceptance-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceDecisionTypes.includes(
    'approve-source-mutation-apply-closure-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceEvidenceTypes.includes(
    'source-mutation-apply-result-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceEvidenceTypes.includes(
    'acceptance-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceBlockerTypes.includes(
    'apply-result-review-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultAcceptanceBlockerTypes.includes(
    'result-acceptance-status-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceRecord.required.includes(
    'applyResultAcceptanceId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceRecord.required.includes(
    'applyResultReviewId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceRecord.required.includes(
    'acceptanceDecisionNoteRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceRecord.required.includes(
    'applyClosureAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceBlocker.required.includes(
    'blocksApplyClosure',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceSchema.sourceMutationApplyResultAcceptanceIndex.required.includes(
    'applyResultAcceptanceRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceRules.some(
    (rule) => rule.id === 'apply-result-acceptance-requires-current-apply-result-review',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceRules.some(
    (rule) => rule.id === 'apply-result-acceptance-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'apply-result-acceptance-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'apply-result-acceptance-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'failed-stale-broad-dirty-or-mutating-result-acceptance-blocks-apply-closure',
  ),
);

assert.equal(
  payload.sourceMutationApplyResultAcceptanceState.realSourceMutationApplyResultAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationApplyResultAcceptanceState.discoveredSourceMutationApplyResultAcceptanceRecords,
  0,
);
assert.equal(payload.sourceMutationApplyResultAcceptanceState.applyClosureAllowed, false);
assert.equal(payload.sourceMutationApplyResultAcceptanceState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultAcceptanceState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultAcceptanceState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyResultAcceptanceState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyResultAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-apply-result-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyResultAcceptanceRecordTypes, 4);
assert.equal(payload.readiness.currentApplyResultReviewRequired, true);
assert.equal(payload.readiness.currentApplyResultRequired, true);
assert.equal(payload.readiness.currentApplyExecutionRequired, true);
assert.equal(payload.readiness.currentApplyDispatchRequired, true);
assert.equal(payload.readiness.currentApplyExecutionReadinessRequired, true);
assert.equal(payload.readiness.currentApplyPreflightRequired, true);
assert.equal(payload.readiness.currentApplyAuthorizationRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.exactScopeLockRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.dryRunProofRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.operatorDispatchIntentRequired, true);
assert.equal(payload.readiness.resultReviewerNoteRequired, true);
assert.equal(payload.readiness.resultAcceptanceCriteriaRequired, true);
assert.equal(payload.readiness.acceptanceDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyResultAcceptanceAndMutationSeparate, true);
assert.equal(payload.readiness.applyClosureAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyClosureStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-closure-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotGeneratePatch, true);
assert.equal(payload.safetyBoundary.doesNotApplyPatch, true);
assert.equal(payload.safetyBoundary.doesNotApproveApplyAuthorization, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyDispatch, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyExecution, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyResult, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyResultReview, true);
assert.equal(payload.safetyBoundary.doesNotAcceptApplyResult, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyClosure, true);
assert.equal(payload.safetyBoundary.doesNotMutateAcceptedRecords, true);
assert.equal(payload.safetyBoundary.doesNotMutateSource, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRollback, true);
assert.equal(payload.safetyBoundary.doesNotCreateRemediation, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRemediation, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runApplyResultAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-apply-result-acceptance-status',
);
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Thirty-first Implemented Slice: `growth-remediation-source-mutation-apply-result-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-result-acceptance-status\.mjs/,
);
assert.match(plan, /current apply result acceptance record/);
assert.match(plan, /current apply result review record/);
assert.match(plan, /acceptance decision note refs/);
assert.match(plan, /apply result acceptance status stays separate from actually applying patches/);
assert.match(plan, /before\s+source\s+mutation apply closure can be considered/);
assert.match(
  plan,
  /Thirty-second Implemented Slice: `growth-remediation-source-mutation-apply-closure-status`/,
);
assert.match(
  plan,
  /Thirty-third Implemented Slice: `growth-remediation-source-mutation-apply-finalization-status`/,
);
assert.match(
  plan,
  /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/,
);
assert.match(plan, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-apply-result-acceptance-status-readonly-post-m7-838/,
);
assert.match(todo, /growth-remediation-source-mutation-apply-closure-status-readonly-post-m7-839/);
assert.match(todo, /growth-remediation-source-mutation-apply-finalization-status-readonly-post-m7-840/);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-status-readonly-post-m7-841/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyResultAcceptanceStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
