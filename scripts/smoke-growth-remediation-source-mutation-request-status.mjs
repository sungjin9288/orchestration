import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const requestScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-request-status.mjs',
);

function runRequestStatus(args = []) {
  const result = spawnSync(process.execPath, [requestScript, ...args], {
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

const result = runRequestStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-request-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.posture, 'local-read-only-remediation-source-mutation-request-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-request-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.mutationPreflightDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationRequestDocumented, true);
assert.equal(payload.sourceSummary.executionAuthorityImplemented, true);
assert.equal(payload.sourceSummary.mutationPreflightImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationRequestImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationRequest, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationRequest, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationRequest, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationRequest, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationNextDocumented, true);
assert.equal(payload.sourceSummary.currentPreflightDocumented, true);
assert.equal(payload.sourceSummary.operatorIntentDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.restorePlanDocumented, true);
assert.equal(payload.sourceSummary.expectedChangeSetDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandSetDocumented, true);
assert.equal(payload.sourceSummary.rollbackPlanDocumented, true);
assert.equal(payload.sourceSummary.requestReviewDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(payload.vocabulary.sourceMutationRequestStates.includes('request-review-ready'));
assert.ok(
  payload.vocabulary.sourceMutationRequestStates.includes(
    'request-ready-for-authorization-review',
  ),
);
assert.ok(payload.vocabulary.sourceMutationRequestStates.includes('needs-expected-change-set'));
assert.ok(
  payload.vocabulary.sourceMutationRequestDecisionTypes.includes(
    'approve-source-mutation-request-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationRequestDecisionTypes.includes(
    'request-verification-command-set',
  ),
);
assert.ok(payload.vocabulary.sourceMutationRequestEvidenceTypes.includes('mutation-preflight-record'));
assert.ok(payload.vocabulary.sourceMutationRequestEvidenceTypes.includes('operator-intent'));
assert.ok(payload.vocabulary.sourceMutationRequestEvidenceTypes.includes('expected-change-set'));
assert.ok(payload.vocabulary.sourceMutationRequestEvidenceTypes.includes('verification-command-set'));
assert.ok(payload.vocabulary.sourceMutationRequestBlockerTypes.includes('preflight-stale'));
assert.ok(payload.vocabulary.sourceMutationRequestBlockerTypes.includes('target-lock-drift'));
assert.ok(payload.vocabulary.sourceMutationRequestBlockerTypes.includes('request-scope-too-broad'));

assert.ok(payload.sourceMutationRequestSchema.sourceMutationRequestRecord.required.includes('preflightId'));
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestRecord.required.includes(
    'operatorIntentRefs',
  ),
);
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestRecord.required.includes(
    'expectedChangeSetRefs',
  ),
);
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestRecord.required.includes(
    'verificationCommandSetRefs',
  ),
);
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestDecision.required.includes(
    'authorizationReviewAllowed',
  ),
);
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestBlocker.required.includes(
    'blocksAuthorizationReview',
  ),
);
assert.ok(
  payload.sourceMutationRequestSchema.sourceMutationRequestIndex.required.includes('stateCounts'),
);
assert.ok(
  payload.sourceMutationRequestRules.some(
    (rule) => rule.id === 'request-requires-current-mutation-preflight',
  ),
);
assert.ok(
  payload.sourceMutationRequestRules.some((rule) => rule.id === 'request-is-not-source-mutation'),
);
assert.ok(
  payload.sourceMutationRequestRules.some(
    (rule) => rule.id === 'request-requires-operator-intent-and-target-lock',
  ),
);
assert.ok(
  payload.sourceMutationRequestRules.some(
    (rule) => rule.id === 'request-requires-change-and-verification-contract',
  ),
);
assert.ok(
  payload.sourceMutationRequestRules.some(
    (rule) => rule.id === 'dirty-stale-or-broad-request-blocks-authorization-review',
  ),
);

assert.equal(payload.sourceMutationRequestState.realSourceMutationRequestFileAdopted, false);
assert.equal(payload.sourceMutationRequestState.discoveredSourceMutationRequests, 0);
assert.equal(payload.sourceMutationRequestState.authorizationReviewAllowed, false);
assert.equal(payload.sourceMutationRequestState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationRequestState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationRequestState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationRequestState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationRequestState.currentStatus,
  'contract-only-no-active-source-mutation-request',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationRequestRecordTypes, 4);
assert.equal(payload.readiness.currentPreflightRequired, true);
assert.equal(payload.readiness.operatorIntentRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.restorePlanRequired, true);
assert.equal(payload.readiness.expectedChangeSetRequired, true);
assert.equal(payload.readiness.verificationCommandSetRequired, true);
assert.equal(payload.readiness.rollbackPlanRequired, true);
assert.equal(payload.readiness.requestAndMutationSeparate, true);
assert.equal(payload.readiness.authorizationReviewAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationAuthorizationStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-authorization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-authorization-status.mjs',
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

const typoResult = runRequestStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-request-status');
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
  /Nineteenth Implemented Slice: `growth-remediation-source-mutation-request-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-source-mutation-request-status\.mjs/);
assert.match(plan, /operator intent/);
assert.match(plan, /expected changed-file set/);
assert.match(plan, /verification command set/);
assert.match(plan, /growth-remediation-source-mutation-authorization-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-source-mutation-request-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-authorization-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-request-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-authorization-status/);
assert.match(todo, /growth-remediation-source-mutation-request-status-readonly-post-m7-826/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationRequestStatus: {
        command: 'node scripts/growth-remediation-source-mutation-request-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationRequestRecordTypes: payload.readiness.sourceMutationRequestRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
