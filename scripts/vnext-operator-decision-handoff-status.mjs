import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-operator-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  handoff: 'docs/29_operator-decision-handoff.md',
  decisionPacket: 'docs/27_authority-implementation-decision-packet.md',
  planningPreview: 'docs/28_durable-proposal-record-planning-preview.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const requiredHandoffSections = [
  '## Purpose',
  '## Current Gate',
  '## Decision Response Template',
  '## Valid Decision Statements',
  '## Invalid Shortcuts',
  '## Minimum Planning-Only Acceptance',
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

const invalidShortcuts = [
  'continue',
  'proceed',
  'do everything',
  'implement vNext',
  'build the proposal record feature',
  'approve all',
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

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredHandoffSections) {
  assert.match(sources.handoff, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.handoff, requiredDecisionFields);
assertContainsBacktickedAll(sources.handoff, decisionOptions);
assertContainsAll(sources.handoff, invalidShortcuts);
assertContainsAll(sources.app, blockedAuthorityMarkers);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
  handoff: [
    'It is not an operator decision',
    'It is not `approve-planning-only`',
    'Original gate: `operator decision required`',
    'Accepted follow-up: `DEC-056`',
    'Current downstream gate: `proposal application decision required`',
    'Implementation plan: `docs/30_durable-proposal-record-implementation-plan.md`',
    'Handoff status: `consumed-by-planning-only-decision`',
    'Recommended first value: `durable proposal record creation and persistence`',
    'implementationPlanRefs` | Empty until `approve-planning-only` exists',
    'I approve planning only for durable proposal record creation and persistence',
    'This approval allows one implementation plan, rollback plan, and focused smoke plan',
    'does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push',
    'no explicit proposal application decision exists for created durable proposal records',
    'The script must stay read-only',
  ],
  decisionPacket: [
    'Original gate: `operator decision required`',
    'Current downstream gate: `proposal application decision required`',
    'Current packet status: `consumed-by-planning-only-decision`',
    'Current implementation authority: accepted for durable proposal record creation and persistence only',
    'This packet does not provide that approval',
  ],
  planningPreview: [
    'Original gate: `operator decision required`',
    'Current downstream gate: `proposal application decision required`',
    'no later proposal application decision exists for the created durable proposal records',
    'Current implementation authority: accepted for durable proposal record creation and persistence only',
    'proposal application remains blocked',
  ],
  implementationPlan: [
    'decisionStatus` | `approve-planning-only`',
    'Planning approval: accepted',
    'Implementation approval: accepted',
    'Runtime implementation: completed',
  ],
  audit: [
    'Completed: `durable proposal record planning preview`',
    'Completed: `operator decision handoff`',
    'Completed: `durable proposal record implementation plan`',
    '1. `proposal application implementation decision required`',
  ],
  decisionLog: ['### DEC-055', '### DEC-056'],
  inventory: ['vNext operator decision handoff'],
  readme: [
    'Operator decision handoff is not approval',
    'docs/29_operator-decision-handoff.md',
  ],
  verification: [
    'vnext-operator-decision-handoff-status.mjs',
    'vnext-authority-implementation-decision-packet-status.mjs',
    'vnext-durable-proposal-record-planning-preview-status.mjs',
    'vnext-durable-proposal-record-implementation-plan-status.mjs',
    'vnext-development-audit-status.mjs',
  ],
};

for (const [sourceName, expectedValues] of Object.entries(sourceEvidence)) {
  assertContainsAll(sources[sourceName], expectedValues);
}

const authority = {
  handoffRecordsDecision: false,
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
      posture: 'read-only-operator-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      handoff: files.handoff,
      currentGate: 'proposal application decision required',
      handoffStatus: 'consumed-by-planning-only-decision',
      acceptedDecisionId: 'operator-decision-vnext-proposal-record-001',
      recommendedFirstCandidate: 'durable proposal record creation and persistence',
      decisionOptions,
      invalidShortcutsRejected: invalidShortcuts,
      nextRequiredInput:
        'operator-provided proposal application decision for created durable proposal records',
      upstreamEvidence: {
        decisionPacket: {
          registered: true,
          originalGate: 'operator decision required',
          currentGate: 'proposal application decision required',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
        },
        planningPreview: {
          registered: true,
          originalGate: 'operator decision required',
          currentGate: 'proposal application decision required',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
          proposalApplication: 'blocked',
        },
        implementationPlan: {
          registered: true,
          planningApproval: 'accepted',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
        },
        vnextAudit: {
          registered: true,
          nextSlice: 'proposal application implementation decision required',
        },
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
