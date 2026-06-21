import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-completion-status',
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
  'scripts/growth-remediation-source-mutation-completion-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
  'scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-finalization-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-closure-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-acceptance-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-review-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-result-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-dispatch-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-execution-readiness-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_COMPLETION_STATES = [
  'source-mutation-completion-not-started',
  'source-mutation-completion-ready',
  'source-mutation-completion-blocked',
  'source-mutation-completion-ready-for-review-contract',
  'source-mutation-completion-rejected',
  'source-mutation-completion-deferred',
  'needs-current-source-mutation-completion',
  'needs-current-post-apply-audit-review-acceptance',
  'needs-current-post-apply-audit-review',
  'needs-current-post-apply-audit',
  'needs-current-apply-finalization',
  'needs-current-apply-closure',
  'needs-current-apply-result-acceptance',
  'needs-current-apply-result-review',
  'needs-current-apply-result',
  'needs-current-apply-execution',
  'needs-current-apply-dispatch',
  'needs-current-apply-execution-readiness',
  'needs-current-apply-preflight',
  'needs-current-apply-authorization',
  'needs-clean-baseline-proof',
  'needs-exact-scope-lock',
  'needs-target-lock',
  'needs-baseline-digest',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-verification-output',
  'needs-dry-run-proof',
  'needs-rollback-proof',
  'needs-source-mutation-completion-decision-note',
  'needs-post-apply-audit-review-acceptance-decision-note',
  'needs-negative-evidence-clearance',
  'stale-source-mutation-completion-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_COMPLETION_DECISION_TYPES = [
  'approve-source-mutation-completion-review-readiness',
  'request-current-source-mutation-completion',
  'request-current-post-apply-audit-review-acceptance',
  'request-current-post-apply-audit-review',
  'request-current-post-apply-audit',
  'request-current-apply-finalization',
  'request-current-apply-closure',
  'request-current-apply-result-acceptance',
  'request-current-apply-result-review',
  'request-current-apply-result',
  'request-current-apply-execution',
  'request-current-apply-dispatch',
  'request-current-apply-execution-readiness',
  'request-current-apply-preflight',
  'request-current-apply-authorization',
  'request-clean-baseline-proof',
  'request-exact-scope-lock',
  'request-target-lock',
  'request-baseline-digest',
  'request-patch-draft',
  'request-diff-preview',
  'request-verification-output',
  'request-dry-run-proof',
  'request-rollback-proof',
  'request-source-mutation-completion-decision-note',
  'request-negative-evidence-clearance',
  'reject-source-mutation-completion',
  'defer-source-mutation-completion',
  'hold-baseline',
];

const SOURCE_MUTATION_COMPLETION_EVIDENCE_TYPES = [
  'source-mutation-completion-record',
  'source-mutation-completion-decision-note',
  'source-mutation-post-apply-audit-review-acceptance-record',
  'source-mutation-post-apply-audit-review-record',
  'source-mutation-post-apply-audit-record',
  'source-mutation-apply-finalization-record',
  'source-mutation-apply-closure-record',
  'source-mutation-apply-result-acceptance-record',
  'source-mutation-apply-result-review-record',
  'source-mutation-apply-result-record',
  'source-mutation-apply-execution-record',
  'source-mutation-apply-dispatch-record',
  'source-mutation-apply-execution-readiness-record',
  'source-mutation-apply-preflight-record',
  'source-mutation-apply-authorization-record',
  'operator-dispatch-intent',
  'finalization-decision-note',
  'post-apply-audit-note',
  'post-apply-audit-decision-note',
  'post-apply-audit-reviewer-note',
  'post-apply-audit-review-decision-note',
  'post-apply-audit-review-acceptance-criteria',
  'post-apply-audit-review-acceptance-decision-note',
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

const SOURCE_MUTATION_COMPLETION_BLOCKER_TYPES = [
  'source-mutation-completion-missing',
  'source-mutation-completion-stale',
  'source-mutation-completion-rejected',
  'post-apply-audit-review-acceptance-missing',
  'post-apply-audit-review-acceptance-stale',
  'post-apply-audit-review-missing',
  'post-apply-audit-review-stale',
  'post-apply-audit-missing',
  'post-apply-audit-stale',
  'apply-finalization-missing',
  'apply-finalization-stale',
  'apply-closure-missing',
  'apply-closure-stale',
  'apply-result-acceptance-missing',
  'apply-result-acceptance-stale',
  'apply-result-review-missing',
  'apply-result-review-stale',
  'apply-result-missing',
  'apply-result-stale',
  'apply-execution-missing',
  'apply-execution-stale',
  'apply-dispatch-missing',
  'apply-dispatch-stale',
  'apply-execution-readiness-missing',
  'apply-execution-readiness-stale',
  'apply-preflight-missing',
  'apply-preflight-stale',
  'apply-authorization-missing',
  'apply-authorization-stale',
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
  'source-mutation-completion-decision-note-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'source-mutation-completion-status-attempts-source-mutation',
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
  const sourceMutationCompletion = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-completion-status.mjs',
  );
  const sourceMutationPostApplyAuditReviewAcceptance = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationPostApplyAuditReviewAcceptanceDocumented:
      /Thirty-sixth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-acceptance-status`/.test(
        plan,
      ),
    sourceMutationCompletionDocumented:
      /Thirty-seventh Implemented Slice: `growth-remediation-source-mutation-completion-status`/.test(
        plan,
      ),
    sourceMutationPostApplyAuditReviewAcceptanceImplemented:
      /mode: 'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status'/.test(
        sourceMutationPostApplyAuditReviewAcceptance,
      ),
    sourceMutationCompletionImplemented:
      /mode: 'growth-remediation-source-mutation-completion-status'/.test(
        sourceMutationCompletion,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationCompletion:
      /growth-remediation-source-mutation-completion-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationCompletion:
      /growth-remediation-source-mutation-completion-status/.test(completionReadiness),
    ledgerMentionsSourceMutationCompletion:
      /growth-remediation-source-mutation-completion-status-readonly-post-m7-844/.test(todo),
    verificationIncludesSourceMutationCompletion:
      /growth-remediation-source-mutation-completion-status/.test(verificationStatus),
    sourceMutationCompletionReviewNextDocumented:
      /growth-remediation-source-mutation-completion-review-status/.test(plan),
    currentSourceMutationCompletionDocumented: /current source mutation completion record/.test(
      plan,
    ),
    sourceMutationCompletionDecisionNoteDocumented:
      /source mutation completion decision note refs/.test(plan),
    currentPostApplyAuditReviewAcceptanceDocumented:
      /current post-apply audit review acceptance record/.test(plan),
    currentPostApplyAuditReviewDocumented: /current post-apply audit review record/.test(plan),
    currentPostApplyAuditDocumented: /current post-apply audit record/.test(plan),
    currentApplyFinalizationDocumented: /current apply finalization record/.test(plan),
    cleanBaselineProofDocumented: /clean baseline proof/.test(plan),
    exactScopeLockDocumented: /exact scope lock/.test(plan),
    targetLockDocumented: /target lock/.test(plan),
    baselineDigestDocumented: /baseline digest/.test(plan),
    patchDraftDocumented: /patch draft refs|patch\/diff proof/.test(plan),
    diffPreviewDocumented: /diff preview refs|patch\/diff proof/.test(plan),
    verificationOutputDocumented: /verification output/.test(plan),
    dryRunProofDocumented: /dry-run proof/.test(plan),
    rollbackProofDocumented: /rollback proof/.test(plan),
    postApplyAuditReviewAcceptanceDecisionNoteDocumented:
      /post-apply audit review acceptance decision note refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    sourceMutationCompletionSeparateFromMutation:
      /source mutation completion status stays separate from actual source mutation execution/.test(
        plan,
      ),
    sourceMutationCompletionReviewStillBlocked:
      /before\s+source mutation completion review can be\s+considered/.test(plan),
    sourceMutationStillBlocked: /without applying patches(?:,| or)\s+mutating source/.test(plan),
    remediationExecutionStillBlocked: /or remediation execution/.test(plan),
  };
}

const sourceMutationCompletionSchema = {
  sourceMutationCompletionRecord: fields(
    [
      'sourceMutationCompletionId',
      'postApplyAuditReviewAcceptanceId',
      'postApplyAuditReviewId',
      'postApplyAuditId',
      'applyFinalizationId',
      'applyClosureId',
      'applyResultAcceptanceId',
      'applyResultReviewId',
      'applyResultId',
      'applyExecutionId',
      'applyDispatchId',
      'applyExecutionReadinessId',
      'applyPreflightId',
      'applyAuthorizationId',
      'state',
      'decisionType',
      'sourceMutationCompletionDecisionNoteRefs',
      'postApplyAuditReviewAcceptanceDecisionNoteRefs',
      'postApplyAuditReviewAcceptanceCriteriaRefs',
      'postApplyAuditReviewerNoteRefs',
      'postApplyAuditReviewDecisionNoteRefs',
      'postApplyAuditNoteRefs',
      'postApplyAuditDecisionNoteRefs',
      'finalizationDecisionNoteRefs',
      'operatorDispatchIntentRefs',
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
      'sourceMutationCompletionReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationCompletionDecision: fields(
    [
      'decisionId',
      'sourceMutationCompletionId',
      'postApplyAuditReviewAcceptanceId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'sourceMutationCompletionReviewAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationCompletionBlocker: fields(
    [
      'blockerId',
      'sourceMutationCompletionId',
      'postApplyAuditReviewAcceptanceId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksSourceMutationCompletionReview',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationCompletionIndex: fields(
    [
      'indexId',
      'sourceMutationCompletionRefs',
      'postApplyAuditReviewAcceptanceRefs',
      'postApplyAuditReviewRefs',
      'postApplyAuditRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationCompletionRules = [
  {
    id: 'source-mutation-completion-requires-current-review-acceptance',
    rule:
      'source mutation completion can only bind to one current post-apply audit review acceptance record and its finalized apply execution chain',
  },
  {
    id: 'source-mutation-completion-is-not-source-mutation',
    rule:
      'source mutation completion status may mark completion-review readiness, but it cannot execute completion, mutate accepted records, apply patches, mutate source, or execute remediation',
  },
  {
    id: 'source-mutation-completion-requires-clean-baseline-and-decision-note',
    rule:
      'clean baseline proof, exact scope lock, target lock, baseline digest, review acceptance decision notes, and source mutation completion decision notes must be present before source mutation completion review can be considered',
  },
  {
    id: 'source-mutation-completion-requires-verification-dry-run-and-rollback-proof',
    rule:
      'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation completion review can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-completion-blocks-review',
    rule:
      'stale completion proof, stale review acceptance proof, stale audit review proof, stale audit proof, stale finalization proof, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing source mutation completion decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks completion review readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationCompletionSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceDocumented &&
  sourceSummary.sourceMutationCompletionDocumented &&
  sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceImplemented &&
  sourceSummary.sourceMutationCompletionImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationCompletion &&
  sourceSummary.completionReadinessMentionsSourceMutationCompletion &&
  sourceSummary.ledgerMentionsSourceMutationCompletion &&
  sourceSummary.verificationIncludesSourceMutationCompletion &&
  sourceSummary.sourceMutationCompletionReviewNextDocumented &&
  sourceSummary.currentSourceMutationCompletionDocumented &&
  sourceSummary.sourceMutationCompletionDecisionNoteDocumented &&
  sourceSummary.currentPostApplyAuditReviewAcceptanceDocumented &&
  sourceSummary.currentPostApplyAuditReviewDocumented &&
  sourceSummary.currentPostApplyAuditDocumented &&
  sourceSummary.currentApplyFinalizationDocumented &&
  sourceSummary.cleanBaselineProofDocumented &&
  sourceSummary.exactScopeLockDocumented &&
  sourceSummary.targetLockDocumented &&
  sourceSummary.baselineDigestDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.postApplyAuditReviewAcceptanceDecisionNoteDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.sourceMutationCompletionSeparateFromMutation &&
  sourceSummary.sourceMutationCompletionReviewStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-completion-status',
  posture: 'local-read-only-remediation-source-mutation-completion-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-completion-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationCompletionStates: SOURCE_MUTATION_COMPLETION_STATES,
    sourceMutationCompletionDecisionTypes: SOURCE_MUTATION_COMPLETION_DECISION_TYPES,
    sourceMutationCompletionEvidenceTypes: SOURCE_MUTATION_COMPLETION_EVIDENCE_TYPES,
    sourceMutationCompletionBlockerTypes: SOURCE_MUTATION_COMPLETION_BLOCKER_TYPES,
  },
  sourceMutationCompletionSchema,
  sourceMutationCompletionRules,
  sourceMutationCompletionState: {
    realSourceMutationCompletionFileAdopted: false,
    discoveredSourceMutationCompletionRecords: 0,
    sourceMutationCompletionReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-completion',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationCompletionRecordTypes: Object.keys(sourceMutationCompletionSchema).length,
    currentSourceMutationCompletionRequired: true,
    currentPostApplyAuditReviewAcceptanceRequired: true,
    currentPostApplyAuditReviewRequired: true,
    currentPostApplyAuditRequired: true,
    currentApplyFinalizationRequired: true,
    cleanBaselineProofRequired: true,
    exactScopeLockRequired: true,
    targetLockRequired: true,
    baselineDigestRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    verificationOutputRequired: true,
    dryRunProofRequired: true,
    rollbackProofRequired: true,
    sourceMutationCompletionDecisionNoteRequired: true,
    postApplyAuditReviewAcceptanceDecisionNoteRequired: true,
    negativeEvidenceClearanceRequired: true,
    sourceMutationCompletionAndMutationSeparate: true,
    sourceMutationCompletionReviewAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationCompletionReviewStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-completion-review-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-completion-review-status.mjs',
    reason:
      'Source mutation completion is now modeled as read-only; the next safe slice should define completion review readiness without applying patches or mutating source.',
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
