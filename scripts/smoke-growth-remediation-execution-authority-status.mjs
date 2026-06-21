import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const authorityScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-execution-authority-status.mjs',
);

function runAuthorityStatus(args = []) {
  const result = spawnSync(process.execPath, [authorityScript, ...args], {
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

const result = runAuthorityStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-execution-authority-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-execution-authority-status');
assert.equal(payload.posture, 'local-read-only-remediation-execution-authority-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-execution-authority-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.thinSliceDocumented, true);
assert.equal(payload.sourceSummary.executionAuthorityDocumented, true);
assert.equal(payload.sourceSummary.implementationReviewImplemented, true);
assert.equal(payload.sourceSummary.thinSliceImplemented, true);
assert.equal(payload.sourceSummary.executionAuthorityImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsExecutionAuthority, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsExecutionAuthority, true);
assert.equal(payload.sourceSummary.ledgerMentionsExecutionAuthority, true);
assert.equal(payload.sourceSummary.verificationIncludesExecutionAuthority, true);
assert.equal(payload.sourceSummary.sourceMutationRequestNextDocumented, true);
assert.equal(payload.sourceSummary.operatorApprovalDocumented, true);
assert.equal(payload.sourceSummary.exactTargetScopeDocumented, true);
assert.equal(payload.sourceSummary.baselineSnapshotDocumented, true);
assert.equal(payload.sourceSummary.dirtyBaselineDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.mutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(payload.vocabulary.executionAuthorityStates.includes('authority-review-ready'));
assert.ok(payload.vocabulary.executionAuthorityStates.includes('authority-approved-for-preflight'));
assert.ok(payload.vocabulary.executionAuthorityStates.includes('needs-baseline-snapshot'));
assert.ok(
  payload.vocabulary.executionAuthorityDecisionTypes.includes('approve-mutation-preflight'),
);
assert.ok(
  payload.vocabulary.executionAuthorityDecisionTypes.includes('request-baseline-snapshot'),
);
assert.ok(payload.vocabulary.executionAuthorityEvidenceTypes.includes('baseline-snapshot'));
assert.ok(payload.vocabulary.executionAuthorityEvidenceTypes.includes('dirty-state-proof'));
assert.ok(payload.vocabulary.executionAuthorityEvidenceTypes.includes('task-ledger-ref'));
assert.ok(payload.vocabulary.executionAuthorityBlockerTypes.includes('dirty-baseline'));
assert.ok(payload.vocabulary.executionAuthorityBlockerTypes.includes('target-lock-missing'));
assert.ok(
  payload.vocabulary.executionAuthorityBlockerTypes.includes('authority-scope-too-broad'),
);

assert.ok(payload.executionAuthoritySchema.executionAuthorityRecord.required.includes('thinSliceId'));
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityRecord.required.includes(
    'baselineSnapshotRefs',
  ),
);
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityRecord.required.includes(
    'dirtyStateProofRefs',
  ),
);
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityRecord.required.includes(
    'mutationPreflightAllowed',
  ),
);
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityDecision.required.includes(
    'allowedNextAction',
  ),
);
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityBlocker.required.includes(
    'blocksMutationPreflight',
  ),
);
assert.ok(
  payload.executionAuthoritySchema.executionAuthorityIndex.required.includes('decisionCounts'),
);
assert.ok(
  payload.executionAuthorityRules.some(
    (rule) => rule.id === 'authority-requires-thin-slice-readiness',
  ),
);
assert.ok(
  payload.executionAuthorityRules.some((rule) => rule.id === 'authority-is-not-source-mutation'),
);
assert.ok(
  payload.executionAuthorityRules.some((rule) => rule.id === 'baseline-and-target-lock-required'),
);
assert.ok(
  payload.executionAuthorityRules.some(
    (rule) => rule.id === 'operator-approval-is-distinct-from-execution',
  ),
);
assert.ok(
  payload.executionAuthorityRules.some(
    (rule) => rule.id === 'broad-authority-and-dirty-baseline-block-preflight',
  ),
);

assert.equal(payload.executionAuthorityState.realExecutionAuthorityFileAdopted, false);
assert.equal(payload.executionAuthorityState.discoveredExecutionAuthorities, 0);
assert.equal(payload.executionAuthorityState.mutationPreflightAllowed, false);
assert.equal(payload.executionAuthorityState.sourceMutationAllowed, false);
assert.equal(payload.executionAuthorityState.acceptedRecordMutationAllowed, false);
assert.equal(payload.executionAuthorityState.rollbackExecutionAllowed, false);
assert.equal(payload.executionAuthorityState.remediationExecutionAllowed, false);
assert.equal(
  payload.executionAuthorityState.currentStatus,
  'contract-only-no-active-remediation-execution-authority',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.executionAuthorityRecordTypes, 4);
assert.equal(payload.readiness.thinSliceReadinessRequired, true);
assert.equal(payload.readiness.operatorApprovalRequired, true);
assert.equal(payload.readiness.baselineSnapshotRequired, true);
assert.equal(payload.readiness.exactTargetScopeRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.dirtyBaselineBlocksPreflight, true);
assert.equal(payload.readiness.authorityAndExecutionSeparate, true);
assert.equal(payload.readiness.mutationPreflightAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForMutationPreflightStatus, true);
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

const typoResult = runAuthorityStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-execution-authority-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Seventeenth Implemented Slice: `growth-remediation-execution-authority-status`/);
assert.match(plan, /node scripts\/growth-remediation-execution-authority-status\.mjs/);
assert.match(plan, /operator approval/);
assert.match(plan, /exact target scope/);
assert.match(plan, /baseline snapshot/);
assert.match(plan, /growth-remediation-source-mutation-request-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-execution-authority-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-request-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-execution-authority-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-request-status/);
assert.match(todo, /growth-remediation-execution-authority-status-readonly-post-m7-824/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationExecutionAuthorityStatus: {
        command: 'node scripts/growth-remediation-execution-authority-status.mjs',
        schemaVersion: payload.schemaVersion,
        executionAuthorityRecordTypes: payload.readiness.executionAuthorityRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
