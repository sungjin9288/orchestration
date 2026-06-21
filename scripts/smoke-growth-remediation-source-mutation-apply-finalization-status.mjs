import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyFinalizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-finalization-status.mjs',
);

function runApplyFinalizationStatus(args = []) {
  const result = spawnSync(process.execPath, [applyFinalizationScript, ...args], {
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

const result = runApplyFinalizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-finalization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-finalization-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-finalization-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-apply-finalization-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyClosureDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyFinalizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyClosureImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyFinalizationImplemented, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyFinalization, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyFinalization, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyFinalization, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyFinalization, true);
assert.equal(payload.sourceSummary.sourceMutationPostApplyAuditNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplyFinalizationDocumented, true);
assert.equal(payload.sourceSummary.currentApplyClosureDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultReviewDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultDocumented, true);
assert.equal(payload.sourceSummary.closureDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.finalizationDecisionNoteDocumented, true);
assert.equal(payload.sourceSummary.applyFinalizationSeparateFromMutation, true);
assert.equal(payload.sourceSummary.postApplyAuditStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationStates.includes(
    'source-mutation-apply-finalization-ready-for-post-apply-audit-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationStates.includes(
    'needs-current-apply-closure',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationStates.includes(
    'needs-finalization-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationDecisionTypes.includes(
    'approve-source-mutation-post-apply-audit-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationEvidenceTypes.includes(
    'source-mutation-apply-finalization-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationEvidenceTypes.includes(
    'finalization-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationBlockerTypes.includes('apply-closure-stale'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyFinalizationBlockerTypes.includes(
    'apply-finalization-status-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationRecord.required.includes(
    'applyFinalizationId',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationRecord.required.includes(
    'applyClosureId',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationRecord.required.includes(
    'finalizationDecisionNoteRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationRecord.required.includes(
    'postApplyAuditAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationBlocker.required.includes(
    'blocksPostApplyAudit',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationSchema.sourceMutationApplyFinalizationIndex.required.includes(
    'applyFinalizationRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationRules.some(
    (rule) => rule.id === 'apply-finalization-requires-current-apply-closure',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationRules.some(
    (rule) => rule.id === 'apply-finalization-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationRules.some(
    (rule) => rule.id === 'apply-finalization-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationRules.some(
    (rule) => rule.id === 'apply-finalization-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyFinalizationRules.some(
    (rule) =>
      rule.id ===
      'failed-stale-broad-dirty-or-mutating-apply-finalization-blocks-post-apply-audit',
  ),
);

assert.equal(payload.sourceMutationApplyFinalizationState.realSourceMutationApplyFinalizationFileAdopted, false);
assert.equal(
  payload.sourceMutationApplyFinalizationState.discoveredSourceMutationApplyFinalizationRecords,
  0,
);
assert.equal(payload.sourceMutationApplyFinalizationState.postApplyAuditAllowed, false);
assert.equal(payload.sourceMutationApplyFinalizationState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyFinalizationState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyFinalizationState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyFinalizationState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyFinalizationState.currentStatus,
  'contract-only-no-active-source-mutation-apply-finalization',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyFinalizationRecordTypes, 4);
assert.equal(payload.readiness.currentApplyClosureRequired, true);
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
assert.equal(payload.readiness.finalizationDecisionNoteRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyFinalizationAndMutationSeparate, true);
assert.equal(payload.readiness.postApplyAuditAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationPostApplyAuditStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-post-apply-audit-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
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
assert.equal(payload.safetyBoundary.doesNotOpenPostApplyAudit, true);
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

const typoResult = runApplyFinalizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-apply-finalization-status',
);
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
  /Thirty-third Implemented Slice: `growth-remediation-source-mutation-apply-finalization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-finalization-status\.mjs/,
);
assert.match(plan, /current apply finalization record/);
assert.match(plan, /finalization decision note refs/);
assert.match(plan, /apply finalization status stays separate from actual patch application/);
assert.match(plan, /before\s+source\s+mutation post-apply audit can be\s+considered/);
assert.match(
  plan,
  /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/,
);
assert.match(plan, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(todo, /growth-remediation-source-mutation-apply-finalization-status-readonly-post-m7-840/);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-status-readonly-post-m7-841/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyFinalizationStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
