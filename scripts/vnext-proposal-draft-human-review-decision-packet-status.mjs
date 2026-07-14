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
  evidenceDecision: 'docs/46_proposal-draft-human-review-evidence-decision.md',
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
    'Current packet status: `consumed-by-accept-review-evidence-only-decision`',
    'Accepted evidence decision: `operator-decision-vnext-proposal-draft-human-review-001` under `DEC-074`',
    'exactly one existing Growth Evidence Ledger candidate',
    'It does not add `reviewOutcome` to the packet',
    'This packet cannot supply that authority',
    'decisionId=operator-decision-vnext-proposal-draft-human-review-001',
  ],
  reviewDoc: [
    'pending-human-review',
    'has no `reviewOutcome`',
  ],
  evidenceDecision: [
    'decisionStatus` | `accept-review-evidence-only`',
    'does not claim that a runtime packet or a runtime decision record was persisted',
  ],
  decisionLog: ['### DEC-073', '### DEC-074'],
  audit: [
    'Completed: `proposal draft human review decision packet`',
    'Completed: `proposal draft human review evidence decision`',
    'Next implementation gate: `fielded proposal draft downstream authority decision required`',
  ],
  inventory: [
    'vNext proposal draft human review decision packet',
    'vNext proposal draft human review evidence decision',
  ],
  readme: [
    'Proposal draft human review decision packet is implemented',
    'Proposal draft human review evidence decision is accepted',
  ],
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
  posture: 'consumed-read-only-proposal-draft-human-review-decision-input',
  currentGate: 'fielded proposal draft downstream authority decision required',
  decisionOptions,
  requiredDecisionFields,
  authority: {
    runtimeReviewOutcomePersisted: false,
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
