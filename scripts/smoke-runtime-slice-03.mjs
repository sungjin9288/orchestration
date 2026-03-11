import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, COMMIT_ACTION, REVIEW_STATUS, TASK_LIFECYCLE } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const runtime = createRuntimeService({
  runtimeRoot: path.join(process.cwd(), 'var', 'runtime-slice-03'),
});

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Runtime slice 03 smoke',
  intent:
    'Verify review resolution, approval read/list surface, and minimal guards for Done and commit transitions.',
});

const run = runtime.startPlaceholderRun({ taskId: task.id });

const artifact = runtime.recordArtifact({
  taskId: task.id,
  runId: run.id,
  content: '# runtime-slice-03\n\nverification artifact\n',
});

runtime.finishRunWithReviewPending({ runId: run.id });

assert.throws(
  () => runtime.transitionTaskLifecycle({ taskId: task.id, to: TASK_LIFECYCLE.DONE }),
  /review is unresolved/,
);

let reviewItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
  kind: 'review',
});

assert.equal(reviewItems.length, 1);

runtime.resolveReview({
  taskId: task.id,
  itemId: reviewItems[0].id,
  action: REVIEW_STATUS.CHANGES_REQUESTED,
  note: 'Follow-up is required before done.',
  verificationArtifactIds: [artifact.id],
});

let taskAfterReviewChanges = runtime.getTask(task.id);

assert.equal(taskAfterReviewChanges.review.status, REVIEW_STATUS.CHANGES_REQUESTED);
assert.equal(taskAfterReviewChanges.review.inboxItemId, null);
assert.deepEqual(taskAfterReviewChanges.review.verificationArtifactIds, [artifact.id]);
assert.equal(
  runtime.listDecisionInboxItems({
    taskId: task.id,
    status: 'pending',
    kind: 'review',
  }).length,
  0,
);
assert.throws(
  () => runtime.transitionTaskLifecycle({ taskId: task.id, to: TASK_LIFECYCLE.DONE }),
  /review is unresolved/,
);

const followUpRun = runtime.startPlaceholderRun({ taskId: task.id });

runtime.finishRunWithReviewPending({ runId: followUpRun.id });

reviewItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
  kind: 'review',
});

assert.equal(reviewItems.length, 1);

runtime.resolveReview({
  taskId: task.id,
  itemId: reviewItems[0].id,
  action: REVIEW_STATUS.PASSED,
  note: 'Review passed with verification evidence.',
  verificationArtifactIds: [artifact.id],
});

const taskAfterReviewPassed = runtime.getTask(task.id);

assert.equal(taskAfterReviewPassed.review.status, REVIEW_STATUS.PASSED);
assert.equal(taskAfterReviewPassed.review.inboxItemId, null);
assert.deepEqual(taskAfterReviewPassed.review.verificationArtifactIds, [artifact.id]);

const commitIntentApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  title: 'Approval required: commit-intent',
  prompt: 'Commit-intent must remain blocked until approval is recorded.',
});

assert.equal(runtime.getApproval(commitIntentApproval.id).id, commitIntentApproval.id);
assert.equal(
  runtime.listApprovals({
    taskId: task.id,
    status: APPROVAL_STATUS.PENDING,
    allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  }).length,
  1,
);
assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: task.id,
      action: COMMIT_ACTION.COMMIT_INTENT,
    }),
  /approval is unresolved/,
);

runtime.resolveDecisionInboxItem({
  itemId: commitIntentApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Commit-intent approved.',
});

assert.equal(
  runtime.ensureCommitActionAllowed({
    taskId: task.id,
    action: COMMIT_ACTION.COMMIT_INTENT,
  }).allowed,
  true,
);

const commitReadyApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_READY,
  title: 'Approval required: commit-ready',
  prompt: 'Commit-ready must remain blocked until approval is recorded.',
});

assert.equal(runtime.listApprovals({ taskId: task.id }).length, 2);
assert.equal(
  runtime.listApprovals({
    taskId: task.id,
    status: APPROVAL_STATUS.APPROVED,
  }).length,
  1,
);
assert.equal(
  runtime.listApprovals({
    taskId: task.id,
    status: APPROVAL_STATUS.PENDING,
    allowedNextAction: COMMIT_ACTION.COMMIT_READY,
  }).length,
  1,
);
assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: task.id,
      action: COMMIT_ACTION.COMMIT_READY,
    }),
  /approval is unresolved/,
);

runtime.resolveDecisionInboxItem({
  itemId: commitReadyApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Commit-ready approved.',
});

assert.equal(
  runtime.ensureCommitActionAllowed({
    taskId: task.id,
    action: COMMIT_ACTION.COMMIT_READY,
  }).allowed,
  true,
);

const doneTask = runtime.transitionTaskLifecycle({
  taskId: task.id,
  to: TASK_LIFECYCLE.DONE,
});

const pendingItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
});
const snapshot = runtime.getSnapshot();

assert.equal(doneTask.lifecycleState, TASK_LIFECYCLE.DONE);
assert.equal(pendingItems.length, 0);
assert.equal(Object.keys(snapshot.projects).length, 1);
assert.equal(Object.keys(snapshot.tasks).length, 1);
assert.equal(Object.keys(snapshot.runs).length, 2);
assert.equal(Object.keys(snapshot.artifacts).length, 1);
assert.equal(Object.keys(snapshot.approvals).length, 2);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 4);
assert.equal(runtime.getArtifact(artifact.id).runId, run.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      counts: {
        projects: Object.keys(snapshot.projects).length,
        tasks: Object.keys(snapshot.tasks).length,
        runs: Object.keys(snapshot.runs).length,
        artifacts: Object.keys(snapshot.artifacts).length,
        approvals: Object.keys(snapshot.approvals).length,
        inboxItems: Object.keys(snapshot.decisionInboxItems).length,
      },
      task: {
        id: doneTask.id,
        lifecycleState: doneTask.lifecycleState,
        reviewStatus: runtime.getTask(task.id).review.status,
      },
      approvals: runtime.listApprovals({ taskId: task.id }).map((approval) => ({
        id: approval.id,
        status: approval.status,
        allowedNextAction: approval.allowedNextAction,
      })),
    },
    null,
    2,
  ),
);
