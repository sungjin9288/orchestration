import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-completion-review-acceptance-status',
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
  'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-review-status.mjs',
  'scripts/growth-remediation-source-mutation-completion-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_STATES = [
  'source-mutation-completion-review-acceptance-not-started',
  'source-mutation-completion-review-acceptance-ready',
  'source-mutation-completion-review-acceptance-blocked',
  'source-mutation-completion-review-acceptance-ready-for-lifecycle-closeout-contract',
  'source-mutation-completion-review-acceptance-rejected',
  'source-mutation-completion-review-acceptance-deferred',
  'needs-current-source-mutation-completion-review-acceptance',
  'needs-current-source-mutation-completion-review',
  'needs-current-source-mutation-completion',
  'needs-current-post-apply-audit-review-acceptance',
  'needs-current-post-apply-audit-review',
  'needs-current-post-apply-audit',
  'needs-current-apply-finalization',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-completion-review-acceptance-criteria',
  'needs-source-mutation-completion-review-acceptance-decision-note',
  'needs-source-mutation-completion-reviewer-note',
  'needs-source-mutation-completion-review-decision-note',
  'needs-source-mutation-completion-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-completion-review-acceptance-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_DECISION_TYPES = [
  'approve-source-mutation-lifecycle-closeout-readiness',
  'request-current-source-mutation-completion-review-acceptance',
  'request-current-source-mutation-completion-review',
  'request-current-source-mutation-completion',
  'request-current-post-apply-audit-review-acceptance',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-completion-review-acceptance-criteria',
  'request-source-mutation-completion-review-acceptance-decision-note',
  'request-source-mutation-completion-reviewer-note',
  'request-source-mutation-completion-review-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-completion-review-acceptance',
  'defer-source-mutation-completion-review-acceptance',
  'hold-baseline',
];

const SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_EVIDENCE_TYPES = [
  'source-mutation-completion-review-acceptance-record',
  'source-mutation-completion-review-acceptance-criteria',
  'source-mutation-completion-review-acceptance-decision-note',
  'source-mutation-completion-review-record',
  'source-mutation-completion-reviewer-note',
  'source-mutation-completion-review-decision-note',
  'source-mutation-completion-record',
  'source-mutation-completion-decision-note',
  'source-mutation-post-apply-audit-review-acceptance-record',
  'source-mutation-post-apply-audit-review-record',
  'source-mutation-post-apply-audit-record',
  'source-mutation-apply-finalization-record',
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

const SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_BLOCKER_TYPES = [
  'source-mutation-completion-review-acceptance-missing',
  'source-mutation-completion-review-acceptance-stale',
  'source-mutation-completion-review-acceptance-rejected',
  'source-mutation-completion-review-missing',
  'source-mutation-completion-review-stale',
  'source-mutation-completion-review-rejected',
  'source-mutation-completion-missing',
  'source-mutation-completion-stale',
  'post-apply-audit-review-acceptance-missing',
  'post-apply-audit-review-acceptance-stale',
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
  'source-mutation-completion-review-acceptance-criteria-missing',
  'source-mutation-completion-review-acceptance-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-completion-review-acceptance-status-attempts-source-mutation',
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
  const acceptanceStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-completion-review-acceptance-status.mjs',
  );
  const reviewStatus = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-completion-review-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationCompletionReviewDocumented:
      /Thirty-eighth Implemented Slice: `growth-remediation-source-mutation-completion-review-status`/.test(
        plan,
      ),
    sourceMutationCompletionReviewAcceptanceDocumented:
      /Thirty-ninth Implemented Slice: `growth-remediation-source-mutation-completion-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationCompletionReviewImplemented:
      /mode: 'growth-remediation-source-mutation-completion-review-status'/.test(reviewStatus),
    sourceMutationCompletionReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-completion-review-acceptance-status'/.test(
        acceptanceStatus,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationCompletionReviewAcceptance:
      /growth-remediation-source-mutation-completion-review-acceptance-status/.test(
        harnessBaseline,
      ),
    completionReadinessMentionsSourceMutationCompletionReviewAcceptance:
      /growth-remediation-source-mutation-completion-review-acceptance-status/.test(
        completionReadiness,
      ),
    ledgerMentionsSourceMutationCompletionReviewAcceptance:
      /growth-remediation-source-mutation-completion-review-acceptance-status-readonly-post-m7-846/.test(
        todo,
      ),
    verificationIncludesSourceMutationCompletionReviewAcceptance:
      /growth-remediation-source-mutation-completion-review-acceptance-status/.test(
        verificationStatus,
      ),
    sourceMutationLifecycleCloseoutNextDocumented:
      /growth-remediation-source-mutation-lifecycle-closeout-status/.test(plan),
    currentSourceMutationCompletionReviewAcceptanceDocumented:
      /current source mutation completion review acceptance record/.test(plan),
    sourceMutationCompletionReviewAcceptanceCriteriaDocumented:
      /source mutation completion review acceptance criteria refs/.test(plan),
    sourceMutationCompletionReviewAcceptanceDecisionNoteDocumented:
      /source mutation completion review acceptance decision note refs/.test(plan),
    currentSourceMutationCompletionReviewDocumented:
      /current source mutation completion review record/.test(plan),
    sourceMutationCompletionReviewerNoteDocumented:
      /source mutation completion reviewer note refs/.test(plan),
    sourceMutationCompletionReviewDecisionNoteDocumented:
      /source mutation completion review decision note refs/.test(plan),
    currentSourceMutationCompletionDocumented: /current source mutation completion record/.test(
      plan,
    ),
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
    sourceMutationCompletionReviewAcceptanceSeparateFromMutation:
      /source mutation completion review acceptance status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationLifecycleCloseoutStillBlocked:
      /before\s+source mutation lifecycle closeout can be\s+considered/.test(plan),
    sourceMutationStillBlocked: /without applying patches(?:,| or)\s+mutating source/.test(plan),
    remediationExecutionStillBlocked: /or remediation execution/.test(plan),
  };
}

const sourceMutationCompletionReviewAcceptanceSchema = {
  sourceMutationCompletionReviewAcceptanceRecord: fields(
    [
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'sourceMutationCompletionId',
      'postApplyAuditReviewAcceptanceId',
      'postApplyAuditReviewId',
      'postApplyAuditId',
      'applyFinalizationId',
      'state',
      'decisionType',
      'sourceMutationCompletionReviewAcceptanceCriteriaRefs',
      'sourceMutationCompletionReviewAcceptanceDecisionNoteRefs',
      'sourceMutationCompletionReviewerNoteRefs',
      'sourceMutationCompletionReviewDecisionNoteRefs',
      'sourceMutationCompletionDecisionNoteRefs',
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
      'blockerRefs',
      'sourceMutationLifecycleCloseoutAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationCompletionReviewAcceptanceDecision: fields(
    [
      'decisionId',
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'sourceMutationLifecycleCloseoutAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationCompletionReviewAcceptanceBlocker: fields(
    [
      'blockerId',
      'sourceMutationCompletionReviewAcceptanceId',
      'sourceMutationCompletionReviewId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationLifecycleCloseout',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationCompletionReviewAcceptanceIndex: fields(
    [
      'indexId',
      'sourceMutationCompletionReviewAcceptanceRefs',
      'sourceMutationCompletionReviewRefs',
      'sourceMutationCompletionRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationCompletionReviewAcceptanceRules = [
  {
    id: 'source-mutation-completion-review-acceptance-requires-current-review',
    rule:
      'source mutation completion review acceptance can only bind to one current completion review record and its finalized completion chain',
  },
  {
    id: 'source-mutation-completion-review-acceptance-is-not-source-mutation',
    rule:
      'source mutation completion review acceptance status may mark lifecycle-closeout readiness, but it cannot mutate accepted records, apply patches, mutate source, execute remediation, or close the lifecycle',
  },
  {
    id: 'source-mutation-completion-review-acceptance-requires-criteria-and-decision-notes',
    rule:
      'acceptance criteria refs, acceptance decision note refs, reviewer note refs, review decision note refs, clean baseline proof, exact scope lock, target lock, and baseline digest must be present before lifecycle closeout can be considered',
  },
  {
    id: 'source-mutation-completion-review-acceptance-requires-verification-dry-run-and-rollback-proof',
    rule:
      'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation lifecycle closeout can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-completion-review-acceptance-blocks-closeout',
    rule:
      'stale acceptance proof, stale review proof, stale completion proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing acceptance criteria, missing acceptance decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks lifecycle closeout readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(
  sourceMutationCompletionReviewAcceptanceSchema,
).every((schema) => schema.required.length > 0);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationCompletionReviewDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationCompletionReviewImplemented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationCompletionReviewAcceptance &&
  sourceSummary.completionReadinessMentionsSourceMutationCompletionReviewAcceptance &&
  sourceSummary.ledgerMentionsSourceMutationCompletionReviewAcceptance &&
  sourceSummary.verificationIncludesSourceMutationCompletionReviewAcceptance &&
  sourceSummary.sourceMutationLifecycleCloseoutNextDocumented &&
  sourceSummary.currentSourceMutationCompletionReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceCriteriaDocumented &&
  sourceSummary.sourceMutationCompletionReviewAcceptanceDecisionNoteDocumented &&
  sourceSummary.currentSourceMutationCompletionReviewDocumented &&
  sourceSummary.sourceMutationCompletionReviewerNoteDocumented &&
  sourceSummary.sourceMutationCompletionReviewDecisionNoteDocumented &&
  sourceSummary.currentSourceMutationCompletionDocumented &&
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
  sourceSummary.sourceMutationCompletionReviewAcceptanceSeparateFromMutation &&
  sourceSummary.sourceMutationLifecycleCloseoutStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-completion-review-acceptance-status',
  posture:
    'local-read-only-remediation-source-mutation-completion-review-acceptance-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-completion-review-acceptance-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationCompletionReviewAcceptanceStates:
      SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_STATES,
    sourceMutationCompletionReviewAcceptanceDecisionTypes:
      SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_DECISION_TYPES,
    sourceMutationCompletionReviewAcceptanceEvidenceTypes:
      SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_EVIDENCE_TYPES,
    sourceMutationCompletionReviewAcceptanceBlockerTypes:
      SOURCE_MUTATION_COMPLETION_REVIEW_ACCEPTANCE_BLOCKER_TYPES,
  },
  sourceMutationCompletionReviewAcceptanceSchema,
  sourceMutationCompletionReviewAcceptanceRules,
  sourceMutationCompletionReviewAcceptanceState: {
    realSourceMutationCompletionReviewAcceptanceFileAdopted: false,
    discoveredSourceMutationCompletionReviewAcceptanceRecords: 0,
    sourceMutationLifecycleCloseoutAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-completion-review-acceptance',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationCompletionReviewAcceptanceRecordTypes: Object.keys(
      sourceMutationCompletionReviewAcceptanceSchema,
    ).length,
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
    sourceMutationCompletionReviewAcceptanceCriteriaRequired: true,
    sourceMutationCompletionReviewAcceptanceDecisionNoteRequired: true,
    sourceMutationCompletionReviewerNoteRequired: true,
    sourceMutationCompletionReviewDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationCompletionReviewAcceptanceAndMutationSeparate: true,
    sourceMutationLifecycleCloseoutAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationLifecycleCloseoutStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-lifecycle-closeout-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-lifecycle-closeout-status.mjs',
    reason:
      'Source mutation completion review acceptance is now modeled as read-only; the next safe slice should define lifecycle closeout readiness without applying patches or mutating source.',
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
