'use strict';

const {
  normalizeRequiredString,
  normalizeRequiredStringArray,
  normalizeIsoTimestamp,
} = require('./normalizers');

const PROPOSAL_DRAFT_SCHEMA_VERSION = 'orchestration.proposal-draft/v1';
const PROPOSAL_DRAFT_REVIEW_SCHEMA_VERSION = 'orchestration.proposal-draft-human-review/v1';
const PROPOSAL_DRAFT_REVIEW_STATUS = 'pending-human-review';

function normalizeProposalDraftForReview(input) {
  const draft = input && typeof input === 'object' ? input : null;

  if (!draft) {
    throw new Error('draft is required');
  }

  if (draft.schemaVersion !== PROPOSAL_DRAFT_SCHEMA_VERSION) {
    throw new Error('draft.schemaVersion must be orchestration.proposal-draft/v1');
  }

  if (draft.draftStatus !== 'draft-only') {
    throw new Error('draft.draftStatus must be draft-only');
  }

  if (draft.applyAllowed !== false) {
    throw new Error('draft.applyAllowed must remain false');
  }

  for (const field of ['recordId', 'applicationStatus', 'queueMutation']) {
    if (Object.hasOwn(draft, field)) {
      throw new Error(`draft.${field} must be absent`);
    }
  }

  const evidenceFreshness = draft.evidenceFreshness && typeof draft.evidenceFreshness === 'object'
    ? draft.evidenceFreshness
    : null;

  if (!evidenceFreshness) {
    throw new Error('draft.evidenceFreshness is required');
  }

  const verifiedAt = normalizeIsoTimestamp(
    evidenceFreshness.verifiedAt,
    'draft.evidenceFreshness.verifiedAt',
  );
  const expiresAt = normalizeIsoTimestamp(
    evidenceFreshness.expiresAt,
    'draft.evidenceFreshness.expiresAt',
  );
  const evaluatedAt = normalizeIsoTimestamp(
    evidenceFreshness.evaluatedAt,
    'draft.evidenceFreshness.evaluatedAt',
  );

  if (Date.parse(verifiedAt) > Date.parse(expiresAt)) {
    throw new Error('draft.evidenceFreshness.verifiedAt must not be after expiresAt');
  }

  if (Date.parse(expiresAt) <= Date.parse(evaluatedAt)) {
    throw new Error('draft.evidenceFreshness must remain fresh for human review');
  }

  return {
    candidateId: normalizeRequiredString(draft.candidateId, 'draft.candidateId'),
    sourceFindingId: normalizeRequiredString(draft.sourceFindingId, 'draft.sourceFindingId'),
    evidenceRefs: normalizeRequiredStringArray(draft.evidenceRefs, 'draft.evidenceRefs'),
    negativeEvidenceRefs: normalizeRequiredStringArray(
      draft.negativeEvidenceRefs,
      'draft.negativeEvidenceRefs',
    ),
    routeRefs: normalizeRequiredStringArray(draft.routeRefs, 'draft.routeRefs'),
    sourceRefs: normalizeRequiredStringArray(draft.sourceRefs, 'draft.sourceRefs'),
    verificationRefs: normalizeRequiredStringArray(
      draft.verificationRefs,
      'draft.verificationRefs',
    ),
    blockedActions: normalizeRequiredStringArray(draft.blockedActions, 'draft.blockedActions'),
    riskClass: normalizeRequiredString(draft.riskClass, 'draft.riskClass'),
    reviewQuestion: normalizeRequiredString(draft.reviewQuestion, 'draft.reviewQuestion'),
    evidenceFreshness: { verifiedAt, expiresAt, evaluatedAt },
    generationApprovalRef: normalizeRequiredString(
      draft.generationApprovalRef,
      'draft.generationApprovalRef',
    ),
    nonApprovalStatement: normalizeRequiredString(
      draft.nonApprovalStatement,
      'draft.nonApprovalStatement',
    ),
  };
}

function createProposalDraftHumanReviewPacket(input) {
  const draft = normalizeProposalDraftForReview(input);

  return {
    schemaVersion: PROPOSAL_DRAFT_REVIEW_SCHEMA_VERSION,
    reviewStatus: PROPOSAL_DRAFT_REVIEW_STATUS,
    humanReviewRequired: true,
    candidateId: draft.candidateId,
    sourceFindingId: draft.sourceFindingId,
    reviewQuestion: draft.reviewQuestion,
    riskClass: draft.riskClass,
    evidence: {
      positiveRefs: draft.evidenceRefs,
      negativeRefs: draft.negativeEvidenceRefs,
      routeRefs: draft.routeRefs,
      sourceRefs: draft.sourceRefs,
      verificationRefs: draft.verificationRefs,
      freshness: draft.evidenceFreshness,
    },
    blockedActions: draft.blockedActions,
    generationApprovalRef: draft.generationApprovalRef,
    reviewChecklist: [
      'Confirm the source finding and positive evidence are still relevant.',
      'Confirm negative evidence and blocked actions remain visible.',
      'Confirm evidence freshness has not expired.',
      'Record any later review outcome through a separate explicit decision.',
    ],
    durableRecordCreationAllowed: false,
    proposalQueueMutationAllowed: false,
    proposalApplicationAllowed: false,
    nonApprovalStatement:
      'This pending human-review packet is not a review decision, durable record, queue mutation, or proposal application.',
  };
}

module.exports = {
  PROPOSAL_DRAFT_REVIEW_SCHEMA_VERSION,
  PROPOSAL_DRAFT_REVIEW_STATUS,
  createProposalDraftHumanReviewPacket,
};
