import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, COMMIT_ACTION } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'ops-slice-02');
const runtime = createRuntimeService({ runtimeRoot });

runtime.resetRuntime();

const project = runtime.createProject({
  name: 'orchestration',
  projectPath: process.cwd(),
});

const task = runtime.createTask({
  projectId: project.id,
  title: 'Ops slice 02 taxonomy smoke',
  intent: 'Lock Decision Inbox taxonomy, sourceType matrix, and flag semantics.',
});

const reviewRun = runtime.startPlaceholderRun({ taskId: task.id });
runtime.finishRunWithReviewPending({ runId: reviewRun.id });

const pendingReviewItem = runtime.listDecisionInboxItems({
  taskId: task.id,
  kind: 'review',
  status: 'pending',
})[0];

assert.equal(pendingReviewItem.kind, 'review');
assert.equal(pendingReviewItem.sourceType, 'review');
assert.equal(pendingReviewItem.blocksTask, false);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});

const clarificationItem = runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Clarification needed',
  prompt: 'Capture a non-blocking unblock/clarification item.',
  sourceType: 'decision',
  blocksTask: false,
});

assert.equal(clarificationItem.kind, 'decision');
assert.equal(clarificationItem.sourceType, 'decision');
assert.equal(clarificationItem.blocksTask, false);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: true,
});

runtime.resolveDecisionInboxItem({
  itemId: clarificationItem.id,
  action: 'resolved',
  note: 'Clarification captured.',
});

const reviewFollowUpItem = runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Review follow-up',
  prompt: 'Normalize review follow-up to decision+review.',
  sourceType: 'review',
  sourceId: pendingReviewItem.id,
  blocksTask: false,
});

assert.equal(reviewFollowUpItem.kind, 'decision');
assert.equal(reviewFollowUpItem.sourceType, 'review');
assert.equal(reviewFollowUpItem.blocksTask, false);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: true,
});

runtime.resolveDecisionInboxItem({
  itemId: reviewFollowUpItem.id,
  action: 'resolved',
  note: 'Review follow-up handled.',
});

const blockingReviewFollowUp = runtime.createDecisionInboxItem({
  taskId: task.id,
  title: 'Blocking review follow-up',
  prompt: 'Normalize blocking review follow-up to decision+review.',
  sourceType: 'review',
  sourceId: pendingReviewItem.id,
  blocksTask: true,
});

assert.equal(blockingReviewFollowUp.kind, 'decision');
assert.equal(blockingReviewFollowUp.sourceType, 'review');
assert.equal(blockingReviewFollowUp.blocksTask, true);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: true,
  waitingApproval: false,
  waitingDecision: true,
});

runtime.resolveDecisionInboxItem({
  itemId: blockingReviewFollowUp.id,
  action: 'resolved',
  note: 'Blocking review follow-up handled.',
});

const approval = runtime.createApprovalPlaceholder({
  taskId: task.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
  title: 'Approval required: commit-intent',
  prompt: 'Keep approvals mapped to approval sourceType only.',
});
const approvalInboxItem = runtime.getDecisionInboxItem(approval.inboxItemId);

assert.equal(approvalInboxItem.kind, 'approval');
assert.equal(approvalInboxItem.sourceType, 'approval');
assert.equal(approvalInboxItem.blocksTask, false);
assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: true,
  waitingDecision: false,
});

runtime.resolveDecisionInboxItem({
  itemId: approvalInboxItem.id,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approval recorded.',
});

assert.deepEqual(runtime.getTask(task.id).flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});

assert.throws(
  () =>
    runtime.createDecisionInboxItem({
      taskId: task.id,
      title: 'Invalid approval source type',
      prompt: 'Decision items must reject sourceType=approval.',
      sourceType: 'approval',
      blocksTask: false,
    }),
  /not allowed for sourceType approval/i,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      task: {
        id: task.id,
        reviewItemId: pendingReviewItem.id,
        clarificationItemId: clarificationItem.id,
        reviewFollowUpItemId: reviewFollowUpItem.id,
        blockingReviewFollowUpItemId: blockingReviewFollowUp.id,
        approvalId: approval.id,
        approvalInboxItemId: approvalInboxItem.id,
      },
    },
    null,
    2,
  ),
);
