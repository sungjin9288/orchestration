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
const STATUS_MODE = 'vnext-proposal-draft-human-review-evidence-decision-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const sources = readRepoFiles(repoRoot, {
  decision: 'docs/46_proposal-draft-human-review-evidence-decision.md',
  packet: 'docs/45_proposal-draft-human-review-decision-packet.md',
  reviewDoc: 'docs/44_proposal-draft-human-review.md',
  decisionLog: 'docs/01_decision-log.md',
  audit: 'docs/23_vnext-development-audit.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
  verification: 'scripts/verification_status.mjs',
  growthConfig: 'ui/growth-config.js',
});

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

assertMarkdownSections(sources.decision, [
  '## Purpose',
  '## Accepted Decision',
  '## Decision Boundary',
  '## Rejection And Rollback',
  '## Next Authority Gate',
  '## Verification',
]);
assertContainsBacktickedAll(sources.decision, requiredDecisionFields);
assertSourceEvidence(sources, {
  decision: [
    'operator-decision-vnext-proposal-draft-human-review-001',
    'accept-review-evidence-only',
    'human review evidence confirmation for one deterministic local inert proposal draft',
    'growth-evidence-ledger-proposal-readiness-candidate',
    'does not claim that a runtime packet or a runtime decision record was persisted',
    'does not create or persist a review outcome',
    'No implementation follows by default',
  ],
  packet: [
    'Current packet status: `consumed-by-accept-review-evidence-only-decision`',
    'It does not add `reviewOutcome` to the packet',
  ],
  reviewDoc: ['pending-human-review', 'has no `reviewOutcome`'],
  decisionLog: ['### DEC-074'],
  audit: [
    'Completed: `proposal draft human review evidence decision`',
    'Next implementation gate: `explicit downstream authority decision required`',
  ],
  inventory: ['vNext proposal draft human review evidence decision'],
  readme: ['Proposal draft human review evidence decision is accepted'],
  verification: ['vnext-proposal-draft-human-review-evidence-decision-status.mjs'],
  growthConfig: [
    'proposalGenerationAllowed: false',
    'proposalApplicationAllowed: false',
    'providerCallsAllowed: false',
    'memoryPersistenceAllowed: false',
    'sourceMutationAllowed: false',
    'commitPushAllowed: false',
  ],
});

const packetStatus = runStatus(
  repoRoot,
  'scripts/vnext-proposal-draft-human-review-decision-packet-status.mjs',
);
assert.equal(packetStatus.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'accepted-review-evidence-only-without-downstream-authority',
  decisionStatus: 'accept-review-evidence-only',
  authority: {
    decisionRecordedInDocs: true,
    runtimeDecisionPersistenceAllowed: false,
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
