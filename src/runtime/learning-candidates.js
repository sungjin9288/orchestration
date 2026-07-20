'use strict';

const crypto = require('crypto');

const LEARNING_CANDIDATE_STATUS = Object.freeze({
  REDACTION: 'review-required',
  REVIEWER: 'review-required',
  PROMOTION: 'proposed',
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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function immutableLearningCandidatePayload(input) {
  return {
    id: input.id,
    projectId: input.projectId,
    sourceMissionId: input.sourceMissionId,
    sourceMissionCloseOutId: input.sourceMissionCloseOutId,
    sourceExecutionPlanId: input.sourceExecutionPlanId,
    sourceDeliveryPackageId: input.sourceDeliveryPackageId,
    sourceDeliveryPackageAcceptanceId: input.sourceDeliveryPackageAcceptanceId,
    sourceTerminalCheckpointId: input.sourceTerminalCheckpointId,
    sourceDeliveryPreviewId: input.sourceDeliveryPreviewId,
    sourceDigest: input.sourceDigest,
    sourcePackageDigest: input.sourcePackageDigest,
    sourcePackageAcceptanceDigest: input.sourcePackageAcceptanceDigest,
    sourceTerminalCheckpointDigest: input.sourceTerminalCheckpointDigest,
    sourceMissionCloseOutDigest: input.sourceMissionCloseOutDigest,
    sourceEvidenceRefs: input.sourceEvidenceRefs,
    lesson: input.lesson,
    applicability: input.applicability,
    negativeEvidence: input.negativeEvidence,
    redactionMode: input.redactionMode,
    redactionStatus: input.redactionStatus,
    expiry: input.expiry,
    reviewerStatus: input.reviewerStatus,
    promotionStatus: input.promotionStatus,
    authoritySummary: input.authoritySummary,
    previewId: input.previewId,
    candidateDigest: input.candidateDigest,
    persisted: input.persisted,
    createdAt: input.createdAt,
  };
}

function computeLearningCandidateRecordDigest(input) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(immutableLearningCandidatePayload(input))))
    .digest('hex');
}

function createLearningCandidate(input) {
  const { preview, source } = input;
  const learningCandidate = {
    id: input.id,
    projectId: source.projectId,
    sourceMissionId: source.missionId,
    sourceMissionCloseOutId: source.missionCloseOutId,
    sourceExecutionPlanId: source.executionPlanId,
    sourceDeliveryPackageId: source.deliveryPackageId,
    sourceDeliveryPackageAcceptanceId: source.deliveryPackageAcceptanceId,
    sourceTerminalCheckpointId: source.sourceTerminalCheckpointId,
    sourceDeliveryPreviewId: source.sourceDeliveryPreviewId,
    sourceDigest: source.sourceDigest,
    sourcePackageDigest: source.sourcePackageDigest,
    sourcePackageAcceptanceDigest: source.sourcePackageAcceptanceDigest,
    sourceTerminalCheckpointDigest: source.sourceTerminalCheckpointDigest,
    sourceMissionCloseOutDigest: source.sourceMissionCloseOutDigest,
    sourceEvidenceRefs: [...preview.sourceEvidenceRefs],
    lesson: preview.lesson,
    applicability: clone(preview.applicability),
    negativeEvidence: clone(preview.negativeEvidence),
    redactionMode: preview.redactionMode,
    redactionStatus: LEARNING_CANDIDATE_STATUS.REDACTION,
    expiry: clone(preview.expiry),
    reviewerStatus: LEARNING_CANDIDATE_STATUS.REVIEWER,
    promotionStatus: LEARNING_CANDIDATE_STATUS.PROMOTION,
    authoritySummary: clone(preview.authoritySummary),
    previewId: preview.previewId,
    candidateDigest: preview.candidateDigest,
    persisted: true,
    createdAt: input.createdAt,
  };
  learningCandidate.recordDigest = computeLearningCandidateRecordDigest(learningCandidate);
  return learningCandidate;
}

module.exports = {
  LEARNING_CANDIDATE_STATUS,
  computeLearningCandidateRecordDigest,
  createLearningCandidate,
  immutableLearningCandidatePayload,
};
