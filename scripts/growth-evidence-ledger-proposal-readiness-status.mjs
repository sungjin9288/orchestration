import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'growth-evidence-ledger-proposal-readiness-status';
const STATUS_POSTURE = 'local-read-only-ledger-proposal-readiness';
const STATUS_SCHEMA_VERSION = 'growth-evidence-ledger-proposal-readiness-status/v0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
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

const DOCS_AND_AGGREGATE_READY_SOURCE_FIELDS = [
  'proposalReadinessStatusDocumented',
  'proposalReadinessStatusAggregateRegistered',
  'proposalReadinessStatusLedgered',
  'proposalReadinessLessonCaptured',
];

const ENGINE_REFLECTION_ADVANCED_SOURCE_FIELDS = [
  'engineRoutesPastProposalReadiness',
  'reflectionRoutesPastProposalReadiness',
];

const PROPOSAL_QUEUE_READ_ONLY_READY_FIELDS = [
  ['readyForHumanReviewContract', true],
  ['proposalGenerationAllowed', false],
  ['proposalApplicationAllowed', false],
  ['proposalQueueMutationAllowed', false],
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

const CANDIDATE_ENVELOPE_MIN_ROUTE_REFS = 8;
const CANDIDATE_ENVELOPE_MIN_SOURCE_REFS = 5;
const CANDIDATE_ENVELOPE_MIN_VERIFICATION_REFS = 3;

const CANDIDATE_ENVELOPE_REF_REQUIREMENTS = [
  ['routeRefs', CANDIDATE_ENVELOPE_MIN_ROUTE_REFS],
  ['sourceRefs', CANDIDATE_ENVELOPE_MIN_SOURCE_REFS],
  ['verificationRefs', CANDIDATE_ENVELOPE_MIN_VERIFICATION_REFS],
];

const PROPOSAL_READINESS_EVIDENCE_REFS = [
  'growth-evidence-ledger-reflection-handoff-status',
  'growth-reflection-evaluator',
  'growth-proposal-queue-status',
];

const PROPOSAL_READINESS_NEGATIVE_EVIDENCE_REFS = [
  'proposal-generation-blocked',
  'proposal-application-blocked',
];

const PROPOSAL_READINESS_BLOCKED_EVIDENCE_TYPES = [
  ...PROPOSAL_READINESS_NEGATIVE_EVIDENCE_REFS,
  'queue-mutation-blocked',
];

const PROPOSAL_READINESS_REFLECTION_FINDING_EVIDENCE_TYPES = ['reflection-finding'];

const PROPOSAL_READINESS_HANDOFF_EVIDENCE_TYPES = [
  'claim',
  'field-delta',
  'run-outcome',
  'review-result',
];

const PROPOSAL_READINESS_NEGATIVE_EVIDENCE_TYPES = [
  'negative-evidence',
  'checked-absent',
];

const PROPOSAL_READINESS_ROUTE_EVIDENCE_TYPES = ['gateway-route-binding'];

const PROPOSAL_READINESS_VERIFICATION_EVIDENCE_TYPES = [
  'verification-command',
  'status-check',
];

const PROPOSAL_READINESS_VERIFICATION_REFS = [
  'node scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  'node scripts/growth-reflection-evaluator.mjs',
  'node scripts/verification_status.mjs',
];

const PROPOSAL_READINESS_BLOCKED_ACTIONS = [
  'generate-proposal',
  'apply-proposal',
  'mutate-proposal-queue',
  'approve-proposal',
  'execute-worker',
  'call-provider',
  'persist-memory',
  'mutate-source',
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

const PREFERRED_REFLECTION_FINDING_IDS = [
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-needed',
  'growth-evidence-ledger-proposal-record-dry-run-review-needed',
  'growth-evidence-ledger-proposal-record-dry-run-validation-needed',
  'growth-evidence-ledger-proposal-record-dry-run-shape-needed',
  'growth-evidence-ledger-proposal-record-creation-readiness-needed',
  'growth-evidence-ledger-proposal-record-review-gate-needed',
  'growth-evidence-ledger-proposal-record-readiness-needed',
  'growth-evidence-ledger-proposal-queue-handoff-needed',
  'growth-evidence-ledger-proposal-readiness-needed',
];

const PREFERRED_REFLECTION_READY_STATUS_SET = new Set(
  PREFERRED_REFLECTION_FINDING_IDS.map((id) => `ready-for-${id.replace(/-needed$/, '')}`),
);

const REQUIRED_EVIDENCE_MAP = [
  {
    field: 'sourceFindingId',
    source: 'growth-reflection-evaluator',
    requiredTypes: PROPOSAL_READINESS_REFLECTION_FINDING_EVIDENCE_TYPES,
  },
  {
    field: 'evidenceRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: PROPOSAL_READINESS_HANDOFF_EVIDENCE_TYPES,
  },
  {
    field: 'negativeEvidenceRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: PROPOSAL_READINESS_NEGATIVE_EVIDENCE_TYPES,
  },
  {
    field: 'routeRefs',
    source: 'growth-evidence-ledger-reflection-handoff-status',
    requiredTypes: PROPOSAL_READINESS_ROUTE_EVIDENCE_TYPES,
  },
  {
    field: 'verificationRefs',
    source: 'verification_status',
    requiredTypes: PROPOSAL_READINESS_VERIFICATION_EVIDENCE_TYPES,
  },
  {
    field: 'blockedActions',
    source: 'safety-boundary',
    requiredTypes: PROPOSAL_READINESS_BLOCKED_EVIDENCE_TYPES,
  },
];

const READINESS_REQUIRED_GATE_FIELDS = [
  'reflectionHandoffReady',
  'reflectionEvaluatorReady',
  'proposalQueueContractReady',
  'candidateEnvelopeDefined',
  'requiredEvidenceTypesMapped',
  'docsAndAggregateReady',
  'engineReflectionAdvanced',
];

const READ_ONLY_SAFETY_BOUNDARY = {
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
};

const READINESS_BLOCKED_AUTHORITY_FLAGS = {
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

const CANDIDATE_ENVELOPE_CONTRACT = {
  candidateId: 'growth-evidence-ledger-proposal-readiness-candidate',
  candidateKind: 'proposal-queue-handoff',
  readyStatus: 'ready-for-proposal-readiness-review',
  fallbackStatus: 'needs-evidence',
  riskClass: 'smoke-only',
  humanReviewQuestion:
    'Is the reflected ledger evidence complete enough to define a future proposal queue handoff without creating or applying proposal records?',
  nonAuthorityStatement:
    'Proposal readiness is evidence for future review only; it is not proposal generation, approval, queue mutation, source mutation, or gateway action authority.',
};

const NEXT_RECOMMENDED_SLICE = {
  id: 'growth-evidence-ledger-proposal-queue-handoff',
  commandToAdd:
    'node scripts/growth-evidence-ledger-proposal-readiness-status.mjs && node scripts/growth-proposal-queue-status.mjs',
  reason:
    'Reflection-backed ledger evidence now has a proposal-readiness envelope; the next safe slice can define a read-only handoff into the existing proposal queue contract without creating, approving, applying, or mutating proposal records.',
  mustRemainReadOnly: true,
};

const INPUT_STATUS_SCRIPT_PATHS = {
  reflectionHandoff: 'scripts/growth-evidence-ledger-reflection-handoff-status.mjs',
  reflectionEvaluator: 'scripts/growth-reflection-evaluator.mjs',
  proposalQueue: 'scripts/growth-proposal-queue-status.mjs',
};

const SOURCE_SUMMARY_MARKERS = {
  planDocumentsProposalReadiness:
    /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-readiness-status`/,
  inventoryDocumentsProposalReadiness: /Growth Evidence Ledger proposal readiness status/,
  aggregateRegistersProposalReadiness: /growth-evidence-ledger-proposal-readiness-status/,
  ledgerCapturesProposalReadiness: /growth-evidence-ledger-proposal-readiness-status-readonly-post-m7/,
  lessonCapturesProposalReadiness:
    /proposal readiness.*proposal generation/i,
  lessonCapturesQueueMutationBoundary:
    /proposal-ready.*queue mutation/i,
  routesPastProposalReadiness:
    /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-queue-handoff/,
  openTodoCheckbox: /^- \[ \]/m,
};

function findPreferredReflectionFinding(findings = []) {
  for (const id of PREFERRED_REFLECTION_FINDING_IDS) {
    const finding = findings.find((candidate) => candidate.id === id);
    if (finding) return finding;
  }

  return null;
}

function candidateEnvelopeHasRequiredFields(envelope) {
  return PROPOSAL_READINESS_FIELDS.every((field) => Object.hasOwn(envelope, field));
}

function candidateEnvelopeHasRequiredRefs(envelope) {
  return CANDIDATE_ENVELOPE_REF_REQUIREMENTS.every(
    ([field, minimumCount]) => envelope[field].length >= minimumCount,
  );
}

function proposalQueueStaysReadOnlyAndReady(proposalQueueReadiness) {
  return PROPOSAL_QUEUE_READ_ONLY_READY_FIELDS.every(
    ([field, value]) => proposalQueueReadiness?.[field] === value,
  );
}

function proposalReadinessStatusIsReady({ missingSources, readiness }) {
  return (
    missingSources.length === 0 &&
    READINESS_REQUIRED_GATE_FIELDS.every((field) => readiness[field] === true)
  );
}

function docsAndAggregateAreReady(sourceSummary) {
  return DOCS_AND_AGGREGATE_READY_SOURCE_FIELDS.every(
    (field) => sourceSummary[field] === true,
  );
}

function engineAndReflectionHaveAdvanced(sourceSummary) {
  return ENGINE_REFLECTION_ADVANCED_SOURCE_FIELDS.every(
    (field) => sourceSummary[field] === true,
  );
}

function buildQueueCompatibility({ proposalQueueReadiness, availableEvidenceTypeSet }) {
  return {
    proposalQueueStatusReady: proposalQueueReadiness?.readyForHumanReviewContract === true,
    proposalQueueMutationAllowed: proposalQueueReadiness?.proposalQueueMutationAllowed === true,
    proposalGenerationAllowed: proposalQueueReadiness?.proposalGenerationAllowed === true,
    requiredEvidenceTypesCovered: REQUIRED_EVIDENCE_MAP.every((mapping) =>
      mapping.requiredTypes.every((type) => availableEvidenceTypeSet.has(type)),
    ),
  };
}

function buildCandidateEnvelope({ primaryFinding, handoffBindings, sourceRefs }) {
  return {
    candidateId: CANDIDATE_ENVELOPE_CONTRACT.candidateId,
    sourceFindingId: primaryFinding?.id || null,
    candidateKind: CANDIDATE_ENVELOPE_CONTRACT.candidateKind,
    readinessStatus: primaryFinding
      ? CANDIDATE_ENVELOPE_CONTRACT.readyStatus
      : CANDIDATE_ENVELOPE_CONTRACT.fallbackStatus,
    evidenceRefs: PROPOSAL_READINESS_EVIDENCE_REFS,
    negativeEvidenceRefs: PROPOSAL_READINESS_NEGATIVE_EVIDENCE_REFS,
    routeRefs: handoffBindings.map((binding) => binding.routeId),
    sourceRefs,
    verificationRefs: PROPOSAL_READINESS_VERIFICATION_REFS,
    blockedActions: PROPOSAL_READINESS_BLOCKED_ACTIONS,
    riskClass: CANDIDATE_ENVELOPE_CONTRACT.riskClass,
    humanReviewQuestion: CANDIDATE_ENVELOPE_CONTRACT.humanReviewQuestion,
    nonAuthorityStatement: CANDIDATE_ENVELOPE_CONTRACT.nonAuthorityStatement,
  };
}

function collectReadinessEnvelopeInputs({ handoffPayload, reflectionPayload, proposalQueuePayload }) {
  const handoffInputContract = handoffPayload?.reflectionInputContract;

  return {
    primaryFinding: findPreferredReflectionFinding(reflectionPayload?.reflectionFindings),
    handoffBindings: handoffPayload?.handoffBindings || [],
    sourceRefs: handoffInputContract?.requiredSourceRefs || [],
    proposalQueueReadiness: proposalQueuePayload?.readiness,
    availableEvidenceTypeSet: new Set([
      ...(proposalQueuePayload?.vocabulary?.requiredEvidenceTypes || []),
      ...(handoffInputContract?.allowedEvidenceTypes || []),
      ...PROPOSAL_READINESS_ROUTE_EVIDENCE_TYPES,
      ...PROPOSAL_READINESS_BLOCKED_EVIDENCE_TYPES,
    ]),
  };
}

function summarizeInputStatus(result, extraFields = {}) {
  return {
    path: result.path,
    ok: result.ok,
    status: result.status,
    ...extraFields,
    schemaVersion: result.payload?.schemaVersion || null,
  };
}

function buildInputStatuses(inputStatusResults) {
  const { handoffResult, reflectionResult, proposalQueueResult } = inputStatusResults;

  return {
    reflectionHandoff: summarizeInputStatus(handoffResult),
    reflectionEvaluator: summarizeInputStatus(reflectionResult, {
      aggregateStatus: reflectionResult.payload?.aggregate?.status || null,
    }),
    proposalQueue: summarizeInputStatus(proposalQueueResult),
  };
}

function statusResultSucceeded(result) {
  return result.ok === true;
}

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

function readCurrentHead() {
  return {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  };
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

function collectStatusOutput(result) {
  return {
    stdout: result.stdout?.trim() || '',
    stderr: result.stderr?.trim() || '',
  };
}

function parseStatusPayload(statusOutput) {
  try {
    return JSON.parse(statusOutput.stdout || statusOutput.stderr);
  } catch (_error) {
    return null;
  }
}

function runStatusScript(relativePath) {
  const result = spawnSync(process.execPath, [path.join(repoRoot, relativePath)], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 30 * 1024 * 1024,
  });
  const statusOutput = collectStatusOutput(result);
  const payload = parseStatusPayload(statusOutput);

  return {
    path: relativePath,
    ok: result.status === 0 && payload?.ok === true,
    status: result.status,
    stdout: statusOutput.stdout,
    stderr: statusOutput.stderr,
    payload,
  };
}

function runInputStatusScripts() {
  return {
    handoffResult: runStatusScript(INPUT_STATUS_SCRIPT_PATHS.reflectionHandoff),
    reflectionResult: runStatusScript(INPUT_STATUS_SCRIPT_PATHS.reflectionEvaluator),
    proposalQueueResult: runStatusScript(INPUT_STATUS_SCRIPT_PATHS.proposalQueue),
  };
}

function collectSourceSummaryTexts(sources) {
  return {
    plan: sourceText(sources, 'docs/18_growth-gateway-vnext.md'),
    inventory: sourceText(sources, 'docs/22_completion-gate-inventory.md'),
    todo: sourceText(sources, 'tasks/todo.md'),
    lessons: sourceText(sources, 'tasks/lessons.md'),
    verificationStatus: sourceText(sources, 'scripts/verification_status.mjs'),
    engine: sourceText(sources, 'scripts/growth-engine-status.mjs'),
    reflection: sourceText(sources, 'scripts/growth-reflection-evaluator.mjs'),
  };
}

function proposalReadinessStatusIsDocumented(sourceSummaryTexts) {
  return (
    SOURCE_SUMMARY_MARKERS.planDocumentsProposalReadiness.test(sourceSummaryTexts.plan) &&
    SOURCE_SUMMARY_MARKERS.inventoryDocumentsProposalReadiness.test(sourceSummaryTexts.inventory)
  );
}

function proposalReadinessStatusAggregateIsRegistered(sourceSummaryTexts) {
  return SOURCE_SUMMARY_MARKERS.aggregateRegistersProposalReadiness.test(
    sourceSummaryTexts.verificationStatus,
  );
}

function proposalReadinessStatusIsLedgered(sourceSummaryTexts) {
  return SOURCE_SUMMARY_MARKERS.ledgerCapturesProposalReadiness.test(sourceSummaryTexts.todo);
}

function proposalReadinessLessonIsCaptured(sourceSummaryTexts) {
  return (
    SOURCE_SUMMARY_MARKERS.lessonCapturesProposalReadiness.test(sourceSummaryTexts.lessons) ||
    SOURCE_SUMMARY_MARKERS.lessonCapturesQueueMutationBoundary.test(sourceSummaryTexts.lessons)
  );
}

function engineHasAdvancedPastProposalReadiness(sourceSummaryTexts) {
  return SOURCE_SUMMARY_MARKERS.routesPastProposalReadiness.test(sourceSummaryTexts.engine);
}

function reflectionHasAdvancedPastProposalReadiness(sourceSummaryTexts) {
  return SOURCE_SUMMARY_MARKERS.routesPastProposalReadiness.test(sourceSummaryTexts.reflection);
}

function defaultBacklogIsClosed(sourceSummaryTexts) {
  return !SOURCE_SUMMARY_MARKERS.openTodoCheckbox.test(sourceSummaryTexts.todo);
}

function summarizeSources(sources) {
  const sourceSummaryTexts = collectSourceSummaryTexts(sources);

  return {
    sourceCount: sources.length,
    availableSourceCount: sources.filter((source) => source.exists).length,
    proposalReadinessStatusDocumented: proposalReadinessStatusIsDocumented(sourceSummaryTexts),
    proposalReadinessStatusAggregateRegistered:
      proposalReadinessStatusAggregateIsRegistered(sourceSummaryTexts),
    proposalReadinessStatusLedgered: proposalReadinessStatusIsLedgered(sourceSummaryTexts),
    proposalReadinessLessonCaptured: proposalReadinessLessonIsCaptured(sourceSummaryTexts),
    engineRoutesPastProposalReadiness: engineHasAdvancedPastProposalReadiness(sourceSummaryTexts),
    reflectionRoutesPastProposalReadiness:
      reflectionHasAdvancedPastProposalReadiness(sourceSummaryTexts),
    noDefaultBacklogOpen: defaultBacklogIsClosed(sourceSummaryTexts),
  };
}

function readSourceBundle() {
  const sources = SOURCE_FILES.map(readSource);

  return {
    missingSources: sources.filter((source) => !source.exists).map((source) => source.path),
    sourceSummary: summarizeSources(sources),
  };
}

function buildReadinessEnvelope({ handoffPayload, reflectionPayload, proposalQueuePayload }) {
  const {
    primaryFinding,
    handoffBindings,
    sourceRefs,
    proposalQueueReadiness,
    availableEvidenceTypeSet,
  } = collectReadinessEnvelopeInputs({
    handoffPayload,
    reflectionPayload,
    proposalQueuePayload,
  });

  return {
    requiredFields: PROPOSAL_READINESS_FIELDS,
    candidateKinds: CANDIDATE_KINDS,
    readinessStatuses: READINESS_STATUSES,
    requiredEvidenceMap: REQUIRED_EVIDENCE_MAP,
    candidateEnvelope: buildCandidateEnvelope({
      primaryFinding,
      handoffBindings,
      sourceRefs,
    }),
    queueCompatibility: buildQueueCompatibility({
      proposalQueueReadiness,
      availableEvidenceTypeSet,
    }),
  };
}

function buildReadiness({
  sourceSummary,
  inputStatusResults,
  readinessEnvelope,
}) {
  const { candidateEnvelope, queueCompatibility } = readinessEnvelope;
  const { handoffResult, reflectionResult, proposalQueueResult } = inputStatusResults;
  const reflectionAggregateStatus = reflectionResult.payload?.aggregate?.status;
  const proposalQueueReadiness = proposalQueueResult.payload?.readiness;

  return {
    reflectionHandoffReady:
      statusResultSucceeded(handoffResult) &&
      handoffResult.payload?.readiness?.handoffBindingsDefined === true,
    reflectionEvaluatorReady:
      statusResultSucceeded(reflectionResult) &&
      PREFERRED_REFLECTION_READY_STATUS_SET.has(reflectionAggregateStatus),
    proposalQueueContractReady:
      statusResultSucceeded(proposalQueueResult) &&
      proposalQueueStaysReadOnlyAndReady(proposalQueueReadiness),
    candidateEnvelopeDefined:
      candidateEnvelopeHasRequiredFields(candidateEnvelope) &&
      candidateEnvelopeHasRequiredRefs(candidateEnvelope),
    requiredEvidenceTypesMapped: queueCompatibility.requiredEvidenceTypesCovered,
    docsAndAggregateReady: docsAndAggregateAreReady(sourceSummary),
    engineReflectionAdvanced: engineAndReflectionHaveAdvanced(sourceSummary),
    ...READINESS_BLOCKED_AUTHORITY_FLAGS,
  };
}

function buildStatusPayload({
  missingSources,
  sourceSummary,
  inputStatusResults,
  readinessEnvelope,
  readiness,
}) {
  const { handoffResult, reflectionResult, proposalQueueResult } = inputStatusResults;

  return {
    ok: proposalReadinessStatusIsReady({ missingSources, readiness }),
    mode: STATUS_MODE,
    posture: STATUS_POSTURE,
    schemaVersion: STATUS_SCHEMA_VERSION,
    currentHead: readCurrentHead(),
    sourceSummary,
    inputStatuses: buildInputStatuses(inputStatusResults),
    readinessEnvelope,
    readiness,
    nextRecommendedSlice: NEXT_RECOMMENDED_SLICE,
    safetyBoundary: READ_ONLY_SAFETY_BOUNDARY,
    failures: {
      missingSources,
      reflectionHandoffFailed: !statusResultSucceeded(handoffResult),
      reflectionEvaluatorFailed: !statusResultSucceeded(reflectionResult),
      proposalQueueFailed: !statusResultSucceeded(proposalQueueResult),
    },
  };
}

function buildStatusPayloadFromBundles({ sourceBundle, inputStatusResults }) {
  const { missingSources, sourceSummary } = sourceBundle;
  const { handoffResult, reflectionResult, proposalQueueResult } = inputStatusResults;
  const readinessEnvelope = buildReadinessEnvelope({
    handoffPayload: handoffResult.payload,
    reflectionPayload: reflectionResult.payload,
    proposalQueuePayload: proposalQueueResult.payload,
  });
  const readiness = buildReadiness({
    sourceSummary,
    inputStatusResults,
    readinessEnvelope,
  });

  return buildStatusPayload({
    missingSources,
    sourceSummary,
    inputStatusResults,
    readinessEnvelope,
    readiness,
  });
}

function emitStatusPayload(payload) {
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exitCode = payload.ok ? 0 : 1;
}

function emitCurrentStatusPayload() {
  emitStatusPayload(
    buildStatusPayloadFromBundles({
      sourceBundle: readSourceBundle(),
      inputStatusResults: runInputStatusScripts(),
    }),
  );
}

emitCurrentStatusPayload();
