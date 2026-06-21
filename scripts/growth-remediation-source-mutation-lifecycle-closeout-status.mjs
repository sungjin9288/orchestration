import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/03_architecture-roadmap-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'packs/development/pack.md',
  'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-review-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_STATES = [
  'source-mutation-lifecycle-closeout-not-started',
  'source-mutation-lifecycle-closeout-ready',
  'source-mutation-lifecycle-closeout-blocked',
  'source-mutation-lifecycle-closeout-ready-for-review-contract',
  'source-mutation-lifecycle-closeout-rejected',
  'source-mutation-lifecycle-closeout-deferred',
  'needs-current-source-mutation-lifecycle-closeout',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-current-source-mutation-completion-review',
  'needs-current-source-mutation-completion',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-lifecycle-closeout-criteria',
  'needs-source-mutation-lifecycle-closeout-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-lifecycle-closeout-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_DECISION_TYPES = [
  'approve-source-mutation-lifecycle-closeout-review-readiness',
  'request-current-source-mutation-lifecycle-closeout',
  'request-current-source-mutation-completion-review-acceptance',
  'request-current-source-mutation-completion-review',
  'request-current-source-mutation-completion',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-lifecycle-closeout-criteria',
  'request-source-mutation-lifecycle-closeout-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-lifecycle-closeout',
  'defer-source-mutation-lifecycle-closeout',
  'hold-baseline',
];

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_EVIDENCE_TYPES = [
  'source-mutation-lifecycle-closeout-record',
  'source-mutation-lifecycle-closeout-criteria',
  'source-mutation-lifecycle-closeout-decision-note',
  'source-mutation-completion-review-acceptance-record',
  'source-mutation-completion-review-record',
  'source-mutation-completion-record',
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

const SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_BLOCKER_TYPES = [
  'source-mutation-lifecycle-closeout-missing',
  'source-mutation-lifecycle-closeout-stale',
  'source-mutation-lifecycle-closeout-rejected',
  'source-mutation-completion-review-acceptance-missing',
  'source-mutation-completion-review-acceptance-stale',
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
  'source-mutation-lifecycle-closeout-criteria-missing',
  'source-mutation-lifecycle-closeout-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-lifecycle-closeout-status-attempts-source-mutation',
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
  const lifecycleCloseoutStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
  );
  const completionReviewAcceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationCompletionReviewAcceptanceDocumented:
      /Thirty-ninth Implemented Slice: `growth-remediation-source-mutation-completion-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutDocumented:
      /Fortieth Implemented Slice: `growth-remediation-source-mutation-lifecycle-closeout-status`/.test(
        plan,
      ),
    sourceMutationCompletionReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-completion-review-acceptance-status'/.test(
        completionReviewAcceptanceStatus,
      ),
    sourceMutationLifecycleCloseoutImplemented:
      /mode: 'growth-remediation-source-mutation-lifecycle-closeout-status'/.test(
        lifecycleCloseoutStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationLifecycleCloseout:
      /growth-remediation-source-mutation-lifecycle-closeout-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationLifecycleCloseout:
      /growth-remediation-source-mutation-lifecycle-closeout-status/.test(completionReadiness),
    ledgerMentionsSourceMutationLifecycleCloseout:
      /growth-remediation-source-mutation-lifecycle-closeout-status-readonly-post-m7-847/.test(
        todo,
      ),
    verificationIncludesSourceMutationLifecycleCloseout:
      /growth-remediation-source-mutation-lifecycle-closeout-status/.test(verificationStatus),
    sourceMutationLifecycleCloseoutReviewNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-review-status/.test(plan),
    currentSourceMutationLifecycleCloseoutDocumented:
      /current source mutation lifecycle closeout record/.test(plan),
    currentSourceMutationCompletionReviewAcceptanceDocumented:
      /current source mutation completion review acceptance record/.test(plan),
    currentSourceMutationCompletionReviewDocumented:
      /current source mutation completion review record/.test(plan),
    currentSourceMutationCompletionDocumented: /current source mutation completion record/.test(
      plan,
    ),
    sourceMutationLifecycleCloseoutCriteriaDocumented:
      /source mutation lifecycle closeout criteria refs/.test(plan),
    sourceMutationLifecycleCloseoutDecisionNoteDocumented:
      /source mutation lifecycle closeout decision note refs/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs|patch\/diff proof/.test(plan),
    diffPreviewDocumented: /diff preview refs|patch\/diff proof/.test(plan),
    verificationOutputDocumented: /verification output/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    rollbackProofDocumented: /rollback proof/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceMutationLifecycleCloseoutSeparateFromMutation:
      /source mutation lifecycle closeout status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutStillBlocked:
      /before\s+source mutation lifecycle closeout review can be\s+considered/.test(plan),
    sourceMutationStillBlocked: /without applying patches(?:,| or)\s+mutating source/.test(plan),
    remediationExecutionStillBlocked: /or remediation execution/.test(plan),
  };
}

const sourceMutationLifecycleCloseoutSchema = {
  sourceMutationLifecycleCloseoutRecord: fields(
    [
      'sourceMutationLifecycleCloseoutId',
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'sourceMutationCompletionId',
      'state',
      'decisionType',
      'sourceMutationLifecycleCloseoutCriteriaRefs',
      'sourceMutationLifecycleCloseoutDecisionNoteRefs',
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
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationLifecycleCloseoutDecision: fields(
    [
      'decisionId',
      'sourceMutationLifecycleCloseoutId',
      'sourceMutationCompletionReviewAcceptanceId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'lifecycleClosed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationLifecycleCloseoutBlocker: fields(
    [
      'blockerId',
      'sourceMutationLifecycleCloseoutId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseoutReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationLifecycleCloseoutIndex: fields(
    [
      'indexId',
      'sourceMutationLifecycleCloseoutRefs',
      'sourceMutationCompletionReviewAcceptanceRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationLifecycleCloseoutRules = [
  {
    id: 'source-mutation-lifecycle-closeout-requires-current-accepted-review-chain',
    rule:
      'source mutation lifecycle closeout can only bind to one current completion review acceptance record and its finalized review and completion chain',
  },
  {
    id: 'source-mutation-lifecycle-closeout-is-not-source-mutation',
    rule:
      'source mutation lifecycle closeout status may mark review readiness, but it cannot close the lifecycle, mutate accepted records, apply patches, mutate source, execute remediation, commit, push, or release',
  },
  {
    id: 'source-mutation-lifecycle-closeout-requires-criteria-and-decision-notes',
    rule:
      'lifecycle closeout criteria refs, lifecycle closeout decision note refs, clean baseline proof, exact scope lock, target lock, and baseline digest must be present before lifecycle closeout review can be considered',
  },
  {
    id: 'source-mutation-lifecycle-closeout-requires-verification-dry-run-and-rollback-proof',
    rule:
      'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout review can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-lifecycle-closeout-blocks-review',
    rule:
      'stale closeout proof, stale review acceptance proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing closeout criteria, missing closeout decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout review readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationLifecycleCloseoutSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented &&
  sourceSummary.sourceMutationLifecycleCloseoutImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationLifecycleCloseout &&
  sourceSummary.completionReadinessMentionsSourceMutationLifecycleCloseout &&
  sourceSummary.ledgerMentionsSourceMutationLifecycleCloseout &&
  sourceSummary.verificationIncludesSourceMutationLifecycleCloseout &&
  sourceSummary.sourceMutationLifecycleCloseoutReviewNextDocumented &&
  sourceSummary.currentSourceMutationLifecycleCloseoutDocumented &&
  sourceSummary.currentSourceMutationCompletionReviewAcceptanceDocumented &&
  sourceSummary.currentSourceMutationCompletionReviewDocumented &&
  sourceSummary.currentSourceMutationCompletionDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutCriteriaDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutDecisionNoteDocumented &&
  sourceSummary.cleanBaselineProofDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceMutationLifecycleCloseoutSeparateFromMutation &&
  sourceSummary.sourceMutationLifecycleCloseoutStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-lifecycle-closeout-status',
  posture: 'local-read-only-remediation-source-mutation-lifecycle-closeout-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-lifecycle-closeout-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationLifecycleCloseoutStates: SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_STATES,
    sourceMutationLifecycleCloseoutDecisionTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_DECISION_TYPES,
    sourceMutationLifecycleCloseoutEvidenceTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_EVIDENCE_TYPES,
    sourceMutationLifecycleCloseoutBlockerTypes:
      SOURCE_MUTATION_LIFECYCLE_CLOSEOUT_BLOCKER_TYPES,
  },
  sourceMutationLifecycleCloseoutSchema,
  sourceMutationLifecycleCloseoutRules,
  sourceMutationLifecycleCloseoutState: {
    realSourceMutationLifecycleCloseoutFileAdopted: false,
    discoveredSourceMutationLifecycleCloseoutRecords: 0,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-lifecycle-closeout',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationLifecycleCloseoutRecordTypes: Object.keys(sourceMutationLifecycleCloseoutSchema)
      .length,
    currentSourceMutationLifecycleCloseoutRequired: true,
    currentSourceMutationCompletionReviewAcceptanceRequired: true,
    currentSourceMutationCompletionReviewRequired: true,
    currentSourceMutationCompletionRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationLifecycleCloseoutCriteriaRequired: true,
    sourceMutationLifecycleCloseoutDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationLifecycleCloseoutAndMutationSeparate: true,
    lifecycleClosed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutReviewStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-review-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-lifecycle-closeout-review-status.mjs',
    reason:
      'Source mutation lifecycle closeout is now modeled as read-only; the next safe slice should review closeout readiness before any lifecycle closure, patch application, or source mutation.',
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
    doesNotApproveApplyAuthorization: true,
    doesNotOpenApplyDispatch: true,
    doesNotOpenApplyExecution: true,
    doesNotOpenApplyResult: true,
    doesNotOpenApplyResultReview: true,
    doesNotAcceptApplyResult: true,
    doesNotOpenApplyClosure: true,
    doesNotFinalizeApplyLifecycle: true,
    doesNotExecutePostApplyAudit: true,
    doesNotExecutePostApplyAuditReview: true,
    doesNotExecutePostApplyAuditReviewAcceptance: true,
    doesNotOpenSourceMutationCompletion: true,
    doesNotExecuteSourceMutationCompletion: true,
    doesNotOpenSourceMutationCompletionReview: true,
    doesNotExecuteSourceMutationCompletionReview: true,
    doesNotOpenSourceMutationCompletionReviewAcceptance: true,
    doesNotExecuteSourceMutationCompletionReviewAcceptance: true,
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
