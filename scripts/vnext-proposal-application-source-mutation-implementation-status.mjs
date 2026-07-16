import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import { assertMatchesAll, readRepoFiles, runStatus } from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-source-mutation-implementation-status';
const STATUS_SCHEMA_VERSION = '1.0.0';
const proposalSourceMutationBlockedActions = [
  'proposal-generation',
  'provider-call',
  'memory-persistence',
  'source-mutation-outside-named-path',
  'commit',
  'push',
];
const proposalSourceMutationAuthorityFlags = [
  'proposalGenerationAllowed',
  'providerCallsAllowed',
  'memoryPersistenceAllowed',
  'sourceMutationOutsideNamedPathAllowed',
  'commitAllowed',
  'pushAllowed',
];

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

function assertAuthorityIsBlocked(authority) {
  for (const value of Object.values(authority)) {
    assert.equal(value, false);
  }
}

const sourceMutationEvidenceSources = readRepoFiles(repoRoot, {
  contracts: 'src/runtime/contracts.js',
  proposalRecords: 'src/runtime/proposal-records.js',
  runtimeService: 'src/runtime/runtime-service.js',
  fileStore: 'src/runtime/file-store.js',
  focusedSmoke: 'scripts/smoke-proposal-application-source-mutation.mjs',
  implementationDoc: 'docs/39_proposal-application-source-mutation-implementation.md',
  verification: 'scripts/verification_status.mjs',
});

assertMatchesAll(sourceMutationEvidenceSources.contracts, [
  /PROPOSAL_SOURCE_MUTATION_STATUS/,
  /PROPOSAL_SOURCE_MUTATION_DEFAULT_BLOCKED_ACTIONS/,
  /proposalSourceMutation: 0/,
  /proposalSourceMutations: \{\}/,
  /const STATE_SCHEMA_VERSION = 10/,
]);
assertMatchesAll(sourceMutationEvidenceSources.proposalRecords, [
  /function normalizeProposalSourceMutationApproval\(input\)/,
  /function normalizeProposalSourceMutationBlockedActions\(value\)/,
  /function normalizeProposalSourceMutationTarget\(input\)/,
  /function normalizeCleanBaselineProof\(input\)/,
  /function normalizeDryRunDiffPreview\(input, relativePath\)/,
  /function assertProposalApplicationAttemptCanAuthorizeSourceMutation\(/,
  /sourceMutationApproval\.decisionStatus must be approve-source-mutation-implementation-slice/,
  /cleanBaselineProof\.statusOutput must be empty/,
  /dryRunDiffPreview\.diffText must reference the target relativePath/,
  /proposalApplicationAttempt already authorized one source mutation/,
  /mutation must name exactly one target file/,
  /mutation\.relativePath must stay inside the project path/,
]);
assertMatchesAll(sourceMutationEvidenceSources.runtimeService, [
  /function applyProposalSourceMutation\(input = \{\}\)/,
  /function rollbackProposalSourceMutation\(input = \{\}\)/,
  /function quarantineProposalSourceMutation\(input = \{\}\)/,
  /function getProposalSourceMutation\(sourceMutationId\)/,
  /function listProposalSourceMutations\(input = \{\}\)/,
  /function nextProposalSourceMutationId\(state\)/,
  /function resolveProposalSourceMutationTargetPath\(project, relativePath\)/,
  /sourceMutationApprovalRefs must include sourceMutationApproval\.decisionId/,
  /sourceMutationApproval must be separate from application approval/,
  /mutation\.relativePath must be listed in proposalRecord\.affectedFiles/,
  /mutation\.expectedBeforeContent must match the current target content/,
  /rollback requires the applied content to still be present/,
  /require\('\.\/proposal-records'\)/,
]);
assertMatchesAll(sourceMutationEvidenceSources.fileStore, [
  /proposalSourceMutations: state\.proposalSourceMutations \|\| \{\}/,
  /proposalSourceMutation\.proposalGenerationAllowed = false/,
  /proposalSourceMutation\.providerCallsAllowed = false/,
  /proposalSourceMutation\.memoryPersistenceAllowed = false/,
  /proposalSourceMutation\.sourceMutationOutsideNamedPathAllowed = false/,
  /proposalSourceMutation\.commitAllowed = false/,
  /proposalSourceMutation\.pushAllowed = false/,
]);
assertMatchesAll(sourceMutationEvidenceSources.implementationDoc, [
  /Implementation approval: accepted/,
  /operator-decision-vnext-proposal-source-mutation-implementation-001/,
  /approve-source-mutation-implementation-slice/,
  /exactly one accepted mutation plan/,
  /source mutation outside the named path/i,
]);
assertMatchesAll(sourceMutationEvidenceSources.focusedSmoke, [
  /smoke-proposal-application-source-mutation/,
]);
assertMatchesAll(sourceMutationEvidenceSources.verification, [
  /smoke-proposal-application-source-mutation\.mjs/,
  /vnext-proposal-application-source-mutation-implementation-status\.mjs/,
]);

const smokeStatus = runStatus(repoRoot, 'scripts/smoke-proposal-application-source-mutation.mjs');

assert.equal(smokeStatus.ok, true);
assert.equal(smokeStatus.sourceMutationId, 'proposal-source-mutation-0001');
assert.equal(smokeStatus.appliedThenRolledBack, true);
assert.equal(smokeStatus.targetRestored, true);
assert.deepEqual(smokeStatus.blockedActions, proposalSourceMutationBlockedActions);
assertAuthorityIsBlocked(smokeStatus.stillBlockedAuthorities);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'implementation-complete-single-approved-source-mutation',
      runtimeMutation: 'exactly one named target file per approved proposal application attempt',
      doesNotCommit: true,
      doesNotPush: true,
      focusedSmoke: smokeStatus,
      authority: {
        proposalGenerationAllowed: false,
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        sourceMutationOutsideNamedPathAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
      authorityFlagsChecked: proposalSourceMutationAuthorityFlags,
    },
    null,
    2,
  )}\n`,
);
