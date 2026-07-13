import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const require = createRequire(import.meta.url);
const {
  createDeterministicProposalDraft,
} = require(path.join(repoRoot, 'src/runtime/proposal-drafts.js'));
const {
  createProposalDraftHumanReviewPacket,
} = require(path.join(repoRoot, 'src/runtime/proposal-draft-reviews.js'));

const draft = createDeterministicProposalDraft({
  generationApproval: {
    decisionId: 'operator-decision-vnext-proposal-generation-implementation-001',
    decisionStatus: 'approve-proposal-generation-implementation-slice',
    targetAuthority: 'deterministic local inert proposal draft generation implementation',
    approvalStatement:
      'I approve implementation only for one deterministic local inert proposal draft path. This does not approve durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, or push.',
  },
  candidate: {
    candidateId: 'growth-evidence-ledger-proposal-readiness-candidate',
    sourceFindingId: 'growth-evidence-ledger-proposal-record-lifecycle-review-needed',
    candidateKind: 'proposal-queue-handoff',
    readinessStatus: 'ready-for-proposal-readiness-review',
    evidenceRefs: ['growth-evidence-ledger-reflection-handoff-status'],
    negativeEvidenceRefs: ['proposal-generation-blocked'],
    routeRefs: ['growth-evidence-ledger-proposal-queue-handoff'],
    sourceRefs: ['docs/18_growth-gateway-vnext.md'],
    verificationRefs: ['node scripts/growth-evidence-ledger-proposal-readiness-status.mjs'],
    blockedActions: ['apply-proposal', 'mutate-proposal-queue', 'call-provider', 'persist-memory'],
    riskClass: 'smoke-only',
    humanReviewQuestion: 'Is the evidence still complete enough for later human review?',
  },
  evidenceFreshness: {
    verifiedAt: '2026-07-14T00:00:00.000Z',
    expiresAt: '2026-07-15T00:00:00.000Z',
  },
  evaluationAt: '2026-07-14T12:00:00.000Z',
});

const packet = createProposalDraftHumanReviewPacket(draft);
assert.deepEqual(packet, createProposalDraftHumanReviewPacket(draft));
assert.equal(packet.reviewStatus, 'pending-human-review');
assert.equal(packet.humanReviewRequired, true);
assert.equal(packet.durableRecordCreationAllowed, false);
assert.equal(packet.proposalQueueMutationAllowed, false);
assert.equal(packet.proposalApplicationAllowed, false);
assert.equal(Object.hasOwn(packet, 'recordId'), false);
assert.equal(Object.hasOwn(packet, 'reviewOutcome'), false);
assert.deepEqual(packet.evidence.positiveRefs, draft.evidenceRefs);

assert.throws(
  () => createProposalDraftHumanReviewPacket({ ...draft, draftStatus: 'approved' }),
  /draft\.draftStatus must be draft-only/,
);
assert.throws(
  () => createProposalDraftHumanReviewPacket({ ...draft, applyAllowed: true }),
  /draft\.applyAllowed must remain false/,
);
assert.throws(
  () => createProposalDraftHumanReviewPacket({ ...draft, recordId: 'proposal-record-0001' }),
  /draft\.recordId must be absent/,
);
assert.throws(
  () =>
    createProposalDraftHumanReviewPacket({
      ...draft,
      evidenceFreshness: {
        ...draft.evidenceFreshness,
        expiresAt: '2026-07-14T12:00:00.000Z',
      },
    }),
  /draft\.evidenceFreshness must remain fresh for human review/,
);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: 'smoke-proposal-draft-human-review',
  reviewStatus: packet.reviewStatus,
  humanReviewRequired: packet.humanReviewRequired,
  authority: {
    durableRecordCreationAllowed: packet.durableRecordCreationAllowed,
    proposalQueueMutationAllowed: packet.proposalQueueMutationAllowed,
    proposalApplicationAllowed: packet.proposalApplicationAllowed,
  },
}, null, 2)}\n`);
