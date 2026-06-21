import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureResultReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
);

function runClosureResultReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [closureResultReviewScript, ...args], {
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

const result = runClosureResultReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-result-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureResultReview,
  true,
);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureResultReview,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureResultReview, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureResultReview,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceNextDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewDecisionNoteRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultCriteriaRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultDecisionNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-result-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-result',
  'needs-source-mutation-lifecycle-closeout-closure-result-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-result-review-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-result-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-review-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-review-status-attempts-result-acceptance',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureResultReviewSchema
    .sourceMutationLifecycleCloseoutClosureResultReviewRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureResultReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'acceptanceAllowed',
  'resultAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewSchema
    .sourceMutationLifecycleCloseoutClosureResultReviewDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewSchema
    .sourceMutationLifecycleCloseoutClosureResultReviewBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureResultReviewAcceptance',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-result-review-requires-current-result-chain',
  'source-mutation-lifecycle-closeout-closure-result-review-is-not-source-mutation-or-result-acceptance',
  'source-mutation-lifecycle-closeout-closure-result-review-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-result-review-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-result-review-blocks-acceptance',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureResultReviewRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewState
    .realSourceMutationLifecycleCloseoutClosureResultReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewState
    .discoveredSourceMutationLifecycleCloseoutClosureResultReviewRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultReviewState.acceptanceAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultReviewState.resultAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultReviewState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultReviewState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultReviewState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-result-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewerNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewAndMutationSeparate, true);
assert.equal(payload.readiness.acceptanceAllowed, false);
assert.equal(payload.readiness.resultAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.readiness.readyForSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceStatus,
  true,
);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureResultReview: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureResult: true,
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

const typoResult = runClosureResultReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
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
  /Forty-ninth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure result review record/);
assert.match(plan, /source mutation lifecycle closeout closure result review criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure result review decision note refs/);
assert.match(plan, /source mutation lifecycle closeout closure result reviewer note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure result review status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /before\s+source mutation lifecycle closeout closure\s+result review acceptance can be\s+considered/,
);
assert.match(
  plan,
  /Fiftieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status`/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status-readonly-post-m7-856/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
