import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const planScript = path.join(repoRoot, 'scripts', 'growth-remediation-plan-status.mjs');

function runPlanStatus(args = []) {
  const result = spawnSync(process.execPath, [planScript, ...args], {
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

const result = runPlanStatus();
assert.equal(result.status, 0, `growth-remediation-plan-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-plan-status');
assert.equal(payload.posture, 'local-read-only-remediation-plan-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-plan-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.rollbackReviewDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanDocumented, true);
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
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsRemediationPlan, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsRemediationPlan, true);
assert.equal(payload.sourceSummary.ledgerMentionsRemediationPlan, true);
assert.equal(payload.sourceSummary.verificationIncludesRemediationPlan, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewDecisionDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanFieldsDocumented, true);
assert.equal(payload.sourceSummary.verificationPlanDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.implementationExecutionBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationBlocked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.remediationPlanTriggerTypes.includes('rollback-review-recommended'));
assert.ok(payload.vocabulary.remediationPlanTriggerTypes.includes('negative-evidence-confirmed'));
assert.ok(payload.vocabulary.remediationPlanTriggerTypes.includes('operator-request'));
assert.ok(payload.vocabulary.remediationPlanStates.includes('draft-ready'));
assert.ok(payload.vocabulary.remediationPlanStates.includes('approval-needed'));
assert.ok(payload.vocabulary.remediationPlanStates.includes('approved-for-thin-slice'));
assert.ok(payload.vocabulary.remediationScopeTypes.includes('docs-only'));
assert.ok(payload.vocabulary.remediationScopeTypes.includes('runtime-guard-only'));
assert.ok(payload.vocabulary.remediationScopeTypes.includes('rollback-proof'));
assert.ok(payload.vocabulary.remediationPlanEvidenceTypes.includes('rollback-review-record'));
assert.ok(payload.vocabulary.remediationPlanEvidenceTypes.includes('verification-plan'));
assert.ok(payload.vocabulary.remediationPlanEvidenceTypes.includes('source-of-truth-doc'));
assert.ok(payload.vocabulary.remediationPlanDecisionTypes.includes('draft-thin-slice'));
assert.ok(payload.vocabulary.remediationPlanDecisionTypes.includes('approve-plan-for-implementation-review'));

assert.ok(payload.remediationPlanSchema.remediationPlanRecord.required.includes('reviewId'));
assert.ok(payload.remediationPlanSchema.remediationPlanRecord.required.includes('rollbackReviewRef'));
assert.ok(payload.remediationPlanSchema.remediationPlanRecord.required.includes('verificationPlanRefs'));
assert.ok(payload.remediationPlanSchema.remediationPlanRecord.required.includes('rollbackProofRefs'));
assert.ok(payload.remediationPlanSchema.remediationPlanRecord.required.includes('implementationProposalAllowed'));
assert.ok(payload.remediationPlanSchema.remediationPlanStep.required.includes('rollbackProofRequired'));
assert.ok(payload.remediationPlanSchema.remediationPlanStep.required.includes('executionAllowed'));
assert.ok(payload.remediationPlanSchema.remediationApprovalGate.required.includes('requiredEvidenceRefs'));
assert.ok(payload.remediationPlanSchema.remediationApprovalGate.required.includes('executionAllowed'));
assert.ok(payload.remediationPlanSchema.remediationPlanIndex.required.includes('scopeCounts'));
assert.ok(payload.remediationPlanRules.some((rule) => rule.id === 'plan-requires-rollback-review'));
assert.ok(payload.remediationPlanRules.some((rule) => rule.id === 'planning-is-not-execution'));
assert.ok(payload.remediationPlanRules.some((rule) => rule.id === 'implementation-requires-explicit-thin-slice'));
assert.ok(payload.remediationPlanRules.some((rule) => rule.id === 'approval-remains-separate'));

assert.equal(payload.remediationPlanState.realRemediationPlanFileAdopted, false);
assert.equal(payload.remediationPlanState.discoveredRemediationPlans, 0);
assert.equal(payload.remediationPlanState.remediationPlanMutationAllowed, false);
assert.equal(payload.remediationPlanState.implementationProposalGenerationAllowed, false);
assert.equal(payload.remediationPlanState.acceptedRecordMutationAllowed, false);
assert.equal(payload.remediationPlanState.sourceMutationAllowed, false);
assert.equal(payload.remediationPlanState.rollbackExecutionAllowed, false);
assert.equal(payload.remediationPlanState.remediationExecutionAllowed, false);
assert.equal(payload.remediationPlanState.currentStatus, 'contract-only-no-active-remediation-plan-records');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.remediationPlanRecordTypes, 4);
assert.equal(payload.readiness.rollbackReviewRequired, true);
assert.equal(payload.readiness.verificationPlanRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.reviewAndApprovalSeparate, true);
assert.equal(payload.readiness.implementationProposalGenerationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForRemediationApprovalStatus, true);
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

const typoResult = runPlanStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-plan-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Twelfth Implemented Slice: `growth-remediation-plan-status`/);
assert.match(plan, /node scripts\/growth-remediation-plan-status\.mjs/);
assert.match(plan, /remediation plan fields/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-plan-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-remediation-plan-status\.mjs/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationPlanStatus: {
        command: 'node scripts/growth-remediation-plan-status.mjs',
        schemaVersion: payload.schemaVersion,
        remediationPlanRecordTypes: payload.readiness.remediationPlanRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
