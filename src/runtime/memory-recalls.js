'use strict';

const crypto = require('crypto');

const MEMORY_RECALL_STATUS = 'recorded';
const RECORD_APPROVAL_DECISION = 'record';
const RECORD_APPROVAL_ACKNOWLEDGEMENT =
  'reviewed-exact-memory-recall-for-local-audit';
const MEMORY_RECALL_NON_APPLICATION_STATEMENT =
  'recall-preview-not-runtime-application';
const MAX_RATIONALE_LENGTH = 1024;

const MEMORY_RECALL_BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'automatic-retrieval',
  'commit',
  'cross-workspace-use',
  'delete',
  'export',
  'external-connectors',
  'history',
  'import',
  'index',
  'mission-injection',
  'mutation',
  'next-mission',
  'policy-mutation',
  'provider-generation',
  'push',
  'ranking',
  'recommendation',
  'refresh',
  'release',
  'replacement',
  'revision',
  'scheduling',
  'search',
  'skill-promotion',
  'source-mutation',
  'supersession',
  'workorder-injection',
]);

const RECORD_APPROVAL_KEYS = [
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
];

const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) throw new Error(`${label} must be an object`);
  const actualKeys = Object.keys(value).sort();
  const normalizedExpectedKeys = [...expectedKeys].sort();
  if (
    actualKeys.length !== normalizedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== normalizedExpectedKeys[index])
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

function computeMemoryRecallRecordDigest(memoryRecall) {
  const { recordDigest: _recordDigest, ...payload } = memoryRecall;
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)))
    .digest('hex');
}

function normalizeMemoryRecallRecordApproval(value, preview) {
  assertExactKeys(value, RECORD_APPROVAL_KEYS, 'recordApproval');
  if (value.decision !== RECORD_APPROVAL_DECISION) {
    throw new Error(`recordApproval.decision must be ${RECORD_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== RECORD_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `recordApproval.acknowledgement must be ${RECORD_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const reviewedAt = normalizeIsoTimestamp(value.reviewedAt, 'recordApproval.reviewedAt');
  if (Date.parse(reviewedAt) < Date.parse(preview.evaluatedAt)) {
    throw new Error('recordApproval.reviewedAt must not precede preview evaluatedAt');
  }
  if (Date.parse(reviewedAt) >= Date.parse(preview.expiresAt)) {
    throw new Error('recordApproval.reviewedAt must precede preview expiry');
  }
  return {
    decision: RECORD_APPROVAL_DECISION,
    acknowledgement: RECORD_APPROVAL_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'recordApproval.rationale'),
    reviewedAt,
  };
}

function createMemoryRecall({ id, preview, recordApproval }) {
  const normalizedApproval = normalizeMemoryRecallRecordApproval(
    recordApproval,
    preview,
  );
  const createdAt = normalizedApproval.reviewedAt;
  const memoryRecall = {
    id,
    persisted: true,
    status: MEMORY_RECALL_STATUS,
    projectId: preview.projectId,
    workspaceScope: structuredClone(preview.workspaceScope),
    sourceMemoryItemId: preview.sourceMemoryItemId,
    sourceMemoryItemRecordDigest: preview.sourceMemoryItemRecordDigest,
    sourceMemoryCandidatePreviewId: preview.sourceMemoryCandidatePreviewId,
    sourceLearningCandidateId: preview.sourceLearningCandidateId,
    sourceLearningCandidateReviewId: preview.sourceLearningCandidateReviewId,
    sourceMemoryRecallPreviewId: preview.id,
    sourceMemoryRecallPreviewDigest: preview.previewDigest,
    retrievalMode: preview.retrievalMode,
    purpose: preview.purpose,
    summary: preview.summary,
    applicability: structuredClone(preview.applicability),
    sourceRefs: [...preview.sourceRefs],
    evidenceRefs: [...preview.evidenceRefs],
    negativeEvidenceRefs: [...preview.negativeEvidenceRefs],
    redactionRefs: [...preview.redactionRefs],
    reviewRefs: [...preview.reviewRefs],
    recordApproval: normalizedApproval,
    recommendationStatus: 'blocked',
    applicationStatus: 'blocked',
    missionInjectionStatus: 'blocked',
    expiresAt: preview.expiresAt,
    blockedActions: [...MEMORY_RECALL_BLOCKED_ACTIONS],
    nonApplicationStatement: MEMORY_RECALL_NON_APPLICATION_STATEMENT,
    createdAt,
    updatedAt: createdAt,
  };
  return {
    ...memoryRecall,
    recordDigest: computeMemoryRecallRecordDigest(memoryRecall),
  };
}

module.exports = {
  MEMORY_RECALL_BLOCKED_ACTIONS,
  MEMORY_RECALL_NON_APPLICATION_STATEMENT,
  MEMORY_RECALL_STATUS,
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  computeMemoryRecallRecordDigest,
  createMemoryRecall,
  normalizeMemoryRecallRecordApproval,
};
