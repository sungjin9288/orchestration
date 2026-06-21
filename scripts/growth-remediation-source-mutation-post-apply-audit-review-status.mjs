import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-post-apply-audit-review-status',
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
  'scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_STATES = [
  'source-mutation-post-apply-audit-review-not-started',
  'source-mutation-post-apply-audit-review-ready',
  'source-mutation-post-apply-audit-review-blocked',
  'source-mutation-post-apply-audit-review-ready-for-acceptance-contract',
  'source-mutation-post-apply-audit-review-rejected',
  'source-mutation-post-apply-audit-review-deferred',
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
  'needs-operator-dispatch-intent',
  'needs-result-reviewer-note',
  'needs-result-acceptance-criteria',
  'needs-acceptance-decision-note',
  'needs-closure-decision-note',
  'needs-finalization-decision-note',
  'needs-post-apply-audit-note',
  'needs-post-apply-audit-decision-note',
  'needs-post-apply-audit-reviewer-note',
  'needs-post-apply-audit-review-decision-note',
  'needs-post-apply-audit-review-acceptance-criteria',
  'needs-negative-evidence-clearance',
  'stale-post-apply-audit-review-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_DECISION_TYPES = [
  'approve-source-mutation-post-apply-audit-review-acceptance-contract-readiness',
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
  'request-operator-dispatch-intent',
  'request-result-reviewer-note',
  'request-result-acceptance-criteria',
  'request-acceptance-decision-note',
  'request-closure-decision-note',
  'request-finalization-decision-note',
  'request-post-apply-audit-note',
  'request-post-apply-audit-decision-note',
  'request-post-apply-audit-reviewer-note',
  'request-post-apply-audit-review-decision-note',
  'request-post-apply-audit-review-acceptance-criteria',
  'request-negative-evidence-clearance',
  'reject-source-mutation-post-apply-audit-review',
  'defer-source-mutation-post-apply-audit-review',
  'hold-baseline',
];

const SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_EVIDENCE_TYPES = [
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
  'result-reviewer-note',
  'result-acceptance-criteria',
  'acceptance-decision-note',
  'closure-decision-note',
  'finalization-decision-note',
  'post-apply-audit-note',
  'post-apply-audit-decision-note',
  'post-apply-audit-reviewer-note',
  'post-apply-audit-review-decision-note',
  'post-apply-audit-review-acceptance-criteria',
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

const SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_BLOCKER_TYPES = [
  'post-apply-audit-review-missing',
  'post-apply-audit-review-stale',
  'post-apply-audit-review-rejected',
  'post-apply-audit-missing',
  'post-apply-audit-stale',
  'post-apply-audit-rejected',
  'apply-finalization-missing',
  'apply-finalization-stale',
  'apply-finalization-rejected',
  'apply-closure-missing',
  'apply-closure-stale',
  'apply-closure-rejected',
  'apply-result-acceptance-missing',
  'apply-result-acceptance-stale',
  'apply-result-acceptance-rejected',
  'apply-result-review-missing',
  'apply-result-review-stale',
  'apply-result-review-rejected',
  'apply-result-missing',
  'apply-result-stale',
  'apply-result-rejected',
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
  'operator-dispatch-intent-missing',
  'operator-dispatch-intent-stale',
  'result-reviewer-note-missing',
  'result-reviewer-note-stale',
  'result-acceptance-criteria-missing',
  'result-acceptance-criteria-stale',
  'acceptance-decision-note-missing',
  'acceptance-decision-note-stale',
  'closure-decision-note-missing',
  'closure-decision-note-stale',
  'finalization-decision-note-missing',
  'finalization-decision-note-stale',
  'post-apply-audit-note-missing',
  'post-apply-audit-note-stale',
  'post-apply-audit-decision-note-missing',
  'post-apply-audit-decision-note-stale',
  'post-apply-audit-reviewer-note-missing',
  'post-apply-audit-reviewer-note-stale',
  'post-apply-audit-review-decision-note-missing',
  'post-apply-audit-review-decision-note-stale',
  'post-apply-audit-review-acceptance-criteria-missing',
  'post-apply-audit-review-acceptance-criteria-stale',
  'clean-baseline-proof-missing',
  'dirty-baseline',
  'untracked-baseline',
  'exact-scope-lock-missing',
  'exact-scope-lock-drift',
  'target-lock-missing',
  'target-lock-drift',
  'baseline-digest-missing',
  'baseline-digest-stale',
  'patch-draft-missing',
  'patch-draft-drift',
  'diff-preview-missing',
  'diff-preview-drift',
  'verification-output-missing',
  'verification-output-failed',
  'dry-run-proof-missing',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'unapproved-file-touch',
  'post-apply-audit-review-status-attempts-source-mutation',
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
  const sourceMutationPostApplyAudit = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-post-apply-audit-status.mjs',
  );
  const sourceMutationPostApplyAuditReview = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-post-apply-audit-review-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationPostApplyAuditDocumented:
      /Thirty-fourth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-status`/.test(
        plan,
      ),
    sourceMutationPostApplyAuditReviewDocumented:
      /Thirty-fifth Implemented Slice: `growth-remediation-source-mutation-post-apply-audit-review-status`/.test(
        plan,
      ),
    sourceMutationPostApplyAuditImplemented:
      /mode: 'growth-remediation-source-mutation-post-apply-audit-status'/.test(
        sourceMutationPostApplyAudit,
      ),
    sourceMutationPostApplyAuditReviewImplemented:
      /mode: 'growth-remediation-source-mutation-post-apply-audit-review-status'/.test(
        sourceMutationPostApplyAuditReview,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationPostApplyAuditReview:
      /growth-remediation-source-mutation-post-apply-audit-review-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationPostApplyAuditReview:
      /growth-remediation-source-mutation-post-apply-audit-review-status/.test(completionReadiness),
    ledgerMentionsSourceMutationPostApplyAuditReview:
      /growth-remediation-source-mutation-post-apply-audit-review-status-readonly-post-m7-842/.test(
        todo,
      ),
    verificationIncludesSourceMutationPostApplyAuditReview:
      /growth-remediation-source-mutation-post-apply-audit-review-status/.test(verificationStatus),
    sourceMutationPostApplyAuditReviewAcceptanceNextDocumented:
      /growth-remediation-source-mutation-post-apply-audit-review-acceptance-status/.test(plan),
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
    operatorDispatchIntentDocumented: /operator dispatch intent/.test(plan),
    finalizationDecisionNoteDocumented: /finalization decision note refs/.test(plan),
    postApplyAuditNoteDocumented: /post-apply audit note refs/.test(plan),
    postApplyAuditDecisionNoteDocumented: /post-apply audit decision note refs/.test(plan),
    postApplyAuditReviewerNoteDocumented: /post-apply audit reviewer note refs/.test(plan),
    postApplyAuditReviewDecisionNoteDocumented:
      /post-apply audit review decision note refs/.test(plan),
    postApplyAuditReviewAcceptanceCriteriaDocumented:
      /post-apply audit\s+review acceptance criteria refs/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    postApplyAuditReviewSeparateFromMutation:
      /post-apply audit review status stays separate from actual audit execution/.test(plan),
    postApplyAuditReviewAcceptanceStillBlocked:
      /before\s+source\s+mutation post-apply audit review acceptance can be\s+considered/.test(
        plan,
      ),
    sourceMutationStillBlocked: /without applying patches(?:,| or)\s+mutating source/.test(plan),
    remediationExecutionStillBlocked: /or remediation execution/.test(plan),
  };
}

const sourceMutationPostApplyAuditReviewSchema = {
  sourceMutationPostApplyAuditReviewRecord: fields(
    [
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
      'postApplyAuditReviewerNoteRefs',
      'postApplyAuditReviewDecisionNoteRefs',
      'postApplyAuditReviewAcceptanceCriteriaRefs',
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
      'postApplyAuditReviewAcceptanceAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'operatorNotes'],
  ),
  sourceMutationPostApplyAuditReviewDecision: fields(
    [
      'decisionId',
      'postApplyAuditReviewId',
      'postApplyAuditId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'postApplyAuditReviewAcceptanceAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationPostApplyAuditReviewBlocker: fields(
    [
      'blockerId',
      'postApplyAuditReviewId',
      'postApplyAuditId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksPostApplyAuditReviewAcceptance',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationPostApplyAuditReviewIndex: fields(
    [
      'indexId',
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

const sourceMutationPostApplyAuditReviewRules = [
  {
    id: 'post-apply-audit-review-requires-current-post-apply-audit',
    rule: 'source mutation post-apply audit review can only bind to one current post-apply audit record and its finalized apply execution chain',
  },
  {
    id: 'post-apply-audit-review-is-not-source-mutation',
    rule: 'source mutation post-apply audit review status may mark review-acceptance contract readiness, but it cannot execute audit workflows, apply patches, mutate source, mutate accepted records, or execute remediation',
  },
  {
    id: 'post-apply-audit-review-requires-clean-baseline-and-reviewer-decision',
    rule: 'clean baseline proof, exact scope lock, target lock, baseline digest, operator dispatch intent, post-apply audit reviewer notes, review decision notes, and review acceptance criteria must be present before source mutation post-apply audit review acceptance can be considered',
  },
  {
    id: 'post-apply-audit-review-requires-verification-dry-run-and-rollback-proof',
    rule: 'patch draft refs, diff preview refs, verification output refs, dry-run proof refs, rollback proof refs, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before source mutation post-apply audit review acceptance can be considered',
  },
  {
    id: 'failed-stale-broad-dirty-or-mutating-post-apply-audit-review-blocks-acceptance',
    rule: 'stale audit, stale finalization, stale closure, stale result acceptance, stale result review, stale result, stale execution, dirty or untracked baseline, changed patch or diff proof, failed verification, missing rollback proof, missing post-apply audit review decision note, unresolved negative evidence, unapproved file touches, or any attempted source mutation blocks post-apply audit review acceptance readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationPostApplyAuditReviewSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationPostApplyAuditDocumented &&
  sourceSummary.sourceMutationPostApplyAuditReviewDocumented &&
  sourceSummary.sourceMutationPostApplyAuditImplemented &&
  sourceSummary.sourceMutationPostApplyAuditReviewImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationPostApplyAuditReview &&
  sourceSummary.completionReadinessMentionsSourceMutationPostApplyAuditReview &&
  sourceSummary.ledgerMentionsSourceMutationPostApplyAuditReview &&
  sourceSummary.verificationIncludesSourceMutationPostApplyAuditReview &&
  sourceSummary.sourceMutationPostApplyAuditReviewAcceptanceNextDocumented &&
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
  sourceSummary.operatorDispatchIntentDocumented &&
  sourceSummary.finalizationDecisionNoteDocumented &&
  sourceSummary.postApplyAuditNoteDocumented &&
  sourceSummary.postApplyAuditDecisionNoteDocumented &&
  sourceSummary.postApplyAuditReviewerNoteDocumented &&
  sourceSummary.postApplyAuditReviewDecisionNoteDocumented &&
  sourceSummary.postApplyAuditReviewAcceptanceCriteriaDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.postApplyAuditReviewSeparateFromMutation &&
  sourceSummary.postApplyAuditReviewAcceptanceStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-post-apply-audit-review-status',
  posture: 'local-read-only-remediation-source-mutation-post-apply-audit-review-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-post-apply-audit-review-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationPostApplyAuditReviewStates: SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_STATES,
    sourceMutationPostApplyAuditReviewDecisionTypes:
      SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_DECISION_TYPES,
    sourceMutationPostApplyAuditReviewEvidenceTypes:
      SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_EVIDENCE_TYPES,
    sourceMutationPostApplyAuditReviewBlockerTypes:
      SOURCE_MUTATION_POST_APPLY_AUDIT_REVIEW_BLOCKER_TYPES,
  },
  sourceMutationPostApplyAuditReviewSchema,
  sourceMutationPostApplyAuditReviewRules,
  sourceMutationPostApplyAuditReviewState: {
    realSourceMutationPostApplyAuditReviewFileAdopted: false,
    discoveredSourceMutationPostApplyAuditReviewRecords: 0,
    postApplyAuditReviewAcceptanceAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-post-apply-audit-review',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationPostApplyAuditReviewRecordTypes: Object.keys(
      sourceMutationPostApplyAuditReviewSchema,
    ).length,
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
    operatorDispatchIntentRequired: true,
    finalizationDecisionNoteRequired: true,
    postApplyAuditNoteRequired: true,
    postApplyAuditDecisionNoteRequired: true,
    postApplyAuditReviewerNoteRequired: true,
    postApplyAuditReviewDecisionNoteRequired: true,
    postApplyAuditReviewAcceptanceCriteriaRequired: true,
    negativeEvidenceClearanceRequired: true,
    postApplyAuditReviewAndMutationSeparate: true,
    postApplyAuditReviewAcceptanceAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationPostApplyAuditReviewAcceptanceStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-post-apply-audit-review-acceptance-status',
    commandToAdd:
      'node scripts/growth-remediation-source-mutation-post-apply-audit-review-acceptance-status.mjs',
    reason:
      'Source mutation post-apply audit review is now modeled as read-only; the next safe slice should define review acceptance readiness without applying patches or mutating source.',
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
    doesNotOpenPostApplyAuditReviewAcceptance: true,
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
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
