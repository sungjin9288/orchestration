import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import { assertMatchesAll, readRepoFiles, runStatus } from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-status';
const STATUS_SCHEMA_VERSION = '1.0.0';
const proposalApplicationAttemptBlockedActions = [
  'proposal-generation',
  'provider-call',
  'memory-persistence',
  'source-mutation',
  'commit',
  'push',
];

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

function assertAuthorityIsBlocked(authority) {
  for (const value of Object.values(authority)) {
    assert.equal(value, false);
  }
}

const applicationAttemptEvidenceSources = readRepoFiles(repoRoot, {
  app: 'ui/app.js',
  contracts: 'src/runtime/contracts.js',
  decisionLog: 'docs/01_decision-log.md',
  growthConfig: 'ui/growth-config.js',
  implementationDoc: 'docs/35_proposal-application-implementation.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  fileStore: 'src/runtime/file-store.js',
  readme: 'README.md',
  runtimeService: 'src/runtime/runtime-service.js',
  proposalRecords: 'src/runtime/proposal-records.js',
  verification: 'scripts/verification_status.mjs',
});

assertMatchesAll(applicationAttemptEvidenceSources.contracts, [
  /PROPOSAL_APPLICATION_ATTEMPT_STATUS/,
  /PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS/,
  /proposalApplicationAttempt: 0/,
  /proposalApplicationAttempts: \{\}/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.fileStore, [
  /proposalApplicationAttempts: state\.proposalApplicationAttempts \|\| \{\}/,
  /proposalRecord\.applicationAttemptIds/,
  /proposalApplicationAttempt\.sourceMutationAllowed = false/,
  /proposalApplicationAttempt\.pushAllowed = false/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.runtimeService, [
  /function createProposalApplicationAttempt\(input = \{\}\)/,
  /applicationApprovalRefs must include applicationApproval\.decisionId/,
  /applicationApproval must be separate from creation approval/,
  /function quarantineProposalApplicationAttempt\(input = \{\}\)/,
  /require\('\.\/proposal-records'\)/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.proposalRecords, [
  /function normalizeProposalApplicationApproval\(input\)/,
  /applicationApproval\.decisionStatus must be approve-application-implementation-slice/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.app, [
  /from '\.\/growth-config\.js'/,
  /data-proposal-application-attempt-ledger="(?:empty\/)?read-only"/,
  /data-proposal-application-attempts-count/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.growthConfig, [
  /proposalApplicationAttemptCreationAllowed: false/,
  /proposalApplicationAttemptPersistenceAllowed: false/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.decisionLog, [
  /### DEC-062/,
  /approve-application-implementation-slice/,
]);
assertMatchesAll(applicationAttemptEvidenceSources.implementationDoc, [
  /Implementation approval: accepted/,
  /Runtime implementation: completed/,
  /record one inert application attempt/,
  /source mutation remains blocked/i,
]);
assert.match(
  applicationAttemptEvidenceSources.readme,
  /Proposal application audit-only attempt is implemented/,
);
assert.match(
  applicationAttemptEvidenceSources.inventory,
  /vNext proposal application implementation/,
);
assertMatchesAll(applicationAttemptEvidenceSources.verification, [
  /smoke-proposal-application-attempt-creation\.mjs/,
  /vnext-proposal-application-implementation-status\.mjs/,
]);

const smokeStatus = runStatus(repoRoot, 'scripts/smoke-proposal-application-attempt-creation.mjs');
const attempt = smokeStatus.applicationAttempt;

assert.equal(smokeStatus.ok, true);
assert.equal(attempt.applicationAttemptId, 'proposal-application-attempt-0001');
assert.equal(attempt.persisted, true);
assert.equal(attempt.status, 'planned');
assert.deepEqual(attempt.blockedActions, proposalApplicationAttemptBlockedActions);
assertAuthorityIsBlocked(attempt.authority);
assert.equal(attempt.statusAfterRollbackQuarantine, 'quarantined');

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'implementation-complete-audit-only-application-attempt',
      runtimeMutation: 'local state.json proposalApplicationAttempts only',
      doesNotCommit: true,
      doesNotPush: true,
      focusedSmoke: attempt,
      authority: {
        proposalGenerationAllowed: false,
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        sourceMutationAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
    },
    null,
    2,
  )}\n`,
);
