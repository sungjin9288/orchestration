import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-durable-proposal-record-creation');
const projectRoot = path.join(process.cwd(), 'var', 'durable-proposal-record-project');

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(projectRoot, { recursive: true });

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'durable-proposal-record-project',
  projectPath: projectRoot,
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'Create durable proposal record',
  intent: 'Persist one reviewed proposal record without applying it.',
});

const creationApproval = {
  decisionId: 'operator-decision-vnext-proposal-record-implementation-001',
  status: 'approved',
  targetAuthority: 'durable proposal record creation and persistence',
  approvalStatement:
    'I approve implementation only for the durable proposal record creation and persistence slice described in docs/30_durable-proposal-record-implementation-plan.md. This does not approve proposal application, provider calls, memory persistence, source mutation, commit, or push.',
};

function buildCreationInput(overrides = {}) {
  return {
    projectId: project.id,
    taskId: task.id,
    title: 'Store reviewed growth evidence as a durable proposal record',
    proposalType: 'runtime-contract',
    expiresAt: '2026-07-29T00:00:00.000Z',
    sourceClaimIds: ['growth-ledger-claim-001'],
    evidenceRefs: ['DEC-056', 'docs/30_durable-proposal-record-implementation-plan.md'],
    negativeEvidenceRefs: ['no proposal application approval', 'provider calls remain blocked'],
    reviewerRefs: ['reviewer-evidence-001'],
    approvalRefs: [creationApproval.decisionId],
    affectedFiles: ['src/runtime/runtime-service.js', 'src/runtime/contracts.js'],
    riskClass: 'runtime-sensitive',
    creationApproval,
    reviewQuestion: 'Should this reviewed evidence be retained as a local proposal record?',
    verificationPlan: {
      commands: [
        'node scripts/smoke-durable-proposal-record-creation.mjs',
        'node scripts/verification_status.mjs',
      ],
      expectedSignals: ['proposal record persisted', 'applyAllowed remains false'],
      failureStopCondition:
        'Stop if creation happens without approval or if blocked actions are opened.',
      focusedSmokes: ['scripts/smoke-durable-proposal-record-creation.mjs'],
      aggregateChecks: ['scripts/verification_status.mjs'],
      manualReviewNotes: 'Creation is not proposal application approval.',
    },
    nonApprovalStatement:
      'Creating this durable proposal record does not approve proposal application, provider calls, memory persistence, source mutation, commit, or push.',
    ...overrides,
  };
}

assert.throws(
  () => runtime.createProposalRecord(buildCreationInput({ creationApproval: null })),
  /creationApproval is required/,
);
assert.throws(
  () => runtime.createProposalRecord(buildCreationInput({ sourceClaimIds: [] })),
  /sourceClaimIds must be a non-empty array/,
);
assert.throws(
  () => runtime.createProposalRecord(buildCreationInput({ negativeEvidenceRefs: [] })),
  /negativeEvidenceRefs must be a non-empty array/,
);
assert.throws(
  () => runtime.createProposalRecord(buildCreationInput({ reviewerRefs: [] })),
  /reviewerRefs must be a non-empty array/,
);
assert.throws(
  () => runtime.createProposalRecord(buildCreationInput({ affectedFiles: ['/tmp/outside'] })),
  /affectedFiles must contain repo-relative paths only/,
);

const proposalRecord = runtime.createProposalRecord(buildCreationInput());
const persistedRecord = runtime.getProposalRecord(proposalRecord.proposalId);
const state = JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'));

assert.equal(proposalRecord.proposalId, 'proposal-record-0001');
assert.equal(persistedRecord.status, 'created');
assert.equal(persistedRecord.applyAllowed, false);
assert.equal(persistedRecord.creationApproval.status, 'approved');
assert.equal(persistedRecord.approvalRefs.includes(creationApproval.decisionId), true);
assert.equal(persistedRecord.blockedActions.includes('proposal-application'), true);
assert.equal(persistedRecord.blockedActions.includes('provider-call'), true);
assert.equal(persistedRecord.blockedActions.includes('memory-persistence'), true);
assert.equal(persistedRecord.blockedActions.includes('source-mutation'), true);
assert.equal(persistedRecord.blockedActions.includes('commit'), true);
assert.equal(persistedRecord.blockedActions.includes('push'), true);
assert.equal(state.sequences.proposalRecord, 1);
assert.deepEqual(Object.keys(state.proposalRecords), [proposalRecord.proposalId]);

const recordsForProject = runtime.listProposalRecords({ projectId: project.id });
assert.equal(recordsForProject.length, 1);
assert.equal(recordsForProject[0].proposalId, proposalRecord.proposalId);

const quarantinedRecord = runtime.quarantineProposalRecord({
  proposalId: proposalRecord.proposalId,
  reason: 'rollback smoke preserves invalid local records as audit evidence',
});

assert.equal(quarantinedRecord.status, 'quarantined');
assert.equal(quarantinedRecord.applyAllowed, false);
assert.equal(runtime.listProposalRecords({ status: 'quarantined' }).length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      proposalRecord: {
        proposalId: proposalRecord.proposalId,
        persisted: Boolean(state.proposalRecords[proposalRecord.proposalId]),
        applyAllowed: persistedRecord.applyAllowed,
        blockedActions: persistedRecord.blockedActions,
        statusAfterRollbackQuarantine: quarantinedRecord.status,
      },
    },
    null,
    2,
  ),
);
