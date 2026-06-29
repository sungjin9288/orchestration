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

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredHandoffSections) {
  assert.match(sources.handoff, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

for (const field of requiredDecisionFields) {
  assert.match(sources.handoff, new RegExp(`\\\`${escapeRegExp(field)}\\\``));
}

for (const option of decisionOptions) {
  assert.match(sources.handoff, new RegExp(`\\\`${escapeRegExp(option)}\\\``));
}

for (const shortcut of invalidShortcuts) {
  assert.match(sources.handoff, new RegExp(escapeRegExp(shortcut)));
}

for (const marker of blockedAuthorityMarkers) {
  assert.match(sources.app, new RegExp(escapeRegExp(marker)));
}

for (const pattern of forbiddenActionPatterns) {
  assert.doesNotMatch(sources.app, pattern);
}

assert.match(sources.handoff, /It is not an operator decision/);
assert.match(sources.handoff, /It is not `approve-planning-only`/);
assert.match(sources.handoff, /Current gate: `operator decision required`/);
assert.match(sources.handoff, /Handoff status: `ready-for-operator-input`/);
assert.match(sources.handoff, /Recommended first value: `durable proposal record creation and persistence`/);
assert.match(sources.handoff, /implementationPlanRefs` \| Empty until `approve-planning-only` exists/);
assert.match(sources.handoff, /I approve planning only for durable proposal record creation and persistence/);
assert.match(sources.handoff, /This approval allows one implementation plan, rollback plan, and focused smoke plan/);
assert.match(sources.handoff, /does not approve implementation, proposal application, provider calls, memory persistence, source mutation, commit, or push/);
assert.match(sources.handoff, /no explicit `approve-planning-only` or stronger accepted operator decision exists/);
assert.match(sources.handoff, /The script must stay read-only/);
assert.match(sources.decisionPacket, /Current gate: `operator decision required`/);
assert.match(sources.decisionPacket, /Current implementation authority: blocked/);
assert.match(sources.decisionPacket, /This packet does not provide that approval/);
assert.match(sources.planningPreview, /no explicit `approve-planning-only` or stronger accepted decision exists/);
assert.match(sources.planningPreview, /Current implementation authority: blocked/);
assert.match(sources.planningPreview, /proposal application remains blocked/);
assert.match(sources.audit, /1\. `operator decision required`/);
assert.match(sources.audit, /Completed: `durable proposal record planning preview`/);
assert.match(sources.decisionLog, /### DEC-055/);
assert.match(sources.audit, /Completed: `operator decision handoff`/);
assert.match(sources.inventory, /vNext operator decision handoff/);
assert.match(sources.readme, /Operator decision handoff is not approval/);
assert.match(sources.readme, /docs\/29_operator-decision-handoff\.md/);
assert.match(sources.verification, /vnext-operator-decision-handoff-status\.mjs/);
assert.match(sources.verification, /vnext-authority-implementation-decision-packet-status\.mjs/);
assert.match(sources.verification, /vnext-durable-proposal-record-planning-preview-status\.mjs/);
assert.match(sources.verification, /vnext-development-audit-status\.mjs/);

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
