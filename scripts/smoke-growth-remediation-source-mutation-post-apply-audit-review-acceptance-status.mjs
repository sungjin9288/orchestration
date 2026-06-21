import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const postApplyAuditReviewAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
);

function runPostApplyAuditReviewAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [postApplyAuditReviewAcceptanceScript, ...args], {
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

const result = runPostApplyAuditReviewAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-post-apply-audit-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-post-apply-audit-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationPostApplyAuditReviewAcceptance, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationPostApplyAuditReviewAcceptance,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationPostApplyAuditReviewAcceptance, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationPostApplyAuditReviewAcceptance,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationCompletionNextDocumented, true);
assert.equal(payload.sourceSummary.currentPostApplyAuditReviewAcceptanceDocumented, true);
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
assert.equal(payload.sourceSummary.postApplyAuditReviewAcceptanceDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewAcceptanceSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-post-apply-audit-review-acceptance-ready-for-completion-contract',
  'needs-current-post-apply-audit-review',
  'needs-post-apply-audit-review-acceptance-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceDecisionTypes.includes(
    'approve-source-mutation-completion-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-post-apply-audit-review-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceEvidenceTypes.includes(
    'post-apply-audit-review-acceptance-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceBlockerTypes.includes(
    'post-apply-audit-review-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditReviewAcceptanceBlockerTypes.includes(
    'post-apply-audit-review-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationPostApplyAuditReviewAcceptanceSchema
    .sourceMutationPostApplyAuditReviewAcceptanceRecord.required;
for (const field of [
  'postApplyAuditReviewAcceptanceId',
  'postApplyAuditReviewId',
  'postApplyAuditReviewAcceptanceCriteriaRefs',
  'postApplyAuditReviewAcceptanceDecisionNoteRefs',
  'sourceMutationCompletionAllowed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationPostApplyAuditReviewAcceptanceSchema
    .sourceMutationPostApplyAuditReviewAcceptanceDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationPostApplyAuditReviewAcceptanceSchema
    .sourceMutationPostApplyAuditReviewAcceptanceBlocker.required.includes(
      'blocksSourceMutationCompletion',
    ),
);
assert.ok(
  payload.sourceMutationPostApplyAuditReviewAcceptanceSchema
    .sourceMutationPostApplyAuditReviewAcceptanceIndex.required.includes(
      'postApplyAuditReviewAcceptanceRefs',
    ),
);
for (const ruleId of [
  'post-apply-audit-review-acceptance-requires-current-post-apply-audit-review',
  'post-apply-audit-review-acceptance-is-not-source-mutation',
  'post-apply-audit-review-acceptance-requires-clean-baseline-and-acceptance-decision',
  'post-apply-audit-review-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-post-apply-audit-review-acceptance-blocks-completion',
]) {
  assert.ok(
    payload.sourceMutationPostApplyAuditReviewAcceptanceRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationPostApplyAuditReviewAcceptanceState
    .realSourceMutationPostApplyAuditReviewAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewAcceptanceState
    .discoveredSourceMutationPostApplyAuditReviewAcceptanceRecords,
  0,
);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewAcceptanceState.sourceMutationCompletionAllowed,
  false,
);
assert.equal(payload.sourceMutationPostApplyAuditReviewAcceptanceState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewAcceptanceState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(payload.sourceMutationPostApplyAuditReviewAcceptanceState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditReviewAcceptanceState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationPostApplyAuditReviewAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-post-apply-audit-review-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationPostApplyAuditReviewAcceptanceRecordTypes, 4);
assert.equal(payload.readiness.currentPostApplyAuditReviewAcceptanceRequired, true);
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
assert.equal(payload.readiness.postApplyAuditReviewAcceptanceDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewAcceptanceAndMutationSeparate, true);
assert.equal(payload.readiness.sourceMutationCompletionAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationCompletionStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-completion-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-completion-status.mjs',
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
  doesNotExecutePostApplyAuditReviewAcceptance: true,
  doesNotOpenSourceMutationCompletion: true,
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

const typoResult = runPostApplyAuditReviewAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status',
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
  /Thirty-sixth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status\.mjs/,
);
assert.match(plan, /current post-apply audit review acceptance record/);
assert.match(plan, /post-apply audit review acceptance decision note refs/);
assert.match(
  plan,
  /post-apply audit review acceptance status stays separate from actual audit execution/,
);
assert.match(plan, /before\s+source mutation\s+completion can be\s+considered/);
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
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status-readonly-post-m7-843/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationPostApplyAuditReviewAcceptanceStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
