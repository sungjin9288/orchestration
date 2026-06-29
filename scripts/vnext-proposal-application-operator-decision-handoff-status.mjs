import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-operator-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  handoff: 'docs/32_proposal-application-operator-decision-handoff.md',
  decisionPacket: 'docs/31_proposal-application-decision-packet.md',
  applicationPlan: 'docs/33_proposal-application-implementation-plan.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const requiredSections = [
  '## Purpose',
  '## Current Gate',
  '## Decision Response Template',
  '## Valid Decision Statements',
  '## Invalid Shortcuts',
  '## Minimum Planning-Only Acceptance',
  '## Minimum Implementation-Slice Acceptance',
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
  'applicationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

const decisionOptions = [
  'approve-application-planning-only',
  'approve-application-implementation-slice',
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

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredSections) {
  assert.match(sources.handoff, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.handoff, requiredDecisionFields);
assertContainsBacktickedAll(sources.handoff, decisionOptions);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
  handoff: [
    'Current gate: `proposal application implementation decision required`',
    'Decision packet: `docs/31_proposal-application-decision-packet.md`',
    'Handoff status: `consumed-by-application-planning-only-decision`',
    'It is not an operator decision',
    'It is not proposal application approval',
    'It is not source mutation approval',
    'durable proposal record creation approval as application approval',
    'application planning and implementation approval are collapsed into one unclear statement',
    'application approval and source mutation approval are collapsed into one statement',
  ],
  decisionPacket: [
    'Current packet status: `consumed-by-application-planning-only-decision`',
    'Current application authority: planning only',
    'approve-application-planning-only',
    'approve-application-implementation-slice',
  ],
  applicationPlan: [
    'decisionId` | `operator-decision-vnext-proposal-application-001`',
    'decisionStatus` | `approve-application-planning-only`',
    'Current downstream gate: `proposal application implementation decision required`',
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
  decisionLog: ['### DEC-058', '### DEC-059', '### DEC-060'],
  audit: [
    'Completed: `proposal application operator decision handoff`',
    'Completed: `proposal application implementation plan`',
    '1. `proposal application implementation decision required`',
  ],
  inventory: ['vNext proposal application operator decision handoff'],
  readme: [
    'Proposal application operator decision handoff is not approval',
    'docs/32_proposal-application-operator-decision-handoff.md',
    'Proposal application implementation plan is planning-only evidence',
  ],
  app: blockedAuthorityMarkers,
  verification: ['vnext-proposal-application-operator-decision-handoff-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const packetStatus = runStatus('scripts/vnext-proposal-application-decision-packet-status.mjs');
const proposalSpecStatus = runStatus('scripts/vnext-proposal-review-decision-spec-status.mjs');
const implementationStatus = runStatus('scripts/vnext-durable-proposal-record-implementation-status.mjs');
const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;

assert.equal(packetStatus.ok, true);
assert.equal(proposalSpecStatus.ok, true);
assert.equal(implementationStatus.ok, true);
assert.equal(auditStatus.ok, true);
assert.equal(packetStatus.authority?.proposalApplicationAllowed, false);
assert.equal(proposalSpecStatus.authority?.proposalApplicationAllowed, false);
assert.equal(implementationStatus.authority?.proposalApplicationAllowed, false);
assert.equal(auditNextSlice, 'proposal application implementation decision required');
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'proposal application operator decision handoff'),
  true,
);

const authority = {
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

const upstreamStatus = {
  proposalApplicationDecisionPacket: {
    ok: packetStatus.ok,
    proposalApplicationAllowed: packetStatus.authority?.proposalApplicationAllowed,
  },
  proposalReviewDecisionSpec: {
    ok: proposalSpecStatus.ok,
    proposalApplicationAllowed: proposalSpecStatus.authority?.proposalApplicationAllowed,
  },
  durableProposalRecordImplementation: {
    ok: implementationStatus.ok,
    proposalApplicationAllowed: implementationStatus.authority?.proposalApplicationAllowed,
  },
  vnextAudit: {
    ok: auditStatus.ok,
    nextSlice: auditNextSlice,
  },
};

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'read-only-proposal-application-operator-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      handoff: files.handoff,
      currentGate: 'proposal application implementation decision required',
      nextRequiredInput:
        'operator-provided application implementation decision for exactly one durable proposal record application path',
      decisionOptions,
      requiredDecisionFields,
      upstreamStatus,
      authority,
    },
    null,
    2,
  )}\n`,
);
