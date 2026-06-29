import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-planning-preview-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const files = {
  preview: 'docs/28_durable-proposal-record-planning-preview.md',
  decisionPacket: 'docs/27_authority-implementation-decision-packet.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  proposalSpec: 'docs/24_proposal-review-decision-spec.md',
  audit: 'docs/23_vnext-development-audit.md',
  decisionLog: 'docs/01_decision-log.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  app: 'ui/app.js',
  verification: 'scripts/verification_status.mjs',
};

const requiredPreviewSections = [
  '## Purpose',
  '## Current Status',
  '## Non-Authority Boundary',
  '## Planning Scope',
  '## Record Shape Preview',
  '## Storage Candidate',
  '## Focused Smoke Preview',
  '## Rollback Preview',
  '## Stop Conditions',
  '## Verification',
];

const requiredRecordFields = [
  'proposalId',
  'title',
  'proposalType',
  'status',
  'createdAt',
  'sourceClaimIds',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'affectedFiles',
  'riskClass',
  'approvalGate',
  'reviewQuestion',
  'verificationPlan',
  'applyAllowed',
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

for (const section of requiredPreviewSections) {
  assert.match(sources.preview, new RegExp(`^${escapeRegExp(section)}$`, 'm'));
}

assertContainsBacktickedAll(sources.preview, requiredRecordFields);
assertDoesNotMatchAny(sources.app, forbiddenActionPatterns);

const sourceEvidence = {
  preview: [
    'It is not `approve-planning-only`',
    'Original gate: `operator decision required`',
    'Accepted follow-up: `DEC-056`',
    'Current downstream gate: `proposal application decision required`',
    'Implementation plan: `docs/30_durable-proposal-record-implementation-plan.md`',
    'consumed-by-planning-only-decision',
    'file-store-backed durable proposal record collection under the selected runtime root',
    'The planning preview only records that candidate',
    'proposal application remains blocked',
    'no later proposal application decision exists for the created durable proposal records',
  ],
  decisionPacket: ['This path is a sequence for finishing the project'],
  implementationPlan: [
    'decisionStatus` | `approve-planning-only`',
    'Runtime implementation: completed',
  ],
  proposalSpec: ['## Durable Proposal Record Contract'],
  decisionLog: ['### DEC-054', '### DEC-056'],
  audit: ['Completed: `durable proposal record planning preview`'],
  inventory: ['vNext durable proposal record planning preview'],
  readme: [
    'Durable proposal record planning preview is not planning approval',
    'docs/28_durable-proposal-record-planning-preview.md',
  ],
  app: blockedAuthorityMarkers,
  verification: ['vnext-durable-proposal-record-planning-preview-status.mjs'],
};

assertSourceEvidence(sources, sourceEvidence);

const decisionPacketStatus = runStatus('scripts/vnext-authority-implementation-decision-packet-status.mjs');
const proposalSpecStatus = runStatus('scripts/vnext-proposal-review-decision-spec-status.mjs');
const proposalQueueStatus = runStatus('scripts/growth-proposal-queue-status.mjs');
const creationReadinessStatus = runStatus(
  'scripts/growth-evidence-ledger-proposal-record-creation-readiness-status.mjs',
);
const auditStatus = runStatus('scripts/vnext-development-audit-status.mjs');
const auditNextSlice = auditStatus.recommendedDevelopmentPlan?.[0]?.slice;
const operatorDecisionGate = 'operator decision required';
const proposalApplicationDecisionGate = 'proposal application decision required';
const recommendedFirstCandidate = 'durable proposal record creation and persistence';

assert.equal(decisionPacketStatus.ok, true);
assert.equal(proposalSpecStatus.ok, true);
assert.equal(proposalQueueStatus.ok, true);
assert.equal(creationReadinessStatus.ok, true);
assert.equal(auditStatus.ok, true);
assert.equal(decisionPacketStatus.originalGate, operatorDecisionGate);
assert.equal(decisionPacketStatus.currentGate, proposalApplicationDecisionGate);
assert.equal(proposalSpecStatus.authority?.proposalRecordCreationAllowed, false);
assert.equal(proposalSpecStatus.authority?.proposalRecordPersistenceAllowed, false);
assert.equal(proposalQueueStatus.readiness?.proposalGenerationAllowed, false);
assert.equal(proposalQueueStatus.readiness?.proposalApplicationAllowed, false);
assert.equal(creationReadinessStatus.readiness?.proposalRecordCreationAllowed, false);
assert.equal(creationReadinessStatus.readiness?.proposalRecordPersistenceAllowed, false);
assert.equal(creationReadinessStatus.readiness?.implementationAllowed, false);
assert.equal(
  auditStatus.implemented?.some((entry) => entry.area === 'durable proposal record planning preview'),
  true,
);

const authority = {
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
      posture: 'read-only-durable-proposal-record-planning-preview',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      preview: files.preview,
      currentGate: proposalApplicationDecisionGate,
      recommendedFirstCandidate,
      nextRequiredInput: 'explicit proposal application decision before applying any durable proposal record',
      planningPreview: {
        targetAuthority: 'durable proposal record creation and persistence',
        storageCandidate: 'file-store-backed local proposal record collection under the selected runtime root',
        firstSliceOnly: true,
        proposalApplicationSeparated: true,
      },
      upstreamStatus: {
        decisionPacket: {
          ok: decisionPacketStatus.ok,
          currentGate: decisionPacketStatus.currentGate,
        },
        proposalDecisionSpec: {
          ok: proposalSpecStatus.ok,
          proposalRecordCreationAllowed: proposalSpecStatus.authority?.proposalRecordCreationAllowed,
        },
        proposalQueue: {
          ok: proposalQueueStatus.ok,
          proposalGenerationAllowed: proposalQueueStatus.readiness?.proposalGenerationAllowed,
          proposalApplicationAllowed: proposalQueueStatus.readiness?.proposalApplicationAllowed,
        },
        creationReadiness: {
          ok: creationReadinessStatus.ok,
          creationStillBlocked: creationReadinessStatus.readiness?.creationStillBlocked,
          implementationAllowed: creationReadinessStatus.readiness?.implementationAllowed,
        },
        vnextAudit: {
          ok: auditStatus.ok,
          nextSlice: auditNextSlice,
        },
        implementationPlan: {
          registered: true,
          planningApproval: 'accepted',
          implementationAuthority: 'accepted for durable proposal record creation and persistence only',
        },
      },
      authority,
    },
    null,
    2,
  )}\n`,
);
