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

function assertFlagsAreTrue(source, keys, label) {
  for (const key of keys) {
    assert.equal(source[key], true, `${label}.${key}`);
  }
}

function assertIncludesAll(source, values, label) {
  for (const value of values) {
    assert.ok(source.includes(value), `${label}: ${value}`);
  }
}

function assertFieldsEqual(source, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    assert.equal(source[key], value, `${label}.${key}`);
  }
}

function assertTextHasAll(text, patterns) {
  for (const pattern of patterns) {
    assert.match(text, pattern);
  }
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

const sourceSummaryEvidence = [
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
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseFinalCloseStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-ready-for-lifecycle-close-contract',
];

const lifecycleCloseFinalCloseDecisionEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-readiness',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStates,
  lifecycleCloseFinalCloseStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionTypes,
  lifecycleCloseFinalCloseDecisionEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionTypes',
);

const required =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseRecord.required;
const lifecycleCloseFinalCloseRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseDecisionNoteRefs',
  'lifecycleCloseAllowed',
  'lifecycleCloseFinalCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(required, lifecycleCloseFinalCloseRecordFields, 'required field');

const lifecycleCloseFinalCloseStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseFileAdopted: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseStatus: true,
  lifecycleCloseAllowed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: nextMode,
  commandToAdd: `node scripts/${nextMode}.mjs`,
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseState,
  lifecycleCloseFinalCloseStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalCloseState',
);
assertFieldsEqual(payload.readiness, readinessEvidence, 'readiness');
assertFieldsEqual(payload.nextRecommendedSlice, nextRecommendedSliceEvidence, 'nextRecommendedSlice');

const safetyBoundaryEvidence = {
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
};

assertFieldsEqual(payload.safetyBoundary, safetyBoundaryEvidence, 'safetyBoundary');

const typoResult = runStatus(['--typo']);
const invalidArgumentEvidence = {
  ok: false,
  mode,
  error: 'invalid-arguments',
};

assert.equal(typoResult.status, 2);
assertFieldsEqual(typoResult.payload, invalidArgumentEvidence, 'invalidArgument');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const taskLedger = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

const growthGatewayPlanEvidence = [
  /Three-hundred-sixty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
  new RegExp('node scripts/' + mode + '\\.mjs'),
  /current source mutation lifecycle closeout closure lifecycle close final\s+close\s+record/,
  /source mutation lifecycle closeout closure lifecycle close final close criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close final close decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close final close status stays separate from actual source mutation execution/,
  /Seventieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status-recheck`/,
  /existing lifecycle close status command rechecked/,
];

const crossDocumentEvidence = [
  {
    text: harnessBaseline,
    patterns: [new RegExp(mode)],
  },
  {
    text: completionReadiness,
    patterns: [new RegExp(mode)],
  },
  {
    text: taskLedger,
    patterns: [
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-final-close-status-recheck-after-lifecycle-close-finalization-acceptance-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1173/,
    ],
  },
];

assertTextHasAll(plan, growthGatewayPlanEvidence);
for (const { text, patterns } of crossDocumentEvidence) {
  assertTextHasAll(text, patterns);
}

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
