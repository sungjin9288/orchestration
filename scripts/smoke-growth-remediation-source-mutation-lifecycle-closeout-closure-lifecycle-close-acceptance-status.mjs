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

const sourceSummaryEvidence = [
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
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseAcceptanceStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-ready-for-lifecycle-close-finalization-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-decision-note',
];

const lifecycleCloseAcceptanceDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-readiness',
];

const lifecycleCloseAcceptanceEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-record',
];

const lifecycleCloseAcceptanceBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStates,
  lifecycleCloseAcceptanceStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionTypes,
  lifecycleCloseAcceptanceDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceEvidenceTypes,
  lifecycleCloseAcceptanceEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceBlockerTypes,
  lifecycleCloseAcceptanceBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRecord.required;
const lifecycleCloseAcceptanceRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefs',
  'lifecycleCloseFinalizationAllowed',
  'lifecycleCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(recordRequired, lifecycleCloseAcceptanceRecordFields, 'required field');
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-is-not-lifecycle-close-or-source-mutation',
  ),
);

const lifecycleCloseAcceptanceStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceFileAdopted: false,
  lifecycleCloseFinalizationAllowed: false,
  lifecycleCloseAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRequired: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStatus: true,
  lifecycleCloseFinalizationAllowed: false,
  lifecycleCloseAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState,
  lifecycleCloseAcceptanceStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceState',
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
};

assertFieldsEqual(payload.safetyBoundary, safetyBoundaryEvidence, 'safetyBoundary');

const typoResult = runLifecycleCloseAcceptanceStatus(['--typo']);
assert.equal(typoResult.status, 2);
const invalidArgumentEvidence = {
  ok: false,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
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
  /Sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close acceptance record/,
  /source mutation lifecycle closeout closure lifecycle close acceptance criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close acceptance decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close acceptance status stays separate from actual source mutation execution/,
  /Sixty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
];

const crossDocumentEvidence = {
  harnessBaseline,
  completionReadiness,
  taskLedger,
};

assertTextHasAll(plan, growthGatewayPlanEvidence);
assert.match(
  crossDocumentEvidence.harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/,
);
assert.match(
  crossDocumentEvidence.completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status/,
);
assert.match(
  crossDocumentEvidence.taskLedger,
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
