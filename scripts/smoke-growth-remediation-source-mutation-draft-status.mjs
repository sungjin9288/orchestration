import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const draftScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-draft-status.mjs',
);

function runDraftStatus(args = []) {
  const result = spawnSync(process.execPath, [draftScript, ...args], {
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

const result = runDraftStatus();
assert.equal(result.status, 0, `growth-remediation-source-mutation-draft-status failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-draft-status');
assert.equal(payload.posture, 'local-read-only-remediation-source-mutation-draft-contract');
assert.equal(payload.schemaVersion, 'growth-remediation-source-mutation-draft-status/v0');
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationAuthorizationImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationApplicationPreflightImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationDraftImplemented, true);
assert.equal(payload.sourceSummary.decisionAccepted, true);
assert.equal(payload.sourceSummary.harnessMentionsSourceMutationDraft, true);
assert.equal(payload.sourceSummary.completionReadinessMentionsSourceMutationDraft, true);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationDraft, true);
assert.equal(payload.sourceSummary.verificationIncludesSourceMutationDraft, true);
assert.equal(payload.sourceSummary.sourceMutationDraftReviewNextDocumented, true);
assert.equal(payload.sourceSummary.currentApplicationPreflightDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.expectedChangeSetDocumented, true);
assert.equal(payload.sourceSummary.fileUpdatePlanDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationCommandSetDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.restorePlanDocumented, true);
assert.equal(payload.sourceSummary.rollbackPlanDocumented, true);
assert.equal(payload.sourceSummary.draftReviewDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

assert.ok(payload.vocabulary.sourceMutationDraftStates.includes('source-mutation-draft-review-ready'));
assert.ok(payload.vocabulary.sourceMutationDraftStates.includes('source-mutation-draft-ready-for-draft-review'));
assert.ok(payload.vocabulary.sourceMutationDraftStates.includes('needs-patch-draft'));
assert.ok(payload.vocabulary.sourceMutationDraftStates.includes('needs-dry-run-proof'));
assert.ok(
  payload.vocabulary.sourceMutationDraftDecisionTypes.includes(
    'approve-source-mutation-draft-review-readiness',
  ),
);
assert.ok(payload.vocabulary.sourceMutationDraftDecisionTypes.includes('request-patch-draft'));
assert.ok(payload.vocabulary.sourceMutationDraftDecisionTypes.includes('request-dry-run-proof'));
assert.ok(
  payload.vocabulary.sourceMutationDraftEvidenceTypes.includes(
    'source-mutation-application-preflight-record',
  ),
);
assert.ok(payload.vocabulary.sourceMutationDraftEvidenceTypes.includes('file-update-plan'));
assert.ok(payload.vocabulary.sourceMutationDraftEvidenceTypes.includes('patch-draft'));
assert.ok(payload.vocabulary.sourceMutationDraftEvidenceTypes.includes('diff-preview'));
assert.ok(payload.vocabulary.sourceMutationDraftEvidenceTypes.includes('dry-run-proof'));
assert.ok(payload.vocabulary.sourceMutationDraftBlockerTypes.includes('application-preflight-stale'));
assert.ok(payload.vocabulary.sourceMutationDraftBlockerTypes.includes('draft-touches-unapproved-file'));
assert.ok(payload.vocabulary.sourceMutationDraftBlockerTypes.includes('draft-mutates-source'));

assert.ok(payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('draftId'));
assert.ok(
  payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes(
    'applicationPreflightId',
  ),
);
assert.ok(
  payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('fileUpdatePlanRefs'),
);
assert.ok(payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('patchDraftRefs'));
assert.ok(payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('diffPreviewRefs'));
assert.ok(payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('dryRunProofRefs'));
assert.ok(
  payload.sourceMutationDraftSchema.sourceMutationDraftRecord.required.includes('draftReviewAllowed'),
);
assert.ok(
  payload.sourceMutationDraftSchema.sourceMutationDraftDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationDraftSchema.sourceMutationDraftBlocker.required.includes('blocksDraftReview'),
);
assert.ok(payload.sourceMutationDraftSchema.sourceMutationDraftIndex.required.includes('stateCounts'));
assert.ok(
  payload.sourceMutationDraftRules.some(
    (rule) => rule.id === 'draft-requires-current-application-preflight',
  ),
);
assert.ok(payload.sourceMutationDraftRules.some((rule) => rule.id === 'draft-is-not-source-mutation'));
assert.ok(
  payload.sourceMutationDraftRules.some(
    (rule) => rule.id === 'draft-requires-file-plan-patch-and-diff-preview',
  ),
);
assert.ok(
  payload.sourceMutationDraftRules.some(
    (rule) => rule.id === 'draft-requires-dry-run-restore-rollback-and-verification',
  ),
);
assert.ok(
  payload.sourceMutationDraftRules.some(
    (rule) => rule.id === 'stale-broad-or-unapproved-draft-blocks-review',
  ),
);

assert.equal(payload.sourceMutationDraftState.realSourceMutationDraftFileAdopted, false);
assert.equal(payload.sourceMutationDraftState.discoveredSourceMutationDrafts, 0);
assert.equal(payload.sourceMutationDraftState.draftReviewAllowed, false);
assert.equal(payload.sourceMutationDraftState.sourceMutationAllowed, false);
assert.equal(payload.sourceMutationDraftState.acceptedRecordMutationAllowed, false);
assert.equal(payload.sourceMutationDraftState.rollbackExecutionAllowed, false);
assert.equal(payload.sourceMutationDraftState.remediationExecutionAllowed, false);
assert.equal(
  payload.sourceMutationDraftState.currentStatus,
  'contract-only-no-active-source-mutation-draft',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationDraftRecordTypes, 4);
assert.equal(payload.readiness.currentApplicationPreflightRequired, true);
assert.equal(payload.readiness.targetLockRequired, true);
assert.equal(payload.readiness.baselineDigestRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.expectedChangeSetRequired, true);
assert.equal(payload.readiness.fileUpdatePlanRequired, true);
assert.equal(payload.readiness.patchDraftRequired, true);
assert.equal(payload.readiness.diffPreviewRequired, true);
assert.equal(payload.readiness.verificationCommandSetRequired, true);
assert.equal(payload.readiness.dryRunProofRequired, true);
assert.equal(payload.readiness.restorePlanRequired, true);
assert.equal(payload.readiness.rollbackPlanRequired, true);
assert.equal(payload.readiness.draftAndMutationSeparate, true);
assert.equal(payload.readiness.draftReviewAllowed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.acceptedRecordMutationAllowed, false);
assert.equal(payload.readiness.rollbackExecutionAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationDraftReviewStatus, true);
assert.equal(payload.nextRecommendedSlice.id, 'growth-remediation-source-mutation-draft-review-status');
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-draft-review-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);
assert.equal(payload.safetyBoundary.readOnly, true);
assert.equal(payload.safetyBoundary.doesNotWriteFiles, true);
assert.equal(payload.safetyBoundary.doesNotMutateRuntime, true);
assert.equal(payload.safetyBoundary.doesNotExecuteWorkers, true);
assert.equal(payload.safetyBoundary.doesNotExecuteDogfood, true);
assert.equal(payload.safetyBoundary.doesNotGenerateProposals, true);
assert.equal(payload.safetyBoundary.doesNotApplyProposals, true);
assert.equal(payload.safetyBoundary.doesNotGeneratePatch, true);
assert.equal(payload.safetyBoundary.doesNotApplyPatch, true);
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

const typoResult = runDraftStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, 'growth-remediation-source-mutation-draft-status');
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(plan, /Twenty-second Implemented Slice: `growth-remediation-source-mutation-draft-status`/);
assert.match(plan, /node scripts\/growth-remediation-source-mutation-draft-status\.mjs/);
assert.match(plan, /file-update plan/);
assert.match(plan, /patch draft/);
assert.match(plan, /diff preview/);
assert.match(plan, /dry-run proof/);
assert.match(plan, /growth-remediation-source-mutation-draft-review-status/);
assert.match(harnessBaseline, /node scripts\/growth-remediation-source-mutation-draft-status\.mjs/);
assert.match(harnessBaseline, /growth-remediation-source-mutation-draft-review-status/);
assert.match(completionReadiness, /node scripts\/growth-remediation-source-mutation-draft-status\.mjs/);
assert.match(completionReadiness, /growth-remediation-source-mutation-draft-review-status/);
assert.match(todo, /growth-remediation-source-mutation-draft-status-readonly-post-m7-829/);

console.log(
  JSON.stringify(
    {
      ok: true,
      growthRemediationSourceMutationDraftStatus: {
        command: 'node scripts/growth-remediation-source-mutation-draft-status.mjs',
        schemaVersion: payload.schemaVersion,
        sourceMutationDraftRecordTypes: payload.readiness.sourceMutationDraftRecordTypes,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
