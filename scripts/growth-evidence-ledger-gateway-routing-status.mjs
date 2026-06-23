import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-gateway-routing-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-gateway-routing-status.mjs',
  'scripts/growth-evidence-ledger-status.mjs',
  'scripts/growth-gateway-surface-router-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const SURFACE_LEDGER_BINDINGS = [
  {
    surfaceId: 'Mission',
    routeId: 'mission-growth-summary',
    ledgerEvidenceTypes: ['claim', 'projection', 'negative-evidence'],
    ledgerSourceBuckets: ['source-of-truth-docs', 'task-ledger'],
    ledgerFields: ['claim', 'status', 'confidence', 'negativeEvidence', 'refs'],
    displayContract: 'plain-language summary plus evidence navigation only',
  },
  {
    surfaceId: 'Council',
    routeId: 'council-growth-review',
    ledgerEvidenceTypes: ['claim', 'field-delta', 'review-result', 'checked-absent'],
    ledgerSourceBuckets: ['read-only-status-scripts', 'source-of-truth-docs'],
    ledgerFields: ['evidenceType', 'claim', 'fieldDelta', 'refs'],
    displayContract: 'review context without proposal approval side effects',
  },
  {
    surfaceId: 'Execution',
    routeId: 'execution-growth-blocker',
    ledgerEvidenceTypes: ['failed-check', 'run-outcome', 'checked-absent'],
    ledgerSourceBuckets: ['read-only-status-scripts', 'runtime-snapshots'],
    ledgerFields: ['status', 'refs', 'logRefs'],
    displayContract: 'blocked execution context with executionAllowed=false',
  },
  {
    surfaceId: 'Deliverables',
    routeId: 'deliverables-growth-proof',
    ledgerEvidenceTypes: ['run-outcome', 'artifact-ref', 'log-ref'],
    ledgerSourceBuckets: ['read-only-status-scripts', 'source-of-truth-docs'],
    ledgerFields: ['command', 'status', 'scope', 'blocking', 'artifactRefs'],
    displayContract: 'verification proof links after read-only checks pass',
  },
  {
    surfaceId: 'Taskboard',
    routeId: 'taskboard-growth-ledger',
    ledgerEvidenceTypes: ['operator-decision', 'lesson-candidate', 'claim'],
    ledgerSourceBuckets: ['task-ledger'],
    ledgerFields: ['operatorDecisionRef', 'lessonId', 'applicability', 'refs'],
    displayContract: 'task ledger status and human-gate posture only',
  },
  {
    surfaceId: 'Logs',
    routeId: 'logs-growth-status-output',
    ledgerEvidenceTypes: ['log-ref', 'run-outcome', 'failed-check'],
    ledgerSourceBuckets: ['runtime-snapshots', 'read-only-status-scripts'],
    ledgerFields: ['runtimeRoot', 'stateFile', 'runRefs', 'failedCheckRefs'],
    displayContract: 'machine-readable status output without approval inference',
  },
  {
    surfaceId: 'Artifacts',
    routeId: 'artifacts-growth-evidence',
    ledgerEvidenceTypes: ['artifact-ref', 'redacted', 'projection'],
    ledgerSourceBuckets: ['source-of-truth-docs', 'read-only-status-scripts'],
    ledgerFields: ['artifactRefs', 'redactionState', 'projection', 'refs'],
    displayContract: 'retained evidence links without memory persistence',
  },
  {
    surfaceId: 'Decision Inbox',
    routeId: 'decision-inbox-growth-approval-context',
    ledgerEvidenceTypes: ['approval-state', 'operator-decision', 'checked-absent'],
    ledgerSourceBuckets: ['source-of-truth-docs', 'task-ledger'],
    ledgerFields: ['operatorDecisionRef', 'approvalRefs', 'negativeEvidence', 'refs'],
    displayContract: 'approval context only, never auto-approval',
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
    maxBuffer: 10 * 1024 * 1024,
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
    gatewayRoutingStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-gateway-routing-status`/.test(
        plan,
      ) && /Growth Evidence Ledger gateway routing status/.test(inventory),
    gatewayRoutingStatusAggregateRegistered:
      /growth-evidence-ledger-gateway-routing-status/.test(verificationStatus),
    gatewayRoutingStatusLedgered:
      /growth-evidence-ledger-gateway-routing-status-readonly-post-m7/.test(todo),
    gatewayRoutingLessonCaptured:
      /ledger evidence into gateway routing/.test(lessons) ||
      /gateway routing.*ledger/i.test(lessons),
    engineRoutesPastGatewayRouting:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-reflection-handoff/.test(engine),
    reflectionRoutesPastGatewayRouting:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-reflection-handoff/.test(reflection),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildRouteBindings(gatewayPayload) {
  const routes = gatewayPayload?.surfaceRoutes || [];

  return SURFACE_LEDGER_BINDINGS.map((binding) => {
    const route = routes.find((candidate) => candidate.routeId === binding.routeId);

    return {
      ...binding,
      routePresent: Boolean(route),
      actionAllowed: route?.actionAllowed ?? null,
      displayMode: route?.displayMode ?? null,
      blockedActions: route?.blockedActions || [],
      sourceRefs: route?.sourceRefs || [],
      evidenceLinkIds: route?.evidenceLinkIds || [],
    };
  });
}

function buildReadiness({ sourceSummary, ledgerResult, gatewayResult, routeBindings }) {
  const ledgerPayload = ledgerResult.payload;
  const gatewayPayload = gatewayResult.payload;
  const routesCoverAllSurfaces =
    routeBindings.length === SURFACE_LEDGER_BINDINGS.length &&
    routeBindings.every((binding) => binding.routePresent);
  const routeActionsBlocked = routeBindings.every((binding) => binding.actionAllowed === false);
  const sourceBucketsAvailable =
    ledgerPayload?.ledgerVocabulary?.sourceBuckets?.length >= 4 &&
    ledgerPayload?.ledgerVocabulary?.evidenceTypes?.includes('negative-evidence');
  const gatewaySurfaceContractReady =
    gatewayPayload?.readiness?.readOnlySurfaceContract === true &&
    gatewayPayload?.readiness?.gatewayExecutionAuthorityAllowed === false;

  return {
    ledgerStatusReady: ledgerResult.ok && ledgerPayload?.readiness?.ledgerStatusReady === true,
    gatewayRouterReady: gatewayResult.ok && gatewaySurfaceContractReady,
    sourceBucketsAvailable,
    routeBindingsDefined: routesCoverAllSurfaces,
    routeActionsBlocked,
    routeEvidenceLinksPresent: routeBindings.every((binding) => binding.evidenceLinkIds.length > 0),
    docsAndAggregateReady:
      sourceSummary.gatewayRoutingStatusDocumented &&
      sourceSummary.gatewayRoutingStatusAggregateRegistered &&
      sourceSummary.gatewayRoutingStatusLedgered,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastGatewayRouting && sourceSummary.reflectionRoutesPastGatewayRouting,
    gatewayExecutionAuthorityAllowed: false,
    runtimeMutationAllowed: false,
    memoryPersistenceAllowed: false,
    providerCallsAllowed: false,
    sourceMutationAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  };
}

const sources = SOURCE_FILES.map(readSource);
const sourceSummary = summarizeSources(sources);
const missingSources = sources.filter((source) => !source.exists).map((source) => source.path);
const ledgerResult = runStatusScript('scripts/growth-evidence-ledger-status.mjs');
const gatewayResult = runStatusScript('scripts/growth-gateway-surface-router-status.mjs');
const routeBindings = buildRouteBindings(gatewayResult.payload);
const readiness = buildReadiness({ sourceSummary, ledgerResult, gatewayResult, routeBindings });
const ok =
  missingSources.length === 0 &&
  readiness.ledgerStatusReady &&
  readiness.gatewayRouterReady &&
  readiness.sourceBucketsAvailable &&
  readiness.routeBindingsDefined &&
  readiness.routeActionsBlocked &&
  readiness.routeEvidenceLinksPresent &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-gateway-routing-status',
  posture: 'local-read-only-ledger-to-gateway-routing',
  schemaVersion: 'growth-evidence-ledger-gateway-routing-status/v0',
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
    gatewayRouter: {
      path: gatewayResult.path,
      ok: gatewayResult.ok,
      status: gatewayResult.status,
      schemaVersion: gatewayResult.payload?.schemaVersion || null,
    },
  },
  routeBindings,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-reflection-handoff',
    commandToAdd:
      'node scripts/growth-evidence-ledger-gateway-routing-status.mjs && node scripts/growth-reflection-evaluator.mjs',
    reason:
      'Ledger evidence is now mapped into read-only gateway routing; the next safe slice can make the reflection evaluator consume that routed ledger status without proposal generation, runtime mutation, provider calls, memory persistence, commits, or pushes.',
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
    doesNotApplyProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    ledgerStatusFailed: !ledgerResult.ok,
    gatewayRouterStatusFailed: !gatewayResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
