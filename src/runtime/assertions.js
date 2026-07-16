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

module.exports = {
  assertExecutionPlan,
  assertHandoffPacket,
  assertRun,
  assertWorkOrder,
  assertWorkflowCheckpoint,
};
