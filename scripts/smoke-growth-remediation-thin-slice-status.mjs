import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const thinSliceScript = path.join(repoRoot, 'scripts', 'growth-remediation-thin-slice-status.mjs');

function runThinSliceStatus(args = []) {
  const result = spawnSync(process.execPath, [thinSliceScript, ...args], {
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

const result = runThinSliceStatus();
assert.equal(result.status, 0, `growth-remediation-thin-slice-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-thin-slice-status');
assert.equal(payload.posture, 'local-read-only-remediation-thin-slice-readiness-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-thin-slice-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.implementationReviewDocumented, true);
assert.equal(payload.sourceSummary.thinSliceDocumented, true);
assert.equal(payload.sourceSummary.implementationReviewImplemented, true);
assert.equal(payload.sourceSummary.thinSliceImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsThinSlice, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsThinSlice, true);
assert.equal(payload.sourceSummary.ledgerMentionsThinSlice, true);
assert.equal(payload.sourceSummary.verificationIncludesThinSlice, true);
assert.equal(payload.sourceSummary.mutationPreflightNextDocumented, true);
assert.equal(payload.sourceSummary.exactTargetsDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.staleReviewDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.mutationStillBlocked, true);
assert.equal(payload.sourceSummary.executionStillBlocked, true);

assert.ok(payload.vocabulary.thinSliceStates.includes('candidate-ready'));
assert.ok(payload.vocabulary.thinSliceStates.includes('ready-for-execution-authority-review'));
assert.ok(payload.vocabulary.thinSliceStates.includes('stale-review-blocked'));
assert.ok(payload.vocabulary.thinSliceTargetTypes.includes('docs-only'));
assert.ok(payload.vocabulary.thinSliceTargetTypes.includes('runtime-guard-only'));
assert.ok(payload.vocabulary.thinSliceTargetTypes.includes('verification-only'));
assert.ok(payload.vocabulary.thinSliceEvidenceTypes.includes('implementation-review-record'));
assert.ok(payload.vocabulary.thinSliceEvidenceTypes.includes('exact-file-target'));
assert.ok(payload.vocabulary.thinSliceEvidenceTypes.includes('verification-output'));
assert.ok(payload.vocabulary.thinSliceBlockerTypes.includes('review-not-approved'));
assert.ok(payload.vocabulary.thinSliceBlockerTypes.includes('target-scope-drift'));
assert.ok(payload.vocabulary.thinSliceBlockerTypes.includes('operator-authority-missing'));

assert.ok(payload.thinSliceSchema.thinSliceReadinessRecord.required.includes('reviewId'));
assert.ok(payload.thinSliceSchema.thinSliceReadinessRecord.required.includes('exactFileTargets'));
assert.ok(payload.thinSliceSchema.thinSliceReadinessRecord.required.includes('exactSurfaceTargets'));
assert.ok(
  payload.thinSliceSchema.thinSliceReadinessRecord.required.includes(
    'executionAuthorityRequired',
  ),
);
assert.ok(payload.thinSliceSchema.thinSliceTarget.required.includes('rollbackProofRequired'));
assert.ok(payload.thinSliceSchema.thinSliceBlocker.required.includes('blocksSourceMutation'));
assert.ok(payload.thinSliceSchema.thinSliceIndex.required.includes('targetTypeCounts'));
assert.ok(
  payload.thinSliceRules.some(
    (rule) => rule.id === 'thin-slice-requires-approved-implementation-review',
  ),
);
assert.ok(
  payload.thinSliceRules.some((rule) => rule.id === 'thin-slice-readiness-is-not-execution-authority'),
);
assert.ok(payload.thinSliceRules.some((rule) => rule.id === 'exact-targets-required-before-authority'));
assert.ok(
  payload.thinSliceRules.some(
    (rule) => rule.id === 'verification-output-and-rollback-proof-required',
  ),
);
assert.ok(
  payload.thinSliceRules.some((rule) => rule.id === 'stale-review-or-target-drift-blocks-authority'),
);

assert.equal(payload.thinSliceState.realThinSliceFileAdopted, false);
assert.equal(payload.thinSliceState.discoveredThinSlices, 0);
assert.equal(payload.thinSliceState.thinSliceReadinessMutationAllowed, false);
assert.equal(payload.thinSliceState.executionAuthorityGenerationAllowed, false);
assert.equal(payload.thinSliceState.sourceMutationAllowed, false);
assert.equal(payload.thinSliceState.acceptedRecordMutationAllowed, false);
assert.equal(payload.thinSliceState.rollbackExecutionAllowed, false);
assert.equal(payload.thinSliceState.remediationExecutionAllowed, false);
assert.equal(payload.thinSliceState.currentStatus, 'contract-only-no-active-remediation-thin-slices');
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.thinSliceRecordTypes, 4);
assert.equal(payload.readiness.implementationReviewRequired, true);
assert.equal(payload.readiness.exactTargetsRequired, true);
assert.equal(payload.readiness.verificationOutputRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.staleReviewBlocksAuthority, true);
assert.equal(payload.readiness.reviewAndExecutionAuthoritySeparate, true);
assert.equal(payload.readiness.thinSliceReadinessMutationAllowed, false);
assert.equal(payload.readiness.executionAuthorityGenerationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForExecutionAuthorityStatus, true);
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

const typoResult = runThinSliceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-thin-slice-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Sixteenth Implemented Slice: `growth-remediation-thin-slice-status`/);
assert.match(plan, /node scripts\/growth-remediation-thin-slice-status\.mjs/);
assert.match(plan, /exact file targets/);
assert.match(plan, /growth-remediation-source-mutation-request-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-thin-slice-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-request-status/);
assert.match(completionReadiness, /node scripts\/growth-remediation-thin-slice-status\.mjs/);
assert.match(completionReadiness, /growth-remediation-source-mutation-request-status/);
assert.match(todo, /growth-remediation-thin-slice-status-readonly-post-m7-823/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationThinSliceStatus: {
        command: 'node scripts/growth-remediation-thin-slice-status.mjs',
        schemaVersion: payload.schemaVersion,
        thinSliceRecordTypes: payload.readiness.thinSliceRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
