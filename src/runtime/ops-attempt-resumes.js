'use strict';

const crypto = require('crypto');

const OPS_ATTEMPT_RESUME_ACTION = 'resume-qa';
const OPS_ATTEMPT_RESUME_DECISION = 'resume-safe-checkpoint';
const OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT =
  'source-worker-stopped-and-read-only-qa-confirmed';
const OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER = 2;

const OPS_ATTEMPT_RESUME_REQUEST_KEYS = Object.freeze([
  'dispositionRecordDigest',
  'sourceAttemptId',
  'sourceAttemptRecordDigest',
  'executionPlanId',
  'expectedExecutionPlanDigest',
  'checkpointId',
  'checkpointDigest',
  'inputDigest',
  'authorityDigest',
  'expectedWorkOrderId',
  'action',
  'evaluatedAt',
  'sourceWorkerStopConfirmedAt',
  'decision',
  'acknowledgement',
  'expectedReplacementAttemptNumber',
]);

const OPS_ATTEMPT_RESUME_RECORD_KEYS = Object.freeze([
  'id',
  'projectId',
  'executionPlanId',
  'workOrderId',
  'sourceDispositionId',
  'sourceDispositionRecordDigest',
  'sourceAttemptId',
  'sourceAttemptRecordDigest',
  'sourceCheckpointId',
  'sourceCheckpointDigest',
  'sourceInputDigest',
  'sourceAuthorityDigest',
  'replacementAttemptId',
  'replacementAttemptStartDigest',
  'action',
  'role',
  'sourceWorkerStopConfirmedAt',
  'evaluatedAt',
  'decision',
  'authoritySummary',
  'recordDigest',
  'createdAt',
]);

const OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY = Object.freeze({
  replacementQaAttemptAllowed: true,
  sourceAttemptSettlementAllowed: false,
  sourceAttemptMutationAllowed: false,
  sourceMutationAllowed: false,
  retryAllowed: false,
  builderResumeAllowed: false,
  reviewerResumeAllowed: false,
  specialistResumeAllowed: false,
  cancelAllowed: false,
  workerTerminationAllowed: false,
  secondResumeAllowed: false,
  automaticSelectionAllowed: false,
  backgroundSchedulingAllowed: false,
  providerExecutionAllowed: false,
  packageCloseOutAllowed: false,
  missionCloseOutAllowed: false,
  taskCloseOutAllowed: false,
  memoryApplicationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  policyMutationAllowed: false,
  approvalBypassAllowed: false,
  collectionAllowed: false,
  connectorCallAllowed: false,
});

const CREATE_INPUT_KEYS = Object.freeze([
  'id',
  'projectId',
  'executionPlanId',
  'workOrderId',
  'sourceDispositionId',
  'sourceDispositionRecordDigest',
  'sourceAttemptId',
  'sourceAttemptRecordDigest',
  'sourceCheckpointId',
  'sourceCheckpointDigest',
  'sourceInputDigest',
  'sourceAuthorityDigest',
  'replacementAttemptId',
  'replacementAttemptStartDigest',
  'sourceWorkerStopConfirmedAt',
  'evaluatedAt',
  'createdAt',
]);

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const MAX_IDENTIFIER_LENGTH = 256;

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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
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

function normalizeOpsAttemptResumeRequest(input) {
  assertExactKeys(input, OPS_ATTEMPT_RESUME_REQUEST_KEYS, 'OpsAttemptResume request');
  if (input.action !== OPS_ATTEMPT_RESUME_ACTION) {
    throw errorWithStatus(`action must be ${OPS_ATTEMPT_RESUME_ACTION}`);
  }
  if (input.decision !== OPS_ATTEMPT_RESUME_DECISION) {
    throw errorWithStatus(`decision must be ${OPS_ATTEMPT_RESUME_DECISION}`);
  }
  if (input.acknowledgement !== OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT) {
    throw errorWithStatus(
      `acknowledgement must be ${OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT}`,
    );
  }
  if (
    input.expectedReplacementAttemptNumber !==
    OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER
  ) {
    throw errorWithStatus('expectedReplacementAttemptNumber must be 2');
  }
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  const sourceWorkerStopConfirmedAt = normalizeTimestamp(
    input.sourceWorkerStopConfirmedAt,
    'sourceWorkerStopConfirmedAt',
  );
  if (Date.parse(sourceWorkerStopConfirmedAt) > Date.parse(evaluatedAt)) {
    throw errorWithStatus('sourceWorkerStopConfirmedAt must not follow evaluatedAt');
  }
  return deepFreeze({
    dispositionRecordDigest: normalizeDigest(
      input.dispositionRecordDigest,
      'dispositionRecordDigest',
    ),
    sourceAttemptId: normalizeIdentifier(input.sourceAttemptId, 'sourceAttemptId'),
    sourceAttemptRecordDigest: normalizeDigest(
      input.sourceAttemptRecordDigest,
      'sourceAttemptRecordDigest',
    ),
    executionPlanId: normalizeIdentifier(input.executionPlanId, 'executionPlanId'),
    expectedExecutionPlanDigest: normalizeDigest(
      input.expectedExecutionPlanDigest,
      'expectedExecutionPlanDigest',
    ),
    checkpointId: normalizeIdentifier(input.checkpointId, 'checkpointId'),
    checkpointDigest: normalizeDigest(input.checkpointDigest, 'checkpointDigest'),
    inputDigest: normalizeDigest(input.inputDigest, 'inputDigest'),
    authorityDigest: normalizeDigest(input.authorityDigest, 'authorityDigest'),
    expectedWorkOrderId: normalizeIdentifier(
      input.expectedWorkOrderId,
      'expectedWorkOrderId',
    ),
    action: OPS_ATTEMPT_RESUME_ACTION,
    evaluatedAt,
    sourceWorkerStopConfirmedAt,
    decision: OPS_ATTEMPT_RESUME_DECISION,
    acknowledgement: OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT,
    expectedReplacementAttemptNumber:
      OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER,
  });
}

function immutableResumePayload(record) {
  const {
    id: _id,
    createdAt: _createdAt,
    recordDigest: _recordDigest,
    ...payload
  } = record;
  return payload;
}

function computeOpsAttemptResumeRecordDigest(record) {
  return digestCanonical(immutableResumePayload(record));
}

function createOpsAttemptResume(input) {
  assertExactKeys(input, CREATE_INPUT_KEYS, 'OpsAttemptResume input');
  const record = {
    id: normalizeIdentifier(input.id, 'id'),
    projectId: normalizeIdentifier(input.projectId, 'projectId'),
    executionPlanId: normalizeIdentifier(input.executionPlanId, 'executionPlanId'),
    workOrderId: normalizeIdentifier(input.workOrderId, 'workOrderId'),
    sourceDispositionId: normalizeIdentifier(
      input.sourceDispositionId,
      'sourceDispositionId',
    ),
    sourceDispositionRecordDigest: normalizeDigest(
      input.sourceDispositionRecordDigest,
      'sourceDispositionRecordDigest',
    ),
    sourceAttemptId: normalizeIdentifier(input.sourceAttemptId, 'sourceAttemptId'),
    sourceAttemptRecordDigest: normalizeDigest(
      input.sourceAttemptRecordDigest,
      'sourceAttemptRecordDigest',
    ),
    sourceCheckpointId: normalizeIdentifier(
      input.sourceCheckpointId,
      'sourceCheckpointId',
    ),
    sourceCheckpointDigest: normalizeDigest(
      input.sourceCheckpointDigest,
      'sourceCheckpointDigest',
    ),
    sourceInputDigest: normalizeDigest(input.sourceInputDigest, 'sourceInputDigest'),
    sourceAuthorityDigest: normalizeDigest(
      input.sourceAuthorityDigest,
      'sourceAuthorityDigest',
    ),
    replacementAttemptId: normalizeIdentifier(
      input.replacementAttemptId,
      'replacementAttemptId',
    ),
    replacementAttemptStartDigest: normalizeDigest(
      input.replacementAttemptStartDigest,
      'replacementAttemptStartDigest',
    ),
    action: OPS_ATTEMPT_RESUME_ACTION,
    role: 'qa',
    sourceWorkerStopConfirmedAt: normalizeTimestamp(
      input.sourceWorkerStopConfirmedAt,
      'sourceWorkerStopConfirmedAt',
    ),
    evaluatedAt: normalizeTimestamp(input.evaluatedAt, 'evaluatedAt'),
    decision: OPS_ATTEMPT_RESUME_DECISION,
    authoritySummary: { ...OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY },
  };
  if (
    Date.parse(record.sourceWorkerStopConfirmedAt) > Date.parse(record.evaluatedAt)
  ) {
    throw errorWithStatus('sourceWorkerStopConfirmedAt must not follow evaluatedAt');
  }
  record.recordDigest = computeOpsAttemptResumeRecordDigest(record);
  record.createdAt = normalizeTimestamp(input.createdAt, 'createdAt');
  assertOpsAttemptResumeRecord(record);
  return deepFreeze(record);
}

function assertOpsAttemptResumeRecord(record) {
  assertExactKeys(record, OPS_ATTEMPT_RESUME_RECORD_KEYS, 'OpsAttemptResume record', 409);
  for (const field of [
    'id',
    'projectId',
    'executionPlanId',
    'workOrderId',
    'sourceDispositionId',
    'sourceAttemptId',
    'sourceCheckpointId',
    'replacementAttemptId',
    'role',
  ]) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of [
    'sourceDispositionRecordDigest',
    'sourceAttemptRecordDigest',
    'sourceCheckpointDigest',
    'sourceInputDigest',
    'sourceAuthorityDigest',
    'replacementAttemptStartDigest',
    'recordDigest',
  ]) {
    normalizeDigest(record[field], field, 409);
  }
  for (const field of [
    'sourceWorkerStopConfirmedAt',
    'evaluatedAt',
    'createdAt',
  ]) {
    normalizeTimestamp(record[field], field, 409);
  }
  if (
    record.action !== OPS_ATTEMPT_RESUME_ACTION ||
    record.role !== 'qa' ||
    record.decision !== OPS_ATTEMPT_RESUME_DECISION ||
    Date.parse(record.sourceWorkerStopConfirmedAt) > Date.parse(record.evaluatedAt)
  ) {
    throw errorWithStatus('OpsAttemptResume fixed evidence is invalid', 409);
  }
  assertExactKeys(
    record.authoritySummary,
    Object.keys(OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY),
    'OpsAttemptResume authoritySummary',
    409,
  );
  if (
    JSON.stringify(record.authoritySummary) !==
      JSON.stringify(OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY) ||
    computeOpsAttemptResumeRecordDigest(record) !== record.recordDigest
  ) {
    throw errorWithStatus('OpsAttemptResume immutable evidence is invalid', 409);
  }
  return record;
}

function isExactOpsAttemptResumeReplay(record, request) {
  return (
    record.sourceDispositionRecordDigest === request.dispositionRecordDigest &&
    record.sourceAttemptId === request.sourceAttemptId &&
    record.sourceAttemptRecordDigest === request.sourceAttemptRecordDigest &&
    record.executionPlanId === request.executionPlanId &&
    record.sourceCheckpointId === request.checkpointId &&
    record.sourceCheckpointDigest === request.checkpointDigest &&
    record.sourceInputDigest === request.inputDigest &&
    record.sourceAuthorityDigest === request.authorityDigest &&
    record.workOrderId === request.expectedWorkOrderId &&
    record.action === request.action &&
    record.evaluatedAt === request.evaluatedAt &&
    record.sourceWorkerStopConfirmedAt === request.sourceWorkerStopConfirmedAt &&
    record.decision === request.decision
  );
}

module.exports = {
  OPS_ATTEMPT_RESUME_ACKNOWLEDGEMENT,
  OPS_ATTEMPT_RESUME_ACTION,
  OPS_ATTEMPT_RESUME_AUTHORITY_SUMMARY,
  OPS_ATTEMPT_RESUME_DECISION,
  OPS_ATTEMPT_RESUME_RECORD_KEYS,
  OPS_ATTEMPT_RESUME_REPLACEMENT_ATTEMPT_NUMBER,
  OPS_ATTEMPT_RESUME_REQUEST_KEYS,
  assertOpsAttemptResumeRecord,
  computeOpsAttemptResumeRecordDigest,
  createOpsAttemptResume,
  isExactOpsAttemptResumeReplay,
  normalizeOpsAttemptResumeRequest,
};
