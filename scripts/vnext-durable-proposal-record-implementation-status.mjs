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

const contracts = readFile('src/runtime/contracts.js');
const fileStore = readFile('src/runtime/file-store.js');
const runtimeService = readFile('src/runtime/runtime-service.js');
const app = readFile('ui/app.js');
const decisionLog = readFile('docs/01_decision-log.md');
const implementationPlan = readFile('docs/30_durable-proposal-record-implementation-plan.md');
const readme = readFile('README.md');
const inventory = readFile('docs/22_completion-gate-inventory.md');
const verification = readFile('scripts/verification_status.mjs');

assert.match(contracts, /schemaVersion: 5/);
assert.match(contracts, /proposalRecord: 0/);
assert.match(contracts, /proposalRecords: \{\}/);
assert.match(contracts, /PROPOSAL_RECORD_DEFAULT_BLOCKED_ACTIONS/);
assert.match(fileStore, /proposalRecords: state\.proposalRecords \|\| \{\}/);
assert.match(fileStore, /proposalRecord\.applyAllowed = false/);
assert.match(runtimeService, /function createProposalRecord\(input = \{\}\)/);
assert.match(runtimeService, /function nextProposalRecordId\(state\)/);
assert.match(runtimeService, /proposal-record-\$\{String\(state\.sequences\.proposalRecord\)\.padStart\(4, '0'\)\}/);
assert.match(runtimeService, /creationApproval\.status must be approved/);
assert.match(runtimeService, /approvalRefs must include creationApproval\.decisionId/);
assert.match(runtimeService, /applyAllowed: false/);
assert.match(runtimeService, /function quarantineProposalRecord\(input = \{\}\)/);
assert.match(app, /function renderDurableProposalRecordLedger\(growth\)/);
assert.match(app, /data-durable-proposal-record-ledger="read-only"/);
assert.match(app, /data-proposal-application-allowed="\$\{GROWTH_AUTHORITY_BOUNDARY\.proposalApplicationAllowed\}"/);
assert.match(app, /proposalRecordCreationAllowed: false/);
assert.match(app, /proposalRecordPersistenceAllowed: false/);
assert.doesNotMatch(app, /data-action="create-proposal-record"/);
assert.doesNotMatch(app, /data-action="apply-proposal"/);
assert.match(decisionLog, /### DEC-057/);
assert.match(decisionLog, /approve-implementation-slice/);
assert.match(implementationPlan, /Implementation approval: accepted/);
assert.match(implementationPlan, /Runtime implementation: completed/);
assert.match(implementationPlan, /Default expiry policy: 30 days from `createdAt`/);
assert.match(readme, /Durable proposal record creation and persistence is implemented/);
assert.match(inventory, /vNext durable proposal record implementation/);
assert.match(verification, /vnext-durable-proposal-record-implementation-status\.mjs/);
assert.match(verification, /smoke-durable-proposal-record-creation\.mjs/);

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
