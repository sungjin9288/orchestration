import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-proposal-application-attempt');
const projectRoot = path.join(process.cwd(), 'var', 'proposal-application-attempt-project');
const proposalApplicationAttemptBlockedActions = [
  'proposal-generation',
  'provider-call',
  'memory-persistence',
  'source-mutation',
  'commit',
  'push',
];
const proposalApplicationAttemptAuthorityFlags = [
  'proposalGenerationAllowed',
  'providerCallsAllowed',
  'memoryPersistenceAllowed',
  'sourceMutationAllowed',
  'commitAllowed',
  'pushAllowed',
];

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(projectRoot, { recursive: true });

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'proposal-application-attempt-project',
  projectPath: projectRoot,
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'Record audit-only proposal application attempt',
  intent: 'Persist one inert application attempt without applying a proposal.',
});

const creationApproval = {
  decisionId: 'operator-decision-vnext-proposal-record-implementation-001',
  status: 'approved',
  targetAuthority: 'durable proposal record creation and persistence',
  approvalStatement:
    'I approve implementation only for the durable proposal record creation and persistence slice described in docs/30_durable-proposal-record-implementation-plan.md. This does not approve proposal application, provider calls, memory persistence, source mutation, commit, or push.',
};

const applicationApproval = {
  decisionId: 'operator-decision-vnext-proposal-application-implementation-001',
  decisionStatus: 'approve-application-implementation-slice',
  status: 'approved',
  targetAuthority:
    'proposal application implementation for one audit-only attempt path on existing durable proposal records',
  approvalStatement:
    'I approve implementation only for one audit-only proposal application attempt path on existing durable proposal records. This does not approve proposal generation, provider calls, memory persistence, source mutation, commit, or push.',
};

function buildProposalRecordInput(overrides = {}) {
  return {
    projectId: project.id,
    taskId: task.id,
    title: 'Reviewed growth evidence proposal record',
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
      commands: ['node scripts/smoke-durable-proposal-record-creation.mjs'],
      expectedSignals: ['proposal record persisted', 'applyAllowed remains false'],
      failureStopCondition: 'Stop if blocked actions are opened.',
      focusedSmokes: ['scripts/smoke-durable-proposal-record-creation.mjs'],
      aggregateChecks: ['scripts/verification_status.mjs'],
      manualReviewNotes: 'Creation is not proposal application approval.',
    },
    nonApprovalStatement:
      'Creating this durable proposal record does not approve proposal application, provider calls, memory persistence, source mutation, commit, or push.',
    ...overrides,
  };
}

function buildAttemptInput(proposalId, overrides = {}) {
  return {
    proposalId,
    applicationApproval,
    applicationApprovalRefs: [applicationApproval.decisionId],
    sourceEvidenceRefs: ['DEC-057', 'DEC-058', 'DEC-059', 'DEC-060', 'DEC-061'],
    negativeEvidenceRefs: [
      'proposal generation remains blocked',
      'source mutation remains blocked',
      'provider calls remain blocked',
      'memory persistence remains blocked',
      'commit and push remain blocked',
    ],
    rollbackRefs: ['disable application attempt entrypoint', 'quarantine failed attempts'],
    focusedSmokeRefs: ['scripts/smoke-proposal-application-attempt-creation.mjs'],
    ...overrides,
  };
}

const proposalRecord = runtime.createProposalRecord(buildProposalRecordInput());

assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, { applicationApproval: null }),
    ),
  /applicationApproval is required/,
);
assert.throws(
  () => runtime.createProposalApplicationAttempt(buildAttemptInput('proposal-record-9999')),
  /Proposal record not found/,
);
assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, { applicationApprovalRefs: [] }),
    ),
  /applicationApprovalRefs must be a non-empty array/,
);
assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, {
        applicationApprovalRefs: ['wrong-approval'],
      }),
    ),
  /applicationApprovalRefs must include applicationApproval.decisionId/,
);
assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, { sourceEvidenceRefs: [] }),
    ),
  /sourceEvidenceRefs must be a non-empty array/,
);
assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, {
        applicationApproval: {
          ...applicationApproval,
          approvalStatement:
            'I approve implementation only for one audit-only proposal application attempt path. This does not approve provider calls, memory persistence, source mutation, commit, or push.',
        },
      }),
    ),
  /proposal generation blocked/,
);
assert.throws(
  () =>
    runtime.createProposalApplicationAttempt(
      buildAttemptInput(proposalRecord.proposalId, {
        applicationApproval: { ...applicationApproval, decisionId: creationApproval.decisionId },
        applicationApprovalRefs: [creationApproval.decisionId],
      }),
    ),
  /applicationApproval must be separate from creation approval/,
);

const expiredRecord = runtime.createProposalRecord(
  buildProposalRecordInput({
    title: 'Expired proposal record',
    expiresAt: '2026-01-01T00:00:00.000Z',
  }),
);
assert.throws(
  () => runtime.createProposalApplicationAttempt(buildAttemptInput(expiredRecord.proposalId)),
  /proposalRecord must not be expired/,
);

const quarantinedRecord = runtime.createProposalRecord(
  buildProposalRecordInput({ title: 'Quarantined proposal record' }),
);
runtime.quarantineProposalRecord({
  proposalId: quarantinedRecord.proposalId,
  reason: 'rollback smoke quarantines records before application attempts',
});
assert.throws(
  () => runtime.createProposalApplicationAttempt(buildAttemptInput(quarantinedRecord.proposalId)),
  /proposalRecord.status must be created/,
);

const applicationAttempt = runtime.createProposalApplicationAttempt(
  buildAttemptInput(proposalRecord.proposalId),
);
const persistedAttempt = runtime.getProposalApplicationAttempt(
  applicationAttempt.applicationAttemptId,
);
const state = JSON.parse(fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'));

assert.equal(applicationAttempt.applicationAttemptId, 'proposal-application-attempt-0001');
assert.equal(persistedAttempt.status, 'planned');
assert.deepEqual(persistedAttempt.blockedActions, proposalApplicationAttemptBlockedActions);

for (const authorityFlag of proposalApplicationAttemptAuthorityFlags) {
  assert.equal(persistedAttempt[authorityFlag], false);
}

assert.deepEqual(Object.keys(state.proposalApplicationAttempts), [
  applicationAttempt.applicationAttemptId,
]);
assert.equal(
  runtime
    .getProposalRecord(proposalRecord.proposalId)
    .applicationAttemptIds.includes(applicationAttempt.applicationAttemptId),
  true,
);
assert.throws(
  () => runtime.createProposalApplicationAttempt(buildAttemptInput(proposalRecord.proposalId)),
  /proposalRecord already has an application attempt/,
);

const quarantinedAttempt = runtime.quarantineProposalApplicationAttempt({
  applicationAttemptId: applicationAttempt.applicationAttemptId,
  reason: 'rollback smoke preserves audit evidence without source mutation',
});
assert.equal(quarantinedAttempt.status, 'quarantined');

console.log(
  JSON.stringify(
    {
      ok: true,
      applicationAttempt: {
        applicationAttemptId: applicationAttempt.applicationAttemptId,
        persisted: Boolean(state.proposalApplicationAttempts[applicationAttempt.applicationAttemptId]),
        proposalId: applicationAttempt.proposalId,
        status: persistedAttempt.status,
        blockedActions: persistedAttempt.blockedActions,
        authority: {
          proposalGenerationAllowed: persistedAttempt.proposalGenerationAllowed,
          providerCallsAllowed: persistedAttempt.providerCallsAllowed,
          memoryPersistenceAllowed: persistedAttempt.memoryPersistenceAllowed,
          sourceMutationAllowed: persistedAttempt.sourceMutationAllowed,
          commitAllowed: persistedAttempt.commitAllowed,
          pushAllowed: persistedAttempt.pushAllowed,
        },
        statusAfterRollbackQuarantine: quarantinedAttempt.status,
      },
    },
    null,
    2,
  ),
);
