import assert from 'node:assert/strict';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-slice-06');
const runtime = createRuntimeService({ runtimeRoot });

function createArtifact(taskId, type, label) {
  const role = type === 'preflight' ? 'builder' : 'smoke';
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type,
    content: `# ${type}: ${label}\n\n${label}\n`,
  });
  const completedRun = runtime.completeRun({ runId: run.id });

  return {
    artifact,
    run: completedRun,
  };
}

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Builder live mutation approval request smoke',
  intent: 'Keep approval request semantics thin, target the latest preflight, and expose derived status/readiness.',
});

assert.throws(
  () => runtime.requestBuilderLiveMutationApproval({ taskId: task.id }),
  (error) => error.statusCode === 400 && /latest preflight artifact required/i.test(error.message),
);

const preflightOne = createArtifact(task.id, 'preflight', 'preflight one');
const requestSummaryBefore = runtime.getTaskGuardSummary(task.id).builderLiveMutationApprovalRequest;

assert.equal(requestSummaryBefore.allowed, true);
assert.equal(requestSummaryBefore.latestApprovalDisplayStatus, 'none');
assert.equal(requestSummaryBefore.currentPreflightArtifactId, preflightOne.artifact.id);
assert.equal(requestSummaryBefore.currentPreflightRunId, preflightOne.run.id);

const firstApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: task.id,
});
const pendingSummary = runtime.getTaskGuardSummary(task.id);

assert.equal(firstApproval.targetArtifactId, preflightOne.artifact.id);
assert.equal(firstApproval.targetRunId, preflightOne.run.id);
assert.equal(pendingSummary.builderLiveMutation.latestApprovalDisplayStatus, 'pending');
assert.equal(pendingSummary.builderLiveMutationApprovalRequest.allowed, false);
assert.equal(pendingSummary.builderLiveMutationApprovalRequest.conflict, true);
assert.throws(
  () => runtime.requestBuilderLiveMutationApproval({ taskId: task.id }),
  (error) => error.statusCode === 409 && /already pending/i.test(error.message),
);

runtime.resolveDecisionInboxItem({
  itemId: firstApproval.inboxItemId,
  action: 'rejected',
  note: 'Reject live mutation approval for the first preflight.',
});

const rejectedSummary = runtime.getTaskGuardSummary(task.id);

assert.equal(rejectedSummary.builderLiveMutation.latestApprovalDisplayStatus, 'rejected');
assert.equal(rejectedSummary.builderLiveMutationApprovalRequest.allowed, true);

const secondApproval = runtime.requestBuilderLiveMutationApproval({
  taskId: task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: secondApproval.inboxItemId,
  action: 'approved',
  note: 'Approve live mutation approval for the first preflight.',
});

const approvedSummary = runtime.getTaskGuardSummary(task.id);

assert.equal(approvedSummary.builderLiveMutation.latestApprovalDisplayStatus, 'approved');
assert.equal(approvedSummary.builderLiveMutationApprovalRequest.allowed, false);
assert.equal(approvedSummary.builderLiveMutationApprovalRequest.conflict, true);
assert.throws(
  () => runtime.requestBuilderLiveMutationApproval({ taskId: task.id }),
  (error) => error.statusCode === 409 && /already covers preflight/i.test(error.message),
);

const preflightTwo = createArtifact(task.id, 'preflight', 'preflight two');
const staleSummary = runtime.getTaskGuardSummary(task.id);

assert.equal(staleSummary.builderLiveMutation.latestApprovalDisplayStatus, 'stale');
assert.equal(staleSummary.builderLiveMutationApprovalRequest.allowed, true);
assert.equal(staleSummary.builderLiveMutationApprovalRequest.approvalStale, true);
assert.equal(staleSummary.builderLiveMutation.currentPreflightArtifactId, preflightTwo.artifact.id);
assert.equal(staleSummary.builderLiveMutation.targetPreflightArtifactId, preflightOne.artifact.id);

runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Blocking decision before new live mutation approval',
  prompt: 'Confirm the builder plan before requesting a fresh approval.',
  blocksTask: true,
});

const blockingSummary = runtime.getTaskGuardSummary(task.id).builderLiveMutationApprovalRequest;

assert.equal(blockingSummary.allowed, false);
assert.equal(blockingSummary.conflict, false);
assert.match(blockingSummary.reasons.join('; '), /blocking decision items/i);
assert.throws(
  () => runtime.requestBuilderLiveMutationApproval({ taskId: task.id }),
  (error) => error.statusCode === 400 && /blocking decision items/i.test(error.message),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: task.id,
      firstPreflightArtifactId: preflightOne.artifact.id,
      secondPreflightArtifactId: preflightTwo.artifact.id,
      latestApprovalDisplayStatus: staleSummary.builderLiveMutation.latestApprovalDisplayStatus,
    },
    null,
    2,
  ),
);
