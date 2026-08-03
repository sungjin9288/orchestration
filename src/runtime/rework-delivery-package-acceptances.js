'use strict';

const {
  deepFreeze,
  digestCanonical,
} = require('./rework-delivery-package-preview');

const ACCEPTANCE_REQUEST_DECISION = 'accept';
const ACCEPTANCE_RECORD_DECISION = 'accepted';
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_IDENTIFIER_LENGTH = 256;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

const REWORK_DELIVERY_PACKAGE_ACCEPTANCE_REQUEST_KEYS = Object.freeze([
  'reworkPlanId',
  'qaWorkOrderAttemptId',
  'qaWorkOrderAttemptRecordDigest',
  'qaRunId',
  'qaEvidenceArtifactId',
  'deliveryReadyCheckpointId',
  'checkpointDigest',
  'sourceDigest',
  'qaInputDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'reworkDeliveryEvidenceDigest',
  'reworkDeliveryPackageRecordDigest',
  'decision',
]);

const REWORK_DELIVERY_PACKAGE_ACCEPTANCE_RECORD_KEYS = Object.freeze([
  'id',
  'projectId',
  'missionId',
  'executionPlanId',
  'reworkPlanId',
  'reworkDeliveryPackageId',
  'previewId',
  'previewDigest',
  'sourceDigest',
  'reworkDeliveryEvidenceDigest',
  'reworkDeliveryPackageRecordDigest',
  'decision',
  'authoritySummary',
  'acceptanceDigest',
  'createdAt',
]);

const REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_SUMMARY = Object.freeze({
  packageAcceptanceEvidenceAllowed: true,
  packageMutationAllowed: false,
  packageRejectionAllowed: false,
  packageChangesRequestedAllowed: false,
  missionCloseOutAllowed: false,
  taskCloseOutAllowed: false,
  retryAllowed: false,
  recoveryAllowed: false,
  executionAllowed: false,
  providerCallAllowed: false,
  sourceMutationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  memoryApplicationAllowed: false,
  learningAllowed: false,
  schedulingAllowed: false,
  policyMutationAllowed: false,
  collectionAllowed: false,
  approvalBypassAllowed: false,
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
    value.length > MAX_IDENTIFIER_LENGTH ||
    value !== value.trim() ||
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

function normalizeReworkDeliveryPackageAcceptanceRequest(input, options = {}) {
  assertExactKeys(
    input,
    REWORK_DELIVERY_PACKAGE_ACCEPTANCE_REQUEST_KEYS,
    'ReworkDeliveryPackageAcceptance request',
  );
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
    409,
  );
  if (Date.parse(evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('evaluatedAt is outside the allowed window');
  }
  if (input.decision !== ACCEPTANCE_REQUEST_DECISION) {
    throw errorWithStatus('decision must be accept');
  }
  return deepFreeze({
    reworkPlanId: normalizeIdentifier(input.reworkPlanId, 'reworkPlanId'),
    qaWorkOrderAttemptId: normalizeIdentifier(
      input.qaWorkOrderAttemptId,
      'qaWorkOrderAttemptId',
    ),
    qaWorkOrderAttemptRecordDigest: normalizeDigest(
      input.qaWorkOrderAttemptRecordDigest,
      'qaWorkOrderAttemptRecordDigest',
    ),
    qaRunId: normalizeIdentifier(input.qaRunId, 'qaRunId'),
    qaEvidenceArtifactId: normalizeIdentifier(
      input.qaEvidenceArtifactId,
      'qaEvidenceArtifactId',
    ),
    deliveryReadyCheckpointId: normalizeIdentifier(
      input.deliveryReadyCheckpointId,
      'deliveryReadyCheckpointId',
    ),
    checkpointDigest: normalizeDigest(input.checkpointDigest, 'checkpointDigest'),
    sourceDigest: normalizeDigest(input.sourceDigest, 'sourceDigest'),
    qaInputDigest: normalizeDigest(input.qaInputDigest, 'qaInputDigest'),
    evaluatedAt,
    previewId: normalizeIdentifier(input.previewId, 'previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'previewDigest'),
    reworkDeliveryEvidenceDigest: normalizeDigest(
      input.reworkDeliveryEvidenceDigest,
      'reworkDeliveryEvidenceDigest',
    ),
    reworkDeliveryPackageRecordDigest: normalizeDigest(
      input.reworkDeliveryPackageRecordDigest,
      'reworkDeliveryPackageRecordDigest',
    ),
    decision: ACCEPTANCE_REQUEST_DECISION,
  });
}

function immutableAcceptancePayload(record) {
  const {
    id: _id,
    createdAt: _createdAt,
    acceptanceDigest: _acceptanceDigest,
    ...payload
  } = record;
  return payload;
}

function computeReworkDeliveryPackageAcceptanceDigest(record) {
  return digestCanonical(immutableAcceptancePayload(record));
}

function createReworkDeliveryPackageAcceptance(input) {
  assertExactKeys(
    input,
    ['id', 'reworkDeliveryPackage', 'createdAt'],
    'ReworkDeliveryPackageAcceptance input',
  );
  const source = input.reworkDeliveryPackage;
  const record = {
    id: normalizeIdentifier(input.id, 'id'),
    projectId: source.projectId,
    missionId: source.missionId,
    executionPlanId: source.executionPlanId,
    reworkPlanId: source.reworkPlanId,
    reworkDeliveryPackageId: source.id,
    previewId: source.previewId,
    previewDigest: source.previewDigest,
    sourceDigest: source.sourceDigest,
    reworkDeliveryEvidenceDigest: source.reworkDeliveryEvidenceDigest,
    reworkDeliveryPackageRecordDigest: source.recordDigest,
    decision: ACCEPTANCE_RECORD_DECISION,
    authoritySummary: {
      ...REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_SUMMARY,
    },
    createdAt: normalizeTimestamp(input.createdAt, 'createdAt'),
  };
  record.acceptanceDigest =
    computeReworkDeliveryPackageAcceptanceDigest(record);
  assertReworkDeliveryPackageAcceptanceRecord(record);
  return deepFreeze(record);
}

function assertReworkDeliveryPackageAcceptanceRecord(record) {
  assertExactKeys(
    record,
    REWORK_DELIVERY_PACKAGE_ACCEPTANCE_RECORD_KEYS,
    'ReworkDeliveryPackageAcceptance record',
    409,
  );
  for (const field of [
    'id',
    'projectId',
    'missionId',
    'executionPlanId',
    'reworkPlanId',
    'reworkDeliveryPackageId',
    'previewId',
  ]) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of [
    'previewDigest',
    'sourceDigest',
    'reworkDeliveryEvidenceDigest',
    'reworkDeliveryPackageRecordDigest',
    'acceptanceDigest',
  ]) {
    normalizeDigest(record[field], field, 409);
  }
  normalizeTimestamp(record.createdAt, 'createdAt', 409);
  if (record.decision !== ACCEPTANCE_RECORD_DECISION) {
    throw errorWithStatus('ReworkDeliveryPackageAcceptance decision is invalid', 409);
  }
  assertExactKeys(
    record.authoritySummary,
    Object.keys(REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_SUMMARY),
    'ReworkDeliveryPackageAcceptance authoritySummary',
    409,
  );
  if (
    JSON.stringify(record.authoritySummary) !==
      JSON.stringify(REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_SUMMARY) ||
    computeReworkDeliveryPackageAcceptanceDigest(record) !==
      record.acceptanceDigest
  ) {
    throw errorWithStatus(
      'ReworkDeliveryPackageAcceptance immutable evidence is invalid',
      409,
    );
  }
  return record;
}

function isExactReworkDeliveryPackageAcceptanceReplay(
  acceptance,
  source,
  request,
) {
  return (
    acceptance.reworkDeliveryPackageId === source.id &&
    acceptance.reworkPlanId === request.reworkPlanId &&
    acceptance.previewId === request.previewId &&
    acceptance.previewDigest === request.previewDigest &&
    acceptance.sourceDigest === request.sourceDigest &&
    acceptance.reworkDeliveryEvidenceDigest ===
      request.reworkDeliveryEvidenceDigest &&
    acceptance.reworkDeliveryPackageRecordDigest ===
      request.reworkDeliveryPackageRecordDigest &&
    source.qaWorkOrderAttemptId === request.qaWorkOrderAttemptId &&
    source.qaRunId === request.qaRunId &&
    source.qaEvidenceArtifactId === request.qaEvidenceArtifactId &&
    source.terminalCheckpointId === request.deliveryReadyCheckpointId &&
    source.terminalCheckpointDigest === request.checkpointDigest &&
    source.qaInputDigest === request.qaInputDigest &&
    source.previewEvaluatedAt === request.evaluatedAt &&
    request.decision === ACCEPTANCE_REQUEST_DECISION
  );
}

module.exports = {
  ACCEPTANCE_RECORD_DECISION,
  ACCEPTANCE_REQUEST_DECISION,
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_AUTHORITY_SUMMARY,
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_RECORD_KEYS,
  REWORK_DELIVERY_PACKAGE_ACCEPTANCE_REQUEST_KEYS,
  assertReworkDeliveryPackageAcceptanceRecord,
  computeReworkDeliveryPackageAcceptanceDigest,
  createReworkDeliveryPackageAcceptance,
  isExactReworkDeliveryPackageAcceptanceReplay,
  normalizeReworkDeliveryPackageAcceptanceRequest,
};
