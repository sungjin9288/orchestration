import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const registryScript = path.join(
  repoRoot,
  'scripts',
  'growth-accepted-improvement-registry-status.mjs',
);

function runRegistryStatus(args = []) {
  const result = spawnSync(process.execPath, [registryScript, ...args], {
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

const result = runRegistryStatus();
assert.equal(
  result.status,
  0,
  `growth-accepted-improvement-registry-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-accepted-improvement-registry-status');
assert.equal(payload.posture, 'local-read-only-accepted-improvement-registry-contract');
assert.equal(payload.schemaVersion, 'growth-accepted-improvement-registry-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.improvementAcceptanceDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryDocumented, true);
assert.equal(payload.sourceSummary.engineStatusImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterImplemented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopImplemented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceImplemented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsAcceptedRegistry, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsAcceptedRegistry, true);
assert.equal(payload.sourceSummary.ledgerMentionsAcceptedRegistry, true);
assert.equal(payload.sourceSummary.verificationIncludesAcceptedRegistry, true);
assert.equal(payload.sourceSummary.regressionWatchNextDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusScriptPresent, true);
assert.equal(payload.sourceSummary.regressionWatchStatusDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusImplemented, true);
assert.equal(payload.sourceSummary.rollbackReviewNextDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusScriptPresent, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusScriptPresent, true);
assert.equal(payload.sourceSummary.remediationPlanStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanNextDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.sourceSummary.beforeAfterEvidenceDocumented, true);
assert.equal(payload.sourceSummary.rollbackOrRejectionDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthLinked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.registryRecordStates.includes('accepted'));
assert.ok(payload.vocabulary.registryRecordStates.includes('rejected'));
assert.ok(payload.vocabulary.registryRecordStates.includes('rolled-back'));
assert.ok(payload.vocabulary.registryRecordStates.includes('superseded'));
assert.ok(payload.vocabulary.registryEvidenceTypes.includes('acceptance-record'));
assert.ok(payload.vocabulary.registryEvidenceTypes.includes('before-evidence'));
assert.ok(payload.vocabulary.registryEvidenceTypes.includes('after-evidence'));
assert.ok(payload.vocabulary.registryEvidenceTypes.includes('rollback-proof'));
assert.ok(payload.vocabulary.registryEvidenceTypes.includes('rejection-proof'));
assert.ok(payload.vocabulary.registryScopes.includes('skill-memory'));
assert.ok(payload.vocabulary.registryScopes.includes('gateway-routing'));
assert.ok(payload.vocabulary.registryDecisionTypes.includes('record-accepted'));
assert.ok(payload.vocabulary.registryDecisionTypes.includes('record-rollback'));
assert.ok(payload.vocabulary.registryDecisionTypes.includes('hold-baseline'));

assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('acceptanceRef'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('proposalRef'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('beforeEvidenceRefs'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('afterEvidenceRefs'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('regressionCheckRefs'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('verificationRefs'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('sourceOfTruthRefs'));
assert.ok(payload.registrySchema.acceptedImprovementRecord.required.includes('recordAllowed'));
assert.ok(payload.registrySchema.registryIndex.required.includes('stateCounts'));
assert.ok(payload.registrySchema.rollbackRecord.required.includes('rollbackProofRefs'));
assert.ok(payload.registrySchema.rollbackRecord.required.includes('allowedNextAction'));
assert.ok(payload.registrySchema.rejectionRecord.required.includes('blockingRegressionRefs'));
assert.ok(payload.registrySchema.rejectionRecord.required.includes('negativeEvidenceRefs'));
assert.ok(payload.registryRules.some((rule) => rule.id === 'accepted-record-requires-proof-chain'));
assert.ok(payload.registryRules.some((rule) => rule.id === 'negative-outcomes-remain-visible'));
assert.ok(payload.registryRules.some((rule) => rule.id === 'registry-does-not-apply-proposals'));

assert.equal(payload.registryState.realRegistryFileAdopted, false);
assert.equal(payload.registryState.discoveredAcceptedRecords, 0);
assert.equal(payload.registryState.registryMutationAllowed, false);
assert.equal(payload.registryState.durableAcceptanceStorageAllowed, false);
assert.equal(payload.registryState.currentStatus, 'contract-only-no-durable-registry');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.registryRecordTypes, 4);
assert.equal(payload.readiness.acceptedRecordsRequireAcceptanceProof, true);
assert.equal(payload.readiness.rejectionAndRollbackVisible, true);
assert.equal(payload.readiness.registryApplicationAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForRegressionWatchStatus, true);
assert.equal(payload.readiness.regressionWatchStatusImplemented, true);
assert.equal(payload.readiness.readyForRollbackReviewStatus, true);
assert.equal(payload.readiness.rollbackReviewStatusImplemented, true);
assert.equal(payload.readiness.readyForRemediationPlanStatus, true);
assert.equal(payload.readiness.remediationPlanStatusImplemented, true);
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
assert.equal(payload.safetyBoundary.doesNotRecordDurableAcceptance, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runRegistryStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-accepted-improvement-registry-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Ninth Implemented Slice: `growth-accepted-improvement-registry-status`/);
assert.match(plan, /node scripts\/growth-accepted-improvement-registry-status\.mjs/);
assert.match(plan, /accepted, rejected, deferred, blocked, rolled-back, or superseded/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-accepted-improvement-registry-status\.mjs/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-accepted-improvement-registry-status\.mjs/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-accepted-improvement-registry-status-readonly-post-m7-816/);
assert.match(todo, /growth-regression-watch-status-readonly-post-m7-817/);
assert.match(todo, /growth-rollback-review-status-readonly-post-m7-818/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthAcceptedImprovementRegistryStatus: {
        command: 'node scripts/growth-accepted-improvement-registry-status.mjs',
        schemaVersion: payload.schemaVersion,
        registryRecordTypes: payload.readiness.registryRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
