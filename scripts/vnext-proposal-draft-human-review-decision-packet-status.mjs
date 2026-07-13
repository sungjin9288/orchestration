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
const STATUS_MODE = 'vnext-proposal-draft-human-review-decision-packet-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const files = {
  packet: 'docs/45_proposal-draft-human-review-decision-packet.md',
  reviewDoc: 'docs/44_proposal-draft-human-review.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  growthConfig: 'ui/growth-config.js',
};
const sources = readRepoFiles(repoRoot, files);

const decisionOptions = [
  'accept-review-evidence-only',
  'request-more-evidence',
  'reject',
  'defer',
];
const requiredDecisionFields = [
  'decisionId',
  'decisionStatus',
  'targetAuthority',
  'reviewPacketRef',
  'candidateId',
  'sourceEvidenceRefs',
  'negativeEvidenceRefs',
  'evidenceFreshnessRef',
  'reviewOutcome',
  'aggregateVerificationRef',
  'stillBlockedAuthorities',
  'approvalStatement',
];

assertMarkdownSections(sources.packet, [
  '## Purpose',
  '## Current Decision State',
  '## Decision Options',
  '## Required Operator Decision',
  '## Review Boundary',
  '## Stop Conditions',
  '## Copy-Ready Decision Responses',
  '## Verification',
]);
assertContainsBacktickedAll(sources.packet, decisionOptions);
assertContainsBacktickedAll(sources.packet, requiredDecisionFields);
assertSourceEvidence(sources, {
  packet: [
    'Current packet status: `awaiting-fielded-human-review-outcome`',
    'exactly one existing Growth Evidence Ledger candidate',
    'It does not add `reviewOutcome` to the packet',
    'This packet cannot supply that authority',
    'decisionId=operator-decision-vnext-proposal-draft-human-review-001',
  ],
  reviewDoc: [
    'pending-human-review',
    'has no `reviewOutcome`',
  ],
  decisionLog: ['### DEC-073'],
  audit: [
    'Completed: `proposal draft human review decision packet`',
    'Next implementation gate: `fielded proposal draft human review outcome required`',
  ],
  inventory: ['vNext proposal draft human review decision packet'],
  readme: ['Proposal draft human review decision packet is implemented'],
  verification: ['vnext-proposal-draft-human-review-decision-packet-status.mjs'],
  growthConfig: [
    'proposalGenerationAllowed: false',
    'proposalApplicationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
    'sourceMutationAllowed: false',
    'commitPushAllowed: false',
  ],
});

const reviewStatus = runStatus(repoRoot, 'scripts/vnext-proposal-draft-human-review-status.mjs');
assert.equal(reviewStatus.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'read-only-proposal-draft-human-review-decision-input',
  currentGate: 'fielded proposal draft human review outcome required',
  decisionOptions,
  requiredDecisionFields,
  authority: {
    reviewOutcomeRecorded: false,
    durableRecordCreationAllowed: false,
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
