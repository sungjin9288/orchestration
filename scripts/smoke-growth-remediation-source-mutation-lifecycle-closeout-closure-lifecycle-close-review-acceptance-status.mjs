import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const lifecycleCloseReviewAcceptanceScript = path.join(
  repoRoot,
  'scripts',
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
);

function runLifecycleCloseReviewAcceptanceStatus(args = []) {
  const result = spawnSync(process.execPath, [lifecycleCloseReviewAcceptanceScript, ...args], {
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

const result = runLifecycleCloseReviewAcceptanceStatus();
assert.equal(
  result.status,
  0,
  `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status failed: ${result.stderr}`,
);
const payload = result.payload;

assert.equal(payload.ok, true);
assert.equal(
  payload.mode,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
);
assert.equal(
  payload.posture,
  'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-contract',
);
assert.equal(
  payload.schemaVersion,
  'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/v0',
);

const sourceSummaryEvidence = [
  'growthGatewayPlanPresent',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceImplemented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewImplemented',
  'harnessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'completionReadinessMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'ledgerMentionsSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'verificationIncludesSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptance',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceNextDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDocumented',
  'currentSourceMutationLifecycleCloseoutClosureLifecycleCloseDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewCriteriaRefsDocumented',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewDecisionNoteRefsDocumented',
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
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSeparateFromMutation',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStillBlocked',
  'remediationExecutionStillBlocked',
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseReviewAcceptanceStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-ready-for-lifecycle-close-acceptance-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close-review',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-decision-note',
];

const lifecycleCloseReviewAcceptanceDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-readiness',
];

const lifecycleCloseReviewAcceptanceEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-record',
];

const lifecycleCloseReviewAcceptanceBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStates,
  lifecycleCloseReviewAcceptanceStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionTypes,
  lifecycleCloseReviewAcceptanceDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceEvidenceTypes,
  lifecycleCloseReviewAcceptanceEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceBlockerTypes,
  lifecycleCloseReviewAcceptanceBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRecord.required;
const lifecycleCloseReviewAcceptanceRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRefs',
  'lifecycleCloseAcceptanceAllowed',
  'lifecycleCloseReviewAcceptanceAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(recordRequired, lifecycleCloseReviewAcceptanceRecordFields, 'required field');

assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-is-not-lifecycle-close-or-source-mutation',
  ),
);

const lifecycleCloseReviewAcceptanceStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceFileAdopted: false,
  lifecycleCloseAcceptanceAllowed: false,
  lifecycleCloseReviewAcceptanceAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  currentSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceCriteriaRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceDecisionNoteRequired: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseAcceptanceStatus: true,
  lifecycleCloseAcceptanceAllowed: false,
  lifecycleCloseReviewAcceptanceAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState,
  lifecycleCloseReviewAcceptanceStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseReviewAcceptanceState',
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

const typoResult = runLifecycleCloseReviewAcceptanceStatus(['--typo']);
const invalidArgumentEvidence = {
  ok: false,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status',
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
  /Sixty-third Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close review acceptance record/,
  /source mutation lifecycle closeout closure lifecycle close review acceptance criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close review acceptance decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close review acceptance status stays separate from actual source mutation execution/,
  /Sixty-fourth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status\.mjs/,
];

const crossDocumentEvidence = [
  {
    text: harnessBaseline,
    patterns: [
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/,
    ],
  },
  {
    text: completionReadiness,
    patterns: [
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status/,
    ],
  },
  {
    text: taskLedger,
    patterns: [
      /growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status-readonly-post-m7-870/,
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
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-acceptance-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-acceptance-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
