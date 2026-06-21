import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-continuous-development-loop-status' });

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
  'scripts/growth-improvement-acceptance-status.mjs',
  'scripts/growth-accepted-improvement-registry-status.mjs',
  'scripts/growth-regression-watch-status.mjs',
  'scripts/growth-rollback-review-status.mjs',
  'scripts/growth-remediation-plan-status.mjs',
  'scripts/growth-remediation-approval-status.mjs',
  'scripts/growth-remediation-implementation-proposal-status.mjs',
  'tasks/todo.md',
  'tasks/lessons.md',
];

const LOOP_STEP_IDS = [
  'run-work-or-dogfood',
  'collect-evidence',
  'reflect-on-evidence',
  'queue-improvement-proposal',
  'require-operator-approval',
  'implement-thin-slice',
  'verify-slice',
  'record-lesson',
  'expose-result-in-gateway',
];

const STEP_STATES = [
  'modeled-read-only',
  'evidence-available',
  'review-only',
  'approval-required',
  'blocked-without-explicit-approval',
  'optional-not-required',
];

const EVIDENCE_TYPES = [
  'runtime-state',
  'status-command',
  'smoke-proof',
  'aggregate-verification',
  'task-ledger-entry',
  'lesson-entry',
  'source-doc',
  'negative-evidence',
  'operator-decision',
];

const GATE_TYPES = [
  'review-before-done',
  'approval-before-commit',
  'explicit-dogfood-execute-approval',
  'explicit-implementation-slice-approval',
  'explicit-git-push-approval',
  'source-of-truth-update-required',
];

const COMPOSITION_INPUTS = [
  'growth-engine-status',
  'growth-reflection-evaluator',
  'growth-worker-event-schema',
  'growth-proposal-queue-status',
  'growth-skill-memory-registry-status',
  'growth-gateway-surface-router-status',
  'verification-status',
  'task-ledger',
  'lessons-ledger',
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

function countMatches(text, pattern) {
  return [...String(text || '').matchAll(pattern)].length;
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
  const acceptedRegistry = sourceText(
    sources,
    'scripts/growth-accepted-improvement-registry-status.mjs',
  );
  const regressionWatch = sourceText(sources, 'scripts/growth-regression-watch-status.mjs');
  const rollbackReview = sourceText(sources, 'scripts/growth-rollback-review-status.mjs');
  const remediationPlan = sourceText(sources, 'scripts/growth-remediation-plan-status.mjs');
  const remediationApproval = sourceText(sources, 'scripts/growth-remediation-approval-status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    continuousDevelopmentLoopDocumented:
      /Seventh Implemented Slice: `growth-continuous-development-loop-status`/.test(plan),
    engineStatusImplemented: /mode: 'growth-engine-status'/.test(engineStatus),
    reflectionEvaluatorImplemented: /mode: 'growth-reflection-evaluator'/.test(reflectionEvaluator),
    workerEventSchemaImplemented: /mode: 'growth-worker-event-schema'/.test(workerEventSchema),
    proposalQueueImplemented: /mode: 'growth-proposal-queue-status'/.test(proposalQueue),
    skillMemoryRegistryImplemented: /mode: 'growth-skill-memory-registry-status'/.test(
      skillMemoryRegistry,
    ),
    gatewaySurfaceRouterImplemented: /mode: 'growth-gateway-surface-router-status'/.test(surfaceRouter),
    improvementAcceptanceStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-improvement-acceptance-status.mjs'),
    ),
    improvementAcceptanceStatusDocumented:
      /Eighth Implemented Slice: `growth-improvement-acceptance-status`/.test(plan),
    acceptedImprovementRegistryStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-accepted-improvement-registry-status.mjs'),
    ),
    acceptedImprovementRegistryStatusDocumented:
      /Ninth Implemented Slice: `growth-accepted-improvement-registry-status`/.test(plan),
    acceptedImprovementRegistryStatusImplemented:
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
    packMentionsCurrentImplementedFlow:
      /router -> planner -> architect -> task-breaker -> builder\(preflight\)/.test(pack) &&
      /close-out/.test(pack),
    agentsRequireApprovalBeforeCommit: /approval before commit/.test(agents),
    harnessMentionsContinuousLoop: /growth-continuous-development-loop-status/.test(harnessBaseline),
    completionReadinessMentionsContinuousLoop: /growth-continuous-development-loop-status/.test(
      completionReadiness,
    ),
    ledgerMentionsContinuousLoop:
      /growth-continuous-development-loop-status-readonly-post-m7-814/.test(todo),
    improvementAcceptanceNextDocumented: /growth-improvement-acceptance-status/.test(plan),
    acceptedImprovementRegistryNextDocumented: /growth-accepted-improvement-registry-status/.test(plan),
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
    loopNotUnattended: /continuous, but not unattended/.test(plan) || /continuous but not unattended/.test(plan),
    explicitApprovalPreserved:
      /explicit approval/.test(plan) && /approval before commit/.test(agents) && /human gate/.test(pack),
    lessonsAvailable: countMatches(lessons, /^- /gm) > 0,
  };
}

const loopSchema = {
  loopStep: fields(
    [
      'stepId',
      'sequence',
      'state',
      'summary',
      'inputRefs',
      'outputRefs',
      'gateRefs',
      'surfaceHint',
      'actionAllowed',
    ],
    ['commandRefs', 'blockedActions', 'notes'],
  ),
  gateLink: fields(
    ['gateId', 'gateType', 'requiredBefore', 'authority', 'blockedActions'],
    ['sourceRef', 'approvalPhrase'],
  ),
  evidenceFlow: fields(
    ['flowId', 'fromStep', 'toStep', 'evidenceTypes', 'sourceRefs'],
    ['redactionState', 'verificationCommand'],
  ),
  stopCondition: fields(
    ['conditionId', 'reason', 'stopBefore', 'allowedAlternative'],
    ['requiredApproval', 'sourceRef'],
  ),
};

function buildLoopSteps() {
  return [
    {
      stepId: 'run-work-or-dogfood',
      sequence: 1,
      state: 'optional-not-required',
      summary: 'Work or dogfood may create evidence, but this loop status does not execute either path.',
      inputRefs: ['packs/development/pack.md', 'docs/18_growth-gateway-vnext.md'],
      outputRefs: ['runtime-state', 'dogfood-evidence-if-explicitly-approved'],
      gateRefs: ['explicit-dogfood-execute-approval', 'project-path-required'],
      surfaceHint: 'Execution',
      actionAllowed: false,
      commandRefs: [],
      blockedActions: ['execute-dogfood', 'start-worker'],
    },
    {
      stepId: 'collect-evidence',
      sequence: 2,
      state: 'modeled-read-only',
      summary: 'Collect existing local runtime, source, task-ledger, smoke, and negative-evidence signals.',
      inputRefs: ['scripts/growth-engine-status.mjs', 'tasks/todo.md'],
      outputRefs: ['growth-evidence-summary'],
      gateRefs: ['source-of-truth-update-required'],
      surfaceHint: 'Logs',
      actionAllowed: false,
      commandRefs: ['node scripts/growth-engine-status.mjs'],
      blockedActions: ['ingest-secrets', 'persist-memory'],
    },
    {
      stepId: 'reflect-on-evidence',
      sequence: 3,
      state: 'review-only',
      summary: 'Score evidence quality and gate preservation without mutating source.',
      inputRefs: ['scripts/growth-reflection-evaluator.mjs'],
      outputRefs: ['reflection-findings'],
      gateRefs: ['review-before-done'],
      surfaceHint: 'Council',
      actionAllowed: false,
      commandRefs: ['node scripts/growth-reflection-evaluator.mjs'],
      blockedActions: ['self-apply-finding'],
    },
    {
      stepId: 'queue-improvement-proposal',
      sequence: 4,
      state: 'review-only',
      summary: 'Represent candidate improvements as reviewable proposal records only.',
      inputRefs: ['scripts/growth-proposal-queue-status.mjs', 'scripts/growth-worker-event-schema.mjs'],
      outputRefs: ['proposal-readiness-contract'],
      gateRefs: ['explicit-implementation-slice-approval'],
      surfaceHint: 'Council',
      actionAllowed: false,
      commandRefs: ['node scripts/growth-proposal-queue-status.mjs'],
      blockedActions: ['generate-proposal', 'apply-proposal'],
    },
    {
      stepId: 'require-operator-approval',
      sequence: 5,
      state: 'approval-required',
      summary: 'Hold any implementation, dogfood, commit, or push action until the operator explicitly approves it.',
      inputRefs: ['AGENTS.md', 'docs/01_decision-log.md'],
      outputRefs: ['operator-decision-context'],
      gateRefs: ['approval-before-commit', 'explicit-git-push-approval'],
      surfaceHint: 'Decision Inbox',
      actionAllowed: false,
      commandRefs: [],
      blockedActions: ['auto-approve', 'self-commit', 'self-push'],
    },
    {
      stepId: 'implement-thin-slice',
      sequence: 6,
      state: 'blocked-without-explicit-approval',
      summary: 'Implement only one approved thin slice after review and approval context exists.',
      inputRefs: ['packs/development/pack.md', 'tasks/todo.md'],
      outputRefs: ['changed-files-after-approval'],
      gateRefs: ['explicit-implementation-slice-approval', 'review-before-done'],
      surfaceHint: 'Execution',
      actionAllowed: false,
      commandRefs: [],
      blockedActions: ['mutate-source-from-status-command'],
    },
    {
      stepId: 'verify-slice',
      sequence: 7,
      state: 'modeled-read-only',
      summary: 'Run focused smoke and aggregate verification before accepting the slice.',
      inputRefs: ['scripts/verification_status.mjs'],
      outputRefs: ['focused-smoke-proof', 'aggregate-verification-proof'],
      gateRefs: ['source-of-truth-update-required'],
      surfaceHint: 'Deliverables',
      actionAllowed: false,
      commandRefs: ['node scripts/verification_status.mjs'],
      blockedActions: ['claim-completion-without-verification'],
    },
    {
      stepId: 'record-lesson',
      sequence: 8,
      state: 'review-only',
      summary: 'Record reusable lessons only after verification proves the pattern, without globalizing memory.',
      inputRefs: ['tasks/lessons.md', 'scripts/growth-skill-memory-registry-status.mjs'],
      outputRefs: ['lesson-or-registry-candidate'],
      gateRefs: ['source-of-truth-update-required'],
      surfaceHint: 'Artifacts',
      actionAllowed: false,
      commandRefs: ['node scripts/growth-skill-memory-registry-status.mjs'],
      blockedActions: ['persist-memory', 'promote-skill'],
    },
    {
      stepId: 'expose-result-in-gateway',
      sequence: 9,
      state: 'modeled-read-only',
      summary: 'Expose completion proof and next navigation across owned gateway surfaces only.',
      inputRefs: ['scripts/growth-gateway-surface-router-status.mjs'],
      outputRefs: ['gateway-surface-route-summary'],
      gateRefs: ['explicit-git-push-approval'],
      surfaceHint: 'Mission / Deliverables / Advanced Ops',
      actionAllowed: false,
      commandRefs: ['node scripts/growth-gateway-surface-router-status.mjs'],
      blockedActions: ['open-external-channel', 'authorize-gateway-execution'],
    },
  ];
}

function buildGateLinks() {
  return [
    {
      gateId: 'project-path-required',
      gateType: 'source-of-truth-update-required',
      requiredBefore: 'run-work-or-dogfood',
      authority: 'repo-runtime-contract',
      blockedActions: ['execute-without-project-path'],
      sourceRef: 'docs/00_master-brief.md',
    },
    {
      gateId: 'review-before-done',
      gateType: 'review-before-done',
      requiredBefore: 'verify-slice',
      authority: 'reviewer',
      blockedActions: ['mark-done-without-review'],
      sourceRef: 'AGENTS.md',
    },
    {
      gateId: 'approval-before-commit',
      gateType: 'approval-before-commit',
      requiredBefore: 'commit',
      authority: 'operator',
      blockedActions: ['self-commit'],
      sourceRef: 'AGENTS.md',
    },
    {
      gateId: 'explicit-dogfood-execute-approval',
      gateType: 'explicit-dogfood-execute-approval',
      requiredBefore: 'dogfood-execute',
      authority: 'operator',
      blockedActions: ['run-another-dogfood-without-approval'],
      approvalPhrase: 'run-another-dogfood-execute',
    },
    {
      gateId: 'explicit-implementation-slice-approval',
      gateType: 'explicit-implementation-slice-approval',
      requiredBefore: 'implement-thin-slice',
      authority: 'operator',
      blockedActions: ['apply-proposal', 'mutate-source'],
      sourceRef: 'docs/18_growth-gateway-vnext.md',
    },
    {
      gateId: 'explicit-git-push-approval',
      gateType: 'explicit-git-push-approval',
      requiredBefore: 'push',
      authority: 'operator',
      blockedActions: ['self-push'],
      approvalPhrase: 'git push origin main',
    },
  ];
}

function buildEvidenceFlows() {
  return [
    {
      flowId: 'evidence-to-reflection',
      fromStep: 'collect-evidence',
      toStep: 'reflect-on-evidence',
      evidenceTypes: ['runtime-state', 'status-command', 'negative-evidence'],
      sourceRefs: ['scripts/growth-engine-status.mjs', 'scripts/growth-reflection-evaluator.mjs'],
      redactionState: 'source-only',
      verificationCommand: 'node scripts/smoke-growth-reflection-evaluator.mjs',
    },
    {
      flowId: 'reflection-to-proposal-review',
      fromStep: 'reflect-on-evidence',
      toStep: 'queue-improvement-proposal',
      evidenceTypes: ['status-command', 'source-doc'],
      sourceRefs: ['scripts/growth-proposal-queue-status.mjs'],
      redactionState: 'source-only',
      verificationCommand: 'node scripts/smoke-growth-proposal-queue-status.mjs',
    },
    {
      flowId: 'proposal-to-approval-context',
      fromStep: 'queue-improvement-proposal',
      toStep: 'require-operator-approval',
      evidenceTypes: ['operator-decision', 'task-ledger-entry'],
      sourceRefs: ['AGENTS.md', 'tasks/todo.md'],
      redactionState: 'not-required',
    },
    {
      flowId: 'approved-slice-to-verification',
      fromStep: 'implement-thin-slice',
      toStep: 'verify-slice',
      evidenceTypes: ['smoke-proof', 'aggregate-verification'],
      sourceRefs: ['scripts/verification_status.mjs'],
      redactionState: 'not-required',
      verificationCommand: 'node scripts/verification_status.mjs',
    },
    {
      flowId: 'verified-slice-to-lesson',
      fromStep: 'verify-slice',
      toStep: 'record-lesson',
      evidenceTypes: ['lesson-entry', 'task-ledger-entry'],
      sourceRefs: ['tasks/lessons.md', 'scripts/growth-skill-memory-registry-status.mjs'],
      redactionState: 'requires-review-before-persistence',
    },
    {
      flowId: 'verified-result-to-gateway',
      fromStep: 'record-lesson',
      toStep: 'expose-result-in-gateway',
      evidenceTypes: ['status-command', 'source-doc', 'smoke-proof'],
      sourceRefs: ['scripts/growth-gateway-surface-router-status.mjs', 'docs/18_growth-gateway-vnext.md'],
      redactionState: 'source-only',
      verificationCommand: 'node scripts/smoke-growth-gateway-surface-router-status.mjs',
    },
  ];
}

function buildStopConditions() {
  return [
    {
      conditionId: 'no-hidden-automation',
      reason: 'continuous loop status cannot execute workers, dogfood, proposal application, commits, pushes, or external channels',
      stopBefore: 'any-mutation',
      allowedAlternative: 'emit read-only status and wait for explicit operator approval',
      requiredApproval: 'explicit action-specific approval',
      sourceRef: 'docs/18_growth-gateway-vnext.md',
    },
    {
      conditionId: 'no-proposal-self-application',
      reason: 'proposal queue is review-only and cannot apply itself',
      stopBefore: 'implement-thin-slice',
      allowedAlternative: 'route to Decision Inbox approval context',
      requiredApproval: 'explicit implementation-slice approval',
      sourceRef: 'scripts/growth-proposal-queue-status.mjs',
    },
    {
      conditionId: 'no-memory-persistence',
      reason: 'skill/memory registry is status-only and cannot persist memory or promote skills',
      stopBefore: 'record-lesson',
      allowedAlternative: 'record source-referenced lessons only',
      requiredApproval: 'separate memory persistence decision',
      sourceRef: 'scripts/growth-skill-memory-registry-status.mjs',
    },
    {
      conditionId: 'no-gateway-authorized-execution',
      reason: 'gateway surface routing is navigation-only and cannot authorize execution',
      stopBefore: 'expose-result-in-gateway',
      allowedAlternative: 'show evidence links and blocked actions',
      requiredApproval: 'separate gateway execution decision',
      sourceRef: 'scripts/growth-gateway-surface-router-status.mjs',
    },
  ];
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const loopSteps = buildLoopSteps();
const gateLinks = buildGateLinks();
const evidenceFlows = buildEvidenceFlows();
const stopConditions = buildStopConditions();
const requiredFieldsSatisfied = Object.values(loopSchema).every((schema) => schema.required.length > 0);
const loopStepsComplete = LOOP_STEP_IDS.every((stepId) => loopSteps.some((step) => step.stepId === stepId));
const allStepsReadOnly = loopSteps.every((step) => step.actionAllowed === false);
const gateCoverageComplete = GATE_TYPES.every((gateType) =>
  gateLinks.some((gateLink) => gateLink.gateType === gateType),
);
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.continuousDevelopmentLoopDocumented &&
  sourceSummary.engineStatusImplemented &&
  sourceSummary.reflectionEvaluatorImplemented &&
  sourceSummary.workerEventSchemaImplemented &&
  sourceSummary.proposalQueueImplemented &&
  sourceSummary.skillMemoryRegistryImplemented &&
  sourceSummary.gatewaySurfaceRouterImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsApprovalBeforeCommit &&
  sourceSummary.roadmapMentionsReviewBeforeDone &&
  sourceSummary.packMentionsCurrentImplementedFlow &&
  sourceSummary.agentsRequireApprovalBeforeCommit &&
  sourceSummary.harnessMentionsContinuousLoop &&
  sourceSummary.completionReadinessMentionsContinuousLoop &&
  sourceSummary.ledgerMentionsContinuousLoop &&
  sourceSummary.improvementAcceptanceNextDocumented &&
  sourceSummary.improvementAcceptanceStatusDocumented &&
  sourceSummary.acceptedImprovementRegistryNextDocumented &&
  sourceSummary.loopNotUnattended &&
  sourceSummary.explicitApprovalPreserved &&
  requiredFieldsSatisfied &&
  loopStepsComplete &&
  allStepsReadOnly &&
  gateCoverageComplete;

const payload = {
  ok,
  mode: 'growth-continuous-development-loop-status',
  posture: 'local-read-only-continuous-development-loop-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-continuous-development-loop-status/v0',
  sourceSummary,
  vocabulary: {
    loopStepIds: LOOP_STEP_IDS,
    stepStates: STEP_STATES,
    evidenceTypes: EVIDENCE_TYPES,
    gateTypes: GATE_TYPES,
    compositionInputs: COMPOSITION_INPUTS,
  },
  loopSchema,
  loopSteps,
  gateLinks,
  evidenceFlows,
  stopConditions,
  gatePolicy: {
    operatorApprovalRequired: true,
    implementationFromLoopAllowed: false,
    dogfoodFromLoopAllowed: false,
    commitFromLoopAllowed: false,
    pushFromLoopAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
  },
  readiness: {
    loopStepsDefined: loopSteps.length,
    evidenceFlowsDefined: evidenceFlows.length,
    gateLinksDefined: gateLinks.length,
    stopConditionsDefined: stopConditions.length,
    requiredFieldsSatisfied,
    loopStepsComplete,
    gateCoverageComplete,
    allStepsReadOnly,
    optionalDogfoodNotRequired: true,
    noUnattendedAutomation: true,
    readyForImprovementAcceptanceContract: true,
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
        : sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
          sourceSummary.acceptedImprovementRegistryStatusDocumented
        ? 'growth-regression-watch-status'
        : sourceSummary.improvementAcceptanceStatusScriptPresent &&
          sourceSummary.improvementAcceptanceStatusDocumented
        ? 'growth-accepted-improvement-registry-status'
        : 'growth-improvement-acceptance-status',
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
        : sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
          sourceSummary.acceptedImprovementRegistryStatusDocumented
        ? 'node scripts/growth-regression-watch-status.mjs'
        : sourceSummary.improvementAcceptanceStatusScriptPresent &&
          sourceSummary.improvementAcceptanceStatusDocumented
        ? 'node scripts/growth-accepted-improvement-registry-status.mjs'
        : 'node scripts/growth-improvement-acceptance-status.mjs',
    reason:
      sourceSummary.remediationPlanStatusScriptPresent && sourceSummary.remediationPlanStatusDocumented
        ? 'The remediation plan contract is now modeled as read-only; the next safe slice should define approval gates before implementation proposals or remediation execution can act.'
        : sourceSummary.rollbackReviewStatusScriptPresent && sourceSummary.rollbackReviewStatusDocumented
          ? 'The rollback review contract is now modeled as read-only; the next safe slice should define remediation plan fields without executing remediation or mutating accepted records.'
          : sourceSummary.regressionWatchStatusScriptPresent && sourceSummary.regressionWatchStatusDocumented
        ? 'The regression watch contract is now modeled as read-only; the next safe slice should define rollback review states without executing rollback or remediation.'
        : sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
          sourceSummary.acceptedImprovementRegistryStatusDocumented
        ? 'The accepted improvement registry is now modeled as read-only; the next safe slice should define post-acceptance regression watch signals without remediation.'
        : sourceSummary.improvementAcceptanceStatusScriptPresent &&
          sourceSummary.improvementAcceptanceStatusDocumented
        ? 'The improvement acceptance contract is now modeled as read-only; the next safe slice should define accepted improvement registry records without applying improvements.'
        : 'The continuous development loop is now modeled as read-only; the next safe slice should define acceptance and regression criteria before any improvement is considered adopted.',
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
