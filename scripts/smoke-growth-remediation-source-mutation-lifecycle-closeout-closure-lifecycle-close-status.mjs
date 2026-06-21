import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
);

function runLifecycleCloseStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseScript, ...args], {
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

const result = runLifecycleCloseStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(payload.mode, 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status');
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/v0',
);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseImplemented',
  'sourceMutationLifecycleCloseoutClosureFinalCloseImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleClose',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleClose',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalCloseDocumented',
  'currentSourceMutationLifecycleCloseoutClosureFinalizationAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalCloseCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureFinalCloseDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

for (const state of [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  'needs-current-source-mutation-lifecycle-closeout-closure-final-close',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-decision-note',
]) {
  assert.ok(payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseStates.includes(state), state);
}
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-readiness',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseEvidenceTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-record',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseBlockerTypes.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-status-attempts-source-mutation',
  ),
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
  'sourceMutationLifecycleCloseoutClosureFinalCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefs',
  'lifecycleCloseReviewAllowed',
  'lifecycleCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(recordRequired.includes(field), `required field ${field}`);
}
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-is-not-actual-lifecycle-close-or-source-mutation',
  ),
);

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseFileAdopted,
  false,
);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState.lifecycleCloseReviewAllowed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState.lifecycleCloseAccepted, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState.lifecycleClosed, false);
assert.equal(payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState.sourceMutationAllowed, false);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.currentSourceMutationLifecycleCloseoutClosureLifecycleCloseRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRequired, true);
assert.equal(payload.readiness.sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRequired, true);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStatus, true);
assert.equal(payload.readiness.lifecycleCloseReviewAllowed, false);
assert.equal(payload.readiness.lifecycleCloseAccepted, false);
assert.equal(payload.readiness.lifecycleClosed, false);
assert.equal(payload.readiness.sourceMutationAllowed, false);
assert.equal(payload.readiness.remediationExecutionAllowed, false);
assert.equal(payload.readiness.memoryPersistenceAllowed, false);
assert.equal(payload.readiness.gatewayExecutionAuthorityAllowed, false);
assert.equal(
  payload.nextRecommendedSlice.id,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
);
assert.equal(
  payload.nextRecommendedSlice.commandToAdd,
  'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureFinalClose: true,
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

const typoResult = runLifecycleCloseStatus(['--typo']);
assert.equal(typoResult.status, 2);
assert.equal(typoResult.payload?.ok, false);
assert.equal(
  typoResult.payload?.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status',
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
  /Sixty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
);
assert.match(plan, /current source mutation lifecycle closeout closure lifecycle close record/);
assert.match(plan, /source mutation lifecycle closeout closure lifecycle close criteria refs/);
assert.match(plan, /source mutation lifecycle closeout closure lifecycle close decision note refs/);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Sixty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status`/,
);
assert.match(
  plan,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
);
assert.match(harnessBaseline, /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/);
assert.match(completionReadiness, /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/);
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status-readonly-post-m7-868/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
