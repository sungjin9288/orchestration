import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-queue-handoff-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const QUEUE_HANDOFF_FIELDS = [
  'handoffId',
  'sourceCandidateId',
  'sourceFindingId',
  'targetQueueContract',
  'targetSchema',
  'queueFieldBindings',
  'intentionallyAbsentProposalFields',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'routeRefs',
  'sourceRefs',
  'verificationRefs',
  'blockedActions',
  'riskClass',
  'humanReviewQuestion',
  'nonRecordStatement',
];

const REQUIRED_QUEUE_BINDINGS = [
  {
    queueField: 'sourceClaimIds',
    handoffSource: 'candidateEnvelope.sourceFindingId',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'evidenceRefs',
    handoffSource: 'candidateEnvelope.evidenceRefs',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'negativeEvidenceRefs',
    handoffSource: 'candidateEnvelope.negativeEvidenceRefs',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'affectedFiles',
    handoffSource: 'candidateEnvelope.sourceRefs',
    bindingStatus: 'available-as-source-ref-only',
  },
  {
    queueField: 'riskClass',
    handoffSource: 'candidateEnvelope.riskClass',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'approvalGate',
    handoffSource: 'candidateEnvelope.blockedActions',
    bindingStatus: 'mapped-as-blocked-authority',
  },
  {
    queueField: 'reviewQuestion',
    handoffSource: 'candidateEnvelope.humanReviewQuestion',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'verificationPlan',
    handoffSource: 'candidateEnvelope.verificationRefs',
    bindingStatus: 'mapped-as-review-input',
  },
  {
    queueField: 'applyAllowed',
    handoffSource: 'safetyBoundary.doesNotApplyProposals',
    bindingStatus: 'forced-false',
  },
];

const INTENTIONALLY_ABSENT_PROPOSAL_FIELDS = [
  'proposalId',
  'title',
  'proposalType',
  'status',
  'createdAt',
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
    proposalQueueHandoffStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-queue-handoff-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal queue handoff status/.test(inventory),
    proposalQueueHandoffStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-queue-handoff-status/.test(verificationStatus),
    proposalQueueHandoffStatusLedgered:
      /growth-evidence-ledger-proposal-queue-handoff-status-readonly-post-m7/.test(todo),
    proposalQueueHandoffLessonCaptured:
      /queue handoff.*proposal record/i.test(lessons) ||
      /proposal record.*queue handoff/i.test(lessons),
    engineRoutesPastProposalQueueHandoff:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-readiness/.test(engine),
    reflectionRoutesPastProposalQueueHandoff:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-readiness/.test(reflection),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildQueueHandoffEnvelope({ proposalReadinessPayload, proposalQueuePayload }) {
  const candidateEnvelope = proposalReadinessPayload?.readinessEnvelope?.candidateEnvelope || {};
  const proposalRecordSchema = proposalQueuePayload?.proposalSchema?.proposalRecord || {};
  const requiredProposalFields = proposalRecordSchema.required || [];
  const optionalProposalFields = proposalRecordSchema.optional || [];
  const blockedActions = [
    ...new Set([
      ...(candidateEnvelope.blockedActions || []),
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];

  return {
    requiredFields: QUEUE_HANDOFF_FIELDS,
    queueRecordContract: {
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      requiredProposalFields,
      optionalProposalFields,
      queueMutationAllowed: proposalQueuePayload?.readiness?.proposalQueueMutationAllowed === true,
      proposalGenerationAllowed: proposalQueuePayload?.readiness?.proposalGenerationAllowed === true,
      proposalApplicationAllowed: proposalQueuePayload?.readiness?.proposalApplicationAllowed === true,
    },
    handoffEnvelope: {
      handoffId: 'growth-evidence-ledger-proposal-queue-handoff-candidate',
      sourceCandidateId: candidateEnvelope.candidateId || null,
      sourceFindingId: candidateEnvelope.sourceFindingId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      queueFieldBindings: REQUIRED_QUEUE_BINDINGS,
      intentionallyAbsentProposalFields: INTENTIONALLY_ABSENT_PROPOSAL_FIELDS,
      evidenceRefs: candidateEnvelope.evidenceRefs || [],
      negativeEvidenceRefs: candidateEnvelope.negativeEvidenceRefs || [],
      routeRefs: candidateEnvelope.routeRefs || [],
      sourceRefs: candidateEnvelope.sourceRefs || [],
      verificationRefs: [
        'node scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
        ...(candidateEnvelope.verificationRefs || []),
      ],
      blockedActions,
      riskClass: candidateEnvelope.riskClass || 'smoke-only',
      humanReviewQuestion:
        'Can this proposal-readiness envelope be reviewed as queue handoff input without creating, approving, applying, persisting, or mutating proposal records?',
      nonRecordStatement:
        'Queue handoff is review input only; it is not a proposal record, queue item, proposal approval, implementation slice, source mutation request, or hidden priority signal.',
    },
    compatibility: {
      requiredQueueBindingsPresent: REQUIRED_QUEUE_BINDINGS.every((binding) =>
        requiredProposalFields.includes(binding.queueField),
      ),
      intentionallyAbsentFieldsAreRequired: INTENTIONALLY_ABSENT_PROPOSAL_FIELDS.every((field) =>
        requiredProposalFields.includes(field),
      ),
      noProposalRecordCreated: true,
      noQueueMutationRequested: true,
      handoffKeepsApplyAllowedFalse: true,
    },
  };
}

function buildReadiness({
  sourceSummary,
  proposalReadinessResult,
  proposalQueueResult,
  queueHandoffEnvelope,
}) {
  const envelope = queueHandoffEnvelope.handoffEnvelope;

  return {
    proposalReadinessReady:
      proposalReadinessResult.ok &&
      proposalReadinessResult.payload?.readiness?.candidateEnvelopeDefined === true &&
      proposalReadinessResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalReadinessResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalReadinessResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    queueHandoffEnvelopeDefined:
      QUEUE_HANDOFF_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      envelope.queueFieldBindings.length >= 9 &&
      envelope.intentionallyAbsentProposalFields.length >= 5 &&
      envelope.verificationRefs.length >= 4,
    proposalRecordCreationBlocked:
      envelope.blockedActions.includes('create-proposal-record') &&
      envelope.blockedActions.includes('persist-proposal-record') &&
      envelope.blockedActions.includes('mutate-proposal-queue'),
    requiredQueueBindingsPresent: queueHandoffEnvelope.compatibility.requiredQueueBindingsPresent,
    intentionallyAbsentRecordFieldsPinned:
      queueHandoffEnvelope.compatibility.intentionallyAbsentFieldsAreRequired,
    docsAndAggregateReady:
      sourceSummary.proposalQueueHandoffStatusDocumented &&
      sourceSummary.proposalQueueHandoffStatusAggregateRegistered &&
      sourceSummary.proposalQueueHandoffStatusLedgered &&
      sourceSummary.proposalQueueHandoffLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalQueueHandoff &&
      sourceSummary.reflectionRoutesPastProposalQueueHandoff,
    proposalRecordCreationAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
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
const proposalReadinessResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const queueHandoffEnvelope = buildQueueHandoffEnvelope({
  proposalReadinessPayload: proposalReadinessResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  proposalReadinessResult,
  proposalQueueResult,
  queueHandoffEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.proposalReadinessReady &&
  readiness.proposalQueueContractReady &&
  readiness.queueHandoffEnvelopeDefined &&
  readiness.proposalRecordCreationBlocked &&
  readiness.requiredQueueBindingsPresent &&
  readiness.intentionallyAbsentRecordFieldsPinned &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-queue-handoff-status',
  posture: 'local-read-only-ledger-proposal-queue-handoff',
  schemaVersion: 'growth-evidence-ledger-proposal-queue-handoff-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalReadiness: {
      path: proposalReadinessResult.path,
      ok: proposalReadinessResult.ok,
      status: proposalReadinessResult.status,
      schemaVersion: proposalReadinessResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  queueHandoffEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-readiness',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'Proposal-readiness evidence can now be handed to the queue contract as review input; the next safe slice can check proposal-record field readiness without creating, approving, applying, persisting, or mutating proposal records.',
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
    doesNotCreateProposalRecords: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalReadinessFailed: !proposalReadinessResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
