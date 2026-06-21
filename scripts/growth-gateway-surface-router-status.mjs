import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), { mode: 'growth-gateway-surface-router-status' });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/13_harness-baseline.md',
  'docs/17_v1-completion-readiness.md',
  'docs/18_growth-gateway-vnext.md',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-skill-memory-registry-status.mjs',
  'scripts/growth-continuous-development-loop-status.mjs',
  'scripts/growth-improvement-acceptance-status.mjs',
  'scripts/growth-accepted-improvement-registry-status.mjs',
  'scripts/growth-regression-watch-status.mjs',
  'scripts/growth-rollback-review-status.mjs',
  'scripts/growth-remediation-plan-status.mjs',
  'scripts/growth-remediation-approval-status.mjs',
  'scripts/growth-remediation-implementation-proposal-status.mjs',
  'tasks/todo.md',
];

const SURFACE_IDS = [
  'Mission',
  'Council',
  'Execution',
  'Deliverables',
  'Taskboard',
  'Logs',
  'Artifacts',
  'Decision Inbox',
];

const GROWTH_SIGNAL_TYPES = [
  'engine-status',
  'reflection-score',
  'worker-event-schema',
  'proposal-queue',
  'skill-memory-registry',
  'verification-gate',
  'operator-decision',
];

const DISPLAY_MODES = [
  'summary',
  'evidence-link',
  'review-only',
  'navigation-only',
  'blocked-action',
  'advanced-ops-detail',
];

const OPERATOR_ACTION_TYPES = [
  'navigate',
  'inspect-evidence',
  'open-review',
  'open-approval-context',
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
  const masterBrief = sourceText(sources, 'docs/00_master-brief.md');
  const ia = sourceText(sources, 'docs/02_ia-v1.md');
  const decisionLog = sourceText(sources, 'docs/01_decision-log.md');
  const harnessBaseline = sourceText(sources, 'docs/13_harness-baseline.md');
  const completionReadiness = sourceText(sources, 'docs/17_v1-completion-readiness.md');
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const proposalQueue = sourceText(sources, 'scripts/growth-proposal-queue-status.mjs');
  const skillMemoryRegistry = sourceText(sources, 'scripts/growth-skill-memory-registry-status.mjs');
  const acceptedRegistry = sourceText(
    sources,
    'scripts/growth-accepted-improvement-registry-status.mjs',
  );
  const regressionWatch = sourceText(sources, 'scripts/growth-regression-watch-status.mjs');
  const rollbackReview = sourceText(sources, 'scripts/growth-rollback-review-status.mjs');
  const remediationPlan = sourceText(sources, 'scripts/growth-remediation-plan-status.mjs');
  const remediationApproval = sourceText(sources, 'scripts/growth-remediation-approval-status.mjs');
  const todo = sourceText(sources, 'tasks/todo.md');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    growthGatewayPlanPresent: /# Growth Gateway VNext Plan/.test(plan),
    gatewaySurfaceRouterDocumented:
      /Sixth Implemented Slice: `growth-gateway-surface-router-status`/.test(plan),
    proposalQueueImplemented: /mode: 'growth-proposal-queue-status'/.test(proposalQueue),
    skillMemoryRegistryImplemented: /mode: 'growth-skill-memory-registry-status'/.test(
      skillMemoryRegistry,
    ),
    decisionAccepted: /### DEC-047/.test(decisionLog),
    masterBriefMentionsAdvancedOps: /Taskboard \/ Logs \/ Artifacts \/ Decision Inbox/.test(masterBrief),
    iaMentionsPrimarySurfaces:
      /Mission/.test(ia) && /Council/.test(ia) && /Execution/.test(ia) && /Deliverables/.test(ia),
    harnessMentionsGatewaySurfaceRouter: /growth-gateway-surface-router-status/.test(harnessBaseline),
    completionReadinessMentionsGatewaySurfaceRouter: /growth-gateway-surface-router-status/.test(
      completionReadiness,
    ),
    ledgerMentionsGatewaySurfaceRouter:
      /growth-gateway-surface-router-status-readonly-post-m7-813/.test(todo),
    nextContinuousLoopDocumented: /growth-continuous-development-loop-status/.test(plan),
    continuousDevelopmentLoopStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-continuous-development-loop-status.mjs'),
    ),
    continuousDevelopmentLoopStatusDocumented:
      /Seventh Implemented Slice: `growth-continuous-development-loop-status`/.test(plan),
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
    regressionWatchNextDocumented: /growth-regression-watch-status/.test(plan),
    regressionWatchStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-regression-watch-status.mjs'),
    ),
    regressionWatchStatusDocumented:
      /Tenth Implemented Slice: `growth-regression-watch-status`/.test(plan),
    regressionWatchStatusImplemented: /mode: 'growth-regression-watch-status'/.test(regressionWatch),
    rollbackReviewNextDocumented: /growth-rollback-review-status/.test(plan),
    rollbackReviewStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-rollback-review-status.mjs'),
    ),
    rollbackReviewStatusDocumented:
      /Eleventh Implemented Slice: `growth-rollback-review-status`/.test(plan),
    rollbackReviewStatusImplemented: /mode: 'growth-rollback-review-status'/.test(rollbackReview),
    remediationPlanNextDocumented: /growth-remediation-plan-status/.test(plan),
    remediationPlanStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-plan-status.mjs'),
    ),
    remediationPlanStatusDocumented:
      /Twelfth Implemented Slice: `growth-remediation-plan-status`/.test(plan),
    remediationPlanStatusImplemented: /mode: 'growth-remediation-plan-status'/.test(remediationPlan),
    remediationApprovalNextDocumented: /growth-remediation-approval-status/.test(plan),
    remediationApprovalStatusScriptPresent: fs.existsSync(
      path.join(repoRoot, 'scripts', 'growth-remediation-approval-status.mjs'),
    ),
    remediationApprovalStatusDocumented:
      /Thirteenth Implemented Slice: `growth-remediation-approval-status`/.test(plan),
    remediationApprovalStatusImplemented: /mode: 'growth-remediation-approval-status'/.test(
      remediationApproval,
    ),
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
    externalChannelsBlocked: /External messenger reach/.test(plan) && /remain blocked/.test(plan),
    gatewayAuthorityBlocked:
      /must not authorize workers/.test(plan) &&
      /must not authorize workers, proposals, memory persistence, dogfood, commits, or pushes/.test(plan),
    allSurfaceIdsDocumented: SURFACE_IDS.every((surfaceId) => plan.includes(surfaceId)),
  };
}

const routeSchema = {
  surfaceRoute: fields(
    [
      'routeId',
      'surfaceId',
      'signalType',
      'displayMode',
      'sourceRefs',
      'safeCopy',
      'blockedActions',
      'actionAllowed',
    ],
    ['navigationHintIds', 'evidenceLinkIds'],
  ),
  navigationHint: fields(
    ['hintId', 'fromSurface', 'toSurface', 'reason', 'actionType', 'executionAllowed'],
    ['requiresApprovalContext'],
  ),
  evidenceLink: fields(
    ['linkId', 'source', 'targetSurface', 'evidenceType', 'redactionState'],
    ['command', 'artifactRef'],
  ),
  blockedAction: fields(
    ['actionId', 'label', 'blockedReason', 'requiredApproval', 'allowedAlternative'],
    ['sourceRef'],
  ),
};

function buildRoutingRules() {
  return [
    {
      id: 'display-growth-state-only',
      rule: 'growth state may be displayed in owned surfaces, but this router cannot execute workers, apply proposals, persist memory, run dogfood, commit, or push',
    },
    {
      id: 'mission-summary-only',
      rule: 'Mission receives only a plain-language next-improvement summary and navigation hints',
    },
    {
      id: 'council-review-only',
      rule: 'Council receives reflection, proposal, and skill-memory review context without approval side effects',
    },
    {
      id: 'execution-blocked-by-default',
      rule: 'Execution may show a blocked action and verification context, but execution authority remains false',
    },
    {
      id: 'deliverables-evidence-only',
      rule: 'Deliverables receives evidence links for docs, status outputs, and smoke proofs after verification',
    },
    {
      id: 'advanced-ops-raw-detail',
      rule: 'Taskboard, Logs, Artifacts, and Decision Inbox keep raw detail and approval context for advanced ops inspection',
    },
    {
      id: 'external-channels-disabled',
      rule: 'messenger, mobile relay, cloud daemon, and always-on external channel routes are disabled until a later explicit decision',
    },
    {
      id: 'action-allowed-false-for-mutation',
      rule: 'actionAllowed is false for execute, mutate, persist, apply, push, or background delivery actions',
    },
  ];
}

function buildSurfaceRoutes() {
  return [
    {
      routeId: 'mission-growth-summary',
      surfaceId: 'Mission',
      signalType: 'engine-status',
      displayMode: 'summary',
      sourceRefs: ['scripts/growth-engine-status.mjs', 'docs/18_growth-gateway-vnext.md'],
      safeCopy: 'Show what the system should improve next and where to inspect the evidence.',
      blockedActions: ['execute-worker', 'apply-proposal', 'persist-memory'],
      actionAllowed: false,
      navigationHintIds: ['mission-to-council-growth-review'],
      evidenceLinkIds: ['growth-plan-doc'],
    },
    {
      routeId: 'council-growth-review',
      surfaceId: 'Council',
      signalType: 'reflection-score',
      displayMode: 'review-only',
      sourceRefs: ['scripts/growth-reflection-evaluator.mjs', 'scripts/growth-proposal-queue-status.mjs'],
      safeCopy: 'Review why a growth improvement is worth considering before any implementation slice opens.',
      blockedActions: ['approve-implicitly', 'mutate-source'],
      actionAllowed: false,
      navigationHintIds: ['council-to-decision-inbox-approval-context'],
      evidenceLinkIds: ['reflection-evaluator-output', 'proposal-queue-contract'],
    },
    {
      routeId: 'execution-growth-blocker',
      surfaceId: 'Execution',
      signalType: 'verification-gate',
      displayMode: 'blocked-action',
      sourceRefs: ['scripts/growth-worker-event-schema.mjs', 'scripts/verification_status.mjs'],
      safeCopy: 'Show that growth work is blocked from execution until an explicit approved implementation slice exists.',
      blockedActions: ['execute-worker', 'run-dogfood', 'call-provider'],
      actionAllowed: false,
      navigationHintIds: ['execution-to-logs-verification-detail'],
      evidenceLinkIds: ['worker-event-schema-contract'],
    },
    {
      routeId: 'deliverables-growth-proof',
      surfaceId: 'Deliverables',
      signalType: 'verification-gate',
      displayMode: 'evidence-link',
      sourceRefs: ['scripts/smoke-growth-gateway-surface-router-status.mjs', 'scripts/verification_status.mjs'],
      safeCopy: 'Expose what changed and which smoke or aggregate proof passed after a read-only growth slice.',
      blockedActions: ['release', 'push', 'merge'],
      actionAllowed: false,
      navigationHintIds: ['deliverables-to-artifacts-proof'],
      evidenceLinkIds: ['router-smoke-proof'],
    },
    {
      routeId: 'taskboard-growth-ledger',
      surfaceId: 'Taskboard',
      signalType: 'operator-decision',
      displayMode: 'advanced-ops-detail',
      sourceRefs: ['tasks/todo.md'],
      safeCopy: 'Keep the task-ledger record for the growth slice and its verification evidence visible.',
      blockedActions: ['close-unverified-task'],
      actionAllowed: false,
      navigationHintIds: ['taskboard-to-decision-inbox-gate'],
      evidenceLinkIds: ['task-ledger-growth-entry'],
    },
    {
      routeId: 'logs-growth-status-output',
      surfaceId: 'Logs',
      signalType: 'worker-event-schema',
      displayMode: 'advanced-ops-detail',
      sourceRefs: ['scripts/growth-gateway-surface-router-status.mjs'],
      safeCopy: 'Inspect machine-readable route status output without treating logs as approval or execution authority.',
      blockedActions: ['infer-hidden-approval'],
      actionAllowed: false,
      navigationHintIds: ['logs-to-council-review'],
      evidenceLinkIds: ['router-status-command'],
    },
    {
      routeId: 'artifacts-growth-evidence',
      surfaceId: 'Artifacts',
      signalType: 'skill-memory-registry',
      displayMode: 'evidence-link',
      sourceRefs: ['docs/18_growth-gateway-vnext.md', 'scripts/growth-skill-memory-registry-status.mjs'],
      safeCopy: 'Link retained docs and status artifacts without persisting learned memory or promoting skills.',
      blockedActions: ['persist-memory', 'promote-skill'],
      actionAllowed: false,
      navigationHintIds: ['artifacts-to-deliverables-summary'],
      evidenceLinkIds: ['skill-memory-registry-contract'],
    },
    {
      routeId: 'decision-inbox-growth-approval-context',
      surfaceId: 'Decision Inbox',
      signalType: 'operator-decision',
      displayMode: 'review-only',
      sourceRefs: ['AGENTS.md', 'docs/01_decision-log.md', 'scripts/growth-proposal-queue-status.mjs'],
      safeCopy: 'Show the approval context required before any future growth proposal becomes implementation work.',
      blockedActions: ['auto-approve', 'self-commit', 'self-push'],
      actionAllowed: false,
      navigationHintIds: ['decision-inbox-to-mission-hold-baseline'],
      evidenceLinkIds: ['approval-gate-policy'],
    },
  ];
}

function buildNavigationHints() {
  return [
    {
      hintId: 'mission-to-council-growth-review',
      fromSurface: 'Mission',
      toSurface: 'Council',
      reason: 'review why the next growth slice matters before opening implementation',
      actionType: 'open-review',
      executionAllowed: false,
    },
    {
      hintId: 'council-to-decision-inbox-approval-context',
      fromSurface: 'Council',
      toSurface: 'Decision Inbox',
      reason: 'inspect the explicit approval context required for any future implementation',
      actionType: 'open-approval-context',
      executionAllowed: false,
      requiresApprovalContext: true,
    },
    {
      hintId: 'execution-to-logs-verification-detail',
      fromSurface: 'Execution',
      toSurface: 'Logs',
      reason: 'inspect verification details instead of running a worker from the router',
      actionType: 'inspect-evidence',
      executionAllowed: false,
    },
    {
      hintId: 'deliverables-to-artifacts-proof',
      fromSurface: 'Deliverables',
      toSurface: 'Artifacts',
      reason: 'open retained proof artifacts for the read-only growth slice',
      actionType: 'inspect-evidence',
      executionAllowed: false,
    },
    {
      hintId: 'taskboard-to-decision-inbox-gate',
      fromSurface: 'Taskboard',
      toSurface: 'Decision Inbox',
      reason: 'confirm task-ledger close-out stays tied to approval and verification gates',
      actionType: 'open-approval-context',
      executionAllowed: false,
      requiresApprovalContext: true,
    },
    {
      hintId: 'logs-to-council-review',
      fromSurface: 'Logs',
      toSurface: 'Council',
      reason: 'turn raw status output into review context without making logs authoritative',
      actionType: 'open-review',
      executionAllowed: false,
    },
    {
      hintId: 'artifacts-to-deliverables-summary',
      fromSurface: 'Artifacts',
      toSurface: 'Deliverables',
      reason: 'surface evidence links as proof summaries after verification',
      actionType: 'navigate',
      executionAllowed: false,
    },
    {
      hintId: 'decision-inbox-to-mission-hold-baseline',
      fromSurface: 'Decision Inbox',
      toSurface: 'Mission',
      reason: 'hold the clean baseline when no explicit growth implementation is approved',
      actionType: 'hold-baseline',
      executionAllowed: false,
    },
  ];
}

function buildEvidenceLinks() {
  return [
    {
      linkId: 'growth-plan-doc',
      source: 'docs/18_growth-gateway-vnext.md',
      targetSurface: 'Mission',
      evidenceType: 'source-file',
      redactionState: 'not-required',
      command: 'node scripts/smoke-vnext-growth-gateway-plan.mjs',
    },
    {
      linkId: 'reflection-evaluator-output',
      source: 'scripts/growth-reflection-evaluator.mjs',
      targetSurface: 'Council',
      evidenceType: 'status-check',
      redactionState: 'not-required',
      command: 'node scripts/growth-reflection-evaluator.mjs',
    },
    {
      linkId: 'proposal-queue-contract',
      source: 'scripts/growth-proposal-queue-status.mjs',
      targetSurface: 'Council',
      evidenceType: 'source-file',
      redactionState: 'not-required',
      command: 'node scripts/growth-proposal-queue-status.mjs',
    },
    {
      linkId: 'worker-event-schema-contract',
      source: 'scripts/growth-worker-event-schema.mjs',
      targetSurface: 'Execution',
      evidenceType: 'source-file',
      redactionState: 'not-required',
      command: 'node scripts/growth-worker-event-schema.mjs',
    },
    {
      linkId: 'router-smoke-proof',
      source: 'scripts/smoke-growth-gateway-surface-router-status.mjs',
      targetSurface: 'Deliverables',
      evidenceType: 'verification-command',
      redactionState: 'not-required',
      command: 'node scripts/smoke-growth-gateway-surface-router-status.mjs',
    },
    {
      linkId: 'task-ledger-growth-entry',
      source: 'tasks/todo.md',
      targetSurface: 'Taskboard',
      evidenceType: 'source-file',
      redactionState: 'not-required',
    },
    {
      linkId: 'router-status-command',
      source: 'scripts/growth-gateway-surface-router-status.mjs',
      targetSurface: 'Logs',
      evidenceType: 'status-check',
      redactionState: 'not-required',
      command: 'node scripts/growth-gateway-surface-router-status.mjs',
    },
    {
      linkId: 'skill-memory-registry-contract',
      source: 'scripts/growth-skill-memory-registry-status.mjs',
      targetSurface: 'Artifacts',
      evidenceType: 'source-file',
      redactionState: 'not-required',
      command: 'node scripts/growth-skill-memory-registry-status.mjs',
    },
    {
      linkId: 'approval-gate-policy',
      source: 'AGENTS.md',
      targetSurface: 'Decision Inbox',
      evidenceType: 'operator-decision',
      redactionState: 'not-required',
    },
  ];
}

function buildBlockedActions() {
  return [
    {
      actionId: 'execute-worker',
      label: 'Execute growth worker',
      blockedReason: 'router is display/navigation only and cannot start workers',
      requiredApproval: 'explicit implementation-slice approval plus execution gate',
      allowedAlternative: 'navigate to Council or Logs for review-only evidence',
    },
    {
      actionId: 'apply-proposal',
      label: 'Apply improvement proposal',
      blockedReason: 'proposal queue status is read-only and no proposal may apply itself',
      requiredApproval: 'operator approval for a concrete thin slice',
      allowedAlternative: 'open Decision Inbox approval context',
    },
    {
      actionId: 'persist-memory',
      label: 'Persist learned memory or promote skill',
      blockedReason: 'skill/memory registry is status-only and persistence is not adopted',
      requiredApproval: 'separate memory persistence decision with redaction and applicability proof',
      allowedAlternative: 'inspect Artifacts evidence links',
    },
    {
      actionId: 'run-dogfood',
      label: 'Run another dogfood loop',
      blockedReason: 'dogfood execute requires explicit run-another-dogfood-execute approval',
      requiredApproval: 'explicit dogfood execute approval with concrete slug or runner command',
      allowedAlternative: 'hold complete baseline',
    },
    {
      actionId: 'self-commit',
      label: 'Commit growth slice automatically',
      blockedReason: 'approval before commit remains a repo rule',
      requiredApproval: 'explicit commit approval',
      allowedAlternative: 'show Deliverables proof and wait',
    },
    {
      actionId: 'self-push',
      label: 'Push growth slice automatically',
      blockedReason: 'push requires explicit operator approval and clean verification',
      requiredApproval: 'explicit git push origin main approval',
      allowedAlternative: 'hold local baseline',
    },
  ];
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const requiredFieldsSatisfied = Object.values(routeSchema).every((schema) => schema.required.length > 0);
const surfaceRoutes = buildSurfaceRoutes();
const navigationHints = buildNavigationHints();
const evidenceLinks = buildEvidenceLinks();
const blockedActions = buildBlockedActions();
const surfaceRouteIds = surfaceRoutes.map((route) => route.surfaceId);
const routesCoverAllSurfaces = SURFACE_IDS.every((surfaceId) => surfaceRouteIds.includes(surfaceId));
const allRoutesNavigationOnly = surfaceRoutes.every((route) => route.actionAllowed === false);
const allNavigationExecutionBlocked = navigationHints.every((hint) => hint.executionAllowed === false);
const continuousDevelopmentLoopStatusImplemented =
  sourceSummary.continuousDevelopmentLoopStatusScriptPresent &&
  sourceSummary.continuousDevelopmentLoopStatusDocumented;
const improvementAcceptanceStatusImplemented =
  sourceSummary.improvementAcceptanceStatusScriptPresent &&
  sourceSummary.improvementAcceptanceStatusDocumented;
const ok =
  missingSources.length === 0 &&
  sourceSummary.growthGatewayPlanPresent &&
  sourceSummary.gatewaySurfaceRouterDocumented &&
  sourceSummary.proposalQueueImplemented &&
  sourceSummary.skillMemoryRegistryImplemented &&
  sourceSummary.decisionAccepted &&
  sourceSummary.masterBriefMentionsAdvancedOps &&
  sourceSummary.iaMentionsPrimarySurfaces &&
  sourceSummary.harnessMentionsGatewaySurfaceRouter &&
  sourceSummary.completionReadinessMentionsGatewaySurfaceRouter &&
  sourceSummary.ledgerMentionsGatewaySurfaceRouter &&
  sourceSummary.nextContinuousLoopDocumented &&
  sourceSummary.improvementAcceptanceStatusDocumented &&
  sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
  sourceSummary.acceptedImprovementRegistryStatusDocumented &&
  sourceSummary.regressionWatchNextDocumented &&
  sourceSummary.regressionWatchStatusScriptPresent &&
  sourceSummary.regressionWatchStatusDocumented &&
  sourceSummary.rollbackReviewNextDocumented &&
  sourceSummary.rollbackReviewStatusScriptPresent &&
  sourceSummary.rollbackReviewStatusDocumented &&
  sourceSummary.remediationPlanNextDocumented &&
  sourceSummary.externalChannelsBlocked &&
  sourceSummary.gatewayAuthorityBlocked &&
  sourceSummary.allSurfaceIdsDocumented &&
  requiredFieldsSatisfied &&
  routesCoverAllSurfaces &&
  allRoutesNavigationOnly &&
  allNavigationExecutionBlocked;

const payload = {
  ok,
  mode: 'growth-gateway-surface-router-status',
  posture: 'local-read-only-gateway-surface-routing-contract',
  currentHead: {
    branchLine: (runGitOrNull(['status', '--short', '--branch']) || '').split('\n')[0] || '',
    head: runGitOrNull(['rev-parse', 'HEAD']),
    shortHead: runGitOrNull(['rev-parse', '--short', 'HEAD']),
  },
  schemaVersion: 'growth-gateway-surface-router-status/v0',
  sourceSummary,
  vocabulary: {
    growthSignalTypes: GROWTH_SIGNAL_TYPES,
    surfaceIds: SURFACE_IDS,
    displayModes: DISPLAY_MODES,
    operatorActionTypes: OPERATOR_ACTION_TYPES,
  },
  routeSchema,
  routingRules: buildRoutingRules(),
  surfaceRoutes,
  navigationHints,
  evidenceLinks,
  blockedActions,
  readiness: {
    routesDefined: surfaceRoutes.length,
    requiredFieldsSatisfied,
    routesCoverAllSurfaces,
    gatewayExternalChannelsAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    navigationOnlyActions: allRoutesNavigationOnly && allNavigationExecutionBlocked,
    readOnlySurfaceContract: true,
  },
  nextRecommendedSlice: continuousDevelopmentLoopStatusImplemented
    ? improvementAcceptanceStatusImplemented
      ? sourceSummary.acceptedImprovementRegistryStatusScriptPresent &&
        sourceSummary.acceptedImprovementRegistryStatusDocumented
        ? sourceSummary.regressionWatchStatusScriptPresent &&
          sourceSummary.regressionWatchStatusDocumented
          ? sourceSummary.rollbackReviewStatusScriptPresent &&
            sourceSummary.rollbackReviewStatusDocumented
            ? sourceSummary.remediationPlanStatusScriptPresent &&
              sourceSummary.remediationPlanStatusDocumented
              ? sourceSummary.remediationApprovalStatusScriptPresent &&
                sourceSummary.remediationApprovalStatusDocumented
                ? sourceSummary.implementationProposalStatusScriptPresent &&
                  sourceSummary.implementationProposalStatusDocumented
                  ? {
                      id: 'growth-remediation-source-mutation-request-status',
                      commandToAdd:
                        'node scripts/growth-remediation-source-mutation-request-status.mjs',
                      reason:
                        'The implementation proposal contract is now modeled as read-only; the next safe slice should define review gates before any thin implementation slice can mutate source or execute remediation.',
                      mustRemainReadOnly: true,
                    }
                  : {
                      id: 'growth-remediation-implementation-proposal-status',
                      commandToAdd:
                        'node scripts/growth-remediation-implementation-proposal-status.mjs',
                      reason:
                        'The remediation approval contract is now modeled as read-only; the next safe slice should define implementation proposal fields without generating proposals, mutating source, or executing remediation.',
                      mustRemainReadOnly: true,
                    }
              : {
                    id: 'growth-remediation-approval-status',
                    commandToAdd: 'node scripts/growth-remediation-approval-status.mjs',
                    reason:
                      'The remediation plan contract is now modeled as read-only; the next safe slice should define approval gates before implementation proposals or remediation execution can act.',
                    mustRemainReadOnly: true,
                  }
              : {
                  id: 'growth-remediation-plan-status',
                  commandToAdd: 'node scripts/growth-remediation-plan-status.mjs',
                  reason:
                    'The rollback review contract is now modeled as read-only; the next safe slice should define remediation plan fields without executing remediation or mutating accepted records.',
                  mustRemainReadOnly: true,
                }
            : {
                id: 'growth-rollback-review-status',
                commandToAdd: 'node scripts/growth-rollback-review-status.mjs',
                reason:
                  'The regression watch contract is now modeled as read-only; the next safe slice should define rollback review states without executing rollback or remediation.',
                mustRemainReadOnly: true,
              }
          : {
              id: 'growth-regression-watch-status',
              commandToAdd: 'node scripts/growth-regression-watch-status.mjs',
              reason:
                'The accepted improvement registry is now modeled as read-only; the next safe slice should define post-acceptance regression watch signals without remediation.',
              mustRemainReadOnly: true,
            }
        : {
            id: 'growth-accepted-improvement-registry-status',
            commandToAdd: 'node scripts/growth-accepted-improvement-registry-status.mjs',
            reason:
              'The improvement acceptance contract is now modeled as read-only; the next safe slice should define accepted improvement registry records without applying improvements.',
            mustRemainReadOnly: true,
          }
      : {
        id: 'growth-improvement-acceptance-status',
        commandToAdd: 'node scripts/growth-improvement-acceptance-status.mjs',
        reason:
          'The continuous development loop is now modeled as read-only; the next safe slice should define acceptance criteria before improvements are adopted.',
        mustRemainReadOnly: true,
      }
    : {
        id: 'growth-continuous-development-loop-status',
        commandToAdd: 'node scripts/growth-continuous-development-loop-status.mjs',
        reason:
          'Gateway surface routing is now modeled as read-only; the next safe slice should show how evidence, reflection, proposal, registry, and surface routing compose into a continuous development loop without automation.',
        mustRemainReadOnly: true,
      },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotOpenExternalChannels: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotExecuteWorkers: true,
    doesNotApplyProposals: true,
    doesNotPersistMemory: true,
    doesNotExecuteDogfood: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
  },
};

console.log(JSON.stringify(payload, null, 2));
process.exit(ok ? 0 : 1);
