import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const mode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status';
const nextMode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status';
const statusScript = path.join(repoRoot, 'scripts', `${mode}.mjs`);

function runStatus(args = []) {
  const result = spawnSync(process.execPath, [statusScript, ...args], {
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

  return { payload, status: result.status, stderr, stdout };
}

const result = runStatus();
assert.equal(result.status, 0, `${mode} failed: ${result.stderr}`);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, mode);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-contract',
);
assert.equal(payload.schemaVersion, `${mode}/v0`);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceStates.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-ready-for-lifecycle-close-final-close-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-readiness',
  ),
);

const required =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDecisionNoteRefs',
  'lifecycleCloseFinalCloseAllowed',
  'lifecycleCloseFinalizationAccepted',
  'lifecycleCloseFinalizationReviewAcceptanceAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(required.includes(field), `required field ${field}`);
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceFileAdopted,
  false,
);
assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceState
    .lifecycleCloseFinalCloseAllowed,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStatus, true);
assert.equal(payload.readiness.lifecycleCloseFinalCloseAllowed, false);
assert.equal(payload.readiness.lifecycleCloseFinalizationAccepted, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.nextRecommendedSlice.id, nextMode);
assert.equal(payload.nextRecommendedSlice.commandToAdd, `node scripts/${nextMode}.mjs`);
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReview: true,
  doesNotFinalizeSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
  doesNotMutateAcceptedRecords: true,
  doesNotMutateSource: true,
  doesNotCreateRemediation: true,
  doesNotExecuteRemediation: true,
  doesNotCommit: true,
  doesNotPush: true,
})) {
  assert.equal(payload.safetyBoundary[key], expected, `safetyBoundary.${key}`);
}

const typoResult = runStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(typoResult.payload?.mode, mode);
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
  /Three-hundred-sixty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status-recheck-after-lifecycle-close-finalization-review-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
);
assert.match(plan, new RegExp('node scripts/' + mode + '\\.mjs'));
assert.match(
  plan,
  /current source mutation lifecycle closeout closure lifecycle close finalization\s+acceptance\s+record/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization acceptance criteria refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization acceptance decision note refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close finalization acceptance status stays separate from actual source mutation execution/,
);
assert.match(plan, new RegExp('Sixty-ninth Implemented Slice: `' + nextMode + '`'));
assert.match(plan, new RegExp('node scripts/' + nextMode + '\\.mjs'));
assert.match(harnessBaseline, new RegExp(mode));
assert.match(completionReadiness, new RegExp(mode));
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status-recheck-after-lifecycle-close-finalization-review-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1172/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceStatus: {
        mode: payload.mode,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
