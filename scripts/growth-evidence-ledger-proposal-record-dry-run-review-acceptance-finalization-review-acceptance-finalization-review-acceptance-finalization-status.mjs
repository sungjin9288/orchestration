import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

requireNoCliArgs(process.argv.slice(2), {
  mode: 'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status',
});

const MODE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status';
const PREVIOUS_STATUS =
  'scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs';
const NEXT_SLICE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review';
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

const FINALIZATION_FIELDS = [
  'finalizationId',
  'sourceAcceptanceId',
  'targetQueueContract',
  'targetSchema',
  'finalizationPurpose',
  'finalizationInputs',
  'finalizationCriteria',
  'finalizationFindings',
  'acceptedFinalizationStates',
  'rejectedFinalizationStates',
  'blockedActions',
  'reviewQuestion',
  'nonApprovalStatement',
];

const FINALIZATION_CRITERIA = [
  {
    id: 'acceptance-status-is-ready',
    question:
      'Is the dry-run review acceptance finalization review acceptance finalization review acceptance status green and ready for finalization?',
    requiredEvidenceRef: 'acceptanceEnvelope.compatibility.acceptanceState',
  },
  {
    id: 'acceptance-findings-passed',
    question:
      'Did every dry-run review acceptance finalization review acceptance finalization review acceptance finding pass?',
    requiredEvidenceRef: 'acceptanceEnvelope.acceptanceFindings',
  },
  {
    id: 'acceptance-remains-non-approval',
    question:
      'Does finalization keep accepted finalization review acceptance finalization review evidence separate from proposal approval?',
    requiredEvidenceRef: 'readiness.acceptanceDoesNotApprove and safetyBoundary',
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
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-as-approval',
  'promote-dry-run-acceptance-to-record',
  'promote-dry-run-finalization-to-record',
  'promote-dry-run-finalization-review-to-record',
  'promote-dry-run-finalization-review-acceptance-to-record',
  'promote-dry-run-finalization-review-acceptance-finalization-to-record',
  'promote-dry-run-finalization-review-acceptance-finalization-review-to-record',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-to-record',
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
      /Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization status/.test(
        inventory,
      ),
    statusAggregateRegistered: new RegExp(MODE).test(verificationStatus),
    statusLedgered: new RegExp(`${MODE}-readonly-post-m7`).test(todo),
    lessonCaptured:
      /proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization.*proposal approval/i.test(
        lessons,
      ) ||
      /proposal approval.*proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization/i.test(
        lessons,
      ),
    engineRoutesPastFinalization: new RegExp(`nextRecommendedSlice[\\s\\S]*${NEXT_SLICE}`).test(
      engine,
    ),
    reflectionRoutesPastFinalization: new RegExp(
      `nextRecommendedSlice[\\s\\S]*${NEXT_SLICE}`,
    ).test(reflection),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(todo),
  };
}

function buildFinalizationFindings({ acceptancePayload }) {
  const acceptanceEnvelope = acceptancePayload?.acceptanceEnvelope?.acceptanceEnvelope || {};
  const compatibility = acceptancePayload?.acceptanceEnvelope?.compatibility || {};
  const readiness = acceptancePayload?.readiness || {};
  const safetyBoundary = acceptancePayload?.safetyBoundary || {};
  const blockedActions = acceptanceEnvelope.blockedActions || [];
  const acceptanceFindings = acceptanceEnvelope.acceptanceFindings || [];

  return [
    {
      id: 'acceptance-status-is-ready',
      ok:
        acceptancePayload?.ok === true &&
        compatibility.acceptanceState === 'accepted-for-read-only-finalization-check' &&
        readiness.acceptanceReadyForFinalizationCheck === true,
      evidenceRef: acceptanceEnvelope.acceptanceId || null,
      observed: {
        ok: acceptancePayload?.ok === true,
        acceptanceState: compatibility.acceptanceState || null,
        acceptanceReadyForFinalizationCheck: readiness.acceptanceReadyForFinalizationCheck,
      },
    },
    {
      id: 'acceptance-findings-passed',
      ok:
        acceptanceFindings.length >= 4 &&
        acceptanceFindings.every((finding) => finding.ok === true) &&
        readiness.acceptanceFindingsPassed === true,
      evidenceRef: 'acceptanceFindings',
      observed: acceptanceFindings.map((finding) => ({ id: finding.id, ok: finding.ok })),
    },
    {
      id: 'acceptance-remains-non-approval',
      ok:
        readiness.acceptanceDoesNotApprove === true &&
        readiness.approvalAllowed === false &&
        safetyBoundary.doesNotApproveProposals === true &&
        REQUIRED_BLOCKED_ACTIONS.every((action) => blockedActions.includes(action)),
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        acceptanceDoesNotApprove: readiness.acceptanceDoesNotApprove,
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
        safetyBoundary.doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewAcceptanceToRecord ===
          true,
      evidenceRef: 'readiness and safetyBoundary',
      observed: {
        proposalRecordCreationAllowed: readiness.proposalRecordCreationAllowed,
        proposalRecordPersistenceAllowed: readiness.proposalRecordPersistenceAllowed,
        proposalQueueMutationAllowed: readiness.proposalQueueMutationAllowed,
        implementationAllowed: readiness.implementationAllowed,
        durableRecordPromotionBlocked: readiness.durableRecordPromotionBlocked,
        doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewAcceptanceToRecord:
          safetyBoundary.doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewAcceptanceToRecord,
      },
    },
  ];
}

function buildFinalizationEnvelope({ acceptancePayload }) {
  const acceptanceEnvelope = acceptancePayload?.acceptanceEnvelope?.acceptanceEnvelope || {};
  const finalizationFindings = buildFinalizationFindings({ acceptancePayload });
  const blockedActions = [
    ...new Set([
      ...(acceptanceEnvelope.blockedActions || []),
      'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-as-approval',
      'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-to-record',
      'create-proposal-record',
      'persist-proposal-record',
      'mutate-proposal-queue',
      'approve-proposal',
    ]),
  ];
  const finalizationState = finalizationFindings.every((finding) => finding.ok)
    ? 'finalized-for-read-only-review-check'
    : 'needs-acceptance-evidence';

  return {
    requiredFields: FINALIZATION_FIELDS,
    finalizationEnvelope: {
      finalizationId:
        'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-candidate',
      sourceAcceptanceId: acceptanceEnvelope.acceptanceId || null,
      targetQueueContract: 'growth-proposal-queue-status',
      targetSchema: 'proposalRecord',
      finalizationPurpose:
        'Finalize accepted dry-run finalization review acceptance finalization review evidence only for the next read-only review check while keeping proposal approval, record creation, persistence, queue mutation, and implementation authority blocked.',
      finalizationInputs: {
        acceptanceState:
          acceptancePayload?.acceptanceEnvelope?.compatibility?.acceptanceState || null,
        acceptanceFindingIds: (acceptanceEnvelope.acceptanceFindings || []).map(
          (finding) => finding.id,
        ),
        acceptedAcceptanceStates: acceptanceEnvelope.acceptedAcceptanceStates || [],
        rejectedAcceptanceStates: acceptanceEnvelope.rejectedAcceptanceStates || [],
        sourceFinalizationQuestion: acceptanceEnvelope.finalizationQuestion || null,
        sourceNonApprovalStatement: acceptanceEnvelope.nonApprovalStatement || null,
      },
      finalizationCriteria: FINALIZATION_CRITERIA,
      finalizationFindings,
      acceptedFinalizationStates: ['finalized-for-read-only-review-check'],
      rejectedFinalizationStates: [
        'needs-acceptance-evidence',
        'approval-boundary-leaked',
        'durable-record-promotion-leaked',
      ],
      blockedActions,
      reviewQuestion:
        'Can this finalized dry-run finalization review acceptance finalization review acceptance evidence move to a read-only review check without approving, creating, persisting, or mutating proposal records?',
      nonApprovalStatement:
        'Proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization is finalization for a later read-only review check only; it is not proposal approval, proposal record creation, queue persistence, implementation authorization, or source mutation authority.',
    },
    compatibility: {
      acceptanceStatusReady:
        acceptancePayload?.ok === true &&
        acceptancePayload?.readiness?.acceptanceReadyForFinalizationCheck === true &&
        acceptancePayload?.readiness?.acceptanceOnly === true &&
        acceptancePayload?.readiness?.proposalRecordCreationAllowed === false,
      finalizationFindingsPassed: finalizationFindings.every((finding) => finding.ok),
      finalizationState,
      finalizationDoesNotApprove:
        blockedActions.includes(
          'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-as-approval',
        ) &&
        blockedActions.includes(
          'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-as-approval',
        ) &&
        blockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        blockedActions.includes(
          'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-to-record',
        ) &&
        blockedActions.includes(
          'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-to-record',
        ),
    },
  };
}

function buildReadiness({ sourceSummary, acceptanceResult, finalizationEnvelope }) {
  const envelope = finalizationEnvelope.finalizationEnvelope;

  return {
    acceptanceStatusReady: finalizationEnvelope.compatibility.acceptanceStatusReady,
    finalizationEnvelopeDefined:
      FINALIZATION_FIELDS.every((field) => Object.hasOwn(envelope, field)) &&
      Array.isArray(envelope.finalizationFindings) &&
      envelope.finalizationFindings.length === FINALIZATION_CRITERIA.length,
    finalizationFindingsPassed: finalizationEnvelope.compatibility.finalizationFindingsPassed,
    finalizationReadyForReviewCheck:
      finalizationEnvelope.compatibility.finalizationState ===
      'finalized-for-read-only-review-check',
    finalizationDoesNotApprove:
      finalizationEnvelope.compatibility.finalizationDoesNotApprove,
    durableRecordPromotionBlocked:
      finalizationEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.statusDocumented &&
      sourceSummary.statusAggregateRegistered &&
      sourceSummary.statusLedgered &&
      sourceSummary.lessonCaptured,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastFinalization && sourceSummary.reflectionRoutesPastFinalization,
    inputAcceptanceStatusOk: acceptanceResult.ok,
    proposalRecordCreationAllowed: false,
    proposalRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalGenerationAllowed: false,
    proposalApplicationAllowed: false,
    approvalAllowed: false,
    implementationAllowed: false,
    finalizationOnly: true,
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
const acceptanceResult = runStatusScript(PREVIOUS_STATUS);
const finalizationEnvelope = buildFinalizationEnvelope({
  acceptancePayload: acceptanceResult.payload,
});
const readiness = buildReadiness({
  sourceSummary,
  acceptanceResult,
  finalizationEnvelope,
});
const ok =
  missingSources.length === 0 &&
  readiness.acceptanceStatusReady &&
  readiness.finalizationEnvelopeDefined &&
  readiness.finalizationFindingsPassed &&
  readiness.finalizationReadyForReviewCheck &&
  readiness.finalizationDoesNotApprove &&
  readiness.durableRecordPromotionBlocked &&
  readiness.docsAndAggregateReady &&
  readiness.engineReflectionAdvanced;

const payload = {
  ok,
  mode: MODE,
  posture:
    'local-read-only-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization',
  schemaVersion: `${MODE}/v0`,
  currentHead: {
    branch: runGitOrNull(['branch', '--show-current']),
    commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
    status: runGitOrNull(['status', '--short', '--branch']),
  },
  sourceSummary,
  inputStatuses: {
    proposalRecordDryRunReviewAcceptanceFinalizationReviewAcceptanceFinalizationReviewAcceptance: {
      path: acceptanceResult.path,
      ok: acceptanceResult.ok,
      status: acceptanceResult.status,
      schemaVersion: acceptanceResult.payload?.schemaVersion || null,
    },
  },
  finalizationEnvelope,
  readiness,
  nextRecommendedSlice: {
    id: NEXT_SLICE,
    commandToAdd:
      'node scripts/growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs',
    reason:
      'The dry-run review acceptance finalization review acceptance finalization review acceptance evidence is finalized only for a read-only review check; the next safe slice can review finalization evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
    doesNotPromoteFinalizationReviewAcceptanceFinalizationReviewAcceptanceFinalizationToRecord: true,
    doesNotApplyProposals: true,
    doesNotMutateProposalQueue: true,
    doesNotApproveProposals: true,
    doesNotImplementProposals: true,
    doesNotCommit: true,
    doesNotPush: true,
  },
  failures: {
    missingSources,
    proposalRecordDryRunReviewAcceptanceFinalizationReviewAcceptanceFinalizationReviewAcceptanceFailed:
      !acceptanceResult.ok,
    failedFinalizationFindings:
      finalizationEnvelope.finalizationEnvelope.finalizationFindings
        .filter((finding) => !finding.ok)
        .map((finding) => finding.id),
  },
};

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
process.exitCode = ok ? 0 : 1;
