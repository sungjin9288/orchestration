import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  proposalApplicationImplementationDecisionGate,
  proposalApplicationImplementationDecisionRequiredInput,
  proposalApplicationSourceMutationDecisionSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-plan-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const proposalApplicationImplementationPlanFiles = {
  plan: 'docs/33_proposal-application-implementation-plan.md',
  handoff: 'docs/32_proposal-application-operator-decision-handoff.md',
  decisionPacket: 'docs/31_proposal-application-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  durableImplementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const proposalApplicationImplementationPlanSections = [
  '## Purpose',
  '## Accepted Planning-Only Decision',
  '## Current Status',
  '## Application Plan',
  '## Application Contract',
  '## Rollback Plan',
  '## Focused Smoke Plan',
  '## Implementation Decision Required',
  '## Stop Conditions',
  '## Verification',
];

const proposalApplicationPlanningDecisionRequiredFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'applicationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const proposalApplicationAttemptFields = [
  'applicationAttemptId',
  'proposalId',
  'status',
  'createdAt',
  'updatedAt',
  'applicationApprovalRefs',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'blockedActions',
  'sourceMutationAllowed',
  'providerCallsAllowed',
  'memoryPersistenceAllowed',
  'commitAllowed',
  'pushAllowed',
  'nonApprovalStatement',
];

const proposalApplicationImplementationPlanBlockedAuthorityMarkers = [
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
  /data-action="apply-proposal"/,
  /data-action="approve-proposal"/,
  /data-action="generate-growth-proposal"/,
  /data-action="mutate-growth-source"/,
  /data-action="persist-growth-memory"/,
  /proposalApplicationAllowed: true/,
  /proposalGenerationAllowed: true/,
  /sourceMutationAllowed: true/,
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

function assertDoesNotMatchAny(source, patterns) {
  for (const pattern of patterns) {
    assert.doesNotMatch(source, pattern);
  }
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const proposalApplicationImplementationPlanSources = Object.fromEntries(
  Object.entries(proposalApplicationImplementationPlanFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of proposalApplicationImplementationPlanSections) {
  assert.match(
    proposalApplicationImplementationPlanSources.plan,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  proposalApplicationImplementationPlanSources.plan,
  proposalApplicationPlanningDecisionRequiredFields,
);
assertContainsBacktickedAll(
  proposalApplicationImplementationPlanSources.plan,
  proposalApplicationAttemptFields,
);
assertDoesNotMatchAny(proposalApplicationImplementationPlanSources.app, forbiddenActionPatterns);

const proposalApplicationImplementationPlanSourceEvidence = {
  plan: [
    'decisionId` | `operator-decision-vnext-proposal-application-001`',
    'decisionStatus` | `approve-application-planning-only`',
    'targetAuthority` | `proposal application planning for existing durable proposal records`',
    'Planning approval: accepted',
    'Implementation approval: blocked',
    'Current downstream gate: `proposal application implementation decision required`',
    'accept only existing records from the approved local runtime `proposalRecords` collection',
    'require an explicit application approval payload separate from the creation approval payload',
    'keep the first application path documentation-only and audit-only unless a later implementation decision names a narrower mutation path',
    'sourceMutationAllowed` | Always `false` for the first application attempt slice.',
    'providerCallsAllowed` | Always `false`.',
    'memoryPersistenceAllowed` | Always `false`.',
    'commitAllowed` | Always `false`.',
    'pushAllowed` | Always `false`.',
    'application planning is accepted but implementation remains blocked until a later decision',
    'no later `approve-application-implementation-slice` decision exists',
  ],
  handoff: [
    'Handoff status: `consumed-by-application-planning-only-decision`',
    'Current gate: `proposal application implementation decision required`',
  ],
  decisionPacket: [
    'Current packet status: `consumed-by-application-planning-only-decision`',
    'Current application authority: planning only',
  ],
  proposalSpec: [
    'Creation approval',
    'Application approval',
    'missing explicit application approval',
  ],
  durableImplementationPlan: [
    'Runtime implementation: completed',
    'Next blocked authority: proposal application',
  ],
  decisionLog: ['### DEC-058', '### DEC-059', '### DEC-060'],
  audit: [
    'Completed: `proposal application implementation plan`',
    '1. `proposal application source mutation decision required`',
  ],
  inventory: ['vNext proposal application implementation plan'],
  readme: [
    'Proposal application implementation plan is planning-only evidence',
    'docs/33_proposal-application-implementation-plan.md',
  ],
  app: proposalApplicationImplementationPlanBlockedAuthorityMarkers,
  verification: ['vnext-proposal-application-implementation-plan-status.mjs'],
};

assertSourceEvidence(
  proposalApplicationImplementationPlanSources,
  proposalApplicationImplementationPlanSourceEvidence,
);

const proposalApplicationOperatorHandoffStatus = runStatus(
  'scripts/vnext-proposal-application-operator-decision-handoff-status.mjs',
);
const proposalApplicationDecisionPacketStatus = runStatus(
  'scripts/vnext-proposal-application-decision-packet-status.mjs',
);
const durableProposalRecordImplementationStatus = runStatus(
  'scripts/vnext-durable-proposal-record-implementation-status.mjs',
);
const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
assert.equal(proposalApplicationOperatorHandoffStatus.ok, true);
assert.equal(proposalApplicationDecisionPacketStatus.ok, true);
assert.equal(durableProposalRecordImplementationStatus.ok, true);
assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(
  proposalApplicationOperatorHandoffStatus.currentGate,
  proposalApplicationImplementationDecisionGate,
);
assert.equal(
  proposalApplicationDecisionPacketStatus.currentGate,
  proposalApplicationImplementationDecisionGate,
);
assert.equal(proposalApplicationDecisionPacketStatus.authority?.proposalApplicationAllowed, false);
assert.equal(proposalApplicationOperatorHandoffStatus.authority?.proposalApplicationAllowed, false);
assert.equal(durableProposalRecordImplementationStatus.authority?.proposalApplicationAllowed, false);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationSourceMutationDecisionSlice);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'proposal application implementation plan',
  ),
  true,
);

const proposalApplicationImplementationPlanAuthorityBoundary = {
  planningApproved: true,
  implementationApproved: false,
  proposalApplicationAllowed: false,
  proposalApplicationImplementationAllowed: false,
  proposalGenerationAllowed: false,
  proposalQueueMutationAllowed: false,
  sourceMutationAllowed: false,
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
};

const proposalApplicationImplementationPlanUpstreamStatus = {
  proposalApplicationOperatorHandoff: {
    ok: proposalApplicationOperatorHandoffStatus.ok,
    currentGate: proposalApplicationOperatorHandoffStatus.currentGate,
    proposalApplicationAllowed:
      proposalApplicationOperatorHandoffStatus.authority?.proposalApplicationAllowed,
  },
  proposalApplicationDecisionPacket: {
    ok: proposalApplicationDecisionPacketStatus.ok,
    currentGate: proposalApplicationDecisionPacketStatus.currentGate,
    proposalApplicationAllowed:
      proposalApplicationDecisionPacketStatus.authority?.proposalApplicationAllowed,
  },
  durableProposalRecordImplementation: {
    ok: durableProposalRecordImplementationStatus.ok,
    proposalApplicationAllowed:
      durableProposalRecordImplementationStatus.authority?.proposalApplicationAllowed,
  },
  vnextAudit: {
    ok: vnextDevelopmentAuditStatus.ok,
    nextSlice: vnextDevelopmentAuditNextSlice,
  },
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'planning-only-proposal-application-implementation-plan',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      plan: proposalApplicationImplementationPlanFiles.plan,
      acceptedDecisionId: 'operator-decision-vnext-proposal-application-001',
      targetAuthority: 'proposal application planning for existing durable proposal records',
      currentGate: proposalApplicationImplementationDecisionGate,
      nextRequiredInput: proposalApplicationImplementationDecisionRequiredInput,
      applicationPlan: {
        source: 'existing durable proposal records',
        firstPath: 'audit-only application attempt',
        sourceMutationAllowed: false,
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
      upstreamStatus: proposalApplicationImplementationPlanUpstreamStatus,
      authority: proposalApplicationImplementationPlanAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
