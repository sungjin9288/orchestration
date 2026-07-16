'use strict';

const crypto = require('crypto');

const { DELIVERY_PACKAGE_ACCEPTANCE_DECISION } = require('./contracts');

const ACCEPTANCE_AUTHORITY_SUMMARY = Object.freeze({
  packageAcceptanceEvidenceAllowed: true,
  packageRejectionAllowed: false,
  packageChangesRequestedAllowed: false,
  missionDoneAllowed: false,
  taskCloseOutAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  memoryPersistenceAllowed: false,
  learningAllowed: false,
  schedulingAllowed: false,
  providerExpansionAllowed: false,
  profilePolicyMutationAllowed: false,
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

function immutableDeliveryPackageAcceptancePayload(input) {
  return {
    projectId: input.projectId,
    missionId: input.missionId,
    executionPlanId: input.executionPlanId,
    deliveryPackageId: input.deliveryPackageId,
    previewId: input.previewId,
    sourceDigest: input.sourceDigest,
    packageDigest: input.packageDigest,
    terminalCheckpointId: input.terminalCheckpointId,
    terminalCheckpointDigest: input.terminalCheckpointDigest,
    decision: input.decision,
    authoritySummary: input.authoritySummary,
  };
}

function computeDeliveryPackageAcceptanceDigest(input) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(immutableDeliveryPackageAcceptancePayload(input))))
    .digest('hex');
}

function createDeliveryPackageAcceptance(input) {
  const deliveryPackage = input.deliveryPackage;
  const acceptance = {
    id: input.id,
    projectId: deliveryPackage.projectId,
    missionId: deliveryPackage.missionId,
    executionPlanId: deliveryPackage.executionPlanId,
    deliveryPackageId: deliveryPackage.id,
    previewId: deliveryPackage.previewId,
    sourceDigest: deliveryPackage.sourceDigest,
    packageDigest: deliveryPackage.packageDigest,
    terminalCheckpointId: deliveryPackage.terminalCheckpointId,
    terminalCheckpointDigest: deliveryPackage.terminalCheckpointDigest,
    decision: DELIVERY_PACKAGE_ACCEPTANCE_DECISION.ACCEPTED,
    authoritySummary: { ...ACCEPTANCE_AUTHORITY_SUMMARY },
    createdAt: input.createdAt,
  };
  acceptance.acceptanceDigest = computeDeliveryPackageAcceptanceDigest(acceptance);
  return acceptance;
}

module.exports = {
  ACCEPTANCE_AUTHORITY_SUMMARY,
  computeDeliveryPackageAcceptanceDigest,
  createDeliveryPackageAcceptance,
  immutableDeliveryPackageAcceptancePayload,
};
