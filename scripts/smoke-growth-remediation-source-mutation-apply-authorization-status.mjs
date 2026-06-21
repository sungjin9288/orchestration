import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyAuthorizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-authorization-status.mjs',
);

function runApplyAuthorizationStatus(args = []) {
  const result = spawnSync(process.execPath, [applyAuthorizationScript, ...args], {
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

const result = runApplyAuthorizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-authorization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-authorization-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-authorization-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-apply-authorization-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyAuthorizationImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyAuthorization, true);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationApplyAuthorization,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyAuthorization, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyAuthorization, true);
assert.equal(payload.sourceSummary.sourceMutationApplyPreflightNextDocumented, true);
assert.equal(payload.sourceSummary.passedDraftReviewDocumented, true);
assert.equal(payload.sourceSummary.currentDraftReviewDocumented, true);
assert.equal(payload.sourceSummary.operatorApprovalIntentDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.applyAuthorizationSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyPreflightStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationStates.includes(
    'source-mutation-apply-authorization-ready-for-apply-preflight',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationStates.includes(
    'needs-passed-draft-review',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationStates.includes(
    'needs-operator-approval-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationStates.includes('needs-exact-scope-lock'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationDecisionTypes.includes(
    'approve-source-mutation-apply-preflight-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationDecisionTypes.includes(
    'request-operator-approval-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationDecisionTypes.includes(
    'request-exact-scope-lock',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes(
    'source-mutation-draft-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes(
    'operator-approval-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes('exact-scope-lock'),
);
assert.ok(payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes('patch-draft'));
assert.ok(payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes('diff-preview'));
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes('verification-output'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationEvidenceTypes.includes('rollback-proof'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationBlockerTypes.includes(
    'draft-review-not-passed',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationBlockerTypes.includes(
    'operator-approval-intent-missing',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationBlockerTypes.includes(
    'exact-scope-lock-drift',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyAuthorizationBlockerTypes.includes(
    'authorization-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationRecord.required.includes(
    'applyAuthorizationId',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationRecord.required.includes(
    'draftReviewId',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationRecord.required.includes(
    'operatorApprovalIntentRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationRecord.required.includes(
    'exactScopeLockRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationRecord.required.includes(
    'applyPreflightAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationBlocker.required.includes(
    'blocksApplyPreflight',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationSchema.sourceMutationApplyAuthorizationIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationRules.some(
    (rule) => rule.id === 'apply-authorization-requires-passed-current-draft-review',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationRules.some(
    (rule) => rule.id === 'apply-authorization-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationRules.some(
    (rule) => rule.id === 'apply-authorization-requires-operator-intent-and-exact-scope',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationRules.some(
    (rule) => rule.id === 'apply-authorization-requires-verification-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyAuthorizationRules.some(
    (rule) => rule.id === 'failed-stale-broad-or-mutating-authorization-blocks-apply-preflight',
  ),
);

assert.equal(
  payload.sourceMutationApplyAuthorizationState.realSourceMutationApplyAuthorizationFileAdopted,
  false,
);
assert.equal(payload.sourceMutationApplyAuthorizationState.discoveredSourceMutationApplyAuthorizations, 0);
assert.equal(payload.sourceMutationApplyAuthorizationState.applyPreflightAllowed, false);
assert.equal(payload.sourceMutationApplyAuthorizationState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyAuthorizationState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyAuthorizationState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyAuthorizationState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyAuthorizationState.currentStatus,
  'contract-only-no-active-source-mutation-apply-authorization',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyAuthorizationRecordTypes, 4);
assert.equal(payload.readiness.passedDraftReviewRequired, true);
assert.equal(payload.readiness.currentDraftReviewRequired, true);
assert.equal(payload.readiness.operatorApprovalIntentRequired, true);
assert.equal(payload.readiness.exactScopeLockRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyAuthorizationAndMutationSeparate, true);
assert.equal(payload.readiness.applyPreflightAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyPreflightStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-preflight-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
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
assert.equal(payload.safetyBoundary.doesNotOpenApplyPreflight, true);
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

const typoResult = runApplyAuthorizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-apply-authorization-status');
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
  /Twenty-fourth Implemented Slice: `growth-remediation-source-mutation-apply-authorization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-authorization-status\.mjs/,
);
assert.match(plan, /passed draft review record/);
assert.match(plan, /operator approval intent/);
assert.match(plan, /exact scope lock/);
assert.match(plan, /growth-remediation-source-mutation-apply-preflight-status/);
assert.match(
  harnessBaseline,
  /node scripts\/growth-remediation-source-mutation-apply-authorization-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-preflight-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-apply-authorization-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-preflight-status/);
assert.match(
  todo,
  /growth-remediation-source-mutation-apply-authorization-status-readonly-post-m7-831/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyAuthorizationStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationApplyAuthorizationRecordTypes:
          payload.readiness.sourceMutationApplyAuthorizationRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
