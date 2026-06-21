import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const postApplyAuditScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-post-apply-audit-status.mjs',
);

function runPostApplyAuditStatus(args = []) {
  const result = spawnSync(process.execPath, [postApplyAuditScript, ...args], {
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

const result = runPostApplyAuditStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-post-apply-audit-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-post-apply-audit-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-post-apply-audit-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-post-apply-audit-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyFinalizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyFinalizationImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationPostApplyAudit, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationPostApplyAudit, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationPostApplyAudit, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationPostApplyAudit, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentPostApplyAuditDocumented, true);
assert.equal(payload.sourceSummary.currentApplyFinalizationDocumented, true);
assert.equal(payload.sourceSummary.currentApplyClosureDocumented, true);
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
assert.equal(payload.sourceSummary.closureDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.finalizationDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditNoteDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.postApplyAuditSeparateFromMutation, true);
assert.equal(payload.sourceSummary.postApplyAuditReviewStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-post-apply-audit-ready-for-review-contract',
  'needs-current-apply-finalization',
  'needs-post-apply-audit-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationPostApplyAuditStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditDecisionTypes.includes(
    'approve-source-mutation-post-apply-audit-review-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditEvidenceTypes.includes(
    'source-mutation-post-apply-audit-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditEvidenceTypes.includes(
    'post-apply-audit-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditBlockerTypes.includes('apply-finalization-stale'),
);
assert.ok(
  payload.vocabulary.sourceMutationPostApplyAuditBlockerTypes.includes(
    'post-apply-audit-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationPostApplyAuditSchema.sourceMutationPostApplyAuditRecord.required;
for (const field of [
  'postApplyAuditId',
  'applyFinalizationId',
  'postApplyAuditNoteRefs',
  'postApplyAuditDecisionNoteRefs',
  'finalizationDecisionNoteRefs',
  'postApplyAuditReviewAllowed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationPostApplyAuditSchema.sourceMutationPostApplyAuditDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationPostApplyAuditSchema.sourceMutationPostApplyAuditBlocker.required.includes(
    'blocksPostApplyAuditReview',
  ),
);
assert.ok(
  payload.sourceMutationPostApplyAuditSchema.sourceMutationPostApplyAuditIndex.required.includes(
    'postApplyAuditRefs',
  ),
);
for (const ruleId of [
  'post-apply-audit-requires-current-apply-finalization',
  'post-apply-audit-is-not-source-mutation',
  'post-apply-audit-requires-clean-baseline-and-operator-dispatch-intent',
  'post-apply-audit-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-post-apply-audit-blocks-review',
]) {
  assert.ok(payload.sourceMutationPostApplyAuditRules.some((rule) => rule.id === ruleId));
}

assert.equal(payload.sourceMutationPostApplyAuditState.realSourceMutationPostApplyAuditFileAdopted, false);
assert.equal(payload.sourceMutationPostApplyAuditState.discoveredSourceMutationPostApplyAuditRecords, 0);
assert.equal(payload.sourceMutationPostApplyAuditState.postApplyAuditReviewAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationPostApplyAuditState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationPostApplyAuditState.currentStatus,
  'contract-only-no-active-source-mutation-post-apply-audit',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationPostApplyAuditRecordTypes, 4);
assert.equal(payload.readiness.currentPostApplyAuditRequired, true);
assert.equal(payload.readiness.currentApplyFinalizationRequired, true);
assert.equal(payload.readiness.currentApplyClosureRequired, true);
assert.equal(payload.readiness.currentApplyResultAcceptanceRequired, true);
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
assert.equal(payload.readiness.closureDecisionNoteRequired, true);
assert.equal(payload.readiness.finalizationDecisionNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.postApplyAuditAndMutationSeparate, true);
assert.equal(payload.readiness.postApplyAuditReviewAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationPostApplyAuditReviewStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-post-apply-audit-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
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
  doesNotOpenPostApplyAuditReview: true,
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

const typoResult = runPostApplyAuditStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-post-apply-audit-status',
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
  /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-post-apply-audit-status\.mjs/,
);
assert.match(plan, /current post-apply audit record/);
assert.match(plan, /post-apply audit decision note refs/);
assert.match(plan, /post-apply audit status stays separate from actual patch application/);
assert.match(plan, /before\s+source\s+mutation post-apply audit review can be\s+considered/);
assert.match(
  plan,
  /Thirty-fifth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-status`/,
);
assert.match(plan, /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/,
);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-status-readonly-post-m7-841/);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-review-status-readonly-post-m7-842/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationPostApplyAuditStatus: {
        command: 'node scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
