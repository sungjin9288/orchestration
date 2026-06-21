import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyClosureScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-closure-status.mjs',
);

function runApplyClosureStatus(args = []) {
  const result = spawnSync(process.execPath, [applyClosureScript, ...args], {
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

const result = runApplyClosureStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-closure-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-closure-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-closure-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-apply-closure-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyClosureDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyClosureImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyClosure, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyClosure, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyClosure, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyClosure, true);
assert.equal(payload.sourceSummary.sourceMutationApplyFinalizationNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplyClosureDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.closureDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.applyClosureSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyFinalizationStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyClosureStates.includes(
    'source-mutation-apply-closure-ready-for-finalization-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureStates.includes(
    'needs-current-apply-result-acceptance',
  ),
);
assert.ok(payload.vocabulary.sourceMutationApplyClosureStates.includes('needs-closure-decision-note'));
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureDecisionTypes.includes(
    'approve-source-mutation-apply-finalization-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureEvidenceTypes.includes(
    'source-mutation-apply-result-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureEvidenceTypes.includes('closure-decision-note'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureBlockerTypes.includes(
    'apply-result-acceptance-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyClosureBlockerTypes.includes(
    'apply-closure-status-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureRecord.required.includes(
    'applyClosureId',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureRecord.required.includes(
    'applyResultAcceptanceId',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureRecord.required.includes(
    'closureDecisionNoteRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureRecord.required.includes(
    'applyFinalizationAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureBlocker.required.includes(
    'blocksApplyFinalization',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureSchema.sourceMutationApplyClosureIndex.required.includes(
    'applyClosureRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureRules.some(
    (rule) => rule.id === 'apply-closure-requires-current-apply-result-acceptance',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureRules.some(
    (rule) => rule.id === 'apply-closure-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureRules.some(
    (rule) => rule.id === 'apply-closure-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureRules.some(
    (rule) => rule.id === 'apply-closure-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyClosureRules.some(
    (rule) =>
      rule.id === 'failed-stale-broad-dirty-or-mutating-apply-closure-blocks-finalization',
  ),
);

assert.equal(payload.sourceMutationApplyClosureState.realSourceMutationApplyClosureFileAdopted, false);
assert.equal(
  payload.sourceMutationApplyClosureState.discoveredSourceMutationApplyClosureRecords,
  0,
);
assert.equal(payload.sourceMutationApplyClosureState.applyFinalizationAllowed, false);
assert.equal(payload.sourceMutationApplyClosureState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyClosureState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyClosureState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyClosureState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyClosureState.currentStatus,
  'contract-only-no-active-source-mutation-apply-closure',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyClosureRecordTypes, 4);
assert.equal(payload.readiness.currentApplyResultAcceptanceRequired, true);
assert.equal(payload.readiness.currentApplyResultReviewRequired, true);
assert.equal(payload.readiness.currentApplyResultRequired, true);
assert.equal(payload.readiness.currentApplyExecutionRequired, true);
assert.equal(payload.readiness.currentApplyDispatchRequired, true);
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
assert.equal(payload.readiness.resultReviewerNoteRequired, true);
assert.equal(payload.readiness.resultAcceptanceCriteriaRequired, true);
assert.equal(payload.readiness.acceptanceDecisionNoteRequired, true);
assert.equal(payload.readiness.closureDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyClosureAndMutationSeparate, true);
assert.equal(payload.readiness.applyFinalizationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyFinalizationStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-finalization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
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
assert.equal(payload.safetyBoundary.doesNotOpenApplyResult, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyResultReview, true);
assert.equal(payload.safetyBoundary.doesNotAcceptApplyResult, true);
assert.equal(payload.safetyBoundary.doesNotOpenApplyClosure, true);
assert.equal(payload.safetyBoundary.doesNotFinalizeApplyLifecycle, true);
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

const typoResult = runApplyClosureStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-apply-closure-status');
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
  /Thirty-second Implemented Slice: `growth-remediation-source-mutation-apply-closure-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-closure-status\.mjs/,
);
assert.match(plan, /current apply closure record/);
assert.match(plan, /current apply result acceptance record/);
assert.match(plan, /closure decision note refs/);
assert.match(plan, /apply closure status stays separate from actual patch application/);
assert.match(plan, /before\s+source\s+mutation apply finalization can be\s+considered/);
assert.match(
  plan,
  /Thirty-third Implemented Slice: `growth-remediation-source-mutation-apply-finalization-status`/,
);
assert.match(
  plan,
  /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/,
);
assert.match(plan, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(todo, /growth-remediation-source-mutation-apply-closure-status-readonly-post-m7-839/);
assert.match(todo, /growth-remediation-source-mutation-apply-finalization-status-readonly-post-m7-840/);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-status-readonly-post-m7-841/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyClosureStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
