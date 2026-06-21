import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureExecutionScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
);

function runClosureExecutionStatus(args = []) {
  const result = spawnSync(process.execPath, [closureExecutionScript, ...args], {
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

const result = runClosureExecutionStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-execution-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureExecution, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureExecution,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureExecution, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureExecution,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultNextDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureDispatchDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRefsDocumented,
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-execution-ready-for-closure-result-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution',
  'needs-current-source-mutation-lifecycle-closeout-closure-dispatch',
  'needs-source-mutation-lifecycle-closeout-closure-execution-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-execution-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-result-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureExecutionSchema
    .sourceMutationLifecycleCloseoutClosureExecutionRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureDispatchId',
  'sourceMutationLifecycleCloseoutClosureExecutionReadinessId',
  'sourceMutationLifecycleCloseoutClosureAuthorizationId',
  'sourceMutationLifecycleCloseoutClosureReadinessId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationLifecycleCloseoutClosureExecutionCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRefs',
  'resultAllowed',
  'executionAllowed',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureExecutionSchema
    .sourceMutationLifecycleCloseoutClosureExecutionDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureExecutionSchema
    .sourceMutationLifecycleCloseoutClosureExecutionBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureResult',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-execution-requires-current-dispatch-chain',
  'source-mutation-lifecycle-closeout-closure-execution-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-execution-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-execution-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-execution-blocks-result',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureExecutionRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionState
    .realSourceMutationLifecycleCloseoutClosureExecutionFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionState
    .discoveredSourceMutationLifecycleCloseoutClosureExecutionRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.resultAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.executionAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-execution',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureExecutionRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureDispatchRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionAndMutationSeparate, true);
assert.equal(payload.readiness.resultAllowed, false);
assert.equal(payload.readiness.executionAllowed, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureResultStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
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

const typoResult = runClosureExecutionStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status',
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
  /Forty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure execution record/);
assert.match(plan, /source mutation lifecycle closeout closure execution criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure execution decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure execution status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout closure result can be\s+considered/);
assert.match(
  plan,
  /Forty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status-readonly-post-m7-854/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script: 'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
      nextRecommendedSlice: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
