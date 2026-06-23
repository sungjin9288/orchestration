import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-readiness-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  'scripts/growth-evidence-ledger-reflection-handoff-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/verification_status.mjs',
];

const PROPOSAL_READINESS_FIELDS = [
  'candidateId',
  'sourceFindingId',
  'candidateKind',
  'readinessStatus',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'routeRefs',
  'sourceRefs',
  'verificationRefs',
  'blockedActions',
  'riskClass',
  'humanReviewQuestion',
  'nonAuthorityStatement',
];

const CANDIDATE_KINDS = [
  'docs-boundary-clarification',
  'smoke-regression-guard',
  'gateway-routing-proof',
  'reflection-regression',
  'proposal-queue-handoff',
];

const READINESS_STATUSES = [
  'blocked-by-missing-evidence',
  'needs-evidence',
  'ready-for-proposal-readiness-review',
  'deferred',
];

const REQUIRED_EVIDENCE_MAP = [
  {
    field: 'sourceFindingId',
    source: 'growth-reflection-evaluator',
    requiredTypes: ['reflection-finding'],
  },
  {
    field: 'evidenceRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: ['claim', 'field-delta', 'run-outcome', 'review-result'],
  },
  {
    field: 'negativeEvidenceRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: ['negative-evidence', 'checked-absent'],
  },
  {
    field: 'routeRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: ['gateway-route-binding'],
  },
  {
    field: 'verificationRefs',
    source: 'verification_status',
    requiredTypes: ['verification-command', 'status-check'],
  },
  {
    field: 'blockedActions',
    source: 'safety-boundary',
    requiredTypes: ['proposal-generation-blocked', 'proposal-application-blocked', 'queue-mutation-blocked'],
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
    proposalReadinessStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-readiness-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal readiness status/.test(inventory),
    proposalReadinessStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-readiness-status/.test(verificationStatus),
    proposalReadinessStatusLedgered:
      /growth-evidence-ledger-proposal-readiness-status-readonly-post-m7/.test(todo),
    proposalReadinessLessonCaptured:
      /proposal readiness.*proposal generation/i.test(lessons) ||
      /proposal-ready.*queue mutation/i.test(lessons),
    engineRoutesPastProposalReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-queue-handoff/.test(engine),
    reflectionRoutesPastProposalReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-queue-handoff/.test(reflection),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildReadinessEnvelope({ handoffPayload, reflectionPayload, proposalQueuePayload }) {
  const primaryFinding = reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) =>
      finding.id ===
      'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-dry-run-review-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-dry-run-validation-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-dry-run-shape-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-creation-readiness-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-review-gate-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-record-readiness-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-queue-handoff-needed',
  ) || reflectionPayload?.reflectionFindings?.find(
    (finding) => finding.id === 'growth-evidence-ledger-proposal-readiness-needed',
  );
  const handoffBindings = handoffPayload?.handoffBindings || [];
  const sourceRefs = handoffPayload?.reflectionInputContract?.requiredSourceRefs || [];
  const queueRequiredEvidence = proposalQueuePayload?.vocabulary?.requiredEvidenceTypes || [];
  const availableEvidenceTypes = [
    ...queueRequiredEvidence,
    ...(handoffPayload?.reflectionInputContract?.allowedEvidenceTypes || []),
    'gateway-route-binding',
    'proposal-generation-blocked',
    'proposal-application-blocked',
    'queue-mutation-blocked',
  ];

  return {
    requiredFields: PROPOSAL_READINESS_FIELDS,
    candidateKinds: CANDIDATE_KINDS,
    readinessStatuses: READINESS_STATUSES,
    requiredEvidenceMap: REQUIRED_EVIDENCE_MAP,
    candidateEnvelope: {
      candidateId: 'growth-evidence-ledger-proposal-readiness-candidate',
      sourceFindingId: primaryFinding?.id || null,
      candidateKind: 'proposal-queue-handoff',
      readinessStatus: primaryFinding ? 'ready-for-proposal-readiness-review' : 'needs-evidence',
      evidenceRefs: [
        'growth-evidence-ledger-reflection-handoff-status',
        'growth-reflection-evaluator',
        'growth-proposal-queue-status',
      ],
      negativeEvidenceRefs: ['proposal-generation-blocked', 'proposal-application-blocked'],
      routeRefs: handoffBindings.map((binding) => binding.routeId),
      sourceRefs,
      verificationRefs: [
        'node scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
        'node scripts/growth-reflection-evaluator.mjs',
        'node scripts/verification_status.mjs',
      ],
      blockedActions: [
        'generate-proposal',
        'apply-proposal',
        'mutate-proposal-queue',
        'approve-proposal',
        'execute-worker',
        'call-provider',
        'persist-memory',
        'mutate-source',
      ],
      riskClass: 'smoke-only',
      humanReviewQuestion:
        'Is the reflected ledger evidence complete enough to define a future proposal queue handoff without creating or applying proposal records?',
      nonAuthorityStatement:
        'Proposal readiness is evidence for future review only; it is not proposal generation, approval, queue mutation, source mutation, or gateway action authority.',
    },
    queueCompatibility: {
      proposalQueueStatusReady: proposalQueuePayload?.readiness?.readyForHumanReviewContract === true,
      proposalQueueMutationAllowed: proposalQueuePayload?.readiness?.proposalQueueMutationAllowed === true,
      proposalGenerationAllowed: proposalQueuePayload?.readiness?.proposalGenerationAllowed === true,
      requiredEvidenceTypesCovered: REQUIRED_EVIDENCE_MAP.every((mapping) =>
        mapping.requiredTypes.every((type) => availableEvidenceTypes.includes(type)),
      ),
    },
  };
}

function buildReadiness({
  sourceSummary,
  handoffResult,
  reflectionResult,
  proposalQueueResult,
  readinessEnvelope,
}) {
  const envelope = readinessEnvelope.candidateEnvelope;

  return {
    reflectionHandoffReady: handoffResult.ok && handoffResult.payload?.readiness?.handoffBindingsDefined === true,
    reflectionEvaluatorReady:
      reflectionResult.ok &&
      [
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review-acceptance',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-review',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-validation',
        'ready-for-growth-evidence-ledger-proposal-record-dry-run-shape',
        'ready-for-growth-evidence-ledger-proposal-record-creation-readiness',
        'ready-for-growth-evidence-ledger-proposal-record-review-gate',
        'ready-for-growth-evidence-ledger-proposal-record-readiness',
        'ready-for-growth-evidence-ledger-proposal-readiness',
        'ready-for-growth-evidence-ledger-proposal-queue-handoff',
      ].includes(reflectionResult.payload?.aggregate?.status),
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    candidateEnvelopeDefined:
      PROPOSAL_READINESS_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      envelope.routeRefs.length >= 8 &&
      envelope.sourceRefs.length >= 5 &&
      envelope.verificationRefs.length >= 3,
    requiredEvidenceTypesMapped: readinessEnvelope.queueCompatibility.requiredEvidenceTypesCovered,
    docsAndAggregateReady:
      sourceSummary.proposalReadinessStatusDocumented &&
      sourceSummary.proposalReadinessStatusAggregateRegistered &&
      sourceSummary.proposalReadinessStatusLedgered &&
      sourceSummary.proposalReadinessLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalReadiness &&
      sourceSummary.reflectionRoutesPastProposalReadiness,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    proposalQueueMutationAllowed: false,
    approvalAllowed: false,
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
const handoffResult = runStatusScript('scripts/growth-evidence-ledger-reflection-handoff-status.mjs');
const reflectionResult = runStatusScript('scripts/growth-reflection-evaluator.mjs');
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const readinessEnvelope = buildReadinessEnvelope({
  handoffPayload: handoffResult.payload,
  reflectionPayload: reflectionResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  handoffResult,
  reflectionResult,
  proposalQueueResult,
  readinessEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.reflectionHandoffReady &&
  readiness.reflectionEvaluatorReady &&
  readiness.proposalQueueContractReady &&
  readiness.candidateEnvelopeDefined &&
  readiness.requiredEvidenceTypesMapped &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-readiness-status',
  posture: 'local-read-only-ledger-proposal-readiness',
  schemaVersion: 'growth-evidence-ledger-proposal-readiness-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    reflectionHandoff: {
      path: handoffResult.path,
      ok: handoffResult.ok,
      status: handoffResult.status,
      schemaVersion: handoffResult.payload?.schemaVersion || null,
    },
    reflectionEvaluator: {
      path: reflectionResult.path,
      ok: reflectionResult.ok,
      status: reflectionResult.status,
      aggregateStatus: reflectionResult.payload?.aggregate?.status || null,
      schemaVersion: reflectionResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  readinessEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-queue-handoff',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-readiness-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'Reflection-backed ledger evidence now has a proposal-readiness envelope; the next safe slice can define a read-only handoff into the existing proposal queue contract without creating, approving, applying, or mutating proposal records.',
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
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    reflectionHandoffFailed: !handoffResult.ok,
    reflectionEvaluatorFailed: !reflectionResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
