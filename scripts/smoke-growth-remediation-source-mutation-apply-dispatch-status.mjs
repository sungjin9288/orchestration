import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyDispatchScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-dispatch-status.mjs',
);

function runApplyDispatchStatus(args = []) {
  const result = spawnSync(process.execPath, [applyDispatchScript, ...args], {
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

const result = runApplyDispatchStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-dispatch-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-dispatch-status');
assert.equal(payload.posture, 'local-read-only-remediation-source-mutation-apply-dispatch-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-apply-dispatch-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyExecutionReadinessDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyDispatchDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyPreflightImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyExecutionReadinessImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyDispatchImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyDispatch, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyDispatch, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyDispatch, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyDispatch, true);
assert.equal(payload.sourceSummary.sourceMutationApplyExecutionNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplyExecutionReadinessDocumented, true);
assert.equal(payload.sourceSummary.currentApplyPreflightDocumented, true);
assert.equal(payload.sourceSummary.currentApplyAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.cleanBaselineProofDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.operatorDispatchIntentDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.applyDispatchSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyExecutionStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchStates.includes(
    'source-mutation-apply-dispatch-ready-for-apply-execution-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchStates.includes(
    'needs-current-apply-execution-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchStates.includes(
    'needs-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchDecisionTypes.includes(
    'approve-source-mutation-apply-execution-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchEvidenceTypes.includes(
    'source-mutation-apply-execution-readiness-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchEvidenceTypes.includes(
    'operator-dispatch-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchBlockerTypes.includes(
    'apply-execution-readiness-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyDispatchBlockerTypes.includes(
    'dispatch-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchRecord.required.includes(
    'applyDispatchId',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchRecord.required.includes(
    'applyExecutionReadinessId',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchRecord.required.includes(
    'operatorDispatchIntentRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchRecord.required.includes(
    'applyExecutionAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchBlocker.required.includes(
    'blocksApplyExecution',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchSchema.sourceMutationApplyDispatchIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchRules.some(
    (rule) => rule.id === 'apply-dispatch-requires-current-apply-execution-readiness',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchRules.some(
    (rule) => rule.id === 'apply-dispatch-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchRules.some(
    (rule) =>
      rule.id === 'apply-dispatch-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchRules.some(
    (rule) => rule.id === 'apply-dispatch-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyDispatchRules.some(
    (rule) =>
      rule.id === 'failed-stale-broad-dirty-or-mutating-dispatch-blocks-apply-execution',
  ),
);

assert.equal(payload.sourceMutationApplyDispatchState.realSourceMutationApplyDispatchFileAdopted, false);
assert.equal(payload.sourceMutationApplyDispatchState.discoveredSourceMutationApplyDispatchRecords, 0);
assert.equal(payload.sourceMutationApplyDispatchState.applyExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyDispatchState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyDispatchState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyDispatchState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyDispatchState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyDispatchState.currentStatus,
  'contract-only-no-active-source-mutation-apply-dispatch',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyDispatchRecordTypes, 4);
assert.equal(payload.readiness.currentApplyExecutionReadinessRequired, true);
assert.equal(payload.readiness.currentApplyPreflightRequired, true);
assert.equal(payload.readiness.currentApplyAuthorizationRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.exactScopeLockRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.dryRunProofRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.operatorDispatchIntentRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyDispatchAndMutationSeparate, true);
assert.equal(payload.readiness.applyExecutionAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyExecutionStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-apply-execution-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-execution-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotGeneratePatch, true);
assert.equal(payload.safetyBoundary.doesNotApplyPatch, true);
assert.equal(payload.safetyBoundary.doesNotApproveApplyAuthorization, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyDispatch, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyExecution, true);
assert.equal(payload.safetyBoundary.doesNotMutateAcceptedRecords, true);
assert.equal(payload.safetyBoundary.doesNotMutateSource, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRollback, true);
assert.equal(payload.safetyBoundary.doesNotCreateRemediation, true);
assert.equal(payload.safetyBoundary.doesNotExecuteRemediation, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runApplyDispatchStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-apply-dispatch-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Twenty-seventh Implemented Slice: `growth-remediation-source-mutation-apply-dispatch-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-dispatch-status\.mjs/,
);
assert.match(plan, /current apply execution readiness record/);
assert.match(plan, /operator dispatch intent/);
assert.match(plan, /growth-remediation-source-mutation-apply-execution-status/);
assert.match(
  harnessBaseline,
  /node scripts\/growth-remediation-source-mutation-apply-dispatch-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-execution-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-apply-dispatch-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-execution-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-apply-dispatch-status-readonly-post-m7-834/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyDispatchStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationApplyDispatchRecordTypes:
          payload.readiness.sourceMutationApplyDispatchRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
