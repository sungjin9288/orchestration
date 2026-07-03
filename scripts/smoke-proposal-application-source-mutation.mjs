import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-proposal-source-mutation');
const projectRoot = path.join(process.cwd(), 'var', 'proposal-source-mutation-project');
const targetRelativePath = 'notes/growth-remediation-target.md';
const beforeContent = '# Growth remediation target\n\nbaseline content line\n';
const afterContent = '# Growth remediation target\n\nremediated content line\n';
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

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(path.join(projectRoot, 'notes'), { recursive: true });
fs.writeFileSync(path.join(projectRoot, targetRelativePath), beforeContent);

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'proposal-source-mutation-project',
  projectPath: projectRoot,
});
const task = runtime.createTask({
  projectId: project.id,
  title: 'Apply exactly one approved proposal source mutation',
  intent: 'Prove the single approved source mutation path with rollback evidence.',
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

const sourceMutationApproval = {
  decisionId: 'operator-decision-vnext-proposal-source-mutation-implementation-001',
  decisionStatus: 'approve-source-mutation-implementation-slice',
  status: 'approved',
  targetAuthority:
    'proposal application source mutation implementation for exactly one accepted mutation plan',
  approvalStatement:
    'I approve implementation only for the source mutation slice described in DEC-065 and docs/38_proposal-application-source-mutation-planning-plan.md. This does not approve proposal generation, provider calls, memory persistence, source mutation outside the named path, commit, or push.',
};

const proposalRecord = runtime.createProposalRecord({
  projectId: project.id,
  taskId: task.id,
  title: 'Reviewed growth remediation source mutation proposal',
  proposalType: 'runtime-contract',
  expiresAt: '2026-07-29T00:00:00.000Z',
  sourceClaimIds: ['growth-ledger-claim-001'],
  evidenceRefs: ['DEC-065', 'docs/38_proposal-application-source-mutation-planning-plan.md'],
  negativeEvidenceRefs: ['source mutation outside the named path remains blocked'],
  reviewerRefs: ['reviewer-evidence-001'],
  approvalRefs: [creationApproval.decisionId],
  affectedFiles: [targetRelativePath],
  riskClass: 'runtime-sensitive',
  creationApproval,
  reviewQuestion: 'Should this reviewed remediation be applied as one source mutation?',
  verificationPlan: {
    commands: ['node scripts/smoke-proposal-application-source-mutation.mjs'],
    expectedSignals: ['source mutation applied', 'rollback restores baseline'],
    failureStopCondition: 'Stop if blocked actions are opened.',
    focusedSmokes: ['scripts/smoke-proposal-application-source-mutation.mjs'],
    aggregateChecks: ['scripts/verification_status.mjs'],
    manualReviewNotes: 'Source mutation stays limited to the named path.',
  },
  nonApprovalStatement:
    'Creating this durable proposal record does not approve proposal application, provider calls, memory persistence, source mutation, commit, or push.',
});

const applicationAttempt = runtime.createProposalApplicationAttempt({
  proposalId: proposalRecord.proposalId,
  applicationApproval,
  applicationApprovalRefs: [applicationApproval.decisionId],
  sourceEvidenceRefs: ['DEC-062', 'docs/35_proposal-application-implementation.md'],
  negativeEvidenceRefs: ['source mutation remains blocked until a later explicit decision'],
  rollbackRefs: ['disable application attempt entrypoint', 'quarantine failed attempts'],
  focusedSmokeRefs: ['scripts/smoke-proposal-application-attempt-creation.mjs'],
});

function buildMutationInput(overrides = {}) {
  return {
    proposalId: proposalRecord.proposalId,
    applicationAttemptId: applicationAttempt.applicationAttemptId,
    sourceMutationApproval,
    sourceMutationApprovalRefs: [sourceMutationApproval.decisionId],
    mutationPlanRefs: ['DEC-065', 'docs/38_proposal-application-source-mutation-planning-plan.md'],
    sourceEvidenceRefs: ['DEC-062', 'DEC-063', 'DEC-064', 'DEC-065'],
    negativeEvidenceRefs: [
      'proposal generation remains blocked',
      'provider calls remain blocked',
      'memory persistence remains blocked',
      'source mutation outside the named path remains blocked',
      'commit and push remain blocked',
    ],
    rollbackRefs: [
      'restore recorded beforeContent through rollbackProposalSourceMutation',
      'quarantine failed source mutations',
    ],
    focusedSmokeRefs: ['scripts/smoke-proposal-application-source-mutation.mjs'],
    mutation: {
      relativePath: targetRelativePath,
      expectedBeforeContent: beforeContent,
      afterContent,
    },
    cleanBaselineProof: {
      statusOutput: '',
      capturedAt: '2026-07-03T00:00:00.000Z',
    },
    dryRunDiffPreview: {
      diffText: `--- a/${targetRelativePath}\n+++ b/${targetRelativePath}\n-baseline content line\n+remediated content line\n`,
      previewedAt: '2026-07-03T00:00:01.000Z',
    },
    ...overrides,
  };
}

// Approval gate rejections
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ sourceMutationApproval: null })),
  /sourceMutationApproval is required/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        sourceMutationApproval: {
          ...sourceMutationApproval,
          decisionStatus: 'approve-application-planning-only',
        },
      }),
    ),
  /sourceMutationApproval\.decisionStatus must be approve-source-mutation-implementation-slice/,
);
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ sourceMutationApprovalRefs: ['other-ref'] })),
  /sourceMutationApprovalRefs must include sourceMutationApproval\.decisionId/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        sourceMutationApproval: {
          ...sourceMutationApproval,
          decisionId: applicationApproval.decisionId,
        },
        sourceMutationApprovalRefs: [applicationApproval.decisionId],
      }),
    ),
  /sourceMutationApproval must be separate from application approval/,
);

// Target gate rejections
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ mutation: [buildMutationInput().mutation, buildMutationInput().mutation] })),
  /mutation must name exactly one target file/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        mutation: {
          relativePath: '../escape.md',
          expectedBeforeContent: beforeContent,
          afterContent,
        },
      }),
    ),
  /mutation\.relativePath must stay inside the project path/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        mutation: {
          relativePath: 'notes/unlisted.md',
          expectedBeforeContent: beforeContent,
          afterContent,
        },
        dryRunDiffPreview: {
          diffText: '--- a/notes/unlisted.md\n+++ b/notes/unlisted.md\n',
          previewedAt: '2026-07-03T00:00:01.000Z',
        },
      }),
    ),
  /mutation\.relativePath must be listed in proposalRecord\.affectedFiles/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        mutation: {
          relativePath: targetRelativePath,
          expectedBeforeContent: beforeContent,
          afterContent: beforeContent,
        },
      }),
    ),
  /mutation\.afterContent must differ from the current target content/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        mutation: {
          relativePath: targetRelativePath,
          expectedBeforeContent: 'stale baseline\n',
          afterContent,
        },
      }),
    ),
  /mutation\.expectedBeforeContent must match the current target content/,
);

// Evidence gate rejections
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({ cleanBaselineProof: { statusOutput: ' M dirty.js', capturedAt: '2026-07-03T00:00:00.000Z' } }),
    ),
  /cleanBaselineProof\.statusOutput must be empty/,
);
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ cleanBaselineProof: null })),
  /cleanBaselineProof is required/,
);
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ dryRunDiffPreview: null })),
  /dryRunDiffPreview is required/,
);
assert.throws(
  () =>
    runtime.applyProposalSourceMutation(
      buildMutationInput({
        dryRunDiffPreview: { diffText: 'diff without the target path', previewedAt: '2026-07-03T00:00:01.000Z' },
      }),
    ),
  /dryRunDiffPreview\.diffText must reference the target relativePath/,
);
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ rollbackRefs: [] })),
  /rollbackRefs/,
);
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ focusedSmokeRefs: [] })),
  /focusedSmokeRefs/,
);

// Attempt linkage rejections
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ applicationAttemptId: 'proposal-application-attempt-9999' })),
  /Proposal application attempt not found/,
);

// The target file is untouched by every rejected call above.
assert.equal(fs.readFileSync(path.join(projectRoot, targetRelativePath), 'utf8'), beforeContent);

// Approved single apply path
const appliedMutation = runtime.applyProposalSourceMutation(buildMutationInput());

assert.equal(appliedMutation.sourceMutationId, 'proposal-source-mutation-0001');
assert.equal(appliedMutation.status, 'applied');
assert.equal(appliedMutation.relativePath, targetRelativePath);
assert.equal(fs.readFileSync(path.join(projectRoot, targetRelativePath), 'utf8'), afterContent);
assert.deepEqual(appliedMutation.blockedActions, proposalSourceMutationBlockedActions);

for (const authorityFlag of proposalSourceMutationAuthorityFlags) {
  assert.equal(appliedMutation[authorityFlag], false, `${authorityFlag} must stay false`);
}

// Proposal record application stays blocked after the mutation.
assert.equal(runtime.getProposalRecord(proposalRecord.proposalId).applyAllowed, false);

// Exactly one mutation per audit-only attempt.
assert.throws(
  () => runtime.applyProposalSourceMutation(buildMutationInput({ mutation: { relativePath: targetRelativePath, expectedBeforeContent: afterContent, afterContent: beforeContent } })),
  /proposalApplicationAttempt already authorized one source mutation/,
);

// Persistence and load-time authority hardening.
const persistedState = JSON.parse(
  fs.readFileSync(path.join(runtimeRoot, 'state.json'), 'utf8'),
);

assert.ok(persistedState.proposalSourceMutations['proposal-source-mutation-0001']);

const reloadedRuntime = createRuntimeService({ runtimeRoot });
const reloadedMutation = reloadedRuntime.getProposalSourceMutation('proposal-source-mutation-0001');

for (const authorityFlag of proposalSourceMutationAuthorityFlags) {
  assert.equal(reloadedMutation[authorityFlag], false, `${authorityFlag} must reload false`);
}

// Rollback restores the recorded baseline.
const rolledBackMutation = runtime.rollbackProposalSourceMutation({
  sourceMutationId: appliedMutation.sourceMutationId,
  reason: 'Prove rollback evidence for the focused smoke.',
});

assert.equal(rolledBackMutation.status, 'rolled-back');
assert.equal(fs.readFileSync(path.join(projectRoot, targetRelativePath), 'utf8'), beforeContent);
assert.throws(
  () =>
    runtime.rollbackProposalSourceMutation({
      sourceMutationId: appliedMutation.sourceMutationId,
      reason: 'Rollback twice must fail.',
    }),
  /proposalSourceMutation\.status must be applied/,
);

// Quarantine path stays available and keeps authority flags false.
const quarantinedMutation = runtime.quarantineProposalSourceMutation({
  sourceMutationId: appliedMutation.sourceMutationId,
  reason: 'Quarantine after rollback for evidence hygiene.',
});

assert.equal(quarantinedMutation.status, 'quarantined');

for (const authorityFlag of proposalSourceMutationAuthorityFlags) {
  assert.equal(quarantinedMutation[authorityFlag], false, `${authorityFlag} must stay false after quarantine`);
}

const listedMutations = runtime.listProposalSourceMutations({
  proposalId: proposalRecord.proposalId,
});

assert.equal(listedMutations.length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      projectRoot,
      sourceMutationId: appliedMutation.sourceMutationId,
      appliedThenRolledBack: true,
      targetRestored: true,
      blockedActions: proposalSourceMutationBlockedActions,
      stillBlockedAuthorities: {
        proposalGenerationAllowed: false,
        providerCallsAllowed: false,
        memoryPersistenceAllowed: false,
        sourceMutationOutsideNamedPathAllowed: false,
        commitAllowed: false,
        pushAllowed: false,
      },
    },
    null,
    2,
  ),
);
