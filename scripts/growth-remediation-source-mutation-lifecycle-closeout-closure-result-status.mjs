import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE = 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status';
requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-dispatch-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-authorization-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const CLOSURE_RESULT_STATES = [
  'source-mutation-lifecycle-closeout-closure-result-not-started',
  'source-mutation-lifecycle-closeout-closure-result-ready',
  'source-mutation-lifecycle-closeout-closure-result-blocked',
  'source-mutation-lifecycle-closeout-closure-result-ready-for-review-contract',
  'source-mutation-lifecycle-closeout-closure-result-rejected',
  'source-mutation-lifecycle-closeout-closure-result-deferred',
  'needs-current-source-mutation-lifecycle-closeout-closure-result',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution',
  'needs-current-source-mutation-lifecycle-closeout-closure-dispatch',
  'needs-current-source-mutation-lifecycle-closeout-closure-execution-readiness',
  'needs-current-source-mutation-lifecycle-closeout-closure-authorization',
  'needs-current-source-mutation-lifecycle-closeout-closure-readiness',
  'needs-current-source-mutation-lifecycle-closeout-review-acceptance',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-lifecycle-closeout-closure-result-criteria',
  'needs-source-mutation-lifecycle-closeout-closure-result-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-closure-result-blocked',
  'closed-no-action',
];

const CLOSURE_RESULT_DECISION_TYPES = [
  'record-source-mutation-lifecycle-closeout-closure-result-review-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-result',
  'request-current-source-mutation-lifecycle-closeout-closure-execution',
  'request-current-source-mutation-lifecycle-closeout-closure-dispatch',
  'request-current-source-mutation-lifecycle-closeout-closure-execution-readiness',
  'request-current-source-mutation-lifecycle-closeout-closure-authorization',
  'request-current-source-mutation-lifecycle-closeout-closure-readiness',
  'request-current-source-mutation-lifecycle-closeout-review-acceptance',
  'request-current-source-mutation-lifecycle-closeout',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-lifecycle-closeout-closure-result-criteria',
  'request-source-mutation-lifecycle-closeout-closure-result-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout-closure-result',
  'defer-source-mutation-lifecycle-closeout-closure-result',
  'hold-baseline',
];

const CLOSURE_RESULT_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-closure-result-record',
  'source-mutation-lifecycle-closeout-closure-result-criteria',
  'source-mutation-lifecycle-closeout-closure-result-decision-note',
  'source-mutation-lifecycle-closeout-closure-execution-record',
  'source-mutation-lifecycle-closeout-closure-execution-criteria',
  'source-mutation-lifecycle-closeout-closure-execution-decision-note',
  'source-mutation-lifecycle-closeout-closure-dispatch-record',
  'source-mutation-lifecycle-closeout-closure-execution-readiness-record',
  'source-mutation-lifecycle-closeout-closure-authorization-record',
  'source-mutation-lifecycle-closeout-closure-readiness-record',
  'source-mutation-lifecycle-closeout-review-acceptance-record',
  'source-mutation-lifecycle-closeout-record',
  'exact-scope-lock',
  'target-lock',
  'baseline-digest',
  'clean-baseline-proof',
  'patch-draft',
  'diff-preview',
  'verification-output',
  'dry-run-proof',
  'rollback-proof',
  'source-of-truth-doc',
  'negative-evidence-clearance',
  'task-ledger-ref',
  'aggregate-verification',
];

const CLOSURE_RESULT_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-closure-result-missing',
  'source-mutation-lifecycle-closeout-closure-result-stale',
  'source-mutation-lifecycle-closeout-closure-result-rejected',
  'source-mutation-lifecycle-closeout-closure-execution-missing',
  'source-mutation-lifecycle-closeout-closure-execution-stale',
  'source-mutation-lifecycle-closeout-closure-dispatch-missing',
  'source-mutation-lifecycle-closeout-closure-dispatch-stale',
  'source-mutation-lifecycle-closeout-closure-execution-readiness-missing',
  'source-mutation-lifecycle-closeout-closure-authorization-missing',
  'source-mutation-lifecycle-closeout-closure-readiness-missing',
  'source-mutation-lifecycle-closeout-review-acceptance-missing',
  'source-mutation-lifecycle-closeout-missing',
  'clean-baseline-proof-missing',
  'dirty-baseline',
  'untracked-baseline',
  'exact-scope-lock-missing',
  'target-lock-missing',
  'baseline-digest-missing',
  'patch-draft-missing',
  'diff-preview-missing',
  'verification-output-missing',
  'verification-output-failed',
  'dry-run-proof-missing',
  'rollback-proof-missing',
  'source-mutation-lifecycle-closeout-closure-result-criteria-missing',
  'source-mutation-lifecycle-closeout-closure-result-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-closure-result-status-attempts-source-mutation',
];

function runGitOrNull(args) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (_error) {
    return null;
  }
}

function readSource(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const exists = fs.existsSync(absolutePath);

  return {
    path: relativePath,
    exists,
    text: exists ? fs.readFileSync(absolutePath, 'utf8') : '',
  };
}

function sourceText(sources, relativePath) {
  return sources.find((source) => source.path === relativePath)?.text || '';
}

function fields(required, optional = []) {
  return { required, optional };
}

function summarizeSources(sources) {
  const agents = sourceText(sources, 'AGENTS.md');
  const masterBrief = sourceText(sources, 'docs/00_master-brief.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const roadmap = sourceText(sources, 'docs/03_architecture-roadmap-v1.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const completionReadiness = sourceText(sources, 'docs/17_v1-completion-readiness.md');
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const pack = sourceText(sources, 'packs/development/pack.md');
  const resultStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-status.mjs',
  );
  const executionStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationLifecycleCloseoutClosureExecutionDocumented:
      /Forty-seventh Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureResultDocumented:
      /Forty-eighth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-closure-result-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureExecutionImplemented:
      /mode: MODE/.test(executionStatus) ||
      /growth-remediation-source-mutation-lifecycle-closeout-closure-execution-status/.test(
        executionStatus,
      ),
    sourceMutationLifecycleCloseoutClosureResultImplemented: /mode: MODE/.test(resultStatus),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseoutClosureResult:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationLifecycleCloseoutClosureResult:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationLifecycleCloseoutClosureResult:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status-readonly-post-m7-855/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseoutClosureResult:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutClosureResultReviewNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status/.test(
        plan,
      ),
    currentSourceMutationLifecycleCloseoutClosureResultDocumented:
      /current source mutation lifecycle closeout closure result record/.test(plan),
    currentSourceMutationLifecycleCloseoutClosureExecutionDocumented:
      /current source mutation lifecycle closeout closure execution record/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure result criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure result decision note refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureExecutionCriteriaRefsDocumented:
      /source mutation lifecycle closeout closure execution criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRefsDocumented:
      /source mutation lifecycle closeout closure execution decision note refs/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    dryRunProofDocumented: /dry-run proof refs/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceMutationLifecycleCloseoutClosureResultSeparateFromMutation:
      /source mutation lifecycle closeout closure result status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutClosureResultStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches/.test(plan),
    sourceMutationStillBlocked:
      /without closing the lifecycle(?:,| or)\s+applying patches(?:,| or)\s+mutating source/.test(
        plan,
      ),
    remediationExecutionStillBlocked: /opening remediation execution, or executing remediation/.test(
      plan,
    ),
  };
}

const sourceMutationLifecycleCloseoutClosureResultSchema = {
  sourceMutationLifecycleCloseoutClosureResultRecord: fields(
    [
      'sourceMutationLifecycleCloseoutClosureResultId',
      'sourceMutationLifecycleCloseoutClosureExecutionId',
      'sourceMutationLifecycleCloseoutClosureDispatchId',
      'sourceMutationLifecycleCloseoutClosureExecutionReadinessId',
      'sourceMutationLifecycleCloseoutClosureAuthorizationId',
      'sourceMutationLifecycleCloseoutClosureReadinessId',
      'sourceMutationLifecycleCloseoutReviewAcceptanceId',
      'sourceMutationLifecycleCloseoutId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutClosureResultCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureResultDecisionNoteRefs',
      'sourceMutationLifecycleCloseoutClosureExecutionCriteriaRefs',
      'sourceMutationLifecycleCloseoutClosureExecutionDecisionNoteRefs',
      'exactScopeLockRefs',
      'targetLockRefs',
      'baselineDigestRefs',
      'cleanBaselineProofRefs',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationOutputRefs',
      'dryRunProofRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'negativeEvidenceClearanceRefs',
      'blockerRefs',
      'reviewAllowed',
      'resultAccepted',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureResultDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutClosureResultId',
      'sourceMutationLifecycleCloseoutClosureExecutionId',
      'sourceMutationLifecycleCloseoutId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'reviewAllowed',
      'resultAccepted',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureResultBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutClosureResultId',
      'sourceMutationLifecycleCloseoutClosureExecutionId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutClosureResultReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutClosureResultIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutClosureResultRefs',
      'sourceMutationLifecycleCloseoutClosureExecutionRefs',
      'sourceMutationLifecycleCloseoutClosureDispatchRefs',
      'sourceMutationLifecycleCloseoutClosureExecutionReadinessRefs',
      'sourceMutationLifecycleCloseoutClosureAuthorizationRefs',
      'sourceMutationLifecycleCloseoutClosureReadinessRefs',
      'sourceMutationLifecycleCloseoutReviewAcceptanceRefs',
      'sourceMutationLifecycleCloseoutRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutClosureResultRules = [
  {
    id: 'source-mutation-lifecycle-closeout-closure-result-requires-current-execution-chain',
    rule:
      'source mutation lifecycle closeout closure result can only bind to one current lifecycle closeout closure execution record and its current lifecycle closeout chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-result-is-not-source-mutation',
    rule:
      'source mutation lifecycle closeout closure result status may mark result review readiness, but it cannot close the lifecycle, accept results, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-result-requires-criteria-and-decision-notes',
    rule:
      'lifecycle closeout closure result criteria refs and lifecycle closeout closure result decision note refs must be present before closure result review can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-closure-result-requires-verification-dry-run-and-rollback-proof',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout closure result review can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-closure-result-blocks-review',
    rule:
      'stale result proof, stale execution proof, stale dispatch proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closure result criteria, missing closure result decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout closure result review',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationLifecycleCloseoutClosureResultSchema,
).every((schema) => schema.required.length > 0);
const ok =
  missingSources.length === 0 &&
  Object.entries(sourceSummary)
    .filter(([key]) => key !== 'sourceCount' && key !== 'availableSourceCount')
    .every(([_key, value]) => value === true) &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: MODE,
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-closure-result-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutClosureResultStates: CLOSURE_RESULT_STATES,
    sourceMutationLifecycleCloseoutClosureResultDecisionTypes: CLOSURE_RESULT_DECISION_TYPES,
    sourceMutationLifecycleCloseoutClosureResultEvidenceTypes: CLOSURE_RESULT_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutClosureResultBlockerTypes: CLOSURE_RESULT_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutClosureResultSchema,
  sourceMutationLifecycleCloseoutClosureResultRules,
  sourceMutationLifecycleCloseoutClosureResultState: {
    realSourceMutationLifecycleCloseoutClosureResultFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutClosureResultRecords: 0,
    reviewAllowed: false,
    resultAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout-closure-result',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutClosureResultRecordTypes: Object.keys(
      sourceMutationLifecycleCloseoutClosureResultSchema,
    ).length,
    currentSourceMutationLifecycleCloseoutClosureResultRequired: true,
    currentSourceMutationLifecycleCloseoutClosureExecutionRequired: true,
    currentSourceMutationLifecycleCloseoutClosureDispatchRequired: true,
    currentSourceMutationLifecycleCloseoutClosureExecutionReadinessRequired: true,
    currentSourceMutationLifecycleCloseoutClosureAuthorizationRequired: true,
    currentSourceMutationLifecycleCloseoutClosureReadinessRequired: true,
    currentSourceMutationLifecycleCloseoutReviewAcceptanceRequired: true,
    currentSourceMutationLifecycleCloseoutRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutClosureResultCriteriaRequired: true,
    sourceMutationLifecycleCloseoutClosureResultDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutClosureResultAndMutationSeparate: true,
    reviewAllowed: false,
    resultAccepted: false,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutClosureResultReviewStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-closure-result-review-status.mjs',
    reason:
      'Source mutation lifecycle closeout closure result is now modeled as read-only; the next safe slice should check closure result review without accepting results, lifecycle closure, patch application, or source mutation.',
    mustRemainReadOnly: true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotGenerateProposals: true,
    doesNotApplyProposals: true,
    doesNotGeneratePatch: true,
    doesNotApplyPatch: true,
    doesNotAcceptSourceMutationLifecycleCloseoutClosureResult: true,
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
  },
  failures: {
    missingSources,
    sourceSummary,
    requiredFieldsSatisfied,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
