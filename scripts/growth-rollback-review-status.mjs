import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-rollback-review-status' });

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

const ROLLBACK_REVIEW_TRIGGER_TYPES = [
  'blocking-regression-watch',
  'source-of-truth-drift',
  'failed-aggregate-verification',
  'negative-evidence-confirmed',
  'memory-boundary-regression',
  'gateway-routing-regression',
  'dogfood-lifecycle-regression',
  'operator-request',
];

const ROLLBACK_REVIEW_STATES = [
  'review-not-started',
  'needs-evidence',
  'under-review',
  'rollback-recommended',
  'rollback-rejected',
  'rollback-deferred',
  'false-positive',
  'closed-no-action',
];

const ROLLBACK_REVIEW_SEVERITIES = [
  'watch',
  'warning',
  'blocking',
  'rollback-candidate',
  'hold-baseline',
];

const ROLLBACK_REVIEW_EVIDENCE_TYPES = [
  'accepted-registry-record',
  'regression-watch-record',
  'observed-regression',
  'negative-evidence',
  'aggregate-verification',
  'smoke-regression',
  'reviewer-note',
  'operator-decision',
  'source-of-truth-doc',
];

const ROLLBACK_REVIEW_DECISION_TYPES = [
  'recommend-remediation-plan',
  'reject-rollback',
  'defer-review',
  'request-more-evidence',
  'mark-false-positive',
  'hold-baseline',
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
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    regressionWatchDocumented:
      /Tenth Implemented Slice: `growth-regression-watch-status`/.test(plan),
    rollbackReviewDocumented:
      /Eleventh Implemented Slice: `growth-rollback-review-status`/.test(plan),
    remediationPlanDocumented:
      /Twelfth Implemented Slice: `growth-remediation-plan-status`/.test(plan),
    remediationApprovalDocumented:
      /Thirteenth Implemented Slice: `growth-remediation-approval-status`/.test(plan),
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
    remediationPlanStatusImplemented: /mode: 'growth-remediation-plan-status'/.test(remediationPlan),
    remediationApprovalStatusImplemented: /mode: 'growth-remediation-approval-status'/.test(
      remediationApproval,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /human gate/.test(pack),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsRollbackReview: /growth-rollback-review-status/.test(harnessBaseline),
    completionReadinessMentionsRollbackReview:
      /growth-rollback-review-status/.test(completionReadiness),
    ledgerMentionsRollbackReview:
      /growth-rollback-review-status-readonly-post-m7-818/.test(todo),
    verificationIncludesRollbackReview: /growth-rollback-review-status/.test(verificationStatus),
    remediationPlanNextDocumented: /growth-remediation-plan-status/.test(plan),
    remediationApprovalNextDocumented: /growth-remediation-approval-status/.test(plan),
    implementationProposalNextDocumented:
      /growth-remediation-implementation-proposal-status/.test(plan),
    implementationProposalStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-implementation-proposal-status.mjs'),
    ),
    implementationProposalStatusDocumented:
      /Fourteenth Implemented Slice: `growth-remediation-implementation-proposal-status`/.test(
        plan,
      ),
    implementationReviewNextDocumented:
      /growth-remediation-source-mutation-request-status/.test(plan),
    regressionWatchSignalsDocumented: /regression watch signals/.test(plan),
    aggregateVerificationDocumented: /aggregate verification/.test(plan),
    reviewerNoteDocumented: /reviewer note/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
    rollbackExecutionBlocked:
      /does not execute rollback/.test(plan) || /without executing rollback/.test(plan),
    remediationCreationBlocked:
      /does not .*create remediation/.test(plan) || /without executing remediation/.test(plan),
    approvalAndReviewPreserved:
      /operator approval/.test(plan) &&
      /review before done/.test(agents) &&
      /approval before commit/.test(agents),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const rollbackReviewSchema = {
  rollbackReviewRecord: fields(
    [
      'reviewId',
      'watchId',
      'registryId',
      'state',
      'severity',
      'triggerTypes',
      'acceptedRecordRef',
      'watchRecordRef',
      'regressionEvidenceRefs',
      'negativeEvidenceRefs',
      'aggregateVerificationRefs',
      'reviewerNoteRefs',
      'sourceOfTruthRefs',
      'decisionRefs',
      'remediationPlanAllowed',
    ],
    ['expiresAt', 'ownerSurface'],
  ),
  rollbackDecision: fields(
    [
      'decisionId',
      'decisionType',
      'reviewId',
      'authority',
      'reason',
      'evidenceRefs',
      'allowedNextAction',
      'executionAllowed',
    ],
    ['approvalRef', 'reviewRef'],
  ),
  rollbackRiskAssessment: fields(
    [
      'riskId',
      'reviewId',
      'affectedScopes',
      'blastRadius',
      'sourceRefs',
      'rollbackExecutionBlocked',
      'remediationPlanRef',
    ],
    ['operatorNotes'],
  ),
  rollbackReviewIndex: fields(
    ['indexId', 'reviewRefs', 'stateCounts', 'triggerCounts', 'sourceRefs', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const rollbackReviewRules = [
  {
    id: 'review-requires-regression-watch',
    rule: 'rollback review starts from a regression watch record and cannot create or mutate accepted records',
  },
  {
    id: 'review-is-not-execution',
    rule: 'rollback review may recommend remediation planning, but it cannot execute rollback or remediation',
  },
  {
    id: 'decision-requires-evidence-chain',
    rule: 'rollback decisions require accepted record, watch record, negative evidence, aggregate verification, reviewer notes, and source-of-truth refs when applicable',
  },
  {
    id: 'approval-remains-separate',
    rule: 'operator approval and reviewer notes remain distinct before any future implementation slice can mutate source',
  },
  {
    id: 'false-positive-and-defer-paths-visible',
    rule: 'false-positive, reject, defer, and request-more-evidence decisions remain visible instead of being dropped',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(rollbackReviewSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.regressionWatchDocumented &&
  sourceSummary.rollbackReviewDocumented &&
  sourceSummary.remediationPlanDocumented &&
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
  sourceSummary.remediationPlanStatusImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsRollbackReview &&
  sourceSummary.completionReadinessMentionsRollbackReview &&
  sourceSummary.ledgerMentionsRollbackReview &&
  sourceSummary.verificationIncludesRollbackReview &&
  sourceSummary.remediationPlanNextDocumented &&
  sourceSummary.remediationApprovalNextDocumented &&
  sourceSummary.regressionWatchSignalsDocumented &&
  sourceSummary.aggregateVerificationDocumented &&
  sourceSummary.reviewerNoteDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.rollbackExecutionBlocked &&
  sourceSummary.remediationCreationBlocked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-rollback-review-status',
  posture: 'local-read-only-rollback-review-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-rollback-review-status/v0',
  sourceSummary,
  vocabulary: {
    rollbackReviewTriggerTypes: ROLLBACK_REVIEW_TRIGGER_TYPES,
    rollbackReviewStates: ROLLBACK_REVIEW_STATES,
    rollbackReviewSeverities: ROLLBACK_REVIEW_SEVERITIES,
    rollbackReviewEvidenceTypes: ROLLBACK_REVIEW_EVIDENCE_TYPES,
    rollbackReviewDecisionTypes: ROLLBACK_REVIEW_DECISION_TYPES,
  },
  rollbackReviewSchema,
  rollbackReviewRules,
  rollbackReviewState: {
    realRollbackReviewFileAdopted: false,
    discoveredRollbackReviewRecords: 0,
    rollbackReviewMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationCreationAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-rollback-review-records',
  },
  readiness: {
    requiredFieldsSatisfied,
    rollbackReviewRecordTypes: Object.keys(rollbackReviewSchema).length,
    regressionWatchRequired: true,
    evidenceChainRequired: true,
    reviewAndApprovalSeparate: true,
    rollbackExecutionAllowed: false,
    remediationCreationAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForRemediationPlanStatus: true,
    remediationPlanStatusImplemented: true,
    readyForRemediationApprovalStatus: true,
    remediationApprovalStatusImplemented: true,
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
