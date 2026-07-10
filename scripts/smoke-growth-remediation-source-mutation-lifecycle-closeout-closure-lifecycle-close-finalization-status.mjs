import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseFinalizationScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
);

function runLifecycleCloseFinalizationStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseFinalizationScript, ...args], {
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

const result = runLifecycleCloseFinalizationStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/v0',
);

const sourceSummaryEvidence = [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStillBlocked',
  'remediationExecutionStillBlocked',
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseFinalizationStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-ready-for-lifecycle-close-finalization-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-decision-note',
];

const lifecycleCloseFinalizationDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-readiness',
];

const lifecycleCloseFinalizationEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-record',
];

const lifecycleCloseFinalizationBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStates,
  lifecycleCloseFinalizationStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionTypes,
  lifecycleCloseFinalizationDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationEvidenceTypes,
  lifecycleCloseFinalizationEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationBlockerTypes,
  lifecycleCloseFinalizationBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRecord.required;
const lifecycleCloseFinalizationRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRefs',
  'lifecycleCloseFinalizationReviewAllowed',
  'lifecycleCloseFinalized',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(recordRequired, lifecycleCloseFinalizationRecordFields, 'required field');
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-is-not-lifecycle-close-or-source-mutation',
  ),
);

const lifecycleCloseFinalizationStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationFileAdopted: false,
  lifecycleCloseFinalizationReviewAllowed: false,
  lifecycleCloseFinalized: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  currentSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationCriteriaRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationDecisionNoteRequired: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStatus: true,
  lifecycleCloseFinalizationReviewAllowed: false,
  lifecycleCloseFinalized: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationState,
  lifecycleCloseFinalizationStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationState',
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
  doesNotFinalizeSourceMutationLifecycleCloseoutClosureLifecycleClose: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalization: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptance: true,
  doesNotAcceptSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance: true,
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

const typoResult = runLifecycleCloseFinalizationStatus(['--typo']);
assert.equal(typoResult.status, 2);
const invalidArgumentEvidence = {
  ok: false,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status',
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
  /Sixty-fifth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close finalization record/,
  /source mutation lifecycle closeout closure lifecycle close finalization criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization status stays separate from actual source mutation execution/,
  /Sixty-sixth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
];

const crossDocumentEvidence = {
  harnessBaseline,
  completionReadiness,
  taskLedger,
};

assertTextHasAll(plan, growthGatewayPlanEvidence);
assert.match(
  crossDocumentEvidence.harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/,
);
assert.match(
  crossDocumentEvidence.completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status/,
);
assert.match(
  crossDocumentEvidence.taskLedger,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status-readonly-post-m7-872/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      script:
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
