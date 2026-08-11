'use strict';

const crypto = require('crypto');
const {
  STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION,
} = require('./contracts');

const CONTEXT_CONSUMPTION_DECISION = 'consume';
const CONTEXT_CONSUMPTION_TARGET_ROLE = 'strategist';
const CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT =
  'use-exact-reviewed-mission-context-for-strategist-only';
const CONTEXT_CONSUMPTION_BLOCKED_ACTIONS = Object.freeze([
  'architect-context',
  'conductor-context',
  'decomposer-context',
  'mission-injection',
  'provider-context',
  'scheduler',
  'workorder-dispatch',
]);
const CONTEXT_CONSUMPTION_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'requestedAt',
  'targetRole',
]);
const CONTEXT_REF_KEYS = Object.freeze([
  'attachmentId',
  'attachmentRecordDigest',
  'consumptionDigest',
  'contextDigest',
  'sourcePreviewDigest',
  'sourcePreviewId',
  'targetAgentId',
  'targetMissionDigest',
  'targetMissionId',
  'targetRole',
]);
const CONTEXT_RECEIPT_KEYS = Object.freeze([
  'acknowledgement',
  'attachmentId',
  'attachmentRecordDigest',
  'blockedActions',
  'consumptionDigest',
  'contextDigest',
  'requestedAt',
  'rationale',
  'sourceMemoryItemId',
  'sourceMemoryItemRecordDigest',
  'sourceMemoryRecallId',
  'sourceMemoryRecallPreviewId',
  'sourceMemoryRecallRecordDigest',
  'sourcePreviewDigest',
  'sourcePreviewId',
  'targetAgentId',
  'targetMissionDigest',
  'targetMissionId',
  'targetRole',
]);
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const MAX_TEXT_LENGTH = 2048;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function errorWithStatus(message, statusCode = 409) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertExactKeys(value, expectedKeys, label, statusCode = 409) {
  if (!isPlainRecord(value)) throw errorWithStatus(`${label} must be an object`, statusCode);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw errorWithStatus(`${label} has unexpected or missing fields`, statusCode);
  }
}

function normalizeIdentifier(value, label, statusCode = 409) {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value !== value.trim() ||
    value.length > 256 ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    throw errorWithStatus(`${label} is invalid`, statusCode);
  }
  return value;
}

function normalizeDigest(value, label, statusCode = 409) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`, statusCode);
  }
  return value;
}

function normalizeTimestamp(value, label, statusCode = 409) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, statusCode);
  }
  return value;
}

function normalizeSafeText(value, label, { maxLength = MAX_TEXT_LENGTH, statusCode = 409 } = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus(`${label} is required`, statusCode);
  }
  const normalized = value.trim();
  if (
    normalized.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(normalized) ||
    CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))
  ) {
    throw errorWithStatus(`${label} is invalid or contains a credential marker`, statusCode);
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

function assertSortedStrings(value, label) {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw errorWithStatus(`${label} must be a string array`);
  }
  const sorted = [...value].sort();
  if (sorted.some((entry, index) => entry !== value[index])) {
    throw errorWithStatus(`${label} must be sorted`);
  }
  return [...value];
}

function normalizeContextConsumption(value, { now = new Date().toISOString() } = {}) {
  assertExactKeys(value, CONTEXT_CONSUMPTION_KEYS, 'contextConsumption', 400);
  const normalizedNow = normalizeTimestamp(now, 'current time', 400);
  const requestedAt = normalizeTimestamp(value.requestedAt, 'contextConsumption.requestedAt', 400);
  if (value.decision !== CONTEXT_CONSUMPTION_DECISION) {
    throw errorWithStatus(`contextConsumption.decision must be ${CONTEXT_CONSUMPTION_DECISION}`, 400);
  }
  if (value.targetRole !== CONTEXT_CONSUMPTION_TARGET_ROLE) {
    throw errorWithStatus(`contextConsumption.targetRole must be ${CONTEXT_CONSUMPTION_TARGET_ROLE}`, 400);
  }
  if (value.acknowledgement !== CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT) {
    throw errorWithStatus(
      `contextConsumption.acknowledgement must be ${CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT}`,
      400,
    );
  }
  if (Date.parse(requestedAt) > Date.parse(normalizedNow) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('contextConsumption.requestedAt is too far in the future', 400);
  }
  return deepFreeze({
    decision: CONTEXT_CONSUMPTION_DECISION,
    targetRole: CONTEXT_CONSUMPTION_TARGET_ROLE,
    acknowledgement: CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT,
    rationale: normalizeSafeText(value.rationale, 'contextConsumption.rationale', {
      statusCode: 400,
    }),
    requestedAt,
  });
}

function buildNormalizedStrategistContext(attachment) {
  const contextPayload = {
    attachmentId: normalizeIdentifier(attachment.id, 'attachment.id'),
    attachmentRecordDigest: normalizeDigest(
      attachment.recordDigest,
      'attachment.recordDigest',
    ),
    projectId: normalizeIdentifier(attachment.projectId, 'attachment.projectId'),
    workspaceScope: structuredClone(attachment.workspaceScope),
    targetMissionId: normalizeIdentifier(attachment.targetMissionId, 'attachment.targetMissionId'),
    targetMissionDigest: normalizeDigest(
      attachment.targetMissionDigest,
      'attachment.targetMissionDigest',
    ),
    sourceMemoryRecallId: normalizeIdentifier(
      attachment.sourceMemoryRecallId,
      'attachment.sourceMemoryRecallId',
    ),
    sourceMemoryRecallRecordDigest: normalizeDigest(
      attachment.sourceMemoryRecallRecordDigest,
      'attachment.sourceMemoryRecallRecordDigest',
    ),
    sourceMemoryItemId: normalizeIdentifier(
      attachment.sourceMemoryItemId,
      'attachment.sourceMemoryItemId',
    ),
    sourceMemoryItemRecordDigest: normalizeDigest(
      attachment.sourceMemoryItemRecordDigest,
      'attachment.sourceMemoryItemRecordDigest',
    ),
    sourceMemoryRecallPreviewId: normalizeIdentifier(
      attachment.sourceMemoryRecallPreviewId,
      'attachment.sourceMemoryRecallPreviewId',
    ),
    sourcePreviewId: normalizeIdentifier(attachment.sourcePreviewId, 'attachment.sourcePreviewId'),
    sourcePreviewDigest: normalizeDigest(
      attachment.sourcePreviewDigest,
      'attachment.sourcePreviewDigest',
    ),
    purpose: normalizeSafeText(attachment.purpose, 'attachment.purpose'),
    summary: normalizeSafeText(attachment.summary, 'attachment.summary'),
    applicability: structuredClone(attachment.applicability),
    evidenceRefs: assertSortedStrings(attachment.evidenceRefs, 'attachment.evidenceRefs'),
    negativeEvidenceRefs: assertSortedStrings(
      attachment.negativeEvidenceRefs,
      'attachment.negativeEvidenceRefs',
    ),
    redactionRefs: assertSortedStrings(attachment.redactionRefs, 'attachment.redactionRefs'),
    reviewRefs: assertSortedStrings(attachment.reviewRefs, 'attachment.reviewRefs'),
    expiresAt: normalizeTimestamp(attachment.expiresAt, 'attachment.expiresAt'),
    evaluatedAt: normalizeTimestamp(attachment.evaluatedAt, 'attachment.evaluatedAt'),
    attachedAt: normalizeTimestamp(attachment.attachedAt, 'attachment.attachedAt'),
  };
  return deepFreeze({
    ...contextPayload,
    contextDigest: digestCanonical(contextPayload),
  });
}

function buildConsumptionDigestPayload({ attachment, context, contextConsumption, targetAgentId }) {
  return {
    acknowledgement: contextConsumption.acknowledgement,
    attachmentId: attachment.id,
    attachmentRecordDigest: attachment.recordDigest,
    contextDigest: context.contextDigest,
    rationale: contextConsumption.rationale,
    requestedAt: contextConsumption.requestedAt,
    targetAgentId,
    targetMissionDigest: attachment.targetMissionDigest,
    targetMissionId: attachment.targetMissionId,
    targetRole: contextConsumption.targetRole,
  };
}

function createStrategistContextConsumption({ attachment, contextConsumption, targetAgentId, now }) {
  const normalizedTargetAgentId = normalizeIdentifier(targetAgentId, 'targetAgentId');
  const normalizedConsumption = normalizeContextConsumption(contextConsumption, { now });
  const context = buildNormalizedStrategistContext(attachment);
  const consumptionDigest = digestCanonical(
    buildConsumptionDigestPayload({
      attachment,
      context,
      contextConsumption: normalizedConsumption,
      targetAgentId: normalizedTargetAgentId,
    }),
  );
  const contextRef = deepFreeze({
    attachmentId: attachment.id,
    attachmentRecordDigest: attachment.recordDigest,
    consumptionDigest,
    contextDigest: context.contextDigest,
    sourcePreviewDigest: attachment.sourcePreviewDigest,
    sourcePreviewId: attachment.sourcePreviewId,
    targetAgentId: normalizedTargetAgentId,
    targetMissionDigest: attachment.targetMissionDigest,
    targetMissionId: attachment.targetMissionId,
    targetRole: CONTEXT_CONSUMPTION_TARGET_ROLE,
  });
  const receipt = deepFreeze({
    acknowledgement: normalizedConsumption.acknowledgement,
    attachmentId: attachment.id,
    attachmentRecordDigest: attachment.recordDigest,
    blockedActions: [...CONTEXT_CONSUMPTION_BLOCKED_ACTIONS],
    consumptionDigest,
    contextDigest: context.contextDigest,
    requestedAt: normalizedConsumption.requestedAt,
    rationale: normalizedConsumption.rationale,
    sourceMemoryItemId: attachment.sourceMemoryItemId,
    sourceMemoryItemRecordDigest: attachment.sourceMemoryItemRecordDigest,
    sourceMemoryRecallId: attachment.sourceMemoryRecallId,
    sourceMemoryRecallPreviewId: attachment.sourceMemoryRecallPreviewId,
    sourceMemoryRecallRecordDigest: attachment.sourceMemoryRecallRecordDigest,
    sourcePreviewDigest: attachment.sourcePreviewDigest,
    sourcePreviewId: attachment.sourcePreviewId,
    targetAgentId: normalizedTargetAgentId,
    targetMissionDigest: attachment.targetMissionDigest,
    targetMissionId: attachment.targetMissionId,
    targetRole: CONTEXT_CONSUMPTION_TARGET_ROLE,
  });
  return deepFreeze({
    context,
    contextConsumption: normalizedConsumption,
    contextRef,
    receipt,
  });
}

function assertContextRef(value, label = 'Strategist contextRef') {
  assertExactKeys(value, CONTEXT_REF_KEYS, label);
  normalizeIdentifier(value.attachmentId, `${label}.attachmentId`);
  normalizeIdentifier(value.sourcePreviewId, `${label}.sourcePreviewId`);
  normalizeIdentifier(value.targetAgentId, `${label}.targetAgentId`);
  normalizeIdentifier(value.targetMissionId, `${label}.targetMissionId`);
  for (const field of [
    'attachmentRecordDigest',
    'consumptionDigest',
    'contextDigest',
    'sourcePreviewDigest',
    'targetMissionDigest',
  ]) {
    normalizeDigest(value[field], `${label}.${field}`);
  }
  if (value.targetRole !== CONTEXT_CONSUMPTION_TARGET_ROLE) {
    throw errorWithStatus(`${label}.targetRole is invalid`);
  }
  return value;
}

function assertContextConsumptionReceipt(value, label = 'Strategist context receipt') {
  assertExactKeys(value, CONTEXT_RECEIPT_KEYS, label);
  normalizeIdentifier(value.attachmentId, `${label}.attachmentId`);
  normalizeIdentifier(value.sourceMemoryItemId, `${label}.sourceMemoryItemId`);
  normalizeIdentifier(value.sourceMemoryRecallId, `${label}.sourceMemoryRecallId`);
  normalizeIdentifier(value.sourceMemoryRecallPreviewId, `${label}.sourceMemoryRecallPreviewId`);
  normalizeIdentifier(value.sourcePreviewId, `${label}.sourcePreviewId`);
  normalizeIdentifier(value.targetAgentId, `${label}.targetAgentId`);
  normalizeIdentifier(value.targetMissionId, `${label}.targetMissionId`);
  for (const field of [
    'attachmentRecordDigest',
    'consumptionDigest',
    'contextDigest',
    'sourceMemoryItemRecordDigest',
    'sourceMemoryRecallRecordDigest',
    'sourcePreviewDigest',
    'targetMissionDigest',
  ]) {
    normalizeDigest(value[field], `${label}.${field}`);
  }
  normalizeTimestamp(value.requestedAt, `${label}.requestedAt`);
  normalizeSafeText(value.rationale, `${label}.rationale`);
  assertSortedStrings(value.blockedActions, `${label}.blockedActions`);
  if (
    value.acknowledgement !== CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT ||
    value.targetRole !== CONTEXT_CONSUMPTION_TARGET_ROLE ||
    value.blockedActions.some(
      (action, index) => action !== CONTEXT_CONSUMPTION_BLOCKED_ACTIONS[index],
    ) ||
    value.blockedActions.length !== CONTEXT_CONSUMPTION_BLOCKED_ACTIONS.length
  ) {
    throw errorWithStatus(`${label} has invalid fixed evidence`);
  }
  return value;
}

module.exports = {
  CONTEXT_CONSUMPTION_ACKNOWLEDGEMENT,
  CONTEXT_CONSUMPTION_BLOCKED_ACTIONS,
  CONTEXT_CONSUMPTION_DECISION,
  CONTEXT_CONSUMPTION_TARGET_ROLE,
  CONTEXT_CONSUMPTION_KEYS,
  CONTEXT_RECEIPT_KEYS,
  CONTEXT_REF_KEYS,
  STRATEGIST_CONTEXT_CONSUMPTION_STATE_SCHEMA_VERSION,
  assertContextConsumptionReceipt,
  assertContextRef,
  buildNormalizedStrategistContext,
  createStrategistContextConsumption,
  deepFreeze,
  digestCanonical,
  normalizeContextConsumption,
};
