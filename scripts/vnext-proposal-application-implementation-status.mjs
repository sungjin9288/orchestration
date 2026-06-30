import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { requireNoCliArgs } from './read-only-cli-guard.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const STATUS_MODE = 'vnext-proposal-application-implementation-status';
const STATUS_SCHEMA_VERSION = '1.0.0';
const blockedActions = [
  'proposal-generation',
  'provider-call',
  'memory-persistence',
  'source-mutation',
  'commit',
  'push',
];

requireNoCliArgs(process.argv.slice(2), { mode: STATUS_MODE });

function readFile(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function runJson(script) {
  return JSON.parse(execFileSync('node', [script], { cwd: repoRoot, encoding: 'utf8' }));
}

function assertMatchesAll(source, patterns) {
  for (const pattern of patterns) {
    assert.match(source, pattern);
  }
}

function assertAuthorityIsBlocked(authority) {
  for (const value of Object.values(authority)) {
    assert.equal(value, false);
  }
}

const sources = {
  app: readFile('ui/app.js'),
  contracts: readFile('src/runtime/contracts.js'),
  decisionLog: readFile('docs/01_decision-log.md'),
  implementationDoc: readFile('docs/35_proposal-application-implementation.md'),
  inventory: readFile('docs/22_completion-gate-inventory.md'),
  fileStore: readFile('src/runtime/file-store.js'),
  readme: readFile('README.md'),
  runtimeService: readFile('src/runtime/runtime-service.js'),
  verification: readFile('scripts/verification_status.mjs'),
};

assertMatchesAll(sources.contracts, [
  /PROPOSAL_APPLICATION_ATTEMPT_STATUS/,
  /PROPOSAL_APPLICATION_ATTEMPT_DEFAULT_BLOCKED_ACTIONS/,
  /proposalApplicationAttempt: 0/,
  /proposalApplicationAttempts: \{\}/,
]);
assertMatchesAll(sources.fileStore, [
  /proposalApplicationAttempts: state\.proposalApplicationAttempts \|\| \{\}/,
  /proposalRecord\.applicationAttemptIds/,
  /proposalApplicationAttempt\.sourceMutationAllowed = false/,
  /proposalApplicationAttempt\.pushAllowed = false/,
]);
assertMatchesAll(sources.runtimeService, [
  /function createProposalApplicationAttempt\(input = \{\}\)/,
  /function normalizeProposalApplicationApproval\(input\)/,
  /applicationApproval\.decisionStatus must be approve-application-implementation-slice/,
  /applicationApprovalRefs must include applicationApproval\.decisionId/,
  /applicationApproval must be separate from creation approval/,
  /function quarantineProposalApplicationAttempt\(input = \{\}\)/,
]);
assertMatchesAll(sources.app, [
  /proposalApplicationAttemptCreationAllowed: false/,
  /proposalApplicationAttemptPersistenceAllowed: false/,
  /data-proposal-application-attempt-ledger="(?:empty\/)?read-only"/,
  /data-proposal-application-attempts-count/,
]);
assertMatchesAll(sources.decisionLog, [/### DEC-062/, /approve-application-implementation-slice/]);
assertMatchesAll(sources.implementationDoc, [
  /Implementation approval: accepted/,
  /Runtime implementation: completed/,
  /record one inert application attempt/,
  /source mutation remains blocked/i,
]);
assert.match(sources.readme, /Proposal application audit-only attempt is implemented/);
assert.match(sources.inventory, /vNext proposal application implementation/);
assertMatchesAll(sources.verification, [
  /smoke-proposal-application-attempt-creation\.mjs/,
  /vnext-proposal-application-implementation-status\.mjs/,
]);

const smokeStatus = runJson('scripts/smoke-proposal-application-attempt-creation.mjs');
const attempt = smokeStatus.applicationAttempt;

assert.equal(smokeStatus.ok, true);
assert.equal(attempt.applicationAttemptId, 'proposal-application-attempt-0001');
assert.equal(attempt.persisted, true);
assert.equal(attempt.status, 'planned');
assert.deepEqual(attempt.blockedActions, blockedActions);
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
