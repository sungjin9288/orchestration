import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-dry-run-review-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-validation-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const REVIEW_FIELDS = [
  'reviewId',
  'sourceValidationId',
  'targetQueueContract',
  'targetSchema',
  'reviewPurpose',
  'reviewInputs',
  'reviewCriteria',
  'reviewFindings',
  'acceptedReviewStates',
  'rejectedReviewStates',
  'blockedActions',
  'acceptanceQuestion',
  'nonApprovalStatement',
];

const REVIEW_CRITERIA = [
  {
    id: 'validation-result-is-valid',
    question: 'Does the dry-run validation result prove schema coverage without creation authority?',
    requiredEvidenceRef: 'validationEnvelope.validationResult',
  },
  {
    id: 'all-validation-checks-passed',
    question: 'Did every required validation check pass without failed evidence gaps?',
    requiredEvidenceRef: 'validationEnvelope.validationChecks',
  },
  {
    id: 'creation-authority-remains-blocked',
    question: 'Are proposal id/status/timestamp assignment, creation, persistence, approval, and queue mutation still blocked?',
    requiredEvidenceRef: 'readiness and blockedActions',
  },
  {
    id: 'review-is-not-approval',
    question: 'Does the review evidence stay separate from proposal approval and implementation authority?',
    requiredEvidenceRef: 'safetyBoundary.doesNotValidateAsApproval',
  },
];

const REQUIRED_BLOCKED_ACTIONS = [
  'promote-dry-run-validation-to-record',
  'persist-validated-proposal-record',
  'create-proposal-record',
  'persist-proposal-record',
  'mutate-proposal-queue',
  'approve-proposal',
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
    proposalRecordDryRunReviewStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-dry-run-review-status`/.test(
        plan,
      ) && /Growth Evidence Ledger proposal record dry-run review status/.test(inventory),
    proposalRecordDryRunReviewStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-dry-run-review-status/.test(verificationStatus),
    proposalRecordDryRunReviewStatusLedgered:
      /growth-evidence-ledger-proposal-record-dry-run-review-status-readonly-post-m7/.test(
        todo,
      ),
    proposalRecordDryRunReviewLessonCaptured:
      /proposal record dry-run review.*proposal approval/i.test(lessons) ||
      /proposal approval.*proposal record dry-run review/i.test(lessons),
    engineRoutesPastProposalRecordDryRunReview:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordDryRunReview:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildReviewFindings({ validationPayload }) {
  const validation = validationPayload?.validationEnvelope?.validationEnvelope || {};
  const validationChecks = validation.validationChecks || [];
  const readiness = validationPayload?.readiness || {};
  const safetyBoundary = validationPayload?.safetyBoundary || {};
  const blockedActions = validation.blockedActions || [];

  return [
    {
      id: 'validation-result-is-valid',
      ok: validation.validationResult === 'valid-dry-run-shape-no-creation-authority',
      evidenceRef: validation.validationId || null,
      observed: validation.validationResult || null,
    },
    {
      id: 'all-validation-checks-passed',
      ok: validationChecks.length >= 8 && validationChecks.every((check) => check.ok === true),
      evidenceRef: 'validationChecks',
      observed: validationChecks.map((check) => ({ id: check.id, ok: check.ok })),
    },
    {
      id: 'creation-authority-remains-blocked',
      ok:
        readiness.proposalRecordCreationAllowed === false &&
        readiness.proposalRecordPersistenceAllowed === false &&
        readiness.proposalQueueMutationAllowed === false &&
        readiness.approvalAllowed === false &&
        readiness.implementationAllowed === false &&
        REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
      evidenceRef: 'readiness and blockedActions',
      observed: {
        proposalRecordCreationAllowed: readiness.proposalRecordCreationAllowed,
        proposalRecordPersistenceAllowed: readiness.proposalRecordPersistenceAllowed,
        proposalQueueMutationAllowed: readiness.proposalQueueMutationAllowed,
        approvalAllowed: readiness.approvalAllowed,
        implementationAllowed: readiness.implementationAllowed,
        requiredBlockedActionsPresent: REQUIRED_BLOCKED_ACTIONS.filter((action) =>
          blockedActions.includes(action),
        ),
      },
    },
    {
      id: 'review-is-not-approval',
      ok:
        safetyBoundary.doesNotValidateAsApproval === true &&
        safetyBoundary.doesNotApproveProposals === true &&
        safetyBoundary.doesNotPromoteValidationToRecord === true,
      evidenceRef: 'safetyBoundary',
      observed: {
        doesNotValidateAsApproval: safetyBoundary.doesNotValidateAsApproval,
        doesNotApproveProposals: safetyBoundary.doesNotApproveProposals,
        doesNotPromoteValidationToRecord: safetyBoundary.doesNotPromoteValidationToRecord,
      },
    },
  ];
}

function buildReviewEnvelope({ validationPayload }) {
  const validation = validationPayload?.validationEnvelope?.validationEnvelope || {};
  const reviewFindings = buildReviewFindings({ validationPayload });
  const blockedActions = [
    ...new Set([
      ...(validation.blockedActions || []),
      'accept-dry-run-review-as-approval',
      'promote-dry-run-review-to-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const reviewState = reviewFindings.every((finding) => finding.ok)
    ? 'review-ready-for-acceptance-check'
    : 'needs-validation-evidence';

  return {
    requiredFields: REVIEW_FIELDS,
    reviewEnvelope: {
      reviewId: 'growth-evidence-ledger-proposal-record-dry-run-review-candidate',
      sourceValidationId: validation.validationId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      reviewPurpose:
        'Review dry-run validation evidence as operator-readable proof while keeping proposal record creation, persistence, queue mutation, approval, and implementation authority blocked.',
      reviewInputs: {
        validationResult: validation.validationResult || null,
        validationCheckIds: (validation.validationChecks || []).map((check) => check.id),
        schemaRequiredFields: validation.schemaRequiredFields || [],
        schemaOptionalFields: validation.schemaOptionalFields || [],
        sourceReviewQuestion: validation.reviewQuestion || null,
        nonPromotionStatement: validation.nonPromotionStatement || null,
      },
      reviewCriteria: REVIEW_CRITERIA,
      reviewFindings,
      acceptedReviewStates: ['review-ready-for-acceptance-check'],
      rejectedReviewStates: [
        'needs-validation-evidence',
        'creation-authority-leaked',
        'approval-boundary-leaked',
      ],
      blockedActions,
      acceptanceQuestion:
        'Can this dry-run validation review move to a read-only acceptance check without approving, creating, persisting, or mutating proposal records?',
      nonApprovalStatement:
        'Proposal record dry-run review is review evidence only; it is not proposal approval, proposal record creation, queue persistence, implementation authorization, or source mutation authority.',
    },
    compatibility: {
      validationStatusReady:
        validationPayload?.ok === true &&
        validationPayload?.readiness?.allValidationChecksPassed === true &&
        validationPayload?.readiness?.validationOnly === true &&
        validationPayload?.readiness?.proposalRecordCreationAllowed === false,
      reviewFindingsPassed: reviewFindings.every((finding) => finding.ok),
      reviewState,
      reviewDoesNotApprove:
        blockedActions.includes('accept-dry-run-review-as-approval') &&
        blockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked: blockedActions.includes('promote-dry-run-review-to-record'),
    },
  };
}

function buildReadiness({ sourceSummary, validationResult, reviewEnvelope }) {
  const envelope = reviewEnvelope.reviewEnvelope;

  return {
    validationStatusReady: reviewEnvelope.compatibility.validationStatusReady,
    reviewEnvelopeDefined:
      REVIEW_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Array.isArray(envelope.reviewFindings) &&
      envelope.reviewFindings.length === REVIEW_CRITERIA.length,
    reviewFindingsPassed: reviewEnvelope.compatibility.reviewFindingsPassed,
    reviewReadyForAcceptanceCheck:
      reviewEnvelope.compatibility.reviewState === 'review-ready-for-acceptance-check',
    reviewDoesNotApprove: reviewEnvelope.compatibility.reviewDoesNotApprove,
    durableRecordPromotionBlocked: reviewEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordDryRunReviewStatusDocumented &&
      sourceSummary.proposalRecordDryRunReviewStatusAggregateRegistered &&
      sourceSummary.proposalRecordDryRunReviewStatusLedgered &&
      sourceSummary.proposalRecordDryRunReviewLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordDryRunReview &&
      sourceSummary.reflectionRoutesPastProposalRecordDryRunReview,
    inputValidationStatusOk: validationResult.ok,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
    reviewOnly: true,
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
const validationResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-dry-run-validation-status.mjs',
);
const reviewEnvelope = buildReviewEnvelope({ validationPayload: validationResult.payload });
const readiness = buildReadiness({
  sourceSummary,
  validationResult,
  reviewEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.validationStatusReady &&
  readiness.reviewEnvelopeDefined &&
  readiness.reviewFindingsPassed &&
  readiness.reviewReadyForAcceptanceCheck &&
  readiness.reviewDoesNotApprove &&
  readiness.durableRecordPromotionBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-dry-run-review-status',
  posture: 'local-read-only-ledger-proposal-record-dry-run-review',
  schemaVersion: 'growth-evidence-ledger-proposal-record-dry-run-review-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordDryRunValidation: {
      path: validationResult.path,
      ok: validationResult.ok,
      status: validationResult.status,
      schemaVersion: validationResult.payload?.schemaVersion || null,
    },
  },
  reviewEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-dry-run-review-status.mjs',
    reason:
      'The dry-run validation evidence is now reviewable without approval authority; the next safe slice can define a read-only review acceptance check before any proposal record creation, persistence, approval, or queue mutation.',
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
    doesNotPromoteReviewToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordDryRunValidationFailed: !validationResult.ok,
    failedReviewFindings: reviewEnvelope.reviewEnvelope.reviewFindings
      .filter((finding) => !finding.ok)
      .map((finding) => finding.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
