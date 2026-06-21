import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const proposalScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-implementation-proposal-status.mjs',
);

function runProposalStatus(args = []) {
  const result = spawnSync(process.execPath, [proposalScript, ...args], {
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

const result = runProposalStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-implementation-proposal-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-implementation-proposal-status');
assert.equal(payload.posture, 'local-read-only-remediation-implementation-proposal-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-implementation-proposal-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.remediationApprovalDocumented, true);
assert.equal(payload.sourceSummary.implementationProposalDocumented, true);
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
assert.equal(payload.sourceSummary.implementationProposalImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsImplementationProposal, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsImplementationProposal, true);
assert.equal(payload.sourceSummary.ledgerMentionsImplementationProposal, true);
assert.equal(payload.sourceSummary.verificationIncludesImplementationProposal, true);
assert.equal(payload.sourceSummary.implementationReviewNextDocumented, true);
assert.equal(payload.sourceSummary.implementationProposalFieldsDocumented, true);
assert.equal(payload.sourceSummary.fileSurfaceRefsDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.staleProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.proposalGenerationBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionBlocked, true);
assert.equal(payload.sourceSummary.approvalAndReviewPreserved, true);

assert.ok(payload.vocabulary.implementationProposalStates.includes('draft-eligible'));
assert.ok(payload.vocabulary.implementationProposalStates.includes('ready-for-review'));
assert.ok(
  payload.vocabulary.implementationProposalStates.includes('review-approved-for-thin-slice'),
);
assert.ok(payload.vocabulary.implementationProposalTypes.includes('docs-only'));
assert.ok(payload.vocabulary.implementationProposalTypes.includes('runtime-guard-only'));
assert.ok(payload.vocabulary.implementationProposalTypes.includes('task-ledger-sync'));
assert.ok(
  payload.vocabulary.implementationProposalEvidenceTypes.includes('remediation-approval-record'),
);
assert.ok(payload.vocabulary.implementationProposalEvidenceTypes.includes('file-scope-ref'));
assert.ok(payload.vocabulary.implementationProposalEvidenceTypes.includes('verification-command'));
assert.ok(payload.vocabulary.implementationProposalBlockerTypes.includes('approval-missing'));
assert.ok(payload.vocabulary.implementationProposalBlockerTypes.includes('file-scope-unclear'));
assert.ok(payload.vocabulary.implementationProposalBlockerTypes.includes('stale-approval'));
assert.ok(payload.vocabulary.implementationChangeTypes.includes('documentation'));
assert.ok(payload.vocabulary.implementationChangeTypes.includes('smoke-guard'));
assert.ok(payload.vocabulary.implementationChangeTypes.includes('verification-only'));

assert.ok(payload.implementationProposalSchema.implementationProposalRecord.required.includes('approvalId'));
assert.ok(payload.implementationProposalSchema.implementationProposalRecord.required.includes('fileScopeRefs'));
assert.ok(payload.implementationProposalSchema.implementationProposalRecord.required.includes('surfaceRefs'));
assert.ok(
  payload.implementationProposalSchema.implementationProposalRecord.required.includes(
    'verificationCommandRefs',
  ),
);
assert.ok(
  payload.implementationProposalSchema.implementationProposalRecord.required.includes(
    'rollbackProofRefs',
  ),
);
assert.ok(
  payload.implementationProposalSchema.implementationProposalRecord.required.includes(
    'sourceMutationAllowed',
  ),
);
assert.ok(
  payload.implementationProposalSchema.implementationProposalStep.required.includes(
    'rollbackProofRequired',
  ),
);
assert.ok(
  payload.implementationProposalSchema.implementationProposalBlocker.required.includes(
    'blocksExecution',
  ),
);
assert.ok(
  payload.implementationProposalSchema.implementationProposalIndex.required.includes('typeCounts'),
);
assert.ok(
  payload.implementationProposalRules.some(
    (rule) => rule.id === 'proposal-requires-remediation-approval',
  ),
);
assert.ok(
  payload.implementationProposalRules.some((rule) => rule.id === 'proposal-modeling-is-not-generation'),
);
assert.ok(
  payload.implementationProposalRules.some(
    (rule) => rule.id === 'source-mutation-requires-reviewed-thin-slice',
  ),
);
assert.ok(
  payload.implementationProposalRules.some(
    (rule) => rule.id === 'verification-and-rollback-proof-required',
  ),
);

assert.equal(payload.implementationProposalState.realImplementationProposalFileAdopted, false);
assert.equal(payload.implementationProposalState.discoveredImplementationProposals, 0);
assert.equal(payload.implementationProposalState.implementationProposalMutationAllowed, false);
assert.equal(payload.implementationProposalState.implementationProposalGenerationAllowed, false);
assert.equal(payload.implementationProposalState.sourceMutationAllowed, false);
assert.equal(payload.implementationProposalState.acceptedRecordMutationAllowed, false);
assert.equal(payload.implementationProposalState.rollbackExecutionAllowed, false);
assert.equal(payload.implementationProposalState.remediationExecutionAllowed, false);
assert.equal(
  payload.implementationProposalState.currentStatus,
  'contract-only-no-active-remediation-implementation-proposals',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.implementationProposalRecordTypes, 4);
assert.equal(payload.readiness.remediationApprovalRequired, true);
assert.equal(payload.readiness.fileScopeRequired, true);
assert.equal(payload.readiness.surfaceScopeRequired, true);
assert.equal(payload.readiness.verificationCommandsRequired, true);
assert.equal(payload.readiness.rollbackProofRequired, true);
assert.equal(payload.readiness.staleProofBlocksProposal, true);
assert.equal(payload.readiness.reviewAndApprovalSeparate, true);
assert.equal(payload.readiness.implementationProposalMutationAllowed, false);
assert.equal(payload.readiness.implementationProposalGenerationAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForImplementationReviewStatus, true);
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

const typoResult = runProposalStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-implementation-proposal-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Fourteenth Implemented Slice: `growth-remediation-implementation-proposal-status`/,
);
assert.match(plan, /node scripts\/growth-remediation-implementation-proposal-status\.mjs/);
assert.match(plan, /implementation proposal fields/);
assert.match(plan, /growth-remediation-source-mutation-request-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-implementation-proposal-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-request-status/);
assert.match(
  completionReadiness,
  /node scripts\/growth-remediation-implementation-proposal-status\.mjs/,
);
assert.match(completionReadiness, /growth-remediation-source-mutation-request-status/);
assert.match(todo, /growth-remediation-implementation-proposal-status-readonly-post-m7-821/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationImplementationProposalStatus: {
        command: 'node scripts/growth-remediation-implementation-proposal-status.mjs',
        schemaVersion: payload.schemaVersion,
        implementationProposalRecordTypes: payload.readiness.implementationProposalRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
