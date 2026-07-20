'use strict';

const crypto = require('crypto');

const LEARNING_CANDIDATE_REVIEW_DECISION = Object.freeze({
  ACCEPT: 'accepted',
  REJECT: 'rejected',
  CHANGES_REQUESTED: 'changes-requested',
});

const LEARNING_CANDIDATE_REVIEW_AUTHORITY = Object.freeze({
  reviewEvidenceAllowed: true,
  mutateCandidateAllowed: false,
  reviseCandidateAllowed: false,
  expireCandidateAllowed: false,
  quarantineCandidateAllowed: false,
  promoteMemoryAllowed: false,
  promoteSkillAllowed: false,
  providerCallAllowed: false,
  rawEvidenceReadAllowed: false,
  sourceMutationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  schedulingAllowed: false,
  nextMissionAllowed: false,
  policyMutationAllowed: false,
  approvalBypassAllowed: false,
  connectorCallAllowed: false,
});

const REVIEW_REQUEST_KEYS = [
  'candidateDigest',
  'candidateRecordDigest',
  'decision',
  'evidenceRefs',
  'learningCandidateId',
  'previewId',
  'rationale',
  'reviewerAcknowledgement',
];
const MAX_RATIONALE_LENGTH = 1024;
const MAX_EVIDENCE_REFS = 64;
const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function assertExactKeys(value, expectedKeys, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpected.length ||
    actualKeys.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeBoundedText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must not contain control characters`);
  }
  const normalized = value.trim();
  if (normalized.length > MAX_RATIONALE_LENGTH) {
    throw new Error(`${label} is too long`);
  }
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))) {
    throw new Error(`${label} contains an obvious high-risk credential marker`);
  }
  return normalized;
}

function normalizeDecision(value) {
  const normalized = String(value || '').trim();
  if (normalized === 'accept') return LEARNING_CANDIDATE_REVIEW_DECISION.ACCEPT;
  if (normalized === 'reject') return LEARNING_CANDIDATE_REVIEW_DECISION.REJECT;
  if (normalized === 'changes-requested') {
    return LEARNING_CANDIDATE_REVIEW_DECISION.CHANGES_REQUESTED;
  }
  throw new Error('LearningCandidate review decision must be accept, reject, or changes-requested');
}

function normalizeEvidenceRefs(value, candidate) {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_EVIDENCE_REFS) {
    throw new Error('LearningCandidate review evidenceRefs must be a bounded non-empty array');
  }
  const normalized = value.map((entry, index) =>
    normalizeBoundedText(entry, `LearningCandidate review evidenceRefs[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error('LearningCandidate review evidenceRefs must not contain duplicates');
  }
  const allowed = new Set(candidate.sourceEvidenceRefs);
  const unsupported = normalized.find((entry) => !allowed.has(entry));
  if (unsupported) {
    throw new Error(`LearningCandidate review evidenceRefs contains unsupported source value: ${unsupported}`);
  }
  return [...normalized].sort();
}

function normalizeLearningCandidateReviewRequest(input, candidate, evaluatedAt) {
  assertExactKeys(input, REVIEW_REQUEST_KEYS, 'LearningCandidate review request');
  const exactFields = [
    ['learningCandidateId', candidate.id],
    ['previewId', candidate.previewId],
    ['candidateDigest', candidate.candidateDigest],
    ['candidateRecordDigest', candidate.recordDigest],
  ];
  for (const [field, expected] of exactFields) {
    if (String(input[field] || '').trim() !== expected) {
      throw new Error(`LearningCandidate review ${field} does not match current evidence`);
    }
  }
  if (input.reviewerAcknowledgement !== 'human-reviewed') {
    throw new Error(
      'LearningCandidate review reviewerAcknowledgement must be human-reviewed',
    );
  }
  const evaluatedAtMs = Date.parse(evaluatedAt);
  if (
    !Number.isFinite(evaluatedAtMs) ||
    new Date(evaluatedAtMs).toISOString() !== evaluatedAt
  ) {
    throw new Error('LearningCandidate review evaluatedAt must be an exact ISO timestamp');
  }
  if (Date.parse(candidate.expiry.expiresAt) <= evaluatedAtMs) {
    throw new Error(`LearningCandidate ${candidate.id} is expired`);
  }
  return {
    decision: normalizeDecision(input.decision),
    rationale: normalizeBoundedText(input.rationale, 'LearningCandidate review rationale'),
    evidenceRefs: normalizeEvidenceRefs(input.evidenceRefs, candidate),
    reviewerAcknowledgement: 'human-reviewed',
  };
}

function assertLearningCandidateReviewRecordContent(review, candidate) {
  if (!Object.values(LEARNING_CANDIDATE_REVIEW_DECISION).includes(review.decision)) {
    throw new Error('LearningCandidate review has an invalid normalized decision');
  }
  const normalizedRationale = normalizeBoundedText(
    review.rationale,
    'LearningCandidate review rationale',
  );
  if (normalizedRationale !== review.rationale) {
    throw new Error('LearningCandidate review rationale is not normalized');
  }
  const normalizedEvidenceRefs = normalizeEvidenceRefs(review.evidenceRefs, candidate);
  if (
    normalizedEvidenceRefs.length !== review.evidenceRefs.length ||
    normalizedEvidenceRefs.some(
      (sourceEvidenceRef, index) => sourceEvidenceRef !== review.evidenceRefs[index],
    )
  ) {
    throw new Error('LearningCandidate review evidenceRefs are not normalized');
  }
  if (review.reviewerAcknowledgement !== 'human-reviewed') {
    throw new Error(
      'LearningCandidate review reviewerAcknowledgement must be human-reviewed',
    );
  }
}

function immutableLearningCandidateReviewPayload(input) {
  return {
    projectId: input.projectId,
    sourceMissionId: input.sourceMissionId,
    learningCandidateId: input.learningCandidateId,
    previewId: input.previewId,
    candidateDigest: input.candidateDigest,
    candidateRecordDigest: input.candidateRecordDigest,
    decision: input.decision,
    rationale: input.rationale,
    evidenceRefs: input.evidenceRefs,
    reviewerAcknowledgement: input.reviewerAcknowledgement,
    authoritySummary: input.authoritySummary,
  };
}

function computeLearningCandidateReviewDigest(input) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(immutableLearningCandidateReviewPayload(input))))
    .digest('hex');
}

function createLearningCandidateReview(input) {
  const candidate = input.learningCandidate;
  const review = {
    id: input.id,
    projectId: candidate.projectId,
    sourceMissionId: candidate.sourceMissionId,
    learningCandidateId: candidate.id,
    previewId: candidate.previewId,
    candidateDigest: candidate.candidateDigest,
    candidateRecordDigest: candidate.recordDigest,
    decision: input.reviewSpec.decision,
    rationale: input.reviewSpec.rationale,
    evidenceRefs: [...input.reviewSpec.evidenceRefs],
    reviewerAcknowledgement: input.reviewSpec.reviewerAcknowledgement,
    authoritySummary: { ...LEARNING_CANDIDATE_REVIEW_AUTHORITY },
    createdAt: input.createdAt,
  };
  review.reviewDigest = computeLearningCandidateReviewDigest(review);
  return review;
}

module.exports = {
  LEARNING_CANDIDATE_REVIEW_AUTHORITY,
  LEARNING_CANDIDATE_REVIEW_DECISION,
  assertLearningCandidateReviewRecordContent,
  computeLearningCandidateReviewDigest,
  createLearningCandidateReview,
  immutableLearningCandidateReviewPayload,
  normalizeLearningCandidateReviewRequest,
};
