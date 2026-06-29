import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-authority-implementation-decision-packet-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const proposalRecordDecisionPacketFiles = {
  packet: 'docs/27_authority-implementation-decision-packet.md',
  reviewSpec: 'docs/26_authority-expansion-review-spec.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const requiredPacketSections = [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Recommended First Candidate',
  '## Completion Path',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const proposalRecordDecisionRequiredFields = [
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

const proposalRecordDecisionOptions = [
  'approve-planning-only',
  'approve-implementation-slice',
  'request-more-evidence',
  'reject',
  'defer',
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

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(proposalRecordDecisionPacketFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of requiredPacketSections) {
  assert.match(sources.packet, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.packet, proposalRecordDecisionRequiredFields);
assertContainsBacktickedAll(sources.packet, proposalRecordDecisionOptions);

const sourceEvidence = {
  packet: [
    'Original gate: `operator decision required`',
    'Accepted follow-up: `DEC-056`',
    'Current downstream gate: `proposal application decision required`',
    'Current implementation authority: accepted for durable proposal record creation and persistence only',
    'Current packet status: `consumed-by-planning-only-decision`',
    'This packet does not provide that approval',
    'Proceed in this order',
    'write one implementation plan for durable proposal record creation and persistence',
    'This path is a sequence for finishing the project',
    'commit or push is requested without a separate explicit approval',
  ],
  reviewSpec: ['current downstream state to `proposal application decision required`'],
  implementationPlan: [
    'decisionStatus` | `approve-planning-only`',
    'Runtime implementation: completed',
  ],
  decisionLog: ['### DEC-052', '### DEC-053', '### DEC-056', '### DEC-057'],
  audit: ['Completed: `authority implementation decision packet`'],
  inventory: ['vNext authority implementation decision packet'],
  readme: [
    'Authority implementation decision packet is decision input only',
    'docs/27_authority-implementation-decision-packet.md',
  ],
  app: blockedAuthorityMarkers,
  verification: ['vnext-authority-implementation-decision-packet-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const authorityReviewStatus = runStatus('scripts/vnext-authority-expansion-review-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const operatorDecisionGate = 'operator decision required';
const proposalApplicationDecisionGate = 'proposal application decision required';
const proposalApplicationImplementationDecisionSlice =
  'proposal application implementation decision required';
const durableProposalRecordCreationCandidate = 'durable proposal record creation and persistence';

assert.equal(auditStatus.ok, true);
assert.equal(authorityReviewStatus.ok, true);
assert.equal(auditNextSlice, proposalApplicationImplementationDecisionSlice);
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'authority implementation decision packet'),
  true,
);

const authorityBoundary = {
  providerCallsAllowed: false,
  memoryPersistenceAllowed: false,
  longTermMemoryStoreAllowed: false,
  rawTranscriptIngestionAllowed: false,
  crossWorkspaceMemoryAllowed: false,
  skillPromotionAllowed: false,
  proposalGenerationAllowed: false,
  proposalApplicationAllowed: false,
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
  proposalRecordCreationAllowedThroughApprovedRuntimeFunction: true,
  proposalRecordPersistenceAllowedThroughApprovedRuntimeFunction: true,
  proposalRecordUiCreateActionAllowed: false,
  sourceMutationAllowed: false,
  commitPushAllowed: false,
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-authority-implementation-decision-packet',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      packet: proposalRecordDecisionPacketFiles.packet,
      originalGate: operatorDecisionGate,
      currentGate: proposalApplicationDecisionGate,
      recommendedFirstCandidate: durableProposalRecordCreationCandidate,
      decisionOptions: proposalRecordDecisionOptions,
      requiredDecisionFields: proposalRecordDecisionRequiredFields,
      upstreamStatus: {
        vnextAudit: {
          ok: auditStatus.ok,
          nextSlice: auditNextSlice,
        },
        implementationPlan: {
          registered: true,
          planningApproval: 'accepted',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
        },
        authorityExpansionReview: {
          ok: authorityReviewStatus.ok,
          posture: authorityReviewStatus.posture,
        },
      },
      authority: authorityBoundary,
    },
    null,
    2,
  )}\n`,
);
