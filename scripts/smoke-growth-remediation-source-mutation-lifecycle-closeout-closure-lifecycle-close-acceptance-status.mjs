import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
);

function runLifecycleCloseAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseAcceptanceScript, ...args], {
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

const result = runLifecycleCloseAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefsDocumented',
  'cleanBaselineProofDocumented',
  'exactScopeLockDocumented',
  'targetLockDocumented',
  'baselineDigestDocumented',
  'patchDraftDocumented',
  'diffPreviewDocumented',
  'verificationOutputDocumented',
  'dryRunProofDocumented',
  'rollbackProofDocumented',
  'negativeEvidenceClearanceDocumented',
  'sourceOfTruthDocumented',
  'taskLedgerRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-ready-for-lifecycle-close-finalization-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStates.includes(
      state,
    ),
    state,
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefs',
  'lifecycleCloseFinalizationAllowed',
  'lifecycleCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-is-not-lifecycle-close-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState
    .lifecycleCloseFinalizationAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState.lifecycleCloseAccepted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState.lifecycleClosed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState.sourceMutationAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(
  payload.readiness.currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(
  payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStatus,
  true,
);
assert.equal(payload.readiness.lifecycleCloseFinalizationAllowed, false);
assert.equal(payload.readiness.lifecycleCloseAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReview: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
  doesNotCloseSourceMutationLifecycleCloseoutClosure: true,
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

const typoResult = runLifecycleCloseAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
);
assert.equal(typoResult.payload?.error, 'invalid-arguments');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const taskLedger = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

assert.match(
  plan,
  /Sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
);
assert.match(
  plan,
  /current source mutation lifecycle closeout closure lifecycle close acceptance record/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close acceptance criteria refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close acceptance decision note refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status-readonly-post-m7-871/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
