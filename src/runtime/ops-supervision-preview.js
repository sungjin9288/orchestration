'use strict';

const crypto = require('crypto');

const OPS_SUPERVISION_TARGET_TYPE = Object.freeze({
  WORK_ORDER_ATTEMPT: 'work-order-attempt',
  SPECIALIST_FIRST_ATTEMPT: 'specialist-first-attempt',
  SPECIALIST_RETRY_ATTEMPT: 'specialist-retry-attempt',
});

const OPS_SUPERVISION_REQUEST_KEYS = Object.freeze([
  'targetType',
  'targetId',
  'parentId',
  'expectedTargetRecordDigest',
  'expectedParentDigest',
  'evaluatedAt',
]);

const OPS_SUPERVISION_EVIDENCE_KEYS = Object.freeze([
  'targetRef',
  'parentRef',
  'executionPlanRef',
  'workOrderRef',
  'sourceBatchRef',
  'sourceAttemptRef',
  'checkpointRef',
]);

const OPS_SUPERVISION_BLOCKED_ACTIONS = Object.freeze([
  'settle-attempt',
  'infer-success',
  'infer-failure',
  'cancel-attempt',
  'quarantine-attempt',
  'resume-attempt',
  'replay-attempt',
  'retry-attempt',
  'rework',
  'execute-provider',
  'apply-result',
  'mutate-source',
  'apply-memory',
  'commit',
  'push',
  'release',
  'mutate-policy',
  'bypass-approval',
  'enumerate-attempts',
]);

const SOURCE_KEYS = Object.freeze([
  'targetRecordDigest',
  'parentDigest',
  'sourceDigest',
  'attemptNumber',
  'role',
  'startedAt',
  'deadlineAt',
  'evidenceRefs',
]);

const RESPONSE_KEYS = Object.freeze([
  'id',
  'schemaVersion',
  'persisted',
  'status',
  'targetType',
  'targetId',
  'parentId',
  'targetRecordDigest',
  'parentDigest',
  'sourceDigest',
  'attemptNumber',
  'role',
  'startedAt',
  'deadlineAt',
  'evaluatedAt',
  'timeClassification',
  'lineageClassification',
  'evidenceRefs',
  'allowedActions',
  'blockedActions',
  'previewDigest',
]);

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const MAX_IDENTIFIER_LENGTH = 256;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const ALLOWED_ROLES = new Set(['builder', 'reviewer', 'qa', 'researcher']);

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function errorWithStatus(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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
    throw errorWithStatus(
      `${label} has unexpected or missing fields`,
      statusCode,
    );
  }
}

function normalizeIdentifier(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus(`${label} is required`, 400);
  }
  const normalized = value.trim();
  if (
    normalized.length > MAX_IDENTIFIER_LENGTH ||
    !IDENTIFIER_PATTERN.test(normalized)
  ) {
    throw errorWithStatus(`${label} is invalid`, 400);
  }
  return normalized;
}

function normalizeDigest(value, label) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`, 400);
  }
  return value;
}

function normalizeTimestamp(value, label) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, 400);
  }
  return value;
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

function normalizeOpsSupervisionRequest(input) {
  assertExactKeys(
    input,
    OPS_SUPERVISION_REQUEST_KEYS,
    'OpsSupervisionPreview request',
  );
  if (!Object.values(OPS_SUPERVISION_TARGET_TYPE).includes(input.targetType)) {
    throw errorWithStatus('OpsSupervisionPreview targetType is unsupported', 400);
  }
  return deepFreeze({
    targetType: input.targetType,
    targetId: normalizeIdentifier(input.targetId, 'targetId'),
    parentId: normalizeIdentifier(input.parentId, 'parentId'),
    expectedTargetRecordDigest: normalizeDigest(
      input.expectedTargetRecordDigest,
      'expectedTargetRecordDigest',
    ),
    expectedParentDigest: normalizeDigest(
      input.expectedParentDigest,
      'expectedParentDigest',
    ),
    evaluatedAt: normalizeTimestamp(input.evaluatedAt, 'evaluatedAt'),
  });
}

function normalizeEvidenceRefs(value) {
  assertExactKeys(
    value,
    OPS_SUPERVISION_EVIDENCE_KEYS,
    'OpsSupervisionPreview evidenceRefs',
    409,
  );
  return Object.fromEntries(
    OPS_SUPERVISION_EVIDENCE_KEYS.map((key) => [
      key,
      normalizeIdentifier(value[key], `evidenceRefs.${key}`, {
        nullable: true,
      }),
    ]),
  );
}

function computeOpsSupervisionPreviewDigest(preview) {
  const { id: _id, previewDigest: _previewDigest, ...payload } = preview;
  return digestCanonical(payload);
}

function buildOpsSupervisionPreview(requestInput, sourceInput, options = {}) {
  const request = normalizeOpsSupervisionRequest(requestInput);
  assertExactKeys(
    sourceInput,
    SOURCE_KEYS,
    'OpsSupervisionPreview source',
    409,
  );

  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
  );
  if (
    Date.parse(request.evaluatedAt) >
    Date.parse(now) + MAX_CLOCK_SKEW_MS
  ) {
    throw errorWithStatus('evaluatedAt is too far in the future', 400);
  }

  const targetRecordDigest = normalizeDigest(
    sourceInput.targetRecordDigest,
    'source targetRecordDigest',
  );
  const parentDigest = normalizeDigest(
    sourceInput.parentDigest,
    'source parentDigest',
  );
  const sourceDigest = normalizeDigest(
    sourceInput.sourceDigest,
    'sourceDigest',
  );
  if (
    request.expectedTargetRecordDigest !== targetRecordDigest ||
    request.expectedParentDigest !== parentDigest
  ) {
    throw errorWithStatus('OpsSupervisionPreview source digest is stale', 409);
  }
  if (
    !Number.isInteger(sourceInput.attemptNumber) ||
    sourceInput.attemptNumber < 1 ||
    sourceInput.attemptNumber > 1000
  ) {
    throw errorWithStatus('OpsSupervisionPreview attemptNumber is invalid', 409);
  }
  if (!ALLOWED_ROLES.has(sourceInput.role)) {
    throw errorWithStatus('OpsSupervisionPreview role is invalid', 409);
  }

  const startedAt = normalizeTimestamp(sourceInput.startedAt, 'source startedAt');
  const deadlineAt =
    sourceInput.deadlineAt === null
      ? null
      : normalizeTimestamp(sourceInput.deadlineAt, 'source deadlineAt');
  if (Date.parse(request.evaluatedAt) < Date.parse(startedAt)) {
    throw errorWithStatus('evaluatedAt precedes the active target', 409);
  }
  if (deadlineAt !== null && Date.parse(deadlineAt) < Date.parse(startedAt)) {
    throw errorWithStatus('OpsSupervisionPreview deadline lineage is invalid', 409);
  }

  const timeClassification =
    deadlineAt === null
      ? 'active-without-deadline'
      : Date.parse(request.evaluatedAt) >= Date.parse(deadlineAt)
        ? 'active-deadline-exceeded'
        : 'active-within-deadline';
  const payload = {
    schemaVersion: 21,
    persisted: false,
    status: 'supervision-required',
    targetType: request.targetType,
    targetId: request.targetId,
    parentId: request.parentId,
    targetRecordDigest,
    parentDigest,
    sourceDigest,
    attemptNumber: sourceInput.attemptNumber,
    role: sourceInput.role,
    startedAt,
    deadlineAt,
    evaluatedAt: request.evaluatedAt,
    timeClassification,
    lineageClassification: 'source-bound',
    evidenceRefs: normalizeEvidenceRefs(sourceInput.evidenceRefs),
    allowedActions: [],
    blockedActions: [...OPS_SUPERVISION_BLOCKED_ACTIONS],
  };
  const previewDigest = digestCanonical(payload);
  const preview = {
    id: `ops-supervision-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  };
  assertExactKeys(
    preview,
    RESPONSE_KEYS,
    'OpsSupervisionPreview response',
    409,
  );
  return deepFreeze(preview);
}

module.exports = {
  OPS_SUPERVISION_BLOCKED_ACTIONS,
  OPS_SUPERVISION_EVIDENCE_KEYS,
  OPS_SUPERVISION_REQUEST_KEYS,
  OPS_SUPERVISION_TARGET_TYPE,
  RESPONSE_KEYS,
  buildOpsSupervisionPreview,
  canonicalize,
  computeOpsSupervisionPreviewDigest,
  deepFreeze,
  digestCanonical,
  normalizeOpsSupervisionRequest,
};
