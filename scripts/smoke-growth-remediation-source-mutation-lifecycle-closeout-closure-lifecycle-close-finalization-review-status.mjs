import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseFinalizationReviewScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
);

function runLifecycleCloseFinalizationReviewStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseFinalizationReviewScript, ...args], {
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

const result = runLifecycleCloseFinalizationReviewStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStates.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-ready-for-lifecycle-close-finalization-review-acceptance-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefs',
  'lifecycleCloseFinalizationReviewAcceptanceAllowed',
  'lifecycleCloseFinalizationReviewAccepted',
  'lifecycleCloseFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-is-not-lifecycle-close-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState
    .lifecycleCloseFinalizationReviewAcceptanceAllowed,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState
    .lifecycleCloseFinalizationReviewAccepted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState
    .sourceMutationAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(
  payload.readiness
    .readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStatus,
  true,
);
assert.equal(payload.readiness.lifecycleCloseFinalizationReviewAcceptanceAllowed, false);
assert.equal(payload.readiness.lifecycleCloseFinalizationReviewAccepted, false);
assert.equal(payload.readiness.lifecycleCloseFinalized, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview: true,
  doesNotFinalizeSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance: true,
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

const typoResult = runLifecycleCloseFinalizationReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
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
  /Three-hundred-sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-recheck-after-lifecycle-close-finalization-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
);
assert.match(
  plan,
  /current source mutation lifecycle closeout closure lifecycle close finalization review\s+record/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization review criteria refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization review decision note refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization review status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
);
assert.match(
  harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/,
);
assert.match(
  completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/,
);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-recheck-after-lifecycle-close-finalization-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1170/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
