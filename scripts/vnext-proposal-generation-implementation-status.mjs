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
const STATUS_MODE = 'vnext-proposal-generation-implementation-status';

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

const sources = readRepoFiles(repoRoot, {
  implementation: 'docs/43_proposal-generation-implementation.md',
  plan: 'docs/42_proposal-generation-planning-plan.md',
  decisionLog: 'docs/01_decision-log.md',
  draftModule: 'src/runtime/proposal-drafts.js',
  smoke: 'scripts/smoke-deterministic-proposal-draft-generation.mjs',
  verification: 'scripts/verification_status.mjs',
  growthConfig: 'ui/growth-config.js',
  inventory: 'docs/22_completion-gate-inventory.md',
  readme: 'README.md',
});

assertMarkdownSections(sources.implementation, [
  '## Purpose',
  '## Implementation Decision',
  '## Runtime Boundary',
  '## Rejection And Rollback',
  '## Focused Smoke',
  '## Verification',
]);
assertSourceEvidence(sources, {
  implementation: [
    'operator-decision-vnext-proposal-generation-implementation-001',
    'approve-proposal-generation-implementation-slice',
    'src/runtime/proposal-drafts.js#createDeterministicProposalDraft',
    'does not persist a durable record',
    'does not persist memory',
  ],
  plan: ['Implementation approval: accepted later under `DEC-071`'],
  decisionLog: ['### DEC-071'],
  smoke: ['createDeterministicProposalDraft', 'evidenceFreshness is stale at evaluationAt'],
  verification: [
    'smoke-deterministic-proposal-draft-generation.mjs',
    'vnext-proposal-generation-implementation-status.mjs',
  ],
  growthConfig: ['proposalGenerationAllowed: false', 'providerCallsAllowed: false'],
  inventory: ['vNext proposal generation implementation'],
  readme: ['Deterministic inert proposal draft generation is implemented'],
});
assertMatchesAll(sources.draftModule, [
  /function createDeterministicProposalDraft\(input = \{\}\)/,
  /candidate\.candidateId must be the approved Growth Evidence Ledger candidate/,
  /evidenceFreshness is stale at evaluationAt/,
  /draftStatus: PROPOSAL_DRAFT_STATUS/,
  /applyAllowed: false/,
]);
assert.doesNotMatch(sources.draftModule, /require\(['"](?:node:)?fs|require\(['"]\.\/file-store|require\(['"]\.\/runtime-service/);
assert.doesNotMatch(sources.draftModule, /fetch\(|exec\(|spawn\(/);

const planning = runStatus(repoRoot, 'scripts/vnext-proposal-generation-planning-plan-status.mjs');
const readiness = runStatus(repoRoot, 'scripts/growth-evidence-ledger-proposal-readiness-status.mjs');
assert.equal(planning.ok, true);
assert.equal(readiness.ok, true);

process.stdout.write(`${JSON.stringify({
  ok: true,
  mode: STATUS_MODE,
  posture: 'pure-local-inert-proposal-draft-only',
  implementationDecisionId: 'operator-decision-vnext-proposal-generation-implementation-001',
  entrypoint: 'src/runtime/proposal-drafts.js#createDeterministicProposalDraft',
  proposalGenerationAllowed: false,
  authority: {
    durableRecordCreationAllowed: false,
    proposalApplicationAllowed: false,
    proposalQueueMutationAllowed: false,
    providerCallsAllowed: false,
    memoryPersistenceAllowed: false,
    runtimeMutationAllowed: false,
    uiMutationAllowed: false,
    sourceMutationAllowed: false,
    commitAllowed: false,
    pushAllowed: false,
  },
}, null, 2)}\n`);
