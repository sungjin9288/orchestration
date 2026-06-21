import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureFinalizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
);

function runClosureFinalizationStatus(args = []) {
  const result = spawnSync(process.execPath, [closureFinalizationScript, ...args], {
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

const result = runClosureFinalizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureFinalization, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalization,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalization, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureFinalization,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReviewAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewAcceptanceCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewAcceptanceDecisionNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefsDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-finalization-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization',
  'needs-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-finalization-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-status-attempts-finalization',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureFinalizationSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureFinalizationId',
  'sourceMutationLifecycleCloseoutClosureAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureReviewId',
  'sourceMutationLifecycleCloseoutClosureId',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'closureFinalizationReviewAllowed',
  'closureFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureFinalization',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-finalization-requires-current-finalization-chain',
  'source-mutation-lifecycle-closeout-closure-finalization-is-not-finalization-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-finalization-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-finalization-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-finalization-blocks-review',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureFinalizationRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationState
    .realSourceMutationLifecycleCloseoutClosureFinalizationFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationState
    .discoveredSourceMutationLifecycleCloseoutClosureFinalizationRecords,
  0,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationState.closureFinalizationReviewAllowed,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationState.closureFinalized, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureFinalizationState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-finalization',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureFinalizationRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureAcceptanceRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureFinalizationReviewStatus, true);
assert.equal(payload.readiness.closureFinalizationReviewAllowed, false);
assert.equal(payload.readiness.closureFinalized, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalization: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureReviewAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureReview: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosure: true,
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

const typoResult = runClosureFinalizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status',
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
  /Fifty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure finalization record/);
assert.match(plan, /source mutation lifecycle closeout closure finalization criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure finalization decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure finalization status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status-readonly-post-m7-863/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
