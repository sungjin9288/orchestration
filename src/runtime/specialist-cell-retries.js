'use strict';

const crypto = require('crypto');
const {
  normalizeSpecialistBatchPreviewRequest,
} = require('./specialist-batch-preview');
const {
  MAX_CELL_DEADLINE_MS,
  deepFreeze,
  normalizeDigest,
  normalizeTimestamp,
} = require('./specialist-cell-attempts');
const {
  normalizeIdentifier,
} = require('./specialist-batches');

const SPECIALIST_CELL_RETRY_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
});

const RETRY_APPROVAL_DECISION = 'retry-failed-cell-once';
const RETRY_APPROVAL_ACKNOWLEDGEMENT =
  'retain-original-evidence-and-retry-exact-failed-cell-once';
const MAX_RATIONALE_LENGTH = 500;

const RETRY_APPROVAL_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);

const RETRY_REQUEST_KEYS = Object.freeze([
  'compileSpec',
  'evaluatedAt',
  'expectedBatchRecordDigest',
  'expectedSourceCellAttemptRecordDigest',
  'previewDigest',
  'previewId',
  'retryApproval',
  'retryDeadlineMs',
  'sourceCellAttemptId',
  'sourceDigest',
  'sourceRefs',
  'specialistSpec',
]);

const SPECIALIST_CELL_RETRY_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'specialistBatchId',
  'sourceCellAttemptId',
  'retryCellAttemptId',
  'sourceBatchRecordDigest',
  'sourceCellAttemptRecordDigest',
  'retryPreviewId',
  'retryPreviewDigest',
  'retryRequestDigest',
  'retryApproval',
  'retryApprovalDigest',
  'retryDeadlineMs',
  'status',
  'startedAt',
  'completedAt',
  'recordDigest',
]);

const CREATE_INPUT_KEYS = Object.freeze([
  'id',
  'specialistBatchId',
  'sourceCellAttemptId',
  'retryCellAttemptId',
  'sourceBatchRecordDigest',
  'sourceCellAttemptRecordDigest',
  'retryPreviewId',
  'retryPreviewDigest',
  'retryRequestDigest',
  'retryApproval',
  'retryDeadlineMs',
  'startedAt',
]);

const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function isPlainRecord(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
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

function normalizeText(value, label, maxLength) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const normalized = value.trim();
  if (/[\x00-\x1F\x7F]/.test(normalized) || normalized.length > maxLength) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeRetryDeadlineMs(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_CELL_DEADLINE_MS) {
    throw new Error(
      `retryDeadlineMs must be an integer from 1 through ${MAX_CELL_DEADLINE_MS}`,
    );
  }
  return value;
}

function normalizeRetryApproval(value, options = {}) {
  assertExactKeys(value, RETRY_APPROVAL_KEYS, 'retryApproval');
  if (value.decision !== RETRY_APPROVAL_DECISION) {
    throw new Error(`retryApproval.decision must be ${RETRY_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== RETRY_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `retryApproval.acknowledgement must be ${RETRY_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const rationale = normalizeText(
    value.rationale,
    'retryApproval.rationale',
    MAX_RATIONALE_LENGTH,
  );
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(rationale))) {
    throw new Error('retryApproval.rationale contains an obvious credential marker');
  }
  const reviewedAt = normalizeTimestamp(
    value.reviewedAt,
    'retryApproval.reviewedAt',
  );
  if (
    options.evaluatedAt !== undefined &&
    Date.parse(reviewedAt) <
      Date.parse(normalizeTimestamp(options.evaluatedAt, 'evaluatedAt'))
  ) {
    throw new Error('retryApproval.reviewedAt must not precede evaluatedAt');
  }
  if (
    options.now !== undefined &&
    Date.parse(reviewedAt) >
      Date.parse(normalizeTimestamp(options.now, 'now')) + 5 * 60 * 1000
  ) {
    throw new Error('retryApproval.reviewedAt is too far in the future');
  }
  return {
    decision: RETRY_APPROVAL_DECISION,
    acknowledgement: RETRY_APPROVAL_ACKNOWLEDGEMENT,
    rationale,
    reviewedAt,
  };
}

function computeRetryApprovalDigest(value) {
  return digestCanonical(normalizeRetryApproval(value));
}

function normalizeSpecialistCellRetryRequest(value, options = {}) {
  assertExactKeys(value, RETRY_REQUEST_KEYS, 'SpecialistCellRetry request');
  const previewRequest = normalizeSpecialistBatchPreviewRequest({
    compileSpec: value.compileSpec,
    evaluatedAt: value.evaluatedAt,
    sourceRefs: value.sourceRefs,
    specialistSpec: value.specialistSpec,
  });
  return {
    compileSpec: previewRequest.compileSpec,
    evaluatedAt: previewRequest.evaluatedAt,
    expectedBatchRecordDigest: normalizeDigest(
      value.expectedBatchRecordDigest,
      'expectedBatchRecordDigest',
    ),
    expectedSourceCellAttemptRecordDigest: normalizeDigest(
      value.expectedSourceCellAttemptRecordDigest,
      'expectedSourceCellAttemptRecordDigest',
    ),
    previewDigest: normalizeDigest(value.previewDigest, 'previewDigest'),
    previewId: normalizeIdentifier(value.previewId, 'previewId'),
    retryApproval: normalizeRetryApproval(value.retryApproval, {
      evaluatedAt: previewRequest.evaluatedAt,
      now: options.now,
    }),
    retryDeadlineMs: normalizeRetryDeadlineMs(value.retryDeadlineMs),
    sourceCellAttemptId: normalizeIdentifier(
      value.sourceCellAttemptId,
      'sourceCellAttemptId',
    ),
    sourceDigest: normalizeDigest(value.sourceDigest, 'sourceDigest'),
    sourceRefs: previewRequest.sourceRefs,
    specialistSpec: previewRequest.specialistSpec,
  };
}

function computeSpecialistCellRetryRequestDigest(value, options = {}) {
  return digestCanonical(normalizeSpecialistCellRetryRequest(value, options));
}

function computeSpecialistCellRetryRecordDigest(record) {
  if (!isPlainRecord(record)) {
    throw new Error('SpecialistCellRetry record must be an object');
  }
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createSpecialistCellRetry(input, options = {}) {
  assertExactKeys(input, CREATE_INPUT_KEYS, 'SpecialistCellRetry create input');
  const id = normalizeIdentifier(input.id, 'SpecialistCellRetry id');
  if (!/^specialist-cell-retry-\d{4}$/.test(id)) {
    throw new Error(
      'SpecialistCellRetry id must use the specialist-cell-retry-0000 format',
    );
  }
  const retryApproval = normalizeRetryApproval(input.retryApproval, {
    evaluatedAt: options.evaluatedAt,
    now: options.now,
  });
  const record = {
    id,
    persisted: true,
    specialistBatchId: normalizeIdentifier(
      input.specialistBatchId,
      'SpecialistCellRetry specialistBatchId',
    ),
    sourceCellAttemptId: normalizeIdentifier(
      input.sourceCellAttemptId,
      'SpecialistCellRetry sourceCellAttemptId',
    ),
    retryCellAttemptId: normalizeIdentifier(
      input.retryCellAttemptId,
      'SpecialistCellRetry retryCellAttemptId',
    ),
    sourceBatchRecordDigest: normalizeDigest(
      input.sourceBatchRecordDigest,
      'SpecialistCellRetry sourceBatchRecordDigest',
    ),
    sourceCellAttemptRecordDigest: normalizeDigest(
      input.sourceCellAttemptRecordDigest,
      'SpecialistCellRetry sourceCellAttemptRecordDigest',
    ),
    retryPreviewId: normalizeIdentifier(
      input.retryPreviewId,
      'SpecialistCellRetry retryPreviewId',
    ),
    retryPreviewDigest: normalizeDigest(
      input.retryPreviewDigest,
      'SpecialistCellRetry retryPreviewDigest',
    ),
    retryRequestDigest: normalizeDigest(
      input.retryRequestDigest,
      'SpecialistCellRetry retryRequestDigest',
    ),
    retryApproval,
    retryApprovalDigest: computeRetryApprovalDigest(retryApproval),
    retryDeadlineMs: normalizeRetryDeadlineMs(input.retryDeadlineMs),
    status: SPECIALIST_CELL_RETRY_STATUS.ACTIVE,
    startedAt: normalizeTimestamp(input.startedAt, 'SpecialistCellRetry startedAt'),
    completedAt: null,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeSpecialistCellRetryRecordDigest(record),
  });
}

function settleSpecialistCellRetry(record, transition) {
  assertSpecialistCellRetryRecord(record);
  if (record.status !== SPECIALIST_CELL_RETRY_STATUS.ACTIVE) {
    throw new Error(`SpecialistCellRetry ${record.id} is not active`);
  }
  assertExactKeys(
    transition,
    ['completedAt', 'status'],
    'SpecialistCellRetry transition',
  );
  if (
    transition.status !== SPECIALIST_CELL_RETRY_STATUS.COMPLETED &&
    transition.status !== SPECIALIST_CELL_RETRY_STATUS.FAILED
  ) {
    throw new Error('SpecialistCellRetry transition status is invalid');
  }
  const completedAt = normalizeTimestamp(
    transition.completedAt,
    'SpecialistCellRetry completedAt',
  );
  if (Date.parse(completedAt) < Date.parse(record.startedAt)) {
    throw new Error('SpecialistCellRetry completedAt precedes startedAt');
  }
  const next = {
    ...record,
    status: transition.status,
    completedAt,
  };
  delete next.recordDigest;
  return deepFreeze({
    ...next,
    recordDigest: computeSpecialistCellRetryRecordDigest(next),
  });
}

function assertSpecialistCellRetryRecord(record) {
  assertExactKeys(
    record,
    SPECIALIST_CELL_RETRY_RECORD_KEYS,
    'SpecialistCellRetry record',
  );
  if (record.persisted !== true) {
    throw new Error('SpecialistCellRetry persisted must be true');
  }
  const active = createSpecialistCellRetry({
    id: record.id,
    specialistBatchId: record.specialistBatchId,
    sourceCellAttemptId: record.sourceCellAttemptId,
    retryCellAttemptId: record.retryCellAttemptId,
    sourceBatchRecordDigest: record.sourceBatchRecordDigest,
    sourceCellAttemptRecordDigest: record.sourceCellAttemptRecordDigest,
    retryPreviewId: record.retryPreviewId,
    retryPreviewDigest: record.retryPreviewDigest,
    retryRequestDigest: record.retryRequestDigest,
    retryApproval: record.retryApproval,
    retryDeadlineMs: record.retryDeadlineMs,
    startedAt: record.startedAt,
  });
  if (
    record.retryApprovalDigest !== active.retryApprovalDigest ||
    JSON.stringify(record.retryApproval) !== JSON.stringify(active.retryApproval)
  ) {
    throw new Error('SpecialistCellRetry approval evidence is invalid');
  }
  if (!Object.values(SPECIALIST_CELL_RETRY_STATUS).includes(record.status)) {
    throw new Error('SpecialistCellRetry status is invalid');
  }
  if (record.status === SPECIALIST_CELL_RETRY_STATUS.ACTIVE) {
    if (record.completedAt !== null) {
      throw new Error('Active SpecialistCellRetry must not be completed');
    }
  } else {
    const terminal = settleSpecialistCellRetry(active, {
      status: record.status,
      completedAt: record.completedAt,
    });
    if (terminal.completedAt !== record.completedAt) {
      throw new Error('SpecialistCellRetry terminal evidence is invalid');
    }
  }
  if (computeSpecialistCellRetryRecordDigest(record) !== record.recordDigest) {
    throw new Error('SpecialistCellRetry recordDigest does not match its payload');
  }
  return record;
}

module.exports = {
  RETRY_APPROVAL_ACKNOWLEDGEMENT,
  RETRY_APPROVAL_DECISION,
  RETRY_APPROVAL_KEYS,
  RETRY_REQUEST_KEYS,
  SPECIALIST_CELL_RETRY_RECORD_KEYS,
  SPECIALIST_CELL_RETRY_STATUS,
  assertSpecialistCellRetryRecord,
  computeRetryApprovalDigest,
  computeSpecialistCellRetryRecordDigest,
  computeSpecialistCellRetryRequestDigest,
  createSpecialistCellRetry,
  normalizeRetryApproval,
  normalizeRetryDeadlineMs,
  normalizeSpecialistCellRetryRequest,
  settleSpecialistCellRetry,
};
