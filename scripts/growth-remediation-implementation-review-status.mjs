import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-implementation-review-status',
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
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-worker-event-schema.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-skill-memory-registry-status.mjs',
  'scripts/growth-gateway-surface-router-status.mjs',
  'scripts/growth-continuous-development-loop-status.mjs',
  'scripts/growth-improvement-acceptance-status.mjs',
  'scripts/growth-accepted-improvement-registry-status.mjs',
  'scripts/growth-regression-watch-status.mjs',
  'scripts/growth-rollback-review-status.mjs',
  'scripts/growth-remediation-plan-status.mjs',
  'scripts/growth-remediation-approval-status.mjs',
  'scripts/growth-remediation-implementation-proposal-status.mjs',
  'scripts/growth-remediation-implementation-review-status.mjs',
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const IMPLEMENTATION_REVIEW_STATES = [
  'review-not-started',
  'review-ready',
  'review-blocked',
  'scope-change-detected',
  'needs-verification-evidence',
  'needs-rollback-proof',
  'approved-for-thin-slice-readiness',
  'changes-requested',
  'rejected',
  'deferred',
  'stale-proof-blocked',
  'closed-no-action',
];

const IMPLEMENTATION_REVIEW_DECISION_TYPES = [
  'approve-thin-slice-readiness',
  'request-scope-clarification',
  'request-verification-evidence',
  'request-rollback-proof',
  'reject-implementation-proposal',
  'defer-review',
  'hold-baseline',
];

const IMPLEMENTATION_REVIEW_EVIDENCE_TYPES = [
  'implementation-proposal-record',
  'remediation-approval-record',
  'remediation-plan-record',
  'file-scope-ref',
  'surface-ref',
  'verification-command',
  'verification-output',
  'rollback-proof',
  'reviewer-note',
  'operator-approval',
  'negative-evidence',
  'source-of-truth-doc',
  'aggregate-verification',
];

const IMPLEMENTATION_REVIEW_BLOCKER_TYPES = [
  'proposal-missing',
  'approval-missing',
  'scope-drift',
  'verification-output-missing',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'stale-proposal',
  'execution-authority-missing',
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
  const implementationProposal = sourceText(
    sources,
    'scripts/growth-remediation-implementation-proposal-status.mjs',
  );
  const implementationReview = sourceText(
    sources,
    'scripts/growth-remediation-implementation-review-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    implementationProposalDocumented:
      /Fourteenth Implemented Slice: `growth-remediation-implementation-proposal-status`/.test(
        plan,
      ),
    implementationReviewDocumented:
      /Fifteenth Implemented Slice: `growth-remediation-implementation-review-status`/.test(plan),
    implementationProposalImplemented:
      /mode: 'growth-remediation-implementation-proposal-status'/.test(implementationProposal),
    implementationReviewImplemented:
      /mode: 'growth-remediation-implementation-review-status'/.test(implementationReview),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /human gate/.test(pack),
    agentsRequireReviewBeforeDone: /review before done/.test(agents),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsImplementationReview:
      /growth-remediation-implementation-review-status/.test(harnessBaseline),
    completionReadinessMentionsImplementationReview:
      /growth-remediation-implementation-review-status/.test(completionReadiness),
    ledgerMentionsImplementationReview:
      /growth-remediation-implementation-review-status-readonly-post-m7-822/.test(todo),
    verificationIncludesImplementationReview:
      /growth-remediation-implementation-review-status/.test(verificationStatus),
    executionAuthorityNextDocumented: /growth-remediation-source-mutation-request-status/.test(plan),
    verificationOutputDocumented: /verification output/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    scopeDriftDocumented: /scope drift/.test(plan) || /changed file\/surface scope/.test(plan),
    negativeEvidenceDocumented: /negative evidence/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    reviewDoesNotMutate:
      /does not .*mutate source/.test(plan) || /without mutating source/.test(plan),
    reviewDoesNotExecute:
      /does not execute remediation/.test(plan) || /without executing remediation/.test(plan),
    proposalGenerationBlocked:
      /does not generate implementation\s+proposals/.test(plan) ||
      /without generating implementation\s+proposals/.test(plan),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const implementationReviewSchema = {
  implementationReviewRecord: fields(
    [
      'reviewId',
      'proposalId',
      'approvalId',
      'planId',
      'state',
      'decisionType',
      'reviewerRefs',
      'fileScopeRefs',
      'surfaceRefs',
      'verificationCommandRefs',
      'verificationOutputRefs',
      'rollbackProofRefs',
      'operatorApprovalRefs',
      'sourceOfTruthRefs',
      'blockerRefs',
      'thinSliceReadinessAllowed',
      'sourceMutationAllowed',
      'executionAllowed',
    ],
    ['riskClass', 'ownerSurface', 'reviewedAt', 'deferredReason'],
  ),
  implementationReviewFinding: fields(
    [
      'findingId',
      'reviewId',
      'severity',
      'findingType',
      'evidenceRefs',
      'requiredAction',
      'blocksThinSliceReadiness',
      'resolvedAt',
    ],
    ['ownerSurface', 'reviewerNote'],
  ),
  implementationReviewDecision: fields(
    [
      'decisionId',
      'reviewId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'executionAllowed',
    ],
    ['expiresAt', 'operatorNotes'],
  ),
  implementationReviewIndex: fields(
    ['indexId', 'reviewRefs', 'stateCounts', 'decisionCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const implementationReviewRules = [
  {
    id: 'review-requires-implementation-proposal',
    rule: 'implementation review readiness starts from a bounded implementation proposal and cannot bypass remediation approval, remediation plan, or rollback review proof',
  },
  {
    id: 'review-is-not-source-mutation',
    rule: 'status output may define review fields and decisions, but it cannot mutate source, apply proposals, or execute remediation',
  },
  {
    id: 'thin-slice-readiness-requires-review',
    rule: 'a future thin implementation slice must be explicitly review-approved before any source mutation authority can be considered',
  },
  {
    id: 'verification-output-and-rollback-proof-required',
    rule: 'review readiness requires verification output references and rollback proof, not just planned verification commands',
  },
  {
    id: 'scope-drift-blocks-review',
    rule: 'changed file scope, changed surface scope, stale proposal proof, unresolved negative evidence, or source-of-truth drift blocks thin-slice readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(implementationReviewSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.implementationProposalDocumented &&
  sourceSummary.implementationReviewDocumented &&
  sourceSummary.implementationProposalImplemented &&
  sourceSummary.implementationReviewImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireReviewBeforeDone &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsImplementationReview &&
  sourceSummary.completionReadinessMentionsImplementationReview &&
  sourceSummary.ledgerMentionsImplementationReview &&
  sourceSummary.verificationIncludesImplementationReview &&
  sourceSummary.executionAuthorityNextDocumented &&
  sourceSummary.verificationOutputDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.scopeDriftDocumented &&
  sourceSummary.negativeEvidenceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.reviewDoesNotMutate &&
  sourceSummary.reviewDoesNotExecute &&
  sourceSummary.proposalGenerationBlocked &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-implementation-review-status',
  posture: 'local-read-only-remediation-implementation-review-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-implementation-review-status/v0',
  sourceSummary,
  vocabulary: {
    implementationReviewStates: IMPLEMENTATION_REVIEW_STATES,
    implementationReviewDecisionTypes: IMPLEMENTATION_REVIEW_DECISION_TYPES,
    implementationReviewEvidenceTypes: IMPLEMENTATION_REVIEW_EVIDENCE_TYPES,
    implementationReviewBlockerTypes: IMPLEMENTATION_REVIEW_BLOCKER_TYPES,
  },
  implementationReviewSchema,
  implementationReviewRules,
  implementationReviewState: {
    realImplementationReviewFileAdopted: false,
    discoveredImplementationReviews: 0,
    implementationReviewMutationAllowed: false,
    thinSliceReadinessGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-implementation-reviews',
  },
  readiness: {
    requiredFieldsSatisfied,
    implementationReviewRecordTypes: Object.keys(implementationReviewSchema).length,
    implementationProposalRequired: true,
    remediationApprovalRequired: true,
    verificationOutputRequired: true,
    rollbackProofRequired: true,
    scopeDriftBlocksReview: true,
    reviewAndApprovalSeparate: true,
    implementationReviewMutationAllowed: false,
    thinSliceReadinessGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForThinSliceStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-request-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-request-status.mjs',
    reason:
      'The implementation review and thin-slice readiness contracts are now modeled as read-only; the next safe slice should define execution authority before any reviewed implementation can mutate source or execute remediation.',
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
