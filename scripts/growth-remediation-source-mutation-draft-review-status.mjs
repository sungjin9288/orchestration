import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-source-mutation-draft-review-status',
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
  'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  'scripts/growth-remediation-source-mutation-draft-status.mjs',
  'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const SOURCE_MUTATION_DRAFT_REVIEW_STATES = [
  'source-mutation-draft-review-not-started',
  'source-mutation-draft-review-ready',
  'source-mutation-draft-review-blocked',
  'source-mutation-draft-review-ready-for-apply-authorization',
  'source-mutation-draft-review-passed',
  'source-mutation-draft-review-failed',
  'source-mutation-draft-review-deferred',
  'needs-current-draft',
  'needs-application-preflight',
  'needs-patch-draft',
  'needs-diff-preview',
  'needs-dry-run-proof',
  'needs-verification-output',
  'needs-rollback-proof',
  'needs-reviewer-notes',
  'needs-negative-evidence-clearance',
  'stale-draft-review-blocked',
  'closed-no-action',
];

const SOURCE_MUTATION_DRAFT_REVIEW_DECISION_TYPES = [
  'approve-source-mutation-apply-authorization-readiness',
  'request-current-draft',
  'request-application-preflight',
  'request-patch-draft',
  'request-diff-preview',
  'request-dry-run-proof',
  'request-verification-output',
  'request-rollback-proof',
  'request-reviewer-notes',
  'request-negative-evidence-clearance',
  'reject-source-mutation-draft-review',
  'defer-source-mutation-draft-review',
  'hold-baseline',
];

const SOURCE_MUTATION_DRAFT_REVIEW_EVIDENCE_TYPES = [
  'source-mutation-draft-record',
  'source-mutation-application-preflight-record',
  'source-mutation-authorization-record',
  'file-update-plan',
  'patch-draft',
  'diff-preview',
  'verification-command-set',
  'verification-output',
  'dry-run-proof',
  'restore-plan',
  'rollback-plan',
  'rollback-proof',
  'reviewer-notes',
  'source-of-truth-doc',
  'negative-evidence',
  'task-ledger-ref',
  'aggregate-verification',
];

const SOURCE_MUTATION_DRAFT_REVIEW_BLOCKER_TYPES = [
  'draft-missing',
  'draft-stale',
  'application-preflight-missing',
  'application-preflight-stale',
  'patch-draft-missing',
  'patch-draft-drift',
  'diff-preview-missing',
  'diff-preview-drift',
  'dry-run-proof-missing',
  'verification-output-missing',
  'verification-output-failed',
  'rollback-proof-missing',
  'reviewer-notes-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'draft-review-scope-too-broad',
  'review-approves-unapproved-file',
  'review-attempts-source-mutation',
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
  const sourceMutationApplicationPreflight = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-application-preflight-status.mjs',
  );
  const sourceMutationDraft = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-status.mjs',
  );
  const sourceMutationDraftReview = sourceText(
    sources,
    'scripts/growth-remediation-source-mutation-draft-review-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    sourceMutationDraftDocumented:
      /Twenty-second Implemented Slice: `growth-remediation-source-mutation-draft-status`/.test(
        plan,
      ),
    sourceMutationDraftReviewDocumented:
      /Twenty-third Implemented Slice: `growth-remediation-source-mutation-draft-review-status`/.test(
        plan,
      ),
    sourceMutationApplicationPreflightImplemented:
      /mode: 'growth-remediation-source-mutation-application-preflight-status'/.test(
        sourceMutationApplicationPreflight,
      ),
    sourceMutationDraftImplemented:
      /mode: 'growth-remediation-source-mutation-draft-status'/.test(sourceMutationDraft),
    sourceMutationDraftReviewImplemented:
      /mode: 'growth-remediation-source-mutation-draft-review-status'/.test(
        sourceMutationDraftReview,
      ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsPreflight: /preflight/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsSourceMutationDraftReview:
      /growth-remediation-source-mutation-draft-review-status/.test(harnessBaseline),
    completionReadinessMentionsSourceMutationDraftReview:
      /growth-remediation-source-mutation-draft-review-status/.test(completionReadiness),
    ledgerMentionsSourceMutationDraftReview:
      /growth-remediation-source-mutation-draft-review-status-readonly-post-m7-830/.test(todo),
    verificationIncludesSourceMutationDraftReview:
      /growth-remediation-source-mutation-draft-review-status/.test(verificationStatus),
    sourceMutationApplyAuthorizationNextDocumented:
      /growth-remediation-source-mutation-apply-authorization-status/.test(plan),
    currentDraftDocumented: /current source mutation draft record/.test(plan),
    applicationPreflightDocumented: /application preflight refs/.test(plan),
    patchDraftDocumented: /patch draft refs/.test(plan),
    diffPreviewDocumented: /diff preview refs/.test(plan),
    dryRunProofDocumented: /dry-run proof refs/.test(plan),
    verificationOutputDocumented: /verification output refs/.test(plan),
    rollbackProofDocumented: /rollback proof refs/.test(plan),
    reviewerNotesDocumented: /reviewer notes/.test(plan),
    negativeEvidenceClearanceDocumented: /negative evidence clearance/.test(plan),
    sourceOfTruthDocumented: /source-of-truth refs/.test(plan),
    taskLedgerRefsDocumented: /task ledger refs/.test(plan),
    draftReviewSeparateFromMutation:
      /draft review stays separate from actually mutating source/.test(plan),
    applyAuthorizationStillBlocked:
      /before source mutation apply\s+authorization can be considered/.test(plan),
    sourceMutationStillBlocked: /mutating source/.test(plan) || /mutate source/.test(plan),
    remediationExecutionStillBlocked:
      /executing remediation/.test(plan) || /execute remediation/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const sourceMutationDraftReviewSchema = {
  sourceMutationDraftReviewRecord: fields(
    [
      'draftReviewId',
      'draftId',
      'applicationPreflightId',
      'authorizationId',
      'state',
      'decisionType',
      'patchDraftRefs',
      'diffPreviewRefs',
      'verificationCommandSetRefs',
      'verificationOutputRefs',
      'dryRunProofRefs',
      'restorePlanRefs',
      'rollbackPlanRefs',
      'rollbackProofRefs',
      'reviewerNoteRefs',
      'sourceOfTruthRefs',
      'taskLedgerRefs',
      'blockerRefs',
      'applyAuthorizationAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  sourceMutationDraftReviewDecision: fields(
    [
      'decisionId',
      'draftReviewId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'applyAuthorizationAllowed',
      'sourceMutationAllowed',
      'remediationExecutionAllowed',
    ],
    ['operatorNotes', 'reviewerNotes'],
  ),
  sourceMutationDraftReviewBlocker: fields(
    [
      'blockerId',
      'draftReviewId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksApplyAuthorization',
      'blocksSourceMutation',
      'resolvedAt',
    ],
    ['ownerSurface', 'resolutionNotes'],
  ),
  sourceMutationDraftReviewIndex: fields(
    [
      'indexId',
      'draftReviewRefs',
      'stateCounts',
      'decisionCounts',
      'blockerCounts',
      'lastUpdatedAt',
    ],
    ['generatedFromCommand'],
  ),
};

const sourceMutationDraftReviewRules = [
  {
    id: 'draft-review-requires-current-source-mutation-draft',
    rule: 'source mutation draft review readiness can only bind to one current source mutation draft and its exact application preflight and authorization chain',
  },
  {
    id: 'draft-review-is-not-source-mutation',
    rule: 'source mutation draft review status may mark apply-authorization readiness, but it cannot apply patches, mutate source, apply proposals, or execute remediation',
  },
  {
    id: 'draft-review-requires-patch-diff-dry-run-and-verification',
    rule: 'patch draft refs, diff preview refs, dry-run proof refs, verification command set refs, and verification output refs must be present before apply authorization readiness can be considered',
  },
  {
    id: 'draft-review-requires-rollback-proof-and-negative-evidence-clearance',
    rule: 'rollback proof, reviewer notes, source-of-truth refs, task ledger refs, and negative evidence clearance must be present before apply authorization readiness can be considered',
  },
  {
    id: 'failed-stale-or-mutating-review-blocks-apply-authorization',
    rule: 'stale drafts, failed review, unresolved negative evidence, unapproved file touches, changed verification output, missing rollback proof, or any attempted source mutation blocks apply authorization readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(sourceMutationDraftReviewSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.sourceMutationDraftDocumented &&
  sourceSummary.sourceMutationDraftReviewDocumented &&
  sourceSummary.sourceMutationApplicationPreflightImplemented &&
  sourceSummary.sourceMutationDraftImplemented &&
  sourceSummary.sourceMutationDraftReviewImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsPreflight &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsSourceMutationDraftReview &&
  sourceSummary.completionReadinessMentionsSourceMutationDraftReview &&
  sourceSummary.ledgerMentionsSourceMutationDraftReview &&
  sourceSummary.verificationIncludesSourceMutationDraftReview &&
  sourceSummary.sourceMutationApplyAuthorizationNextDocumented &&
  sourceSummary.currentDraftDocumented &&
  sourceSummary.applicationPreflightDocumented &&
  sourceSummary.patchDraftDocumented &&
  sourceSummary.diffPreviewDocumented &&
  sourceSummary.dryRunProofDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.reviewerNotesDocumented &&
  sourceSummary.negativeEvidenceClearanceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.taskLedgerRefsDocumented &&
  sourceSummary.draftReviewSeparateFromMutation &&
  sourceSummary.applyAuthorizationStillBlocked &&
  sourceSummary.sourceMutationStillBlocked &&
  sourceSummary.remediationExecutionStillBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-source-mutation-draft-review-status',
  posture: 'local-read-only-remediation-source-mutation-draft-review-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-source-mutation-draft-review-status/v0',
  sourceSummary,
  vocabulary: {
    sourceMutationDraftReviewStates: SOURCE_MUTATION_DRAFT_REVIEW_STATES,
    sourceMutationDraftReviewDecisionTypes: SOURCE_MUTATION_DRAFT_REVIEW_DECISION_TYPES,
    sourceMutationDraftReviewEvidenceTypes: SOURCE_MUTATION_DRAFT_REVIEW_EVIDENCE_TYPES,
    sourceMutationDraftReviewBlockerTypes: SOURCE_MUTATION_DRAFT_REVIEW_BLOCKER_TYPES,
  },
  sourceMutationDraftReviewSchema,
  sourceMutationDraftReviewRules,
  sourceMutationDraftReviewState: {
    realSourceMutationDraftReviewFileAdopted: false,
    discoveredSourceMutationDraftReviews: 0,
    applyAuthorizationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-source-mutation-draft-review',
  },
  readiness: {
    requiredFieldsSatisfied,
    sourceMutationDraftReviewRecordTypes: Object.keys(sourceMutationDraftReviewSchema).length,
    currentDraftRequired: true,
    applicationPreflightRequired: true,
    patchDraftRequired: true,
    diffPreviewRequired: true,
    dryRunProofRequired: true,
    verificationOutputRequired: true,
    rollbackProofRequired: true,
    reviewerNotesRequired: true,
    negativeEvidenceClearanceRequired: true,
    draftReviewAndMutationSeparate: true,
    applyAuthorizationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForSourceMutationApplyAuthorizationStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-apply-authorization-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-apply-authorization-status.mjs',
    reason:
      'Source mutation draft review readiness is now modeled as read-only; the next safe slice should define apply authorization gates before any source mutation or remediation execution can act.',
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
