'use strict';

const crypto = require('crypto');

const { MISSION_CLOSE_OUT_DECISION } = require('./contracts');

const TASK_LIFECYCLE_TRANSITION = 'Review -> Done';
const MISSION_STATUS_TRANSITION = 'executing -> completed';

const MISSION_CLOSE_OUT_AUTHORITY_SUMMARY = Object.freeze({
  missionCloseOutAllowed: true,
  linkedControlTaskDoneAllowed: true,
  missionReopenAllowed: false,
  taskReopenAllowed: false,
  closeOutCancellationAllowed: false,
  packageMutationAllowed: false,
  standaloneCloseOutAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  learningAllowed: false,
  memoryPersistenceAllowed: false,
  nextMissionCreationAllowed: false,
  retryReworkAllowed: false,
  schedulingAllowed: false,
  providerExpansionAllowed: false,
  profilePolicyMutationAllowed: false,
  approvalBypassAllowed: false,
  externalConnectorsAllowed: false,
});

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function immutableMissionCloseOutPayload(input) {
  return {
    projectId: input.projectId,
    missionId: input.missionId,
    linkedTaskId: input.linkedTaskId,
    executionPlanId: input.executionPlanId,
    deliveryPackageId: input.deliveryPackageId,
    deliveryPackageAcceptanceId: input.deliveryPackageAcceptanceId,
    previewId: input.previewId,
    sourceDigest: input.sourceDigest,
    packageDigest: input.packageDigest,
    acceptanceDigest: input.acceptanceDigest,
    terminalCheckpointId: input.terminalCheckpointId,
    terminalCheckpointDigest: input.terminalCheckpointDigest,
    decision: input.decision,
    taskLifecycleTransition: input.taskLifecycleTransition,
    missionStatusTransition: input.missionStatusTransition,
    authoritySummary: input.authoritySummary,
  };
}

function computeMissionCloseOutDigest(input) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(immutableMissionCloseOutPayload(input))))
    .digest('hex');
}

function createMissionCloseOut(input) {
  const { mission, linkedTask, executionPlan, deliveryPackage, acceptance } = input;
  const missionCloseOut = {
    id: input.id,
    projectId: mission.projectId,
    missionId: mission.id,
    linkedTaskId: linkedTask.id,
    executionPlanId: executionPlan.id,
    deliveryPackageId: deliveryPackage.id,
    deliveryPackageAcceptanceId: acceptance.id,
    previewId: deliveryPackage.previewId,
    sourceDigest: deliveryPackage.sourceDigest,
    packageDigest: deliveryPackage.packageDigest,
    acceptanceDigest: acceptance.acceptanceDigest,
    terminalCheckpointId: deliveryPackage.terminalCheckpointId,
    terminalCheckpointDigest: deliveryPackage.terminalCheckpointDigest,
    decision: MISSION_CLOSE_OUT_DECISION.CLOSED_OUT,
    taskLifecycleTransition: TASK_LIFECYCLE_TRANSITION,
    missionStatusTransition: MISSION_STATUS_TRANSITION,
    authoritySummary: { ...MISSION_CLOSE_OUT_AUTHORITY_SUMMARY },
    createdAt: input.createdAt,
  };
  missionCloseOut.closeOutDigest = computeMissionCloseOutDigest(missionCloseOut);
  return missionCloseOut;
}

module.exports = {
  MISSION_CLOSE_OUT_AUTHORITY_SUMMARY,
  MISSION_STATUS_TRANSITION,
  TASK_LIFECYCLE_TRANSITION,
  computeMissionCloseOutDigest,
  createMissionCloseOut,
  immutableMissionCloseOutPayload,
};
