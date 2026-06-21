import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseReviewAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
);

function runLifecycleCloseReviewAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseReviewAcceptanceScript, ...args], {
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

const result = runLifecycleCloseReviewAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-ready-for-lifecycle-close-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStates.includes(
      state,
    ),
    state,
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefs',
  'lifecycleCloseAcceptanceAllowed',
  'lifecycleCloseReviewAcceptanceAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-is-not-lifecycle-close-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState
    .lifecycleCloseAcceptanceAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState
    .lifecycleCloseReviewAcceptanceAccepted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState.lifecycleClosed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState.sourceMutationAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(
  payload.readiness
    .currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRequired,
  true,
);
assert.equal(
  payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStatus,
  true,
);
assert.equal(payload.readiness.lifecycleCloseAcceptanceAllowed, false);
assert.equal(payload.readiness.lifecycleCloseReviewAcceptanceAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
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

const typoResult = runLifecycleCloseReviewAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
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
  /Sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
);
assert.match(
  plan,
  /current source mutation lifecycle closeout closure lifecycle close review acceptance record/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close review acceptance criteria refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close review acceptance decision note refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close review acceptance status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-readonly-post-m7-870/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
