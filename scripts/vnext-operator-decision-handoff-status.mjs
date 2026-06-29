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

assertContainsAll(sources.handoff, [
  'It is not an operator decision',
  'It is not `approve-planning-only`',
  'Current gate: `operator decision required`',
  'Handoff status: `ready-for-operator-input`',
  'Recommended first value: `durable proposal record creation and persistence`',
  'implementationPlanRefs` | Empty until `approve-planning-only` exists',
  'I approve planning only for durable proposal record creation and persistence',
  'This approval allows one implementation plan, rollback plan, and focused smoke plan',
  'does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push',
  'no explicit `approve-planning-only` or stronger accepted operator decision exists',
  'The script must stay read-only',
]);

assertContainsAll(sources.decisionPacket, [
  'Current gate: `operator decision required`',
  'Current implementation authority: blocked',
  'This packet does not provide that approval',
]);

assertContainsAll(sources.planningPreview, [
  'no explicit `approve-planning-only` or stronger accepted decision exists',
  'Current implementation authority: blocked',
  'proposal application remains blocked',
]);

assertContainsAll(sources.audit, [
  '1. `operator decision required`',
  'Completed: `durable proposal record planning preview`',
  'Completed: `operator decision handoff`',
]);

assertContainsAll(sources.decisionLog, ['### DEC-055']);
assertContainsAll(sources.inventory, ['vNext operator decision handoff']);
assertContainsAll(sources.readme, [
  'Operator decision handoff is not approval',
  'docs/29_operator-decision-handoff.md',
]);
assertContainsAll(sources.verification, [
  'vnext-operator-decision-handoff-status.mjs',
  'vnext-authority-implementation-decision-packet-status.mjs',
  'vnext-durable-proposal-record-planning-preview-status.mjs',
  'vnext-development-audit-status.mjs',
]);

const authority = {
  operatorDecisionRecorded: false,
  planningApproved: false,
  implementationApproved: false,
  proposalRecordCreationAllowed: false,
  proposalRecordPersistenceAllowed: false,
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
      currentGate: 'operator decision required',
      handoffStatus: 'ready-for-operator-input',
      recommendedFirstCandidate: 'durable proposal record creation and persistence',
      decisionOptions,
      invalidShortcutsRejected: invalidShortcuts,
      nextRequiredInput:
        'operator-provided approve-planning-only, approve-implementation-slice, request-more-evidence, reject, or defer decision with required fields',
      upstreamEvidence: {
        decisionPacket: {
          registered: true,
          currentGate: 'operator decision required',
          implementationAuthority: 'blocked',
        },
        planningPreview: {
          registered: true,
          currentGate: 'operator decision required',
          implementationAuthority: 'blocked',
          proposalApplication: 'blocked',
        },
        vnextAudit: {
          registered: true,
          nextSlice: 'operator decision required',
        },
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
