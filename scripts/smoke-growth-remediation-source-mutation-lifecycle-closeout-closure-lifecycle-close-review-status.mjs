import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
);

function runLifecycleCloseReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseReviewScript, ...args], {
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

const result = runLifecycleCloseReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReview',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReview',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReview',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseReview',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalCloseDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-decision-note',
]) {
  assert.ok(
    payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStates.includes(
      state,
    ),
    state,
  );
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefs',
  'lifecycleCloseReviewAcceptanceAllowed',
  'lifecycleCloseReviewAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-is-not-acceptance-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState
    .lifecycleCloseReviewAcceptanceAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState
    .lifecycleCloseReviewAccepted,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState.sourceMutationAllowed, false);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRequired, true);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRequired,
  true,
);
assert.equal(
  payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRequired,
  true,
);
assert.equal(
  payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStatus,
  true,
);
assert.equal(payload.readiness.lifecycleCloseReviewAcceptanceAllowed, false);
assert.equal(payload.readiness.lifecycleCloseReviewAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
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

const typoResult = runLifecycleCloseReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
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
  /Sixty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure lifecycle close review record/);
assert.match(plan, /source mutation lifecycle closeout closure lifecycle close review criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure lifecycle close review decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close review status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status-readonly-post-m7-869/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
