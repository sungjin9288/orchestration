import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const schemaScript = path.join(repoRoot, 'scripts', 'growth-worker-event-schema.mjs');

function runSchema(args = []) {
  const result = spawnSync(process.execPath, [schemaScript, ...args], {
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

const result = runSchema();
assert.equal(result.status, 0, `growth-worker-event-schema failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-worker-event-schema');
assert.equal(payload.posture, 'local-read-only-worker-event-vocabulary');
assert.equal(payload.schemaVersion, 'growth-worker-event-schema/v0');
assert.equal(payload.sourceSummary.workerSchemaDocumented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.proposalQueueStatusScriptPresent, true);
assert.equal(payload.sourceSummary.proposalQueueStatusDocumented, true);
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
assert.equal(payload.sourceSummary.referenceRepoRecheckPresent, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.readiness.proposalGenerationAllowed, false);
assert.equal(payload.readiness.workerAutomationAllowed, false);
assert.equal(payload.readiness.gatewayActionAllowedFromEvents, false);
assert.equal(payload.readiness.proposalQueueStatusImplemented, true);
assert.equal(payload.readiness.skillMemoryRegistryStatusImplemented, true);
assert.equal(payload.readiness.gatewaySurfaceRouterStatusImplemented, true);
assert.equal(payload.readiness.continuousDevelopmentLoopStatusImplemented, true);
assert.equal(payload.readiness.improvementAcceptanceStatusImplemented, true);
assert.equal(payload.readiness.acceptedImprovementRegistryStatusImplemented, true);
assert.equal(payload.readiness.regressionWatchStatusImplemented, true);
assert.equal(payload.readiness.rollbackReviewStatusImplemented, true);
assert.equal(payload.readiness.remediationPlanStatusImplemented, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotCallProviders, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);

assert.ok(payload.vocabulary.eventTypes.includes('worker.stage_started'));
assert.ok(payload.vocabulary.eventTypes.includes('worker.negative_evidence_recorded'));
assert.ok(payload.vocabulary.eventTypes.includes('worker.projection_recorded'));
assert.ok(payload.vocabulary.statusValues.includes('waiting_approval'));
assert.ok(payload.vocabulary.statusValues.includes('blocked'));
assert.ok(payload.vocabulary.evidenceTypes.includes('negative-evidence'));
assert.ok(payload.vocabulary.evidenceTypes.includes('checked-absent'));
assert.ok(payload.vocabulary.evidenceTypes.includes('redacted'));
assert.deepEqual(payload.schemas.baseEvent.required.slice(0, 4), [
  'schemaVersion',
  'eventId',
  'eventType',
  'observedAt',
]);
assert.ok(payload.schemas.runRecord.required.includes('approvalRefs'));
assert.ok(payload.schemas.stageRecord.required.includes('inputRefs'));
assert.ok(payload.schemas.reportRecord.required.includes('negativeEvidence'));
assert.ok(payload.schemas.reportRecord.required.includes('fieldDeltas'));
assert.ok(payload.schemas.statusCheckRecord.required.includes('stdoutDigest'));
assert.ok(payload.schemas.negativeEvidenceRecord.required.includes('checkedField'));
assert.ok(payload.schemas.projectionRecord.required.includes('downgradedTo'));
assert.ok(payload.validationRules.some((rule) => rule.id === 'operator-authority-separated'));
assert.ok(payload.consumerBoundaries.some((boundary) => /must not treat it as permission/.test(boundary)));
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);

const typoResult = runSchema(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-worker-event-schema');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Third Implemented Slice: `growth-worker-event-schema`/);
assert.match(plan, /node scripts\/growth-worker-event-schema\.mjs/);
assert.match(plan, /growth-proposal-queue-status/);
assert.match(plan, /growth-skill-memory-registry-status/);
assert.match(plan, /growth-gateway-surface-router-status/);
assert.match(plan, /growth-continuous-development-loop-status/);
assert.match(plan, /growth-improvement-acceptance-status/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
assert.match(harnessBaseline, /node scripts\/growth-worker-event-schema\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-proposal-queue-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-skill-memory-registry-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(harnessBaseline, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(harnessBaseline, /growth-improvement-acceptance-status/);
assert.match(harnessBaseline, /growth-accepted-improvement-registry-status/);
assert.match(harnessBaseline, /growth-regression-watch-status/);
assert.match(harnessBaseline, /growth-rollback-review-status/);
assert.match(harnessBaseline, /growth-remediation-plan-status/);
assert.match(harnessBaseline, /growth-remediation-approval-status/);
assert.match(completionReadiness, /growth-worker-event-schema/);
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
assert.match(todo, /growth-worker-event-schema-readonly-post-m7-810/);
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
      growthWorkerEventSchema: {
        command: 'node scripts/growth-worker-event-schema.mjs',
        schemaVersion: payload.schemaVersion,
        eventTypes: payload.vocabulary.eventTypes.length,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
