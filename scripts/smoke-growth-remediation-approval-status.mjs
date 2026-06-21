import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const approvalScript = path.join(repoRoot, 'scripts', 'growth-remediation-approval-status.mjs');

function runApprovalStatus(args = []) {
  const result = spawnSync(process.execPath, [approvalScript, ...args], {
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

const result = runApprovalStatus();
assert.equal(result.status, 0, `growth-remediation-approval-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-approval-status');
assert.equal(payload.posture, 'local-read-only-remediation-approval-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-approval-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.remediationPlanDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalDocumented, true);
assert.equal(payload.sourceSummary.engineStatusImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterImplemented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopImplemented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryImplemented, true);
assert.equal(payload.sourceSummary.regressionWatchImplemented, true);
assert.equal(payload.sourceSummary.rollbackReviewImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanImplemented, true);
assert.equal(payload.sourceSummary.remediationApprovalImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsRemediationApproval, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsRemediationApproval, true);
assert.equal(payload.sourceSummary.ledgerMentionsRemediationApproval, true);
assert.equal(payload.sourceSummary.verificationIncludesRemediationApproval, true);
assert.equal(payload.sourceSummary.implementationProposalNextDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalFieldsDocumented, true);
assert.equal(payload.sourceSummary.verificationPlanDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.staleProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.implementationProposalBlocked, true);
assert.equal(payload.sourceSummary.implementationExecutionBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationBlocked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.remediationApprovalStates.includes('ready-for-operator-approval'));
assert.ok(
  payload.vocabulary.remediationApprovalStates.includes('approved-for-implementation-proposal'),
);
assert.ok(payload.vocabulary.remediationApprovalStates.includes('stale-proof-blocked'));
assert.ok(
  payload.vocabulary.remediationApprovalDecisionTypes.includes(
    'approve-implementation-proposal-draft',
  ),
);
assert.ok(payload.vocabulary.remediationApprovalDecisionTypes.includes('hold-baseline'));
assert.ok(payload.vocabulary.remediationApprovalEvidenceTypes.includes('remediation-plan-record'));
assert.ok(payload.vocabulary.remediationApprovalEvidenceTypes.includes('rollback-proof'));
assert.ok(payload.vocabulary.remediationApprovalEvidenceTypes.includes('operator-approval'));
assert.ok(payload.vocabulary.remediationApprovalBlockerTypes.includes('missing-rollback-proof'));
assert.ok(
  payload.vocabulary.remediationApprovalBlockerTypes.includes('stale-aggregate-verification'),
);
assert.ok(payload.vocabulary.remediationApprovalBlockerTypes.includes('source-of-truth-drift'));

assert.ok(payload.remediationApprovalSchema.remediationApprovalRecord.required.includes('planId'));
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalRecord.required.includes(
    'verificationPlanRefs',
  ),
);
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalRecord.required.includes(
    'rollbackProofRefs',
  ),
);
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalRecord.required.includes(
    'implementationProposalAllowed',
  ),
);
assert.ok(payload.remediationApprovalSchema.remediationApprovalRecord.required.includes('executionAllowed'));
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalBlocker.required.includes(
    'blocksImplementationProposal',
  ),
);
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.remediationApprovalSchema.remediationApprovalIndex.required.includes('blockerCounts'),
);
assert.ok(payload.remediationApprovalRules.some((rule) => rule.id === 'approval-requires-remediation-plan'));
assert.ok(payload.remediationApprovalRules.some((rule) => rule.id === 'approval-is-not-execution'));
assert.ok(
  payload.remediationApprovalRules.some(
    (rule) => rule.id === 'implementation-proposal-requires-approval',
  ),
);
assert.ok(
  payload.remediationApprovalRules.some(
    (rule) => rule.id === 'stale-or-negative-proof-blocks-approval',
  ),
);

assert.equal(payload.remediationApprovalState.realRemediationApprovalFileAdopted, false);
assert.equal(payload.remediationApprovalState.discoveredRemediationApprovals, 0);
assert.equal(payload.remediationApprovalState.remediationApprovalMutationAllowed, false);
assert.equal(payload.remediationApprovalState.implementationProposalGenerationAllowed, false);
assert.equal(payload.remediationApprovalState.sourceMutationAllowed, false);
assert.equal(payload.remediationApprovalState.acceptedRecordMutationAllowed, false);
assert.equal(payload.remediationApprovalState.rollbackExecutionAllowed, false);
assert.equal(payload.remediationApprovalState.remediationExecutionAllowed, false);
assert.equal(
  payload.remediationApprovalState.currentStatus,
  'contract-only-no-active-remediation-approval-records',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.remediationApprovalRecordTypes, 4);
assert.equal(payload.readiness.remediationPlanRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.verificationPlanRequired, true);
assert.equal(payload.readiness.staleProofBlocksApproval, true);
assert.equal(payload.readiness.reviewAndApprovalSeparate, true);
assert.equal(payload.readiness.remediationApprovalMutationAllowed, false);
assert.equal(payload.readiness.implementationProposalGenerationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForImplementationProposalStatus, true);
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

const typoResult = runApprovalStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-approval-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Thirteenth Implemented Slice: `growth-remediation-approval-status`/);
assert.match(plan, /node scripts\/growth-remediation-approval-status\.mjs/);
assert.match(plan, /remediation approval fields/);
assert.match(plan, /growth-remediation-implementation-proposal-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-approval-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-implementation-proposal-status/);
assert.match(completionReadiness, /node scripts\/growth-remediation-approval-status\.mjs/);
assert.match(completionReadiness, /growth-remediation-implementation-proposal-status/);
assert.match(todo, /growth-remediation-approval-status-readonly-post-m7-820/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationApprovalStatus: {
        command: 'node scripts/growth-remediation-approval-status.mjs',
        schemaVersion: payload.schemaVersion,
        remediationApprovalRecordTypes: payload.readiness.remediationApprovalRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
