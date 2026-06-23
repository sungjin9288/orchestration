import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-creation-readiness-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const CREATION_READINESS_FIELDS = [
  'creationReadinessId',
  'sourceReviewGateId',
  'targetQueueContract',
  'targetSchema',
  'requiredReviewState',
  'creationPrerequisites',
  'creationFieldPolicies',
  'dryRunOnlyRecordShape',
  'missingCreationAuthority',
  'blockedActions',
  'creationQuestion',
  'nonCreationStatement',
];

const CREATION_POLICY_FIELDS = ['proposalId', 'status', 'createdAt'];

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
    proposalRecordCreationReadinessStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-creation-readiness-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record creation readiness status/.test(inventory),
    proposalRecordCreationReadinessStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-creation-readiness-status/.test(verificationStatus),
    proposalRecordCreationReadinessStatusLedgered:
      /growth-evidence-ledger-proposal-record-creation-readiness-status-readonly-post-m7/.test(
        todo,
      ),
    proposalRecordCreationReadinessLessonCaptured:
      /proposal record creation readiness.*dry-run/i.test(lessons) ||
      /dry-run.*proposal record creation readiness/i.test(lessons),
    engineRoutesPastProposalRecordCreationReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-shape/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordCreationReadiness:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-shape/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildCreationReadinessEnvelope({ reviewGatePayload, proposalQueuePayload }) {
  const reviewGateEnvelope = reviewGatePayload?.reviewGateEnvelope?.reviewGateEnvelope || {};
  const proposalRecordSchema = proposalQueuePayload?.proposalSchema?.proposalRecord || {};
  const previewShape = reviewGateEnvelope.reviewInputs?.previewOnlyRecordShape || {};
  const missingCreationFields = reviewGateEnvelope.reviewInputs?.missingRecordCreationFields || [];
  const blockedActions = [
    ...new Set([
      ...(reviewGateEnvelope.blockedActions || []),
      'generate-proposal-id',
      'assign-proposal-id',
      'assign-proposal-status',
      'persist-proposal-created-at',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const creationFieldPolicies = CREATION_POLICY_FIELDS.map((field) => ({
    field,
    requiredByProposalRecord: (proposalRecordSchema.required || []).includes(field),
    readinessStatus: missingCreationFields.includes(field)
      ? 'policy-defined-value-not-assigned'
      : 'missing-from-review-gate-input',
    valueAssigned: false,
    persistenceAllowed: false,
    source:
      field === 'proposalId'
        ? 'future-explicit-id-generation-slice'
        : field === 'status'
          ? 'future-explicit-initial-status-selection-slice'
          : 'future-explicit-created-at-stamping-slice',
    allowedFutureShape:
      field === 'proposalId'
        ? 'stable proposal id generated only inside a later approved record creation slice'
        : field === 'status'
          ? 'initial candidate status selected only inside a later approved record creation slice'
          : 'createdAt timestamp captured only inside a later approved record creation slice',
  }));

  return {
    requiredFields: CREATION_READINESS_FIELDS,
    creationPolicyFields: CREATION_POLICY_FIELDS,
    proposalRecordContract: {
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      requiredProposalFields: proposalRecordSchema.required || [],
      optionalProposalFields: proposalRecordSchema.optional || [],
    },
    creationReadinessEnvelope: {
      creationReadinessId: 'growth-evidence-ledger-proposal-record-creation-readiness-candidate',
      sourceReviewGateId: reviewGateEnvelope.gateId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      requiredReviewState: 'review-ready-for-creation-readiness-check',
      creationPrerequisites: [
        'review-gate-evidence-present',
        'identity-field-policy-defined',
        'initial-status-policy-defined',
        'created-at-policy-defined',
        'dry-run-shape-required-before-persistence',
      ],
      creationFieldPolicies,
      dryRunOnlyRecordShape: {
        ...previewShape,
        proposalId: null,
        status: null,
        createdAt: null,
        applyAllowed: false,
      },
      missingCreationAuthority: CREATION_POLICY_FIELDS,
      blockedActions,
      creationQuestion:
        'Are the identity, initial status, and timestamp policies explicit enough to design a dry-run proposal record shape without assigning or persisting them?',
      nonCreationStatement:
        'Proposal record creation readiness defines policy prerequisites only; it does not generate ids, assign status, stamp createdAt, create a proposal record, persist queue state, approve proposals, or authorize implementation.',
    },
    compatibility: {
      reviewGateReady:
        reviewGatePayload?.ok === true &&
        reviewGatePayload?.readiness?.reviewGateEnvelopeDefined === true &&
        reviewGatePayload?.readiness?.reviewGateBlocksCreation === true,
      allCreationPolicyFieldsCovered:
        creationFieldPolicies.length === CREATION_POLICY_FIELDS.length &&
        creationFieldPolicies.every(
          (policy) =>
            policy.requiredByProposalRecord &&
            policy.readinessStatus === 'policy-defined-value-not-assigned' &&
            policy.valueAssigned === false &&
            policy.persistenceAllowed === false,
        ),
      dryRunShapeDoesNotAssignIdentity:
        CREATION_POLICY_FIELDS.every(
          (field) => Object.hasOwn(previewShape, field) === false,
        ) &&
        CREATION_POLICY_FIELDS.every(
          (field) =>
            Object.hasOwn(
              {
                ...previewShape,
                proposalId: null,
                status: null,
                createdAt: null,
              },
              field,
            ),
        ),
      applyAllowedStillFalse: previewShape.applyAllowed === false,
      creationStillBlocked:
        blockedActions.includes('create-proposal-record') &&
        blockedActions.includes('persist-proposal-record') &&
        blockedActions.includes('assign-proposal-id'),
    },
  };
}

function buildReadiness({
  sourceSummary,
  reviewGateResult,
  proposalQueueResult,
  creationReadinessEnvelope,
}) {
  const envelope = creationReadinessEnvelope.creationReadinessEnvelope;

  return {
    proposalRecordReviewGateReady:
      reviewGateResult.ok &&
      reviewGateResult.payload?.readiness?.reviewGateEnvelopeDefined === true &&
      reviewGateResult.payload?.readiness?.proposalRecordCreationAllowed === false &&
      reviewGateResult.payload?.readiness?.approvalAllowed === false,
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    creationReadinessEnvelopeDefined:
      CREATION_READINESS_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      envelope.creationFieldPolicies.length === CREATION_POLICY_FIELDS.length &&
      envelope.missingCreationAuthority.length === CREATION_POLICY_FIELDS.length,
    allCreationPolicyFieldsCovered:
      creationReadinessEnvelope.compatibility.allCreationPolicyFieldsCovered,
    creationStillBlocked:
      creationReadinessEnvelope.compatibility.reviewGateReady &&
      creationReadinessEnvelope.compatibility.dryRunShapeDoesNotAssignIdentity &&
      creationReadinessEnvelope.compatibility.applyAllowedStillFalse &&
      creationReadinessEnvelope.compatibility.creationStillBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordCreationReadinessStatusDocumented &&
      sourceSummary.proposalRecordCreationReadinessStatusAggregateRegistered &&
      sourceSummary.proposalRecordCreationReadinessStatusLedgered &&
      sourceSummary.proposalRecordCreationReadinessLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordCreationReadiness &&
      sourceSummary.reflectionRoutesPastProposalRecordCreationReadiness,
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
const reviewGateResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const creationReadinessEnvelope = buildCreationReadinessEnvelope({
  reviewGatePayload: reviewGateResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  reviewGateResult,
  proposalQueueResult,
  creationReadinessEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.proposalRecordReviewGateReady &&
  readiness.proposalQueueContractReady &&
  readiness.creationReadinessEnvelopeDefined &&
  readiness.allCreationPolicyFieldsCovered &&
  readiness.creationStillBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-creation-readiness-status',
  posture: 'local-read-only-ledger-proposal-record-creation-readiness',
  schemaVersion: 'growth-evidence-ledger-proposal-record-creation-readiness-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordReviewGate: {
      path: reviewGateResult.path,
      ok: reviewGateResult.ok,
      status: reviewGateResult.status,
      schemaVersion: reviewGateResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  creationReadinessEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-dry-run-shape',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'Proposal record creation policies are defined without assigning identity, status, or timestamps; the next safe slice can design a dry-run record shape without creating, approving, persisting, or mutating proposal records.',
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
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordReviewGateFailed: !reviewGateResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
