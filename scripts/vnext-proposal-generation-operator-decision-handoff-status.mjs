import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  assertContainsBacktickedAll,
  assertDoesNotMatchAny,
  assertMarkdownSections,
  assertSourceEvidence,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-generation-operator-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  handoff: 'docs/41_proposal-generation-operator-decision-handoff.md',
  decisionPacket: 'docs/40_proposal-generation-decision-packet.md',
  proposalQueue: 'scripts/growth-proposal-queue-status.mjs',
  proposalReadiness: 'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  decisionPacketStatus: 'scripts/vnext-proposal-generation-decision-packet-status.mjs',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
  growthPanels: 'ui/growth-panels.js',
};

const sections = [
  '## Purpose',
  '## Current Gate',
  '## Decision Response Template',
  '## Valid Decision Statements',
  '## Invalid Shortcuts',
  '## Minimum Planning Acceptance',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const requiredDecisionFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'generationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const decisionOptions = [
  'approve-proposal-generation-planning-only',
  'request-more-evidence',
  'reject',
  'defer',
];

const invalidShortcuts = [
  'continue',
  'proceed',
  'do everything',
  'approve all',
  'implement vNext',
  'enable proposal generation',
  'generate proposals',
  'ship it',
];

const blockedAuthorityMarkers = [
  'providerCallsAllowed: false',
  'memoryPersistenceAllowed: false',
  'longTermMemoryStoreAllowed: false',
  'rawTranscriptIngestionAllowed: false',
  'crossWorkspaceMemoryAllowed: false',
  'skillPromotionAllowed: false',
  'proposalGenerationAllowed: false',
  'proposalApplicationAllowed: false',
  'proposalRecordCreationAllowed: false',
  'proposalRecordPersistenceAllowed: false',
  'sourceMutationAllowed: false',
  'commitPushAllowed: false',
];

const forbiddenActionPatterns = [
  /data-action="generate-growth-proposal"/,
  /data-action="create-proposal-record"/,
  /data-action="apply-proposal"/,
  /data-action="approve-proposal"/,
  /data-action="mutate-growth-source"/,
  /data-action="persist-growth-memory"/,
  /proposalGenerationAllowed: true/,
  /providerCallsAllowed: true/,
  /memoryPersistenceAllowed: true/,
  /commitPushAllowed: true/,
];

const sources = readRepoFiles(repoRoot, files);

function assertUpstreamStatusesReady(statuses) {
  assert.equal(statuses.decisionPacket.ok, true, 'decision packet status should pass');
  assert.equal(statuses.proposalQueue.ok, true, 'proposal queue status should pass');
  assert.equal(statuses.proposalReadiness.ok, true, 'proposal readiness status should pass');
  assert.equal(statuses.vnextAudit.ok, true, 'vNext audit status should pass');
}

function assertUpstreamAuthorityStillBlocked(statuses) {
  assert.equal(
    statuses.decisionPacket.authority?.proposalGenerationPlanningAllowed,
    false,
    'decision packet must keep proposal generation planning blocked',
  );
  assert.equal(
    statuses.decisionPacket.authority?.proposalGenerationImplementationAllowed,
    false,
    'decision packet must keep proposal generation implementation blocked',
  );
  assert.equal(
    statuses.proposalQueue.safetyBoundary?.doesNotGenerateProposals,
    true,
    'proposal queue must remain non-generating',
  );
  assert.equal(
    statuses.proposalReadiness.safetyBoundary?.doesNotGenerateProposals,
    true,
    'proposal readiness must remain non-generating',
  );
  assert.equal(
    statuses.vnextAudit.nextImplementationGate?.implementationReady,
    false,
    'vNext audit must keep implementation gated',
  );
}

assertMarkdownSections(sources.handoff, sections);
assertContainsBacktickedAll(sources.handoff, requiredDecisionFields);
assertContainsBacktickedAll(sources.handoff, decisionOptions);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);
assertDoesNotMatchAny(sources.growthPanels, [/data-action="generate-growth-proposal"/]);

const evidence = {
  handoff: [
    ...invalidShortcuts,
    'It is not an operator decision',
    'Original gate: `proposal generation planning decision required`',
    'Handoff status: `consumed-by-proposal-generation-planning-only-decision`',
    'Consumed decision: `operator-decision-vnext-proposal-generation-planning-001`',
    'Current proposal generation planning authority: accepted planning-only evidence',
    'Current proposal generation implementation authority: blocked',
    'decisionStatus=approve-proposal-generation-planning-only',
    'targetAuthority=deterministic local proposal draft generation planning',
    'Allows exactly one existing Growth Evidence Ledger candidate as input',
    'It does not record a new operator decision or open proposal generation planning authority',
  ],
  decisionPacket: [
    'Current gate: `proposal generation implementation decision required`',
    'Current packet status: `consumed-by-proposal-generation-planning-only-decision`',
    'deterministic local proposal draft generation from exactly one existing evidence candidate',
    'approvalStatement=I approve planning only for one deterministic local proposal draft generation path',
  ],
  proposalQueue: [
    'doesNotGenerateProposals: true',
    'proposal records may describe a candidate slice but cannot write files',
  ],
  proposalReadiness: [
    'growth-evidence-ledger-proposal-readiness-status',
    'doesNotGenerateProposals: true',
  ],
  decisionPacketStatus: [
    "const STATUS_MODE = 'vnext-proposal-generation-decision-packet-status'",
    'proposalGenerationPlanningAllowed: false',
    'proposalGenerationImplementationAllowed: false',
    'doesNotGenerateProposals: true',
  ],
  decisionLog: ['### DEC-068', '### DEC-069'],
  audit: [
    'Completed: `proposal generation decision packet`',
    'Completed: `proposal generation operator decision handoff`',
    'Next implementation gate: `fielded proposal draft downstream authority decision required`',
  ],
  inventory: ['vNext proposal generation operator decision handoff'],
  readme: [
    'Proposal generation operator decision handoff is not approval',
    'docs/41_proposal-generation-operator-decision-handoff.md',
  ],
  verification: ['vnext-proposal-generation-operator-decision-handoff-status.mjs'],
  growthConfig: blockedAuthorityMarkers,
};

assertSourceEvidence(sources, evidence);

const decisionPacketStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-generation-decision-packet-status.mjs',
);
const proposalQueueStatus = runStatus(repoRoot, 'scripts/growth-proposal-queue-status.mjs');
const proposalReadinessStatus = runStatus(
  repoRoot,
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
);
const vnextAuditStatus = runStatus(repoRoot, 'scripts/vnext-development-audit-status.mjs');

const upstreamStatuses = {
  decisionPacket: decisionPacketStatus,
  proposalQueue: proposalQueueStatus,
  proposalReadiness: proposalReadinessStatus,
  vnextAudit: vnextAuditStatus,
};

assertUpstreamStatusesReady(upstreamStatuses);
assertUpstreamAuthorityStillBlocked(upstreamStatuses);

const authority = {
  handoffRecordsDecision: false,
  proposalGenerationPlanningAllowed: false,
  proposalGenerationImplementationAllowed: false,
  providerAssistedGenerationAllowed: false,
  proposalRecordCreationOutsideApprovedRuntimeAllowed: false,
  proposalRecordUiCreateActionAllowed: false,
  proposalApplicationAllowed: false,
  proposalQueueMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  runtimeMutationAllowed: false,
  uiMutationAllowed: false,
  sourceMutationOutsideApprovedPathAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-generation-operator-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      originalGate: 'proposal generation planning decision required',
      handoffStatus: 'consumed-by-proposal-generation-planning-only-decision',
      handoff: files.handoff,
      decisionPacket: files.decisionPacket,
      requiredDecisionFields,
      decisionOptions,
      invalidShortcutsRejected: invalidShortcuts,
      minimumPlanningAcceptance: {
        decisionStatus: 'approve-proposal-generation-planning-only',
        targetAuthority: 'deterministic local proposal draft generation planning',
        inputCandidateCount: 1,
        implementationAllowed: false,
        providerAssisted: false,
      },
      upstreamStatus: {
        decisionPacket: {
          ok: decisionPacketStatus.ok,
          currentGate: decisionPacketStatus.currentGate,
        },
        proposalQueue: {
          ok: proposalQueueStatus.ok,
          nextRecommendedSlice: proposalQueueStatus.nextRecommendedSlice?.id || null,
        },
        proposalReadiness: {
          ok: proposalReadinessStatus.ok,
          nextRecommendedSlice: proposalReadinessStatus.nextRecommendedSlice?.id || null,
        },
        vnextAudit: {
          ok: vnextAuditStatus.ok,
          nextSlice: vnextAuditStatus.nextGrowthSlice,
        },
      },
      authority,
      safetyBoundary: {
        readOnly: true,
        doesNotWriteFiles: true,
        doesNotMutateRuntime: true,
        doesNotMutateUi: true,
        doesNotGenerateProposals: true,
        doesNotCreateProposalRecords: true,
        doesNotApplyProposals: true,
        doesNotMutateProposalQueue: true,
        doesNotCallProviders: true,
        doesNotPersistMemory: true,
        doesNotMutateSource: true,
        doesNotCommit: true,
        doesNotPush: true,
      },
    },
    null,
    2,
  )}\n`,
);
