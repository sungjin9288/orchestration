import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const applyPreflightScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-apply-preflight-status.mjs',
);

function runApplyPreflightStatus(args = []) {
  const result = spawnSync(process.execPath, [applyPreflightScript, ...args], {
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

const result = runApplyPreflightStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-apply-preflight-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-apply-preflight-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-apply-preflight-contract',
);
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-apply-preflight-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplyAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyPreflightDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyAuthorizationImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplyPreflightImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationApplyPreflight, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationApplyPreflight, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationApplyPreflight, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationApplyPreflight, true);
assert.equal(
  payload.sourceSummary.sourceMutationApplyExecutionReadinessNextDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentApplyAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.passedDraftReviewDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.cleanBaselineProofDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandSetDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.applyPreflightSeparateFromMutation, true);
assert.equal(payload.sourceSummary.applyExecutionReadinessStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightStates.includes(
    'source-mutation-apply-preflight-ready-for-apply-execution-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightStates.includes(
    'needs-current-apply-authorization',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightStates.includes('needs-clean-baseline-proof'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightDecisionTypes.includes(
    'approve-source-mutation-apply-execution-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightDecisionTypes.includes(
    'request-current-apply-authorization',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes(
    'source-mutation-apply-authorization-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes('clean-baseline-proof'),
);
assert.ok(payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes('patch-draft'));
assert.ok(payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes('diff-preview'));
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes(
    'verification-output',
  ),
);
assert.ok(payload.vocabulary.sourceMutationApplyPreflightEvidenceTypes.includes('rollback-proof'));
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightBlockerTypes.includes(
    'apply-authorization-stale',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightBlockerTypes.includes('dirty-baseline'),
);
assert.ok(
  payload.vocabulary.sourceMutationApplyPreflightBlockerTypes.includes(
    'apply-preflight-attempts-source-mutation',
  ),
);

assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightRecord.required.includes(
    'applyPreflightId',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightRecord.required.includes(
    'applyAuthorizationId',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightRecord.required.includes(
    'cleanBaselineProofRefs',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightRecord.required.includes(
    'applyExecutionReadinessAllowed',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightBlocker.required.includes(
    'blocksApplyExecutionReadiness',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightSchema.sourceMutationApplyPreflightIndex.required.includes(
    'stateCounts',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightRules.some(
    (rule) => rule.id === 'apply-preflight-requires-current-apply-authorization',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightRules.some(
    (rule) => rule.id === 'apply-preflight-is-not-source-mutation',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightRules.some(
    (rule) => rule.id === 'apply-preflight-requires-clean-baseline-and-exact-scope',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightRules.some(
    (rule) =>
      rule.id === 'apply-preflight-requires-verification-dry-run-and-rollback-proof',
  ),
);
assert.ok(
  payload.sourceMutationApplyPreflightRules.some(
    (rule) =>
      rule.id ===
      'failed-stale-broad-dirty-or-mutating-preflight-blocks-apply-execution-readiness',
  ),
);

assert.equal(payload.sourceMutationApplyPreflightState.realSourceMutationApplyPreflightFileAdopted, false);
assert.equal(payload.sourceMutationApplyPreflightState.discoveredSourceMutationApplyPreflights, 0);
assert.equal(payload.sourceMutationApplyPreflightState.applyExecutionReadinessAllowed, false);
assert.equal(payload.sourceMutationApplyPreflightState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationApplyPreflightState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationApplyPreflightState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationApplyPreflightState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationApplyPreflightState.currentStatus,
  'contract-only-no-active-source-mutation-apply-preflight',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationApplyPreflightRecordTypes, 4);
assert.equal(payload.readiness.currentApplyAuthorizationRequired, true);
assert.equal(payload.readiness.passedDraftReviewRequired, true);
assert.equal(payload.readiness.exactScopeLockRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.verificationCommandSetRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.dryRunProofRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.negativeEvidenceClearanceRequired, true);
assert.equal(payload.readiness.applyPreflightAndMutationSeparate, true);
assert.equal(payload.readiness.applyExecutionReadinessAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationApplyExecutionReadinessStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-apply-execution-readiness-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
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

const typoResult = runApplyPreflightStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-apply-preflight-status');
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
  /Twenty-fifth Implemented Slice: `growth-remediation-source-mutation-apply-preflight-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-source-mutation-apply-preflight-status\.mjs/);
assert.match(plan, /current apply authorization record/);
assert.match(plan, /clean baseline proof/);
assert.match(plan, /growth-remediation-source-mutation-apply-execution-readiness-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-source-mutation-apply-preflight-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-apply-execution-readiness-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-source-mutation-apply-preflight-status\.mjs/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-apply-execution-readiness-status/,
);
assert.match(todo, /growth-remediation-source-mutation-apply-preflight-status-readonly-post-m7-832/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationApplyPreflightStatus: {
        command: 'node scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationApplyPreflightRecordTypes:
          payload.readiness.sourceMutationApplyPreflightRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
