import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const MODE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status';
const PREVIOUS_STATUS =
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs';
const NEXT_SLICE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const SOURCE_FILES = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  `scripts/${MODE}.mjs`,
  PREVIOUS_STATUS,
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const ACCEPTANCE_FIELDS = [
  'acceptanceId',
  'sourceReviewId',
  'targetQueueContract',
  'targetSchema',
  'acceptancePurpose',
  'acceptanceInputs',
  'acceptanceCriteria',
  'acceptanceFindings',
  'acceptedAcceptanceStates',
  'rejectedAcceptanceStates',
  'blockedActions',
  'finalizationQuestion',
  'nonApprovalStatement',
];

const ACCEPTANCE_CRITERIA = [
  {
    id: 'review-status-is-ready',
    question:
      'Is the dry-run finalization review acceptance finalization review status green and ready for acceptance?',
    requiredEvidenceRef: 'reviewEnvelope.compatibility.reviewState',
  },
  {
    id: 'review-findings-passed',
    question: 'Did every dry-run finalization review acceptance finalization review finding pass?',
    requiredEvidenceRef: 'reviewEnvelope.reviewFindings',
  },
  {
    id: 'review-remains-non-approval',
    question:
      'Does acceptance keep reviewed finalization review acceptance finalization evidence separate from proposal approval?',
    requiredEvidenceRef: 'readiness.reviewDoesNotApprove and safetyBoundary',
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
  'accept-dry-run-finalization-review-as-approval',
  'accept-dry-run-finalization-review-acceptance-as-approval',
  'accept-dry-run-finalization-review-acceptance-finalization-as-approval',
  'accept-dry-run-finalization-review-acceptance-finalization-review-as-approval',
  'promote-dry-run-acceptance-to-record',
  'promote-dry-run-finalization-to-record',
  'promote-dry-run-finalization-review-to-record',
  'promote-dry-run-finalization-review-acceptance-to-record',
  'promote-dry-run-finalization-review-acceptance-finalization-to-record',
  'promote-dry-run-finalization-review-acceptance-finalization-review-to-record',
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
    statusDocumented:
      new RegExp(`Post-Completion Implemented Slice: \`${MODE}\``).test(plan) &&
      /Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance status/.test(
        inventory,
      ),
    statusAggregateRegistered: new RegExp(MODE).test(verificationStatus),
    statusLedgered: new RegExp(`${MODE}-readonly-post-m7`).test(todo),
    lessonCaptured:
      /proposal record dry-run review acceptance finalization review acceptance finalization review acceptance.*proposal approval/i.test(
        lessons,
      ) ||
      /proposal approval.*proposal record dry-run review acceptance finalization review acceptance finalization review acceptance/i.test(
        lessons,
      ),
    engineRoutesPastAcceptance:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization/.test(
        engine,
      ),
    reflectionRoutesPastAcceptance:
      /nextRecommendedSlice[\s\S]*growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization/.test(
        reflection,
      ),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildAcceptanceFindings({ reviewPayload }) {
  const reviewEnvelope = reviewPayload?.reviewEnvelope?.reviewEnvelope || {};
  const reviewCompatibility = reviewPayload?.reviewEnvelope?.compatibility || {};
  const readiness = reviewPayload?.readiness || {};
  const safetyBoundary = reviewPayload?.safetyBoundary || {};
  const blockedActions = reviewEnvelope.blockedActions || [];
  const reviewFindings = reviewEnvelope.reviewFindings || [];

  return [
    {
      id: 'review-status-is-ready',
      ok:
        reviewPayload?.ok === true &&
        reviewCompatibility.reviewState === 'reviewed-for-read-only-acceptance-check' &&
        readiness.reviewReadyForAcceptanceCheck === true,
      evidenceRef: reviewEnvelope.reviewId || null,
      observed: {
        ok: reviewPayload?.ok === true,
        reviewState: reviewCompatibility.reviewState || null,
        reviewReadyForAcceptanceCheck: readiness.reviewReadyForAcceptanceCheck,
      },
    },
    {
      id: 'review-findings-passed',
      ok:
        reviewFindings.length >= 4 &&
        reviewFindings.every((finding) => finding.ok === true) &&
        readiness.reviewFindingsPassed === true,
      evidenceRef: 'reviewFindings',
      observed: reviewFindings.map((finding) => ({ id: finding.id, ok: finding.ok })),
    },
    {
      id: 'review-remains-non-approval',
      ok:
        readiness.reviewDoesNotApprove === true &&
        readiness.approvalAllowed === false &&
        safetyBoundary.doesNotApproveProposals === true &&
        REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        reviewDoesNotApprove: readiness.reviewDoesNotApprove,
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
        safetyBoundary.doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewToRecord ===
          true,
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        proposalRecordCreationAllowed: readiness.proposalRecordCreationAllowed,
        proposalRecordPersistenceAllowed: readiness.proposalRecordPersistenceAllowed,
        proposalQueueMutationAllowed: readiness.proposalQueueMutationAllowed,
        implementationAllowed: readiness.implementationAllowed,
        durableRecordPromotionBlocked: readiness.durableRecordPromotionBlocked,
        doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewToRecord:
          safetyBoundary.doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewToRecord,
      },
    },
  ];
}

function buildAcceptanceEnvelope({ reviewPayload }) {
  const reviewEnvelope = reviewPayload?.reviewEnvelope?.reviewEnvelope || {};
  const acceptanceFindings = buildAcceptanceFindings({ reviewPayload });
  const blockedActions = [
    ...new Set([
      ...(reviewEnvelope.blockedActions || []),
      'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-as-approval',
      'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-to-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const acceptanceState = acceptanceFindings.every((finding) => finding.ok)
    ? 'accepted-for-read-only-finalization-check'
    : 'needs-review-evidence';

  return {
    requiredFields: ACCEPTANCE_FIELDS,
    acceptanceEnvelope: {
      acceptanceId:
        'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-candidate',
      sourceReviewId: reviewEnvelope.reviewId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      acceptancePurpose:
        'Accept reviewed dry-run finalization review acceptance finalization evidence only for the next read-only finalization check while keeping proposal approval, record creation, persistence, queue mutation, and implementation authority blocked.',
      acceptanceInputs: {
        reviewState: reviewPayload?.reviewEnvelope?.compatibility?.reviewState || null,
        reviewFindingIds: (reviewEnvelope.reviewFindings || []).map((finding) => finding.id),
        acceptedReviewStates: reviewEnvelope.acceptedReviewStates || [],
        rejectedReviewStates: reviewEnvelope.rejectedReviewStates || [],
        sourceAcceptanceQuestion: reviewEnvelope.acceptanceQuestion || null,
        sourceNonApprovalStatement: reviewEnvelope.nonApprovalStatement || null,
      },
      acceptanceCriteria: ACCEPTANCE_CRITERIA,
      acceptanceFindings,
      acceptedAcceptanceStates: ['accepted-for-read-only-finalization-check'],
      rejectedAcceptanceStates: [
        'needs-review-evidence',
        'approval-boundary-leaked',
        'durable-record-promotion-leaked',
      ],
      blockedActions,
      finalizationQuestion:
        'Can this accepted dry-run finalization review acceptance finalization review evidence move to a read-only finalization check without approving, creating, persisting, or mutating proposal records?',
      nonApprovalStatement:
        'Proposal record dry-run review acceptance finalization review acceptance finalization review acceptance is acceptance for a later read-only finalization check only; it is not proposal approval, proposal record creation, queue persistence, implementation authorization, or source mutation authority.',
    },
    compatibility: {
      reviewStatusReady:
        reviewPayload?.ok === true &&
        reviewPayload?.readiness?.reviewReadyForAcceptanceCheck === true &&
        reviewPayload?.readiness?.reviewOnly === true &&
        reviewPayload?.readiness?.proposalRecordCreationAllowed === false,
      acceptanceFindingsPassed: acceptanceFindings.every((finding) => finding.ok),
      acceptanceState,
      acceptanceDoesNotApprove:
        blockedActions.includes(
          'accept-dry-run-finalization-review-acceptance-finalization-review-as-approval',
        ) &&
        blockedActions.includes(
          'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-as-approval',
        ) &&
        blockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        blockedActions.includes(
          'promote-dry-run-finalization-review-acceptance-finalization-review-to-record',
        ) &&
        blockedActions.includes(
          'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-to-record',
        ),
    },
  };
}

function buildReadiness({ sourceSummary, reviewResult, acceptanceEnvelope }) {
  const envelope = acceptanceEnvelope.acceptanceEnvelope;

  return {
    reviewStatusReady: acceptanceEnvelope.compatibility.reviewStatusReady,
    acceptanceEnvelopeDefined:
      ACCEPTANCE_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Array.isArray(envelope.acceptanceFindings) &&
      envelope.acceptanceFindings.length === ACCEPTANCE_CRITERIA.length,
    acceptanceFindingsPassed: acceptanceEnvelope.compatibility.acceptanceFindingsPassed,
    acceptanceReadyForFinalizationCheck:
      acceptanceEnvelope.compatibility.acceptanceState ===
      'accepted-for-read-only-finalization-check',
    acceptanceDoesNotApprove: acceptanceEnvelope.compatibility.acceptanceDoesNotApprove,
    durableRecordPromotionBlocked:
      acceptanceEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.statusDocumented &&
      sourceSummary.statusAggregateRegistered &&
      sourceSummary.statusLedgered &&
      sourceSummary.lessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastAcceptance && sourceSummary.reflectionRoutesPastAcceptance,
    inputReviewStatusOk: reviewResult.ok,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
    acceptanceOnly: true,
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
const reviewResult = runStatusScript(PREVIOUS_STATUS);
const acceptanceEnvelope = buildAcceptanceEnvelope({ reviewPayload: reviewResult.payload });
const readiness = buildReadiness({
  sourceSummary,
  reviewResult,
  acceptanceEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.reviewStatusReady &&
  readiness.acceptanceEnvelopeDefined &&
  readiness.acceptanceFindingsPassed &&
  readiness.acceptanceReadyForFinalizationCheck &&
  readiness.acceptanceDoesNotApprove &&
  readiness.durableRecordPromotionBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: MODE,
  posture:
    'local-read-only-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance',
  schemaVersion: `${MODE}/v0`,
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordDryRunReviewAcceptanceFinalizationReviewAcceptanceFinalizationReview: {
      path: reviewResult.path,
      ok: reviewResult.ok,
      status: reviewResult.status,
      schemaVersion: reviewResult.payload?.schemaVersion || null,
    },
  },
  acceptanceEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: NEXT_SLICE,
    commandToAdd: `node scripts/${MODE}.mjs`,
    reason:
      'The dry-run review acceptance finalization review acceptance finalization review evidence is accepted only for a read-only finalization check; the next safe slice can finalize acceptance evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
    doesNotPromoteFinalizationReviewAcceptanceToRecord: true,
    doesNotPromoteFinalizationReviewAcceptanceFinalizationToRecord: true,
    doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewToRecord: true,
    doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewAcceptanceToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordDryRunReviewAcceptanceFinalizationReviewAcceptanceFinalizationReviewFailed:
      !reviewResult.ok,
    failedAcceptanceFindings: acceptanceEnvelope.acceptanceEnvelope.acceptanceFindings
      .filter((finding) => !finding.ok)
      .map((finding) => finding.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
