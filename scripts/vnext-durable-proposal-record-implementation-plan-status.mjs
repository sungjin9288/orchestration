import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-implementation-plan-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
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

const requiredPlanSections = [
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

const requiredRecordFields = [
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

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

for (const section of requiredPlanSections) {
  assert.match(sources.plan, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.plan, proposalRecordImplementationDecisionRequiredFields);
assertContainsBacktickedAll(sources.plan, requiredRecordFields);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
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
  app: blockedAuthorityMarkers,
  verification: ['vnext-durable-proposal-record-implementation-plan-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const handoffStatus = runStatus('scripts/vnext-operator-decision-handoff-status.mjs');
const planningPreviewStatus = runStatus('scripts/vnext-durable-proposal-record-planning-preview-status.mjs');
const proposalSpecStatus = runStatus('scripts/vnext-proposal-review-decision-spec-status.mjs');
const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const proposalApplicationDecisionGate = 'proposal application decision required';
const proposalApplicationImplementationDecisionSlice =
  'proposal application implementation decision required';

assert.equal(handoffStatus.ok, true);
assert.equal(planningPreviewStatus.ok, true);
assert.equal(proposalSpecStatus.ok, true);
assert.equal(auditStatus.ok, true);
assert.equal(proposalSpecStatus.authority?.proposalRecordCreationAllowed, false);
assert.equal(proposalSpecStatus.authority?.proposalRecordPersistenceAllowed, false);
assert.equal(auditNextSlice, proposalApplicationImplementationDecisionSlice);
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'durable proposal record implementation plan'),
  true,
);

const authority = {
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
      plan: files.plan,
      acceptedDecisionId: 'operator-decision-vnext-proposal-record-001',
      targetAuthority: 'durable proposal record creation and persistence',
      currentGate: proposalApplicationDecisionGate,
      nextRequiredInput: 'operator-provided proposal application decision for created durable proposal records',
      implementationPlan: {
        storage: 'existing runtime state.json under the selected runtime root',
        stateCollection: 'proposalRecords',
        sequence: 'proposalRecord',
        initialStatus: 'created',
        applyAllowed: false,
      },
      upstreamStatus: {
        handoff: {
          ok: handoffStatus.ok,
          currentGate: handoffStatus.currentGate,
        },
        planningPreview: {
          ok: planningPreviewStatus.ok,
          currentGate: planningPreviewStatus.currentGate,
        },
        proposalDecisionSpec: {
          ok: proposalSpecStatus.ok,
          proposalRecordCreationAllowed: proposalSpecStatus.authority?.proposalRecordCreationAllowed,
          proposalRecordPersistenceAllowed: proposalSpecStatus.authority?.proposalRecordPersistenceAllowed,
        },
        vnextAudit: {
          ok: auditStatus.ok,
          nextSlice: auditNextSlice,
        },
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
