import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-readiness-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs',
  'scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const RECORD_READINESS_FIELDS = [
  'readinessId',
  'sourceHandoffId',
  'targetQueueContract',
  'targetSchema',
  'fieldReadiness',
  'previewOnlyRecordShape',
  'missingRecordCreationFields',
  'blockedActions',
  'reviewQuestion',
  'nonRecordStatement',
];

const FIELD_READINESS_STATUS = [
  'mapped-review-input',
  'preview-only',
  'forced-false',
  'blocked-until-record-creation',
];

const BLOCKED_UNTIL_RECORD_CREATION = ['proposalId', 'status', 'createdAt'];

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
    proposalRecordReadinessStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-readiness-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record readiness status/.test(inventory),
    proposalRecordReadinessStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-readiness-status/.test(verificationStatus),
    proposalRecordReadinessStatusLedgered:
      /growth-evidence-ledger-proposal-record-readiness-status-readonly-post-m7/.test(todo),
    proposalRecordReadinessLessonCaptured:
      /proposal record readiness.*record creation/i.test(lessons) ||
      /record creation.*proposal record readiness/i.test(lessons),
    engineRoutesPastProposalRecordReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-review-gate/.test(
        engine,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-creation-readiness/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-review-gate/.test(
        reflection,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-creation-readiness/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function classifyField({ field, handoffEnvelope }) {
  const fieldBinding = handoffEnvelope.queueFieldBindings?.find(
    (binding) => binding.queueField === field,
  );

  if (fieldBinding) {
    return {
      field,
      status: field === 'applyAllowed' ? 'forced-false' : 'mapped-review-input',
      source: fieldBinding.handoffSource,
      recordValueAssigned: false,
      note:
        field === 'applyAllowed'
          ? 'applyAllowed stays false because this slice cannot apply proposals or mutate source'
          : 'field can be reviewed from handoff input but is not persisted as a proposal record',
    };
  }

  if (BLOCKED_UNTIL_RECORD_CREATION.includes(field)) {
    return {
      field,
      status: 'blocked-until-record-creation',
      source: 'future-explicit-record-creation-slice',
      recordValueAssigned: false,
      note: 'field must stay absent until a future approved slice is allowed to create a proposal record',
    };
  }

  if (field === 'title') {
    return {
      field,
      status: 'preview-only',
      source: 'handoff review summary',
      recordValueAssigned: false,
      previewValue: 'Review Growth Evidence Ledger proposal handoff as a queue record candidate',
      note: 'title is preview-only and is not persisted as a proposal record title',
    };
  }

  if (field === 'proposalType') {
    return {
      field,
      status: 'preview-only',
      source: 'risk-class-to-proposal-type preview',
      recordValueAssigned: false,
      previewValue: handoffEnvelope.riskClass === 'smoke-only' ? 'smoke-guard' : 'documentation',
      note: 'proposalType is preview-only until human review accepts the record shape',
    };
  }

  return {
    field,
    status: 'blocked-until-record-creation',
    source: 'unmapped-required-field',
    recordValueAssigned: false,
    note: 'unmapped required fields block proposal record readiness',
  };
}

function buildRecordReadinessEnvelope({ queueHandoffPayload, proposalQueuePayload }) {
  const handoffEnvelope = queueHandoffPayload?.queueHandoffEnvelope?.handoffEnvelope || {};
  const proposalRecordSchema = proposalQueuePayload?.proposalSchema?.proposalRecord || {};
  const requiredProposalFields = proposalRecordSchema.required || [];
  const optionalProposalFields = proposalRecordSchema.optional || [];
  const fieldReadiness = requiredProposalFields.map((field) =>
    classifyField({ field, handoffEnvelope }),
  );
  const missingRecordCreationFields = fieldReadiness
    .filter((entry) => entry.status === 'blocked-until-record-creation')
    .map((entry) => entry.field);
  const blockedActions = [
    ...new Set([
      ...(handoffEnvelope.blockedActions || []),
      'assign-proposal-id',
      'assign-proposal-status',
      'persist-proposal-created-at',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];

  return {
    requiredFields: RECORD_READINESS_FIELDS,
    readinessStatuses: FIELD_READINESS_STATUS,
    recordContract: {
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      requiredProposalFields,
      optionalProposalFields,
    },
    recordReadinessEnvelope: {
      readinessId: 'growth-evidence-ledger-proposal-record-readiness-candidate',
      sourceHandoffId: handoffEnvelope.handoffId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      fieldReadiness,
      previewOnlyRecordShape: {
        title: 'Review Growth Evidence Ledger proposal handoff as a queue record candidate',
        proposalType: handoffEnvelope.riskClass === 'smoke-only' ? 'smoke-guard' : 'documentation',
        sourceClaimIds: handoffEnvelope.sourceFindingId ? [handoffEnvelope.sourceFindingId] : [],
        evidenceRefs: handoffEnvelope.evidenceRefs || [],
        negativeEvidenceRefs: handoffEnvelope.negativeEvidenceRefs || [],
        affectedFiles: handoffEnvelope.sourceRefs || [],
        riskClass: handoffEnvelope.riskClass || 'smoke-only',
        reviewQuestion:
          'Are the mapped handoff fields complete enough for a future explicit proposal record review gate?',
        verificationPlan: {
          commands: [
            'node scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs',
            'node scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
            'node scripts/growth-proposal-queue-status.mjs',
          ],
          expectedSignals: ['record-readiness-only', 'no-proposal-record-created'],
          failureStopCondition:
            'missing field readiness, queue mutation permission, or proposal record persistence attempt',
        },
        applyAllowed: false,
      },
      missingRecordCreationFields,
      blockedActions,
      reviewQuestion:
        'Can the queue handoff input satisfy proposal record review readiness while proposalId, status, and createdAt remain unassigned?',
      nonRecordStatement:
        'Proposal record readiness is a preview-only field check; it is not a proposal record, queue item, approval, durable persistence event, implementation slice, or source mutation request.',
    },
    compatibility: {
      allRequiredFieldsAccountedFor:
        fieldReadiness.length === requiredProposalFields.length &&
        fieldReadiness.every((entry) => FIELD_READINESS_STATUS.includes(entry.status)),
      noProposalRecordIdentityAssigned: missingRecordCreationFields.includes('proposalId'),
      noProposalRecordStatusAssigned: missingRecordCreationFields.includes('status'),
      noProposalRecordCreatedAtAssigned: missingRecordCreationFields.includes('createdAt'),
      previewKeepsApplyAllowedFalse: true,
    },
  };
}

function buildReadiness({
  sourceSummary,
  queueHandoffResult,
  proposalQueueResult,
  recordReadinessEnvelope,
}) {
  const envelope = recordReadinessEnvelope.recordReadinessEnvelope;

  return {
    proposalQueueHandoffReady:
      queueHandoffResult.ok &&
      queueHandoffResult.payload?.readiness?.queueHandoffEnvelopeDefined === true &&
      queueHandoffResult.payload?.readiness?.proposalRecordCreationAllowed === false &&
      queueHandoffResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    proposalRecordReadinessEnvelopeDefined:
      RECORD_READINESS_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      envelope.fieldReadiness.length >= 14 &&
      envelope.previewOnlyRecordShape.applyAllowed === false,
    allRequiredFieldsAccountedFor:
      recordReadinessEnvelope.compatibility.allRequiredFieldsAccountedFor,
    proposalRecordIdentityBlocked:
      recordReadinessEnvelope.compatibility.noProposalRecordIdentityAssigned &&
      recordReadinessEnvelope.compatibility.noProposalRecordStatusAssigned &&
      recordReadinessEnvelope.compatibility.noProposalRecordCreatedAtAssigned,
    docsAndAggregateReady:
      sourceSummary.proposalRecordReadinessStatusDocumented &&
      sourceSummary.proposalRecordReadinessStatusAggregateRegistered &&
      sourceSummary.proposalRecordReadinessStatusLedgered &&
      sourceSummary.proposalRecordReadinessLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordReadiness &&
      sourceSummary.reflectionRoutesPastProposalRecordReadiness,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
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
const queueHandoffResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-queue-handoff-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const recordReadinessEnvelope = buildRecordReadinessEnvelope({
  queueHandoffPayload: queueHandoffResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  queueHandoffResult,
  proposalQueueResult,
  recordReadinessEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.proposalQueueHandoffReady &&
  readiness.proposalQueueContractReady &&
  readiness.proposalRecordReadinessEnvelopeDefined &&
  readiness.allRequiredFieldsAccountedFor &&
  readiness.proposalRecordIdentityBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-readiness-status',
  posture: 'local-read-only-ledger-proposal-record-readiness',
  schemaVersion: 'growth-evidence-ledger-proposal-record-readiness-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalQueueHandoff: {
      path: queueHandoffResult.path,
      ok: queueHandoffResult.ok,
      status: queueHandoffResult.status,
      schemaVersion: queueHandoffResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  recordReadinessEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-review-gate',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'Proposal record fields are now classified as preview-only, mapped review input, forced false, or blocked until record creation; the next safe slice can define the human review gate without creating, approving, persisting, or mutating proposal records.',
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
    doesNotPersistProposalRecords: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalQueueHandoffFailed: !queueHandoffResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
