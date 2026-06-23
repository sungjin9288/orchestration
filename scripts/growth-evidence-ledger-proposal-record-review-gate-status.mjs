import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-review-gate-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs',
  'scripts/growth-proposal-queue-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const REVIEW_GATE_FIELDS = [
  'gateId',
  'sourceReadinessId',
  'targetQueueContract',
  'targetSchema',
  'requiredBefore',
  'requiredActor',
  'approvalPhrase',
  'reviewInputs',
  'reviewCriteria',
  'acceptedReviewStates',
  'rejectedReviewStates',
  'blockedActions',
  'escalationQuestion',
  'nonApprovalStatement',
];

const REVIEW_CRITERIA = [
  {
    id: 'field-readiness-complete',
    question: 'Are all required proposalRecord fields either mapped, preview-only, forced false, or explicitly blocked until record creation?',
    requiredEvidenceRef: 'growth-evidence-ledger-proposal-record-readiness-status',
  },
  {
    id: 'identity-fields-remain-blocked',
    question: 'Do proposalId, status, and createdAt remain unassigned before an explicit record-creation readiness slice?',
    requiredEvidenceRef: 'missingRecordCreationFields',
  },
  {
    id: 'apply-authority-remains-false',
    question: 'Does applyAllowed remain false and separate from review-gate readiness?',
    requiredEvidenceRef: 'previewOnlyRecordShape.applyAllowed',
  },
  {
    id: 'blocked-actions-preserved',
    question: 'Are proposal generation, approval, queue mutation, provider calls, runtime mutation, source mutation, commit, and push still blocked?',
    requiredEvidenceRef: 'blockedActions',
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
    proposalRecordReviewGateStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-review-gate-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record review gate status/.test(inventory),
    proposalRecordReviewGateStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-review-gate-status/.test(verificationStatus),
    proposalRecordReviewGateStatusLedgered:
      /growth-evidence-ledger-proposal-record-review-gate-status-readonly-post-m7/.test(todo),
    proposalRecordReviewGateLessonCaptured:
      /proposal record review gate.*record creation/i.test(lessons) ||
      /record creation.*proposal record review gate/i.test(lessons),
    engineRoutesPastProposalRecordReviewGate:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-creation-readiness/.test(
        engine,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-shape/.test(
        engine,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-validation/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordReviewGate:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-creation-readiness/.test(
        reflection,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-shape/.test(
        reflection,
      ) ||
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-validation/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildReviewGateEnvelope({ recordReadinessPayload, proposalQueuePayload }) {
  const readinessEnvelope =
    recordReadinessPayload?.recordReadinessEnvelope?.recordReadinessEnvelope || {};
  const approvalGateSchema = proposalQueuePayload?.proposalSchema?.approvalGate || {};
  const blockedActions = [
    ...new Set([
      ...(readinessEnvelope.blockedActions || []),
      'accept-review-gate-as-approval',
      'create-proposal-record',
      'persist-proposal-record',
      'assign-proposal-id',
      'assign-proposal-status',
      'persist-proposal-created-at',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];

  return {
    requiredFields: REVIEW_GATE_FIELDS,
    approvalGateContract: {
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'approvalGate',
      requiredApprovalGateFields: approvalGateSchema.required || [],
      optionalApprovalGateFields: approvalGateSchema.optional || [],
    },
    reviewGateEnvelope: {
      gateId: 'growth-evidence-ledger-proposal-record-review-gate',
      sourceReadinessId: readinessEnvelope.readinessId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'approvalGate',
      requiredBefore: 'proposal-record-creation-readiness',
      requiredActor: 'operator',
      approvalPhrase: 'review-only: proposal record creation still blocked',
      reviewInputs: {
        fieldReadiness: readinessEnvelope.fieldReadiness || [],
        previewOnlyRecordShape: readinessEnvelope.previewOnlyRecordShape || {},
        missingRecordCreationFields: readinessEnvelope.missingRecordCreationFields || [],
        sourceHandoffId: readinessEnvelope.sourceHandoffId || null,
      },
      reviewCriteria: REVIEW_CRITERIA,
      acceptedReviewStates: ['review-ready-for-creation-readiness-check'],
      rejectedReviewStates: ['needs-more-evidence', 'identity-fields-not-blocked', 'apply-authority-leaked'],
      blockedActions,
      escalationQuestion:
        'Can the operator review this preview-only proposal record shape without granting creation, persistence, queue mutation, approval, or implementation authority?',
      nonApprovalStatement:
        'The proposal record review gate is a human review boundary only; it is not proposal approval, proposal record creation, queue persistence, implementation authorization, or source mutation authority.',
    },
    compatibility: {
      requiredApprovalGateFieldsMapped:
        (approvalGateSchema.required || []).every((field) =>
          ['gateId', 'requiredBefore', 'requiredActor', 'approvalPhrase', 'blockedActions'].includes(
            field,
          ),
        ),
      sourceReadinessPreserved: Boolean(readinessEnvelope.readinessId),
      identityFieldsStillMissing: ['proposalId', 'status', 'createdAt'].every((field) =>
        (readinessEnvelope.missingRecordCreationFields || []).includes(field),
      ),
      applyAllowedStillFalse: readinessEnvelope.previewOnlyRecordShape?.applyAllowed === false,
      creationBlocked:
        blockedActions.includes('create-proposal-record') &&
        blockedActions.includes('persist-proposal-record') &&
        blockedActions.includes('assign-proposal-id'),
    },
  };
}

function buildReadiness({
  sourceSummary,
  recordReadinessResult,
  proposalQueueResult,
  reviewGateEnvelope,
}) {
  const envelope = reviewGateEnvelope.reviewGateEnvelope;

  return {
    proposalRecordReadinessReady:
      recordReadinessResult.ok &&
      recordReadinessResult.payload?.readiness?.proposalRecordReadinessEnvelopeDefined === true &&
      recordReadinessResult.payload?.readiness?.proposalRecordCreationAllowed === false &&
      recordReadinessResult.payload?.readiness?.proposalRecordPersistenceAllowed === false,
    proposalQueueContractReady:
      proposalQueueResult.ok &&
      proposalQueueResult.payload?.readiness?.readyForHumanReviewContract === true &&
      proposalQueueResult.payload?.readiness?.proposalGenerationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalApplicationAllowed === false &&
      proposalQueueResult.payload?.readiness?.proposalQueueMutationAllowed === false,
    reviewGateEnvelopeDefined:
      REVIEW_GATE_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      envelope.reviewCriteria.length >= 4 &&
      envelope.reviewInputs.missingRecordCreationFields.includes('proposalId'),
    requiredApprovalGateFieldsMapped:
      reviewGateEnvelope.compatibility.requiredApprovalGateFieldsMapped,
    reviewGateBlocksCreation:
      reviewGateEnvelope.compatibility.identityFieldsStillMissing &&
      reviewGateEnvelope.compatibility.applyAllowedStillFalse &&
      reviewGateEnvelope.compatibility.creationBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordReviewGateStatusDocumented &&
      sourceSummary.proposalRecordReviewGateStatusAggregateRegistered &&
      sourceSummary.proposalRecordReviewGateStatusLedgered &&
      sourceSummary.proposalRecordReviewGateLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordReviewGate &&
      sourceSummary.reflectionRoutesPastProposalRecordReviewGate,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
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
const recordReadinessResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-readiness-status.mjs',
);
const proposalQueueResult = runStatusScript('scripts/growth-proposal-queue-status.mjs');
const reviewGateEnvelope = buildReviewGateEnvelope({
  recordReadinessPayload: recordReadinessResult.payload,
  proposalQueuePayload: proposalQueueResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  recordReadinessResult,
  proposalQueueResult,
  reviewGateEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.proposalRecordReadinessReady &&
  readiness.proposalQueueContractReady &&
  readiness.reviewGateEnvelopeDefined &&
  readiness.requiredApprovalGateFieldsMapped &&
  readiness.reviewGateBlocksCreation &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-review-gate-status',
  posture: 'local-read-only-ledger-proposal-record-review-gate',
  schemaVersion: 'growth-evidence-ledger-proposal-record-review-gate-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordReadiness: {
      path: recordReadinessResult.path,
      ok: recordReadinessResult.ok,
      status: recordReadinessResult.status,
      schemaVersion: recordReadinessResult.payload?.schemaVersion || null,
    },
    proposalQueue: {
      path: proposalQueueResult.path,
      ok: proposalQueueResult.ok,
      status: proposalQueueResult.status,
      schemaVersion: proposalQueueResult.payload?.schemaVersion || null,
    },
  },
  reviewGateEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-creation-readiness',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-review-gate-status.mjs && node scripts/growth-proposal-queue-status.mjs',
    reason:
      'The proposal record review gate is defined as read-only review evidence only; the next safe slice can check proposal record creation readiness without creating, approving, persisting, or mutating proposal records.',
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
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordReadinessFailed: !recordReadinessResult.ok,
    proposalQueueFailed: !proposalQueueResult.ok,
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
