import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const completionScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-completion-status.mjs',
);

function runCompletionStatus(args = []) {
  const result = spawnSync(process.execPath, [completionScript, ...args], {
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

const result = runCompletionStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-completion-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-completion-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-completion-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-completion-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationCompletion, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationCompletion, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationCompletion, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationCompletion, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionDecisionNoteDocumented, true);
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
assert.equal(payload.sourceSummary.postApplyAuditReviewAcceptanceDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-completion-ready-for-review-contract',
  'needs-current-source-mutation-completion',
  'needs-source-mutation-completion-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationCompletionStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationCompletionDecisionTypes.includes(
    'approve-source-mutation-completion-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionEvidenceTypes.includes(
    'source-mutation-completion-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionEvidenceTypes.includes(
    'source-mutation-completion-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionBlockerTypes.includes(
    'source-mutation-completion-status-attempts-source-mutation',
  ),
);

const recordRequired = payload.sourceMutationCompletionSchema.sourceMutationCompletionRecord.required;
for (const field of [
  'sourceMutationCompletionId',
  'postApplyAuditReviewAcceptanceId',
  'sourceMutationCompletionDecisionNoteRefs',
  'postApplyAuditReviewAcceptanceDecisionNoteRefs',
  'sourceMutationCompletionReviewAllowed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationCompletionSchema.sourceMutationCompletionDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationCompletionSchema.sourceMutationCompletionBlocker.required.includes(
    'blocksSourceMutationCompletionReview',
  ),
);
assert.ok(
  payload.sourceMutationCompletionSchema.sourceMutationCompletionIndex.required.includes(
    'sourceMutationCompletionRefs',
  ),
);

for (const ruleId of [
  'source-mutation-completion-requires-current-review-acceptance',
  'source-mutation-completion-is-not-source-mutation',
  'source-mutation-completion-requires-clean-baseline-and-decision-note',
  'source-mutation-completion-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-completion-blocks-review',
]) {
  assert.ok(payload.sourceMutationCompletionRules.some((rule) => rule.id === ruleId));
}

assert.equal(payload.sourceMutationCompletionState.realSourceMutationCompletionFileAdopted, false);
assert.equal(payload.sourceMutationCompletionState.discoveredSourceMutationCompletionRecords, 0);
assert.equal(payload.sourceMutationCompletionState.sourceMutationCompletionReviewAllowed, false);
assert.equal(payload.sourceMutationCompletionState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationCompletionState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationCompletionState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationCompletionState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationCompletionState.currentStatus,
  'contract-only-no-active-source-mutation-completion',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationCompletionRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationCompletionRequired, true);
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
assert.equal(payload.readiness.sourceMutationCompletionDecisionNoteRequired, true);
assert.equal(payload.readiness.postApplyAuditReviewAcceptanceDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.sourceMutationCompletionAndMutationSeparate, true);
assert.equal(payload.readiness.sourceMutationCompletionReviewAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationCompletionReviewStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-completion-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-completion-review-status.mjs',
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
  doesNotExecuteSourceMutationCompletion: true,
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

const typoResult = runCompletionStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-completion-status');
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
  /Thirty-seventh Implemented Slice: `growth-remediation-source-mutation-completion-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-source-mutation-completion-status\.mjs/);
assert.match(plan, /current source mutation completion record/);
assert.match(plan, /source mutation completion decision note refs/);
assert.match(
  plan,
  /source mutation completion status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation completion review can be\s+considered/);
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
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-review-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-review-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-completion-status-readonly-post-m7-844/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-completion-review-status-readonly-post-m7-845/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-completion-review-acceptance-status-readonly-post-m7-846/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationCompletionStatus: {
        command: 'node scripts/growth-remediation-source-mutation-completion-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
