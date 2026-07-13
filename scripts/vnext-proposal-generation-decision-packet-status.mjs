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

const STATUS_MODE = 'vnext-proposal-generation-decision-packet-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const files = {
  packet: 'docs/40_proposal-generation-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  authorityReview: 'docs/26_authority-expansion-review-spec.md',
  authorityPacket: 'docs/27_authority-implementation-decision-packet.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  growthConfig: 'ui/growth-config.js',
  growthPanels: 'ui/growth-panels.js',
  proposalQueue: 'scripts/growth-proposal-queue-status.mjs',
  proposalReadiness: 'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
  verification: 'scripts/verification_status.mjs',
};

const sections = [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Recommended Planning Target',
  '## Generation Boundary',
  '## Still Blocked',
  '## Stop Conditions',
  '## Copy-Ready Planning Decision',
  '## Verification',
];

const decisionOptions = [
  'approve-proposal-generation-planning-only',
  'request-more-evidence',
  'reject',
  'defer',
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

const authority = {
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

function assertUpstreamStatusesReady(statuses) {
  assert.equal(statuses.proposalQueue.ok, true, 'proposal queue status should pass');
  assert.equal(statuses.proposalReadiness.ok, true, 'proposal readiness status should pass');
}

function assertUpstreamSafetyBoundary(statuses) {
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
    statuses.proposalReadiness.safetyBoundary?.doesNotApplyProposals,
    true,
    'proposal readiness must not apply proposals',
  );
}

const sources = readRepoFiles(repoRoot, files);

const evidence = {
  packet: [
    'Original gate: `proposal generation planning decision required`',
    'Current gate: `proposal generation implementation decision required`',
    'Current packet status: `consumed-by-proposal-generation-planning-only-decision`',
    'deterministic local proposal draft generation from exactly one existing evidence candidate',
    'Provider-assisted generation: separately blocked',
    'It is not planning approval, implementation approval',
    'decisionId=operator-decision-vnext-proposal-generation-planning-001',
    'approvalStatement=I approve planning only for one deterministic local proposal draft generation path',
  ],
  proposalSpec: [
    'Proposal review, proposal record creation, and proposal application are separate gates',
    'Review acceptance can only feed the next explicit decision',
  ],
  authorityReview: [
    'proposal generation',
    'Review acceptance can only feed the next explicit decision',
  ],
  authorityPacket: [
    'targetAuthority',
    'proposal generation',
  ],
  audit: [
    'Completed: `proposal generation decision packet`',
    'Next implementation gate: `proposal draft human review decision required`',
  ],
  decisionLog: ['### DEC-068'],
  inventory: ['vNext proposal generation decision packet'],
  readme: [
    'Proposal generation decision packet:',
    'docs/40_proposal-generation-decision-packet.md',
  ],
  growthConfig: [
    'proposalGenerationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
    'sourceMutationAllowed: false',
    'commitPushAllowed: false',
  ],
  proposalQueue: [
    "const PROPOSAL_STATUSES = [",
    "'candidate'",
    "'ready-for-review'",
    'proposal records may describe a candidate slice but cannot write files',
  ],
  proposalReadiness: [
    'growth-evidence-ledger-proposal-readiness-status',
    'doesNotGenerateProposals: true',
  ],
  verification: ['vnext-proposal-generation-decision-packet-status.mjs'],
};

assertMarkdownSections(sources.packet, sections);
assertContainsBacktickedAll(sources.packet, decisionOptions);
assertContainsBacktickedAll(sources.packet, requiredDecisionFields);
assertSourceEvidence(sources, evidence);
assertDoesNotMatchAny(sources.growthPanels, [/data-action="generate-growth-proposal"/]);

const proposalQueueStatus = runStatus(repoRoot, 'scripts/growth-proposal-queue-status.mjs');
const proposalReadinessStatus = runStatus(
  repoRoot,
  'scripts/growth-evidence-ledger-proposal-readiness-status.mjs',
);

const upstreamStatuses = {
  proposalQueue: proposalQueueStatus,
  proposalReadiness: proposalReadinessStatus,
};

assertUpstreamStatusesReady(upstreamStatuses);
assertUpstreamSafetyBoundary(upstreamStatuses);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      posture: 'read-only-proposal-generation-decision-packet',
      packet: files.packet,
      currentGate: 'proposal generation implementation decision required',
      recommendedTarget: {
        authority: 'deterministic local proposal draft generation planning',
        inputCandidateCount: 1,
        providerAssisted: false,
        implementationAllowed: false,
      },
      decisionOptions,
      requiredDecisionFields,
      upstream: {
        proposalQueue: {
          ok: proposalQueueStatus.ok,
          nextRecommendedSlice: proposalQueueStatus.nextRecommendedSlice?.id || null,
        },
        proposalReadiness: {
          ok: proposalReadinessStatus.ok,
          nextRecommendedSlice: proposalReadinessStatus.nextRecommendedSlice?.id || null,
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
