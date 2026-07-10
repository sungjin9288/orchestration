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

const sourceSummaryEvidence = [
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
];

assertFlagsAreTrue(payload.sourceSummary, sourceSummaryEvidence, 'sourceSummary');

const lifecycleCloseStateVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-ready-for-review-contract',
  'needs-current-source-mutation-lifecycle-closeout-closure-lifecycle-close',
  'needs-current-source-mutation-lifecycle-closeout-closure-final-close',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-lifecycle-close-decision-note',
];

const lifecycleCloseDecisionVocabularyEvidence = [
  'record-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-readiness',
];

const lifecycleCloseEvidenceVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-record',
];

const lifecycleCloseBlockerVocabularyEvidence = [
  'source-mutation-lifecycle-closeout-closure-lifecycle-close-status-attempts-source-mutation',
];

assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseStates,
  lifecycleCloseStateVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseStates',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionTypes,
  lifecycleCloseDecisionVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseEvidenceTypes,
  lifecycleCloseEvidenceVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseEvidenceTypes',
);
assertIncludesAll(
  payload.vocabulary.sourceMutationLifecycleCloseoutClosureLifecycleCloseBlockerTypes,
  lifecycleCloseBlockerVocabularyEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseBlockerTypes',
);

const recordRequired =
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseSchema
    .sourceMutationLifecycleCloseoutClosureLifecycleCloseRecord.required;
const lifecycleCloseRecordFields = [
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseId',
  'sourceMutationLifecycleCloseoutClosureFinalCloseId',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRefs',
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRefs',
  'lifecycleCloseReviewAllowed',
  'lifecycleCloseAccepted',
  'lifecycleClosed',
  'sourceMutationAllowed',
  'remediationExecutionAllowed',
];

assertIncludesAll(recordRequired, lifecycleCloseRecordFields, 'required field');

assert.ok(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseRules.some(
    (rule) =>
      rule.id ===
      'source-mutation-lifecycle-closeout-closure-lifecycle-close-is-not-actual-lifecycle-close-or-source-mutation',
  ),
);

const lifecycleCloseStateEvidence = {
  realSourceMutationLifecycleCloseoutClosureLifecycleCloseFileAdopted: false,
  lifecycleCloseReviewAllowed: false,
  lifecycleCloseAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
};

const readinessEvidence = {
  requiredFieldsSatisfied: true,
  currentSourceMutationLifecycleCloseoutClosureLifecycleCloseRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseCriteriaRequired: true,
  sourceMutationLifecycleCloseoutClosureLifecycleCloseDecisionNoteRequired: true,
  readyForSourceMutationLifecycleCloseoutClosureLifecycleCloseReviewStatus: true,
  lifecycleCloseReviewAllowed: false,
  lifecycleCloseAccepted: false,
  lifecycleClosed: false,
  sourceMutationAllowed: false,
  remediationExecutionAllowed: false,
  memoryPersistenceAllowed: false,
  gatewayExecutionAuthorityAllowed: false,
};

const nextRecommendedSliceEvidence = {
  id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
  commandToAdd:
    'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status.mjs',
  mustRemainReadOnly: true,
};

assertFieldsEqual(
  payload.sourceMutationLifecycleCloseoutClosureLifecycleCloseState,
  lifecycleCloseStateEvidence,
  'sourceMutationLifecycleCloseoutClosureLifecycleCloseState',
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
};

assertFieldsEqual(payload.safetyBoundary, safetyBoundaryEvidence, 'safetyBoundary');

const typoResult = runLifecycleCloseStatus(['--typo']);
const invalidArgumentEvidence = {
  ok: false,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status',
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
  /Sixty-first Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status\.mjs/,
  /current source mutation lifecycle closeout closure lifecycle close record/,
  /source mutation lifecycle closeout closure lifecycle close criteria refs/,
  /source mutation lifecycle closeout closure lifecycle close decision note refs/,
  /source mutation lifecycle closeout closure lifecycle close status stays separate from actual source mutation execution/,
  /Sixty-second Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status`/,
  /node scripts\/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status\.mjs/,
];

const crossDocumentEvidence = [
  {
    text: harnessBaseline,
    patterns: [/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/],
  },
  {
    text: completionReadiness,
    patterns: [/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status/],
  },
  {
    text: taskLedger,
    patterns: [/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status-readonly-post-m7-868/],
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
        'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-status.mjs',
      nextRecommendedSlice:
        'growth-remediation-source-mutation-lifecycle-closeout-closure-lifecycle-close-review-status',
      runtimeChanged: false,
    },
    null,
    2,
  ),
);
