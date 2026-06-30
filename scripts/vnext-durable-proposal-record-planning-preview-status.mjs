import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-planning-preview-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const durableProposalRecordPlanningPreviewFiles = {
  preview: 'docs/28_durable-proposal-record-planning-preview.md',
  decisionPacket: 'docs/27_authority-implementation-decision-packet.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const durableProposalPlanningPreviewSections = [
  '## Purpose',
  '## Current Status',
  '## Non-Authority Boundary',
  '## Planning Scope',
  '## Record Shape Preview',
  '## Storage Candidate',
  '## Focused Smoke Preview',
  '## Rollback Preview',
  '## Stop Conditions',
  '## Verification',
];

const durableProposalPlanningPreviewRecordFields = [
  'proposalId',
  'title',
  'proposalType',
  'status',
  'createdAt',
  'sourceClaimIds',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'affectedFiles',
  'riskClass',
  'approvalGate',
  'reviewQuestion',
  'verificationPlan',
  'applyAllowed',
];

const durableProposalPlanningPreviewBlockedAuthorityMarkers = [
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
  /data-action="create-proposal-record"/,
  /data-action="persist-proposal-record"/,
  /data-action="approve-proposal"/,
  /data-action="apply-proposal"/,
  /data-action="generate-growth-proposal"/,
  /data-action="persist-growth-memory"/,
  /data-action="mutate-growth-source"/,
  /proposalRecordCreationAllowed: true/,
  /proposalRecordPersistenceAllowed: true/,
  /proposalGenerationAllowed: true/,
  /proposalApplicationAllowed: true/,
];

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertContainsAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(escapeRegExp(expectedValue)));
  }
}

function assertSourceEvidence(sourcesByName, evidenceBySource) {
  for (const [sourceName, expectedValues] of Object.entries(evidenceBySource)) {
    assertContainsAll(sourcesByName[sourceName], expectedValues);
  }
}

function assertContainsBacktickedAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(`\\\`${escapeRegExp(expectedValue)}\\\``));
  }
}

function assertDoesNotMatchAny(source, forbiddenPatterns) {
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(source, forbiddenPattern);
  }
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const durableProposalRecordPlanningPreviewSources = Object.fromEntries(
  Object.entries(durableProposalRecordPlanningPreviewFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of durableProposalPlanningPreviewSections) {
  assert.match(
    durableProposalRecordPlanningPreviewSources.preview,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  durableProposalRecordPlanningPreviewSources.preview,
  durableProposalPlanningPreviewRecordFields,
);
assertDoesNotMatchAny(durableProposalRecordPlanningPreviewSources.app, forbiddenActionPatterns);

const durableProposalPlanningPreviewSourceEvidence = {
  preview: [
    'It is not `approve-planning-only`',
    'Original gate: `operator decision required`',
    'Accepted follow-up: `DEC-056`',
    'Current downstream gate: `proposal application decision required`',
    'Implementation plan: `docs/30_durable-proposal-record-implementation-plan.md`',
    'consumed-by-planning-only-decision',
    'file-store-backed durable proposal record collection under the selected runtime root',
    'The planning preview only records that candidate',
    'proposal application remains blocked',
    'no later proposal application decision exists for the created durable proposal records',
  ],
  decisionPacket: ['This path is a sequence for finishing the project'],
  implementationPlan: [
    'decisionStatus` | `approve-planning-only`',
    'Runtime implementation: completed',
  ],
  proposalSpec: ['## Durable Proposal Record Contract'],
  decisionLog: ['### DEC-054', '### DEC-056'],
  audit: ['Completed: `durable proposal record planning preview`'],
  inventory: ['vNext durable proposal record planning preview'],
  readme: [
    'Durable proposal record planning preview is not planning approval',
    'docs/28_durable-proposal-record-planning-preview.md',
  ],
  app: durableProposalPlanningPreviewBlockedAuthorityMarkers,
  verification: ['vnext-durable-proposal-record-planning-preview-status.mjs'],
};

assertSourceEvidence(durableProposalRecordPlanningPreviewSources, durableProposalPlanningPreviewSourceEvidence);

const proposalRecordDecisionPacketStatus = runStatus(
  'scripts/vnext-authority-implementation-decision-packet-status.mjs',
);
const proposalReviewDecisionSpecStatus = runStatus(
  'scripts/vnext-proposal-review-decision-spec-status.mjs',
);
const growthProposalQueueStatus = runStatus('scripts/growth-proposal-queue-status.mjs');
const proposalRecordCreationReadinessStatus = runStatus(
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
);
const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const operatorDecisionGate = 'operator decision required';
const proposalApplicationDecisionGate = 'proposal application decision required';
const durableProposalRecordCreationCandidate = 'durable proposal record creation and persistence';

assert.equal(proposalRecordDecisionPacketStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.ok, true);
assert.equal(growthProposalQueueStatus.ok, true);
assert.equal(proposalRecordCreationReadinessStatus.ok, true);
assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(proposalRecordDecisionPacketStatus.originalGate, operatorDecisionGate);
assert.equal(proposalRecordDecisionPacketStatus.currentGate, proposalApplicationDecisionGate);
assert.equal(proposalReviewDecisionSpecStatus.authority?.proposalRecordCreationAllowed, false);
assert.equal(proposalReviewDecisionSpecStatus.authority?.proposalRecordPersistenceAllowed, false);
assert.equal(growthProposalQueueStatus.readiness?.proposalGenerationAllowed, false);
assert.equal(growthProposalQueueStatus.readiness?.proposalApplicationAllowed, false);
assert.equal(
  proposalRecordCreationReadinessStatus.readiness?.proposalRecordCreationAllowed,
  false,
);
assert.equal(
  proposalRecordCreationReadinessStatus.readiness?.proposalRecordPersistenceAllowed,
  false,
);
assert.equal(proposalRecordCreationReadinessStatus.readiness?.implementationAllowed, false);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'durable proposal record planning preview',
  ),
  true,
);

const durableProposalPlanningPreviewAuthorityBoundary = {
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
  proposalRecordCreationAllowedThroughApprovedRuntimeFunction: true,
  proposalRecordPersistenceAllowedThroughApprovedRuntimeFunction: true,
  proposalRecordUiCreateActionAllowed: false,
  proposalGenerationAllowed: false,
  proposalApplicationAllowed: false,
  proposalQueueMutationAllowed: false,
  memoryPersistenceAllowed: false,
  providerCallsAllowed: false,
  runtimeMutationAllowed: false,
  uiActionMutationAllowed: false,
  sourceMutationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-durable-proposal-record-planning-preview',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      preview: durableProposalRecordPlanningPreviewFiles.preview,
      currentGate: proposalApplicationDecisionGate,
      recommendedFirstCandidate: durableProposalRecordCreationCandidate,
      nextRequiredInput: 'explicit proposal application decision before applying any durable proposal record',
      planningPreview: {
        targetAuthority: 'durable proposal record creation and persistence',
        storageCandidate: 'file-store-backed local proposal record collection under the selected runtime root',
        firstSliceOnly: true,
        proposalApplicationSeparated: true,
      },
      upstreamStatus: {
        decisionPacket: {
          ok: proposalRecordDecisionPacketStatus.ok,
          currentGate: proposalRecordDecisionPacketStatus.currentGate,
        },
        proposalDecisionSpec: {
          ok: proposalReviewDecisionSpecStatus.ok,
          proposalRecordCreationAllowed:
            proposalReviewDecisionSpecStatus.authority?.proposalRecordCreationAllowed,
        },
        proposalQueue: {
          ok: growthProposalQueueStatus.ok,
          proposalGenerationAllowed:
            growthProposalQueueStatus.readiness?.proposalGenerationAllowed,
          proposalApplicationAllowed:
            growthProposalQueueStatus.readiness?.proposalApplicationAllowed,
        },
        creationReadiness: {
          ok: proposalRecordCreationReadinessStatus.ok,
          creationStillBlocked:
            proposalRecordCreationReadinessStatus.readiness?.creationStillBlocked,
          implementationAllowed:
            proposalRecordCreationReadinessStatus.readiness?.implementationAllowed,
        },
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
        implementationPlan: {
          registered: true,
          planningApproval: 'accepted',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
        },
      },
      authority: durableProposalPlanningPreviewAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
