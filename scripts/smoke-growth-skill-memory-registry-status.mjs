import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const registryScript = path.join(repoRoot, 'scripts', 'growth-skill-memory-registry-status.mjs');

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
assert.equal(result.status, 0, `growth-skill-memory-registry-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-skill-memory-registry-status');
assert.equal(payload.posture, 'local-read-only-skill-memory-registry-contract');
assert.equal(payload.schemaVersion, 'growth-skill-memory-registry-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.skillMemoryRegistryDocumented, true);
assert.equal(payload.sourceSummary.proposalQueueImplemented, true);
assert.equal(payload.sourceSummary.reflectionEvaluatorImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSkillMemoryRegistry, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSkillMemoryRegistry, true);
assert.equal(payload.sourceSummary.ledgerMentionsSkillMemoryRegistry, true);
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
assert.ok(payload.sourceSummary.lessonEntries > 0);
assert.equal(payload.sourceSummary.redactionMentioned, true);
assert.equal(payload.sourceSummary.applicabilityMentioned, true);
assert.equal(payload.sourceSummary.globalMemoryBlocked, true);

assert.ok(payload.vocabulary.memoryClasses.includes('session-local'));
assert.ok(payload.vocabulary.memoryClasses.includes('workspace-specific'));
assert.ok(payload.vocabulary.memoryClasses.includes('reusable-skill-template'));
assert.ok(payload.vocabulary.memoryClasses.includes('rejected-raw-transcript'));
assert.ok(payload.vocabulary.skillCandidateTypes.includes('verification-guard'));
assert.ok(payload.vocabulary.skillCandidateTypes.includes('failure-pattern'));
assert.ok(payload.vocabulary.registryStatuses.includes('needs-redaction'));
assert.ok(payload.vocabulary.registryStatuses.includes('approved-for-persistence'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('lesson-entry'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('redaction-review'));
assert.ok(payload.vocabulary.requiredEvidenceTypes.includes('applicability-rule'));
assert.ok(payload.registrySchema.memoryCandidate.required.includes('redactionState'));
assert.ok(payload.registrySchema.memoryCandidate.required.includes('applicability'));
assert.ok(payload.registrySchema.memoryCandidate.required.includes('expiry'));
assert.ok(payload.registrySchema.memoryCandidate.required.includes('persistAllowed'));
assert.ok(payload.registrySchema.skillCandidate.required.includes('applicabilityRule'));
assert.ok(payload.registrySchema.skillCandidate.required.includes('promoteAllowed'));
assert.ok(payload.registrySchema.redactionRecord.required.includes('removedFields'));
assert.ok(payload.registrySchema.applicabilityRule.required.includes('doesNotApplyWhen'));
assert.ok(payload.registryRules.some((rule) => rule.id === 'raw-transcripts-rejected-by-default'));
assert.ok(payload.registryRules.some((rule) => rule.id === 'approval-before-persistence'));
assert.ok(payload.candidateTemplates.some((template) => template.id === 'repeated-work-to-skill-template'));
assert.equal(payload.registryState.realRegistryFileAdopted, false);
assert.equal(payload.registryState.discoveredMemoryRecords, 0);
assert.equal(payload.registryState.discoveredSkillRecords, 0);
assert.equal(payload.registryState.registryMutationAllowed, false);
assert.equal(payload.registryState.persistenceAllowed, false);
assert.equal(payload.registryState.promotionAllowed, false);
assert.equal(payload.readiness.lessonsAvailableForReview, true);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.skillPromotionAllowed, false);
assert.equal(payload.readiness.globalMemoryAllowed, false);
assert.equal(payload.readiness.rawTranscriptIngestionAllowed, false);
assert.equal(payload.readiness.requiresHumanApproval, true);
assert.equal(payload.readiness.readyForRegistryReviewContract, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-request-status');
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotCallProviders, true);
assert.equal(payload.safetyBoundary.doesNotOpenExternalChannels, true);
assert.equal(payload.safetyBoundary.doesNotPersistMemory, true);
assert.equal(payload.safetyBoundary.doesNotPromoteSkills, true);
assert.equal(payload.safetyBoundary.doesNotIngestRawTranscripts, true);
assert.equal(payload.safetyBoundary.doesNotAuthorizeGatewayActions, true);
assert.equal(payload.safetyBoundary.doesNotCommit, true);
assert.equal(payload.safetyBoundary.doesNotPush, true);

const typoResult = runRegistryStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-skill-memory-registry-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Fifth Implemented Slice: `growth-skill-memory-registry-status`/);
assert.match(plan, /node scripts\/growth-skill-memory-registry-status\.mjs/);
assert.match(plan, /skill\/memory registry readiness contract/);
assert.match(plan, /growth-gateway-surface-router-status/);
assert.match(plan, /node scripts\/growth-gateway-surface-router-status\.mjs/);
assert.match(plan, /growth-continuous-development-loop-status/);
assert.match(plan, /node scripts\/growth-continuous-development-loop-status\.mjs/);
assert.match(plan, /growth-improvement-acceptance-status/);
assert.match(plan, /growth-accepted-improvement-registry-status/);
assert.match(plan, /growth-regression-watch-status/);
assert.match(plan, /growth-rollback-review-status/);
assert.match(plan, /growth-remediation-plan-status/);
assert.match(plan, /growth-remediation-approval-status/);
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
assert.match(completionReadiness, /growth-skill-memory-registry-status/);
assert.match(completionReadiness, /growth-gateway-surface-router-status/);
assert.match(completionReadiness, /growth-continuous-development-loop-status/);
assert.match(completionReadiness, /growth-improvement-acceptance-status/);
assert.match(completionReadiness, /growth-accepted-improvement-registry-status/);
assert.match(completionReadiness, /growth-regression-watch-status/);
assert.match(completionReadiness, /growth-rollback-review-status/);
assert.match(completionReadiness, /growth-remediation-plan-status/);
assert.match(completionReadiness, /growth-remediation-approval-status/);
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
      growthSkillMemoryRegistryStatus: {
        command: 'node scripts/growth-skill-memory-registry-status.mjs',
        schemaVersion: payload.schemaVersion,
        memoryClasses: payload.vocabulary.memoryClasses.length,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
