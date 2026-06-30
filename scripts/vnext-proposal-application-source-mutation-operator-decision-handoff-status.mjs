import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  proposalApplicationSourceMutationBlockedAuthorityMarkers,
  proposalApplicationSourceMutationFieldedDecisionSlice,
  proposalApplicationSourceMutationFieldedDecisionRequiredInput,
  proposalApplicationSourceMutationDecisionRequiredFields,
  proposalApplicationSourceMutationForbiddenActionPatterns,
  proposalApplicationSourceMutationInvalidShortcutPhrases,
  proposalApplicationSourceMutationOperatorHandoffSlice,
} from './vnext-status-constants.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-operator-decision-handoff-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const sourceMutationOperatorHandoffFiles = {
  handoff: 'docs/37_proposal-application-source-mutation-operator-decision-handoff.md',
  decisionPacket: 'docs/36_proposal-application-source-mutation-decision-packet.md',
  applicationImplementation: 'docs/35_proposal-application-implementation.md',
  applicationImplementationStatus: 'scripts/vnext-proposal-application-implementation-status.mjs',
  sourceMutationDecisionPacketStatus:
    'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  app: 'ui/app.js',
};

const sourceMutationOperatorHandoffSections = [
  '## Purpose',
  '## Current Gate',
  '## Source Evidence',
  '## Planning-Only Decision Shape',
  '## Implementation-Slice Decision Shape',
  '## Request More Evidence',
  '## Reject Or Defer',
  '## Invalid Shortcuts',
  '## Minimum Planning Acceptance',
  '## Minimum Implementation Acceptance',
  '## Still Blocked',
  '## Stop Conditions',
  '## Verification',
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

const sourceMutationOperatorHandoffSources = Object.fromEntries(
  Object.entries(sourceMutationOperatorHandoffFiles).map(([name, relativePath]) => [
    name,
    readFile(relativePath),
  ]),
);

for (const section of sourceMutationOperatorHandoffSections) {
  assert.match(
    sourceMutationOperatorHandoffSources.handoff,
    new RegExp(`^${escapeRegExp(section)}$`, 'm'),
  );
}

assertContainsBacktickedAll(
  sourceMutationOperatorHandoffSources.handoff,
  proposalApplicationSourceMutationDecisionRequiredFields,
);
assertDoesNotMatchAny(
  sourceMutationOperatorHandoffSources.app,
  proposalApplicationSourceMutationForbiddenActionPatterns,
);

const sourceMutationOperatorHandoffSourceEvidence = {
  handoff: [
    ...proposalApplicationSourceMutationInvalidShortcutPhrases,
    'It is not an operator decision',
    'Current gate: `proposal application source mutation operator handoff required`',
    'Handoff status: `decision-input-only`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation authority: blocked',
    'decisionStatus=approve-source-mutation-planning-only',
    'targetAuthority=proposal application source mutation planning for one audit-only application attempt path',
    'decisionStatus=approve-source-mutation-implementation-slice',
    'targetAuthority=proposal application source mutation implementation for exactly one accepted mutation plan',
    'decisionStatus=request-more-evidence',
    'decisionStatus=reject',
    'applicationAttemptRefs',
    'mutationPlanRefs',
    'clean baseline proof',
    'It does not approve source mutation implementation, proposal generation, provider calls, memory persistence, commit, or push.',
    'node scripts/vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs',
  ],
  decisionPacket: [
    'Current packet status: `decision-input-only`',
    'Current proposal application authority: audit-only attempt records only',
    'Current source mutation authority: blocked',
    'approve-source-mutation-planning-only',
    'approve-source-mutation-implementation-slice',
  ],
  applicationImplementation: [
    'Implementation approval: accepted',
    'Runtime implementation: completed',
    'Proposal source mutation remains a separate authority decision',
  ],
  applicationImplementationStatus: [
    'sourceMutationAllowed: false',
    'proposalGenerationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
  ],
  sourceMutationDecisionPacketStatus: [
    'posture: \'read-only-proposal-application-source-mutation-decision-packet\'',
    'sourceMutationImplementationAllowed: false',
    'sourceMutationPlanningAllowed: false',
  ],
  decisionLog: [
    '### DEC-064',
    'Proposal application source mutation operator handoff is documented as read-only decision input',
  ],
  audit: [
    'Completed: `proposal application source mutation operator handoff`',
    '1. `proposal application source mutation fielded decision required`',
  ],
  inventory: ['vNext proposal application source mutation operator handoff'],
  readme: [
    'Proposal application source mutation operator handoff is not approval',
    'docs/37_proposal-application-source-mutation-operator-decision-handoff.md',
  ],
  verification: ['vnext-proposal-application-source-mutation-operator-decision-handoff-status.mjs'],
  app: proposalApplicationSourceMutationBlockedAuthorityMarkers,
};

assertSourceEvidence(
  sourceMutationOperatorHandoffSources,
  sourceMutationOperatorHandoffSourceEvidence,
);

const sourceMutationDecisionPacketStatus = runStatus(
  'scripts/vnext-proposal-application-source-mutation-decision-packet-status.mjs',
);
const applicationImplementationStatus = runStatus(
  'scripts/vnext-proposal-application-implementation-status.mjs',
);
const vnextAuditStatus = runStatus('scripts/vnext-development-audit-status.mjs');

assert.equal(sourceMutationDecisionPacketStatus.ok, true);
assert.equal(applicationImplementationStatus.ok, true);
assert.equal(vnextAuditStatus.ok, true);
assert.equal(
  sourceMutationDecisionPacketStatus.nextRecommendedSlice,
  proposalApplicationSourceMutationOperatorHandoffSlice,
);
assert.equal(applicationImplementationStatus.authority?.sourceMutationAllowed, false);
assert.equal(
  vnextAuditStatus.recommendedDevelopmentPlan?.[0]?.slice,
  proposalApplicationSourceMutationFieldedDecisionSlice,
);
assert.equal(vnextAuditStatus.nextGrowthSlice, proposalApplicationSourceMutationFieldedDecisionSlice);

const sourceMutationOperatorHandoffAuthorityBoundary = {
  handoffRecordsDecision: false,
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
      posture: 'read-only-proposal-application-source-mutation-operator-decision-handoff',
      readOnly: true,
      doesNotCommit: true,
      doesNotPush: true,
      currentGate: proposalApplicationSourceMutationOperatorHandoffSlice,
      handoffStatus: 'decision-input-only',
      handoff: sourceMutationOperatorHandoffFiles.handoff,
      requiredDecisionFields: proposalApplicationSourceMutationDecisionRequiredFields,
      invalidShortcutsRejected: proposalApplicationSourceMutationInvalidShortcutPhrases,
      nextRequiredInput: proposalApplicationSourceMutationFieldedDecisionRequiredInput,
      nextRecommendedSlice: proposalApplicationSourceMutationFieldedDecisionSlice,
      upstreamStatus: {
        sourceMutationDecisionPacket: {
          ok: sourceMutationDecisionPacketStatus.ok,
          nextRecommendedSlice: sourceMutationDecisionPacketStatus.nextRecommendedSlice,
        },
        applicationImplementation: {
          ok: applicationImplementationStatus.ok,
          sourceMutationAllowed: applicationImplementationStatus.authority?.sourceMutationAllowed,
        },
        vnextAudit: {
          ok: vnextAuditStatus.ok,
          nextSlice: vnextAuditStatus.nextGrowthSlice,
        },
      },
      authority: sourceMutationOperatorHandoffAuthorityBoundary,
    },
    null,
    2,
  )}\n`,
);
