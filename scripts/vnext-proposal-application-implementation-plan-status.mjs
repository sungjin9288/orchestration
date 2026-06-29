import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-plan-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
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

const requiredPlanSections = [
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

const requiredAttemptFields = [
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

for (const section of requiredPlanSections) {
  assert.match(sources.plan, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.plan, requiredDecisionFields);
assertContainsBacktickedAll(sources.plan, requiredAttemptFields);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
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
    '1. `proposal application implementation decision required`',
  ],
  inventory: ['vNext proposal application implementation plan'],
  readme: [
    'Proposal application implementation plan is planning-only evidence',
    'docs/33_proposal-application-implementation-plan.md',
  ],
  app: blockedAuthorityMarkers,
  verification: ['vnext-proposal-application-implementation-plan-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const handoffStatus = runStatus('scripts/vnext-proposal-application-operator-decision-handoff-status.mjs');
const packetStatus = runStatus('scripts/vnext-proposal-application-decision-packet-status.mjs');
const implementationStatus = runStatus('scripts/vnext-durable-proposal-record-implementation-status.mjs');
const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');

assert.equal(handoffStatus.ok, true);
assert.equal(packetStatus.ok, true);
assert.equal(implementationStatus.ok, true);
assert.equal(auditStatus.ok, true);
assert.equal(handoffStatus.currentGate, 'proposal application implementation decision required');
assert.equal(packetStatus.currentGate, 'proposal application implementation decision required');
assert.equal(packetStatus.authority?.proposalApplicationAllowed, false);
assert.equal(handoffStatus.authority?.proposalApplicationAllowed, false);
assert.equal(implementationStatus.authority?.proposalApplicationAllowed, false);
assert.equal(auditStatus.recommendedDevelopmentPlan?.[0]?.slice, 'proposal application implementation decision required');
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'proposal application implementation plan'),
  true,
);

const authority = {
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

const upstreamStatus = {
  proposalApplicationOperatorHandoff: {
    ok: handoffStatus.ok,
    currentGate: handoffStatus.currentGate,
    proposalApplicationAllowed: handoffStatus.authority?.proposalApplicationAllowed,
  },
  proposalApplicationDecisionPacket: {
    ok: packetStatus.ok,
    currentGate: packetStatus.currentGate,
    proposalApplicationAllowed: packetStatus.authority?.proposalApplicationAllowed,
  },
  durableProposalRecordImplementation: {
    ok: implementationStatus.ok,
    proposalApplicationAllowed: implementationStatus.authority?.proposalApplicationAllowed,
  },
  vnextAudit: {
    ok: auditStatus.ok,
    nextSlice: auditStatus.recommendedDevelopmentPlan?.[0]?.slice,
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
      plan: files.plan,
      acceptedDecisionId: 'operator-decision-vnext-proposal-application-001',
      targetAuthority: 'proposal application planning for existing durable proposal records',
      currentGate: 'proposal application implementation decision required',
      nextRequiredInput:
        'operator-provided application implementation decision for exactly one durable proposal record application path',
      applicationPlan: {
        source: 'existing durable proposal records',
        firstPath: 'audit-only application attempt',
        sourceMutationAllowed: false,
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
      upstreamStatus,
      authority,
    },
    null,
    2,
  )}\n`,
);
