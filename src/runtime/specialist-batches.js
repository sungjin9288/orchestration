'use strict';

const crypto = require('crypto');
const {
  assertSpecialistCellAttemptRecord,
} = require('./specialist-cell-attempts');

const SPECIALIST_BATCH_STATUS = Object.freeze({
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PARTIAL_FAILED: 'partial-failed',
  FAILED: 'failed',
});

const EXECUTION_APPROVAL_DECISION = 'start-first-attempt';
const EXECUTION_APPROVAL_ACKNOWLEDGEMENT =
  'execute-exact-readonly-specialist-batch-once';
const MAX_BATCH_DEADLINE_MS = 300000;
const MAX_RATIONALE_LENGTH = 500;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;

const EXECUTION_APPROVAL_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);

const SPECIALIST_BATCH_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'currentAttemptId',
  'previewId',
  'previewDigest',
  'sourceDigest',
  'executionApproval',
  'executionApprovalDigest',
  'cellAttemptIds',
  'status',
  'maxConcurrentCells',
  'maxProviderCalls',
  'batchDeadlineMs',
  'deadlineAt',
  'startedAt',
  'completedAt',
  'recordDigest',
]);

const CREATE_INPUT_KEYS = Object.freeze([
  'id',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'currentAttemptId',
  'previewId',
  'previewDigest',
  'sourceDigest',
  'executionApproval',
  'cellAttemptIds',
  'batchDeadlineMs',
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

function normalizeText(value, label, { nullable = false, maxLength = 1024 } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const normalized = value.trim();
  if (/[\x00-\x1F\x7F]/.test(normalized) || normalized.length > maxLength) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeIdentifier(value, label) {
  const normalized = normalizeText(value, label);
  if (!IDENTIFIER_PATTERN.test(normalized)) throw new Error(`${label} is invalid`);
  return normalized;
}

function normalizeDigest(value, label) {
  const normalized = normalizeText(value, label, { maxLength: 64 });
  if (!SHA256_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a lowercase SHA-256 digest`);
  }
  return normalized;
}

function normalizeTimestamp(value, label) {
  const normalized = normalizeText(value, label);
  if (
    Number.isNaN(Date.parse(normalized)) ||
    new Date(normalized).toISOString() !== normalized
  ) {
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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeExecutionApproval(value, { evaluatedAt, now } = {}) {
  assertExactKeys(value, EXECUTION_APPROVAL_KEYS, 'executionApproval');
  if (value.decision !== EXECUTION_APPROVAL_DECISION) {
    throw new Error(`executionApproval.decision must be ${EXECUTION_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== EXECUTION_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `executionApproval.acknowledgement must be ${EXECUTION_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const rationale = normalizeText(value.rationale, 'executionApproval.rationale', {
    maxLength: MAX_RATIONALE_LENGTH,
  });
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(rationale))) {
    throw new Error('executionApproval.rationale contains an obvious credential marker');
  }
  const reviewedAt = normalizeTimestamp(value.reviewedAt, 'executionApproval.reviewedAt');
  if (evaluatedAt !== undefined && Date.parse(reviewedAt) < Date.parse(normalizeTimestamp(evaluatedAt, 'evaluatedAt'))) {
    throw new Error('executionApproval.reviewedAt must not precede evaluatedAt');
  }
  if (now !== undefined && Date.parse(reviewedAt) > Date.parse(normalizeTimestamp(now, 'now')) + 5 * 60 * 1000) {
    throw new Error('executionApproval.reviewedAt is too far in the future');
  }
  return {
    decision: EXECUTION_APPROVAL_DECISION,
    acknowledgement: EXECUTION_APPROVAL_ACKNOWLEDGEMENT,
    rationale,
    reviewedAt,
  };
}

function computeExecutionApprovalDigest(approval) {
  return digestCanonical(normalizeExecutionApproval(approval));
}

function normalizeCellAttemptIds(value) {
  if (!Array.isArray(value) || value.length !== 2) {
    throw new Error('SpecialistBatch cellAttemptIds must contain exactly two ids');
  }
  const ids = value.map((id, index) => normalizeIdentifier(id, `cellAttemptIds[${index}]`));
  if (new Set(ids).size !== ids.length) {
    throw new Error('SpecialistBatch cellAttemptIds must not contain duplicates');
  }
  return ids;
}

function normalizeBatchDeadlineMs(value) {
  if (!Number.isInteger(value) || value < 1 || value > MAX_BATCH_DEADLINE_MS) {
    throw new Error(`batchDeadlineMs must be an integer from 1 through ${MAX_BATCH_DEADLINE_MS}`);
  }
  return value;
}

function deriveBatchDeadlineAt(startedAt, batchDeadlineMs) {
  const started = normalizeTimestamp(startedAt, 'startedAt');
  return new Date(Date.parse(started) + normalizeBatchDeadlineMs(batchDeadlineMs)).toISOString();
}

function computeSpecialistBatchRecordDigest(record) {
  if (!isPlainRecord(record)) throw new Error('SpecialistBatch record must be an object');
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createSpecialistBatch(input, options = {}) {
  assertExactKeys(input, CREATE_INPUT_KEYS, 'SpecialistBatch create input');
  const startedAt = normalizeTimestamp(input.startedAt, 'SpecialistBatch startedAt');
  const executionApproval = normalizeExecutionApproval(input.executionApproval, {
    evaluatedAt: options.evaluatedAt,
    now: options.now,
  });
  const id = normalizeIdentifier(input.id, 'SpecialistBatch id');
  if (!/^specialist-batch-\d{4}$/.test(id)) {
    throw new Error('SpecialistBatch id must use the specialist-batch-0000 format');
  }
  const batchDeadlineMs = normalizeBatchDeadlineMs(input.batchDeadlineMs);
  const record = {
    id,
    persisted: true,
    projectId: normalizeIdentifier(input.projectId, 'SpecialistBatch projectId'),
    missionId: normalizeIdentifier(input.missionId, 'SpecialistBatch missionId'),
    staffingPlanId: normalizeIdentifier(input.staffingPlanId, 'SpecialistBatch staffingPlanId'),
    staffingEntryId: normalizeIdentifier(input.staffingEntryId, 'SpecialistBatch staffingEntryId'),
    councilSessionId: normalizeIdentifier(input.councilSessionId, 'SpecialistBatch councilSessionId'),
    currentAttemptId: normalizeIdentifier(input.currentAttemptId, 'SpecialistBatch currentAttemptId'),
    previewId: normalizeIdentifier(input.previewId, 'SpecialistBatch previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'SpecialistBatch previewDigest'),
    sourceDigest: normalizeDigest(input.sourceDigest, 'SpecialistBatch sourceDigest'),
    executionApproval,
    executionApprovalDigest: computeExecutionApprovalDigest(executionApproval),
    cellAttemptIds: normalizeCellAttemptIds(input.cellAttemptIds),
    status: SPECIALIST_BATCH_STATUS.ACTIVE,
    maxConcurrentCells: 2,
    maxProviderCalls: 0,
    batchDeadlineMs,
    deadlineAt: deriveBatchDeadlineAt(startedAt, batchDeadlineMs),
    startedAt,
    completedAt: null,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeSpecialistBatchRecordDigest(record),
  });
}

function deriveSpecialistBatchStatus(cellAttempts) {
  if (!Array.isArray(cellAttempts) || cellAttempts.length !== 2) {
    throw new Error('SpecialistBatch requires exactly two cell attempts');
  }
  const statuses = cellAttempts.map((attempt) => attempt?.status);
  if (statuses.some((status) => status === 'active')) {
    return { status: SPECIALIST_BATCH_STATUS.ACTIVE, completedAt: null };
  }
  if (!statuses.every((status) => status === 'completed' || status === 'failed')) {
    throw new Error('SpecialistBatch cell attempt status is invalid');
  }
  const completed = statuses.filter((status) => status === 'completed').length;
  const completedAt = cellAttempts
    .map((attempt) => normalizeTimestamp(attempt.completedAt, 'SpecialistCellAttempt completedAt'))
    .sort()
    .at(-1);
  return {
    status: completed === 2
      ? SPECIALIST_BATCH_STATUS.COMPLETED
      : completed === 1
        ? SPECIALIST_BATCH_STATUS.PARTIAL_FAILED
        : SPECIALIST_BATCH_STATUS.FAILED,
    completedAt,
  };
}

function transitionSpecialistBatch(record, cellAttempts) {
  assertSpecialistBatchRecord(record);
  if (record.status !== SPECIALIST_BATCH_STATUS.ACTIVE) {
    throw new Error(`SpecialistBatch ${record.id} is not active`);
  }
  if (
    cellAttempts.map((attempt) => attempt.id).join('\n') !== record.cellAttemptIds.join('\n') ||
    cellAttempts.some((attempt) => attempt.specialistBatchId !== record.id)
  ) {
    throw new Error('SpecialistBatch cell attempts do not match the batch');
  }
  for (const attempt of cellAttempts) {
    assertSpecialistCellAttemptRecord(attempt, { batchDeadlineAt: record.deadlineAt });
    if (
      attempt.sourceDigest !== record.sourceDigest ||
      attempt.startedAt !== record.startedAt
    ) {
      throw new Error('SpecialistBatch cell attempt evidence is stale');
    }
  }
  const derived = deriveSpecialistBatchStatus(cellAttempts);
  const next = { ...record, ...derived };
  delete next.recordDigest;
  return deepFreeze({
    ...next,
    recordDigest: computeSpecialistBatchRecordDigest(next),
  });
}

function assertSpecialistBatchRecord(record) {
  assertExactKeys(record, SPECIALIST_BATCH_RECORD_KEYS, 'SpecialistBatch record');
  if (record.persisted !== true || record.maxConcurrentCells !== 2 || record.maxProviderCalls !== 0) {
    throw new Error('SpecialistBatch persistence or execution bounds are invalid');
  }
  const reconstructed = createSpecialistBatch({
    id: record.id,
    projectId: record.projectId,
    missionId: record.missionId,
    staffingPlanId: record.staffingPlanId,
    staffingEntryId: record.staffingEntryId,
    councilSessionId: record.councilSessionId,
    currentAttemptId: record.currentAttemptId,
    previewId: record.previewId,
    previewDigest: record.previewDigest,
    sourceDigest: record.sourceDigest,
    executionApproval: record.executionApproval,
    cellAttemptIds: record.cellAttemptIds,
    batchDeadlineMs: record.batchDeadlineMs,
    startedAt: record.startedAt,
  });
  if (
    record.executionApprovalDigest !== reconstructed.executionApprovalDigest ||
    JSON.stringify(record.executionApproval) !== JSON.stringify(reconstructed.executionApproval) ||
    record.deadlineAt !== reconstructed.deadlineAt
  ) {
    throw new Error('SpecialistBatch approval or deadline evidence is invalid');
  }
  if (!Object.values(SPECIALIST_BATCH_STATUS).includes(record.status)) {
    throw new Error('SpecialistBatch status is invalid');
  }
  if (record.status === SPECIALIST_BATCH_STATUS.ACTIVE) {
    if (record.completedAt !== null) throw new Error('Active SpecialistBatch must not be completed');
  } else {
    const completedAt = normalizeTimestamp(record.completedAt, 'SpecialistBatch completedAt');
    if (Date.parse(completedAt) < Date.parse(record.startedAt)) {
      throw new Error('SpecialistBatch completedAt precedes startedAt');
    }
  }
  if (computeSpecialistBatchRecordDigest(record) !== record.recordDigest) {
    throw new Error('SpecialistBatch recordDigest does not match its payload');
  }
  return record;
}

module.exports = {
  EXECUTION_APPROVAL_ACKNOWLEDGEMENT,
  EXECUTION_APPROVAL_DECISION,
  EXECUTION_APPROVAL_KEYS,
  MAX_BATCH_DEADLINE_MS,
  SPECIALIST_BATCH_RECORD_KEYS,
  SPECIALIST_BATCH_STATUS,
  assertExactKeys,
  assertSpecialistBatchRecord,
  canonicalize,
  computeExecutionApprovalDigest,
  computeSpecialistBatchRecordDigest,
  createSpecialistBatch,
  deepFreeze,
  deriveBatchDeadlineAt,
  deriveSpecialistBatchStatus,
  digestCanonical,
  normalizeDigest,
  normalizeExecutionApproval,
  normalizeIdentifier,
  normalizeTimestamp,
  transitionSpecialistBatch,
};
