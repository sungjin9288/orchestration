import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-reflection-handoff-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-reflection-handoff-status.mjs',
  'scripts/growth-evidence-ledger-status.mjs',
  'scripts/growth-evidence-ledger-gateway-routing-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/verification_status.mjs',
];

const REFLECTION_INPUT_FIELDS = [
  'ledgerStatus',
  'gatewayRouteBindings',
  'reflectionScorecard',
  'negativeEvidence',
  'blockedAuthorities',
  'verificationRefs',
  'sourceRefs',
];

const ALLOWED_EVIDENCE_TYPES = [
  'claim',
  'negative-evidence',
  'checked-absent',
  'field-delta',
  'run-outcome',
  'review-result',
  'failed-check',
  'operator-decision',
  'lesson-candidate',
  'artifact-ref',
  'log-ref',
  'projection',
  'redacted',
];

const REFLECTION_BINDINGS = [
  {
    surfaceId: 'Mission',
    routeId: 'mission-growth-summary',
    reflectionCriteria: ['scope-drift-control', 'operator-routing-clarity'],
    handoffUse: 'show summary claims and bounded vNext posture without granting action authority',
  },
  {
    surfaceId: 'Council',
    routeId: 'council-growth-review',
    reflectionCriteria: ['operator-routing-clarity', 'gate-preservation'],
    handoffUse: 'review field deltas and checked-absent evidence before any approval-gated proposal lane',
  },
  {
    surfaceId: 'Execution',
    routeId: 'execution-growth-blocker',
    reflectionCriteria: ['runtime-evidence-quality', 'gate-preservation'],
    handoffUse: 'carry failed checks and run outcomes as blockers while executionAllowed remains false',
  },
  {
    surfaceId: 'Deliverables',
    routeId: 'deliverables-growth-proof',
    reflectionCriteria: ['runtime-evidence-quality'],
    handoffUse: 'attach verification proof and artifact refs to reflection output only',
  },
  {
    surfaceId: 'Taskboard',
    routeId: 'taskboard-growth-ledger',
    reflectionCriteria: ['gate-preservation'],
    handoffUse: 'keep operator decisions and lesson candidates visible without changing task state',
  },
  {
    surfaceId: 'Logs',
    routeId: 'logs-growth-status-output',
    reflectionCriteria: ['runtime-evidence-quality'],
    handoffUse: 'preserve status output and log refs as evidence, not runtime commands',
  },
  {
    surfaceId: 'Artifacts',
    routeId: 'artifacts-growth-evidence',
    reflectionCriteria: ['memory-safety', 'runtime-evidence-quality'],
    handoffUse: 'show retained evidence and redaction state without memory persistence',
  },
  {
    surfaceId: 'Decision Inbox',
    routeId: 'decision-inbox-growth-approval-context',
    reflectionCriteria: ['gate-preservation', 'operator-routing-clarity'],
    handoffUse: 'provide approval context without auto-approval or proposal application',
  },
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

function runStatusScript(relativePath) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  const stdout = result.stdout?.trim() || '';
  const stderr = result.stderr?.trim() || '';
  let payload = null;

  try {
    payload = JSON.parse(stdout || stderr);
  } catch (_error) {
    payload = null;
  }

  return {
    path: relativePath,
    ok: result.status === 0 && payload?.ok === true,
    status: result.status,
    stdout,
    stderr,
    payload,
  };
}

function summarizeSources(sources) {
  const plan = sourceText(sources, 'docs/18_growth-gateway-vnext.md');
  const inventory = sourceText(sources, 'docs/22_completion-gate-inventory.md');
  const todo = sourceText(sources, 'tasks/todo.md');
  const lessons = sourceText(sources, 'tasks/lessons.md');
  const verificationStatus = sourceText(sources, 'scripts/verification_status.mjs');
  const engine = sourceText(sources, 'scripts/growth-engine-status.mjs');
  const reflection = sourceText(sources, 'scripts/growth-reflection-evaluator.mjs');

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    reflectionHandoffStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-reflection-handoff-status`/.test(
        plan,
      ) && /Growth Evidence Ledger reflection handoff status/.test(inventory),
    reflectionHandoffStatusAggregateRegistered:
      /growth-evidence-ledger-reflection-handoff-status/.test(verificationStatus),
    reflectionHandoffStatusLedgered:
      /growth-evidence-ledger-reflection-handoff-status-readonly-post-m7/.test(todo),
    reflectionHandoffLessonCaptured:
      /routed ledger evidence.*reflection handoff/i.test(lessons) ||
      /reflection handoff.*routed ledger evidence/i.test(lessons),
    engineRoutesPastReflectionHandoff:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-readiness/.test(engine),
    reflectionRoutesPastReflectionHandoff:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-readiness/.test(reflection),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildHandoffBindings(gatewayPayload) {
  const routeBindings = gatewayPayload?.routeBindings || [];

  return REFLECTION_BINDINGS.map((binding) => {
    const route = routeBindings.find((candidate) => candidate.routeId === binding.routeId);

    return {
      ...binding,
      routePresent: Boolean(route),
      actionAllowed: route?.actionAllowed ?? null,
      displayMode: route?.displayMode ?? null,
      sourceRefs: route?.sourceRefs || [],
      evidenceLinkIds: route?.evidenceLinkIds || [],
      blockedActions: route?.blockedActions || [],
    };
  });
}

function buildReflectionInputContract({ gatewayPayload, reflectionPayload }) {
  return {
    requiredFields: REFLECTION_INPUT_FIELDS,
    allowedEvidenceTypes: ALLOWED_EVIDENCE_TYPES,
    requiredSourceRefs: [
      'scripts/growth-evidence-ledger-status.mjs',
      'scripts/growth-evidence-ledger-gateway-routing-status.mjs',
      'scripts/growth-reflection-evaluator.mjs',
      'docs/18_growth-gateway-vnext.md',
      'docs/22_completion-gate-inventory.md',
    ],
    requiredReflectionCriteria: [
      'gate-preservation',
      'scope-drift-control',
      'runtime-evidence-quality',
      'verification-meaningfulness',
      'memory-safety',
      'operator-routing-clarity',
    ],
    sourceStatusModes: [
      gatewayPayload?.mode || null,
      reflectionPayload?.mode || null,
    ].filter(Boolean),
    proposalReadinessBoundary:
      'reflection handoff may define inputs for future proposal-readiness checks, but it must not generate, apply, approve, or queue proposals',
  };
}

function buildReadiness({
  sourceSummary,
  ledgerResult,
  gatewayResult,
  reflectionResult,
  handoffBindings,
  reflectionInputContract,
}) {
  const reflectionPayload = reflectionResult.payload;
  const scorecard = reflectionPayload?.scorecard || [];
  const criteriaCovered = reflectionInputContract.requiredReflectionCriteria.every((criterion) =>
    scorecard.some((item) => item.id === criterion),
  );
  const allBindingsDefined =
    handoffBindings.length === REFLECTION_BINDINGS.length &&
    handoffBindings.every((binding) => binding.routePresent && binding.actionAllowed === false);
  const evidenceTypesAvailable = reflectionInputContract.allowedEvidenceTypes.every((type) =>
    ledgerResult.payload?.ledgerVocabulary?.evidenceTypes?.includes(type),
  );

  return {
    ledgerStatusReady: ledgerResult.ok && ledgerResult.payload?.readiness?.ledgerStatusReady === true,
    gatewayRoutingReady:
      gatewayResult.ok &&
      gatewayResult.payload?.readiness?.routeBindingsDefined === true &&
      gatewayResult.payload?.readiness?.routeActionsBlocked === true,
    reflectionEvaluatorReady: reflectionResult.ok && scorecard.length > 0 && criteriaCovered,
    handoffBindingsDefined: allBindingsDefined,
    evidenceTypesAvailable,
    docsAndAggregateReady:
      sourceSummary.reflectionHandoffStatusDocumented &&
      sourceSummary.reflectionHandoffStatusAggregateRegistered &&
      sourceSummary.reflectionHandoffStatusLedgered &&
      sourceSummary.reflectionHandoffLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastReflectionHandoff &&
      sourceSummary.reflectionRoutesPastReflectionHandoff,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    proposalQueueMutationAllowed: false,
    memoryPersistenceAllowed: false,
    providerCallsAllowed: false,
    runtimeMutationAllowed: false,
    sourceMutationAllowed: false,
    gatewayExecutionAuthorityAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  };
}

const sources = SOURCE_FILES.map(readSource);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const sourceSummary = summarizeSources(sources);
const ledgerResult = runStatusScript('scripts/growth-evidence-ledger-status.mjs');
const gatewayResult = runStatusScript('scripts/growth-evidence-ledger-gateway-routing-status.mjs');
const reflectionResult = runStatusScript('scripts/growth-reflection-evaluator.mjs');
const handoffBindings = buildHandoffBindings(gatewayResult.payload);
const reflectionInputContract = buildReflectionInputContract({
  gatewayPayload: gatewayResult.payload,
  reflectionPayload: reflectionResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  ledgerResult,
  gatewayResult,
  reflectionResult,
  handoffBindings,
  reflectionInputContract,
});
const ok =
  missingSources.length === 0 &&
  readiness.ledgerStatusReady &&
  readiness.gatewayRoutingReady &&
  readiness.reflectionEvaluatorReady &&
  readiness.handoffBindingsDefined &&
  readiness.evidenceTypesAvailable &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-reflection-handoff-status',
  posture: 'local-read-only-ledger-reflection-handoff',
  schemaVersion: 'growth-evidence-ledger-reflection-handoff-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    ledger: {
      path: ledgerResult.path,
      ok: ledgerResult.ok,
      status: ledgerResult.status,
      schemaVersion: ledgerResult.payload?.schemaVersion || null,
    },
    gatewayRouting: {
      path: gatewayResult.path,
      ok: gatewayResult.ok,
      status: gatewayResult.status,
      schemaVersion: gatewayResult.payload?.schemaVersion || null,
    },
    reflectionEvaluator: {
      path: reflectionResult.path,
      ok: reflectionResult.ok,
      status: reflectionResult.status,
      aggregateStatus: reflectionResult.payload?.aggregate?.status || null,
      schemaVersion: reflectionResult.payload?.schemaVersion || null,
    },
  },
  reflectionInputContract,
  handoffBindings,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-readiness',
    commandToAdd:
      'node scripts/growth-evidence-ledger-reflection-handoff-status.mjs && node scripts/growth-reflection-evaluator.mjs',
    reason:
      'Routed Growth Evidence Ledger evidence is now typed as reflection input; the next safe slice can define proposal-readiness checks without generating proposals, applying proposals, mutating source, persisting memory, calling providers, or granting gateway action authority.',
    mustRemainReadOnly: true,
  },
  safetyBoundary: {
    readOnly: true,
    doesNotWriteFiles: true,
    doesNotMutateRuntime: true,
    doesNotExecuteWorkers: true,
    doesNotExecuteDogfood: true,
    doesNotCallProviders: true,
    doesNotPersistMemory: true,
    doesNotOpenExternalChannels: true,
    doesNotAuthorizeGatewayActions: true,
    doesNotGenerateProposals: true,
    doesNotApplyProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    ledgerStatusFailed: !ledgerResult.ok,
    gatewayRoutingStatusFailed: !gatewayResult.ok,
    reflectionEvaluatorFailed: !reflectionResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
