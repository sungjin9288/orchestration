import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const routerScript = path.join(repoRoot, 'scripts', 'growth-gateway-surface-router-status.mjs');

function runRouterStatus(args = []) {
  const result = spawnSync(process.execPath, [routerScript, ...args], {
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

const result = runRouterStatus();
assert.equal(result.status, 0, `growth-gateway-surface-router-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-gateway-surface-router-status');
assert.equal(payload.posture, 'local-read-only-gateway-surface-routing-contract');
assert.equal(payload.schemaVersion, 'growth-gateway-surface-router-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.gatewaySurfaceRouterDocumented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.masterBriefMentionsAdvancedOps, true);
assert.equal(payload.sourceSummary.iaMentionsPrimarySurfaces, true);
assert.equal(payload.sourceSummary.harnessMentionsGatewaySurfaceRouter, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsGatewaySurfaceRouter, true);
assert.equal(payload.sourceSummary.ledgerMentionsGatewaySurfaceRouter, true);
assert.equal(payload.sourceSummary.nextContinuousLoopDocumented, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopStatusScriptPresent, true);
assert.equal(payload.sourceSummary.continuousDevelopmentLoopStatusDocumented, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusScriptPresent, true);
assert.equal(payload.sourceSummary.improvementAcceptanceStatusDocumented, true);
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
assert.equal(payload.sourceSummary.remediationPlanStatusScriptPresent, true);
assert.equal(payload.sourceSummary.remediationPlanStatusDocumented, true);
assert.equal(payload.sourceSummary.remediationPlanStatusImplemented, true);
assert.equal(payload.sourceSummary.remediationApprovalNextDocumented, true);
assert.equal(payload.sourceSummary.externalChannelsBlocked, true);
assert.equal(payload.sourceSummary.gatewayAuthorityBlocked, true);
assert.equal(payload.sourceSummary.allSurfaceIdsDocumented, true);

assert.ok(payload.vocabulary.growthSignalTypes.includes('engine-status'));
assert.ok(payload.vocabulary.growthSignalTypes.includes('reflection-score'));
assert.ok(payload.vocabulary.growthSignalTypes.includes('proposal-queue'));
assert.ok(payload.vocabulary.growthSignalTypes.includes('skill-memory-registry'));
assert.deepEqual(payload.vocabulary.surfaceIds, [
  'Mission',
  'Council',
  'Execution',
  'Deliverables',
  'Taskboard',
  'Logs',
  'Artifacts',
  'Decision Inbox',
]);
assert.ok(payload.vocabulary.displayModes.includes('summary'));
assert.ok(payload.vocabulary.displayModes.includes('review-only'));
assert.ok(payload.vocabulary.displayModes.includes('blocked-action'));
assert.ok(payload.vocabulary.displayModes.includes('advanced-ops-detail'));
assert.ok(payload.vocabulary.operatorActionTypes.includes('navigate'));
assert.ok(payload.vocabulary.operatorActionTypes.includes('open-review'));
assert.ok(payload.vocabulary.operatorActionTypes.includes('hold-baseline'));

assert.ok(payload.routeSchema.surfaceRoute.required.includes('surfaceId'));
assert.ok(payload.routeSchema.surfaceRoute.required.includes('actionAllowed'));
assert.ok(payload.routeSchema.navigationHint.required.includes('executionAllowed'));
assert.ok(payload.routeSchema.evidenceLink.required.includes('redactionState'));
assert.ok(payload.routeSchema.blockedAction.required.includes('allowedAlternative'));
assert.ok(payload.routingRules.some((rule) => rule.id === 'display-growth-state-only'));
assert.ok(payload.routingRules.some((rule) => rule.id === 'external-channels-disabled'));
assert.ok(payload.routingRules.some((rule) => rule.id === 'action-allowed-false-for-mutation'));
assert.equal(payload.surfaceRoutes.length, 8);
assert.equal(payload.surfaceRoutes.find((route) => route.surfaceId === 'Mission')?.displayMode, 'summary');
assert.equal(payload.surfaceRoutes.find((route) => route.surfaceId === 'Council')?.displayMode, 'review-only');
assert.equal(payload.surfaceRoutes.find((route) => route.surfaceId === 'Execution')?.displayMode, 'blocked-action');
assert.equal(payload.surfaceRoutes.find((route) => route.surfaceId === 'Deliverables')?.displayMode, 'evidence-link');
assert.equal(payload.surfaceRoutes.find((route) => route.surfaceId === 'Decision Inbox')?.displayMode, 'review-only');
assert.ok(payload.surfaceRoutes.every((route) => route.actionAllowed === false));
assert.ok(payload.navigationHints.every((hint) => hint.executionAllowed === false));
assert.ok(payload.evidenceLinks.some((link) => link.linkId === 'router-smoke-proof'));
assert.ok(payload.blockedActions.some((action) => action.actionId === 'execute-worker'));
assert.ok(payload.blockedActions.some((action) => action.actionId === 'apply-proposal'));
assert.ok(payload.blockedActions.some((action) => action.actionId === 'persist-memory'));
assert.ok(payload.blockedActions.some((action) => action.actionId === 'self-push'));

assert.equal(payload.readiness.routesDefined, 8);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.routesCoverAllSurfaces, true);
assert.equal(payload.readiness.gatewayExternalChannelsAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.navigationOnlyActions, true);
assert.equal(payload.readiness.readOnlySurfaceContract, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runRouterStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-gateway-surface-router-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Sixth Implemented Slice: `growth-gateway-surface-router-status`/);
assert.match(plan, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(plan, /surface\s+routing contract/);
assert.match(plan, /growth-continuous-development-loop-status/);
assert.match(plan, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(plan, /growth-improvement-acceptance-status/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(plan, /must not authorize workers, proposals, memory persistence, dogfood, commits, or pushes/);
assert.match(harnessBaseline, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(harnessBaseline, /growth-improvement-acceptance-status/);
assert.match(harnessBaseline, /growth-accepted-improvement-registry-status/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(completionReadiness, /growth-continuous-development-loop-status/);
assert.match(completionReadiness, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(completionReadiness, /growth-improvement-acceptance-status/);
assert.match(completionReadiness, /growth-accepted-improvement-registry-status/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
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
      growthGatewaySurfaceRouterStatus: {
        command: 'node scripts/growth-gateway-surface-router-status.mjs',
        schemaVersion: payload.schemaVersion,
        routesDefined: payload.readiness.routesDefined,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
