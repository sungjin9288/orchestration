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

const files = {
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

const requiredDecisionFields = [
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

const decisionOptions = [
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

function assertContainsBacktickedAll(source, expectedValues) {
  for (const expectedValue of expectedValues) {
    assert.match(source, new RegExp(`\\\`${escapeRegExp(expectedValue)}\\\``));
  }
}

function runStatus(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredPacketSections) {
  assert.match(sources.packet, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.packet, requiredDecisionFields);
assertContainsBacktickedAll(sources.packet, decisionOptions);
assertContainsAll(sources.app, blockedAuthorityMarkers);

assertContainsAll(sources.packet, [
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
]);

assertContainsAll(sources.reviewSpec, [
  'current downstream state to `proposal application decision required`',
]);
assertContainsAll(sources.implementationPlan, [
  'decisionStatus` | `approve-planning-only`',
  'Runtime implementation: completed',
]);
assertContainsAll(sources.decisionLog, ['### DEC-052', '### DEC-053', '### DEC-056', '### DEC-057']);
assertContainsAll(sources.audit, ['Completed: `authority implementation decision packet`']);
assertContainsAll(sources.inventory, ['vNext authority implementation decision packet']);
assertContainsAll(sources.readme, [
  'Authority implementation decision packet is decision input only',
  'docs/27_authority-implementation-decision-packet.md',
]);
assertContainsAll(sources.verification, ['vnext-authority-implementation-decision-packet-status.mjs']);

const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const authorityReviewStatus = runStatus('scripts/vnext-authority-expansion-review-status.mjs');

assert.equal(auditStatus.ok, true);
assert.equal(authorityReviewStatus.ok, true);
assert.equal(auditStatus.recommendedDevelopmentPlan?.[0]?.slice, 'proposal application implementation decision required');
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'authority implementation decision packet'),
  true,
);

const authority = {
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
      packet: files.packet,
      originalGate: 'operator decision required',
      currentGate: 'proposal application decision required',
      recommendedFirstCandidate: 'durable proposal record creation and persistence',
      decisionOptions,
      requiredDecisionFields,
      upstreamStatus: {
        vnextAudit: {
          ok: auditStatus.ok,
          nextSlice: auditStatus.recommendedDevelopmentPlan?.[0]?.slice,
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
      authority,
    },
    null,
    2,
  )}\n`,
);
