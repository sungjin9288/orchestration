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

const sourceSummaryEvidence = [
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
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseFinalizationReviewStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-ready-for-lifecycle-close-finalization-review-acceptance-contract',
];

const lifecycleCloseFinalizationReviewDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-readiness',
];

const lifecycleCloseFinalizationReviewEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-record',
];

const lifecycleCloseFinalizationReviewBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStates,
  lifecycleCloseFinalizationReviewStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionTypes,
  lifecycleCloseFinalizationReviewDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewEvidenceTypes,
  lifecycleCloseFinalizationReviewEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewBlockerTypes,
  lifecycleCloseFinalizationReviewBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRecord.required;
const lifecycleCloseFinalizationReviewRecordFields = [
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
];

assertIncludesAll(recordRequired, lifecycleCloseFinalizationReviewRecordFields, 'required field');
assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-is-not-lifecycle-close-or-source-mutation',
  ),
);

const lifecycleCloseFinalizationReviewStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewFileAdopted: false,
  lifecycleCloseFinalizationReviewAcceptanceAllowed: false,
  lifecycleCloseFinalizationReviewAccepted: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewAcceptanceStatus:
    true,
  lifecycleCloseFinalizationReviewAcceptanceAllowed: false,
  lifecycleCloseFinalizationReviewAccepted: false,
  lifecycleCloseFinalized: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState,
  lifecycleCloseFinalizationReviewStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseFinalizationReviewState',
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

const typoResult = runLifecycleCloseFinalizationReviewStatus(['--typo']);
assert.equal(typoResult.status, 2);
const invalidArgumentEvidence = {
  ok: false,
  mode:
    'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status',
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
  /Three-hundred-sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status-recheck-after-lifecycle-close-finalization-status-current-final-close-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance-finalization-acceptance`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close finalization review\s+record/,
  /source mutation lifecycle closeout closure lifecycle close finalization review criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization review decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close finalization review status stays separate from actual source mutation execution/,
  /Sixty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-acceptance-status\.mjs/,
];

const crossDocumentEvidence = {
  harnessBaseline,
  completionReadiness,
  taskLedger,
};

assertTextHasAll(plan, growthGatewayPlanEvidence);
assert.match(
  crossDocumentEvidence.harnessBaseline,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/,
);
assert.match(
  crossDocumentEvidence.completionReadiness,
  /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-finalization-review-status/,
);
assert.match(
  crossDocumentEvidence.taskLedger,
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
