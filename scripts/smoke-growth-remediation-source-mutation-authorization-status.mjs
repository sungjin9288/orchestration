import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const authorizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-authorization-status.mjs',
);

function runAuthorizationStatus(args = []) {
  const result = spawnSync(process.execPath, [authorizationScript, ...args], {
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

const result = runAuthorizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-authorization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-authorization-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-authorization-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-authorization-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationRequestDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.mutationPreflightImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationRequestImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationAuthorization, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationAuthorization, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationAuthorization, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationAuthorization, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightNextDocumented, true);
assert.equal(payload.sourceSummary.currentRequestDocumented, true);
assert.equal(payload.sourceSummary.operatorApprovalDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.expectedChangeSetDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandSetDocumented, true);
assert.equal(payload.sourceSummary.restorePlanDocumented, true);
assert.equal(payload.sourceSummary.rollbackPlanDocumented, true);
assert.equal(payload.sourceSummary.applicationPreflightDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationAuthorizationStates.includes('authorization-review-ready'),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationStates.includes(
    'authorization-ready-for-application-preflight',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationStates.includes('needs-operator-approval'),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationDecisionTypes.includes(
    'approve-source-mutation-application-preflight-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationDecisionTypes.includes(
    'request-verification-command-set',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationEvidenceTypes.includes(
    'source-mutation-request-record',
  ),
);
assert.ok(payload.vocabulary.sourceMutationAuthorizationEvidenceTypes.includes('operator-approval'));
assert.ok(payload.vocabulary.sourceMutationAuthorizationEvidenceTypes.includes('expected-change-set'));
assert.ok(payload.vocabulary.sourceMutationAuthorizationEvidenceTypes.includes('verification-command-set'));
assert.ok(payload.vocabulary.sourceMutationAuthorizationBlockerTypes.includes('request-stale'));
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationBlockerTypes.includes('operator-approval-missing'),
);
assert.ok(
  payload.vocabulary.sourceMutationAuthorizationBlockerTypes.includes(
    'authorization-scope-too-broad',
  ),
);

assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationRecord.required.includes(
    'authorizationId',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationRecord.required.includes(
    'operatorApprovalRefs',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationRecord.required.includes(
    'applicationPreflightAllowed',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationBlocker.required.includes(
    'blocksApplicationPreflight',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationSchema.sourceMutationAuthorizationIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationRules.some(
    (rule) => rule.id === 'authorization-requires-current-source-mutation-request',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationRules.some(
    (rule) => rule.id === 'authorization-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationRules.some(
    (rule) => rule.id === 'authorization-requires-operator-approval-and-clean-baseline',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationRules.some(
    (rule) => rule.id === 'authorization-requires-change-verification-and-rollback-lock',
  ),
);
assert.ok(
  payload.sourceMutationAuthorizationRules.some(
    (rule) => rule.id === 'dirty-stale-or-broad-authorization-blocks-application-preflight',
  ),
);

assert.equal(payload.sourceMutationAuthorizationState.realSourceMutationAuthorizationFileAdopted, false);
assert.equal(payload.sourceMutationAuthorizationState.discoveredSourceMutationAuthorizations, 0);
assert.equal(payload.sourceMutationAuthorizationState.applicationPreflightAllowed, false);
assert.equal(payload.sourceMutationAuthorizationState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationAuthorizationState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationAuthorizationState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationAuthorizationState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationAuthorizationState.currentStatus,
  'contract-only-no-active-source-mutation-authorization',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationAuthorizationRecordTypes, 4);
assert.equal(payload.readiness.currentRequestRequired, true);
assert.equal(payload.readiness.operatorApprovalRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.expectedChangeSetRequired, true);
assert.equal(payload.readiness.verificationCommandSetRequired, true);
assert.equal(payload.readiness.restorePlanRequired, true);
assert.equal(payload.readiness.rollbackPlanRequired, true);
assert.equal(payload.readiness.authorizationAndMutationSeparate, true);
assert.equal(payload.readiness.applicationPreflightAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplicationPreflightStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-application-preflight-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
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

const typoResult = runAuthorizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-authorization-status');
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
  /Twentieth Implemented Slice: `growth-remediation-source-mutation-authorization-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-source-mutation-authorization-status\.mjs/);
assert.match(plan, /operator approval/);
assert.match(plan, /application preflight/);
assert.match(plan, /growth-remediation-source-mutation-application-preflight-status/);
assert.match(
  harnessBaseline,
  /node scripts\/growth-remediation-source-mutation-authorization-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-application-preflight-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-authorization-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-application-preflight-status/);
assert.match(todo, /growth-remediation-source-mutation-authorization-status-readonly-post-m7-827/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationAuthorizationStatus: {
        command: 'node scripts/growth-remediation-source-mutation-authorization-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationAuthorizationRecordTypes:
          payload.readiness.sourceMutationAuthorizationRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
