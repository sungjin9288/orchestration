import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureExecutionReadinessScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
);

function runClosureExecutionReadinessStatus(args = []) {
  const result = spawnSync(process.execPath, [closureExecutionReadinessScript, ...args], {
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

const result = runClosureExecutionReadinessStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessDocumented,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationImplemented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessImplemented,
  true,
);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureExecutionReadiness,
  true,
);
assert.equal(
  payload.sourceSummary
    .completionReadinessMentionsSourceMutationLifecycleCloseoutClosureExecutionReadiness,
  true,
);
assert.equal(
  payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureExecutionReadiness,
  true,
);
assert.equal(
  payload.sourceSummary
    .verificationIncludesSourceMutationLifecycleCloseoutClosureExecutionReadiness,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureDispatchNextDocumented, true);
assert.equal(
  payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionReadinessDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReadinessDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented, true);
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
assert.equal(
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessSeparateFromMutation,
  true,
);
assert.equal(
  payload.sourceSummary
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessStillBlocked,
  true,
);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-execution-readiness-ready-for-closure-dispatch-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution-readiness',
  'needs-current-source-mutation-lifecycle-closeout-closure-authorization',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
  'needs-source-mutation-lifecycle-closeout-closure-execution-readiness-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-execution-readiness-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionReadinessStates.includes(
      state,
    ),
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionReadinessDecisionTypes.includes(
    'approve-source-mutation-lifecycle-closeout-closure-dispatch-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionReadinessEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-readiness-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionReadinessEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-readiness-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureExecutionReadinessBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-execution-readiness-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessSchema
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureExecutionReadinessId',
  'sourceMutationLifecycleCloseoutClosureAuthorizationId',
  'sourceMutationLifecycleCloseoutClosureReadinessId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationLifecycleCloseoutClosureExecutionReadinessCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureExecutionReadinessDecisionNoteRefs',
  'dispatchAllowed',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessSchema
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessDecision.required.includes(
      'allowedNextAction',
    ),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessSchema
    .sourceMutationLifecycleCloseoutClosureExecutionReadinessBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureDispatch',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-execution-readiness-requires-current-authorization-chain',
  'source-mutation-lifecycle-closeout-closure-execution-readiness-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-execution-readiness-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-execution-readiness-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-execution-readiness-blocks-dispatch',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessRules.some(
      (rule) => rule.id === ruleId,
    ),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState
    .realSourceMutationLifecycleCloseoutClosureExecutionReadinessFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState
    .discoveredSourceMutationLifecycleCloseoutClosureExecutionReadinessRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState.dispatchAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState
    .acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState
    .remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureExecutionReadinessState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-execution-readiness',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionReadinessRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureExecutionReadinessRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureAuthorizationRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionReadinessCriteriaRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionReadinessDecisionNoteRequired,
  true,
);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureExecutionReadinessAndMutationSeparate, true);
assert.equal(payload.readiness.dispatchAllowed, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureDispatchStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status.mjs',
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

const typoResult = runClosureExecutionReadinessStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status',
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
  /Forty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure execution readiness record/);
assert.match(plan, /source mutation lifecycle closeout closure execution readiness criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure execution readiness decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure execution readiness status stays separate from actual source mutation execution/,
);
assert.match(plan, /before source mutation lifecycle closeout closure dispatch can be considered/);
assert.match(
  plan,
  /Forty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status-readonly-post-m7-852/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
