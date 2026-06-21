import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyResultReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-result-review-status.mjs',
);

function runApplyResultReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [applyResultReviewScript, ...args], {
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

const result = runApplyResultReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-result-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-result-review-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-result-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-apply-result-review-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultReviewImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyResultReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyResultReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyResultReview, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyResultReview, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultAcceptanceNextDocumented, true);
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
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.applyResultReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.resultAcceptanceStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewStates.includes(
    'source-mutation-apply-result-review-ready-for-result-acceptance-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewStates.includes('needs-current-apply-result'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewStates.includes(
    'needs-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewStates.includes(
    'needs-result-acceptance-criteria',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewDecisionTypes.includes(
    'approve-source-mutation-apply-result-acceptance-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewEvidenceTypes.includes(
    'source-mutation-apply-result-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewEvidenceTypes.includes(
    'result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewEvidenceTypes.includes(
    'result-acceptance-criteria',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewBlockerTypes.includes('apply-result-stale'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultReviewBlockerTypes.includes(
    'result-review-status-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewRecord.required.includes(
    'applyResultReviewId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewRecord.required.includes(
    'applyResultId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewRecord.required.includes(
    'resultReviewerNoteRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewRecord.required.includes(
    'resultAcceptanceCriteriaRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewRecord.required.includes(
    'resultAcceptanceAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewBlocker.required.includes(
    'blocksResultAcceptance',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewSchema.sourceMutationApplyResultReviewIndex.required.includes(
    'applyResultReviewRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewRules.some(
    (rule) => rule.id === 'apply-result-review-requires-current-apply-result',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewRules.some(
    (rule) => rule.id === 'apply-result-review-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewRules.some(
    (rule) =>
      rule.id === 'apply-result-review-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewRules.some(
    (rule) =>
      rule.id === 'apply-result-review-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultReviewRules.some(
    (rule) =>
      rule.id ===
      'failed-stale-broad-dirty-or-mutating-result-review-blocks-result-acceptance',
  ),
);

assert.equal(
  payload.sourceMutationApplyResultReviewState.realSourceMutationApplyResultReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationApplyResultReviewState.discoveredSourceMutationApplyResultReviewRecords,
  0,
);
assert.equal(payload.sourceMutationApplyResultReviewState.resultAcceptanceAllowed, false);
assert.equal(payload.sourceMutationApplyResultReviewState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultReviewState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyResultReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyResultReviewState.currentStatus,
  'contract-only-no-active-source-mutation-apply-result-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyResultReviewRecordTypes, 4);
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
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyResultReviewAndMutationSeparate, true);
assert.equal(payload.readiness.resultAcceptanceAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyResultAcceptanceStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-result-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
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

const typoResult = runApplyResultReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-apply-result-review-status',
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
  /Thirtieth Implemented Slice: `growth-remediation-source-mutation-apply-result-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-result-review-status\.mjs/,
);
assert.match(plan, /current apply result review record/);
assert.match(plan, /current apply result record/);
assert.match(plan, /result reviewer note refs/);
assert.match(plan, /result acceptance criteria refs/);
assert.match(plan, /apply result review status stays separate from actually applying patches/);
assert.match(plan, /before\s+source mutation apply result acceptance can be considered/);
assert.match(
  plan,
  /Thirty-first Implemented Slice: `growth-remediation-source-mutation-apply-result-acceptance-status`/,
);
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
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-apply-result-review-status-readonly-post-m7-837/,
);
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
      growthRemediationSourceMutationApplyResultReviewStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
