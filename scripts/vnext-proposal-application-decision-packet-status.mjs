import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-decision-packet-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const proposalApplicationDecisionPacketFiles = {
  packet: 'docs/31_proposal-application-decision-packet.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  applicationPlan: 'docs/33_proposal-application-implementation-plan.md',
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
  '## Application Boundary',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const proposalApplicationDecisionRequiredFields = [
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

const proposalApplicationDecisionOptions = [
  'approve-application-planning-only',
  'approve-application-implementation-slice',
  'request-more-evidence',
  'reject',
  'defer',
];

const proposalApplicationDecisionPacketBlockedAuthorityMarkers = [
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

const proposalApplicationDecisionPacketSources = Object.fromEntries(
  Object.entries(proposalApplicationDecisionPacketFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of requiredPacketSections) {
  assert.match(
    proposalApplicationDecisionPacketSources.packet,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  proposalApplicationDecisionPacketSources.packet,
  proposalApplicationDecisionRequiredFields,
);
assertContainsBacktickedAll(
  proposalApplicationDecisionPacketSources.packet,
  proposalApplicationDecisionOptions,
);
assertDoesNotMatchAny(proposalApplicationDecisionPacketSources.app, forbiddenActionPatterns);

const proposalApplicationDecisionPacketSourceEvidence = {
  packet: [
    'Original gate: `proposal application decision required`',
    'Source implementation: `DEC-057`',
    'Current packet status: `consumed-by-application-planning-only-decision`',
    'Current application authority: planning only',
    'This packet turns the current `proposal application decision required` gate into a concrete decision input',
    'It is not proposal application approval',
    'creation approval and application approval are collapsed into one approval',
    'application approval and source mutation approval are collapsed into one approval',
    'commit or push is requested without a separate explicit approval',
  ],
  proposalSpec: [
    'Creation approval',
    'Application approval',
    'missing explicit application approval',
  ],
  implementationPlan: [
    'Runtime implementation: completed',
    'Next blocked authority: proposal application',
  ],
  applicationPlan: [
    'decisionId` | `operator-decision-vnext-proposal-application-001`',
    'decisionStatus` | `approve-application-planning-only`',
    'Current downstream gate: `proposal application implementation decision required`',
  ],
  decisionLog: ['### DEC-057', '### DEC-058', '### DEC-060'],
  audit: [
    'Completed: `proposal application decision packet`',
    'Completed: `proposal application implementation plan`',
    '1. `proposal application implementation decision required`',
  ],
  inventory: ['vNext proposal application decision packet'],
  readme: [
    'Proposal application decision packet is decision input only',
    'docs/31_proposal-application-decision-packet.md',
    'Proposal application implementation plan is planning-only evidence',
  ],
  app: proposalApplicationDecisionPacketBlockedAuthorityMarkers,
  verification: ['vnext-proposal-application-decision-packet-status.mjs'],
};

assertSourceEvidence(
  proposalApplicationDecisionPacketSources,
  proposalApplicationDecisionPacketSourceEvidence,
);

const vnextDevelopmentAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const proposalReviewDecisionSpecStatus = runStatus('scripts/vnext-proposal-review-decision-spec-status.mjs');
const durableProposalRecordImplementationStatus = runStatus(
  'scripts/vnext-durable-proposal-record-implementation-status.mjs',
);
const vnextDevelopmentAuditNextSlice =
  vnextDevelopmentAuditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationImplementationGate = 'proposal application implementation decision required';

assert.equal(vnextDevelopmentAuditStatus.ok, true);
assert.equal(proposalReviewDecisionSpecStatus.ok, true);
assert.equal(durableProposalRecordImplementationStatus.ok, true);
assert.equal(
  vnextDevelopmentAuditStatus.implemented?.some(
    (entry) => entry.area === 'proposal application decision packet',
  ),
  true,
);
assert.equal(vnextDevelopmentAuditNextSlice, proposalApplicationImplementationGate);
assert.equal(proposalReviewDecisionSpecStatus.authority?.proposalApplicationAllowed, false);
assert.equal(durableProposalRecordImplementationStatus.authority?.proposalApplicationAllowed, false);
assert.equal(
  durableProposalRecordImplementationStatus.authority
    ?.proposalRecordCreationAllowedThroughApprovedRuntimeFunction,
  true,
);

const proposalApplicationAuthorityBoundary = {
  proposalApplicationAllowed: false,
  proposalGenerationAllowed: false,
  proposalQueueMutationAllowed: false,
  proposalRecordUiCreateActionAllowed: false,
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

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-decision-packet',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      packet: proposalApplicationDecisionPacketFiles.packet,
      currentGate: proposalApplicationImplementationGate,
      nextRequiredInput:
        'operator-provided application implementation decision for exactly one durable proposal record application path',
      decisionOptions: proposalApplicationDecisionOptions,
      requiredDecisionFields: proposalApplicationDecisionRequiredFields,
      upstreamStatus: {
        proposalReviewDecisionSpec: {
          ok: proposalReviewDecisionSpecStatus.ok,
          proposalApplicationAllowed:
            proposalReviewDecisionSpecStatus.authority?.proposalApplicationAllowed,
        },
        durableProposalRecordImplementation: {
          ok: durableProposalRecordImplementationStatus.ok,
          proposalRecordCreationAllowedThroughApprovedRuntimeFunction:
            durableProposalRecordImplementationStatus.authority
              ?.proposalRecordCreationAllowedThroughApprovedRuntimeFunction,
          proposalApplicationAllowed:
            durableProposalRecordImplementationStatus.authority?.proposalApplicationAllowed,
        },
        vnextAudit: {
          ok: vnextDevelopmentAuditStatus.ok,
          nextSlice: vnextDevelopmentAuditNextSlice,
        },
      },
      authority: proposalApplicationAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
