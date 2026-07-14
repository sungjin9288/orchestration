import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  assertContainsBacktickedAll,
  assertMarkdownSections,
  assertSourceEvidence,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const STATUS_MODE = 'vnext-proposal-draft-downstream-authority-decision-packet-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const sources = readRepoFiles(repoRoot, {
  packet: 'docs/47_proposal-draft-downstream-authority-decision-packet.md',
  evidenceDecision: 'docs/46_proposal-draft-human-review-evidence-decision.md',
  reviewDoc: 'docs/44_proposal-draft-human-review.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  growthConfig: 'ui/growth-config.js',
});

const decisionOptions = [
  'approve-local-durable-record-planning-only',
  'request-more-evidence',
  'reject',
  'defer',
];

const requiredDecisionFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'targetSurface',
  'candidateId',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'recordPlanRefs',
  'rollbackRefs',
  'focusedSmokeRefs',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

assertMarkdownSections(sources.packet, [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Recommended Planning Target',
  '## Still Blocked',
  '## Stop Conditions',
  '## Copy-Ready Planning Decision',
  '## Verification',
]);
assertContainsBacktickedAll(sources.packet, decisionOptions);
assertContainsBacktickedAll(sources.packet, requiredDecisionFields);
assertSourceEvidence(sources, {
  packet: [
    'awaiting-fielded-downstream-authority-decision',
    'local durable proposal record creation planning for one reviewed deterministic inert draft',
    'growth-evidence-ledger-proposal-readiness-candidate',
    'It does not record a decision',
    'record creation or persistence is coupled to planning approval',
  ],
  evidenceDecision: [
    'accept-review-evidence-only',
    'docs/47_proposal-draft-downstream-authority-decision-packet.md',
  ],
  reviewDoc: ['pending-human-review', 'has no `reviewOutcome`'],
  decisionLog: ['### DEC-074', '### DEC-075'],
  audit: [
    'Completed: `proposal draft downstream authority decision packet`',
    'Next implementation gate: `fielded proposal draft downstream authority decision required`',
  ],
  inventory: ['vNext proposal draft downstream authority decision packet'],
  readme: ['Proposal draft downstream authority decision packet is implemented'],
  verification: ['vnext-proposal-draft-downstream-authority-decision-packet-status.mjs'],
  growthConfig: [
    'proposalGenerationAllowed: false',
    'proposalApplicationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
    'sourceMutationAllowed: false',
    'commitPushAllowed: false',
  ],
});

const evidenceDecisionStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-draft-human-review-evidence-decision-status.mjs',
);
assert.equal(evidenceDecisionStatus.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'read-only-proposal-draft-downstream-authority-decision-input',
  currentGate: 'fielded proposal draft downstream authority decision required',
  recommendedTarget: {
    authority: 'local durable proposal record creation planning for one reviewed deterministic inert draft',
    candidateId: 'growth-evidence-ledger-proposal-readiness-candidate',
    planningOnly: true,
    implementationAllowed: false,
  },
  decisionOptions,
  requiredDecisionFields,
  authority: {
    downstreamAuthorityDecisionRecorded: false,
    durableRecordPlanningAllowed: false,
    durableRecordCreationAllowed: false,
    durableRecordPersistenceAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalApplicationAllowed: false,
    providerCallsAllowed: false,
    memoryPersistenceAllowed: false,
    runtimeMutationAllowed: false,
    uiMutationAllowed: false,
    sourceMutationAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  },
}, null, 2)}\n`);
