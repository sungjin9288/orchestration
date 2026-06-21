import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const preflightScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-mutation-preflight-status.mjs',
);

function runPreflightStatus(args = []) {
  const result = spawnSync(process.execPath, [preflightScript, ...args], {
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

const result = runPreflightStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-mutation-preflight-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-mutation-preflight-status');
assert.equal(payload.posture, 'local-read-only-remediation-mutation-preflight-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-mutation-preflight-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.executionAuthorityDocumented, true);
assert.equal(payload.sourceSummary.mutationPreflightDocumented, true);
assert.equal(payload.sourceSummary.thinSliceImplemented, true);
assert.equal(payload.sourceSummary.executionAuthorityImplemented, true);
assert.equal(payload.sourceSummary.mutationPreflightImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsMutationPreflight, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsMutationPreflight, true);
assert.equal(payload.sourceSummary.ledgerMentionsMutationPreflight, true);
assert.equal(payload.sourceSummary.verificationIncludesMutationPreflight, true);
assert.equal(payload.sourceSummary.sourceMutationRequestNextDocumented, true);
assert.equal(payload.sourceSummary.currentAuthorityDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.dirtyUntrackedProofDocumented, true);
assert.equal(payload.sourceSummary.restorePlanDocumented, true);
assert.equal(payload.sourceSummary.verificationPrecheckDocumented, true);
assert.equal(payload.sourceSummary.rollbackPlanDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.mutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(payload.vocabulary.mutationPreflightStates.includes('preflight-review-ready'));
assert.ok(
  payload.vocabulary.mutationPreflightStates.includes(
    'preflight-ready-for-source-mutation-request',
  ),
);
assert.ok(payload.vocabulary.mutationPreflightStates.includes('needs-clean-baseline'));
assert.ok(
  payload.vocabulary.mutationPreflightDecisionTypes.includes(
    'approve-source-mutation-request-readiness',
  ),
);
assert.ok(
  payload.vocabulary.mutationPreflightDecisionTypes.includes('request-verification-precheck'),
);
assert.ok(payload.vocabulary.mutationPreflightEvidenceTypes.includes('baseline-digest'));
assert.ok(payload.vocabulary.mutationPreflightEvidenceTypes.includes('target-lock'));
assert.ok(payload.vocabulary.mutationPreflightEvidenceTypes.includes('restore-plan'));
assert.ok(payload.vocabulary.mutationPreflightEvidenceTypes.includes('rollback-plan'));
assert.ok(payload.vocabulary.mutationPreflightBlockerTypes.includes('dirty-baseline'));
assert.ok(payload.vocabulary.mutationPreflightBlockerTypes.includes('untracked-baseline'));
assert.ok(payload.vocabulary.mutationPreflightBlockerTypes.includes('target-lock-drift'));

assert.ok(payload.mutationPreflightSchema.mutationPreflightRecord.required.includes('authorityId'));
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightRecord.required.includes(
    'baselineDigestRefs',
  ),
);
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightRecord.required.includes('targetLockRefs'),
);
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightRecord.required.includes('restorePlanRefs'),
);
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightRecord.required.includes(
    'sourceMutationRequestAllowed',
  ),
);
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.mutationPreflightSchema.mutationPreflightBlocker.required.includes(
    'blocksSourceMutationRequest',
  ),
);
assert.ok(payload.mutationPreflightSchema.mutationPreflightIndex.required.includes('stateCounts'));
assert.ok(
  payload.mutationPreflightRules.some(
    (rule) => rule.id === 'preflight-requires-current-execution-authority',
  ),
);
assert.ok(
  payload.mutationPreflightRules.some((rule) => rule.id === 'preflight-is-not-source-mutation'),
);
assert.ok(
  payload.mutationPreflightRules.some(
    (rule) => rule.id === 'baseline-digest-and-target-lock-required',
  ),
);
assert.ok(
  payload.mutationPreflightRules.some((rule) => rule.id === 'restore-and-rollback-proof-required'),
);
assert.ok(
  payload.mutationPreflightRules.some(
    (rule) => rule.id === 'dirty-or-broad-preflight-blocks-source-mutation-request',
  ),
);

assert.equal(payload.mutationPreflightState.realMutationPreflightFileAdopted, false);
assert.equal(payload.mutationPreflightState.discoveredMutationPreflights, 0);
assert.equal(payload.mutationPreflightState.sourceMutationRequestAllowed, false);
assert.equal(payload.mutationPreflightState.sourceMutationAllowed, false);
assert.equal(payload.mutationPreflightState.acceptedRecordMutationAllowed, false);
assert.equal(payload.mutationPreflightState.rollbackExecutionAllowed, false);
assert.equal(payload.mutationPreflightState.remediationExecutionAllowed, false);
assert.equal(
  payload.mutationPreflightState.currentStatus,
  'contract-only-no-active-remediation-mutation-preflight',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.mutationPreflightRecordTypes, 4);
assert.equal(payload.readiness.currentAuthorityRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.restorePlanRequired, true);
assert.equal(payload.readiness.verificationPrecheckRequired, true);
assert.equal(payload.readiness.rollbackPlanRequired, true);
assert.equal(payload.readiness.preflightAndMutationSeparate, true);
assert.equal(payload.readiness.sourceMutationRequestAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationRequestStatus, true);
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

const typoResult = runPreflightStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-mutation-preflight-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Eighteenth Implemented Slice: `growth-remediation-mutation-preflight-status`/);
assert.match(plan, /node scripts\/growth-remediation-mutation-preflight-status\.mjs/);
assert.match(plan, /baseline digest/);
assert.match(plan, /target lock/);
assert.match(plan, /restore plan/);
assert.match(plan, /growth-remediation-source-mutation-request-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-mutation-preflight-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-request-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-mutation-preflight-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-request-status/);
assert.match(todo, /growth-remediation-mutation-preflight-status-readonly-post-m7-825/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationMutationPreflightStatus: {
        command: 'node scripts/growth-remediation-mutation-preflight-status.mjs',
        schemaVersion: payload.schemaVersion,
        mutationPreflightRecordTypes: payload.readiness.mutationPreflightRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
