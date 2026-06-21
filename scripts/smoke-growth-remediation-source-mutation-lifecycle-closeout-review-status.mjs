import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
);

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
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-review-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-review-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutReview, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutReview, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewerNoteRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewDecisionNoteRefsDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-review',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-reviewer-note',
  'needs-source-mutation-lifecycle-closeout-review-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutReviewStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-review-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-review-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutReviewSchema.sourceMutationLifecycleCloseoutReviewRecord
    .required;
for (const field of [
  'sourceMutationLifecycleCloseoutReviewId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationCompletionReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutReviewerNoteRefs',
  'sourceMutationLifecycleCloseoutReviewDecisionNoteRefs',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewSchema.sourceMutationLifecycleCloseoutReviewDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewSchema.sourceMutationLifecycleCloseoutReviewBlocker.required.includes(
    'blocksSourceMutationLifecycleCloseoutReviewAcceptance',
  ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewSchema.sourceMutationLifecycleCloseoutReviewIndex.required.includes(
    'sourceMutationLifecycleCloseoutReviewRefs',
  ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-review-requires-current-closeout-chain',
  'source-mutation-lifecycle-closeout-review-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-review-requires-reviewer-and-decision-notes',
  'source-mutation-lifecycle-closeout-review-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-review-blocks-acceptance',
]) {
  assert.ok(payload.sourceMutationLifecycleCloseoutReviewRules.some((rule) => rule.id === ruleId));
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewState.realSourceMutationLifecycleCloseoutReviewFileAdopted,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewState.discoveredSourceMutationLifecycleCloseoutReviewRecords, 0);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewAcceptanceRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewerNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewAndMutationSeparate, true);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutReviewAcceptanceStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
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

const typoResult = runReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-lifecycle-closeout-review-status');
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
  /Forty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-review-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout review record/);
assert.match(plan, /source mutation lifecycle closeout reviewer note refs/);
assert.match(plan, /source mutation lifecycle closeout review decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout review status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout review acceptance can be\s+considered/);
assert.match(
  plan,
  /Forty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-lifecycle-closeout-review-status-readonly-post-m7-848/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationLifecycleCloseoutReviewStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
