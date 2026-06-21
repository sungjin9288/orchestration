import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-accepted-improvement-registry-status' });

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

const REGISTRY_RECORD_STATES = [
  'accepted',
  'rejected',
  'deferred',
  'blocked',
  'rolled-back',
  'superseded',
];

const REGISTRY_EVIDENCE_TYPES = [
  'acceptance-record',
  'before-evidence',
  'after-evidence',
  'regression-check',
  'aggregate-verification',
  'review-record',
  'approval-record',
  'task-ledger-entry',
  'source-of-truth-doc',
  'rollback-proof',
  'rejection-proof',
];

const REGISTRY_SCOPES = [
  'documentation',
  'smoke-guard',
  'ui-copy',
  'runtime-contract',
  'skill-memory',
  'gateway-routing',
  'dogfood-lifecycle',
];

const REGISTRY_DECISION_TYPES = [
  'record-accepted',
  'record-rejected',
  'record-deferred',
  'record-blocked',
  'record-rollback',
  'record-superseded',
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
    improvementAcceptanceDocumented:
      /Eighth Implemented Slice: `growth-improvement-acceptance-status`/.test(plan),
    acceptedImprovementRegistryDocumented:
      /Ninth Implemented Slice: `growth-accepted-improvement-registry-status`/.test(plan),
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
    regressionWatchStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-regression-watch-status.mjs'),
    ),
    regressionWatchStatusDocumented:
      /Tenth Implemented Slice: `growth-regression-watch-status`/.test(plan),
    regressionWatchStatusImplemented: /mode: 'growth-regression-watch-status'/.test(regressionWatch),
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
    harnessMentionsAcceptedRegistry: /growth-accepted-improvement-registry-status/.test(
      harnessBaseline,
    ),
    completionReadinessMentionsAcceptedRegistry:
      /growth-accepted-improvement-registry-status/.test(completionReadiness),
    ledgerMentionsAcceptedRegistry:
      /growth-accepted-improvement-registry-status-readonly-post-m7-816/.test(todo),
    verificationIncludesAcceptedRegistry:
      /growth-accepted-improvement-registry-status/.test(verificationStatus),
    regressionWatchNextDocumented: /growth-regression-watch-status/.test(plan),
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
    beforeAfterEvidenceDocumented: /before\/after evidence/.test(plan),
    rollbackOrRejectionDocumented:
      /rolled-back/.test(plan) &&
      /rejected, deferred, blocked/.test(plan) &&
      /rollback/.test(plan),
    sourceOfTruthLinked: /source-of-truth-linked/.test(plan) || /source-of-truth/.test(plan),
    approvalAndReviewPreserved:
      /explicit approval/.test(plan) &&
      /review before done/.test(agents) &&
      /approval before commit/.test(agents),
    lessonsAvailable: /^- /m.test(lessons),
  };
}

const registrySchema = {
  acceptedImprovementRecord: fields(
    [
      'registryId',
      'title',
      'state',
      'scope',
      'acceptedAt',
      'acceptanceRef',
      'proposalRef',
      'beforeEvidenceRefs',
      'afterEvidenceRefs',
      'regressionCheckRefs',
      'verificationRefs',
      'reviewRef',
      'approvalRef',
      'sourceOfTruthRefs',
      'rollbackOrRejectionRefs',
      'recordAllowed',
    ],
    ['supersedesRegistryId', 'notes'],
  ),
  registryIndex: fields(
    ['indexId', 'recordRefs', 'scopeCounts', 'stateCounts', 'lastUpdatedAt', 'sourceRefs'],
    ['generatedFromCommand', 'operatorNotes'],
  ),
  rollbackRecord: fields(
    [
      'rollbackId',
      'registryId',
      'reason',
      'triggeringEvidenceRefs',
      'rollbackProofRefs',
      'decisionRef',
      'allowedNextAction',
    ],
    ['replacementRegistryId'],
  ),
  rejectionRecord: fields(
    [
      'rejectionId',
      'proposalRef',
      'reason',
      'blockingRegressionRefs',
      'negativeEvidenceRefs',
      'decisionRef',
      'allowedNextAction',
    ],
    ['reconsiderAfterRef'],
  ),
};

const registryRules = [
  {
    id: 'accepted-record-requires-proof-chain',
    rule: 'accepted records require acceptanceRef, before/after evidence, regression checks, verification, review, approval, and source-of-truth refs',
  },
  {
    id: 'negative-outcomes-remain-visible',
    rule: 'rejected, blocked, deferred, rolled-back, and superseded records must remain visible instead of disappearing from the registry',
  },
  {
    id: 'rollback-and-supersession-are-recorded',
    rule: 'rollback or supersession requires proof refs and a decision ref before any later record can replace the accepted record',
  },
  {
    id: 'registry-does-not-apply-proposals',
    rule: 'the registry status command cannot apply proposals, persist learned memory, run dogfood, execute workers, commit, push, or open external channels',
  },
  {
    id: 'source-of-truth-required',
    rule: 'each durable acceptance record must link back to source-of-truth docs, task ledger, or verification evidence before it is considered recordable',
  },
];

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(registrySchema).every(
  (schema) => schema.required.length > 0,
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.improvementAcceptanceDocumented &&
  sourceSummary.acceptedImprovementRegistryDocumented &&
  sourceSummary.engineStatusImplemented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.workerEventSchemaImplemented &&
  sourceSummary.proposalQueueImplemented &&
  sourceSummary.skillMemoryRegistryImplemented &&
  sourceSummary.gatewaySurfaceRouterImplemented &&
  sourceSummary.continuousDevelopmentLoopImplemented &&
  sourceSummary.improvementAcceptanceImplemented &&
  sourceSummary.acceptedImprovementRegistryImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsHumanGate &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsAcceptedRegistry &&
  sourceSummary.completionReadinessMentionsAcceptedRegistry &&
  sourceSummary.ledgerMentionsAcceptedRegistry &&
  sourceSummary.verificationIncludesAcceptedRegistry &&
  sourceSummary.regressionWatchNextDocumented &&
  sourceSummary.regressionWatchStatusScriptPresent &&
  sourceSummary.regressionWatchStatusDocumented &&
  sourceSummary.regressionWatchStatusImplemented &&
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
  sourceSummary.rollbackOrRejectionDocumented &&
  sourceSummary.sourceOfTruthLinked &&
  sourceSummary.approvalAndReviewPreserved &&
  requiredFieldsSatisfied;

const payload = {
  ok,
  mode: 'growth-accepted-improvement-registry-status',
  posture: 'local-read-only-accepted-improvement-registry-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-accepted-improvement-registry-status/v0',
  sourceSummary,
  vocabulary: {
    registryRecordStates: REGISTRY_RECORD_STATES,
    registryEvidenceTypes: REGISTRY_EVIDENCE_TYPES,
    registryScopes: REGISTRY_SCOPES,
    registryDecisionTypes: REGISTRY_DECISION_TYPES,
  },
  registrySchema,
  registryRules,
  registryState: {
    realRegistryFileAdopted: false,
    discoveredAcceptedRecords: 0,
    registryMutationAllowed: false,
    durableAcceptanceStorageAllowed: false,
    currentStatus: 'contract-only-no-durable-registry',
  },
  readiness: {
    requiredFieldsSatisfied,
    registryRecordTypes: Object.keys(registrySchema).length,
    acceptedRecordsRequireAcceptanceProof: true,
    rejectionAndRollbackVisible: true,
    registryApplicationAllowed: false,
    memoryPersistenceAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    readyForRegressionWatchStatus: true,
    regressionWatchStatusImplemented:
      sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented,
    readyForRollbackReviewStatus:
      sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented,
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
          : sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented
        ? 'growth-rollback-review-status'
        : 'growth-regression-watch-status',
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
          : sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented
        ? 'node scripts/growth-rollback-review-status.mjs'
        : 'node scripts/growth-regression-watch-status.mjs',
    reason:
      sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented
        ? 'The remediation plan contract is now modeled as read-only; the next safe slice should define approval gates before implementation proposals or remediation execution can act.'
        : sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented
          ? 'The rollback review contract is now modeled as read-only; the next safe slice should define remediation plan fields without executing remediation or mutating accepted records.'
          : sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented
        ? 'The regression watch contract is now modeled as read-only; the next safe slice should define rollback review states without executing rollback or remediation.'
        : 'The accepted improvement registry is now modeled as read-only; the next safe slice should define post-acceptance regression watch signals without executing remediation.',
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
    doesNotRecordDurableAcceptance: true,
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
