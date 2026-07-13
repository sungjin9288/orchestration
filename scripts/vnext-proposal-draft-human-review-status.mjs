import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  assertMarkdownSections,
  assertMatchesAll,
  assertSourceEvidence,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const repoRoot = path.resolve(path.dirname(__filename), '..');
const STATUS_MODE = 'vnext-proposal-draft-human-review-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const sources = readRepoFiles(repoRoot, {
  reviewDoc: 'docs/44_proposal-draft-human-review.md',
  reviewModule: 'src/runtime/proposal-draft-reviews.js',
  draftImplementation: 'docs/43_proposal-generation-implementation.md',
  decisionLog: 'docs/01_decision-log.md',
  smoke: 'scripts/smoke-proposal-draft-human-review.mjs',
  verification: 'scripts/verification_status.mjs',
  growthConfig: 'ui/growth-config.js',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
});

assertMarkdownSections(sources.reviewDoc, [
  '## Purpose',
  '## Review Boundary',
  '## Packet Contract',
  '## Rejection And Rollback',
  '## Verification',
]);
assertSourceEvidence(sources, {
  reviewDoc: [
    'createProposalDraftHumanReviewPacket',
    'pending-human-review',
    'has no `reviewOutcome`',
    'does not create a durable record',
  ],
  draftImplementation: ['src/runtime/proposal-drafts.js#createDeterministicProposalDraft'],
  decisionLog: ['### DEC-072'],
  smoke: [
    'createProposalDraftHumanReviewPacket',
    'draft\\.evidenceFreshness must remain fresh for human review',
  ],
  verification: [
    'smoke-proposal-draft-human-review.mjs',
    'vnext-proposal-draft-human-review-status.mjs',
  ],
  growthConfig: ['proposalGenerationAllowed: false', 'proposalApplicationAllowed: false'],
  inventory: ['vNext proposal draft human review'],
  readme: ['Pending inert proposal draft human review is implemented'],
});
assertMatchesAll(sources.reviewModule, [
  /function createProposalDraftHumanReviewPacket\(input\)/,
  /draft\.draftStatus must be draft-only/,
  /reviewStatus: PROPOSAL_DRAFT_REVIEW_STATUS/,
  /humanReviewRequired: true/,
  /durableRecordCreationAllowed: false/,
  /proposalQueueMutationAllowed: false/,
  /proposalApplicationAllowed: false/,
]);
assert.doesNotMatch(sources.reviewModule, /require\(['"](?:node:)?fs|require\(['"]\.\/file-store|require\(['"]\.\/runtime-service/);
assert.doesNotMatch(sources.reviewModule, /fetch\(|exec\(|spawn\(/);

const draftImplementation = runStatus(
  repoRoot,
  'scripts/vnext-proposal-generation-implementation-status.mjs',
);
assert.equal(draftImplementation.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'read-only-pending-proposal-draft-human-review',
  reviewStatus: 'pending-human-review',
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
