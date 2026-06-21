import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureDispatchScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status.mjs',
);

function runClosureDispatchStatus(args = []) {
  const result = spawnSync(process.execPath, [closureDispatchScript, ...args], {
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

const result = runClosureDispatchStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-dispatch-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessImplemented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureDispatch, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureDispatch,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureDispatch, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureDispatch,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionNextDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureDispatchDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionReadinessDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchDecisionNoteRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessDecisionNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-dispatch-ready-for-closure-execution-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-dispatch',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution-readiness',
  'needs-source-mutation-lifecycle-closeout-closure-dispatch-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-dispatch-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureDispatchStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureDispatchDecisionTypes.includes(
    'authorize-source-mutation-lifecycle-closeout-closure-execution',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureDispatchEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-dispatch-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureDispatchEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-dispatch-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureDispatchBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-dispatch-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureDispatchSchema
    .sourceMutationLifecycleCloseoutClosureDispatchRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureDispatchId',
  'sourceMutationLifecycleCloseoutClosureExecutionReadinessId',
  'sourceMutationLifecycleCloseoutClosureAuthorizationId',
  'sourceMutationLifecycleCloseoutClosureReadinessId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationLifecycleCloseoutClosureDispatchCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureDispatchDecisionNoteRefs',
  'executionAllowed',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureDispatchSchema
    .sourceMutationLifecycleCloseoutClosureDispatchDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureDispatchSchema
    .sourceMutationLifecycleCloseoutClosureDispatchBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureExecution',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-dispatch-requires-current-execution-readiness-chain',
  'source-mutation-lifecycle-closeout-closure-dispatch-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-dispatch-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-dispatch-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-dispatch-blocks-execution',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureDispatchRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureDispatchState
    .realSourceMutationLifecycleCloseoutClosureDispatchFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureDispatchState
    .discoveredSourceMutationLifecycleCloseoutClosureDispatchRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.executionAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.dispatchAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureDispatchState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureDispatchState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-dispatch',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureDispatchRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureDispatchRequired, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureExecutionReadinessRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureDispatchCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureDispatchDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureDispatchAndMutationSeparate, true);
assert.equal(payload.readiness.executionAllowed, false);
assert.equal(payload.readiness.dispatchAllowed, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureExecutionStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
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

const typoResult = runClosureDispatchStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status',
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
  /Forty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure dispatch record/);
assert.match(plan, /source mutation lifecycle closeout closure dispatch criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure dispatch decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure dispatch status stays separate from actual source mutation execution/,
);
assert.match(plan, /before source mutation lifecycle closeout closure execution can be\s+considered/);
assert.match(
  plan,
  /Forty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status-readonly-post-m7-853/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script: 'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status.mjs',
      nextRecommendedSlice: 'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
