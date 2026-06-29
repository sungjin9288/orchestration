import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-durable-proposal-record-implementation-status';
const STATUS_SCHEMA_VERSION = '1.0.0';

requireNoCliArgs(process.argv.slice(2), {
  mode: STATUS_MODE,
});

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function runJson(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

function assertMatchesAll(source, expectedPatterns) {
  for (const expectedPattern of expectedPatterns) {
    assert.match(source, expectedPattern);
  }
}

function assertDoesNotMatchAny(source, forbiddenPatterns) {
  for (const forbiddenPattern of forbiddenPatterns) {
    assert.doesNotMatch(source, forbiddenPattern);
  }
}

function assertSourceEvidence(sourcesByName, evidenceBySource) {
  for (const [sourceName, expectedPatterns] of Object.entries(evidenceBySource)) {
    assertMatchesAll(sourcesByName[sourceName], expectedPatterns);
  }
}

const files = {
  contracts: 'src/runtime/contracts.js',
  fileStore: 'src/runtime/file-store.js',
  runtimeService: 'src/runtime/runtime-service.js',
  app: 'ui/app.js',
  decisionLog: 'docs/01_decision-log.md',
  implementationPlan: 'docs/30_durable-proposal-record-implementation-plan.md',
  readme: 'README.md',
  inventory: 'docs/22_completion-gate-inventory.md',
  verification: 'scripts/verification_status.mjs',
};

const sources = Object.fromEntries(
  Object.entries(files).map(([name, relativePath]) => [name, readFile(relativePath)]),
);

const sourceEvidence = {
  contracts: [
    /schemaVersion: 5/,
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
    /creationApproval\.status must be approved/,
    /approvalRefs must include creationApproval\.decisionId/,
    /applyAllowed: false/,
    /function quarantineProposalRecord\(input = \{\}\)/,
  ],
  app: [
    /function renderDurableProposalRecordLedger\(growth\)/,
    /data-durable-proposal-record-ledger="read-only"/,
    /data-proposal-application-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalApplicationAllowed\}"/,
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

assertSourceEvidence(sources, sourceEvidence);

assertDoesNotMatchAny(sources.app, [
  /data-action="create-proposal-record"/,
  /data-action="apply-proposal"/,
]);

const smokeStatus = runJson('scripts/smoke-durable-proposal-record-creation.mjs');
assert.equal(smokeStatus.ok, true);
assert.equal(smokeStatus.proposalRecord.proposalId, 'proposal-record-0001');
assert.equal(smokeStatus.proposalRecord.persisted, true);
assert.equal(smokeStatus.proposalRecord.applyAllowed, false);
assert.deepEqual(smokeStatus.proposalRecord.blockedActions, [
  'proposal-application',
  'provider-call',
  'memory-persistence',
  'source-mutation',
  'commit',
  'push',
]);
assert.equal(smokeStatus.proposalRecord.statusAfterRollbackQuarantine, 'quarantined');

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
        ok: smokeStatus.ok,
        proposalId: smokeStatus.proposalRecord.proposalId,
        persisted: smokeStatus.proposalRecord.persisted,
        applyAllowed: smokeStatus.proposalRecord.applyAllowed,
        statusAfterRollbackQuarantine:
          smokeStatus.proposalRecord.statusAfterRollbackQuarantine,
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
