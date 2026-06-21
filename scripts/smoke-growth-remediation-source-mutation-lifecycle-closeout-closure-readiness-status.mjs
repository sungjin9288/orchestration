import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureReadinessScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
);

function runClosureReadinessStatus(args = []) {
  const result = spawnSync(process.execPath, [closureReadinessScript, ...args], {
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

const result = runClosureReadinessStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-readiness-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutReviewAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureReadiness,
  true,
);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureReadiness,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureReadiness, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureReadiness,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReadinessDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-readiness-ready-for-closure-authorization-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-review',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-source-mutation-lifecycle-closeout-closure-readiness-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-readiness-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureReadinessStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReadinessDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-closure-authorization-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReadinessEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-readiness-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReadinessEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-readiness-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReadinessBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-readiness-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureReadinessSchema
    .sourceMutationLifecycleCloseoutClosureReadinessRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureReadinessId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutReviewId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationLifecycleCloseoutClosureReadinessCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRefs',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureReadinessSchema
    .sourceMutationLifecycleCloseoutClosureReadinessDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureReadinessSchema
    .sourceMutationLifecycleCloseoutClosureReadinessBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureAuthorization',
    ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureReadinessSchema
    .sourceMutationLifecycleCloseoutClosureReadinessIndex.required.includes(
      'sourceMutationLifecycleCloseoutClosureReadinessRefs',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-readiness-requires-current-acceptance-chain',
  'source-mutation-lifecycle-closeout-closure-readiness-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-readiness-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-readiness-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-readiness-blocks-authorization',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureReadinessRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReadinessState
    .realSourceMutationLifecycleCloseoutClosureReadinessFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReadinessState
    .discoveredSourceMutationLifecycleCloseoutClosureReadinessRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureReadinessState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureReadinessState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReadinessState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReadinessState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReadinessState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-readiness',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureReadinessRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureReadinessRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureReadinessCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureReadinessDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureReadinessAndMutationSeparate, true);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureAuthorizationStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
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

const typoResult = runClosureReadinessStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status',
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
  /Forty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure readiness record/);
assert.match(plan, /source mutation lifecycle closeout closure readiness criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure readiness decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure readiness status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /before\s+source mutation lifecycle closeout closure authorization can be\s+considered/,
);
assert.match(
  plan,
  /Forty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status-readonly-post-m7-850/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutClosureReadinessStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
