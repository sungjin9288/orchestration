import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const mode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status';
const nextMode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status';
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
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-contract',
);
assert.equal(payload.schemaVersion, `${mode}/v0`);

for (const key of [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStillBlocked',
  'remediationExecutionStillBlocked',
]) {
  assert.equal(payload.sourceSummary[key], true, `sourceSummary.${key}`);
}

assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStates.includes(
    'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-ready-for-lifecycle-close-contract',
  ),
);
assert.ok(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionTypes.includes(
    'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-readiness',
  ),
);

const required =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseRecord.required;
for (const field of [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionNoteRefs',
  'lifecycleCloseAllowed',
  'lifecycleCloseFinalCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
]) {
  assert.ok(required.includes(field), `required field ${field}`);
}

assert.equal(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseState
    .realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseFileAdopted,
  false,
);
assert.equal(payload.readiness.requiredFieldsSatisfied, true);
assert.equal(payload.readiness.readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseStatus, true);
assert.equal(payload.readiness.lifecycleCloseAllowed, false);
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalClose: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptance: true,
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
  /Three-hundred-sixty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
);
assert.match(plan, new RegExp('node scripts/' + mode + '\\.mjs'));
assert.match(
  plan,
  /current source mutation lifecycle closeout closure lifecycle close final\s+close\s+record/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close final close criteria refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close final close decision note refs/,
);
assert.match(
  plan,
  /source mutation lifecycle closeout closure lifecycle close final close status stays separate from actual source mutation execution/,
);
assert.match(
  plan,
  /Seventieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status-recheck`/,
);
assert.match(plan, /existing lifecycle close status command rechecked/);
assert.match(harnessBaseline, new RegExp(mode));
assert.match(completionReadiness, new RegExp(mode));
assert.match(
  taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1173/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStatus: {
        mode: payload.mode,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
