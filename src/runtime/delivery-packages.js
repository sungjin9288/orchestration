'use strict';

const crypto = require('crypto');

const { DELIVERY_PACKAGE_STATUS } = require('./contracts');

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function immutableDeliveryPackagePayload(input) {
  return {
    projectId: input.projectId,
    missionId: input.missionId,
    executionPlanId: input.executionPlanId,
    terminalCheckpointId: input.terminalCheckpointId,
    terminalCheckpointDigest: input.terminalCheckpointDigest,
    previewId: input.previewId || input.id,
    sourceDigest: input.sourceDigest,
    deliveredArtifactRefs: input.deliveredArtifactRefs,
    workOrderResults: input.workOrderResults,
    reviewerEvidenceRef: input.reviewerEvidenceRef,
    qaEvidenceRefs: input.qaEvidenceRefs,
    verificationSummary: input.verificationSummary,
    acceptedRisks: input.acceptedRisks,
    unresolvedItems: input.unresolvedItems,
    authoritySummary: input.authoritySummary,
  };
}

function computeDeliveryPackageDigest(input) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(immutableDeliveryPackagePayload(input))))
    .digest('hex');
}

function createDeliveryPackage(input) {
  const preview = input.preview;
  return {
    id: input.id,
    projectId: preview.projectId,
    missionId: preview.missionId,
    executionPlanId: preview.executionPlanId,
    terminalCheckpointId: preview.terminalCheckpointId,
    terminalCheckpointDigest: preview.terminalCheckpointDigest,
    previewId: preview.id,
    sourceDigest: preview.sourceDigest,
    packageDigest: preview.packageDigest,
    status: DELIVERY_PACKAGE_STATUS.REVIEW_REQUIRED,
    deliveredArtifactRefs: [...preview.deliveredArtifactRefs],
    workOrderResults: clone(preview.workOrderResults),
    reviewerEvidenceRef: preview.reviewerEvidenceRef,
    qaEvidenceRefs: [...preview.qaEvidenceRefs],
    verificationSummary: clone(preview.verificationSummary),
    acceptedRisks: [...preview.acceptedRisks],
    unresolvedItems: [...preview.unresolvedItems],
    authoritySummary: clone(preview.authoritySummary),
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
}

module.exports = {
  computeDeliveryPackageDigest,
  createDeliveryPackage,
  immutableDeliveryPackagePayload,
};
