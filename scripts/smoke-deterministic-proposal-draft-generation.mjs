import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const require = createRequire(import.meta.url);
const {
  createDeterministicProposalDraft,
} = require(path.join(repoRoot, 'src/runtime/proposal-drafts.js'));

const generationApproval = {
  decisionId: 'operator-decision-vnext-proposal-generation-implementation-001',
  decisionStatus: 'approve-proposal-generation-implementation-slice',
  targetAuthority: 'deterministic local inert proposal draft generation implementation',
  approvalStatement:
    'I approve implementation only for one deterministic local inert proposal draft path. This does not approve durable record creation, proposal application, provider calls, memory persistence, source mutation, commit, or push.',
};

const candidate = {
  candidateId: 'growth-evidence-ledger-proposal-readiness-candidate',
  sourceFindingId: 'growth-evidence-ledger-proposal-record-lifecycle-review-needed',
  candidateKind: 'proposal-queue-handoff',
  readinessStatus: 'ready-for-proposal-readiness-review',
  evidenceRefs: [
    'growth-evidence-ledger-reflection-handoff-status',
    'growth-reflection-evaluator',
    'growth-proposal-queue-status',
  ],
  negativeEvidenceRefs: ['proposal-generation-blocked', 'proposal-application-blocked'],
  routeRefs: ['growth-evidence-ledger-proposal-queue-handoff'],
  sourceRefs: ['docs/18_growth-gateway-vnext.md'],
  verificationRefs: ['node scripts/growth-evidence-ledger-proposal-readiness-status.mjs'],
  blockedActions: [
    'generate-proposal',
    'apply-proposal',
    'mutate-proposal-queue',
    'approve-proposal',
    'execute-worker',
    'call-provider',
    'persist-memory',
    'mutate-source',
  ],
  riskClass: 'smoke-only',
  humanReviewQuestion:
    'Is the reflected ledger evidence complete enough to define a future proposal queue handoff without creating or applying proposal records?',
};

const baseInput = {
  generationApproval,
  candidate,
  evidenceFreshness: {
    verifiedAt: '2026-07-14T00:00:00.000Z',
    expiresAt: '2026-07-15T00:00:00.000Z',
  },
  evaluationAt: '2026-07-14T12:00:00.000Z',
};

const draft = createDeterministicProposalDraft(baseInput);
assert.deepEqual(draft, createDeterministicProposalDraft(baseInput));
assert.equal(draft.draftStatus, 'draft-only');
assert.equal(draft.applyAllowed, false);
assert.equal(draft.generationApprovalRef, generationApproval.decisionId);
assert.equal(Object.hasOwn(draft, 'recordId'), false);
assert.equal(Object.hasOwn(draft, 'applicationStatus'), false);
assert.equal(Object.hasOwn(draft, 'queueMutation'), false);
assert.match(draft.nonApprovalStatement, /not approval, durable record creation, queue mutation, or proposal application/i);
for (const action of ['apply-proposal', 'mutate-proposal-queue', 'call-provider', 'persist-memory', 'mutate-source', 'commit', 'push']) {
  assert.ok(draft.blockedActions.includes(action), `blocked action missing: ${action}`);
}

assert.throws(
  () => createDeterministicProposalDraft({ ...baseInput, generationApproval: null }),
  /generationApproval is required/,
);
assert.throws(
  () => createDeterministicProposalDraft({ ...baseInput, candidate: { ...candidate, evidenceRefs: [] } }),
  /candidate\.evidenceRefs must be a non-empty array/,
);
assert.throws(
  () =>
    createDeterministicProposalDraft({
      ...baseInput,
      evidenceFreshness: {
        verifiedAt: '2026-07-13T00:00:00.000Z',
        expiresAt: '2026-07-14T00:00:00.000Z',
      },
    }),
  /evidenceFreshness is stale at evaluationAt/,
);
assert.throws(
  () =>
    createDeterministicProposalDraft({
      ...baseInput,
      candidate: { ...candidate, candidateId: 'second-candidate' },
    }),
  /candidate\.candidateId must be the approved Growth Evidence Ledger candidate/,
);

const moduleSource = fs.readFileSync(
  path.join(repoRoot, 'src/runtime/proposal-drafts.js'),
  'utf8',
);
assert.doesNotMatch(moduleSource, /require\(['"](?:node:)?fs|require\(['"]\.\/file-store|require\(['"]\.\/runtime-service/);
assert.doesNotMatch(moduleSource, /require\(['"](?:\.\/provider|node:child_process)|fetch\(|exec\(|spawn\(/);

process.stdout.write(
  `${JSON.stringify({
    ok: true,
    mode: 'smoke-deterministic-proposal-draft-generation',
    draftStatus: draft.draftStatus,
    applyAllowed: draft.applyAllowed,
    recordIdPresent: Object.hasOwn(draft, 'recordId'),
    authority: {
      durableRecordCreationAllowed: false,
      proposalApplicationAllowed: false,
      proposalQueueMutationAllowed: false,
      providerCallsAllowed: false,
      memoryPersistenceAllowed: false,
      sourceMutationAllowed: false,
      commitAllowed: false,
      pushAllowed: false,
    },
  }, null, 2)}\n`,
);
