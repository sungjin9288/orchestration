'use strict';

const crypto = require('crypto');

const VERIFICATION_PROOF_STATUS = Object.freeze({
  PASSED: 'passed',
  FAILED: 'failed',
});
const PROOF_APPROVAL_DECISION = 'record-proof';
const PROOF_APPROVAL_ACKNOWLEDGEMENT =
  'reviewed-current-workorder-evidence-for-verification-proof';
const MAX_RATIONALE_LENGTH = 1024;

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'automatic-completion',
  'automatic-retry',
  'commit',
  'delete',
  'external-connectors',
  'mutation',
  'provider-call',
  'push',
  'release',
  'scheduling',
  'source-mutation',
]);

const APPROVAL_KEYS = [
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
];

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const normalized = value.trim();
  if (/[\x00-\x1F\x7F]/.test(normalized)) {
    throw new Error(`${label} must not contain control characters`);
  }
  if (normalized.length > MAX_RATIONALE_LENGTH) {
    throw new Error(`${label} is too long`);
  }
  return normalized;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeText(value, label);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function digestCanonical(value) {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex');
}

function computeVerificationProofRecordDigest(proof) {
  const { recordDigest: _recordDigest, ...payload } = proof;
  return digestCanonical(payload);
}

function normalizeProofApproval(value, criterion) {
  assertExactKeys(value, APPROVAL_KEYS, 'proofApproval');
  if (value.decision !== PROOF_APPROVAL_DECISION) {
    throw new Error(`proofApproval.decision must be ${PROOF_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== PROOF_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `proofApproval.acknowledgement must be ${PROOF_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const reviewedAt = normalizeIsoTimestamp(value.reviewedAt, 'proofApproval.reviewedAt');
  if (Date.parse(reviewedAt) < Date.parse(criterion.createdAt)) {
    throw new Error('proofApproval.reviewedAt must not precede criterion creation');
  }
  return {
    decision: PROOF_APPROVAL_DECISION,
    acknowledgement: PROOF_APPROVAL_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'proofApproval.rationale'),
    reviewedAt,
  };
}

function computeVerificationProofRequestDigest(input) {
  return digestCanonical(input);
}

function createVerificationProof({
  id,
  criterion,
  workOrder,
  attempt,
  status,
  verificationInputDigest,
  commandResults = [],
  evidenceArtifactIds = [],
  proofApproval,
  requestDigest,
}) {
  if (!Object.values(VERIFICATION_PROOF_STATUS).includes(status)) {
    throw new Error('VerificationProof status must be passed or failed');
  }
  if (!Number.isInteger(attempt) || attempt < 1) {
    throw new Error('VerificationProof attempt must be a positive integer');
  }
  if (!/^[a-f0-9]{64}$/.test(verificationInputDigest)) {
    throw new Error('VerificationProof verificationInputDigest is invalid');
  }
  if (!/^[a-f0-9]{64}$/.test(requestDigest)) {
    throw new Error('VerificationProof requestDigest is invalid');
  }
  const approval = normalizeProofApproval(proofApproval, criterion);
  const proofKind = criterion.proofMode === 'command' ? 'command' : 'review';
  if (proofKind === 'command' && commandResults.length === 0) {
    throw new Error('Command VerificationProof requires command results');
  }
  if (proofKind === 'review' && evidenceArtifactIds.length === 0) {
    throw new Error('Review VerificationProof requires artifact evidence');
  }
  const proof = {
    id,
    persisted: true,
    status,
    proofKind,
    attempt,
    projectId: criterion.projectId,
    missionId: criterion.missionId,
    executionPlanId: criterion.executionPlanId,
    workOrderId: criterion.workOrderId,
    acceptanceCriterionId: criterion.id,
    acceptanceCriterionRecordDigest: criterion.recordDigest,
    sourceDigest: criterion.sourceDigest,
    sourceWorkOrderDigest: criterion.sourceWorkOrderDigest,
    verificationInputDigest,
    commandResults: structuredClone(commandResults),
    evidenceArtifactIds: [...evidenceArtifactIds],
    requiredEvidenceKinds: [...criterion.requiredEvidenceKinds],
    newInformationClass: proofKind === 'command' ? 'execution' : 'human-review',
    proofApproval: approval,
    requestDigest,
    blockedActions: [...BLOCKED_ACTIONS],
    createdAt: approval.reviewedAt,
  };
  return {
    ...proof,
    recordDigest: computeVerificationProofRecordDigest(proof),
  };
}

module.exports = {
  BLOCKED_ACTIONS,
  PROOF_APPROVAL_ACKNOWLEDGEMENT,
  PROOF_APPROVAL_DECISION,
  VERIFICATION_PROOF_STATUS,
  computeVerificationProofRecordDigest,
  computeVerificationProofRequestDigest,
  createVerificationProof,
  normalizeProofApproval,
};
