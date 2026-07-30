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

function assertWorkOrderAttempt(workOrderAttemptId, state) {
  const workOrderAttempt = state.workOrderAttempts[workOrderAttemptId];
  if (!workOrderAttempt) {
    throw new Error(`WorkOrderAttempt not found: ${workOrderAttemptId}`);
  }
  return workOrderAttempt;
}

function assertSpecialistBatch(specialistBatchId, state) {
  const specialistBatch = state.specialistBatches[specialistBatchId];
  if (!specialistBatch) {
    throw new Error(`SpecialistBatch not found: ${specialistBatchId}`);
  }
  return specialistBatch;
}

function assertSpecialistCellAttempt(specialistCellAttemptId, state) {
  const specialistCellAttempt = state.specialistCellAttempts[specialistCellAttemptId];
  if (!specialistCellAttempt) {
    throw new Error(`SpecialistCellAttempt not found: ${specialistCellAttemptId}`);
  }
  return specialistCellAttempt;
}

function assertSpecialistCellRetry(specialistCellRetryId, state) {
  const specialistCellRetry = state.specialistCellRetries[specialistCellRetryId];
  if (!specialistCellRetry) {
    throw new Error(`SpecialistCellRetry not found: ${specialistCellRetryId}`);
  }
  return specialistCellRetry;
}

function assertReworkPlan(reworkPlanId, state) {
  const reworkPlan = state.reworkPlans[reworkPlanId];
  if (!reworkPlan) {
    throw new Error(`ReworkPlan not found: ${reworkPlanId}`);
  }
  return reworkPlan;
}

function assertReworkPlanAcceptance(reworkPlanAcceptanceId, state) {
  const acceptance = state.reworkPlanAcceptances[reworkPlanAcceptanceId];
  if (!acceptance) {
    throw new Error(`ReworkPlanAcceptance not found: ${reworkPlanAcceptanceId}`);
  }
  return acceptance;
}

function assertBuilderReworkDispatch(builderReworkDispatchId, state) {
  const dispatch = state.builderReworkDispatches[builderReworkDispatchId];
  if (!dispatch) {
    throw new Error(`BuilderReworkDispatch not found: ${builderReworkDispatchId}`);
  }
  return dispatch;
}

function assertReworkDeliveryPackage(reworkDeliveryPackageId, state) {
  const reworkDeliveryPackage =
    state.reworkDeliveryPackages[reworkDeliveryPackageId];
  if (!reworkDeliveryPackage) {
    throw new Error(
      `ReworkDeliveryPackage not found: ${reworkDeliveryPackageId}`,
    );
  }
  return reworkDeliveryPackage;
}

function assertBuilderReworkMutationApproval(approvalId, state) {
  const approval = state.approvals[approvalId];
  if (!approval) {
    throw new Error(`Builder rework mutation Approval not found: ${approvalId}`);
  }
  if (
    approval.allowedNextAction !== 'builder-rework-live-mutation' ||
    approval.scope !== 'builder-rework'
  ) {
    throw new Error(
      `Approval ${approvalId} is not a Builder rework mutation Approval`,
    );
  }
  return approval;
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

function assertMemoryRecall(memoryRecallId, state) {
  const memoryRecall = state.memoryRecalls[memoryRecallId];
  if (!memoryRecall) {
    throw new Error(`MemoryRecall not found: ${memoryRecallId}`);
  }
  return memoryRecall;
}

function assertAcceptanceCriterion(acceptanceCriterionId, state) {
  const criterion = state.acceptanceCriteria[acceptanceCriterionId];
  if (!criterion) {
    throw new Error(`AcceptanceCriterion not found: ${acceptanceCriterionId}`);
  }
  return criterion;
}

function assertVerificationProof(verificationProofId, state) {
  const proof = state.verificationProofs[verificationProofId];
  if (!proof) {
    throw new Error(`VerificationProof not found: ${verificationProofId}`);
  }
  return proof;
}

function assertStaffingPlan(staffingPlanId, state) {
  const staffingPlan = state.staffingPlans[staffingPlanId];
  if (!staffingPlan) {
    throw new Error(`StaffingPlan not found: ${staffingPlanId}`);
  }
  return staffingPlan;
}

function assertStaffingEntry(staffingEntryId, state) {
  const staffingEntry = state.staffingEntries[staffingEntryId];
  if (!staffingEntry) {
    throw new Error(`StaffingEntry not found: ${staffingEntryId}`);
  }
  return staffingEntry;
}

module.exports = {
  assertAcceptanceCriterion,
  assertBuilderReworkDispatch,
  assertBuilderReworkMutationApproval,
  assertDeliveryPackage,
  assertDeliveryPackageAcceptance,
  assertExecutionPlan,
  assertHandoffPacket,
  assertLearningCandidate,
  assertLearningCandidateReview,
  assertMemoryItem,
  assertMemoryRecall,
  assertMissionCloseOut,
  assertRun,
  assertReworkDeliveryPackage,
  assertReworkPlan,
  assertReworkPlanAcceptance,
  assertSpecialistBatch,
  assertSpecialistCellAttempt,
  assertSpecialistCellRetry,
  assertStaffingEntry,
  assertStaffingPlan,
  assertWorkOrder,
  assertWorkOrderAttempt,
  assertWorkflowCheckpoint,
  assertVerificationProof,
};
