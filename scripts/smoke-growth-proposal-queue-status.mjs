import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const queueScript = path.join(repoRoot, 'scripts', 'growth-proposal-queue-status.mjs');

function runQueueStatus(args = []) {
  const result = spawnSync(process.execPath, [queueScript, ...args], {
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

const result = runQueueStatus();
assert.equal(result.status, 0, `growth-proposal-queue-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-proposal-queue-status');
assert.equal(payload.posture, 'local-read-only-proposal-queue-contract');
assert.equal(payload.schemaVersion, 'growth-proposal-queue-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.proposalQueueDocumented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsProposalQueue, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsProposalQueue, true);
assert.equal(payload.sourceSummary.ledgerMentionsProposalQueue, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryStatusScriptPresent, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryStatusDocumented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterStatusScriptPresent, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterStatusDocumented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopStatusScriptPresent, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopStatusDocumented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusScriptPresent, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusScriptPresent, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchNextDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusScriptPresent, true);
assert.equal(payload.sourceSummary.regressionWatchStatusDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewNextDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusScriptPresent, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanNextDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusScriptPresent, true);
assert.equal(payload.sourceSummary.remediationPlanStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);

assert.ok(payload.vocabulary.proposalTypes.includes('documentation'));
assert.ok(payload.vocabulary.proposalTypes.includes('runtime-contract'));
assert.ok(payload.vocabulary.proposalTypes.includes('skill-memory'));
assert.ok(payload.vocabulary.proposalStatuses.includes('ready-for-review'));
assert.ok(payload.vocabulary.proposalStatuses.includes('waiting-approval'));
assert.ok(payload.vocabulary.riskClasses.includes('runtime-sensitive'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('reflection-finding'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('worker-event'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('negative-evidence'));
assert.ok(payload.proposalSchema.proposalRecord.required.includes('proposalId'));
assert.ok(payload.proposalSchema.proposalRecord.required.includes('evidenceRefs'));
assert.ok(payload.proposalSchema.proposalRecord.required.includes('approvalGate'));
assert.ok(payload.proposalSchema.proposalRecord.required.includes('verificationPlan'));
assert.ok(payload.proposalSchema.proposalRecord.required.includes('applyAllowed'));
assert.ok(payload.proposalSchema.verificationPlan.required.includes('failureStopCondition'));
assert.ok(payload.queueRules.some((rule) => rule.id === 'proposal-must-not-apply-itself'));
assert.ok(payload.queueRules.some((rule) => rule.id === 'explicit-approval-before-implementation'));
assert.ok(payload.candidateTemplates.some((template) => template.id === 'skill-memory-promotion-review'));
assert.equal(payload.queueState.realQueueFileAdopted, false);
assert.equal(payload.queueState.discoveredProposalRecords, 0);
assert.equal(payload.queueState.queueMutationAllowed, false);
assert.equal(payload.queueState.implementationFromQueueAllowed, false);
assert.equal(payload.readiness.proposalGenerationAllowed, false);
assert.equal(payload.readiness.proposalApplicationAllowed, false);
assert.equal(payload.readiness.proposalQueueMutationAllowed, false);
assert.equal(payload.readiness.requiresHumanApproval, true);
assert.equal(payload.readiness.readyForHumanReviewContract, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotCallProviders, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runQueueStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-proposal-queue-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Fourth Implemented Slice: `growth-proposal-queue-status`/);
assert.match(plan, /node scripts\/growth-proposal-queue-status\.mjs/);
assert.match(plan, /proposal readiness contract/);
assert.match(plan, /growth-skill-memory-registry-status/);
assert.match(plan, /node scripts\/growth-skill-memory-registry-status\.mjs/);
assert.match(plan, /growth-gateway-surface-router-status/);
assert.match(plan, /growth-continuous-development-loop-status/);
assert.match(plan, /growth-improvement-acceptance-status/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-proposal-queue-status\.mjs/);
assert.match(harnessBaseline, /growth-skill-memory-registry-status/);
assert.match(harnessBaseline, /node scripts\/growth-skill-memory-registry-status\.mjs/);
assert.match(harnessBaseline, /growth-gateway-surface-router-status/);
assert.match(harnessBaseline, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(harnessBaseline, /growth-improvement-acceptance-status/);
assert.match(harnessBaseline, /growth-accepted-improvement-registry-status/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /growth-proposal-queue-status/);
assert.match(completionReadiness, /growth-skill-memory-registry-status/);
assert.match(completionReadiness, /growth-gateway-surface-router-status/);
assert.match(completionReadiness, /growth-continuous-development-loop-status/);
assert.match(completionReadiness, /growth-improvement-acceptance-status/);
assert.match(completionReadiness, /growth-accepted-improvement-registry-status/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
assert.match(todo, /growth-proposal-queue-status-readonly-post-m7-811/);
assert.match(todo, /growth-skill-memory-registry-status-readonly-post-m7-812/);
assert.match(todo, /growth-gateway-surface-router-status-readonly-post-m7-813/);
assert.match(todo, /growth-continuous-development-loop-status-readonly-post-m7-814/);
assert.match(todo, /growth-improvement-acceptance-status-readonly-post-m7-815/);
assert.match(todo, /growth-accepted-improvement-registry-status-readonly-post-m7-816/);
assert.match(todo, /growth-regression-watch-status-readonly-post-m7-817/);
assert.match(todo, /growth-rollback-review-status-readonly-post-m7-818/);
assert.match(todo, /growth-remediation-plan-status-readonly-post-m7-819/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthProposalQueueStatus: {
        command: 'node scripts/growth-proposal-queue-status.mjs',
        schemaVersion: payload.schemaVersion,
        proposalStatuses: payload.vocabulary.proposalStatuses.length,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
