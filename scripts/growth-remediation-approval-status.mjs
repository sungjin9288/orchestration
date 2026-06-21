import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-remediation-approval-status' });

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
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const REMEDIATION_APPROVAL_STATES = [
  'approval-not-started',
  'needs-review',
  'needs-evidence',
  'ready-for-operator-approval',
  'approved-for-implementation-proposal',
  'rejected',
  'deferred',
  'stale-proof-blocked',
  'closed-no-action',
];

const REMEDIATION_APPROVAL_DECISION_TYPES = [
  'approve-implementation-proposal-draft',
  'reject-remediation-plan',
  'request-more-evidence',
  'defer-approval',
  'mark-stale-proof-blocked',
  'hold-baseline',
];

const REMEDIATION_APPROVAL_EVIDENCE_TYPES = [
  'remediation-plan-record',
  'rollback-review-record',
  'verification-plan',
  'rollback-proof',
  'reviewer-note',
  'operator-approval',
  'negative-evidence',
  'stale-proof-check',
  'source-of-truth-doc',
  'aggregate-verification',
];

const REMEDIATION_APPROVAL_BLOCKER_TYPES = [
  'missing-rollback-proof',
  'missing-verification-plan',
  'stale-aggregate-verification',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'approval-authority-missing',
  'reviewer-note-missing',
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
  const engineStatus = sourceText(sources, 'scripts/growth-engine-status.mjs');
  const reflectionEvaluator = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');
  const workerEventSchema = sourceText(sources, 'scripts/growth-worker-event-schema.mjs');
  const proposalQueue = sourceText(sources, 'scripts/growth-proposal-queue-status.mjs');
  const skillMemoryRegistry = sourceText(sources, 'scripts/growth-skill-memory-registry-status.mjs');
  const surfaceRouter = sourceText(sources, 'scripts/growth-gateway-surface-router-status.mjs');
  const continuousLoop = sourceText(sources, 'scripts/growth-continuous-development-loop-status.mjs');
  const improvementAcceptance = sourceText(sources, 'scripts/growth-improvement-acceptance-status.mjs');
  const acceptedRegistry = sourceText(
    sources,
    'scripts/growth-accepted-improvement-registry-status.mjs',
  );
  const regressionWatch = sourceText(sources, 'scripts/growth-regression-watch-status.mjs');
  const rollbackReview = sourceText(sources, 'scripts/growth-rollback-review-status.mjs');
  const remediationPlan = sourceText(sources, 'scripts/growth-remediation-plan-status.mjs');
  const remediationApproval = sourceText(sources, 'scripts/growth-remediation-approval-status.mjs');
  const implementationProposal = sourceText(
    sources,
    'scripts/growth-remediation-implementation-proposal-status.mjs',
  );
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    remediationPlanDocumented:
      /Twelfth Implemented Slice: `growth-remediation-plan-status`/.test(plan),
    remediationApprovalDocumented:
      /Thirteenth Implemented Slice: `growth-remediation-approval-status`/.test(plan),
    implementationProposalDocumented:
      /Fourteenth Implemented Slice: `growth-remediation-implementation-proposal-status`/.test(
        plan,
      ),
    engineStatusImplemented: /mode: 'growth-engine-status'/.test(engineStatus),
    reflectionEvaluatorImplemented: /mode: 'growth-reflection-evaluator'/.test(reflectionEvaluator),
    workerEventSchemaImplemented: /mode: 'growth-worker-event-schema'/.test(workerEventSchema),
    proposalQueueImplemented: /mode: 'growth-proposal-queue-status'/.test(proposalQueue),
    skillMemoryRegistryImplemented: /mode: 'growth-skill-memory-registry-status'/.test(
      skillMemoryRegistry,
    ),
    gatewaySurfaceRouterImplemented: /mode: 'growth-gateway-surface-router-status'/.test(surfaceRouter),
    continuousDevelopmentLoopImplemented: /mode: 'growth-continuous-development-loop-status'/.test(
      continuousLoop,
    ),
    improvementAcceptanceImplemented: /mode: 'growth-improvement-acceptance-status'/.test(
      improvementAcceptance,
    ),
    acceptedImprovementRegistryImplemented:
      /mode: 'growth-accepted-improvement-registry-status'/.test(acceptedRegistry),
    regressionWatchImplemented: /mode: 'growth-regression-watch-status'/.test(regressionWatch),
    rollbackReviewImplemented: /mode: 'growth-rollback-review-status'/.test(rollbackReview),
    remediationPlanImplemented: /mode: 'growth-remediation-plan-status'/.test(remediationPlan),
    remediationApprovalImplemented: /mode: 'growth-remediation-approval-status'/.test(
      remediationApproval,
    ),
    implementationProposalImplemented:
      /mode: 'growth-remediation-implementation-proposal-status'/.test(implementationProposal),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /human gate/.test(pack),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsRemediationApproval: /growth-remediation-approval-status/.test(harnessBaseline),
    completionReadinessMentionsRemediationApproval:
      /growth-remediation-approval-status/.test(completionReadiness),
    ledgerMentionsRemediationApproval:
      /growth-remediation-approval-status-readonly-post-m7-820/.test(todo),
    verificationIncludesRemediationApproval: /growth-remediation-approval-status/.test(
      verificationStatus,
    ),
    implementationProposalNextDocumented:
      /growth-remediation-implementation-proposal-status/.test(plan),
    implementationReviewNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
    remediationApprovalFieldsDocumented: /remediation approval fields/.test(plan),
    verificationPlanDocumented: /verification plan/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    staleProofDocumented: /stale proof/.test(plan),
    negativeEvidenceDocumented: /negative evidence/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    implementationProposalBlocked:
      /does not generate implementation\s+proposals/.test(plan) ||
      /without generating implementation\s+proposals/.test(plan) ||
      /must not generate implementation\s+proposals/.test(plan),
    implementationExecutionBlocked:
      /does not execute remediation/.test(plan) || /without executing remediation/.test(plan),
    sourceMutationBlocked:
      /does not .*mutate source/.test(plan) || /without mutating source/.test(plan),
    approvalAndReviewPreserved:
      /operator approval/.test(plan) &&
      /review before done/.test(agents) &&
      /approval before commit/.test(agents),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const remediationApprovalSchema = {
  remediationApprovalRecord: fields(
    [
      'approvalId',
      'planId',
      'state',
      'decisionType',
      'authority',
      'remediationPlanRef',
      'rollbackReviewRef',
      'verificationPlanRefs',
      'rollbackProofRefs',
      'reviewerNoteRefs',
      'operatorDecisionRefs',
      'sourceOfTruthRefs',
      'blockerRefs',
      'implementationProposalAllowed',
      'executionAllowed',
    ],
    ['expiresAt', 'deferredReason', 'rejectionReason'],
  ),
  remediationApprovalBlocker: fields(
    [
      'blockerId',
      'approvalId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksImplementationProposal',
      'resolvedAt',
    ],
    ['ownerSurface', 'reviewerNote'],
  ),
  remediationApprovalDecision: fields(
    [
      'decisionId',
      'approvalId',
      'decisionType',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'executionAllowed',
    ],
    ['expiresAt', 'supersedesDecisionId'],
  ),
  remediationApprovalIndex: fields(
    ['indexId', 'approvalRefs', 'stateCounts', 'blockerCounts', 'sourceRefs', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const remediationApprovalRules = [
  {
    id: 'approval-requires-remediation-plan',
    rule: 'remediation approval starts from a remediation plan record and cannot bypass rollback review or verification evidence',
  },
  {
    id: 'approval-is-not-execution',
    rule: 'approval records may authorize a future implementation proposal draft, but they cannot execute remediation or mutate source',
  },
  {
    id: 'implementation-proposal-requires-approval',
    rule: 'implementation proposal status may be modeled only after approval has explicit authority, evidence refs, and blocker state',
  },
  {
    id: 'stale-or-negative-proof-blocks-approval',
    rule: 'stale aggregate verification, missing rollback proof, unresolved negative evidence, or source-of-truth drift blocks approval readiness',
  },
  {
    id: 'authority-remains-operator-visible',
    rule: 'operator approval and reviewer notes stay visible and separate from automated status output',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(remediationApprovalSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.remediationPlanDocumented &&
  sourceSummary.remediationApprovalDocumented &&
  sourceSummary.implementationProposalDocumented &&
  sourceSummary.engineStatusImplemented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.workerEventSchemaImplemented &&
  sourceSummary.proposalQueueImplemented &&
  sourceSummary.skillMemoryRegistryImplemented &&
  sourceSummary.gatewaySurfaceRouterImplemented &&
  sourceSummary.continuousDevelopmentLoopImplemented &&
  sourceSummary.improvementAcceptanceImplemented &&
  sourceSummary.acceptedImprovementRegistryImplemented &&
  sourceSummary.regressionWatchImplemented &&
  sourceSummary.rollbackReviewImplemented &&
  sourceSummary.remediationPlanImplemented &&
  sourceSummary.remediationApprovalImplemented &&
  sourceSummary.implementationProposalImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsRemediationApproval &&
  sourceSummary.completionReadinessMentionsRemediationApproval &&
  sourceSummary.ledgerMentionsRemediationApproval &&
  sourceSummary.verificationIncludesRemediationApproval &&
  sourceSummary.implementationProposalNextDocumented &&
  sourceSummary.implementationReviewNextDocumented &&
  sourceSummary.remediationApprovalFieldsDocumented &&
  sourceSummary.verificationPlanDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.staleProofDocumented &&
  sourceSummary.negativeEvidenceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.implementationProposalBlocked &&
  sourceSummary.implementationExecutionBlocked &&
  sourceSummary.sourceMutationBlocked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-approval-status',
  posture: 'local-read-only-remediation-approval-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-approval-status/v0',
  sourceSummary,
  vocabulary: {
    remediationApprovalStates: REMEDIATION_APPROVAL_STATES,
    remediationApprovalDecisionTypes: REMEDIATION_APPROVAL_DECISION_TYPES,
    remediationApprovalEvidenceTypes: REMEDIATION_APPROVAL_EVIDENCE_TYPES,
    remediationApprovalBlockerTypes: REMEDIATION_APPROVAL_BLOCKER_TYPES,
  },
  remediationApprovalSchema,
  remediationApprovalRules,
  remediationApprovalState: {
    realRemediationApprovalFileAdopted: false,
    discoveredRemediationApprovals: 0,
    remediationApprovalMutationAllowed: false,
    implementationProposalGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-approval-records',
  },
  readiness: {
    requiredFieldsSatisfied,
    remediationApprovalRecordTypes: Object.keys(remediationApprovalSchema).length,
    remediationPlanRequired: true,
    rollbackProofRequired: true,
    verificationPlanRequired: true,
    staleProofBlocksApproval: true,
    reviewAndApprovalSeparate: true,
    remediationApprovalMutationAllowed: false,
    implementationProposalGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForImplementationProposalStatus: true,
    implementationProposalStatusImplemented: true,
    readyForImplementationReviewStatus: true,
  },
  nextRecommendedSlice: {
    id: 'growth-remediation-source-mutation-request-status',
    commandToAdd: 'node scripts/growth-remediation-source-mutation-request-status.mjs',
    reason:
      'The implementation proposal contract is now modeled as read-only; the next safe slice should define review gates before any thin implementation slice can mutate source or execute remediation.',
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
