import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';
import {
  assertDoesNotMatchAny,
  assertMatchesAll,
  readRepoFiles,
  runStatus,
} from './vnext-status-assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-implementation-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

const durableProposalRecordImplementationStatusFiles = {
  contracts: 'src/runtime/contracts.js',
  fileStore: 'src/runtime/file-store.js',
  runtimeService: 'src/runtime/runtime-service.js',
  proposalRecords: 'src/runtime/proposal-records.js',
  app: 'ui/app.js',
  growthConfig: 'ui/growth-config.js',
  decisionLog: 'docs/01_decision-log.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  readme: 'README.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  verification: 'scripts/verification_status.mjs',
};

const durableProposalRecordImplementationStatusSources = readRepoFiles(
  repoRoot,
  durableProposalRecordImplementationStatusFiles,
);

const durableProposalRecordImplementationStatusSourceEvidence = {
  contracts: [
    /const STATE_SCHEMA_VERSION = 7/,
    /proposalRecord: 0/,
    /proposalRecords: \{\}/,
    /PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS/,
  ],
  fileStore: [
    /proposalRecords: state\.proposalRecords \|\| \{\}/,
    /proposalRecord\.applyAllowed = false/,
  ],
  runtimeService: [
    /function createProposalRecord\(input = \{\}\)/,
    /function nextProposalRecordId\(state\)/,
    /proposal-record-\$\{String\(state\.sequences\.proposalRecord\)\.padStart\(4, '0'\)\}/,
    /approvalRefs must include creationApproval\.decisionId/,
    /applyAllowed: false/,
    /function quarantineProposalRecord\(input = \{\}\)/,
    /require\('\.\/proposal-records'\)/,
  ],
  proposalRecords: [/creationApproval\.status must be approved/],
  app: [
    /function renderDurableProposalRecordLedger\(growth\)/,
    /data-durable-proposal-record-ledger="read-only"/,
    /data-proposal-application-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalApplicationAllowed\}"/,
    /from '\.\/growth-config\.js'/,
  ],
  growthConfig: [
    /export const GROWTH_AUTHORITY_BOUNDARY = Object\.freeze\(\{/,
    /proposalApplicationAllowed: false/,
    /proposalRecordCreationAllowed: false/,
    /proposalRecordPersistenceAllowed: false/,
  ],
  decisionLog: [/### DEC-057/, /approve-implementation-slice/],
  implementationPlan: [
    /Implementation approval: accepted/,
    /Runtime implementation: completed/,
    /Default expiry policy: 30 days from `createdAt`/,
  ],
  readme: [/Durable proposal record creation and persistence is implemented/],
  inventory: [/vNext durable proposal record implementation/],
  verification: [
    /vnext-durable-proposal-record-implementation-status\.mjs/,
    /smoke-durable-proposal-record-creation\.mjs/,
  ],
};

for (const [sourceName, expectedPatterns] of Object.entries(
  durableProposalRecordImplementationStatusSourceEvidence,
)) {
  assertMatchesAll(durableProposalRecordImplementationStatusSources[sourceName], expectedPatterns);
}

assertDoesNotMatchAny(durableProposalRecordImplementationStatusSources.app, [
  /data-action="create-proposal-record"/,
  /data-action="apply-proposal"/,
]);

const durableProposalRecordCreationSmokeStatus = runStatus(
  repoRoot,
  'scripts/smoke-durable-proposal-record-creation.mjs',
);
const durableProposalRecordCreationSmokeRecord =
  durableProposalRecordCreationSmokeStatus.proposalRecord;

assert.equal(durableProposalRecordCreationSmokeStatus.ok, true);
assert.equal(durableProposalRecordCreationSmokeRecord.proposalId, 'proposal-record-0001');
assert.equal(durableProposalRecordCreationSmokeRecord.persisted, true);
assert.equal(durableProposalRecordCreationSmokeRecord.applyAllowed, false);
assert.deepEqual(durableProposalRecordCreationSmokeRecord.blockedActions, [
  'proposal-application',
  'provider-call',
  'memory-persistence',
  'source-mutation',
  'commit',
  'push',
]);
assert.equal(
  durableProposalRecordCreationSmokeRecord.statusAfterRollbackQuarantine,
  'quarantined',
);

process.stdout.write(
  `${JSON.stringify(
    {
      ok: true,
      mode: STATUS_MODE,
      schemaVersion: STATUS_SCHEMA_VERSION,
      posture: 'implementation-complete-creation-persistence-only',
      runtimeMutation: 'local state.json proposalRecords only',
      doesNotCommit: true,
      doesNotPush: true,
      focusedSmoke: {
        ok: durableProposalRecordCreationSmokeStatus.ok,
        proposalId: durableProposalRecordCreationSmokeRecord.proposalId,
        persisted: durableProposalRecordCreationSmokeRecord.persisted,
        applyAllowed: durableProposalRecordCreationSmokeRecord.applyAllowed,
        statusAfterRollbackQuarantine:
          durableProposalRecordCreationSmokeRecord.statusAfterRollbackQuarantine,
      },
      authority: {
        proposalRecordCreationAllowedThroughApprovedRuntimeFunction: true,
        proposalRecordPersistenceAllowedThroughApprovedRuntimeFunction: true,
        uiCreateActionAllowed: false,
        proposalApplicationAllowed: false,
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
