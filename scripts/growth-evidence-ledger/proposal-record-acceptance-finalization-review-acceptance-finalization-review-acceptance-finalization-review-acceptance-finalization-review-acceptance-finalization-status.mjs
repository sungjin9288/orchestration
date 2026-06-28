import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from '../read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

const BASE =
  'growth-evidence-ledger-proposal-record-dry-run-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization';
const MODE = `${BASE}-status`;
const SCRIPT_PATH = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-status.mjs';
const PREVIOUS_STATUS = 'scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-status.mjs';
const NEXT_SLICE = `${BASE}-review`;
const NEXT_COMMAND = 'node scripts/growth-evidence-ledger/proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-status.mjs';
const LEDGER_ID =
  'growth-evidence-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-alias-status-readonly-post-m7-1924';
const STATUS_LABEL =
  'Growth Evidence Ledger proposal record dry-run review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization review acceptance finalization status';

requireNoCliArgs(process.argv.slice(2), { mode: MODE });

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
const requiredBlockedActions = [
  'accept-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-as-approval',
  'promote-dry-run-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-acceptance-to-record',
  'create-proposal-record',
  'persist-proposal-record',
  'mutate-proposal-queue',
  'approve-proposal',
];
const currentFinalizationActionScope = BASE.replace(
  /^growth-evidence-ledger-proposal-record-dry-run-review-acceptance-/,
  '',
);
const currentFinalizationActions = [
  `accept-dry-run-${currentFinalizationActionScope}-as-approval`,
  `promote-dry-run-${currentFinalizationActionScope}-to-record`,
];

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
    engineRoutesPastCurrentFinalization: sourceMentions(sources.engine, NEXT_SLICE),
    reflectionRoutesPastCurrentFinalization: sourceMentions(sources.reflection, NEXT_SLICE),
    noDefaultBacklogOpen: !/^- \[ \]/m.test(sources.todo),
  };
}

function hasPassingFinding(findings, id) {
  return findings.some((finding) => finding.id === id && finding.ok === true);
}

function buildFinalizationFindings({ acceptanceEnvelope, acceptanceFindings, previousReadiness, previousSafety }) {
  const blockedActions = acceptanceEnvelope.blockedActions || [];
  const acceptedStates = acceptanceEnvelope.acceptedAcceptanceStates || [];

  return [
    {
      id: 'acceptance-status-is-ready',
      ok:
        acceptedStates.includes('accepted-for-read-only-finalization-check') &&
        previousReadiness.acceptanceOnly === true,
      evidenceRef: acceptanceEnvelope.acceptanceId || null,
    },
    {
      id: 'acceptance-findings-passed',
      ok:
        acceptanceFindings.length >= 4 &&
        hasPassingFinding(acceptanceFindings, 'acceptance-remains-non-approval') &&
        hasPassingFinding(acceptanceFindings, 'durable-record-promotion-remains-blocked'),
      evidenceRef: 'acceptanceFindings',
    },
    {
      id: 'acceptance-remains-non-approval',
      ok:
        previousReadiness.acceptanceDoesNotApprove === true &&
        previousReadiness.approvalAllowed === false &&
        previousSafety.doesNotApproveProposals === true &&
        requiredBlockedActions.every((action) => blockedActions.includes(action)),
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
  return [...new Set([...existingBlockedActions, ...currentFinalizationActions])];
}

function buildFinalizationEnvelope({ acceptanceEnvelope, finalizationFindings, finalizationBlockedActions }) {
  const finalizationState = finalizationFindings.every((finding) => finding.ok)
    ? 'finalized-for-read-only-review-check'
    : 'needs-acceptance-evidence';

  const finalizationRecord = {
    finalizationId: `${BASE}-candidate`,
    sourceAcceptanceId: acceptanceEnvelope.acceptanceId || null,
    targetQueueContract: 'growth-proposal-queue-status',
    targetSchema: 'proposalRecord',
    finalizationPurpose:
      'Finalize accepted short-alias dry-run evidence only for a later read-only review check.',
    finalizationFindings,
    acceptedFinalizationStates: ['finalized-for-read-only-review-check'],
    rejectedFinalizationStates: ['needs-acceptance-evidence', 'approval-boundary-leaked'],
    blockedActions: finalizationBlockedActions,
    reviewQuestion: 'Can this finalized dry-run evidence move to read-only review without approving, creating, persisting, or mutating proposal records?',
    nonApprovalStatement: 'This finalization is read-only evidence for a later review check; it is not proposal approval, proposal record creation, queue persistence, implementation authority, or source mutation authority.',
  };

  return {
    requiredFields: [
      'finalizationId',
      'sourceAcceptanceId',
      'targetQueueContract',
      'targetSchema',
      'finalizationPurpose',
      'finalizationFindings',
      'blockedActions',
      'reviewQuestion',
      'nonApprovalStatement',
    ],
    finalizationEnvelope: finalizationRecord,
    compatibility: {
      finalizationState,
      finalizationFindingsPassed: finalizationFindings.every((finding) => finding.ok),
      finalizationDoesNotApprove:
        finalizationBlockedActions.includes(currentFinalizationActions[0]) &&
        finalizationBlockedActions.includes('approve-proposal'),
      durableRecordPromotionBlocked:
        finalizationBlockedActions.includes(currentFinalizationActions[1]) &&
        finalizationBlockedActions.includes('persist-proposal-record'),
    },
  };
}

function buildReadiness({ acceptanceEnvelope, finalizationEnvelope, sourceSummary }) {
  return {
    acceptanceStatusReady: (acceptanceEnvelope.acceptedAcceptanceStates || []).includes(
      'accepted-for-read-only-finalization-check',
    ),
    finalizationEnvelopeDefined: finalizationEnvelope.requiredFields.every((field) => {
      return Object.hasOwn(finalizationEnvelope.finalizationEnvelope, field);
    }),
    finalizationFindingsPassed: finalizationEnvelope.compatibility.finalizationFindingsPassed,
    finalizationReadyForReviewCheck:
      finalizationEnvelope.compatibility.finalizationState === 'finalized-for-read-only-review-check',
    finalizationDoesNotApprove: finalizationEnvelope.compatibility.finalizationDoesNotApprove,
    durableRecordPromotionBlocked: finalizationEnvelope.compatibility.durableRecordPromotionBlocked,
    docsAndAggregateReady:
      sourceSummary.statusDocumented &&
      sourceSummary.statusAggregateRegistered &&
      sourceSummary.statusLedgered,
    engineReflectionAdvanced:
      sourceSummary.engineRoutesPastCurrentFinalization && sourceSummary.reflectionRoutesPastCurrentFinalization,
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

function readinessPassed(readiness, missingSources) {
  return (
    missingSources.length === 0 &&
    readiness.acceptanceStatusReady &&
    readiness.finalizationEnvelopeDefined &&
    readiness.finalizationFindingsPassed &&
    readiness.finalizationReadyForReviewCheck &&
    readiness.finalizationDoesNotApprove &&
    readiness.durableRecordPromotionBlocked &&
    readiness.docsAndAggregateReady &&
    readiness.engineReflectionAdvanced
  );
}

function buildPayload() {
  const sources = readSourceBundle();
  const missingSources = collectMissingSources();
  const sourceSummary = summarizeSources(sources, missingSources);
  const acceptanceResult = runStatusScript(PREVIOUS_STATUS);
  const acceptanceEnvelope = acceptanceResult.payload?.acceptanceEnvelope?.acceptanceEnvelope || {};
  const acceptanceFindings = acceptanceEnvelope.acceptanceFindings || [];
  const previousReadiness = acceptanceResult.payload?.readiness || {};
  const previousSafety = acceptanceResult.payload?.safetyBoundary || {};
  const finalizationFindings = buildFinalizationFindings({
    acceptanceEnvelope,
    acceptanceFindings,
    previousReadiness,
    previousSafety,
  });
  const finalizationBlockedActions = buildBlockedActions(acceptanceEnvelope.blockedActions || []);
  const finalizationEnvelope = buildFinalizationEnvelope({
    acceptanceEnvelope,
    finalizationFindings,
    finalizationBlockedActions,
  });
  const readiness = buildReadiness({
    acceptanceEnvelope,
    finalizationEnvelope,
    sourceSummary,
  });
  const ok = readinessPassed(readiness, missingSources);

  return {
    ok,
    mode: MODE,
    posture: 'local-read-only-ledger-proposal-record-acceptance-finalization-review-acceptance-finalization-review-acceptance-finalization-review-finalization-alias',
    schemaVersion: `${MODE}/v0`,
    currentHead: {
      branch: runGitOrNull(['branch', '--show-current']),
      commit: runGitOrNull(['rev-parse', '--short', 'HEAD']),
      status: runGitOrNull(['status', '--short', '--branch']),
    },
    sourceSummary,
    inputStatuses: {
      proposalRecordAcceptanceFinalizationReviewAcceptanceFinalizationReviewAcceptanceFinalizationReviewAcceptanceAlias: {
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
      commandToAdd: NEXT_COMMAND,
      reason:
        'The dry-run short-alias acceptance evidence is finalized only for a read-only review check; the next safe slice can review finalized evidence without approving, creating, persisting, implementing, or mutating proposal records.',
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
      acceptanceStatusOk: acceptanceResult.ok,
      acceptanceStatusExit: acceptanceResult.status,
    },
    failures: {
      missingSources,
      failedFinalizationFindings: finalizationFindings
        .filter((finding) => !finding.ok)
        .map((finding) => finding.id),
    },
  };
}

const payload = buildPayload();

console.log(JSON.stringify(payload, null, 2));
process.exit(payload.ok ? 0 : 1);
