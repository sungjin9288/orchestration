import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  durableProposalRecordCreationCandidate,
  durableProposalRecordDecisionId,
  proposalApplicationDecisionGate,
  proposalApplicationDecisionRequiredInput,
  proposalApplicationSourceMutationImplementationDecisionSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-implementation-plan-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const durableProposalRecordImplementationPlanFiles = {
  plan: 'docs/30_durable-proposal-record-implementation-plan.md',
  handoff: 'docs/29_operator-decision-handoff.md',
  preview: 'docs/28_durable-proposal-record-planning-preview.md',
  decisionPacket: 'docs/27_authority-implementation-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const durableProposalRecordImplementationPlanSections = [
  '## Purpose',
  '## Accepted Planning-Only Decision',
  '## Current Status',
  '## Implementation Plan',
  '## Record Contract',
  '## Rollback Plan',
  '## Focused Smoke Plan',
  '## Stop Conditions',
  '## Verification',
];

const proposalRecordImplementationDecisionRequiredFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'implementationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const durableProposalImplementationPlanRecordFields = [
  'proposalId',
  'title',
  'proposalType',
  'status',
  'createdAt',
  'updatedAt',
  'expiresAt',
  'sourceClaimIds',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'reviewerRefs',
  'approvalRefs',
  'affectedFiles',
  'riskClass',
  'approvalGate',
  'reviewQuestion',
  'verificationPlan',
  'blockedActions',
  'applyAllowed',
  'nonApprovalStatement',
];

const durableProposalRecordImplementationPlanBlockedAuthorityMarkers = [
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

const durableProposalRecordImplementationPlanSources = Object.fromEntries(
  Object.entries(durableProposalRecordImplementationPlanFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of durableProposalRecordImplementationPlanSections) {
  assert.match(
    durableProposalRecordImplementationPlanSources.plan,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  durableProposalRecordImplementationPlanSources.plan,
  proposalRecordImplementationDecisionRequiredFields,
);
assertContainsBacktickedAll(
  durableProposalRecordImplementationPlanSources.plan,
  durableProposalImplementationPlanRecordFields,
);
assertDoesNotMatchAny(durableProposalRecordImplementationPlanSources.app, forbiddenActionPatterns);

const durableProposalRecordImplementationPlanSourceEvidence = {
  plan: [
    'decisionId` | `operator-decision-vnext-proposal-record-001`',
    'decisionStatus` | `approve-planning-only`',
    'decisionId` | `operator-decision-vnext-proposal-record-implementation-001`',
    'decisionStatus` | `approve-implementation-slice`',
    'targetAuthority` | `durable proposal record creation and persistence`',
    'Planning approval: accepted',
    'Implementation approval: accepted',
    'Runtime implementation: completed',
    'Current implementation authority: local proposal record creation and persistence only',
    'extend the runtime state contract with a `proposalRecords` collection and a `proposalRecord` sequence',
    'persist records in the existing runtime `state.json` under the selected runtime root',
    'force `applyAllowed` to `false` for every created record',
    'record creation fails without explicit creation approval',
    'proposal application remains blocked',
    'provider calls remain blocked',
    'memory persistence remains blocked',
    'source mutation remains blocked',
    'commit and push remain blocked',
    'no later proposal application decision exists for created durable proposal records',
  ],
  handoff: ['I approve planning only for durable proposal record creation and persistence'],
  preview: ['file-store-backed durable proposal record collection under the selected runtime root'],
  decisionPacket: ['write one implementation plan for durable proposal record creation and persistence'],
  proposalSpec: ['## Durable Proposal Record Contract'],
  decisionLog: ['### DEC-056', '### DEC-057'],
  audit: ['Completed: `durable proposal record implementation plan`'],
  inventory: ['vNext durable proposal record implementation plan'],
  readme: [
    'Durable proposal record creation and persistence is implemented',
    'docs/30_durable-proposal-record-implementation-plan.md',
  ],
  app: durableProposalRecordImplementationPlanBlockedAuthorityMarkers,
  verification: ['vnext-durable-proposal-record-implementation-plan-status.mjs'],
};

assertSourceEvidence(
  durableProposalRecordImplementationPlanSources,
  durableProposalRecordImplementationPlanSourceEvidence,
);

const proposalRecordOperatorHandoffStatus = runStatus(
  'scripts/vnext-operator-decision-handoff-status.mjs',
);
const durableProposalRecordPlanningPreviewStatus = runStatus(
  'scripts/vnext-durable-proposal-record-planning-preview-status.mjs',
);
const proposalReviewDecisionSpecStatus = runStatus(
  'scripts/vnext-proposal-review-decision-spec-status.mjs',
);
const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
assert.equal(proposalRecordOperatorHandoffStatus.ok, true);
assert.equal(durableProposalRecordPlanningPreviewStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.ok, true);
assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.authority?.proposalRecordCreationAllowed, false);
assert.equal(proposalReviewDecisionSpecStatus.authority?.proposalRecordPersistenceAllowed, false);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationSourceMutationImplementationDecisionSlice);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'durable proposal record implementation plan',
  ),
  true,
);

const durableProposalRecordImplementationAuthorityBoundary = {
  planningApproved: true,
  implementationApproved: true,
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
      posture: 'implemented-durable-proposal-record-implementation-plan',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      plan: durableProposalRecordImplementationPlanFiles.plan,
      acceptedDecisionId: durableProposalRecordDecisionId,
      targetAuthority: durableProposalRecordCreationCandidate,
      currentGate: proposalApplicationDecisionGate,
      nextRequiredInput: proposalApplicationDecisionRequiredInput,
      implementationPlan: {
        storage: 'existing runtime state.json under the selected runtime root',
        stateCollection: 'proposalRecords',
        sequence: 'proposalRecord',
        initialStatus: 'created',
        applyAllowed: false,
      },
      upstreamStatus: {
        handoff: {
          ok: proposalRecordOperatorHandoffStatus.ok,
          currentGate: proposalRecordOperatorHandoffStatus.currentGate,
        },
        planningPreview: {
          ok: durableProposalRecordPlanningPreviewStatus.ok,
          currentGate: durableProposalRecordPlanningPreviewStatus.currentGate,
        },
        proposalDecisionSpec: {
          ok: proposalReviewDecisionSpecStatus.ok,
          proposalRecordCreationAllowed:
            proposalReviewDecisionSpecStatus.authority?.proposalRecordCreationAllowed,
          proposalRecordPersistenceAllowed:
            proposalReviewDecisionSpecStatus.authority?.proposalRecordPersistenceAllowed,
        },
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
      },
      authority: durableProposalRecordImplementationAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
