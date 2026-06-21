import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureResultScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
);

function runClosureResultStatus(args = []) {
  const result = spawnSync(process.execPath, [closureResultScript, ...args], {
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

const result = runClosureResultStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-result-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-result-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureResult, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureResult,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureResult, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureResult, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureResultDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureExecutionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultCriteriaRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultDecisionNoteRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionCriteriaRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRefsDocumented, true);
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
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureResultStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-result-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-result',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution',
  'needs-source-mutation-lifecycle-closeout-closure-result-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-result-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-result-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureResultBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-result-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureResultSchema
    .sourceMutationLifecycleCloseoutClosureResultRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureResultId',
  'sourceMutationLifecycleCloseoutClosureExecutionId',
  'sourceMutationLifecycleCloseoutClosureDispatchId',
  'sourceMutationLifecycleCloseoutClosureResultCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureResultDecisionNoteRefs',
  'reviewAllowed',
  'resultAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultSchema
    .sourceMutationLifecycleCloseoutClosureResultDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureResultSchema
    .sourceMutationLifecycleCloseoutClosureResultBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureResultReview',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-result-requires-current-execution-chain',
  'source-mutation-lifecycle-closeout-closure-result-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-result-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-result-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-result-blocks-review',
]) {
  assert.ok(payload.sourceMutationLifecycleCloseoutClosureResultRules.some((rule) => rule.id === ruleId));
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultState.realSourceMutationLifecycleCloseoutClosureResultFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultState.discoveredSourceMutationLifecycleCloseoutClosureResultRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.reviewAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.resultAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureResultState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureResultState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-result',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureResultRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureExecutionRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureResultAndMutationSeparate, true);
assert.equal(payload.readiness.reviewAllowed, false);
assert.equal(payload.readiness.resultAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureResultReviewStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
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

const typoResult = runClosureResultStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status',
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
  /Forty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure result record/);
assert.match(plan, /source mutation lifecycle closeout closure result criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure result decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure result status stays separate from actual source mutation execution/,
);
assert.match(plan, /before\s+source mutation lifecycle closeout closure result\s+review can be\s+considered/);
assert.match(
  plan,
  /Forty-ninth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status-readonly-post-m7-855/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script: 'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
