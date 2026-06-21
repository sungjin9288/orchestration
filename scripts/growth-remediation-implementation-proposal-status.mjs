import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-remediation-implementation-proposal-status',
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
  'scripts/verification_status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const IMPLEMENTATION_PROPOSAL_STATES = [
  'proposal-not-started',
  'draft-eligible',
  'draft-blocked',
  'scope-review-needed',
  'verification-plan-needed',
  'rollback-proof-needed',
  'ready-for-review',
  'review-approved-for-thin-slice',
  'rejected',
  'deferred',
  'stale-proof-blocked',
  'closed-no-action',
];

const IMPLEMENTATION_PROPOSAL_TYPES = [
  'docs-only',
  'smoke-only',
  'ui-copy-only',
  'runtime-guard-only',
  'source-of-truth-alignment',
  'test-coverage',
  'rollback-proof',
  'task-ledger-sync',
];

const IMPLEMENTATION_PROPOSAL_EVIDENCE_TYPES = [
  'remediation-approval-record',
  'remediation-plan-record',
  'rollback-review-record',
  'file-scope-ref',
  'surface-ref',
  'verification-command',
  'rollback-proof',
  'reviewer-note',
  'operator-approval',
  'negative-evidence',
  'source-of-truth-doc',
  'aggregate-verification',
];

const IMPLEMENTATION_PROPOSAL_BLOCKER_TYPES = [
  'approval-missing',
  'file-scope-unclear',
  'surface-scope-unclear',
  'verification-command-missing',
  'rollback-proof-missing',
  'negative-evidence-unresolved',
  'source-of-truth-drift',
  'stale-approval',
  'execution-authority-missing',
];

const IMPLEMENTATION_CHANGE_TYPES = [
  'documentation',
  'smoke-guard',
  'ui-copy',
  'runtime-guard',
  'task-ledger',
  'source-of-truth-doc',
  'verification-only',
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
    harnessMentionsImplementationProposal:
      /growth-remediation-implementation-proposal-status/.test(harnessBaseline),
    completionReadinessMentionsImplementationProposal:
      /growth-remediation-implementation-proposal-status/.test(completionReadiness),
    ledgerMentionsImplementationProposal:
      /growth-remediation-implementation-proposal-status-readonly-post-m7-821/.test(todo),
    verificationIncludesImplementationProposal:
      /growth-remediation-implementation-proposal-status/.test(verificationStatus),
    implementationReviewNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
    implementationProposalFieldsDocumented: /implementation proposal fields/.test(plan),
    fileSurfaceRefsDocumented: /file\/surface refs/.test(plan),
    verificationCommandDocumented: /verification commands/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    staleProofDocumented: /stale proof/.test(plan),
    negativeEvidenceDocumented: /negative evidence/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    proposalGenerationBlocked:
      /does not generate implementation\s+proposals/.test(plan) ||
      /without generating implementation\s+proposals/.test(plan) ||
      /must not generate implementation\s+proposals/.test(plan),
    sourceMutationBlocked:
      /does not .*mutate source/.test(plan) || /without mutating source/.test(plan),
    remediationExecutionBlocked:
      /does not execute remediation/.test(plan) || /without executing remediation/.test(plan),
    approvalAndReviewPreserved:
      /operator approval/.test(plan) &&
      /review before done/.test(agents) &&
      /approval before commit/.test(agents),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const implementationProposalSchema = {
  implementationProposalRecord: fields(
    [
      'proposalId',
      'approvalId',
      'planId',
      'state',
      'proposalType',
      'title',
      'objective',
      'fileScopeRefs',
      'surfaceRefs',
      'allowedChangeTypes',
      'verificationCommandRefs',
      'rollbackProofRefs',
      'reviewerNoteRefs',
      'operatorApprovalRefs',
      'sourceOfTruthRefs',
      'blockerRefs',
      'generationAllowed',
      'sourceMutationAllowed',
      'executionAllowed',
    ],
    ['riskClass', 'ownerSurface', 'expiresAt', 'deferredReason'],
  ),
  implementationProposalStep: fields(
    [
      'stepId',
      'proposalId',
      'order',
      'changeType',
      'targetRefs',
      'verificationCommandRefs',
      'rollbackProofRequired',
      'requiresOperatorApproval',
      'executionAllowed',
    ],
    ['riskClass', 'operatorNotes'],
  ),
  implementationProposalBlocker: fields(
    [
      'blockerId',
      'proposalId',
      'blockerType',
      'severity',
      'evidenceRefs',
      'blocksReview',
      'blocksExecution',
      'resolvedAt',
    ],
    ['ownerSurface', 'reviewerNote'],
  ),
  implementationProposalIndex: fields(
    ['indexId', 'proposalRefs', 'stateCounts', 'typeCounts', 'blockerCounts', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const implementationProposalRules = [
  {
    id: 'proposal-requires-remediation-approval',
    rule: 'implementation proposal readiness starts from an explicit remediation approval record and cannot bypass plan, rollback review, or verification evidence',
  },
  {
    id: 'proposal-modeling-is-not-generation',
    rule: 'status output may define proposal fields and readiness, but it cannot generate implementation proposals or mutate source',
  },
  {
    id: 'source-mutation-requires-reviewed-thin-slice',
    rule: 'source mutation stays blocked until a later reviewed thin implementation slice has explicit operator authority',
  },
  {
    id: 'verification-and-rollback-proof-required',
    rule: 'every implementation proposal step must carry verification commands and rollback-proof requirements before review',
  },
  {
    id: 'stale-or-negative-proof-blocks-proposal',
    rule: 'stale approval, unresolved negative evidence, missing rollback proof, or source-of-truth drift blocks implementation proposal readiness',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(implementationProposalSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
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
  sourceSummary.harnessMentionsImplementationProposal &&
  sourceSummary.completionReadinessMentionsImplementationProposal &&
  sourceSummary.ledgerMentionsImplementationProposal &&
  sourceSummary.verificationIncludesImplementationProposal &&
  sourceSummary.implementationReviewNextDocumented &&
  sourceSummary.implementationProposalFieldsDocumented &&
  sourceSummary.fileSurfaceRefsDocumented &&
  sourceSummary.verificationCommandDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.staleProofDocumented &&
  sourceSummary.negativeEvidenceDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.proposalGenerationBlocked &&
  sourceSummary.sourceMutationBlocked &&
  sourceSummary.remediationExecutionBlocked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-implementation-proposal-status',
  posture: 'local-read-only-remediation-implementation-proposal-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-implementation-proposal-status/v0',
  sourceSummary,
  vocabulary: {
    implementationProposalStates: IMPLEMENTATION_PROPOSAL_STATES,
    implementationProposalTypes: IMPLEMENTATION_PROPOSAL_TYPES,
    implementationProposalEvidenceTypes: IMPLEMENTATION_PROPOSAL_EVIDENCE_TYPES,
    implementationProposalBlockerTypes: IMPLEMENTATION_PROPOSAL_BLOCKER_TYPES,
    implementationChangeTypes: IMPLEMENTATION_CHANGE_TYPES,
  },
  implementationProposalSchema,
  implementationProposalRules,
  implementationProposalState: {
    realImplementationProposalFileAdopted: false,
    discoveredImplementationProposals: 0,
    implementationProposalMutationAllowed: false,
    implementationProposalGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-implementation-proposals',
  },
  readiness: {
    requiredFieldsSatisfied,
    implementationProposalRecordTypes: Object.keys(implementationProposalSchema).length,
    remediationApprovalRequired: true,
    fileScopeRequired: true,
    surfaceScopeRequired: true,
    verificationCommandsRequired: true,
    rollbackProofRequired: true,
    staleProofBlocksProposal: true,
    reviewAndApprovalSeparate: true,
    implementationProposalMutationAllowed: false,
    implementationProposalGenerationAllowed: false,
    sourceMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
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
