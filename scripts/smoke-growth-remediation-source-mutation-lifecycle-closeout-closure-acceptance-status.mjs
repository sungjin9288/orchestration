import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
);

function runClosureAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [closureAcceptanceScript, ...args], {
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

const result = runClosureAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewAcceptanceDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewImplemented, true);
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
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewAcceptanceImplemented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureAcceptance, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureAcceptance,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureAcceptance, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureAcceptance,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureFinalizationNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReviewAcceptanceDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReviewDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultReviewDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewCriteriaRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureCriteriaRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDecisionNoteRefsDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAcceptanceStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-acceptance-ready-for-finalization-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-acceptance-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-finalization-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-acceptance-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-acceptance-status-attempts-finalization',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureReviewId',
  'sourceMutationLifecycleCloseoutClosureId',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureReviewAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureReviewDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'closureFinalizationAllowed',
  'closureAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureAcceptanceDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureAcceptanceBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureAcceptance',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-acceptance-requires-current-acceptance-chain',
  'source-mutation-lifecycle-closeout-closure-acceptance-is-not-finalization-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-acceptance-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-acceptance-blocks-finalization',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureAcceptanceRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceState
    .discoveredSourceMutationLifecycleCloseoutClosureAcceptanceRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.closureFinalizationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.closureAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAcceptanceRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureAcceptanceRequired, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureReviewAcceptanceRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureFinalizationStatus, true);
assert.equal(payload.readiness.closureFinalizationAllowed, false);
assert.equal(payload.readiness.closureAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status.mjs',
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

const typoResult = runClosureAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status',
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
  /Fifty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure acceptance record/);
assert.match(plan, /source mutation lifecycle closeout closure acceptance criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure acceptance decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status-readonly-post-m7-862/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
