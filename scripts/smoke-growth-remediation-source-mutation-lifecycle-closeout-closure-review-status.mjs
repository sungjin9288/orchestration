import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
);

function runClosureReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [closureReviewScript, ...args], {
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

const result = runClosureReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultImplemented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewImplemented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceImplemented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceImplemented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureReview,
  true,
);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureReview,
  true,
);
assert.equal(
  payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureReview,
  true,
);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureReview,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewAcceptanceNextDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReviewDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented,
  true,
);
assert.equal(
  payload.sourceSummary
    .currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureCriteriaRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDecisionNoteRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-review',
  'needs-current-source-mutation-lifecycle-closeout-closure',
  'needs-source-mutation-lifecycle-closeout-closure-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-review-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-review-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-review-status-attempts-review-acceptance',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureReviewSchema
    .sourceMutationLifecycleCloseoutClosureReviewRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureReviewId',
  'sourceMutationLifecycleCloseoutClosureId',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'closureReviewAcceptanceAllowed',
  'closureReviewAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureReviewSchema
    .sourceMutationLifecycleCloseoutClosureReviewDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureReviewSchema
    .sourceMutationLifecycleCloseoutClosureReviewBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureReview',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-review-requires-current-closure-chain',
  'source-mutation-lifecycle-closeout-closure-review-is-not-review-acceptance-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-review-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-review-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-review-blocks-acceptance',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureReviewRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState
    .realSourceMutationLifecycleCloseoutClosureReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState
    .discoveredSourceMutationLifecycleCloseoutClosureReviewRecords,
  0,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState.closureReviewAcceptanceAllowed,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureReviewState.closureReviewAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureReviewState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureReviewState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureReviewState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureReviewRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureReviewCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRequired,
  true,
);
assert.equal(
  payload.readiness.readyForSourceMutationLifecycleCloseoutClosureReviewAcceptanceStatus,
  true,
);
assert.equal(payload.readiness.closureReviewAcceptanceAllowed, false);
assert.equal(payload.readiness.closureReviewAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureReview: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosure: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureResultAcceptance: true,
  doesNotCloseSourceMutationLifecycleCloseoutClosure: true,
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

const typoResult = runClosureReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status',
);
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const taskLedger = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Fifty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure review record/);
assert.match(plan, /source mutation lifecycle closeout closure review criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure review decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure review status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-review-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-review-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-review-status-readonly-post-m7-860/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-review-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
