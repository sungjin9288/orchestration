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

const sourceSummaryEvidence = [
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
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseReviewStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-ready-for-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-decision-note',
];

const lifecycleCloseReviewDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-readiness',
];

const lifecycleCloseReviewEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-record',
];

const lifecycleCloseReviewBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStates,
  lifecycleCloseReviewStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionTypes,
  lifecycleCloseReviewDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewEvidenceTypes,
  lifecycleCloseReviewEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewBlockerTypes,
  lifecycleCloseReviewBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRecord.required;
const lifecycleCloseReviewRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefs',
  'lifecycleCloseReviewAcceptanceAllowed',
  'lifecycleCloseReviewAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(recordRequired, lifecycleCloseReviewRecordFields, 'required field');

assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-is-not-acceptance-or-source-mutation',
  ),
);

const lifecycleCloseReviewStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewFileAdopted: false,
  lifecycleCloseReviewAcceptanceAllowed: false,
  lifecycleCloseReviewAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRequired: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStatus: true,
  lifecycleCloseReviewAcceptanceAllowed: false,
  lifecycleCloseReviewAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState,
  lifecycleCloseReviewStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewState',
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

const typoResult = runLifecycleCloseReviewStatus(['--typo']);
const invalidArgumentEvidence = {
  ok: false,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
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
  /Sixty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close review record/,
  /source mutation lifecycle closeout closure lifecycle close review criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close review decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close review status stays separate from actual source mutation execution/,
  /Sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
];

const crossDocumentEvidence = [
  {
    text: harnessBaseline,
    patterns: [/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/],
  },
  {
    text: completionReadiness,
    patterns: [/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status/],
  },
  {
    text: taskLedger,
    patterns: [
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status-readonly-post-m7-869/,
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
