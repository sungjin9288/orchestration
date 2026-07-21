'use strict';

function assertRun(runId, state) {
  const run = state.runs[runId];

  if (!run) {
    throw new Error(`Run not found: ${runId}`);
  }

  return run;
}

function assertExecutionPlan(executionPlanId, state) {
  const executionPlan = state.executionPlans[executionPlanId];
  if (!executionPlan) throw new Error(`ExecutionPlan not found: ${executionPlanId}`);
  return executionPlan;
}

function assertWorkOrder(workOrderId, state) {
  const workOrder = state.workOrders[workOrderId];
  if (!workOrder) throw new Error(`WorkOrder not found: ${workOrderId}`);
  return workOrder;
}

function assertHandoffPacket(handoffPacketId, state) {
  const handoffPacket = state.handoffPackets[handoffPacketId];
  if (!handoffPacket) throw new Error(`HandoffPacket not found: ${handoffPacketId}`);
  return handoffPacket;
}

function assertWorkflowCheckpoint(workflowCheckpointId, state) {
  const workflowCheckpoint = state.workflowCheckpoints[workflowCheckpointId];
  if (!workflowCheckpoint) {
    throw new Error(`WorkflowCheckpoint not found: ${workflowCheckpointId}`);
  }
  return workflowCheckpoint;
}

function assertDeliveryPackage(deliveryPackageId, state) {
  const deliveryPackage = state.deliveryPackages[deliveryPackageId];
  if (!deliveryPackage) {
    throw new Error(`DeliveryPackage not found: ${deliveryPackageId}`);
  }
  return deliveryPackage;
}

function assertDeliveryPackageAcceptance(deliveryPackageAcceptanceId, state) {
  const acceptance = state.deliveryPackageAcceptances[deliveryPackageAcceptanceId];
  if (!acceptance) {
    throw new Error(`DeliveryPackageAcceptance not found: ${deliveryPackageAcceptanceId}`);
  }
  return acceptance;
}

function assertMissionCloseOut(missionCloseOutId, state) {
  const missionCloseOut = state.missionCloseOuts[missionCloseOutId];
  if (!missionCloseOut) {
    throw new Error(`MissionCloseOut not found: ${missionCloseOutId}`);
  }
  return missionCloseOut;
}

function assertLearningCandidate(learningCandidateId, state) {
  const learningCandidate = state.learningCandidates[learningCandidateId];
  if (!learningCandidate) {
    throw new Error(`LearningCandidate not found: ${learningCandidateId}`);
  }
  return learningCandidate;
}

function assertLearningCandidateReview(learningCandidateReviewId, state) {
  const review = state.learningCandidateReviews[learningCandidateReviewId];
  if (!review) {
    throw new Error(`LearningCandidateReview not found: ${learningCandidateReviewId}`);
  }
  return review;
}

function assertMemoryItem(memoryItemId, state) {
  const memoryItem = state.memoryItems[memoryItemId];
  if (!memoryItem) {
    throw new Error(`MemoryItem not found: ${memoryItemId}`);
  }
  return memoryItem;
}

module.exports = {
  assertDeliveryPackage,
  assertDeliveryPackageAcceptance,
  assertExecutionPlan,
  assertHandoffPacket,
  assertLearningCandidate,
  assertLearningCandidateReview,
  assertMemoryItem,
  assertMissionCloseOut,
  assertRun,
  assertWorkOrder,
  assertWorkflowCheckpoint,
};
