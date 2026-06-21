import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const finalizationAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
);

function runFinalizationAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [finalizationAcceptanceScript, ...args], {
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

const result = runFinalizationAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureFinalizationAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureFinalizationAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureFinalizationAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureFinalizationAcceptance',
  'sourceMutationLifecycleCloseoutClosureFinalCloseNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationDocumented',
  'currentSourceMutationLifecycleCloseoutClosureAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureAcceptanceDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-finalization-acceptance-ready-for-final-close-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-finalization-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-finalization-acceptance-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceStates.includes(
      state,
    ),
    state,
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-final-close-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-finalization-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionNoteRefs',
  'finalCloseAllowed',
  'closureFinalizationAcceptanceAccepted',
  'closureFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-finalization-acceptance-is-not-final-close-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState.finalCloseAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState
    .closureFinalizationAcceptanceAccepted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState.closureFinalized,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState.lifecycleClosed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceState.sourceMutationAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureFinalCloseStatus, true);
assert.equal(payload.readiness.finalCloseAllowed, false);
assert.equal(payload.readiness.closureFinalizationAcceptanceAccepted, false);
assert.equal(payload.readiness.closureFinalized, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalizationReviewAcceptance: true,
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

const typoResult = runFinalizationAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status',
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
  /Fifty-ninth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure finalization acceptance record/);
assert.match(plan, /source mutation lifecycle closeout closure finalization acceptance criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure finalization acceptance decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure finalization acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixtieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status-readonly-post-m7-866/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-finalization-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-final-close-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
