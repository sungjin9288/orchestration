import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, COMMIT_ACTION, REVIEW_STATUS, TASK_LIFECYCLE } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const runtime = createRuntimeService({
  runtimeRoot: path.join(process.cwd(), 'var', 'runtime-slice-04'),
});

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Runtime slice 04 smoke',
  intent:
    'Verify centralized gate guards for Done and commit actions with explicit approved commit approval records.',
});

const run = runtime.startPlaceholderRun({ taskId: task.id });

const artifact = runtime.recordArtifact({
  taskId: task.id,
  runId: run.id,
  content: '# runtime-slice-04\n\nverification artifact\n',
});

runtime.finishRunWithReviewPending({ runId: run.id });

const reviewItem = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
  kind: 'review',
})[0];

runtime.resolveReview({
  taskId: task.id,
  itemId: reviewItem.id,
  action: REVIEW_STATUS.PASSED,
  note: 'Review passed with verification evidence.',
  verificationArtifactIds: [artifact.id],
});

const blockedDecision = runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Decision required: unblock runtime-slice-04',
  prompt: 'Resolve the blocking decision before the task is done.',
  blocksTask: true,
});

assert.throws(
  () => runtime.transitionTaskLifecycle({ taskId: task.id, to: TASK_LIFECYCLE.DONE }),
  /gates remain active: blocked, waitingDecision/,
);

runtime.resolveDecisionInboxItem({
  itemId: blockedDecision.id,
  action: 'resolved',
  note: 'Decision resolved.',
});

assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: task.id,
      action: COMMIT_ACTION.COMMIT_INTENT,
    }),
  /approved commit approval record/,
);
assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: task.id,
      action: COMMIT_ACTION.COMMIT_READY,
    }),
  /approved commit approval record/,
);

const commitIntentApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  title: 'Approval required: commit-intent',
  prompt: 'Commit-intent must remain blocked until approval is recorded.',
});

assert.throws(
  () => runtime.transitionTaskLifecycle({ taskId: task.id, to: TASK_LIFECYCLE.DONE }),
  /gates remain active: waitingApproval/,
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
assert.throws(
  () =>
    runtime.ensureCommitActionAllowed({
      taskId: task.id,
      action: COMMIT_ACTION.COMMIT_READY,
    }),
  /approved commit approval record/,
);

const commitReadyApproval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_READY,
  title: 'Approval required: commit-ready',
  prompt: 'Commit-ready must remain blocked until approval is recorded.',
});

assert.throws(
  () => runtime.transitionTaskLifecycle({ taskId: task.id, to: TASK_LIFECYCLE.DONE }),
  /gates remain active: waitingApproval/,
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

const doneTask = runtime.transitionTaskLifecycle({
  taskId: task.id,
  to: TASK_LIFECYCLE.DONE,
});
const snapshot = runtime.getSnapshot();

assert.equal(doneTask.lifecycleState, TASK_LIFECYCLE.DONE);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.equal(Object.keys(snapshot.projects).length, 1);
assert.equal(Object.keys(snapshot.tasks).length, 1);
assert.equal(Object.keys(snapshot.runs).length, 1);
assert.equal(Object.keys(snapshot.artifacts).length, 1);
assert.equal(Object.keys(snapshot.approvals).length, 2);
assert.equal(
  runtime.listApprovals({
    taskId: task.id,
    status: APPROVAL_STATUS.APPROVED,
  }).length,
  2,
);

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
      },
      task: {
        id: doneTask.id,
        lifecycleState: doneTask.lifecycleState,
        flags: runtime.getTask(task.id).flags,
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
