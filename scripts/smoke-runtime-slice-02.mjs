import assert from 'node:assert/strict';
import path from 'node:path';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const runtime = createRuntimeService({
  runtimeRoot: path.join(process.cwd(), 'var', 'runtime-slice-02'),
});

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Runtime slice 02 smoke',
  intent: 'Verify decision inbox items, approval placeholder records, task flags, and review pending visibility.',
});

const run = runtime.startPlaceholderRun({ taskId: task.id });

runtime.appendLog({
  runId: run.id,
  message: 'runtime slice 02 placeholder run started',
});

const artifact = runtime.recordArtifact({
  taskId: task.id,
  runId: run.id,
  content: '# runtime-slice-02\n\nplaceholder artifact\n',
});

runtime.finishRunWithReviewPending({ runId: run.id });

const reviewTask = runtime.getTask(task.id);
const reviewItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
  kind: 'review',
});

assert.equal(reviewTask.lifecycleState, 'Review');
assert.equal(reviewTask.review.status, 'pending');
assert.equal(reviewItems.length, 1);
assert.equal(reviewTask.review.inboxItemId, reviewItems[0].id);

const decisionItem = runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Decision required: runtime-slice-02',
  prompt: 'Confirm the minimal state extension for decision inbox and approval placeholder.',
  blocksTask: true,
});

const approval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  title: 'Approval required: commit',
  prompt: 'Commit must remain blocked until approval is recorded.',
});

const taskWithGates = runtime.getTask(task.id);
const pendingItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
});
const decisionRead = runtime.getDecisionInboxItem(decisionItem.id);
const approvalRead = runtime.getDecisionInboxItem(approval.inboxItemId);

assert.deepEqual(taskWithGates.flags, {
  blocked: true,
  waitingApproval: true,
  waitingDecision: true,
});
assert.equal(pendingItems.length, 3);
assert.deepEqual(
  pendingItems.map((item) => item.kind),
  ['review', 'decision', 'approval'],
);
assert.equal(decisionRead.taskId, task.id);
assert.equal(decisionRead.sourceType, 'decision');
assert.equal(approvalRead.taskId, task.id);
assert.equal(approvalRead.sourceId, approval.id);

runtime.resolveDecisionInboxItem({
  itemId: decisionItem.id,
  action: 'resolved',
  note: 'Minimal runtime-slice-02 model accepted.',
});

const taskAfterDecision = runtime.getTask(task.id);

assert.deepEqual(taskAfterDecision.flags, {
  blocked: false,
  waitingApproval: true,
  waitingDecision: false,
});

runtime.resolveDecisionInboxItem({
  itemId: approval.inboxItemId,
  action: 'approved',
  note: 'Approval placeholder cleared.',
});

const taskAfterApproval = runtime.getTask(task.id);
const finalPendingItems = runtime.listDecisionInboxItems({
  taskId: task.id,
  status: 'pending',
});
const snapshot = runtime.getSnapshot();

assert.deepEqual(taskAfterApproval.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.equal(finalPendingItems.length, 1);
assert.equal(finalPendingItems[0].kind, 'review');
assert.equal(Object.keys(snapshot.projects).length, 1);
assert.equal(Object.keys(snapshot.tasks).length, 1);
assert.equal(Object.keys(snapshot.runs).length, 1);
assert.equal(Object.keys(snapshot.artifacts).length, 1);
assert.equal(Object.keys(snapshot.approvals).length, 1);
assert.equal(Object.keys(snapshot.decisionInboxItems).length, 3);
assert.equal(snapshot.approvals[approval.id].status, 'approved');
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
        id: taskAfterApproval.id,
        lifecycleState: taskAfterApproval.lifecycleState,
        reviewStatus: taskAfterApproval.review.status,
        flags: taskAfterApproval.flags,
      },
      pendingKinds: finalPendingItems.map((item) => item.kind),
    },
    null,
    2,
  ),
);
