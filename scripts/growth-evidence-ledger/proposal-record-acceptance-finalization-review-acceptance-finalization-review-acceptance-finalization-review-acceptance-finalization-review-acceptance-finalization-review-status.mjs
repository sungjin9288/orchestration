import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from '../read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const ROUTE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review';
const MODE = `${ROUTE}-status`;
const SCRIPT_PATH = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs';
const PREVIOUS_STATUS = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs';
const NEXT_ROUTE = `${ROUTE}-acceptance`;
const NEXT_COMMAND = 'node scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs';
const LEDGER_ID =
  'growth-evidence-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-alias-status-readonly-post-m7-1922';
const STATUS_LABEL =
  'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review status';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

const sourceFiles = [
  'AGENTS.md',
  'docs/18_growth-gateway-vnext.md',
  'docs/22_completion-gate-inventory.md',
  'tasks/todo.md',
  'tasks/lessons.md',
  SCRIPT_PATH,
  PREVIOUS_STATUS,
  'scripts/growth-engine-status.mjs',
  'scripts/growth-reflection-evaluator.mjs',
  'scripts/verification_status.mjs',
];

const previousFinalizationActions = [
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-as-approval',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-to-record',
  'create-proposal-record',
  'persist-proposal-record',
  'mutate-proposal-queue',
  'approve-proposal',
];

const currentReviewActions = [
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-as-approval',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-to-record',
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

function readText(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  return fs.existsSync(absolutePath) ? fs.readFileSync(absolutePath, 'utf8') : '';
}

function sourceMentions(source, expectedText) {
  return source.includes(expectedText);
}

function runStatusScript(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);
  const result = spawnSync(process.execPath, [absolutePath], {
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

function readSourceBundle() {
  return {
    plan: readText('docs/18_growth-gateway-vnext.md'),
    inventory: readText('docs/22_completion-gate-inventory.md'),
    todo: readText('tasks/todo.md'),
    lessons: readText('tasks/lessons.md'),
    verificationStatus: readText('scripts/verification_status.mjs'),
    engine: readText('scripts/growth-engine-status.mjs'),
    reflection: readText('scripts/growth-reflection-evaluator.mjs'),
  };
}

function collectMissingSources() {
  return sourceFiles.filter((relativePath) => {
    return !fs.existsSync(path.join(repoRoot, relativePath));
  });
}

function summarizeSources(sources, missingSources) {
  return {
    sourceCount: sourceFiles.length,
    availableSourceCount: sourceFiles.length - missingSources.length,
    statusDocumented:
      sourceMentions(sources.plan, `Post-Completion Implemented Slice: \`${MODE}\``) &&
      sourceMentions(sources.inventory, STATUS_LABEL),
    statusAggregateRegistered:
      sourceMentions(sources.verificationStatus, MODE) &&
      sourceMentions(sources.verificationStatus, SCRIPT_PATH),
    statusLedgered: sourceMentions(sources.todo, LEDGER_ID),
    filenameLimitLessonCaptured: /filesystem filename limits/.test(sources.lessons),
    engineRoutesPastCurrentReview: sourceMentions(sources.engine, NEXT_ROUTE),
    reflectionRoutesPastCurrentReview: sourceMentions(sources.reflection, NEXT_ROUTE),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(sources.todo),
  };
}

function hasPassingFinding(findings, id) {
  return findings.some((finding) => finding.id === id && finding.ok === true);
}

function buildReviewFindings({ finalizationEnvelope, finalizationFindings, previousReadiness, previousSafety }) {
  const acceptedStates = finalizationEnvelope.acceptedFinalizationStates || [];
  const blockedActions = finalizationEnvelope.blockedActions || [];

  return [
    {
      id: 'finalization-status-is-ready',
      ok:
        acceptedStates.includes('finalized-for-read-only-review-check') &&
        previousReadiness.finalizationOnly === true,
      evidenceRef: finalizationEnvelope.finalizationId || null,
    },
    {
      id: 'finalization-findings-passed',
      ok:
        finalizationFindings.length >= 4 &&
        hasPassingFinding(finalizationFindings, 'acceptance-remains-non-approval') &&
        hasPassingFinding(finalizationFindings, 'durable-record-promotion-remains-blocked'),
      evidenceRef: 'finalizationFindings',
    },
    {
      id: 'review-remains-non-approval',
      ok:
        previousReadiness.finalizationDoesNotApprove === true &&
        previousReadiness.approvalAllowed === false &&
        previousSafety.doesNotApproveProposals === true &&
        previousFinalizationActions.every((action) => blockedActions.includes(action)),
      evidenceRef: 'readiness and safetyBoundary',
    },
    {
      id: 'durable-record-promotion-remains-blocked',
      ok:
        previousReadiness.proposalRecordCreationAllowed === false &&
        previousReadiness.proposalRecordPersistenceAllowed === false &&
        previousReadiness.proposalQueueMutationAllowed === false &&
        previousReadiness.durableRecordPromotionBlocked === true,
      evidenceRef: 'readiness and blockedActions',
    },
  ];
}

function buildBlockedActions(existingBlockedActions) {
  return [...new Set([...existingBlockedActions, ...currentReviewActions])];
}

function buildReviewEnvelope({ finalizationEnvelope, reviewFindings, reviewBlockedActions }) {
  const reviewState = reviewFindings.every((finding) => finding.ok)
    ? 'reviewed-for-read-only-acceptance-check'
    : 'needs-finalization-evidence';

  const reviewRecord = {
    reviewId: `${ROUTE}-candidate`,
    sourceFinalizationId: finalizationEnvelope.finalizationId || null,
    targetQueueContract: 'growth-proposal-queue-status',
    targetSchema: 'proposalRecord',
    reviewPurpose: 'Review finalized short-alias dry-run evidence only for a later read-only acceptance check.',
    reviewFindings,
    acceptedReviewStates: ['reviewed-for-read-only-acceptance-check'],
    rejectedReviewStates: ['needs-finalization-evidence', 'approval-boundary-leaked'],
    blockedActions: reviewBlockedActions,
    acceptanceQuestion: 'Can this reviewed dry-run evidence move to read-only acceptance without approving, creating, persisting, or mutating proposal records?',
    nonApprovalStatement: 'This review is read-only evidence for a later acceptance check; it is not proposal approval, proposal record creation, queue persistence, implementation authority, or source mutation authority.',
  };

  return {
    requiredFields: [
      'reviewId',
      'sourceFinalizationId',
      'targetQueueContract',
      'targetSchema',
      'reviewPurpose',
      'reviewFindings',
      'blockedActions',
      'acceptanceQuestion',
      'nonApprovalStatement',
    ],
    reviewEnvelope: reviewRecord,
    compatibility: {
      reviewState,
      reviewFindingsPassed: reviewFindings.every((finding) => finding.ok),
      reviewDoesNotApprove:
        currentReviewActions.every((action) => reviewBlockedActions.includes(action)) &&
        reviewBlockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        reviewBlockedActions.includes(currentReviewActions[1]) &&
        reviewBlockedActions.includes('persist-proposal-record'),
    },
  };
}

function buildReadiness({ finalizationEnvelope, reviewEnvelope, sourceSummary }) {
  return {
    finalizationStatusReady: (finalizationEnvelope.acceptedFinalizationStates || []).includes(
      'finalized-for-read-only-review-check',
    ),
    reviewEnvelopeDefined: reviewEnvelope.requiredFields.every((field) => {
      return Object.hasOwn(reviewEnvelope.reviewEnvelope, field);
    }),
    reviewFindingsPassed: reviewEnvelope.compatibility.reviewFindingsPassed,
    reviewReadyForAcceptanceCheck:
      reviewEnvelope.compatibility.reviewState === 'reviewed-for-read-only-acceptance-check',
    reviewDoesNotApprove: reviewEnvelope.compatibility.reviewDoesNotApprove,
    durableRecordPromotionBlocked: reviewEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.statusDocumented &&
      sourceSummary.statusAggregateRegistered &&
      sourceSummary.statusLedgered,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastCurrentReview && sourceSummary.reflectionRoutesPastCurrentReview,
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

function readinessPassed(readiness, missingSources) {
  return (
    missingSources.length === 0 &&
    readiness.finalizationStatusReady &&
    readiness.reviewEnvelopeDefined &&
    readiness.reviewFindingsPassed &&
    readiness.reviewReadyForAcceptanceCheck &&
    readiness.reviewDoesNotApprove &&
    readiness.durableRecordPromotionBlocked &&
    readiness.docsAndAggregateReady &&
    readiness.engineReflectionAdvanced
  );
}

function buildPayload() {
  const sources = readSourceBundle();
  const missingSources = collectMissingSources();
  const sourceSummary = summarizeSources(sources, missingSources);
  const previousStatus = runStatusScript(PREVIOUS_STATUS);
  const finalizationEnvelope = previousStatus.payload?.finalizationEnvelope?.finalizationEnvelope || {};
  const finalizationFindings = finalizationEnvelope.finalizationFindings || [];
  const previousReadiness = previousStatus.payload?.readiness || {};
  const previousSafety = previousStatus.payload?.safetyBoundary || {};
  const reviewFindings = buildReviewFindings({
    finalizationEnvelope,
    finalizationFindings,
    previousReadiness,
    previousSafety,
  });
  const reviewBlockedActions = buildBlockedActions(finalizationEnvelope.blockedActions || []);
  const reviewEnvelope = buildReviewEnvelope({
    finalizationEnvelope,
    reviewFindings,
    reviewBlockedActions,
  });
  const readiness = buildReadiness({
    finalizationEnvelope,
    reviewEnvelope,
    sourceSummary,
  });
  const ok = readinessPassed(readiness, missingSources);

  return {
    ok,
    mode: MODE,
    posture:
      'local-read-only-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-alias',
    schemaVersion: `${MODE}/v0`,
    currentHead: {
      branch: runGitOrNull(['branch', '--show-current']),
      commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
      status: runGitOrNull(['status', '--short', '--branch']),
    },
    sourceSummary,
    inputStatuses: {
      proposalRecordAcceptanceFinalizationReviewAcceptanceFinalizationReviewAcceptanceFinalizationAlias: {
        path: previousStatus.path,
        ok: previousStatus.ok,
        status: previousStatus.status,
        schemaVersion: previousStatus.payload?.schemaVersion || null,
      },
    },
    reviewEnvelope,
    readiness,
    nextRecommendedSlice: {
      id: NEXT_ROUTE,
      commandToAdd: NEXT_COMMAND,
      reason:
        'The dry-run short-alias finalization evidence is reviewed only for a read-only acceptance check; the next safe slice can accept reviewed evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
      doesNotAuthorizeGatewayActions: true,
      doesNotGenerateProposals: true,
      doesNotCreateProposalRecords: true,
      doesNotPersistProposalRecords: true,
      doesNotMutateProposalQueue: true,
      doesNotApproveProposals: true,
      doesNotCommit: true,
      doesNotPush: true,
    },
    liveInputObservation: {
      finalizationStatusOk: previousStatus.ok,
      finalizationStatusExit: previousStatus.status,
    },
    failures: {
      missingSources,
      failedReviewFindings: reviewFindings
        .filter((finding) => !finding.ok)
        .map((finding) => finding.id),
    },
  };
}

const payload = buildPayload();

console.log(JSON.stringify(payload, null, 2));
process.exit(payload.ok ? 0 : 1);
