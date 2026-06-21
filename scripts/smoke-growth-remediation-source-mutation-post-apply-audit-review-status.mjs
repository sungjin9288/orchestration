import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const postApplyAuditReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
);

function runPostApplyAuditReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [postApplyAuditReviewScript, ...args], {
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

const result = runPostApplyAuditReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-post-apply-audit-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-post-apply-audit-review-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-post-apply-audit-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-post-apply-audit-review-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationPostApplyAuditReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationPostApplyAuditReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationPostApplyAuditReview, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationPostApplyAuditReview, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceNextDocumented, true);
assert.equal(payload.sourceSummary.currentPostApplyAuditReviewDocumented, true);
assert.equal(payload.sourceSummary.currentPostApplyAuditDocumented, true);
assert.equal(payload.sourceSummary.currentApplyFinalizationDocumented, true);
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
assert.equal(payload.sourceSummary.finalizationDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewerNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewAcceptanceCriteriaDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewAcceptanceStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-post-apply-audit-review-ready-for-acceptance-contract',
  'needs-current-post-apply-audit',
  'needs-post-apply-audit-review-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationPostApplyAuditReviewStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewDecisionTypes.includes(
    'approve-source-mutation-post-apply-audit-review-acceptance-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewEvidenceTypes.includes(
    'source-mutation-post-apply-audit-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewEvidenceTypes.includes(
    'post-apply-audit-review-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewBlockerTypes.includes(
    'post-apply-audit-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewBlockerTypes.includes(
    'post-apply-audit-review-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationPostApplyAuditReviewSchema.sourceMutationPostApplyAuditReviewRecord
    .required;
for (const field of [
  'postApplyAuditReviewId',
  'postApplyAuditId',
  'postApplyAuditReviewerNoteRefs',
  'postApplyAuditReviewDecisionNoteRefs',
  'postApplyAuditReviewAcceptanceCriteriaRefs',
  'postApplyAuditReviewAcceptanceAllowed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationPostApplyAuditReviewSchema.sourceMutationPostApplyAuditReviewDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationPostApplyAuditReviewSchema.sourceMutationPostApplyAuditReviewBlocker.required.includes(
    'blocksPostApplyAuditReviewAcceptance',
  ),
);
assert.ok(
  payload.sourceMutationPostApplyAuditReviewSchema.sourceMutationPostApplyAuditReviewIndex.required.includes(
    'postApplyAuditReviewRefs',
  ),
);
for (const ruleId of [
  'post-apply-audit-review-requires-current-post-apply-audit',
  'post-apply-audit-review-is-not-source-mutation',
  'post-apply-audit-review-requires-clean-baseline-and-reviewer-decision',
  'post-apply-audit-review-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-post-apply-audit-review-blocks-acceptance',
]) {
  assert.ok(payload.sourceMutationPostApplyAuditReviewRules.some((rule) => rule.id === ruleId));
}

assert.equal(
  payload.sourceMutationPostApplyAuditReviewState
    .realSourceMutationPostApplyAuditReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewState
    .discoveredSourceMutationPostApplyAuditReviewRecords,
  0,
);
assert.equal(payload.sourceMutationPostApplyAuditReviewState.postApplyAuditReviewAcceptanceAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditReviewState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditReviewState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewState.currentStatus,
  'contract-only-no-active-source-mutation-post-apply-audit-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationPostApplyAuditReviewRecordTypes, 4);
assert.equal(payload.readiness.currentPostApplyAuditReviewRequired, true);
assert.equal(payload.readiness.currentPostApplyAuditRequired, true);
assert.equal(payload.readiness.currentApplyFinalizationRequired, true);
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
assert.equal(payload.readiness.finalizationDecisionNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditDecisionNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewerNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewDecisionNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewAcceptanceCriteriaRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewAndMutationSeparate, true);
assert.equal(payload.readiness.postApplyAuditReviewAcceptanceAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationPostApplyAuditReviewAcceptanceStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);

for (const [key, expected] of Object.entries({
  readOnly: true,
  doesNotWriteFiles: true,
  doesNotMutateRuntime: true,
  doesNotExecuteWorkers: true,
  doesNotExecuteDogfood: true,
  doesNotGenerateProposals: true,
  doesNotApplyProposals: true,
  doesNotGeneratePatch: true,
  doesNotApplyPatch: true,
  doesNotApproveApplyAuthorization: true,
  doesNotOpenApplyDispatch: true,
  doesNotOpenApplyExecution: true,
  doesNotOpenApplyResult: true,
  doesNotOpenApplyResultReview: true,
  doesNotAcceptApplyResult: true,
  doesNotOpenApplyClosure: true,
  doesNotFinalizeApplyLifecycle: true,
  doesNotExecutePostApplyAudit: true,
  doesNotExecutePostApplyAuditReview: true,
  doesNotOpenPostApplyAuditReviewAcceptance: true,
  doesNotMutateAcceptedRecords: true,
  doesNotMutateSource: true,
  doesNotExecuteRollback: true,
  doesNotCreateRemediation: true,
  doesNotExecuteRemediation: true,
  doesNotPersistMemory: true,
  doesNotPromoteSkills: true,
  doesNotAuthorizeGatewayActions: true,
  doesNotOpenExternalChannels: true,
  doesNotCommit: true,
  doesNotPush: true,
})) {
  assert.equal(payload.safetyBoundary[key], expected);
}

const typoResult = runPostApplyAuditReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-post-apply-audit-review-status',
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
  /Thirty-fifth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-post-apply-audit-review-status\.mjs/,
);
assert.match(plan, /current post-apply audit review record/);
assert.match(plan, /post-apply audit review decision note refs/);
assert.match(plan, /post-apply audit review status stays separate from actual audit execution/);
assert.match(
  plan,
  /before\s+source\s+mutation post-apply audit review acceptance can be\s+considered/,
);
assert.match(
  plan,
  /Thirty-sixth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-acceptance-status`/,
);
assert.match(
  plan,
  /Thirty-seventh Implemented Slice: `growth-remediation-source-mutation-completion-status`/,
);
assert.match(
  plan,
  /Thirty-eighth Implemented Slice: `growth-remediation-source-mutation-completion-review-status`/,
);
assert.match(
  plan,
  /Thirty-ninth Implemented Slice: `growth-remediation-source-mutation-completion-review-acceptance-status`/,
);
assert.match(
  plan,
  /Fortieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-post-apply-audit-review-status-readonly-post-m7-842/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status-readonly-post-m7-843/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationPostApplyAuditReviewStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
