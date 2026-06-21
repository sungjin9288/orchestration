import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureFinalizationReviewAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
);

function runClosureFinalizationReviewAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [closureFinalizationReviewAcceptanceScript, ...args], {
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

const result = runClosureFinalizationReviewAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewImplemented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureFinalizationImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented',
  'currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-ready-for-finalization-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceStates.includes(
      state,
    ),
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-finalization-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-attempts-finalization',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewId',
  'sourceMutationLifecycleCloseoutClosureFinalizationId',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRefs',
  'closureFinalizationAcceptanceAllowed',
  'closureFinalizationReviewAcceptanceAccepted',
  'closureFinalizationReviewAccepted',
  'closureFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecision.required.includes(
      'allowedNextAction',
    ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-current-review-acceptance-chain',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-is-not-finalization-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-finalization-review-acceptance-blocks-finalization-acceptance',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRules.some(
      (rule) => rule.id === ruleId,
    ),
    ruleId,
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState
    .discoveredSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRecords,
  0,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState
    .closureFinalizationAcceptanceAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState
    .closureFinalizationReviewAcceptanceAccepted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState.closureFinalized,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState.lifecycleClosed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState.sourceMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceState.remediationExecutionAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceStatus, true);
assert.equal(payload.readiness.closureFinalizationAcceptanceAllowed, false);
assert.equal(payload.readiness.closureFinalizationReviewAcceptanceAccepted, false);
assert.equal(payload.readiness.closureFinalized, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance: true,
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

const typoResult = runClosureFinalizationReviewAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status',
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
  /Fifty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure finalization review acceptance record/);
assert.match(plan, /source mutation lifecycle closeout closure finalization review acceptance criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure finalization review acceptance decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure finalization review acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-ninth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status-readonly-post-m7-865/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
