import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const loopScript = path.join(repoRoot, 'scripts', 'growth-continuous-development-loop-status.mjs');

function runLoopStatus(args = []) {
  const result = spawnSync(process.execPath, [loopScript, ...args], {
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

const result = runLoopStatus();
assert.equal(result.status, 0, `growth-continuous-development-loop-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-continuous-development-loop-status');
assert.equal(payload.posture, 'local-read-only-continuous-development-loop-contract');
assert.equal(payload.schemaVersion, 'growth-continuous-development-loop-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopDocumented, true);
assert.equal(payload.sourceSummary.engineStatusImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.workerEventSchemaImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.packMentionsCurrentImplementedFlow, true);
assert.equal(payload.sourceSummary.harnessMentionsContinuousLoop, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsContinuousLoop, true);
assert.equal(payload.sourceSummary.ledgerMentionsContinuousLoop, true);
assert.equal(payload.sourceSummary.improvementAcceptanceNextDocumented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusScriptPresent, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryNextDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusScriptPresent, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusDocumented, true);
assert.equal(payload.sourceSummary.acceptedImprovementRegistryStatusImplemented, true);
assert.equal(payload.sourceSummary.regressionWatchNextDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusScriptPresent, true);
assert.equal(payload.sourceSummary.regressionWatchStatusDocumented, true);
assert.equal(payload.sourceSummary.regressionWatchStatusImplemented, true);
assert.equal(payload.sourceSummary.rollbackReviewNextDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusScriptPresent, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusDocumented, true);
assert.equal(payload.sourceSummary.rollbackReviewStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationPlanNextDocumented, true);
assert.equal(payload.sourceSummary.loopNotUnattended, true);
assert.equal(payload.sourceSummary.explicitApprovalPreserved, true);

assert.deepEqual(payload.vocabulary.loopStepIds, [
  'run-work-or-dogfood',
  'collect-evidence',
  'reflect-on-evidence',
  'queue-improvement-proposal',
  'require-operator-approval',
  'implement-thin-slice',
  'verify-slice',
  'record-lesson',
  'expose-result-in-gateway',
]);
assert.ok(payload.vocabulary.stepStates.includes('modeled-read-only'));
assert.ok(payload.vocabulary.stepStates.includes('blocked-without-explicit-approval'));
assert.ok(payload.vocabulary.evidenceTypes.includes('aggregate-verification'));
assert.ok(payload.vocabulary.evidenceTypes.includes('negative-evidence'));
assert.ok(payload.vocabulary.gateTypes.includes('approval-before-commit'));
assert.ok(payload.vocabulary.gateTypes.includes('explicit-dogfood-execute-approval'));
assert.ok(payload.vocabulary.compositionInputs.includes('growth-gateway-surface-router-status'));

assert.ok(payload.loopSchema.loopStep.required.includes('actionAllowed'));
assert.ok(payload.loopSchema.gateLink.required.includes('blockedActions'));
assert.ok(payload.loopSchema.evidenceFlow.required.includes('evidenceTypes'));
assert.ok(payload.loopSchema.stopCondition.required.includes('allowedAlternative'));
assert.equal(payload.loopSteps.length, 9);
assert.equal(payload.loopSteps.find((step) => step.stepId === 'run-work-or-dogfood')?.state, 'optional-not-required');
assert.equal(payload.loopSteps.find((step) => step.stepId === 'require-operator-approval')?.state, 'approval-required');
assert.equal(
  payload.loopSteps.find((step) => step.stepId === 'implement-thin-slice')?.state,
  'blocked-without-explicit-approval',
);
assert.equal(payload.loopSteps.find((step) => step.stepId === 'verify-slice')?.surfaceHint, 'Deliverables');
assert.ok(payload.loopSteps.every((step) => step.actionAllowed === false));
assert.ok(payload.gateLinks.some((gate) => gate.gateId === 'approval-before-commit'));
assert.ok(payload.gateLinks.some((gate) => gate.gateId === 'explicit-dogfood-execute-approval'));
assert.ok(payload.gateLinks.some((gate) => gate.gateId === 'explicit-git-push-approval'));
assert.ok(payload.evidenceFlows.some((flow) => flow.flowId === 'evidence-to-reflection'));
assert.ok(payload.evidenceFlows.some((flow) => flow.flowId === 'verified-result-to-gateway'));
assert.ok(payload.stopConditions.some((condition) => condition.conditionId === 'no-hidden-automation'));
assert.ok(payload.stopConditions.some((condition) => condition.conditionId === 'no-gateway-authorized-execution'));

assert.equal(payload.gatePolicy.operatorApprovalRequired, true);
assert.equal(payload.gatePolicy.implementationFromLoopAllowed, false);
assert.equal(payload.gatePolicy.dogfoodFromLoopAllowed, false);
assert.equal(payload.gatePolicy.commitFromLoopAllowed, false);
assert.equal(payload.gatePolicy.pushFromLoopAllowed, false);
assert.equal(payload.gatePolicy.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.loopStepsDefined, 9);
assert.equal(payload.readiness.loopStepsComplete, true);
assert.equal(payload.readiness.gateCoverageComplete, true);
assert.equal(payload.readiness.allStepsReadOnly, true);
assert.equal(payload.readiness.optionalDogfoodNotRequired, true);
assert.equal(payload.readiness.noUnattendedAutomation, true);
assert.equal(payload.readiness.readyForImprovementAcceptanceContract, true);
assert.equal(payload.sourceSummary.remediationPlanStatusScriptPresent, true);
assert.equal(payload.sourceSummary.remediationPlanStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runLoopStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-continuous-development-loop-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Seventh Implemented Slice: `growth-continuous-development-loop-status`/);
assert.match(plan, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(plan, /continuous\s+development loop contract/);
assert.match(plan, /growth-improvement-acceptance-status/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(plan, /continuous, but not unattended/);
assert.match(harnessBaseline, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(harnessBaseline, /growth-improvement-acceptance-status/);
assert.match(harnessBaseline, /growth-accepted-improvement-registry-status/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(completionReadiness, /growth-improvement-acceptance-status/);
assert.match(completionReadiness, /growth-accepted-improvement-registry-status/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
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
      growthContinuousDevelopmentLoopStatus: {
        command: 'node scripts/growth-continuous-development-loop-status.mjs',
        schemaVersion: payload.schemaVersion,
        loopStepsDefined: payload.readiness.loopStepsDefined,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
