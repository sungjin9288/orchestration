import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyResultScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-result-status.mjs',
);

function runApplyResultStatus(args = []) {
  const result = spawnSync(process.execPath, [applyResultScript, ...args], {
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

const result = runApplyResultStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-result-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-result-status');
assert.equal(payload.posture, 'local-read-only-remediation-source-mutation-apply-result-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-apply-result-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyExecutionDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyExecutionImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyResult, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyResult, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyResult, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyResult, true);
assert.equal(payload.sourceSummary.sourceMutationApplyResultReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplyResultDocumented, true);
assert.equal(payload.sourceSummary.currentApplyExecutionDocumented, true);
assert.equal(payload.sourceSummary.currentApplyDispatchDocumented, true);
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
assert.equal(payload.sourceSummary.applyResultSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyResultReviewStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyResultStates.includes(
    'source-mutation-apply-result-ready-for-result-review-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultStates.includes('needs-current-apply-execution'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultStates.includes(
    'needs-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultDecisionTypes.includes(
    'approve-source-mutation-apply-result-review-contract-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultEvidenceTypes.includes(
    'source-mutation-apply-execution-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultEvidenceTypes.includes(
    'operator-dispatch-intent',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultBlockerTypes.includes('apply-execution-stale'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyResultBlockerTypes.includes(
    'result-status-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultRecord.required.includes(
    'applyResultId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultRecord.required.includes(
    'applyExecutionId',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultRecord.required.includes(
    'operatorDispatchIntentRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultRecord.required.includes(
    'applyResultReviewAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultBlocker.required.includes(
    'blocksApplyResultReview',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultSchema.sourceMutationApplyResultIndex.required.includes(
    'applyResultRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultRules.some(
    (rule) => rule.id === 'apply-result-requires-current-apply-execution',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultRules.some(
    (rule) => rule.id === 'apply-result-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultRules.some(
    (rule) => rule.id === 'apply-result-requires-clean-baseline-and-operator-dispatch-intent',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultRules.some(
    (rule) => rule.id === 'apply-result-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyResultRules.some(
    (rule) => rule.id === 'failed-stale-broad-dirty-or-mutating-result-blocks-apply-result-review',
  ),
);

assert.equal(payload.sourceMutationApplyResultState.realSourceMutationApplyResultFileAdopted, false);
assert.equal(payload.sourceMutationApplyResultState.discoveredSourceMutationApplyResultRecords, 0);
assert.equal(payload.sourceMutationApplyResultState.applyResultReviewAllowed, false);
assert.equal(payload.sourceMutationApplyResultState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyResultState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyResultState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyResultState.currentStatus,
  'contract-only-no-active-source-mutation-apply-result',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyResultRecordTypes, 4);
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
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyResultAndMutationSeparate, true);
assert.equal(payload.readiness.applyResultReviewAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyResultReviewStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-result-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
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

const typoResult = runApplyResultStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-apply-result-status');
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
  /Twenty-ninth Implemented Slice: `growth-remediation-source-mutation-apply-result-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-apply-result-status\.mjs/,
);
assert.match(plan, /current apply result record/);
assert.match(plan, /current apply execution record/);
assert.match(plan, /current apply dispatch record/);
assert.match(plan, /current apply execution readiness record/);
assert.match(plan, /current apply preflight record/);
assert.match(plan, /current apply authorization record/);
assert.match(plan, /operator dispatch intent/);
assert.match(plan, /apply result status stays separate from actually applying patches/);
assert.match(plan, /before\s+source mutation apply result review can be considered/);
assert.match(
  plan,
  /Thirtieth Implemented Slice: `growth-remediation-source-mutation-apply-result-review-status`/,
);
assert.match(
  plan,
  /Thirty-first Implemented Slice: `growth-remediation-source-mutation-apply-result-acceptance-status`/,
);
assert.match(
  plan,
  /Thirty-second Implemented Slice: `growth-remediation-source-mutation-apply-closure-status`/,
);
assert.match(
  plan,
  /Thirty-third Implemented Slice: `growth-remediation-source-mutation-apply-finalization-status`/,
);
assert.match(
  plan,
  /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/,
);
assert.match(plan, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-review-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-review-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-result-acceptance-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-closure-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-finalization-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-post-apply-audit-review-status/);
assert.match(todo, /growth-remediation-source-mutation-apply-result-status-readonly-post-m7-836/);
assert.match(todo, /growth-remediation-source-mutation-apply-result-review-status-readonly-post-m7-837/);
assert.match(
  todo,
  /growth-remediation-source-mutation-apply-result-acceptance-status-readonly-post-m7-838/,
);
assert.match(todo, /growth-remediation-source-mutation-apply-closure-status-readonly-post-m7-839/);
assert.match(todo, /growth-remediation-source-mutation-apply-finalization-status-readonly-post-m7-840/);
assert.match(todo, /growth-remediation-source-mutation-post-apply-audit-status-readonly-post-m7-841/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyResultStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-result-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
