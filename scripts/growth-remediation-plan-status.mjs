import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-remediation-plan-status' });

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

const REMEDIATION_PLAN_TRIGGER_TYPES = [
  'rollback-review-recommended',
  'blocking-regression-watch',
  'source-of-truth-drift',
  'failed-aggregate-verification',
  'negative-evidence-confirmed',
  'memory-boundary-regression',
  'gateway-routing-regression',
  'operator-request',
];

const REMEDIATION_PLAN_STATES = [
  'plan-not-started',
  'draft-ready',
  'needs-evidence',
  'under-review',
  'approval-needed',
  'approved-for-thin-slice',
  'rejected',
  'deferred',
  'closed-no-action',
];

const REMEDIATION_SCOPE_TYPES = [
  'docs-only',
  'smoke-only',
  'ui-copy-only',
  'runtime-guard-only',
  'source-of-truth-alignment',
  'test-coverage',
  'rollback-proof',
];

const REMEDIATION_PLAN_EVIDENCE_TYPES = [
  'rollback-review-record',
  'rollback-decision',
  'rollback-risk-assessment',
  'accepted-registry-record',
  'regression-watch-record',
  'negative-evidence',
  'aggregate-verification',
  'verification-plan',
  'rollback-proof',
  'operator-approval',
  'source-of-truth-doc',
];

const REMEDIATION_PLAN_DECISION_TYPES = [
  'draft-thin-slice',
  'request-more-evidence',
  'reject-remediation',
  'defer-remediation',
  'approve-plan-for-implementation-review',
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
    remediationPlanImplemented: /mode: 'growth-remediation-plan-status'/.test(remediationPlan),
    remediationApprovalImplemented: /mode: 'growth-remediation-approval-status'/.test(
      remediationApproval,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsApprovalBeforeCommit: /approval before commit/.test(masterBrief),
    roadmapMentionsReviewBeforeDone: /review before done/.test(roadmap),
    packMentionsHumanGate: /human gate/.test(pack),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsRemediationPlan: /growth-remediation-plan-status/.test(harnessBaseline),
    completionReadinessMentionsRemediationPlan:
      /growth-remediation-plan-status/.test(completionReadiness),
    ledgerMentionsRemediationPlan:
      /growth-remediation-plan-status-readonly-post-m7-819/.test(todo),
    verificationIncludesRemediationPlan: /growth-remediation-plan-status/.test(verificationStatus),
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
    rollbackReviewDecisionDocumented: /rollback review decisions/.test(plan),
    remediationPlanFieldsDocumented: /remediation plan fields/.test(plan),
    verificationPlanDocumented: /verification plan/.test(plan),
    rollbackProofDocumented: /rollback-proof/.test(plan) || /rollback proof/.test(plan),
    sourceOfTruthDocumented: /source-of-truth/.test(plan),
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

const remediationPlanSchema = {
  remediationPlanRecord: fields(
    [
      'planId',
      'reviewId',
      'decisionId',
      'state',
      'triggerTypes',
      'scopeTypes',
      'remediationObjective',
      'affectedFilesOrSurfaces',
      'rollbackReviewRef',
      'acceptedRecordRef',
      'regressionWatchRef',
      'negativeEvidenceRefs',
      'verificationPlanRefs',
      'rollbackProofRefs',
      'sourceOfTruthRefs',
      'approvalRefs',
      'implementationProposalAllowed',
    ],
    ['expiresAt', 'ownerSurface', 'deferredReason'],
  ),
  remediationPlanStep: fields(
    [
      'stepId',
      'planId',
      'order',
      'ownerSurface',
      'intendedChangeType',
      'sourceRefs',
      'verificationCommandRefs',
      'rollbackProofRequired',
      'executionAllowed',
    ],
    ['riskClass', 'operatorNotes'],
  ),
  remediationApprovalGate: fields(
    [
      'gateId',
      'planId',
      'approvalState',
      'authority',
      'reason',
      'requiredEvidenceRefs',
      'allowedNextAction',
      'executionAllowed',
    ],
    ['approvalRef', 'reviewerRef'],
  ),
  remediationPlanIndex: fields(
    ['indexId', 'planRefs', 'stateCounts', 'scopeCounts', 'sourceRefs', 'lastUpdatedAt'],
    ['generatedFromCommand'],
  ),
};

const remediationPlanRules = [
  {
    id: 'plan-requires-rollback-review',
    rule: 'remediation planning starts from a rollback review recommendation and cannot bypass regression watch evidence',
  },
  {
    id: 'planning-is-not-execution',
    rule: 'remediation plans may define thin-slice steps, but they cannot execute remediation or mutate source',
  },
  {
    id: 'implementation-requires-explicit-thin-slice',
    rule: 'a later implementation slice requires explicit approval, current verification plan, and source-of-truth references',
  },
  {
    id: 'approval-remains-separate',
    rule: 'operator approval is recorded as a gate, not inferred from remediation plan state',
  },
  {
    id: 'rollback-proof-before-acceptance',
    rule: 'remediation cannot be accepted without rollback proof, verification output, reviewer notes, and updated source references',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(remediationPlanSchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.rollbackReviewDocumented &&
  sourceSummary.remediationPlanDocumented &&
  sourceSummary.remediationApprovalDocumented &&
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
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsRemediationPlan &&
  sourceSummary.completionReadinessMentionsRemediationPlan &&
  sourceSummary.ledgerMentionsRemediationPlan &&
  sourceSummary.verificationIncludesRemediationPlan &&
  sourceSummary.remediationApprovalNextDocumented &&
  sourceSummary.implementationProposalNextDocumented &&
  sourceSummary.rollbackReviewDecisionDocumented &&
  sourceSummary.remediationPlanFieldsDocumented &&
  sourceSummary.verificationPlanDocumented &&
  sourceSummary.rollbackProofDocumented &&
  sourceSummary.sourceOfTruthDocumented &&
  sourceSummary.implementationExecutionBlocked &&
  sourceSummary.sourceMutationBlocked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-remediation-plan-status',
  posture: 'local-read-only-remediation-plan-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-remediation-plan-status/v0',
  sourceSummary,
  vocabulary: {
    remediationPlanTriggerTypes: REMEDIATION_PLAN_TRIGGER_TYPES,
    remediationPlanStates: REMEDIATION_PLAN_STATES,
    remediationScopeTypes: REMEDIATION_SCOPE_TYPES,
    remediationPlanEvidenceTypes: REMEDIATION_PLAN_EVIDENCE_TYPES,
    remediationPlanDecisionTypes: REMEDIATION_PLAN_DECISION_TYPES,
  },
  remediationPlanSchema,
  remediationPlanRules,
  remediationPlanState: {
    realRemediationPlanFileAdopted: false,
    discoveredRemediationPlans: 0,
    remediationPlanMutationAllowed: false,
    implementationProposalGenerationAllowed: false,
    acceptedRecordMutationAllowed: false,
    sourceMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    currentStatus: 'contract-only-no-active-remediation-plan-records',
  },
  readiness: {
    requiredFieldsSatisfied,
    remediationPlanRecordTypes: Object.keys(remediationPlanSchema).length,
    rollbackReviewRequired: true,
    verificationPlanRequired: true,
    rollbackProofRequired: true,
    reviewAndApprovalSeparate: true,
    implementationProposalGenerationAllowed: false,
    sourceMutationAllowed: false,
    rollbackExecutionAllowed: false,
    remediationExecutionAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
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
