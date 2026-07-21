'use strict';

const crypto = require('crypto');

const MEMORY_ITEM_STATUS = 'stored';
const STORAGE_APPROVAL_DECISION = 'store';
const STORAGE_APPROVAL_ACKNOWLEDGEMENT =
  'reviewed-memory-candidate-for-local-project-storage';
const MEMORY_ITEM_NON_PERSISTENCE_STATEMENT =
  'source-readiness-was-not-storage-approval';
const MAX_RATIONALE_LENGTH = 1024;
const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

const MEMORY_ITEM_BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'candidate-mutation',
  'commit',
  'cross-workspace-use',
  'delete',
  'expiry-mutation',
  'export',
  'external-connectors',
  'gc',
  'import',
  'next-mission',
  'policy-mutation',
  'provider-generation',
  'push',
  'ranking',
  'refresh',
  'release',
  'replacement',
  'retrieval',
  'scheduling',
  'search',
  'skill-promotion',
  'source-mutation',
  'supersession',
]);

const STORAGE_APPROVAL_KEYS = [
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
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))) {
    throw new Error(`${label} contains an obvious high-risk credential marker`);
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

function computeMemoryItemRecordDigest(memoryItem) {
  const { recordDigest: _recordDigest, ...payload } = memoryItem;
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)))
    .digest('hex');
}

function normalizeMemoryItemStorageApproval(value, preview) {
  assertExactKeys(value, STORAGE_APPROVAL_KEYS, 'storageApproval');
  if (value.decision !== STORAGE_APPROVAL_DECISION) {
    throw new Error(`storageApproval.decision must be ${STORAGE_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== STORAGE_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `storageApproval.acknowledgement must be ${STORAGE_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const reviewedAt = normalizeIsoTimestamp(
    value.reviewedAt,
    'storageApproval.reviewedAt',
  );
  if (Date.parse(reviewedAt) < Date.parse(preview.evaluatedAt)) {
    throw new Error('storageApproval.reviewedAt must not precede preview evaluatedAt');
  }
  if (Date.parse(reviewedAt) >= Date.parse(preview.expiresAt)) {
    throw new Error('storageApproval.reviewedAt must precede preview expiry');
  }
  return {
    decision: STORAGE_APPROVAL_DECISION,
    acknowledgement: STORAGE_APPROVAL_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'storageApproval.rationale'),
    reviewedAt,
  };
}

function createMemoryItem({ id, preview, storageApproval }) {
  const normalizedApproval = normalizeMemoryItemStorageApproval(
    storageApproval,
    preview,
  );
  const createdAt = normalizedApproval.reviewedAt;
  const memoryItem = {
    id,
    persisted: true,
    status: MEMORY_ITEM_STATUS,
    projectId: preview.projectId,
    workspaceScope: structuredClone(preview.workspaceScope),
    sourceMissionId: preview.sourceMissionId,
    sourceLearningCandidateId: preview.sourceLearningCandidateId,
    sourceLearningCandidateReviewId: preview.sourceLearningCandidateReviewId,
    sourceMemoryCandidatePreviewId: preview.id,
    sourceMemoryCandidatePreviewDigest: preview.previewDigest,
    sourceLearningPreviewId: preview.previewId,
    candidateDigest: preview.candidateDigest,
    candidateRecordDigest: preview.candidateRecordDigest,
    reviewDigest: preview.reviewDigest,
    summary: preview.summary,
    applicability: structuredClone(preview.applicability),
    sourceRefs: [...preview.sourceRefs],
    evidenceRefs: [...preview.evidenceRefs],
    negativeEvidenceRefs: [...preview.negativeEvidenceRefs],
    redactionRefs: [...preview.redactionRefs],
    reviewRefs: [...preview.reviewRefs],
    storageApproval: normalizedApproval,
    redactionStatus: 'review-required',
    applicationStatus: 'blocked',
    promotionStatus: 'blocked',
    expiresAt: preview.expiresAt,
    exportRefs: [],
    deletionRefs: [],
    blockedActions: [...MEMORY_ITEM_BLOCKED_ACTIONS],
    nonPersistenceStatement: MEMORY_ITEM_NON_PERSISTENCE_STATEMENT,
    createdAt,
    updatedAt: createdAt,
  };
  return {
    ...memoryItem,
    recordDigest: computeMemoryItemRecordDigest(memoryItem),
  };
}

module.exports = {
  MEMORY_ITEM_BLOCKED_ACTIONS,
  MEMORY_ITEM_NON_PERSISTENCE_STATEMENT,
  MEMORY_ITEM_STATUS,
  STORAGE_APPROVAL_ACKNOWLEDGEMENT,
  STORAGE_APPROVAL_DECISION,
  computeMemoryItemRecordDigest,
  createMemoryItem,
  normalizeMemoryItemStorageApproval,
};
