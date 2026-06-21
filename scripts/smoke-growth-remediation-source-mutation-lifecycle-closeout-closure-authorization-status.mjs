import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const closureAuthorizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
);

function runClosureAuthorizationStatus(args = []) {
  const result = spawnSync(process.execPath, [closureAuthorizationScript, ...args], {
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

const result = runClosureAuthorizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-authorization-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/v0',
);
assert.equal(payload.sourceSummary.growthGatewayPlanPresent, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureReadinessImplemented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationImplemented, true);
assert.equal(
  payload.sourceSummary.harnessMentionsSourceMutationLifecycleCloseoutClosureAuthorization,
  true,
);
assert.equal(
  payload.sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseoutClosureAuthorization,
  true,
);
assert.equal(payload.sourceSummary.ledgerMentionsSourceMutationLifecycleCloseoutClosureAuthorization, true);
assert.equal(
  payload.sourceSummary.verificationIncludesSourceMutationLifecycleCloseoutClosureAuthorization,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureExecutionReadinessNextDocumented,
  true,
);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureAuthorizationDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutClosureReadinessDocumented, true);
assert.equal(payload.sourceSummary.currentSourceMutationLifecycleCloseoutReviewAcceptanceDocumented, true);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRefsDocumented,
  true,
);
assert.equal(
  payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRefsDocumented,
  true,
);
assert.equal(payload.sourceSummary.cleanBaselineProofDocumented, true);
assert.equal(payload.sourceSummary.exactScopeLockDocumented, true);
assert.equal(payload.sourceSummary.targetLockDocumented, true);
assert.equal(payload.sourceSummary.baselineDigestDocumented, true);
assert.equal(payload.sourceSummary.patchDraftDocumented, true);
assert.equal(payload.sourceSummary.diffPreviewDocumented, true);
assert.equal(payload.sourceSummary.verificationOutputDocumented, true);
assert.equal(payload.sourceSummary.dryRunProofDocumented, true);
assert.equal(payload.sourceSummary.rollbackProofDocumented, true);
assert.equal(payload.sourceSummary.negativeEvidenceClearanceDocumented, true);
assert.equal(payload.sourceSummary.sourceOfTruthDocumented, true);
assert.equal(payload.sourceSummary.taskLedgerRefsDocumented, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationSeparateFromMutation, true);
assert.equal(payload.sourceSummary.sourceMutationLifecycleCloseoutClosureAuthorizationStillBlocked, true);
assert.equal(payload.sourceSummary.sourceMutationStillBlocked, true);
assert.equal(payload.sourceSummary.remediationExecutionStillBlocked, true);

for (const state of [
  'source-mutation-lifecycle-closeout-closure-authorization-ready-for-closure-execution-readiness-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-authorization',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-authorization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-authorization-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureAuthorizationStates.includes(state));
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAuthorizationDecisionTypes.includes(
    'authorize-source-mutation-lifecycle-closeout-closure-execution-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAuthorizationEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-authorization-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAuthorizationEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-authorization-decision-note',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureAuthorizationBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-authorization-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationSchema
    .sourceMutationLifecycleCloseoutClosureAuthorizationRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureAuthorizationId',
  'sourceMutationLifecycleCloseoutClosureReadinessId',
  'sourceMutationLifecycleCloseoutReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutId',
  'sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRefs',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field));
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationSchema
    .sourceMutationLifecycleCloseoutClosureAuthorizationDecision.required.includes('allowedNextAction'),
);
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationSchema
    .sourceMutationLifecycleCloseoutClosureAuthorizationBlocker.required.includes(
      'blocksSourceMutationLifecycleCloseoutClosureExecutionReadiness',
    ),
);

for (const ruleId of [
  'source-mutation-lifecycle-closeout-closure-authorization-requires-current-readiness-chain',
  'source-mutation-lifecycle-closeout-closure-authorization-is-not-source-mutation',
  'source-mutation-lifecycle-closeout-closure-authorization-requires-criteria-and-decision-notes',
  'source-mutation-lifecycle-closeout-closure-authorization-requires-verification-dry-run-and-rollback-proof',
  'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-authorization-blocks-execution-readiness',
]) {
  assert.ok(
    payload.sourceMutationLifecycleCloseoutClosureAuthorizationRules.some((rule) => rule.id === ruleId),
  );
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationState
    .realSourceMutationLifecycleCloseoutClosureAuthorizationFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationState
    .discoveredSourceMutationLifecycleCloseoutClosureAuthorizationRecords,
  0,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAuthorizationState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureAuthorizationState.sourceMutationAllowed, false);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationState.acceptedRecordMutationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationState.remediationExecutionAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureAuthorizationState.currentStatus,
  'contract-only-no-active-source-mutation-lifecycle-closeout-closure-authorization',
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAuthorizationRecordTypes, 4);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureAuthorizationRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureReadinessRequired, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired, true);
assert.equal(payload.readiness.cleanBaselineProofRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAuthorizationCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAuthorizationDecisionNoteRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureAuthorizationAndMutationSeparate, true);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureExecutionReadinessStatus, true);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
);
assert.equal(payload.nextRecommendedSlice.mustRemainReadOnly, true);

for (const [key, expected] of Object.entries({
  readOnly: true,
  doesNotWriteFiles: true,
  doesNotMutateRuntime: true,
  doesNotExecuteWorkers: true,
  doesNotExecuteDogfood: true,
  doesNotGenerateProposals: true,
  doesNotApplyProposals: true,
  doesNotGeneratePatch: true,
  doesNotApplyPatch: true,
  doesNotCloseSourceMutationLifecycle: true,
  doesNotMutateAcceptedRecords: true,
  doesNotMutateSource: true,
  doesNotExecuteRollback: true,
  doesNotCreateRemediation: true,
  doesNotExecuteRemediation: true,
  doesNotPersistMemory: true,
  doesNotPromoteSkills: true,
  doesNotAuthorizeGatewayActions: true,
  doesNotOpenExternalChannels: true,
  doesNotCommit: true,
  doesNotPush: true,
})) {
  assert.equal(payload.safetyBoundary[key], expected, `safetyBoundary.${key}`);
}

const typoResult = runClosureAuthorizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status',
);
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
  /Forty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure authorization record/);
assert.match(plan, /source mutation lifecycle closeout closure authorization criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure authorization decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure authorization status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /before\s+source mutation lifecycle closeout closure execution readiness can be\s+considered/,
);
assert.match(
  plan,
  /Forty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status`/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status/,
);
assert.match(
  todo,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status-readonly-post-m7-851/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutClosureAuthorizationStatus: {
        command:
          'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
