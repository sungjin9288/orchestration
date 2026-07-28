'use strict';

const crypto = require('crypto');

const REWORK_PLAN_ACCEPTANCE_DECISION = 'accepted';
const REWORK_PLAN_ACCEPTANCE_REQUEST_DECISION = 'accept';
const REWORK_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT =
  'accept-exact-rework-plan-without-execution';
const MAX_RATIONALE_BYTES = 500;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const SENSITIVE_CONTENT_PATTERNS = Object.freeze([
  /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|api[_-]?key|access[_-]?token|refresh[_-]?token)\b/i,
  /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
  /(?:^|\s)[A-Z][A-Z0-9_]{1,63}=\S+/,
  /(?:^|\s)(?:\/(?:Users|home|private|tmp|var|etc|opt)\/|[A-Za-z]:\\)/,
  /\b(?:raw (?:artifact|body|command output|response)|prompt (?:body|content)|provider payload|transcript|stdout|stderr|chain[- ]of[- ]thought)\b/i,
  /```/,
]);

const REWORK_PLAN_ACCEPTANCE_REQUEST_KEYS = Object.freeze([
  'reworkPlanRecordDigest',
  'previewId',
  'previewDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'sourceProgressDigest',
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);

const REWORK_PLAN_ACCEPTANCE_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'decision',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'executionPlanId',
  'reworkPlanId',
  'reworkPlanRecordDigest',
  'previewId',
  'previewDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'nextAttemptNumber',
  'maxAdditionalBuilderAttempts',
  'acknowledgement',
  'rationale',
  'authoritySummary',
  'reviewedAt',
  'createdAt',
  'acceptanceDigest',
]);

const REWORK_PLAN_ACCEPTANCE_AUTHORITY_SUMMARY = Object.freeze({
  reworkAcceptanceEvidenceAllowed: true,
  reworkPlanMutationAllowed: false,
  builderWorkOrderAppendAllowed: false,
  builderAttemptAppendAllowed: false,
  retryAllowed: false,
  preflightAllowed: false,
  approvalCreationAllowed: false,
  approvalResolutionAllowed: false,
  sourceMutationAllowed: false,
  builderExecutionAllowed: false,
  reviewerExecutionAllowed: false,
  qaExecutionAllowed: false,
  schedulingAllowed: false,
  providerCallAllowed: false,
  memoryApplicationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  policyMutationAllowed: false,
  approvalBypassAllowed: false,
  connectorCallAllowed: false,
});

function errorWithStatus(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label, statusCode = 400) {
  if (!isPlainRecord(value)) throw errorWithStatus(`${label} must be an object`, statusCode);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw errorWithStatus(`${label} has unexpected or missing fields`, statusCode);
  }
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function digestCanonical(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function normalizeIdentifier(value, label, statusCode = 400) {
  if (typeof value !== 'string' || value !== value.trim() || !value || value.length > 256 || !IDENTIFIER_PATTERN.test(value)) {
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
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, statusCode);
  }
  return value;
}

function normalizeRationale(value, statusCode = 400) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus('rationale is required', statusCode);
  }
  const rationale = value.trim().replace(/\s+/g, ' ');
  if (CONTROL_CHARACTER_PATTERN.test(rationale) || Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES || SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))) {
    throw errorWithStatus('rationale contains invalid or sensitive content', statusCode);
  }
  return rationale;
}

function normalizeReworkPlanAcceptanceRequest(input, options = {}) {
  assertExactKeys(input, REWORK_PLAN_ACCEPTANCE_REQUEST_KEYS, 'ReworkPlanAcceptance request');
  const reviewedAt = normalizeTimestamp(input.reviewedAt, 'reviewedAt');
  const now = normalizeTimestamp(options.now || new Date().toISOString(), 'runtime now');
  if (Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('reviewedAt is outside the allowed window');
  }
  if (input.decision !== REWORK_PLAN_ACCEPTANCE_REQUEST_DECISION) {
    throw errorWithStatus('decision must be accept');
  }
  if (input.acknowledgement !== REWORK_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT) {
    throw errorWithStatus('acknowledgement is invalid');
  }
  return Object.freeze({
    reworkPlanRecordDigest: normalizeDigest(input.reworkPlanRecordDigest, 'reworkPlanRecordDigest'),
    previewId: normalizeIdentifier(input.previewId, 'previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'previewDigest'),
    sourceExecutionPlanDigest: normalizeDigest(input.sourceExecutionPlanDigest, 'sourceExecutionPlanDigest'),
    sourceAttemptRecordDigest: normalizeDigest(input.sourceAttemptRecordDigest, 'sourceAttemptRecordDigest'),
    sourceProgressDigest: normalizeDigest(input.sourceProgressDigest, 'sourceProgressDigest'),
    decision: REWORK_PLAN_ACCEPTANCE_REQUEST_DECISION,
    acknowledgement: REWORK_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT,
    rationale: normalizeRationale(input.rationale),
    reviewedAt,
  });
}

function computeReworkPlanAcceptanceDigest(record) {
  const { acceptanceDigest: _acceptanceDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createReworkPlanAcceptance(input) {
  const reworkPlan = input.reworkPlan;
  const request = input.request;
  const record = {
    id: normalizeIdentifier(input.id, 'id', 409),
    persisted: true,
    decision: REWORK_PLAN_ACCEPTANCE_DECISION,
    projectId: reworkPlan.projectId,
    missionId: reworkPlan.missionId,
    staffingPlanId: reworkPlan.staffingPlanId,
    staffingEntryId: reworkPlan.staffingEntryId,
    councilSessionId: reworkPlan.councilSessionId,
    executionPlanId: reworkPlan.executionPlanId,
    reworkPlanId: reworkPlan.id,
    reworkPlanRecordDigest: reworkPlan.recordDigest,
    previewId: reworkPlan.previewId,
    previewDigest: reworkPlan.previewDigest,
    sourceExecutionPlanDigest: reworkPlan.sourceExecutionPlanDigest,
    sourceAttemptRecordDigest: reworkPlan.sourceAttemptRecordDigest,
    reviewEvidenceDigest: reworkPlan.reviewEvidenceDigest,
    sourceProgressDigest: reworkPlan.sourceProgressDigest,
    nextAttemptNumber: reworkPlan.nextAttemptNumber,
    maxAdditionalBuilderAttempts: reworkPlan.maxAdditionalBuilderAttempts,
    acknowledgement: request.acknowledgement,
    rationale: request.rationale,
    authoritySummary: { ...REWORK_PLAN_ACCEPTANCE_AUTHORITY_SUMMARY },
    reviewedAt: request.reviewedAt,
    createdAt: request.reviewedAt,
  };
  record.acceptanceDigest = computeReworkPlanAcceptanceDigest(record);
  return deepFreeze(record);
}

function assertReworkPlanAcceptanceRecord(record) {
  assertExactKeys(record, REWORK_PLAN_ACCEPTANCE_RECORD_KEYS, 'ReworkPlanAcceptance record', 409);
  for (const field of ['id', 'projectId', 'missionId', 'staffingPlanId', 'staffingEntryId', 'councilSessionId', 'executionPlanId', 'reworkPlanId', 'previewId']) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of ['reworkPlanRecordDigest', 'previewDigest', 'sourceExecutionPlanDigest', 'sourceAttemptRecordDigest', 'reviewEvidenceDigest', 'sourceProgressDigest', 'acceptanceDigest']) {
    normalizeDigest(record[field], field, 409);
  }
  if (record.persisted !== true || record.decision !== REWORK_PLAN_ACCEPTANCE_DECISION || record.nextAttemptNumber !== 2 || record.maxAdditionalBuilderAttempts !== 1 || record.acknowledgement !== REWORK_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT) {
    throw errorWithStatus('ReworkPlanAcceptance fixed values are invalid', 409);
  }
  if (record.createdAt !== record.reviewedAt) throw errorWithStatus('ReworkPlanAcceptance createdAt must equal reviewedAt', 409);
  normalizeTimestamp(record.reviewedAt, 'reviewedAt', 409);
  normalizeTimestamp(record.createdAt, 'createdAt', 409);
  if (record.rationale !== normalizeRationale(record.rationale, 409)) {
    throw errorWithStatus('ReworkPlanAcceptance rationale is not normalized', 409);
  }
  assertExactKeys(record.authoritySummary, Object.keys(REWORK_PLAN_ACCEPTANCE_AUTHORITY_SUMMARY), 'ReworkPlanAcceptance authoritySummary', 409);
  if (JSON.stringify(record.authoritySummary) !== JSON.stringify(REWORK_PLAN_ACCEPTANCE_AUTHORITY_SUMMARY)) {
    throw errorWithStatus('ReworkPlanAcceptance authoritySummary is invalid', 409);
  }
  if (computeReworkPlanAcceptanceDigest(record) !== record.acceptanceDigest) {
    throw errorWithStatus('ReworkPlanAcceptance acceptanceDigest is invalid', 409);
  }
  return record;
}

function isExactReworkPlanAcceptanceReplay(record, request) {
  return (
    record.reworkPlanRecordDigest === request.reworkPlanRecordDigest &&
    record.previewId === request.previewId &&
    record.previewDigest === request.previewDigest &&
    record.sourceExecutionPlanDigest === request.sourceExecutionPlanDigest &&
    record.sourceAttemptRecordDigest === request.sourceAttemptRecordDigest &&
    record.sourceProgressDigest === request.sourceProgressDigest &&
    record.acknowledgement === request.acknowledgement &&
    record.rationale === request.rationale &&
    record.reviewedAt === request.reviewedAt
  );
}

module.exports = {
  MAX_RATIONALE_BYTES,
  REWORK_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT,
  REWORK_PLAN_ACCEPTANCE_AUTHORITY_SUMMARY,
  REWORK_PLAN_ACCEPTANCE_DECISION,
  REWORK_PLAN_ACCEPTANCE_RECORD_KEYS,
  REWORK_PLAN_ACCEPTANCE_REQUEST_KEYS,
  assertReworkPlanAcceptanceRecord,
  computeReworkPlanAcceptanceDigest,
  createReworkPlanAcceptance,
  isExactReworkPlanAcceptanceReplay,
  normalizeReworkPlanAcceptanceRequest,
};
