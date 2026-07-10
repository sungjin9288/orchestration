import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const mode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status';
const nextMode =
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-status';
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
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-contract',
);
assert.equal(payload.schemaVersion, `${mode}/v0`);

const sourceSummaryEvidence = [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseFinalizationReviewAcceptanceStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-ready-for-lifecycle-close-finalization-acceptance-contract',
];

const lifecycleCloseFinalizationReviewAcceptanceDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-acceptance-readiness',
];

const lifecycleCloseFinalizationReviewAcceptanceEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-record',
];

const lifecycleCloseFinalizationReviewAcceptanceBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStates,
  lifecycleCloseFinalizationReviewAcceptanceStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStates',
);
assertIncludesAll(
  payload.vocabulary
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionTypes,
  lifecycleCloseFinalizationReviewAcceptanceDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceEvidenceTypes,
  lifecycleCloseFinalizationReviewAcceptanceEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceBlockerTypes,
  lifecycleCloseFinalizationReviewAcceptanceBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceBlockerTypes',
);

const required =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceRecord.required;
const lifecycleCloseFinalizationReviewAcceptanceRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceDecisionNoteRefs',
  'lifecycleCloseFinalizationAcceptanceAllowed',
  'lifecycleCloseFinalizationReviewAcceptanceAccepted',
  'lifecycleCloseFinalizationReviewAccepted',
  'lifecycleCloseFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(required, lifecycleCloseFinalizationReviewAcceptanceRecordFields, 'required field');

const lifecycleCloseFinalizationReviewAcceptanceStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceFileAdopted:
    false,
  lifecycleCloseFinalizationAcceptanceAllowed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationAcceptanceStatus: true,
  lifecycleCloseFinalizationAcceptanceAllowed: false,
  lifecycleCloseFinalizationReviewAcceptanceAccepted: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: nextMode,
  commandToAdd: `node scripts/${nextMode}.mjs`,
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceState,
  lifecycleCloseFinalizationReviewAcceptanceStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceState',
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
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptance: true,
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
};

assertFieldsEqual(payload.safetyBoundary, safetyBoundaryEvidence, 'safetyBoundary');

const typoResult = runStatus(['--typo']);
assert.equal(typoResult.status, 2);
const invalidArgumentEvidence = {
  ok: false,
  mode,
  error: 'invalid-arguments',
};

assertFieldsEqual(typoResult.payload, invalidArgumentEvidence, 'invalidArgument');

const plan = fs.readFileSync(path.join(repoRoot, 'docs', '18_growth-gateway-vnext.md'), 'utf8');
const harnessBaseline = fs.readFileSync(path.join(repoRoot, 'docs', '13_harness-baseline.md'), 'utf8');
const completionReadiness = fs.readFileSync(
  path.join(repoRoot, 'docs', '17_v1-completion-readiness.md'),
  'utf8',
);
const taskLedger = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');

const growthGatewayPlanEvidence = [
  /Three-hundred-sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-recheck-after-lifecycle-close-finalization-review-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
  new RegExp(`node scripts/${mode}\\.mjs`),
  /current source mutation lifecycle closeout closure lifecycle close finalization review\s+acceptance\s+record/,
  /source mutation lifecycle closeout closure lifecycle close finalization review acceptance criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization review acceptance decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization review acceptance status stays separate from actual source mutation execution/,
  new RegExp('Sixty-eighth Implemented Slice: `' + nextMode + '`'),
  new RegExp('node scripts/' + nextMode + '\\.mjs'),
];

const crossDocumentEvidence = {
  harnessBaseline,
  completionReadiness,
  taskLedger,
};

assertTextHasAll(plan, growthGatewayPlanEvidence);
assert.match(harnessBaseline, new RegExp(mode));
assert.match(completionReadiness, new RegExp(mode));
assert.match(
  crossDocumentEvidence.taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status-recheck-after-lifecycle-close-finalization-review-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-readonly-post-m7-1171/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStatus: {
        mode: payload.mode,
        nextRecommendedSlice: payload.nextRecommendedSlice.id,
        readOnly: payload.safetyBoundary.readOnly,
      },
    },
    null,
    2,
  ),
);
