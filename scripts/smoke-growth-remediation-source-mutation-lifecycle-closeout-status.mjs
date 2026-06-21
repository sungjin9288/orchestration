import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closeoutScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
);

function runCloseoutStatus(args = []) {
  const result = spawnSync(process.execPath, [closeoutScript, ...args], {
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

const result = runCloseoutStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-status');
assert.equal(payload.posture, 'local-read-only-remediation-source-mutation-lifecycle-closeout-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-lifecycle-closeout-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseout, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseout, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseout, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseout, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationCompletionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutCriteriaDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutDecisionNoteDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-criteria',
  'needs-source-mutation-lifecycle-closeout-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutSchema.sourceMutationLifecycleCloseoutRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationCompletionReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutCriteriaRefs',
  'sourceMutationLifecycleCloseoutDecisionNoteRefs',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutSchema.sourceMutationLifecycleCloseoutDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutSchema.sourceMutationLifecycleCloseoutBlocker.required.includes(
    'blocksSourceMutationLifecycleCloseoutReview',
  ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutSchema.sourceMutationLifecycleCloseoutIndex.required.includes(
    'sourceMutationLifecycleCloseoutRefs',
  ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-requires-current-accepted-review-chain',
  'source-mutation-lifecycle-closeout-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-blocks-review',
]) {
  assert.ok(payload.sourceMutationLifecycleCloseoutRules.some((rule) => rule.id === ruleId));
}

assert.equal(payload.sourceMutationLifecycleCloseoutState.realSourceMutationLifecycleCloseoutFileAdopted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutState.discoveredSourceMutationLifecycleCloseoutRecords, 0);
assert.equal(payload.sourceMutationLifecycleCloseoutState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewAcceptanceRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutAndMutationSeparate, true);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutReviewStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-lifecycle-closeout-review-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
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

const typoResult = runCloseoutStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-lifecycle-closeout-status');
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
  /Fortieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout record/);
assert.match(plan, /source mutation lifecycle closeout criteria refs/);
assert.match(plan, /source mutation lifecycle closeout decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout review can be\s+considered/);
assert.match(
  plan,
  /Forty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-review-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-lifecycle-closeout-status-readonly-post-m7-847/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationLifecycleCloseoutStatus: {
        command: 'node scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
