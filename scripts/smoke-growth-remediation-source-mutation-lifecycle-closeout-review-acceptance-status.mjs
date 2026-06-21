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
  'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
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
  `growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutReviewAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutReviewAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutReviewAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutReviewAcceptance,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessNextDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefsDocumented,
  true,
);
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
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceSeparateFromMutation,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceStillBlocked,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-review-acceptance-ready-for-closure-readiness-contract',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-review',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-review-acceptance-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutReviewAcceptanceStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewAcceptanceDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-closure-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-review-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-review-acceptance-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutReviewAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-review-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutReviewAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutReviewId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationCompletionReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRefs',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutReviewAcceptanceDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutReviewAcceptanceBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureReadiness',
    ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutReviewAcceptanceIndex.required.includes(
      'sourceMutationLifecycleCloseoutReviewAcceptanceRefs',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-review-acceptance-requires-current-review-chain',
  'source-mutation-lifecycle-closeout-review-acceptance-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-review-acceptance-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-review-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-review-acceptance-blocks-closure-readiness',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutReviewAcceptanceRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceState
    .realSourceMutationLifecycleCloseoutReviewAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceState
    .discoveredSourceMutationLifecycleCloseoutReviewAcceptanceRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewAcceptanceState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutReviewAcceptanceState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutReviewAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-review-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewAcceptanceRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutRequired, true);
assert.equal(payload.readiness.currentSourceMutationCompletionReviewAcceptanceRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewAcceptanceCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutReviewAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutReviewAcceptanceAndMutationSeparate, true);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureReadinessStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
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
  assert.equal(payload.safetyBoundary[key], expected, `safetyBoundary.${key}`);
}

const typoResult = runAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status',
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
  /Forty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout review acceptance record/);
assert.match(plan, /source mutation lifecycle closeout review acceptance criteria refs/);
assert.match(plan, /source mutation lifecycle closeout review acceptance decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout review acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /before\s+source mutation lifecycle closeout closure readiness can be\s+considered/,
);
assert.match(
  plan,
  /Forty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status`/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status-readonly-post-m7-849/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutReviewAcceptanceStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
