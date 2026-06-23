import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status',
});

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status.mjs',
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-status.mjs',
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const REVIEW_FIELDS = [
  'reviewId',
  'sourceFinalizationId',
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
    id: 'finalization-status-is-ready',
    question: 'Is the dry-run review acceptance finalization status green and ready for review?',
    requiredEvidenceRef: 'finalizationEnvelope.compatibility.finalizationState',
  },
  {
    id: 'finalization-findings-passed',
    question: 'Did every dry-run review acceptance finalization finding pass without evidence gaps?',
    requiredEvidenceRef: 'finalizationEnvelope.finalizationFindings',
  },
  {
    id: 'finalization-remains-non-approval',
    question: 'Does review keep finalized acceptance evidence separate from proposal approval?',
    requiredEvidenceRef: 'readiness.finalizationDoesNotApprove and safetyBoundary',
  },
  {
    id: 'durable-record-promotion-remains-blocked',
    question: 'Are proposal record creation, persistence, queue mutation, and promotion still blocked?',
    requiredEvidenceRef: 'readiness and blockedActions',
  },
];

const REQUIRED_BLOCKED_ACTIONS = [
  'accept-dry-run-acceptance-as-approval',
  'accept-dry-run-finalization-as-approval',
  'promote-dry-run-acceptance-to-record',
  'promote-dry-run-finalization-to-record',
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
    proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusDocumented:
      /Post-Completion Implemented Slice: `growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status`/.test(
        plan,
      ) &&
      /Growth Evidence Ledger proposal record dry-run review acceptance finalization review status/.test(
        inventory,
      ),
    proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusAggregateRegistered:
      /growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status/.test(
        verificationStatus,
      ),
    proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusLedgered:
      /growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status-readonly-post-m7/.test(
        todo,
      ),
    proposalRecordDryRunReviewAcceptanceFinalizationReviewLessonCaptured:
      /proposal record dry-run review acceptance finalization review.*proposal approval/i.test(
        lessons,
      ) ||
      /proposal approval.*proposal record dry-run review acceptance finalization review/i.test(
        lessons,
      ),
    engineRoutesPastProposalRecordDryRunReviewAcceptanceFinalizationReview:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance/.test(
        engine,
      ),
    reflectionRoutesPastProposalRecordDryRunReviewAcceptanceFinalizationReview:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildReviewFindings({ finalizationPayload }) {
  const finalizationEnvelope =
    finalizationPayload?.finalizationEnvelope?.finalizationEnvelope || {};
  const finalizationCompatibility =
    finalizationPayload?.finalizationEnvelope?.compatibility || {};
  const readiness = finalizationPayload?.readiness || {};
  const safetyBoundary = finalizationPayload?.safetyBoundary || {};
  const blockedActions = finalizationEnvelope.blockedActions || [];
  const finalizationFindings = finalizationEnvelope.finalizationFindings || [];

  return [
    {
      id: 'finalization-status-is-ready',
      ok:
        finalizationPayload?.ok === true &&
        finalizationCompatibility.finalizationState ===
          'finalized-for-read-only-review-check' &&
        readiness.finalizationReadyForReviewCheck === true,
      evidenceRef: finalizationEnvelope.finalizationId || null,
      observed: {
        ok: finalizationPayload?.ok === true,
        finalizationState: finalizationCompatibility.finalizationState || null,
        finalizationReadyForReviewCheck: readiness.finalizationReadyForReviewCheck,
      },
    },
    {
      id: 'finalization-findings-passed',
      ok:
        finalizationFindings.length >= 4 &&
        finalizationFindings.every((finding) => finding.ok === true) &&
        readiness.finalizationFindingsPassed === true,
      evidenceRef: 'finalizationFindings',
      observed: finalizationFindings.map((finding) => ({ id: finding.id, ok: finding.ok })),
    },
    {
      id: 'finalization-remains-non-approval',
      ok:
        readiness.finalizationDoesNotApprove === true &&
        readiness.approvalAllowed === false &&
        safetyBoundary.doesNotApproveProposals === true &&
        REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        finalizationDoesNotApprove: readiness.finalizationDoesNotApprove,
        approvalAllowed: readiness.approvalAllowed,
        doesNotApproveProposals: safetyBoundary.doesNotApproveProposals,
        requiredBlockedActionsPresent: REQUIRED_BLOCKED_ACTIONS.filter((action) =>
          blockedActions.includes(action),
        ),
      },
    },
    {
      id: 'durable-record-promotion-remains-blocked',
      ok:
        readiness.proposalRecordCreationAllowed === false &&
        readiness.proposalRecordPersistenceAllowed === false &&
        readiness.proposalQueueMutationAllowed === false &&
        readiness.implementationAllowed === false &&
        readiness.durableRecordPromotionBlocked === true &&
        safetyBoundary.doesNotPromoteFinalizationToRecord === true,
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        proposalRecordCreationAllowed: readiness.proposalRecordCreationAllowed,
        proposalRecordPersistenceAllowed: readiness.proposalRecordPersistenceAllowed,
        proposalQueueMutationAllowed: readiness.proposalQueueMutationAllowed,
        implementationAllowed: readiness.implementationAllowed,
        durableRecordPromotionBlocked: readiness.durableRecordPromotionBlocked,
        doesNotPromoteFinalizationToRecord:
          safetyBoundary.doesNotPromoteFinalizationToRecord,
      },
    },
  ];
}

function buildReviewEnvelope({ finalizationPayload }) {
  const finalizationEnvelope =
    finalizationPayload?.finalizationEnvelope?.finalizationEnvelope || {};
  const reviewFindings = buildReviewFindings({ finalizationPayload });
  const blockedActions = [
    ...new Set([
      ...(finalizationEnvelope.blockedActions || []),
      'accept-dry-run-finalization-review-as-approval',
      'promote-dry-run-finalization-review-to-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const reviewState = reviewFindings.every((finding) => finding.ok)
    ? 'reviewed-for-read-only-acceptance-check'
    : 'needs-finalization-evidence';

  return {
    requiredFields: REVIEW_FIELDS,
    reviewEnvelope: {
      reviewId:
        'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-candidate',
      sourceFinalizationId: finalizationEnvelope.finalizationId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      reviewPurpose:
        'Review finalized dry-run acceptance evidence only for the next read-only acceptance check while keeping proposal approval, record creation, persistence, queue mutation, and implementation authority blocked.',
      reviewInputs: {
        finalizationState:
          finalizationPayload?.finalizationEnvelope?.compatibility?.finalizationState || null,
        finalizationFindingIds: (finalizationEnvelope.finalizationFindings || []).map(
          (finding) => finding.id,
        ),
        acceptedFinalizationStates:
          finalizationEnvelope.acceptedFinalizationStates || [],
        rejectedFinalizationStates:
          finalizationEnvelope.rejectedFinalizationStates || [],
        sourceReviewQuestion: finalizationEnvelope.reviewQuestion || null,
        sourceNonApprovalStatement: finalizationEnvelope.nonApprovalStatement || null,
      },
      reviewCriteria: REVIEW_CRITERIA,
      reviewFindings,
      acceptedReviewStates: ['reviewed-for-read-only-acceptance-check'],
      rejectedReviewStates: [
        'needs-finalization-evidence',
        'approval-boundary-leaked',
        'durable-record-promotion-leaked',
      ],
      blockedActions,
      acceptanceQuestion:
        'Can this reviewed dry-run finalization evidence move to a read-only acceptance check without approving, creating, persisting, or mutating proposal records?',
      nonApprovalStatement:
        'Proposal record dry-run review acceptance finalization review is review for a later read-only acceptance check only; it is not proposal approval, proposal record creation, queue persistence, implementation authorization, or source mutation authority.',
    },
    compatibility: {
      finalizationStatusReady:
        finalizationPayload?.ok === true &&
        finalizationPayload?.readiness?.finalizationReadyForReviewCheck === true &&
        finalizationPayload?.readiness?.finalizationOnly === true &&
        finalizationPayload?.readiness?.proposalRecordCreationAllowed === false,
      reviewFindingsPassed: reviewFindings.every((finding) => finding.ok),
      reviewState,
      reviewDoesNotApprove:
        blockedActions.includes('accept-dry-run-finalization-as-approval') &&
        blockedActions.includes('accept-dry-run-finalization-review-as-approval') &&
        blockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        blockedActions.includes('promote-dry-run-finalization-to-record') &&
        blockedActions.includes('promote-dry-run-finalization-review-to-record'),
    },
  };
}

function buildReadiness({ sourceSummary, finalizationResult, reviewEnvelope }) {
  const envelope = reviewEnvelope.reviewEnvelope;

  return {
    finalizationStatusReady: reviewEnvelope.compatibility.finalizationStatusReady,
    reviewEnvelopeDefined:
      REVIEW_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Array.isArray(envelope.reviewFindings) &&
      envelope.reviewFindings.length === REVIEW_CRITERIA.length,
    reviewFindingsPassed: reviewEnvelope.compatibility.reviewFindingsPassed,
    reviewReadyForAcceptanceCheck:
      reviewEnvelope.compatibility.reviewState ===
      'reviewed-for-read-only-acceptance-check',
    reviewDoesNotApprove: reviewEnvelope.compatibility.reviewDoesNotApprove,
    durableRecordPromotionBlocked:
      reviewEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusDocumented &&
      sourceSummary.proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusAggregateRegistered &&
      sourceSummary.proposalRecordDryRunReviewAcceptanceFinalizationReviewStatusLedgered &&
      sourceSummary.proposalRecordDryRunReviewAcceptanceFinalizationReviewLessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastProposalRecordDryRunReviewAcceptanceFinalizationReview &&
      sourceSummary.reflectionRoutesPastProposalRecordDryRunReviewAcceptanceFinalizationReview,
    inputFinalizationStatusOk: finalizationResult.ok,
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
const finalizationResult = runStatusScript(
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-status.mjs',
);
const reviewEnvelope = buildReviewEnvelope({
  finalizationPayload: finalizationResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  finalizationResult,
  reviewEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.finalizationStatusReady &&
  readiness.reviewEnvelopeDefined &&
  readiness.reviewFindingsPassed &&
  readiness.reviewReadyForAcceptanceCheck &&
  readiness.reviewDoesNotApprove &&
  readiness.durableRecordPromotionBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status',
  posture:
    'local-read-only-ledger-proposal-record-dry-run-review-acceptance-finalization-review',
  schemaVersion:
    'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status/v0',
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordDryRunReviewAcceptanceFinalization: {
      path: finalizationResult.path,
      ok: finalizationResult.ok,
      status: finalizationResult.status,
      schemaVersion: finalizationResult.payload?.schemaVersion || null,
    },
  },
  reviewEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance',
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-status.mjs',
    reason:
      'The dry-run review acceptance finalization evidence is reviewed only for a read-only acceptance check; the next safe slice can accept review evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
    doesNotAcceptAsApproval: true,
    doesNotGenerateProposalIds: true,
    doesNotAssignProposalStatus: true,
    doesNotStampCreatedAt: true,
    doesNotCreateProposalRecords: true,
    doesNotPersistProposalRecords: true,
    doesNotPromoteDryRunShapeToRecord: true,
    doesNotPromoteValidationToRecord: true,
    doesNotPromoteReviewToRecord: true,
    doesNotPromoteAcceptanceToRecord: true,
    doesNotPromoteFinalizationToRecord: true,
    doesNotPromoteFinalizationReviewToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordDryRunReviewAcceptanceFinalizationFailed: !finalizationResult.ok,
    failedReviewFindings: reviewEnvelope.reviewEnvelope.reviewFindings
      .filter((finding) => !finding.ok)
      .map((finding) => finding.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
