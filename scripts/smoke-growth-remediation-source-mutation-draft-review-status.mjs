import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const draftReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-draft-review-status.mjs',
);

function runDraftReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [draftReviewScript, ...args], {
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

const result = runDraftReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-draft-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-draft-review-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-draft-review-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-draft-review-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationDraftDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationDraftReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationDraftReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationDraftReview, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationDraftReview, true);
assert.equal(payload.sourceSummary.sourceMutationApplyAuthorizationNextDocumented, true);
assert.equal(payload.sourceSummary.currentDraftDocumented, true);
assert.equal(payload.sourceSummary.applicationPreflightDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.reviewerNotesDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.draftReviewSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyAuthorizationStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationDraftReviewStates.includes(
    'source-mutation-draft-review-ready',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewStates.includes(
    'source-mutation-draft-review-ready-for-apply-authorization',
  ),
);
assert.ok(payload.vocabulary.sourceMutationDraftReviewStates.includes('needs-current-draft'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewStates.includes('needs-verification-output'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewStates.includes('needs-rollback-proof'));
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewStates.includes(
    'needs-negative-evidence-clearance',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewDecisionTypes.includes(
    'approve-source-mutation-apply-authorization-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewDecisionTypes.includes(
    'request-verification-output',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewDecisionTypes.includes(
    'request-negative-evidence-clearance',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes(
    'source-mutation-draft-record',
  ),
);
assert.ok(payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes('patch-draft'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes('diff-preview'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes('verification-output'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes('rollback-proof'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewEvidenceTypes.includes('reviewer-notes'));
assert.ok(payload.vocabulary.sourceMutationDraftReviewBlockerTypes.includes('draft-stale'));
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewBlockerTypes.includes(
    'verification-output-failed',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewBlockerTypes.includes(
    'negative-evidence-unresolved',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationDraftReviewBlockerTypes.includes(
    'review-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'draftReviewId',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'draftId',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'patchDraftRefs',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'verificationOutputRefs',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'rollbackProofRefs',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewRecord.required.includes(
    'applyAuthorizationAllowed',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewBlocker.required.includes(
    'blocksApplyAuthorization',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewSchema.sourceMutationDraftReviewIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewRules.some(
    (rule) => rule.id === 'draft-review-requires-current-source-mutation-draft',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewRules.some(
    (rule) => rule.id === 'draft-review-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewRules.some(
    (rule) => rule.id === 'draft-review-requires-patch-diff-dry-run-and-verification',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewRules.some(
    (rule) => rule.id === 'draft-review-requires-rollback-proof-and-negative-evidence-clearance',
  ),
);
assert.ok(
  payload.sourceMutationDraftReviewRules.some(
    (rule) => rule.id === 'failed-stale-or-mutating-review-blocks-apply-authorization',
  ),
);

assert.equal(payload.sourceMutationDraftReviewState.realSourceMutationDraftReviewFileAdopted, false);
assert.equal(payload.sourceMutationDraftReviewState.discoveredSourceMutationDraftReviews, 0);
assert.equal(payload.sourceMutationDraftReviewState.applyAuthorizationAllowed, false);
assert.equal(payload.sourceMutationDraftReviewState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationDraftReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationDraftReviewState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationDraftReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationDraftReviewState.currentStatus,
  'contract-only-no-active-source-mutation-draft-review',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationDraftReviewRecordTypes, 4);
assert.equal(payload.readiness.currentDraftRequired, true);
assert.equal(payload.readiness.applicationPreflightRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.dryRunProofRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.reviewerNotesRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.draftReviewAndMutationSeparate, true);
assert.equal(payload.readiness.applyAuthorizationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyAuthorizationStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-authorization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
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

const typoResult = runDraftReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-draft-review-status');
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
  /Twenty-third Implemented Slice: `growth-remediation-source-mutation-draft-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-draft-review-status\.mjs/,
);
assert.match(plan, /verification output refs/);
assert.match(plan, /rollback proof refs/);
assert.match(plan, /reviewer notes/);
assert.match(plan, /negative evidence clearance/);
assert.match(plan, /growth-remediation-source-mutation-apply-authorization-status/);
assert.match(
  harnessBaseline,
  /node scripts\/growth-remediation-source-mutation-draft-review-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-authorization-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-draft-review-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-apply-authorization-status/);
assert.match(todo, /growth-remediation-source-mutation-draft-review-status-readonly-post-m7-830/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationDraftReviewStatus: {
        command: 'node scripts/growth-remediation-source-mutation-draft-review-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationDraftReviewRecordTypes:
          payload.readiness.sourceMutationDraftReviewRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
