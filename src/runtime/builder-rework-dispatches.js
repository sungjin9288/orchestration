'use strict';

const crypto = require('crypto');

const DISPATCH_STATUS = 'dispatched';
const DISPATCH_APPROVAL_DECISION = 'dispatch-builder-rework-preflight';
const DISPATCH_APPROVAL_ACKNOWLEDGEMENT =
  'dispatch-one-local-no-write-rework-preflight-without-mutation-approval';
const MAX_RATIONALE_BYTES = 500;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_IDENTIFIER_LENGTH = 256;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const SENSITIVE_CONTENT_PATTERNS = Object.freeze([
  /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|api[_-]?key|access[_-]?token|refresh[_-]?token)\b/i,
  /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
  /(?:^|\s)[A-Z][A-Z0-9_]{1,63}=\S+/,
  /(?:^|\s)(?:\/(?:Users|home|private|tmp|var|etc|opt)\/|[A-Za-z]:\\)/,
  /\b(?:raw (?:artifact|body|command output|response)|prompt (?:body|content)|provider payload|transcript|stdout|stderr|chain[- ]of[- ]thought)\b/i,
  /```/,
]);

const REQUEST_KEYS = Object.freeze([
  'reworkPlanAcceptanceId',
  'reworkPlanRecordDigest',
  'acceptanceDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'sourceProgressDigest',
  'builderWorkOrderId',
  'builderWorkOrderDigest',
  'reworkAttemptNumber',
  'workOrderAttemptNumber',
  'evaluatedAt',
  'dispatchApproval',
]);

const DISPATCH_APPROVAL_KEYS = Object.freeze([
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);

const AUTHORITY_SUMMARY = Object.freeze({
  dispatchEvidenceAllowed: true,
  existingBuilderAttemptAppendAllowed: true,
  localStubPreflightAllowed: true,
  newWorkOrderAppendAllowed: false,
  executionPlanMutationAllowed: false,
  workOrderMutationAllowed: false,
  reviewDecisionResolutionAllowed: false,
  approvalCreationAllowed: false,
  approvalResolutionAllowed: false,
  checkpointCreationAllowed: false,
  sourceMutationAllowed: false,
  reviewerExecutionAllowed: false,
  qaExecutionAllowed: false,
  retryAllowed: false,
  recoveryAllowed: false,
  schedulingAllowed: false,
  providerBackedExecutionAllowed: false,
  memoryApplicationAllowed: false,
  commitAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
  policyMutationAllowed: false,
  approvalBypassAllowed: false,
  connectorCallAllowed: false,
});

const RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'executionPlanId',
  'builderWorkOrderId',
  'builderWorkOrderDigest',
  'reworkPlanId',
  'reworkPlanRecordDigest',
  'reworkPlanAcceptanceId',
  'reworkPlanAcceptanceDigest',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'reworkAttemptNumber',
  'workOrderAttemptId',
  'workOrderAttemptNumber',
  'dispatchApproval',
  'dispatchApprovalDigest',
  'authoritySummary',
  'createdAt',
  'recordDigest',
]);

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

function normalizeIdentifier(value, label, statusCode = 400) {
  if (
    typeof value !== 'string' ||
    value !== value.trim() ||
    !value ||
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
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, statusCode);
  }
  return value;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function digestCanonical(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeDispatchApproval(value, options = {}) {
  assertExactKeys(value, DISPATCH_APPROVAL_KEYS, 'dispatchApproval');
  if (
    value.decision !== DISPATCH_APPROVAL_DECISION ||
    value.acknowledgement !== DISPATCH_APPROVAL_ACKNOWLEDGEMENT
  ) {
    throw errorWithStatus('dispatchApproval authority is invalid');
  }
  if (typeof value.rationale !== 'string' || !value.rationale.trim()) {
    throw errorWithStatus('dispatchApproval.rationale is required');
  }
  const rationale = value.rationale.trim().replace(/\s+/g, ' ');
  if (
    CONTROL_CHARACTER_PATTERN.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))
  ) {
    throw errorWithStatus('dispatchApproval.rationale is invalid');
  }
  const reviewedAt = normalizeTimestamp(value.reviewedAt, 'dispatchApproval.reviewedAt');
  const now = normalizeTimestamp(options.now || new Date().toISOString(), 'runtime now');
  const acceptanceCreatedAt = normalizeTimestamp(options.acceptanceCreatedAt, 'acceptance createdAt');
  if (
    Date.parse(reviewedAt) < Date.parse(acceptanceCreatedAt) ||
    Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS
  ) {
    throw errorWithStatus('dispatchApproval.reviewedAt is outside the allowed window');
  }
  return deepFreeze({
    decision: DISPATCH_APPROVAL_DECISION,
    acknowledgement: DISPATCH_APPROVAL_ACKNOWLEDGEMENT,
    rationale,
    reviewedAt,
  });
}

function normalizeBuilderReworkDispatchRequest(input, options = {}) {
  assertExactKeys(input, REQUEST_KEYS, 'BuilderReworkDispatch request');
  const dispatchApproval = normalizeDispatchApproval(input.dispatchApproval, options);
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  if (evaluatedAt !== dispatchApproval.reviewedAt) {
    throw errorWithStatus('evaluatedAt must equal dispatchApproval.reviewedAt');
  }
  if (input.reworkAttemptNumber !== 2 || input.workOrderAttemptNumber !== 3) {
    throw errorWithStatus('BuilderReworkDispatch attempt numbers are fixed');
  }
  return deepFreeze({
    reworkPlanAcceptanceId: normalizeIdentifier(input.reworkPlanAcceptanceId, 'reworkPlanAcceptanceId'),
    reworkPlanRecordDigest: normalizeDigest(input.reworkPlanRecordDigest, 'reworkPlanRecordDigest'),
    acceptanceDigest: normalizeDigest(input.acceptanceDigest, 'acceptanceDigest'),
    sourceExecutionPlanDigest: normalizeDigest(input.sourceExecutionPlanDigest, 'sourceExecutionPlanDigest'),
    sourceAttemptRecordDigest: normalizeDigest(input.sourceAttemptRecordDigest, 'sourceAttemptRecordDigest'),
    sourceProgressDigest: normalizeDigest(input.sourceProgressDigest, 'sourceProgressDigest'),
    builderWorkOrderId: normalizeIdentifier(input.builderWorkOrderId, 'builderWorkOrderId'),
    builderWorkOrderDigest: normalizeDigest(input.builderWorkOrderDigest, 'builderWorkOrderDigest'),
    reworkAttemptNumber: 2,
    workOrderAttemptNumber: 3,
    evaluatedAt,
    dispatchApproval,
  });
}

function computeDispatchApprovalDigest(approval) {
  return digestCanonical(approval);
}

function computeBuilderReworkDispatchRecordDigest(record) {
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createBuilderReworkDispatch(input) {
  const record = {
    id: normalizeIdentifier(input.id, 'BuilderReworkDispatch id'),
    persisted: true,
    status: DISPATCH_STATUS,
    projectId: normalizeIdentifier(input.projectId, 'projectId'),
    missionId: normalizeIdentifier(input.missionId, 'missionId'),
    staffingPlanId: normalizeIdentifier(input.staffingPlanId, 'staffingPlanId'),
    staffingEntryId: normalizeIdentifier(input.staffingEntryId, 'staffingEntryId'),
    councilSessionId: normalizeIdentifier(input.councilSessionId, 'councilSessionId'),
    executionPlanId: normalizeIdentifier(input.executionPlanId, 'executionPlanId'),
    builderWorkOrderId: normalizeIdentifier(input.request.builderWorkOrderId, 'builderWorkOrderId'),
    builderWorkOrderDigest: normalizeDigest(input.request.builderWorkOrderDigest, 'builderWorkOrderDigest'),
    reworkPlanId: normalizeIdentifier(input.reworkPlanId, 'reworkPlanId'),
    reworkPlanRecordDigest: normalizeDigest(input.request.reworkPlanRecordDigest, 'reworkPlanRecordDigest'),
    reworkPlanAcceptanceId: normalizeIdentifier(input.request.reworkPlanAcceptanceId, 'reworkPlanAcceptanceId'),
    reworkPlanAcceptanceDigest: normalizeDigest(input.request.acceptanceDigest, 'acceptanceDigest'),
    sourceExecutionPlanDigest: normalizeDigest(input.request.sourceExecutionPlanDigest, 'sourceExecutionPlanDigest'),
    sourceAttemptRecordDigest: normalizeDigest(input.request.sourceAttemptRecordDigest, 'sourceAttemptRecordDigest'),
    reviewEvidenceDigest: normalizeDigest(input.reviewEvidenceDigest, 'reviewEvidenceDigest'),
    sourceProgressDigest: normalizeDigest(input.request.sourceProgressDigest, 'sourceProgressDigest'),
    reworkAttemptNumber: 2,
    workOrderAttemptId: normalizeIdentifier(input.workOrderAttemptId, 'workOrderAttemptId'),
    workOrderAttemptNumber: 3,
    dispatchApproval: input.request.dispatchApproval,
    dispatchApprovalDigest: computeDispatchApprovalDigest(input.request.dispatchApproval),
    authoritySummary: AUTHORITY_SUMMARY,
    createdAt: input.request.dispatchApproval.reviewedAt,
  };
  record.recordDigest = computeBuilderReworkDispatchRecordDigest(record);
  return deepFreeze(record);
}

function assertBuilderReworkDispatchRecord(record) {
  assertExactKeys(record, RECORD_KEYS, 'BuilderReworkDispatch record', 409);
  for (const field of ['id', 'projectId', 'missionId', 'staffingPlanId', 'staffingEntryId', 'councilSessionId', 'executionPlanId', 'builderWorkOrderId', 'reworkPlanId', 'reworkPlanAcceptanceId', 'workOrderAttemptId']) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of ['builderWorkOrderDigest', 'reworkPlanRecordDigest', 'reworkPlanAcceptanceDigest', 'sourceExecutionPlanDigest', 'sourceAttemptRecordDigest', 'reviewEvidenceDigest', 'sourceProgressDigest', 'dispatchApprovalDigest', 'recordDigest']) {
    normalizeDigest(record[field], field, 409);
  }
  if (record.persisted !== true || record.status !== DISPATCH_STATUS || record.reworkAttemptNumber !== 2 || record.workOrderAttemptNumber !== 3 || record.createdAt !== record.dispatchApproval?.reviewedAt) {
    throw errorWithStatus('BuilderReworkDispatch fixed values are invalid', 409);
  }
  const approval = normalizeDispatchApproval(record.dispatchApproval, { acceptanceCreatedAt: record.createdAt, now: new Date(Date.parse(record.createdAt) + MAX_CLOCK_SKEW_MS).toISOString() });
  if (computeDispatchApprovalDigest(approval) !== record.dispatchApprovalDigest) throw errorWithStatus('BuilderReworkDispatch dispatchApprovalDigest is invalid', 409);
  assertExactKeys(record.authoritySummary, Object.keys(AUTHORITY_SUMMARY), 'BuilderReworkDispatch authoritySummary', 409);
  if (JSON.stringify(record.authoritySummary) !== JSON.stringify(AUTHORITY_SUMMARY) || computeBuilderReworkDispatchRecordDigest(record) !== record.recordDigest) {
    throw errorWithStatus('BuilderReworkDispatch record is invalid', 409);
  }
  return record;
}

function isExactBuilderReworkDispatchReplay(record, request) {
  return (
    record.reworkPlanAcceptanceId === request.reworkPlanAcceptanceId &&
    record.reworkPlanRecordDigest === request.reworkPlanRecordDigest &&
    record.reworkPlanAcceptanceDigest === request.acceptanceDigest &&
    record.sourceExecutionPlanDigest === request.sourceExecutionPlanDigest &&
    record.sourceAttemptRecordDigest === request.sourceAttemptRecordDigest &&
    record.sourceProgressDigest === request.sourceProgressDigest &&
    record.builderWorkOrderId === request.builderWorkOrderId &&
    record.builderWorkOrderDigest === request.builderWorkOrderDigest &&
    record.reworkAttemptNumber === request.reworkAttemptNumber &&
    record.workOrderAttemptNumber === request.workOrderAttemptNumber &&
    record.dispatchApprovalDigest ===
      computeDispatchApprovalDigest(request.dispatchApproval)
  );
}

function deriveBuilderReworkWorkerState(attempt) {
  if (attempt.status === 'active') {
    return attempt.runRefs?.length === 2
      ? 'source-mutation-running'
      : 'running';
  }
  if (attempt.status === 'waiting-gate') return 'preflight-ready-for-separate-mutation-approval';
  if (attempt.status === 'completed') return 'source-mutation-completed-reviewer-blocked';
  if (attempt.status === 'failed') return 'failed-terminal-no-retry';
  throw errorWithStatus('BuilderReworkDispatch attempt has invalid status', 409);
}

module.exports = {
  AUTHORITY_SUMMARY,
  DISPATCH_APPROVAL_ACKNOWLEDGEMENT,
  DISPATCH_APPROVAL_DECISION,
  DISPATCH_STATUS,
  REQUEST_KEYS,
  assertBuilderReworkDispatchRecord,
  computeBuilderReworkDispatchRecordDigest,
  computeDispatchApprovalDigest,
  createBuilderReworkDispatch,
  deriveBuilderReworkWorkerState,
  isExactBuilderReworkDispatchReplay,
  normalizeBuilderReworkDispatchRequest,
};
