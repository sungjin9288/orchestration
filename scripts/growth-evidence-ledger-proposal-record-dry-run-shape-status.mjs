import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-dry-run-shape-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-shape-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const DRY_RUN_SHAPE_FIELDS = [
  'dryRunShapeId',
  'sourceCreationReadinessId',
  'targetQueueContract',
  'targetSchema',
  'shapePurpose',
  'schemaFieldCoverage',
  'recordShape',
  'unassignedCreationFields',
  'previewOnlyFields',
  'forcedFalseFields',
  'blockedActions',
  'validationQuestion',
  'nonCreationStatement',
];

const UNASSIGNED_CREATION_FIELDS = ['proposalId', 'status', 'createdAt'];
const FORCED_FALSE_FIELDS = ['applyAllowed'];
const REQUIRED_DRY_RUN_APPROVAL_GATE_FIELDS = [
  'gateId',
  'requiredBefore',
  'requiredActor',
  'approvalPhrase',
  'blockedActions',
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
    proposalRecordDryRunShapeStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-dry-run-shape-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record dry-run shape status/.test(inventory),
    proposalRecordDryRunShapeStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-dry-run-shape-status/.test(verificationStatus),
    proposalRecordDryRunShapeStatusLedgered:
      /growth-evidence-ledger-proposal-record-dry-run-shape-status-readonly-post-m7/.test(
        todo,
      ),
    proposalRecordDryRunShapeLessonCaptured:
      /proposal record dry-run shape.*proposalId.*status.*createdAt/i.test(lessons) ||
      /proposalId.*status.*createdAt.*proposal record dry-run shape/i.test(lessons),
    engineRoutesPastProposalRecordDryRunShape:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-validation/.test(
        engine,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordDryRunShape:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-validation/.test(
        reflection,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildFieldCoverage({ requiredFields, dryRunRecordShape }) {
  return requiredFields.map((field) => {
    const present = Object.hasOwn(dryRunRecordShape, field);
    const value = dryRunRecordShape[field];
    const unassigned = UNASSIGNED_CREATION_FIELDS.includes(field);
    const forcedFalse = FORCED_FALSE_FIELDS.includes(field);

    return {
      field,
      requiredByProposalRecord: true,
      present,
      valueSource: unassigned
        ? 'explicitly-unassigned-creation-field'
        : forcedFalse
          ? 'forced-false-safety-field'
          : field === 'approvalGate'
            ? 'dry-run-only-approval-gate-placeholder'
            : 'creation-readiness-preview',
      dryRunValueState: unassigned
        ? 'null-unassigned'
        : forcedFalse
          ? 'false-blocked'
          : value === null
            ? 'null-preview'
            : 'preview-value',
      persistenceAllowed: false,
      creationAuthorityGranted: false,
    };
  });
}

function buildDryRunShapeEnvelope({ creationReadinessPayload, proposalQueuePayload }) {
  const creationEnvelope =
    creationReadinessPayload?.creationReadinessEnvelope?.creationReadinessEnvelope || {};
  const proposalRecordSchema = proposalQueuePayload?.proposalSchema?.proposalRecord || {};
  const requiredFields = proposalRecordSchema.required || [];
  const previewShape = creationEnvelope.dryRunOnlyRecordShape || {};
  const blockedActions = [
    ...new Set([
      ...(creationEnvelope.blockedActions || []),
      'validate-proposal-record-before-creation',
      'persist-proposal-record-dry-run',
      'promote-dry-run-shape-to-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const dryRunRecordShape = {
    proposalId: null,
    title: previewShape.title || null,
    proposalType: previewShape.proposalType || null,
    status: null,
    createdAt: null,
    sourceClaimIds: Array.isArray(previewShape.sourceClaimIds)
      ? [...previewShape.sourceClaimIds]
      : [],
    evidenceRefs: Array.isArray(previewShape.evidenceRefs) ? [...previewShape.evidenceRefs] : [],
    negativeEvidenceRefs: Array.isArray(previewShape.negativeEvidenceRefs)
      ? [...previewShape.negativeEvidenceRefs]
      : [],
    affectedFiles: Array.isArray(previewShape.affectedFiles) ? [...previewShape.affectedFiles] : [],
    riskClass: previewShape.riskClass || null,
    approvalGate: {
      gateId: 'dry-run-only-approval-gate-placeholder',
      requiredBefore: 'proposal-record-creation',
      requiredActor: 'operator',
      approvalPhrase: null,
      blockedActions,
    },
    reviewQuestion: previewShape.reviewQuestion || null,
    verificationPlan: previewShape.verificationPlan || {
      commands: [],
      expectedSignals: [],
      failureStopCondition: null,
    },
    applyAllowed: false,
  };
  const schemaFieldCoverage = buildFieldCoverage({
    requiredFields,
    dryRunRecordShape,
  });

  return {
    requiredFields: DRY_RUN_SHAPE_FIELDS,
    proposalRecordContract: {
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      requiredProposalFields: requiredFields,
      optionalProposalFields: proposalRecordSchema.optional || [],
    },
    dryRunShapeEnvelope: {
      dryRunShapeId: 'growth-evidence-ledger-proposal-record-dry-run-shape-candidate',
      sourceCreationReadinessId: creationEnvelope.creationReadinessId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      shapePurpose:
        'Represent a complete proposalRecord-shaped dry-run candidate without assigning identity, status, timestamp, approval, persistence, or queue mutation authority.',
      schemaFieldCoverage,
      recordShape: dryRunRecordShape,
      unassignedCreationFields: UNASSIGNED_CREATION_FIELDS,
      previewOnlyFields: requiredFields.filter(
        (field) =>
          !UNASSIGNED_CREATION_FIELDS.includes(field) &&
          !FORCED_FALSE_FIELDS.includes(field) &&
          field !== 'approvalGate',
      ),
      forcedFalseFields: FORCED_FALSE_FIELDS,
      blockedActions,
      validationQuestion:
        'Does the dry-run proposal record shape cover every required proposalRecord field while keeping creation authority, persistence, queue mutation, and approval blocked?',
      nonCreationStatement:
        'Proposal record dry-run shape is schema-shaped evidence only; it does not create a proposal record, persist queue state, approve a proposal, assign proposalId/status/createdAt, or authorize implementation.',
    },
    compatibility: {
      creationReadinessReady:
        creationReadinessPayload?.ok === true &&
        creationReadinessPayload?.readiness?.creationReadinessEnvelopeDefined === true &&
        creationReadinessPayload?.readiness?.dryRunOnly === true &&
        creationReadinessPayload?.readiness?.proposalRecordCreationAllowed === false,
      requiredFieldsCovered:
        requiredFields.length > 0 &&
        schemaFieldCoverage.length === requiredFields.length &&
        schemaFieldCoverage.every((field) => field.present === true),
      creationFieldsRemainUnassigned: UNASSIGNED_CREATION_FIELDS.every(
        (field) => dryRunRecordShape[field] === null,
      ),
      approvalGateNonApproving:
        REQUIRED_DRY_RUN_APPROVAL_GATE_FIELDS.every((field) =>
          Object.hasOwn(dryRunRecordShape.approvalGate, field),
        ) &&
        dryRunRecordShape.approvalGate.approvalPhrase === null &&
        blockedActions.includes('approve-proposal'),
      applyAllowedStillFalse: dryRunRecordShape.applyAllowed === false,
      creationStillBlocked:
        blockedActions.includes('create-proposal-record') &&
        blockedActions.includes('persist-proposal-record') &&
        blockedActions.includes('mutate-proposal-queue') &&
        blockedActions.includes('approve-proposal'),
    },
  };
}

function buildReadiness({
  sourceSummary,
  creationReadinessResult,
  proposalQueueResult,
  dryRunShapeEnvelope,
}) {
  const envelope = dryRunShapeEnvelope.dryRunShapeEnvelope;

  return {
    creationReadinessReady:
      creationReadinessResult.ok &&
      creationReadinessResult.payload?.readiness?.creationReadinessEnvelopeDefined === true &&
      creationReadinessResult.payload?.readiness?.proposalRecordCreationAllowed === false &&
      creationReadinessResult.payload?.readiness?.dryRunOnly === true,
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    dryRunShapeEnvelopeDefined:
      DRY_RUN_SHAPE_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Object.hasOwn(envelope, 'recordShape') &&
      Array.isArray(envelope.schemaFieldCoverage),
    requiredFieldsCovered: dryRunShapeEnvelope.compatibility.requiredFieldsCovered,
    creationFieldsRemainUnassigned:
      dryRunShapeEnvelope.compatibility.creationFieldsRemainUnassigned,
    approvalGateNonApproving: dryRunShapeEnvelope.compatibility.approvalGateNonApproving,
    creationStillBlocked:
      dryRunShapeEnvelope.compatibility.creationReadinessReady &&
      dryRunShapeEnvelope.compatibility.applyAllowedStillFalse &&
      dryRunShapeEnvelope.compatibility.creationStillBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordDryRunShapeStatusDocumented &&
      sourceSummary.proposalRecordDryRunShapeStatusAggregateRegistered &&
      sourceSummary.proposalRecordDryRunShapeStatusLedgered &&
      sourceSummary.proposalRecordDryRunShapeLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordDryRunShape &&
      sourceSummary.reflectionRoutesPastProposalRecordDryRunShape,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
    dryRunOnly: true,
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
const creationReadinessResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const dryRunShapeEnvelope = buildDryRunShapeEnvelope({
  creationReadinessPayload: creationReadinessResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  creationReadinessResult,
  proposalQueueResult,
  dryRunShapeEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.creationReadinessReady &&
  readiness.proposalQueueContractReady &&
  readiness.dryRunShapeEnvelopeDefined &&
  readiness.requiredFieldsCovered &&
  readiness.creationFieldsRemainUnassigned &&
  readiness.approvalGateNonApproving &&
  readiness.creationStillBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-dry-run-shape-status',
  posture: 'local-read-only-ledger-proposal-record-dry-run-shape',
  schemaVersion: 'growth-evidence-ledger-proposal-record-dry-run-shape-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordCreationReadiness: {
      path: creationReadinessResult.path,
      ok: creationReadinessResult.ok,
      status: creationReadinessResult.status,
      schemaVersion: creationReadinessResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  dryRunShapeEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-dry-run-validation',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-dry-run-shape-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'A complete proposalRecord-shaped dry-run candidate now exists without creation authority; the next safe slice can validate that shape before any record creation, approval, persistence, or queue mutation.',
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
    doesNotGenerateProposalIds: true,
    doesNotAssignProposalStatus: true,
    doesNotStampCreatedAt: true,
    doesNotCreateProposalRecords: true,
    doesNotPersistProposalRecords: true,
    doesNotPromoteDryRunShapeToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordCreationReadinessFailed: !creationReadinessResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
