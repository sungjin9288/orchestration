'use strict';

const {
  OPS_SUPERVISION_TARGET_TYPE,
  deepFreeze,
  digestCanonical,
} = require('./ops-supervision-preview');

const OPS_ATTEMPT_DISPOSITION_DECISION = 'quarantine';
const OPS_ATTEMPT_DISPOSITION_REASON_CODE =
  'operator-uncertain-outcome-after-interruption';
const OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT =
  'quarantine-without-settlement-or-recovery';
const MAX_IDENTIFIER_LENGTH = 256;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

const OPS_ATTEMPT_DISPOSITION_REQUEST_KEYS = Object.freeze([
  'targetType',
  'targetId',
  'parentId',
  'expectedTargetRecordDigest',
  'expectedParentDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'decision',
  'reasonCode',
  'acknowledgement',
]);

const OPS_ATTEMPT_DISPOSITION_RECORD_KEYS = Object.freeze([
  'id',
  'projectId',
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
  'previewId',
  'previewDigest',
  'decision',
  'reasonCode',
  'authoritySummary',
  'recordDigest',
  'createdAt',
]);

const OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY = Object.freeze({
  quarantineEvidenceAllowed: true,
  lateSettlementAllowed: false,
  attemptMutationAllowed: false,
  parentMutationAllowed: false,
  inferredResultAllowed: false,
  cancelAllowed: false,
  workerTerminationAllowed: false,
  resumeAllowed: false,
  replayAllowed: false,
  retryAllowed: false,
  reworkAllowed: false,
  newAttemptAllowed: false,
  automaticSelectionAllowed: false,
  backgroundSchedulingAllowed: false,
  providerExecutionAllowed: false,
  resultApplicationAllowed: false,
  sourceMutationAllowed: false,
  memoryApplicationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  policyMutationAllowed: false,
  approvalBypassAllowed: false,
  collectionAllowed: false,
  connectorCallAllowed: false,
});

function errorWithStatus(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function assertExactKeys(value, expectedKeys, label, statusCode = 400) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
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
    value.length > MAX_IDENTIFIER_LENGTH ||
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

function normalizeTimestamp(value, label, statusCode = 400, options = {}) {
  if (options.nullable && value === null) return null;
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, statusCode);
  }
  return value;
}

function normalizeOpsAttemptDispositionRequest(input) {
  assertExactKeys(
    input,
    OPS_ATTEMPT_DISPOSITION_REQUEST_KEYS,
    'OpsAttemptDisposition request',
  );
  if (!Object.values(OPS_SUPERVISION_TARGET_TYPE).includes(input.targetType)) {
    throw errorWithStatus('OpsAttemptDisposition targetType is unsupported');
  }
  if (input.decision !== OPS_ATTEMPT_DISPOSITION_DECISION) {
    throw errorWithStatus('decision must be quarantine');
  }
  if (input.reasonCode !== OPS_ATTEMPT_DISPOSITION_REASON_CODE) {
    throw errorWithStatus(
      `reasonCode must be ${OPS_ATTEMPT_DISPOSITION_REASON_CODE}`,
    );
  }
  if (input.acknowledgement !== OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT) {
    throw errorWithStatus(
      `acknowledgement must be ${OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT}`,
    );
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
    previewId: normalizeIdentifier(input.previewId, 'previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'previewDigest'),
    decision: OPS_ATTEMPT_DISPOSITION_DECISION,
    reasonCode: OPS_ATTEMPT_DISPOSITION_REASON_CODE,
    acknowledgement: OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  });
}

function immutableDispositionPayload(record) {
  const {
    id: _id,
    createdAt: _createdAt,
    recordDigest: _recordDigest,
    ...payload
  } = record;
  return payload;
}

function computeOpsAttemptDispositionRecordDigest(record) {
  return digestCanonical(immutableDispositionPayload(record));
}

function createOpsAttemptDisposition(input) {
  assertExactKeys(
    input,
    ['id', 'projectId', 'preview', 'createdAt'],
    'OpsAttemptDisposition input',
  );
  const preview = input.preview;
  const createdAt = normalizeTimestamp(input.createdAt, 'createdAt');
  const record = {
    id: normalizeIdentifier(input.id, 'id'),
    projectId: normalizeIdentifier(input.projectId, 'projectId'),
    targetType: preview.targetType,
    targetId: preview.targetId,
    parentId: preview.parentId,
    targetRecordDigest: preview.targetRecordDigest,
    parentDigest: preview.parentDigest,
    sourceDigest: preview.sourceDigest,
    attemptNumber: preview.attemptNumber,
    role: preview.role,
    startedAt: preview.startedAt,
    deadlineAt: preview.deadlineAt,
    evaluatedAt: preview.evaluatedAt,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    decision: OPS_ATTEMPT_DISPOSITION_DECISION,
    reasonCode: OPS_ATTEMPT_DISPOSITION_REASON_CODE,
    authoritySummary: { ...OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY },
  };
  record.recordDigest = computeOpsAttemptDispositionRecordDigest(record);
  record.createdAt = createdAt;
  assertOpsAttemptDispositionRecord(record);
  return deepFreeze(record);
}

function assertOpsAttemptDispositionRecord(record) {
  assertExactKeys(
    record,
    OPS_ATTEMPT_DISPOSITION_RECORD_KEYS,
    'OpsAttemptDisposition record',
    409,
  );
  for (const field of [
    'id',
    'projectId',
    'targetId',
    'parentId',
    'role',
    'previewId',
  ]) {
    normalizeIdentifier(record[field], field, 409);
  }
  if (!Object.values(OPS_SUPERVISION_TARGET_TYPE).includes(record.targetType)) {
    throw errorWithStatus('OpsAttemptDisposition targetType is invalid', 409);
  }
  for (const field of [
    'targetRecordDigest',
    'parentDigest',
    'sourceDigest',
    'previewDigest',
    'recordDigest',
  ]) {
    normalizeDigest(record[field], field, 409);
  }
  for (const field of ['startedAt', 'evaluatedAt', 'createdAt']) {
    normalizeTimestamp(record[field], field, 409);
  }
  normalizeTimestamp(record.deadlineAt, 'deadlineAt', 409, { nullable: true });
  if (
    !Number.isInteger(record.attemptNumber) ||
    record.attemptNumber < 1 ||
    record.attemptNumber > 1000
  ) {
    throw errorWithStatus('OpsAttemptDisposition attemptNumber is invalid', 409);
  }
  if (
    record.decision !== OPS_ATTEMPT_DISPOSITION_DECISION ||
    record.reasonCode !== OPS_ATTEMPT_DISPOSITION_REASON_CODE
  ) {
    throw errorWithStatus('OpsAttemptDisposition fixed decision is invalid', 409);
  }
  assertExactKeys(
    record.authoritySummary,
    Object.keys(OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY),
    'OpsAttemptDisposition authoritySummary',
    409,
  );
  if (
    JSON.stringify(record.authoritySummary) !==
      JSON.stringify(OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY) ||
    computeOpsAttemptDispositionRecordDigest(record) !== record.recordDigest
  ) {
    throw errorWithStatus('OpsAttemptDisposition immutable evidence is invalid', 409);
  }
  return record;
}

function isExactOpsAttemptDispositionReplay(disposition, request) {
  return (
    disposition.targetType === request.targetType &&
    disposition.targetId === request.targetId &&
    disposition.parentId === request.parentId &&
    disposition.targetRecordDigest === request.expectedTargetRecordDigest &&
    disposition.parentDigest === request.expectedParentDigest &&
    disposition.evaluatedAt === request.evaluatedAt &&
    disposition.previewId === request.previewId &&
    disposition.previewDigest === request.previewDigest &&
    disposition.decision === request.decision &&
    disposition.reasonCode === request.reasonCode
  );
}

module.exports = {
  OPS_ATTEMPT_DISPOSITION_ACKNOWLEDGEMENT,
  OPS_ATTEMPT_DISPOSITION_AUTHORITY_SUMMARY,
  OPS_ATTEMPT_DISPOSITION_DECISION,
  OPS_ATTEMPT_DISPOSITION_REASON_CODE,
  OPS_ATTEMPT_DISPOSITION_RECORD_KEYS,
  OPS_ATTEMPT_DISPOSITION_REQUEST_KEYS,
  assertOpsAttemptDispositionRecord,
  computeOpsAttemptDispositionRecordDigest,
  createOpsAttemptDisposition,
  isExactOpsAttemptDispositionReplay,
  normalizeOpsAttemptDispositionRequest,
};
