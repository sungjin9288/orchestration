import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  proposalApplicationSourceMutationDecisionRequiredInput,
  proposalApplicationSourceMutationDecisionSlice,
  proposalApplicationSourceMutationFieldedDecisionSlice,
  proposalApplicationSourceMutationOperatorHandoffSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-decision-packet-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const sourceMutationDecisionPacketFiles = {
  packet: 'docs/36_proposal-application-source-mutation-decision-packet.md',
  applicationImplementation: 'docs/35_proposal-application-implementation.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  app: 'ui/app.js',
};

const sourceMutationDecisionPacketSections = [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Source Mutation Boundary',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
];

const sourceMutationDecisionOptions = [
  'approve-source-mutation-planning-only',
  'approve-source-mutation-implementation-slice',
  'request-more-evidence',
  'reject',
  'defer',
];

const sourceMutationDecisionRequiredFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'applicationAttemptRefs',
  'mutationPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
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

const sourceMutationDecisionPacketSources = Object.fromEntries(
  Object.entries(sourceMutationDecisionPacketFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of sourceMutationDecisionPacketSections) {
  assert.match(
    sourceMutationDecisionPacketSources.packet,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  sourceMutationDecisionPacketSources.packet,
  sourceMutationDecisionRequiredFields,
);
assertDoesNotMatchAny(sourceMutationDecisionPacketSources.app, forbiddenActionPatterns);

const sourceMutationDecisionPacketSourceEvidence = {
  packet: [
    'It is not source mutation approval',
    'Original gate: `proposal application source mutation decision required`',
    'Current packet status: `decision-input-only`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation authority: blocked',
    ...sourceMutationDecisionOptions,
    'durable proposal record approval, application attempt approval, and source mutation approval are collapsed into one approval',
    'source mutation is requested without clean baseline proof, exact target-file scope, dry-run evidence, rollback proof, and focused smoke coverage',
    'node scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
  ],
  applicationImplementation: [
    'Implementation approval: accepted',
    'Runtime implementation: completed',
    'Proposal source mutation remains a separate authority decision',
  ],
  decisionLog: ['### DEC-063', 'Proposal application source mutation now stops at a read-only decision packet'],
  audit: [
    'Completed: `proposal application source mutation decision packet`',
    'Completed: `proposal application source mutation operator handoff`',
    '1. `proposal application source mutation fielded decision required`',
  ],
  inventory: ['vNext proposal application source mutation decision packet'],
  readme: [
    'Proposal application source mutation decision packet is decision input only',
    'docs/36_proposal-application-source-mutation-decision-packet.md',
  ],
  verification: ['vnext-proposal-application-source-mutation-decision-packet-status.mjs'],
  app: blockedAuthorityMarkers,
};

assertSourceEvidence(
  sourceMutationDecisionPacketSources,
  sourceMutationDecisionPacketSourceEvidence,
);

const applicationImplementationStatus = runStatus(
  'scripts/vnext-proposal-application-implementation-status.mjs',
);
const vnextAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');

assert.equal(applicationImplementationStatus.ok, true);
assert.equal(vnextAuditStatus.ok, true);
assert.equal(applicationImplementationStatus.authority?.sourceMutationAllowed, false);
assert.equal(vnextAuditStatus.recommendedDevelopmentPlan?.[0]?.slice, proposalApplicationSourceMutationFieldedDecisionSlice);
assert.equal(vnextAuditStatus.nextGrowthSlice, proposalApplicationSourceMutationFieldedDecisionSlice);

const sourceMutationDecisionPacketAuthorityBoundary = {
  sourceMutationPlanningAllowed: false,
  sourceMutationImplementationAllowed: false,
  proposalApplicationAllowed: false,
  proposalGenerationAllowed: false,
  proposalQueueMutationAllowed: false,
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
      posture: 'read-only-proposal-application-source-mutation-decision-packet',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      packet: sourceMutationDecisionPacketFiles.packet,
      currentGate: proposalApplicationSourceMutationDecisionSlice,
      nextRequiredInput: proposalApplicationSourceMutationDecisionRequiredInput,
      nextRecommendedSlice: proposalApplicationSourceMutationOperatorHandoffSlice,
      decisionOptions: sourceMutationDecisionOptions,
      requiredDecisionFields: sourceMutationDecisionRequiredFields,
      upstreamStatus: {
        applicationImplementation: {
          ok: applicationImplementationStatus.ok,
          sourceMutationAllowed: applicationImplementationStatus.authority?.sourceMutationAllowed,
        },
        vnextAudit: {
          ok: vnextAuditStatus.ok,
          nextSlice: vnextAuditStatus.nextGrowthSlice,
        },
      },
      authority: sourceMutationDecisionPacketAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
