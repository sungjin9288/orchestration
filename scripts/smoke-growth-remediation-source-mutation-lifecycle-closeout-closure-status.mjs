import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
);

function runClosureStatus(args = []) {
  const result = spawnSync(process.execPath, [closureScript, ...args], {
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

const result = runClosureStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosure, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosure,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosure, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosure, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReviewNextDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-status-attempts-final-lifecycle-close',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureSchema.sourceMutationLifecycleCloseoutClosureRecord
    .required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureId',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'closureReviewAllowed',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureSchema
    .sourceMutationLifecycleCloseoutClosureDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureSchema
    .sourceMutationLifecycleCloseoutClosureBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosure',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-requires-current-result-acceptance-chain',
  'source-mutation-lifecycle-closeout-closure-is-not-final-lifecycle-close-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-blocks-review',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureState
    .realSourceMutationLifecycleCloseoutClosureFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureState
    .discoveredSourceMutationLifecycleCloseoutClosureRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureState.closureReviewAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureRequired, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureReviewStatus, true);
assert.equal(payload.readiness.closureReviewAllowed, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status.mjs',
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

const typoResult = runClosureStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-status',
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
  /Fifty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure record/);
assert.match(plan, /source mutation lifecycle closeout closure criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Fifty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-review-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-status-readonly-post-m7-859/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script: 'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
