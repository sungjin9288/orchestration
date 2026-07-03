'use strict';

const {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  DECISION_INBOX_KIND,
  DECISION_INBOX_STATUS,
} = require('./contracts');
const { normalizeOptionalString } = require('./normalizers');

function getApprovalMetadata(approval) {
  return approval?.metadata && typeof approval.metadata === 'object' ? approval.metadata : {};
}

function isBuilderLiveMutationApprovalConsumed(approval) {
  if (!approval || approval.allowedNextAction !== BUILDER_ACTION.LIVE_MUTATION) {
    return false;
  }

  const metadata = getApprovalMetadata(approval);

  return Boolean(
    normalizeOptionalString(metadata.consumedAt) && normalizeOptionalString(metadata.consumedByRunId),
  );
}

function listTaskApprovals(taskId, state) {
  return Object.values(state.approvals).filter((approval) => approval.taskId === taskId);
}

function listPendingBlockingDecisionItems(taskId, state) {
  return Object.values(state.decisionInboxItems).filter(
    (item) =>
      item.taskId === taskId &&
      item.status === DECISION_INBOX_STATUS.PENDING &&
      item.kind === DECISION_INBOX_KIND.DECISION &&
      item.blocksTask,
  );
}

function computeTaskGateState(task, state) {
  const pendingDecisionItems = Object.values(state.decisionInboxItems).filter(
    (item) =>
      item.taskId === task.id &&
      item.kind === DECISION_INBOX_KIND.DECISION &&
      item.status === DECISION_INBOX_STATUS.PENDING,
  );
  const taskApprovals = listTaskApprovals(task.id, state);
  const pendingApprovals = taskApprovals.filter(
    (approval) => approval.status === APPROVAL_STATUS.PENDING,
  );

  return {
    pendingDecisionItems,
    pendingApprovals,
    taskApprovals,
    flags: {
      blocked: pendingDecisionItems.some((item) => item.blocksTask),
      waitingDecision: pendingDecisionItems.length > 0,
      waitingApproval: pendingApprovals.length > 0,
    },
  };
}

function applyTaskGateFlags(task, gateState) {
  task.flags.blocked = gateState.flags.blocked;
  task.flags.waitingDecision = gateState.flags.waitingDecision;
  task.flags.waitingApproval = gateState.flags.waitingApproval;
}

function recalculateTaskFlags(task, state) {
  applyTaskGateFlags(task, computeTaskGateState(task, state));
}

function listActiveTaskGates(gateState) {
  const activeGates = [];

  if (gateState.flags.blocked) {
    activeGates.push('blocked');
  }

  if (gateState.flags.waitingDecision) {
    activeGates.push('waitingDecision');
  }

  if (gateState.flags.waitingApproval) {
    activeGates.push('waitingApproval');
  }

  return activeGates;
}

function buildLatestApprovalDisplayStatus(approvalEvaluation) {
  if (approvalEvaluation.stale) {
    return 'stale';
  }

  if (
    approvalEvaluation.action === BUILDER_ACTION.LIVE_MUTATION &&
    isBuilderLiveMutationApprovalConsumed(approvalEvaluation.latestApproval)
  ) {
    return 'consumed';
  }

  return approvalEvaluation.latestApproval?.status || 'none';
}

module.exports = {
  applyTaskGateFlags,
  buildLatestApprovalDisplayStatus,
  computeTaskGateState,
  getApprovalMetadata,
  isBuilderLiveMutationApprovalConsumed,
  listActiveTaskGates,
  listPendingBlockingDecisionItems,
  listTaskApprovals,
  recalculateTaskFlags,
};
