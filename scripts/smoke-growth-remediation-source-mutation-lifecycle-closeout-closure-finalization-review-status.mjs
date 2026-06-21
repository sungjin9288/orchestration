import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureFinalizationReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
);

function runClosureFinalizationReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [closureFinalizationReviewScript, ...args], {
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

const result = runClosureFinalizationReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureFinalizationDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationImplemented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewImplemented',
  'sourceMutationLifecycleCloseoutClosureAcceptanceImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReview',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReview',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalizationReview',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureFinalizationReview',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented',
  'currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefsDocumented',
  'cleanBaselineProofDocumented',
  'exactScopeLockDocumented',
  'targetLockDocumented',
  'baselineDigestDocumented',
  'patchDraftDocumented',
  'diffPreviewDocumented',
  'verificationOutputDocumented',
  'dryRunProofDocumented',
  'rollbackProofDocumented',
  'negativeEvidenceClearanceDocumented',
  'sourceOfTruthDocumented',
  'taskLedgerRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-finalization-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-status-attempts-finalization',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewId',
  'sourceMutationLifecycleCloseoutClosureFinalizationId',
  'sourceMutationLifecycleCloseoutClosureAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRefs',
  'closureFinalizationReviewAcceptanceAllowed',
  'closureFinalizationReviewAccepted',
  'closureFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureFinalizationReview',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-finalization-review-requires-current-review-chain',
  'source-mutation-lifecycle-closeout-closure-finalization-review-is-not-acceptance-finalization-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-finalization-review-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-finalization-review-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-finalization-review-blocks-acceptance',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewRules.some((rule) => rule.id === ruleId),
    ruleId,
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState
    .realSourceMutationLifecycleCloseoutClosureFinalizationReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState
    .discoveredSourceMutationLifecycleCloseoutClosureFinalizationReviewRecords,
  0,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState
    .closureFinalizationReviewAcceptanceAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState.closureFinalizationReviewAccepted,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState.closureFinalized, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewState.remediationExecutionAllowed, false);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureFinalizationReviewRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceStatus, true);
assert.equal(payload.readiness.closureFinalizationReviewAcceptanceAllowed, false);
assert.equal(payload.readiness.closureFinalizationReviewAccepted, false);
assert.equal(payload.readiness.closureFinalized, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationReview: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalization: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureAcceptance: true,
  doesNotFinalizeSourceMutationLifecycleCloseoutClosure: true,
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

const typoResult = runClosureFinalizationReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
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
  /Fifty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure finalization review record/);
assert.match(plan, /source mutation lifecycle closeout closure finalization review criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure finalization review decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure finalization review status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status-readonly-post-m7-864/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
