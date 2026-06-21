import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureResultAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status.mjs',
);

function runClosureResultAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [closureResultAcceptanceScript, ...args], {
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

const result = runClosureResultAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceDocumented,
  true,
);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureResultAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary
    .completionReadinessMentionsSourceMutationLifecycleCloseoutClosureResultAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureResultAcceptance,
  true,
);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureResultAcceptance,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureNextDocumented, true);
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
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDecisionNoteRefsDocumented,
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
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceSeparateFromMutation,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultAcceptanceStillBlocked,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-result-acceptance-ready-for-closure-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-result-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-result-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-result-acceptance-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-reviewer-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-acceptance-status-attempts-source-mutation',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-acceptance-status-attempts-closure',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureResultAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureResultReviewId',
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDecisionNoteRefs',
  'sourceMutationLifecycleCloseoutClosureResultReviewerNoteRefs',
  'closureAllowed',
  'resultAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureResultAcceptanceDecision.required.includes(
      'allowedNextAction',
    ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureResultAcceptanceBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosure',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-result-acceptance-requires-current-review-acceptance-chain',
  'source-mutation-lifecycle-closeout-closure-result-acceptance-is-not-lifecycle-closure-or-source-mutation',
  'source-mutation-lifecycle-closeout-closure-result-acceptance-requires-criteria-decision-and-reviewer-notes',
  'source-mutation-lifecycle-closeout-closure-result-acceptance-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-result-acceptance-blocks-closure',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceRules.some(
      (rule) => rule.id === ruleId,
    ),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureResultAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState
    .discoveredSourceMutationLifecycleCloseoutClosureResultAcceptanceRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.closureAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.resultAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultAcceptanceState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-result-acceptance',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultAcceptanceRecordTypes, 4);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultReviewAcceptanceRequired,
  true,
);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultReviewRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultAcceptanceCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultReviewerNoteRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureResultAcceptanceAndMutationSeparate,
  true,
);
assert.equal(payload.readiness.closureAllowed, false);
assert.equal(payload.readiness.resultAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureResultAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureResultReviewAcceptance: true,
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

const typoResult = runClosureResultAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status',
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
  /Fifty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure result acceptance record/);
assert.match(plan, /source mutation lifecycle closeout closure result acceptance criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure result acceptance decision note refs/);
assert.match(plan, /source mutation lifecycle closeout closure result review acceptance criteria refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure result review acceptance decision note refs/,
);
assert.match(plan, /source mutation lifecycle closeout closure result reviewer note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure result acceptance status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout closure status can be\s+considered/);
assert.match(
  plan,
  /Fifty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status-readonly-post-m7-858/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-acceptance-status.mjs',
      nextRecommendedSlice: 'growth-remediation-source-mutation-lifecycle-closeout-closure-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
