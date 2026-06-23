import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-dry-run-validation-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-validation-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-shape-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const VALIDATION_FIELDS = [
  'validationId',
  'sourceDryRunShapeId',
  'targetQueueContract',
  'targetSchema',
  'validationPurpose',
  'schemaRequiredFields',
  'schemaOptionalFields',
  'validationChecks',
  'validationResult',
  'blockedActions',
  'reviewQuestion',
  'nonPromotionStatement',
];

const UNASSIGNED_CREATION_FIELDS = ['proposalId', 'status', 'createdAt'];
const REQUIRED_APPROVAL_GATE_FIELDS = [
  'gateId',
  'requiredBefore',
  'requiredActor',
  'approvalPhrase',
  'blockedActions',
];
const REQUIRED_VERIFICATION_PLAN_FIELDS = [
  'commands',
  'expectedSignals',
  'failureStopCondition',
];
const REQUIRED_BLOCKED_ACTIONS = [
  'create-proposal-record',
  'persist-proposal-record',
  'mutate-proposal-queue',
  'approve-proposal',
  'promote-dry-run-shape-to-record',
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
    proposalRecordDryRunValidationStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-dry-run-validation-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record dry-run validation status/.test(inventory),
    proposalRecordDryRunValidationStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-dry-run-validation-status/.test(
        verificationStatus,
      ),
    proposalRecordDryRunValidationStatusLedgered:
      /growth-evidence-ledger-proposal-record-dry-run-validation-status-readonly-post-m7/.test(
        todo,
      ),
    proposalRecordDryRunValidationLessonCaptured:
      /proposal record dry-run validation.*durable proposal record/i.test(lessons) ||
      /durable proposal record.*proposal record dry-run validation/i.test(lessons),
    engineRoutesPastProposalRecordDryRunValidation:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordDryRunValidation:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildValidationChecks({ recordShape, schemaFieldCoverage, requiredFields, optionalFields }) {
  const recordFieldNames = Object.keys(recordShape || {});
  const coverageFields = new Set((schemaFieldCoverage || []).map((coverage) => coverage.field));
  const approvalGate = recordShape?.approvalGate || {};
  const verificationPlan = recordShape?.verificationPlan || {};
  const blockedActions = Array.isArray(approvalGate.blockedActions)
    ? approvalGate.blockedActions
    : [];
  const optionalFieldsWithAssignedValues = optionalFields.filter(
    (field) => Object.hasOwn(recordShape, field) && recordShape[field] !== null,
  );

  return [
    {
      id: 'required-fields-present-in-record-shape',
      ok:
        requiredFields.length > 0 &&
        requiredFields.every((field) => Object.hasOwn(recordShape, field)),
      expected: requiredFields,
      observed: recordFieldNames.filter((field) => requiredFields.includes(field)),
    },
    {
      id: 'required-fields-covered-by-schema-field-coverage',
      ok:
        schemaFieldCoverage.length === requiredFields.length &&
        requiredFields.every((field) => coverageFields.has(field)) &&
        schemaFieldCoverage.every(
          (coverage) =>
            coverage.present === true &&
            coverage.persistenceAllowed === false &&
            coverage.creationAuthorityGranted === false,
        ),
      expected: requiredFields,
      observed: [...coverageFields],
    },
    {
      id: 'creation-fields-remain-unassigned',
      ok: UNASSIGNED_CREATION_FIELDS.every((field) => recordShape?.[field] === null),
      expected: UNASSIGNED_CREATION_FIELDS.map((field) => ({ field, value: null })),
      observed: UNASSIGNED_CREATION_FIELDS.map((field) => ({ field, value: recordShape?.[field] })),
    },
    {
      id: 'apply-allowed-remains-false',
      ok: recordShape?.applyAllowed === false,
      expected: false,
      observed: recordShape?.applyAllowed,
    },
    {
      id: 'approval-gate-remains-non-approving',
      ok:
        REQUIRED_APPROVAL_GATE_FIELDS.every((field) => Object.hasOwn(approvalGate, field)) &&
        approvalGate.approvalPhrase === null &&
        blockedActions.includes('approve-proposal'),
      expected: {
        requiredFields: REQUIRED_APPROVAL_GATE_FIELDS,
        approvalPhrase: null,
        includesBlockedAction: 'approve-proposal',
      },
      observed: {
        fields: Object.keys(approvalGate),
        approvalPhrase: approvalGate.approvalPhrase,
        blockedActions,
      },
    },
    {
      id: 'blocked-actions-preserved',
      ok: REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
      expected: REQUIRED_BLOCKED_ACTIONS,
      observed: blockedActions.filter((action) => REQUIRED_BLOCKED_ACTIONS.includes(action)),
    },
    {
      id: 'verification-plan-required-fields-present',
      ok: REQUIRED_VERIFICATION_PLAN_FIELDS.every((field) =>
        Object.hasOwn(verificationPlan, field),
      ),
      expected: REQUIRED_VERIFICATION_PLAN_FIELDS,
      observed: Object.keys(verificationPlan),
    },
    {
      id: 'optional-durable-fields-absent-or-null',
      ok: optionalFieldsWithAssignedValues.length === 0,
      expected: 'optional proposalRecord fields absent or null in dry-run validation',
      observed: optionalFieldsWithAssignedValues,
    },
  ];
}

function buildValidationEnvelope({ dryRunShapePayload, proposalQueuePayload }) {
  const dryRunShape = dryRunShapePayload?.dryRunShapeEnvelope?.dryRunShapeEnvelope || {};
  const proposalRecordContract = dryRunShapePayload?.dryRunShapeEnvelope?.proposalRecordContract || {};
  const proposalRecordSchema = proposalQueuePayload?.proposalSchema?.proposalRecord || {};
  const requiredFields =
    proposalRecordContract.requiredProposalFields || proposalRecordSchema.required || [];
  const optionalFields =
    proposalRecordContract.optionalProposalFields || proposalRecordSchema.optional || [];
  const recordShape = dryRunShape.recordShape || {};
  const schemaFieldCoverage = dryRunShape.schemaFieldCoverage || [];
  const inheritedBlockedActions = Array.isArray(recordShape.approvalGate?.blockedActions)
    ? recordShape.approvalGate.blockedActions
    : [];
  const blockedActions = [
    ...new Set([
      ...inheritedBlockedActions,
      'validate-dry-run-shape-only',
      'promote-dry-run-validation-to-record',
      'persist-validated-proposal-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const validationChecks = buildValidationChecks({
    recordShape,
    schemaFieldCoverage,
    requiredFields,
    optionalFields,
  });
  const validationResult = validationChecks.every((check) => check.ok)
    ? 'valid-dry-run-shape-no-creation-authority'
    : 'invalid-dry-run-shape';

  return {
    requiredFields: VALIDATION_FIELDS,
    validationEnvelope: {
      validationId: 'growth-evidence-ledger-proposal-record-dry-run-validation-candidate',
      sourceDryRunShapeId: dryRunShape.dryRunShapeId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      validationPurpose:
        'Validate that the dry-run proposalRecord shape satisfies the queue schema while preserving null creation fields, false applyAllowed, non-approving approval gate, and blocked persistence or queue mutation authority.',
      schemaRequiredFields: requiredFields,
      schemaOptionalFields: optionalFields,
      validationChecks,
      validationResult,
      blockedActions,
      reviewQuestion:
        'Does the dry-run validation evidence prove schema coverage without promoting the candidate into a durable proposal record?',
      nonPromotionStatement:
        'Proposal record dry-run validation is read-only evidence only; it does not create, persist, approve, apply, or promote a proposal record or mutate the proposal queue.',
    },
    compatibility: {
      dryRunShapeReady:
        dryRunShapePayload?.ok === true &&
        dryRunShapePayload?.readiness?.dryRunShapeEnvelopeDefined === true &&
        dryRunShapePayload?.readiness?.dryRunOnly === true &&
        dryRunShapePayload?.readiness?.proposalRecordCreationAllowed === false,
      proposalQueueContractReady:
        proposalQueuePayload?.ok === true &&
        proposalQueuePayload?.readiness?.readyForHumanReviewContract === true &&
        proposalQueuePayload?.readiness?.proposalGenerationAllowed === false &&
        proposalQueuePayload?.readiness?.proposalApplicationAllowed === false &&
        proposalQueuePayload?.readiness?.proposalQueueMutationAllowed === false,
      validationChecksPassed: validationResult === 'valid-dry-run-shape-no-creation-authority',
      creationFieldsRemainUnassigned: UNASSIGNED_CREATION_FIELDS.every(
        (field) => recordShape?.[field] === null,
      ),
      applyAllowedFalse: recordShape?.applyAllowed === false,
      approvalGateNonApproving: recordShape?.approvalGate?.approvalPhrase === null,
      durableRecordPromotionBlocked: blockedActions.includes(
        'promote-dry-run-validation-to-record',
      ),
    },
  };
}

function buildReadiness({
  sourceSummary,
  dryRunShapeResult,
  proposalQueueResult,
  validationEnvelope,
}) {
  const envelope = validationEnvelope.validationEnvelope;

  return {
    dryRunShapeReady: validationEnvelope.compatibility.dryRunShapeReady,
    proposalQueueContractReady: validationEnvelope.compatibility.proposalQueueContractReady,
    validationEnvelopeDefined:
      VALIDATION_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Array.isArray(envelope.validationChecks) &&
      envelope.validationChecks.length >= 8,
    allValidationChecksPassed: validationEnvelope.compatibility.validationChecksPassed,
    creationFieldsRemainUnassigned:
      validationEnvelope.compatibility.creationFieldsRemainUnassigned,
    applyAllowedFalse: validationEnvelope.compatibility.applyAllowedFalse,
    approvalGateNonApproving: validationEnvelope.compatibility.approvalGateNonApproving,
    durableRecordPromotionBlocked:
      validationEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordDryRunValidationStatusDocumented &&
      sourceSummary.proposalRecordDryRunValidationStatusAggregateRegistered &&
      sourceSummary.proposalRecordDryRunValidationStatusLedgered &&
      sourceSummary.proposalRecordDryRunValidationLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordDryRunValidation &&
      sourceSummary.reflectionRoutesPastProposalRecordDryRunValidation,
    inputDryRunShapeStatusOk: dryRunShapeResult.ok,
    inputProposalQueueStatusOk: proposalQueueResult.ok,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
    validationOnly: true,
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
const dryRunShapeResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-dry-run-shape-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const validationEnvelope = buildValidationEnvelope({
  dryRunShapePayload: dryRunShapeResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  dryRunShapeResult,
  proposalQueueResult,
  validationEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.dryRunShapeReady &&
  readiness.proposalQueueContractReady &&
  readiness.validationEnvelopeDefined &&
  readiness.allValidationChecksPassed &&
  readiness.creationFieldsRemainUnassigned &&
  readiness.applyAllowedFalse &&
  readiness.approvalGateNonApproving &&
  readiness.durableRecordPromotionBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-dry-run-validation-status',
  posture: 'local-read-only-ledger-proposal-record-dry-run-validation',
  schemaVersion: 'growth-evidence-ledger-proposal-record-dry-run-validation-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordDryRunShape: {
      path: dryRunShapeResult.path,
      ok: dryRunShapeResult.ok,
      status: dryRunShapeResult.status,
      schemaVersion: dryRunShapeResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  validationEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-dry-run-validation-status.mjs',
    reason:
      'The dry-run proposalRecord candidate now validates against the queue schema without creation authority; the next safe slice should review validation evidence before any proposal record creation, persistence, approval, or queue mutation.',
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
    doesNotValidateAsApproval: true,
    doesNotGenerateProposalIds: true,
    doesNotAssignProposalStatus: true,
    doesNotStampCreatedAt: true,
    doesNotCreateProposalRecords: true,
    doesNotPersistProposalRecords: true,
    doesNotPromoteDryRunShapeToRecord: true,
    doesNotPromoteValidationToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordDryRunShapeFailed: !dryRunShapeResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
    failedValidationChecks: validationEnvelope.validationEnvelope.validationChecks
      .filter((check) => !check.ok)
      .map((check) => check.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
