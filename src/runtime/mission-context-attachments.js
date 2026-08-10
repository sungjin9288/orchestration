'use strict';

const crypto = require('crypto');

const {
  CONTEXT_ACKNOWLEDGEMENT,
  NON_INJECTION_STATEMENT,
} = require('./mission-memory-context-preview');

const MISSION_CONTEXT_ATTACHMENT_STATUS = 'attached';
const ATTACHMENT_REVIEW_DECISION = 'attach';
const ATTACHMENT_REVIEW_ACKNOWLEDGEMENT =
  'reviewed-exact-memory-context-for-immutable-mission-attachment';
const MAX_RATIONALE_LENGTH = 1024;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

const ATTACHMENT_REVIEW_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);

const MISSION_CONTEXT_ATTACHMENT_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'status',
  'projectId',
  'workspaceScope',
  'targetMissionId',
  'targetMissionDigest',
  'targetMissionStatus',
  'sourceMemoryRecallId',
  'sourceMemoryRecallRecordDigest',
  'sourceMemoryItemId',
  'sourceMemoryItemRecordDigest',
  'sourceMemoryRecallPreviewId',
  'sourcePreviewId',
  'sourcePreviewDigest',
  'purpose',
  'summary',
  'applicability',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'redactionRefs',
  'reviewRefs',
  'expiresAt',
  'attachmentReview',
  'recommendationStatus',
  'applicationStatus',
  'missionInjectionStatus',
  'workOrderInjectionStatus',
  'policyInjectionStatus',
  'roleConsumptionStatus',
  'blockedActions',
  'evaluatedAt',
  'attachedAt',
  'createdAt',
  'recordDigest',
]);

const MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'automatic-retrieval',
  'commit',
  'cross-workspace-use',
  'delete',
  'external-connectors',
  'mission-injection',
  'next-mission',
  'policy-injection',
  'policy-mutation',
  'prompt-injection',
  'provider-generation',
  'push',
  'ranking',
  'recommendation',
  'release',
  'replacement',
  'revision',
  'role-consumption',
  'scheduling',
  'search',
  'source-mutation',
  'supersession',
  'workorder-injection',
]);

const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function errorWithStatus(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label, statusCode = 400) {
  if (!isPlainRecord(value)) {
    throw errorWithStatus(`${label} must be an object`, statusCode);
  }
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw errorWithStatus(`${label} has unexpected or missing fields`, statusCode);
  }
}

function normalizeIdentifier(value, label, statusCode = 400) {
  if (
    typeof value !== 'string' ||
    !value ||
    value !== value.trim() ||
    value.length > 256 ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    throw errorWithStatus(`${label} is invalid`, statusCode);
  }
  return value;
}

function normalizeDigest(value, label, statusCode = 400) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`, statusCode);
  }
  return value;
}

function normalizeTimestamp(value, label, statusCode = 400) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, statusCode);
  }
  return value;
}

function normalizeRationale(value, statusCode = 400) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus('attachmentReview.rationale is required', statusCode);
  }
  const normalized = value.trim();
  if (
    normalized.length > MAX_RATIONALE_LENGTH ||
    /[\x00-\x1F\x7F]/.test(normalized) ||
    OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))
  ) {
    throw errorWithStatus(
      'attachmentReview.rationale is invalid or contains a credential marker',
      statusCode,
    );
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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeAttachmentReview(value, preview, options = {}) {
  const statusCode = options.statusCode || 400;
  assertExactKeys(value, ATTACHMENT_REVIEW_KEYS, 'attachmentReview', statusCode);
  if (value.decision !== ATTACHMENT_REVIEW_DECISION) {
    throw errorWithStatus('attachmentReview.decision must be attach', statusCode);
  }
  if (value.acknowledgement !== ATTACHMENT_REVIEW_ACKNOWLEDGEMENT) {
    throw errorWithStatus(
      `attachmentReview.acknowledgement must be ${ATTACHMENT_REVIEW_ACKNOWLEDGEMENT}`,
      statusCode,
    );
  }
  const reviewedAt = normalizeTimestamp(
    value.reviewedAt,
    'attachmentReview.reviewedAt',
    statusCode,
  );
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
    statusCode,
  );
  if (Date.parse(reviewedAt) < Date.parse(preview.evaluatedAt)) {
    throw errorWithStatus(
      'attachmentReview.reviewedAt must not precede preview evaluatedAt',
      statusCode,
    );
  }
  if (Date.parse(reviewedAt) >= Date.parse(preview.expiresAt)) {
    throw errorWithStatus(
      'attachmentReview.reviewedAt must precede preview expiry',
      statusCode,
    );
  }
  if (Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('attachmentReview.reviewedAt is too far in the future', statusCode);
  }
  return deepFreeze({
    decision: ATTACHMENT_REVIEW_DECISION,
    acknowledgement: ATTACHMENT_REVIEW_ACKNOWLEDGEMENT,
    rationale: normalizeRationale(value.rationale, statusCode),
    reviewedAt,
  });
}

function immutableAttachmentPayload(record) {
  const {
    id: _id,
    createdAt: _createdAt,
    recordDigest: _recordDigest,
    ...payload
  } = record;
  return payload;
}

function computeMissionContextAttachmentRecordDigest(record) {
  return digestCanonical(immutableAttachmentPayload(record));
}

function createMissionContextAttachment({ id, preview, attachmentReview, now }) {
  const normalizedReview = normalizeAttachmentReview(attachmentReview, preview, { now });
  const attachedAt = normalizedReview.reviewedAt;
  const record = {
    id: normalizeIdentifier(id, 'id'),
    persisted: true,
    status: MISSION_CONTEXT_ATTACHMENT_STATUS,
    projectId: preview.projectId,
    workspaceScope: structuredClone(preview.workspaceScope),
    targetMissionId: preview.targetMissionId,
    targetMissionDigest: preview.targetMissionDigest,
    targetMissionStatus: preview.targetMissionStatus,
    sourceMemoryRecallId: preview.sourceMemoryRecallId,
    sourceMemoryRecallRecordDigest: preview.sourceMemoryRecallRecordDigest,
    sourceMemoryItemId: preview.sourceMemoryItemId,
    sourceMemoryItemRecordDigest: preview.sourceMemoryItemRecordDigest,
    sourceMemoryRecallPreviewId: preview.sourceMemoryRecallPreviewId,
    sourcePreviewId: preview.id,
    sourcePreviewDigest: preview.previewDigest,
    purpose: preview.purpose,
    summary: preview.summary,
    applicability: structuredClone(preview.applicability),
    evidenceRefs: [...preview.evidenceRefs],
    negativeEvidenceRefs: [...preview.negativeEvidenceRefs],
    redactionRefs: [...preview.redactionRefs],
    reviewRefs: [...preview.reviewRefs],
    expiresAt: preview.expiresAt,
    attachmentReview: structuredClone(normalizedReview),
    recommendationStatus: 'blocked',
    applicationStatus: 'blocked',
    missionInjectionStatus: 'blocked',
    workOrderInjectionStatus: 'blocked',
    policyInjectionStatus: 'blocked',
    roleConsumptionStatus: 'blocked',
    blockedActions: [...MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS],
    evaluatedAt: preview.evaluatedAt,
    attachedAt,
    createdAt: attachedAt,
  };
  record.recordDigest = computeMissionContextAttachmentRecordDigest(record);
  assertMissionContextAttachmentRecord(record);
  return deepFreeze(record);
}

function assertMissionContextAttachmentRecord(record) {
  assertExactKeys(
    record,
    MISSION_CONTEXT_ATTACHMENT_RECORD_KEYS,
    'MissionContextAttachment record',
    409,
  );
  for (const field of [
    'id',
    'projectId',
    'targetMissionId',
    'sourceMemoryRecallId',
    'sourceMemoryItemId',
    'sourceMemoryRecallPreviewId',
    'sourcePreviewId',
  ]) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of [
    'targetMissionDigest',
    'sourceMemoryRecallRecordDigest',
    'sourceMemoryItemRecordDigest',
    'sourcePreviewDigest',
    'recordDigest',
  ]) {
    normalizeDigest(record[field], field, 409);
  }
  for (const field of ['expiresAt', 'evaluatedAt', 'attachedAt', 'createdAt']) {
    normalizeTimestamp(record[field], field, 409);
  }
  assertExactKeys(record.workspaceScope, ['projectId'], 'workspaceScope', 409);
  assertExactKeys(
    record.applicability,
    ['summary', 'targetPathAllowlist', 'verificationCommands'],
    'applicability',
    409,
  );
  if (
    record.persisted !== true ||
    record.status !== MISSION_CONTEXT_ATTACHMENT_STATUS ||
    record.workspaceScope.projectId !== record.projectId ||
    record.targetMissionStatus !== 'draft' ||
    record.attachedAt !== record.attachmentReview.reviewedAt ||
    record.createdAt !== record.attachedAt ||
    Date.parse(record.evaluatedAt) > Date.parse(record.attachedAt) ||
    Date.parse(record.attachedAt) >= Date.parse(record.expiresAt)
  ) {
    throw errorWithStatus('MissionContextAttachment fixed evidence is invalid', 409);
  }
  normalizeAttachmentReview(record.attachmentReview, record, {
    now: record.attachedAt,
    statusCode: 409,
  });
  for (const field of [
    'recommendationStatus',
    'applicationStatus',
    'missionInjectionStatus',
    'workOrderInjectionStatus',
    'policyInjectionStatus',
    'roleConsumptionStatus',
  ]) {
    if (record[field] !== 'blocked') {
      throw errorWithStatus(`MissionContextAttachment ${field} is invalid`, 409);
    }
  }
  if (
    JSON.stringify(record.blockedActions) !==
      JSON.stringify(MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS) ||
    computeMissionContextAttachmentRecordDigest(record) !== record.recordDigest
  ) {
    throw errorWithStatus('MissionContextAttachment immutable evidence is invalid', 409);
  }
  return record;
}

function contextSpecFromAttachment(attachment) {
  return {
    purpose: attachment.purpose,
    workspaceScope: structuredClone(attachment.workspaceScope),
    applicability: structuredClone(attachment.applicability),
    evidenceRefs: [...attachment.evidenceRefs],
    negativeEvidenceRefs: [...attachment.negativeEvidenceRefs],
    redactionRefs: [...attachment.redactionRefs],
    reviewRefs: [...attachment.reviewRefs],
    acknowledgement: CONTEXT_ACKNOWLEDGEMENT,
    nonInjectionStatement: NON_INJECTION_STATEMENT,
  };
}

function normalizeReplayContextSpec(contextSpec) {
  if (!isPlainRecord(contextSpec)) return contextSpec;
  const normalized = structuredClone(contextSpec);
  for (const field of [
    'evidenceRefs',
    'negativeEvidenceRefs',
    'redactionRefs',
    'reviewRefs',
  ]) {
    if (Array.isArray(normalized[field])) normalized[field].sort();
  }
  if (isPlainRecord(normalized.applicability)) {
    for (const field of ['targetPathAllowlist', 'verificationCommands']) {
      if (Array.isArray(normalized.applicability[field])) {
        normalized.applicability[field].sort();
      }
    }
  }
  return normalized;
}

function isExactMissionContextAttachmentReplay(attachment, request) {
  let normalizedReview;
  try {
    normalizedReview = normalizeAttachmentReview(
      request.attachmentReview,
      attachment,
      { now: attachment.attachedAt },
    );
  } catch {
    return false;
  }
  return (
    attachment.targetMissionId === request.missionId &&
    attachment.sourceMemoryRecallId === request.memoryRecallId &&
    attachment.sourceMemoryRecallRecordDigest === request.memoryRecallRecordDigest &&
    attachment.sourceMemoryItemId === request.memoryItemId &&
    attachment.sourceMemoryItemRecordDigest === request.memoryItemRecordDigest &&
    attachment.targetMissionDigest === request.targetMissionDigest &&
    attachment.sourcePreviewId === request.sourcePreviewId &&
    attachment.sourcePreviewDigest === request.sourcePreviewDigest &&
    attachment.evaluatedAt === request.evaluatedAt &&
    JSON.stringify(normalizedReview) === JSON.stringify(attachment.attachmentReview) &&
    digestCanonical(normalizeReplayContextSpec(request.contextSpec)) ===
      digestCanonical(contextSpecFromAttachment(attachment))
  );
}

module.exports = {
  ATTACHMENT_REVIEW_ACKNOWLEDGEMENT,
  ATTACHMENT_REVIEW_DECISION,
  MISSION_CONTEXT_ATTACHMENT_BLOCKED_ACTIONS,
  MISSION_CONTEXT_ATTACHMENT_RECORD_KEYS,
  MISSION_CONTEXT_ATTACHMENT_STATUS,
  assertMissionContextAttachmentRecord,
  computeMissionContextAttachmentRecordDigest,
  createMissionContextAttachment,
  isExactMissionContextAttachmentReplay,
  normalizeAttachmentReview,
};
