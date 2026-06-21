import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-regression-watch-status' });

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

const WATCH_SIGNAL_TYPES = [
  'accepted-record-drift',
  'before-after-regression',
  'negative-evidence-reappeared',
  'smoke-output-regression',
  'aggregate-verification-regression',
  'source-of-truth-drift',
  'gateway-routing-regression',
  'memory-boundary-regression',
  'dogfood-lifecycle-regression',
];

const WATCH_STATES = [
  'watch-not-started',
  'watching',
  'stable',
  'regression-suspected',
  'regression-confirmed',
  'rollback-review-recommended',
  'false-positive',
  'expired',
];

const WATCH_SEVERITIES = [
  'info',
  'watch',
  'warning',
  'blocking',
  'rollback-review-needed',
];

const WATCH_EVIDENCE_TYPES = [
  'accepted-registry-record',
  'before-evidence',
  'after-evidence',
  'current-smoke-output',
  'current-aggregate-verification',
  'negative-evidence',
  'source-diff',
  'task-ledger-entry',
  'reviewer-note',
  'operator-decision',
];

const WATCH_DECISION_TYPES = [
  'keep-watching',
  'mark-stable',
  'mark-false-positive',
  'request-more-evidence',
  'recommend-rollback-review',
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
    acceptedImprovementRegistryDocumented:
      /Ninth Implemented Slice: `growth-accepted-improvement-registry-status`/.test(plan),
    regressionWatchDocumented:
      /Tenth Implemented Slice: `growth-regression-watch-status`/.test(plan),
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
    rollbackReviewStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-rollback-review-status.mjs'),
    ),
    rollbackReviewStatusDocumented:
      /Eleventh Implemented Slice: `growth-rollback-review-status`/.test(plan),
    rollbackReviewStatusImplemented: /mode: 'growth-rollback-review-status'/.test(rollbackReview),
    remediationPlanStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-plan-status.mjs'),
    ),
    remediationPlanStatusDocumented:
      /Twelfth Implemented Slice: `growth-remediation-plan-status`/.test(plan),
    remediationPlanStatusImplemented: /mode: 'growth-remediation-plan-status'/.test(remediationPlan),
    remediationApprovalStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-approval-status.mjs'),
    ),
    remediationApprovalStatusDocumented:
      /Thirteenth Implemented Slice: `growth-remediation-approval-status`/.test(plan),
    remediationApprovalStatusImplemented: /mode: 'growth-remediation-approval-status'/.test(
      remediationApproval,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /human gate/.test(pack),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsRegressionWatch: /growth-regression-watch-status/.test(harnessBaseline),
    completionReadinessMentionsRegressionWatch:
      /growth-regression-watch-status/.test(completionReadiness),
    ledgerMentionsRegressionWatch:
      /growth-regression-watch-status-readonly-post-m7-817/.test(todo),
    verificationIncludesRegressionWatch: /growth-regression-watch-status/.test(verificationStatus),
    rollbackReviewNextDocumented: /growth-rollback-review-status/.test(plan),
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
    beforeAfterEvidenceDocumented: /before\/after proof/.test(plan) || /before\/after evidence/.test(plan),
    negativeEvidenceDocumented: /negative evidence/.test(plan),
    aggregateVerificationDocumented: /aggregate verification/.test(plan),
    rollbackReviewDocumented: /rollback review/.test(plan),
    remediationBlocked:
      /without executing remediation/.test(plan) ||
      /does not run\s+remediation/.test(plan) ||
      /executing rollback/.test(plan),
    approvalAndReviewPreserved:
      /operator approval/.test(plan) &&
      /review before done/.test(agents) &&
      /approval before commit/.test(agents),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const watchSchema = {
  acceptedRecordWatch: fields(
    [
      'watchId',
      'registryId',
      'state',
      'severity',
      'signalTypes',
      'acceptedRecordRef',
      'beforeEvidenceRefs',
      'afterEvidenceRefs',
      'currentEvidenceRefs',
      'negativeEvidenceRefs',
      'verificationRefs',
      'lastObservedAt',
      'rollbackReviewAllowed',
    ],
    ['expiresAt', 'ownerSurface'],
  ),
  observedRegression: fields(
    [
      'regressionId',
      'watchId',
      'signalType',
      'severity',
      'observedAt',
      'expectedSignal',
      'observedSignal',
      'sourceRefs',
      'blocking',
      'allowedNextAction',
    ],
    ['comparisonRef', 'reviewerNoteRef'],
  ),
  watchDecision: fields(
    [
      'decisionId',
      'decisionType',
      'watchId',
      'reason',
      'evidenceRefs',
      'authority',
      'allowedNextAction',
    ],
    ['approvalRef', 'reviewRef'],
  ),
  watchIndex: fields(
    ['indexId', 'watchRefs', 'stateCounts', 'severityCounts', 'sourceRefs', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const watchRules = [
  {
    id: 'watch-requires-accepted-record',
    rule: 'regression watch starts from an accepted registry record and cannot create or mutate that record',
  },
  {
    id: 'before-after-current-comparison-required',
    rule: 'watch signals compare accepted before/after proof against current smoke, aggregate, source, or negative evidence',
  },
  {
    id: 'blocking-signal-recommends-review-only',
    rule: 'blocking regression signals may recommend rollback review, but this command cannot run remediation or rollback',
  },
  {
    id: 'false-positive-path-visible',
    rule: 'false positives and request-more-evidence decisions remain visible instead of being dropped',
  },
  {
    id: 'watch-does-not-authorize-action',
    rule: 'watch status cannot apply proposals, persist memory, execute workers, run dogfood, commit, push, or open external channels',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(watchSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.acceptedImprovementRegistryDocumented &&
  sourceSummary.regressionWatchDocumented &&
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
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsRegressionWatch &&
  sourceSummary.completionReadinessMentionsRegressionWatch &&
  sourceSummary.ledgerMentionsRegressionWatch &&
  sourceSummary.verificationIncludesRegressionWatch &&
  sourceSummary.rollbackReviewNextDocumented &&
  sourceSummary.rollbackReviewStatusScriptPresent &&
  sourceSummary.rollbackReviewStatusDocumented &&
  sourceSummary.rollbackReviewStatusImplemented &&
  sourceSummary.remediationPlanStatusScriptPresent &&
  sourceSummary.remediationPlanStatusDocumented &&
  sourceSummary.remediationPlanStatusImplemented &&
  sourceSummary.remediationPlanNextDocumented &&
  sourceSummary.remediationApprovalNextDocumented &&
  sourceSummary.beforeAfterEvidenceDocumented &&
  sourceSummary.negativeEvidenceDocumented &&
  sourceSummary.aggregateVerificationDocumented &&
  sourceSummary.rollbackReviewDocumented &&
  sourceSummary.remediationBlocked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-regression-watch-status',
  posture: 'local-read-only-post-acceptance-regression-watch-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-regression-watch-status/v0',
  sourceSummary,
  vocabulary: {
    watchSignalTypes: WATCH_SIGNAL_TYPES,
    watchStates: WATCH_STATES,
    watchSeverities: WATCH_SEVERITIES,
    watchEvidenceTypes: WATCH_EVIDENCE_TYPES,
    watchDecisionTypes: WATCH_DECISION_TYPES,
  },
  watchSchema,
  watchRules,
  watchState: {
    realWatchFileAdopted: false,
    discoveredWatchRecords: 0,
    watchMutationAllowed: false,
    acceptedRecordMutationAllowed: false,
    rollbackReviewTriggered: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-regression-watch-records',
  },
  readiness: {
    requiredFieldsSatisfied,
    watchRecordTypes: Object.keys(watchSchema).length,
    acceptedRecordRequired: true,
    beforeAfterCurrentComparisonRequired: true,
    blockingSignalReviewOnly: true,
    rollbackReviewApplicationAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForRollbackReviewStatus: true,
    rollbackReviewStatusImplemented:
      sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented,
    readyForRemediationPlanStatus:
      sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented,
    remediationPlanStatusImplemented:
      sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented,
    readyForRemediationApprovalStatus:
      sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented,
    remediationApprovalStatusImplemented:
      sourceSummary.remediationApprovalStatusScriptPresent &&
      sourceSummary.remediationApprovalStatusDocumented,
    readyForImplementationProposalStatus:
      sourceSummary.remediationApprovalStatusScriptPresent &&
      sourceSummary.remediationApprovalStatusDocumented,
    implementationProposalStatusImplemented:
      sourceSummary.implementationProposalStatusScriptPresent &&
      sourceSummary.implementationProposalStatusDocumented,
    readyForImplementationReviewStatus:
      sourceSummary.implementationProposalStatusScriptPresent &&
      sourceSummary.implementationProposalStatusDocumented,
  },
  nextRecommendedSlice: {
    id:
      sourceSummary.implementationProposalStatusScriptPresent &&
      sourceSummary.implementationProposalStatusDocumented
        ? 'growth-remediation-source-mutation-request-status'
        : sourceSummary.remediationApprovalStatusScriptPresent &&
          sourceSummary.remediationApprovalStatusDocumented
        ? 'growth-remediation-implementation-proposal-status'
        : sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented
          ? 'growth-remediation-approval-status'
        : sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented
          ? 'growth-remediation-plan-status'
          : 'growth-rollback-review-status',
    commandToAdd:
      sourceSummary.implementationProposalStatusScriptPresent &&
      sourceSummary.implementationProposalStatusDocumented
        ? 'node scripts/growth-remediation-source-mutation-request-status.mjs'
        : sourceSummary.remediationApprovalStatusScriptPresent &&
          sourceSummary.remediationApprovalStatusDocumented
        ? 'node scripts/growth-remediation-implementation-proposal-status.mjs'
        : sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented
          ? 'node scripts/growth-remediation-approval-status.mjs'
        : sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented
          ? 'node scripts/growth-remediation-plan-status.mjs'
          : 'node scripts/growth-rollback-review-status.mjs',
    reason:
      sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented
        ? 'The remediation plan contract is now modeled as read-only; the next safe slice should define approval gates before implementation proposals or remediation execution can act.'
        : sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented
          ? 'The rollback review contract is now modeled as read-only; the next safe slice should define remediation plan fields without executing remediation or mutating accepted records.'
          : 'The regression watch contract is now modeled as read-only; the next safe slice should define rollback review states without executing rollback or remediation.',
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
    doesNotTriggerRollbackReview: true,
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
