import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from '../read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const ROUTE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance';
const MODE = `${ROUTE}-status`;
const SCRIPT_PATH = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs';
const PREVIOUS_STATUS = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs';
const NEXT_ROUTE = `${ROUTE}-finalization`;
const NEXT_COMMAND = 'node scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs';
const LEDGER_ID =
  'growth-evidence-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-alias-status-readonly-post-m7-1914';
const STATUS_LABEL =
  'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance status';

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

const previousReviewActions = [
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-as-approval',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-to-record',
  'create-proposal-record',
  'persist-proposal-record',
  'mutate-proposal-queue',
  'approve-proposal',
];

const currentAcceptanceActions = [
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-as-approval',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-to-record',
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
  return sourceFiles.filter((relativePath) => !fs.existsSync(path.join(repoRoot, relativePath)));
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
    engineRoutesPastCurrentAcceptance: sourceMentions(sources.engine, NEXT_ROUTE),
    reflectionRoutesPastCurrentAcceptance: sourceMentions(sources.reflection, NEXT_ROUTE),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(sources.todo),
  };
}

function hasPassingFinding(findings, id) {
  return findings.some((finding) => finding.id === id && finding.ok === true);
}

function buildAcceptanceFindings({ reviewEnvelope, reviewFindings, previousReadiness, previousSafety }) {
  const acceptedStates = reviewEnvelope.acceptedReviewStates || [];
  const blockedActions = reviewEnvelope.blockedActions || [];

  return [
    {
      id: 'review-status-is-ready',
      ok:
        acceptedStates.includes('reviewed-for-read-only-acceptance-check') &&
        previousReadiness.reviewOnly === true,
      evidenceRef: reviewEnvelope.reviewId || null,
    },
    {
      id: 'review-findings-passed',
      ok:
        reviewFindings.length >= 4 &&
        hasPassingFinding(reviewFindings, 'review-remains-non-approval') &&
        hasPassingFinding(reviewFindings, 'durable-record-promotion-remains-blocked'),
      evidenceRef: 'reviewFindings',
    },
    {
      id: 'acceptance-remains-non-approval',
      ok:
        previousReadiness.reviewDoesNotApprove === true &&
        previousReadiness.approvalAllowed === false &&
        previousSafety.doesNotApproveProposals === true &&
        previousReviewActions.every((action) => blockedActions.includes(action)),
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
  return [...new Set([...existingBlockedActions, ...currentAcceptanceActions])];
}

function buildAcceptanceEnvelope({ reviewEnvelope, acceptanceFindings, acceptanceBlockedActions }) {
  const acceptanceState = acceptanceFindings.every((finding) => finding.ok)
    ? 'accepted-for-read-only-finalization-check'
    : 'needs-review-evidence';

  const acceptanceRecord = {
    acceptanceId: `${ROUTE}-candidate`,
    sourceReviewId: reviewEnvelope.reviewId || null,
    targetQueueContract: 'growth-proposal-queue-status',
    targetSchema: 'proposalRecord',
    acceptancePurpose:
      'Accept reviewed short-alias dry-run evidence only for a later read-only finalization check.',
    acceptanceFindings,
    acceptedAcceptanceStates: ['accepted-for-read-only-finalization-check'],
    rejectedAcceptanceStates: ['needs-review-evidence', 'approval-boundary-leaked'],
    blockedActions: acceptanceBlockedActions,
    finalizationQuestion:
      'Can this accepted dry-run evidence move to read-only finalization without approving, creating, persisting, or mutating proposal records?',
    nonApprovalStatement:
      'This acceptance is read-only evidence for a later finalization check; it is not proposal approval, proposal record creation, queue persistence, implementation authority, or source mutation authority.',
  };

  return {
    requiredFields: [
      'acceptanceId',
      'sourceReviewId',
      'targetQueueContract',
      'targetSchema',
      'acceptancePurpose',
      'acceptanceFindings',
      'blockedActions',
      'finalizationQuestion',
      'nonApprovalStatement',
    ],
    acceptanceEnvelope: acceptanceRecord,
    compatibility: {
      acceptanceState,
      acceptanceFindingsPassed: acceptanceFindings.every((finding) => finding.ok),
      acceptanceDoesNotApprove:
        currentAcceptanceActions.every((action) => acceptanceBlockedActions.includes(action)) &&
        acceptanceBlockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        acceptanceBlockedActions.includes(currentAcceptanceActions[1]) &&
        acceptanceBlockedActions.includes('persist-proposal-record'),
    },
  };
}

function buildReadiness({ reviewEnvelope, acceptanceEnvelope, sourceSummary }) {
  return {
    reviewStatusReady: (reviewEnvelope.acceptedReviewStates || []).includes(
      'reviewed-for-read-only-acceptance-check',
    ),
    acceptanceEnvelopeDefined: acceptanceEnvelope.requiredFields.every((field) => {
      return Object.hasOwn(acceptanceEnvelope.acceptanceEnvelope, field);
    }),
    acceptanceFindingsPassed: acceptanceEnvelope.compatibility.acceptanceFindingsPassed,
    acceptanceReadyForFinalizationCheck:
      acceptanceEnvelope.compatibility.acceptanceState === 'accepted-for-read-only-finalization-check',
    acceptanceDoesNotApprove: acceptanceEnvelope.compatibility.acceptanceDoesNotApprove,
    durableRecordPromotionBlocked: acceptanceEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.statusDocumented &&
      sourceSummary.statusAggregateRegistered &&
      sourceSummary.statusLedgered,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastCurrentAcceptance && sourceSummary.reflectionRoutesPastCurrentAcceptance,
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

function readinessPassed(readiness, missingSources) {
  return (
    missingSources.length === 0 &&
    readiness.reviewStatusReady &&
    readiness.acceptanceEnvelopeDefined &&
    readiness.acceptanceFindingsPassed &&
    readiness.acceptanceReadyForFinalizationCheck &&
    readiness.acceptanceDoesNotApprove &&
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
  const reviewEnvelope = previousStatus.payload?.reviewEnvelope?.reviewEnvelope || {};
  const reviewFindings = reviewEnvelope.reviewFindings || [];
  const previousReadiness = previousStatus.payload?.readiness || {};
  const previousSafety = previousStatus.payload?.safetyBoundary || {};
  const acceptanceFindings = buildAcceptanceFindings({
    reviewEnvelope,
    reviewFindings,
    previousReadiness,
    previousSafety,
  });
  const acceptanceBlockedActions = buildBlockedActions(reviewEnvelope.blockedActions || []);
  const acceptanceEnvelope = buildAcceptanceEnvelope({
    reviewEnvelope,
    acceptanceFindings,
    acceptanceBlockedActions,
  });
  const readiness = buildReadiness({
    reviewEnvelope,
    acceptanceEnvelope,
    sourceSummary,
  });
  const ok = readinessPassed(readiness, missingSources);

  return {
    ok,
    mode: MODE,
    posture: 'local-read-only-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-alias',
    schemaVersion: `${MODE}/v0`,
    currentHead: {
      branch: runGitOrNull(['branch', '--show-current']),
      commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
      status: runGitOrNull(['status', '--short', '--branch']),
    },
    sourceSummary,
    inputStatuses: {
      proposalRecordAcceptanceFinalizationReviewAcceptanceFinalizationReviewAlias: {
        path: previousStatus.path,
        ok: previousStatus.ok,
        status: previousStatus.status,
        schemaVersion: previousStatus.payload?.schemaVersion || null,
      },
    },
    acceptanceEnvelope,
    readiness,
    nextRecommendedSlice: {
      id: NEXT_ROUTE,
      commandToAdd: NEXT_COMMAND,
      reason:
        'The dry-run short-alias review evidence is accepted only for a read-only finalization check; the next safe slice can finalize accepted evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
      reviewStatusOk: previousStatus.ok,
      reviewStatusExit: previousStatus.status,
    },
    failures: {
      missingSources,
      failedAcceptanceFindings: acceptanceFindings
        .filter((finding) => !finding.ok)
        .map((finding) => finding.id),
    },
  };
}

const payload = buildPayload();

console.log(JSON.stringify(payload, null, 2));
process.exit(payload.ok ? 0 : 1);
