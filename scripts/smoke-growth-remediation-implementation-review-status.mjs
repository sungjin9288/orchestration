import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const reviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-implementation-review-status.mjs',
);

function runReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [reviewScript, ...args], {
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

const result = runReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-implementation-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-implementation-review-status');
assert.equal(payload.posture, 'local-read-only-remediation-implementation-review-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-implementation-review-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.implementationProposalDocumented, true);
assert.equal(payload.sourceSummary.implementationReviewDocumented, true);
assert.equal(payload.sourceSummary.implementationProposalImplemented, true);
assert.equal(payload.sourceSummary.implementationReviewImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsImplementationReview, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsImplementationReview, true);
assert.equal(payload.sourceSummary.ledgerMentionsImplementationReview, true);
assert.equal(payload.sourceSummary.verificationIncludesImplementationReview, true);
assert.equal(payload.sourceSummary.executionAuthorityNextDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.scopeDriftDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.reviewDoesNotMutate, true);
assert.equal(payload.sourceSummary.reviewDoesNotExecute, true);
assert.equal(payload.sourceSummary.proposalGenerationBlocked, true);

assert.ok(payload.vocabulary.implementationReviewStates.includes('review-ready'));
assert.ok(payload.vocabulary.implementationReviewStates.includes('review-blocked'));
assert.ok(
  payload.vocabulary.implementationReviewStates.includes('approved-for-thin-slice-readiness'),
);
assert.ok(
  payload.vocabulary.implementationReviewDecisionTypes.includes('approve-thin-slice-readiness'),
);
assert.ok(
  payload.vocabulary.implementationReviewDecisionTypes.includes(
    'request-verification-evidence',
  ),
);
assert.ok(payload.vocabulary.implementationReviewEvidenceTypes.includes('verification-output'));
assert.ok(payload.vocabulary.implementationReviewEvidenceTypes.includes('rollback-proof'));
assert.ok(payload.vocabulary.implementationReviewEvidenceTypes.includes('negative-evidence'));
assert.ok(payload.vocabulary.implementationReviewBlockerTypes.includes('scope-drift'));
assert.ok(
  payload.vocabulary.implementationReviewBlockerTypes.includes('verification-output-missing'),
);
assert.ok(payload.vocabulary.implementationReviewBlockerTypes.includes('stale-proposal'));

assert.ok(payload.implementationReviewSchema.implementationReviewRecord.required.includes('proposalId'));
assert.ok(
  payload.implementationReviewSchema.implementationReviewRecord.required.includes(
    'verificationOutputRefs',
  ),
);
assert.ok(
  payload.implementationReviewSchema.implementationReviewRecord.required.includes(
    'thinSliceReadinessAllowed',
  ),
);
assert.ok(
  payload.implementationReviewSchema.implementationReviewFinding.required.includes(
    'blocksThinSliceReadiness',
  ),
);
assert.ok(
  payload.implementationReviewSchema.implementationReviewDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.implementationReviewSchema.implementationReviewIndex.required.includes('decisionCounts'),
);
assert.ok(
  payload.implementationReviewRules.some(
    (rule) => rule.id === 'review-requires-implementation-proposal',
  ),
);
assert.ok(
  payload.implementationReviewRules.some((rule) => rule.id === 'review-is-not-source-mutation'),
);
assert.ok(
  payload.implementationReviewRules.some(
    (rule) => rule.id === 'thin-slice-readiness-requires-review',
  ),
);
assert.ok(
  payload.implementationReviewRules.some(
    (rule) => rule.id === 'verification-output-and-rollback-proof-required',
  ),
);
assert.ok(payload.implementationReviewRules.some((rule) => rule.id === 'scope-drift-blocks-review'));

assert.equal(payload.implementationReviewState.realImplementationReviewFileAdopted, false);
assert.equal(payload.implementationReviewState.discoveredImplementationReviews, 0);
assert.equal(payload.implementationReviewState.implementationReviewMutationAllowed, false);
assert.equal(payload.implementationReviewState.thinSliceReadinessGenerationAllowed, false);
assert.equal(payload.implementationReviewState.sourceMutationAllowed, false);
assert.equal(payload.implementationReviewState.acceptedRecordMutationAllowed, false);
assert.equal(payload.implementationReviewState.rollbackExecutionAllowed, false);
assert.equal(payload.implementationReviewState.remediationExecutionAllowed, false);
assert.equal(
  payload.implementationReviewState.currentStatus,
  'contract-only-no-active-remediation-implementation-reviews',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.implementationReviewRecordTypes, 4);
assert.equal(payload.readiness.implementationProposalRequired, true);
assert.equal(payload.readiness.remediationApprovalRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.scopeDriftBlocksReview, true);
assert.equal(payload.readiness.reviewAndApprovalSeparate, true);
assert.equal(payload.readiness.implementationReviewMutationAllowed, false);
assert.equal(payload.readiness.thinSliceReadinessGenerationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForThinSliceStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-request-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
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

const typoResult = runReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-implementation-review-status');
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
  /Fifteenth Implemented Slice: `growth-remediation-implementation-review-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-implementation-review-status\.mjs/);
assert.match(plan, /verification output/);
assert.match(plan, /growth-remediation-source-mutation-request-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-implementation-review-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-request-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-implementation-review-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-request-status/);
assert.match(todo, /growth-remediation-implementation-review-status-readonly-post-m7-822/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationImplementationReviewStatus: {
        command: 'node scripts/growth-remediation-implementation-review-status.mjs',
        schemaVersion: payload.schemaVersion,
        implementationReviewRecordTypes: payload.readiness.implementationReviewRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
