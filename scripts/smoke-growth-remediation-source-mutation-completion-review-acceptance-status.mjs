import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const acceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
);

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
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-completion-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-completion-review-acceptance-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-completion-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-completion-review-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationCompletionReviewAcceptance, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationCompletionReviewAcceptance,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationCompletionReviewAcceptance, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationCompletionReviewAcceptance, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceCriteriaDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationCompletionReviewAcceptanceDecisionNoteDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewerNoteDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionDocumented, true);
assert.equal(payload.sourceSummary.cleanBaselineProofDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-completion-review-acceptance-ready-for-lifecycle-closeout-contract',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-source-mutation-completion-review-acceptance-criteria',
  'needs-source-mutation-completion-review-acceptance-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationCompletionReviewAcceptanceStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationCompletionReviewAcceptanceDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-completion-review-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-completion-review-acceptance-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationCompletionReviewAcceptanceBlockerTypes.includes(
    'source-mutation-completion-review-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationCompletionReviewAcceptanceSchema
    .sourceMutationCompletionReviewAcceptanceRecord.required;
for (const field of [
  'sourceMutationCompletionReviewAcceptanceId',
  'sourceMutationCompletionReviewId',
  'sourceMutationCompletionReviewAcceptanceCriteriaRefs',
  'sourceMutationCompletionReviewAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutAllowed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationCompletionReviewAcceptanceSchema.sourceMutationCompletionReviewAcceptanceDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationCompletionReviewAcceptanceSchema.sourceMutationCompletionReviewAcceptanceBlocker.required.includes(
    'blocksSourceMutationLifecycleCloseout',
  ),
);
assert.ok(
  payload.sourceMutationCompletionReviewAcceptanceSchema.sourceMutationCompletionReviewAcceptanceIndex.required.includes(
    'sourceMutationCompletionReviewAcceptanceRefs',
  ),
);

for (const ruleId of [
  'source-mutation-completion-review-acceptance-requires-current-review',
  'source-mutation-completion-review-acceptance-is-not-source-mutation',
  'source-mutation-completion-review-acceptance-requires-criteria-and-decision-notes',
  'source-mutation-completion-review-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-completion-review-acceptance-blocks-closeout',
]) {
  assert.ok(payload.sourceMutationCompletionReviewAcceptanceRules.some((rule) => rule.id === ruleId));
}

assert.equal(
  payload.sourceMutationCompletionReviewAcceptanceState
    .realSourceMutationCompletionReviewAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationCompletionReviewAcceptanceState
    .discoveredSourceMutationCompletionReviewAcceptanceRecords,
  0,
);
assert.equal(
  payload.sourceMutationCompletionReviewAcceptanceState.sourceMutationLifecycleCloseoutAllowed,
  false,
);
assert.equal(payload.sourceMutationCompletionReviewAcceptanceState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationCompletionReviewAcceptanceState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(payload.sourceMutationCompletionReviewAcceptanceState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationCompletionReviewAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-completion-review-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationCompletionReviewAcceptanceRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewAcceptanceRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationCompletionReviewAcceptanceCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationCompletionReviewAcceptanceDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationCompletionReviewAcceptanceAndMutationSeparate, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-lifecycle-closeout-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
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
  doesNotOpenSourceMutationCompletionReview: true,
  doesNotExecuteSourceMutationCompletionReview: true,
  doesNotOpenSourceMutationCompletionReviewAcceptance: true,
  doesNotExecuteSourceMutationCompletionReviewAcceptance: true,
  doesNotCloseSourceMutationLifecycle: true,
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

const typoResult = runAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-completion-review-acceptance-status');
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
  /Thirty-ninth Implemented Slice: `growth-remediation-source-mutation-completion-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-completion-review-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation completion review acceptance record/);
assert.match(plan, /source mutation completion review acceptance criteria refs/);
assert.match(plan, /source mutation completion review acceptance decision note refs/);
assert.match(
  plan,
  /source mutation completion review acceptance status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout can be\s+considered/);
assert.match(
  plan,
  /Fortieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-completion-review-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-completion-review-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-completion-review-acceptance-status-readonly-post-m7-846/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationCompletionReviewAcceptanceStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
