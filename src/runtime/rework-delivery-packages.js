'use strict';

const {
  AUTHORITY_SUMMARY,
  BLOCKED_ACTIONS,
  RESPONSE_KEYS: PREVIEW_RESPONSE_KEYS,
  computeReworkDeliveryPackagePreviewDigest,
  deepFreeze,
  digestCanonical,
  normalizeReworkDeliveryPackagePreviewRequest,
} = require('./rework-delivery-package-preview');

const REWORK_DELIVERY_PACKAGE_STATUS = 'review-required';
const RECORD_APPROVAL_DECISION = 'record-rework-delivery-package';
const RECORD_APPROVAL_ACKNOWLEDGEMENT =
  'record-exact-rework-delivery-package-without-acceptance-or-close-out';
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

const RECORD_APPROVAL_KEYS = Object.freeze([
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);

const REWORK_DELIVERY_PACKAGE_REQUEST_KEYS = Object.freeze([
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
  'recordApproval',
]);

const REWORK_DELIVERY_PACKAGE_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'executionPlanId',
  'reworkPlanId',
  'qaWorkOrderId',
  'qaWorkOrderAttemptId',
  'qaRunId',
  'qaEvidenceArtifactId',
  'terminalCheckpointId',
  'terminalCheckpointDigest',
  'sourceDigest',
  'mutationEvidenceDigest',
  'reviewerEvidenceDigest',
  'qaInputDigest',
  'reworkDeliveryEvidenceDigest',
  'previewId',
  'previewDigest',
  'previewEvaluatedAt',
  'generatedAt',
  'deliveredArtifactRefs',
  'workOrderResults',
  'verificationSummary',
  'acceptedRisks',
  'unresolvedItems',
  'authoritySummary',
  'allowedActions',
  'blockedActions',
  'recordApproval',
  'recordApprovalDigest',
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
    throw errorWithStatus(
      `${label} must be a lowercase SHA-256 digest`,
      statusCode,
    );
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

function normalizeRecordApproval(value, options = {}) {
  assertExactKeys(
    value,
    RECORD_APPROVAL_KEYS,
    'ReworkDeliveryPackage recordApproval',
  );
  if (value.decision !== RECORD_APPROVAL_DECISION) {
    throw errorWithStatus('recordApproval.decision is invalid');
  }
  if (value.acknowledgement !== RECORD_APPROVAL_ACKNOWLEDGEMENT) {
    throw errorWithStatus('recordApproval.acknowledgement is invalid');
  }
  if (typeof value.rationale !== 'string' || !value.rationale.trim()) {
    throw errorWithStatus('recordApproval.rationale is required');
  }
  const rationale = value.rationale.trim().replace(/\s+/g, ' ');
  if (
    CONTROL_CHARACTER_PATTERN.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))
  ) {
    throw errorWithStatus(
      'recordApproval.rationale contains disallowed or sensitive content',
    );
  }
  const reviewedAt = normalizeTimestamp(
    value.reviewedAt,
    'recordApproval.reviewedAt',
  );
  const previewEvaluatedAt = normalizeTimestamp(
    options.previewEvaluatedAt,
    'previewEvaluatedAt',
    409,
  );
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
    409,
  );
  if (
    Date.parse(reviewedAt) < Date.parse(previewEvaluatedAt) ||
    Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS
  ) {
    throw errorWithStatus(
      'recordApproval.reviewedAt is outside the allowed window',
    );
  }
  return deepFreeze({
    decision: RECORD_APPROVAL_DECISION,
    acknowledgement: RECORD_APPROVAL_ACKNOWLEDGEMENT,
    rationale,
    reviewedAt,
  });
}

function normalizeReworkDeliveryPackageRequest(input, options = {}) {
  assertExactKeys(
    input,
    REWORK_DELIVERY_PACKAGE_REQUEST_KEYS,
    'ReworkDeliveryPackage request',
  );
  const previewRequest = normalizeReworkDeliveryPackagePreviewRequest(
    {
      reworkPlanId: input.reworkPlanId,
      qaWorkOrderAttemptId: input.qaWorkOrderAttemptId,
      qaWorkOrderAttemptRecordDigest: input.qaWorkOrderAttemptRecordDigest,
      qaRunId: input.qaRunId,
      qaEvidenceArtifactId: input.qaEvidenceArtifactId,
      deliveryReadyCheckpointId: input.deliveryReadyCheckpointId,
      checkpointDigest: input.checkpointDigest,
      sourceDigest: input.sourceDigest,
      qaInputDigest: input.qaInputDigest,
      evaluatedAt: input.evaluatedAt,
    },
    {
      now: options.now,
      qaCompletedAt: options.qaCompletedAt || input.evaluatedAt,
    },
  );
  return deepFreeze({
    ...previewRequest,
    previewId: normalizeIdentifier(input.previewId, 'previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'previewDigest'),
    reworkDeliveryEvidenceDigest: normalizeDigest(
      input.reworkDeliveryEvidenceDigest,
      'reworkDeliveryEvidenceDigest',
    ),
    recordApproval: normalizeRecordApproval(input.recordApproval, {
      previewEvaluatedAt: previewRequest.evaluatedAt,
      now: options.now,
    }),
  });
}

function computeRecordApprovalDigest(recordApproval) {
  return digestCanonical(recordApproval);
}

function computeReworkDeliveryPackageRecordDigest(record) {
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function buildPreviewProjection(record) {
  return {
    id: record.previewId,
    schemaVersion: 24,
    persisted: false,
    status: 'rework-delivery-preview-ready',
    projectId: record.projectId,
    missionId: record.missionId,
    executionPlanId: record.executionPlanId,
    reworkPlanId: record.reworkPlanId,
    qaWorkOrderId: record.qaWorkOrderId,
    qaWorkOrderAttemptId: record.qaWorkOrderAttemptId,
    qaRunId: record.qaRunId,
    qaEvidenceArtifactId: record.qaEvidenceArtifactId,
    terminalCheckpointId: record.terminalCheckpointId,
    terminalCheckpointDigest: record.terminalCheckpointDigest,
    sourceDigest: record.sourceDigest,
    mutationEvidenceDigest: record.mutationEvidenceDigest,
    reviewerEvidenceDigest: record.reviewerEvidenceDigest,
    qaInputDigest: record.qaInputDigest,
    reworkDeliveryEvidenceDigest: record.reworkDeliveryEvidenceDigest,
    deliveredArtifactRefs: structuredClone(record.deliveredArtifactRefs),
    workOrderResults: structuredClone(record.workOrderResults),
    verificationSummary: structuredClone(record.verificationSummary),
    acceptedRisks: structuredClone(record.acceptedRisks),
    unresolvedItems: structuredClone(record.unresolvedItems),
    authoritySummary: structuredClone(record.authoritySummary),
    generatedAt: record.generatedAt,
    evaluatedAt: record.previewEvaluatedAt,
    allowedActions: structuredClone(record.allowedActions),
    blockedActions: structuredClone(record.blockedActions),
    previewDigest: record.previewDigest,
  };
}

function assertReworkDeliveryPackageRecord(record) {
  assertExactKeys(
    record,
    REWORK_DELIVERY_PACKAGE_RECORD_KEYS,
    'ReworkDeliveryPackage record',
    409,
  );
  for (const field of [
    'id',
    'projectId',
    'missionId',
    'executionPlanId',
    'reworkPlanId',
    'qaWorkOrderId',
    'qaWorkOrderAttemptId',
    'qaRunId',
    'qaEvidenceArtifactId',
    'terminalCheckpointId',
    'previewId',
  ]) {
    normalizeIdentifier(record[field], field, 409);
  }
  for (const field of [
    'terminalCheckpointDigest',
    'sourceDigest',
    'mutationEvidenceDigest',
    'reviewerEvidenceDigest',
    'qaInputDigest',
    'reworkDeliveryEvidenceDigest',
    'previewDigest',
    'recordApprovalDigest',
    'recordDigest',
  ]) {
    normalizeDigest(record[field], field, 409);
  }
  normalizeTimestamp(record.previewEvaluatedAt, 'previewEvaluatedAt', 409);
  normalizeTimestamp(record.generatedAt, 'generatedAt', 409);
  normalizeTimestamp(record.createdAt, 'createdAt', 409);
  const approval = normalizeRecordApproval(record.recordApproval, {
    previewEvaluatedAt: record.previewEvaluatedAt,
    now: record.createdAt,
  });
  if (
    record.persisted !== true ||
    record.status !== REWORK_DELIVERY_PACKAGE_STATUS ||
    record.createdAt !== approval.reviewedAt ||
    !Array.isArray(record.allowedActions) ||
    record.allowedActions.length !== 0 ||
    JSON.stringify(record.blockedActions) !== JSON.stringify(BLOCKED_ACTIONS) ||
    JSON.stringify(record.authoritySummary) !== JSON.stringify(AUTHORITY_SUMMARY) ||
    !Array.isArray(record.deliveredArtifactRefs) ||
    record.deliveredArtifactRefs.length === 0 ||
    new Set(record.deliveredArtifactRefs).size !==
      record.deliveredArtifactRefs.length ||
    record.deliveredArtifactRefs.some(
      (value) =>
        typeof value !== 'string' ||
        value !== value.trim() ||
        !IDENTIFIER_PATTERN.test(value),
    ) ||
    !Array.isArray(record.workOrderResults) ||
    record.workOrderResults.length !== 3 ||
    !Array.isArray(record.acceptedRisks) ||
    !Array.isArray(record.unresolvedItems) ||
    record.unresolvedItems.length !== 0 ||
    record.verificationSummary?.verdict !== 'passed' ||
    record.verificationSummary?.mutationDetected !== false
  ) {
    throw errorWithStatus('ReworkDeliveryPackage fixed evidence is invalid', 409);
  }
  if (computeRecordApprovalDigest(approval) !== record.recordApprovalDigest) {
    throw errorWithStatus(
      'ReworkDeliveryPackage recordApprovalDigest is invalid',
      409,
    );
  }
  const preview = buildPreviewProjection(record);
  assertExactKeys(
    preview,
    PREVIEW_RESPONSE_KEYS,
    'ReworkDeliveryPackage preview projection',
    409,
  );
  if (
    record.previewId !==
      `rework-delivery-package-preview-${record.previewDigest.slice(0, 16)}` ||
    computeReworkDeliveryPackagePreviewDigest(preview) !== record.previewDigest
  ) {
    throw errorWithStatus(
      'ReworkDeliveryPackage preview binding is invalid',
      409,
    );
  }
  if (computeReworkDeliveryPackageRecordDigest(record) !== record.recordDigest) {
    throw errorWithStatus('ReworkDeliveryPackage recordDigest is invalid', 409);
  }
  return record;
}

function createReworkDeliveryPackage(input, options = {}) {
  assertExactKeys(
    input,
    ['id', 'preview', 'recordApproval'],
    'ReworkDeliveryPackage input',
  );
  const preview = input.preview;
  assertExactKeys(
    preview,
    PREVIEW_RESPONSE_KEYS,
    'ReworkDeliveryPackage source preview',
    409,
  );
  if (
    preview.schemaVersion !== 24 ||
    preview.persisted !== false ||
    preview.status !== 'rework-delivery-preview-ready' ||
    computeReworkDeliveryPackagePreviewDigest(preview) !== preview.previewDigest
  ) {
    throw errorWithStatus(
      'ReworkDeliveryPackage source preview is invalid',
      409,
    );
  }
  const recordApproval = normalizeRecordApproval(input.recordApproval, {
    previewEvaluatedAt: preview.evaluatedAt,
    now: options.now,
  });
  const record = {
    id: normalizeIdentifier(input.id, 'id'),
    persisted: true,
    status: REWORK_DELIVERY_PACKAGE_STATUS,
    projectId: preview.projectId,
    missionId: preview.missionId,
    executionPlanId: preview.executionPlanId,
    reworkPlanId: preview.reworkPlanId,
    qaWorkOrderId: preview.qaWorkOrderId,
    qaWorkOrderAttemptId: preview.qaWorkOrderAttemptId,
    qaRunId: preview.qaRunId,
    qaEvidenceArtifactId: preview.qaEvidenceArtifactId,
    terminalCheckpointId: preview.terminalCheckpointId,
    terminalCheckpointDigest: preview.terminalCheckpointDigest,
    sourceDigest: preview.sourceDigest,
    mutationEvidenceDigest: preview.mutationEvidenceDigest,
    reviewerEvidenceDigest: preview.reviewerEvidenceDigest,
    qaInputDigest: preview.qaInputDigest,
    reworkDeliveryEvidenceDigest: preview.reworkDeliveryEvidenceDigest,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    previewEvaluatedAt: preview.evaluatedAt,
    generatedAt: preview.generatedAt,
    deliveredArtifactRefs: structuredClone(preview.deliveredArtifactRefs),
    workOrderResults: structuredClone(preview.workOrderResults),
    verificationSummary: structuredClone(preview.verificationSummary),
    acceptedRisks: structuredClone(preview.acceptedRisks),
    unresolvedItems: structuredClone(preview.unresolvedItems),
    authoritySummary: structuredClone(preview.authoritySummary),
    allowedActions: [],
    blockedActions: structuredClone(preview.blockedActions),
    recordApproval: structuredClone(recordApproval),
    recordApprovalDigest: computeRecordApprovalDigest(recordApproval),
    createdAt: recordApproval.reviewedAt,
  };
  record.recordDigest = computeReworkDeliveryPackageRecordDigest(record);
  assertReworkDeliveryPackageRecord(record);
  return deepFreeze(record);
}

function isExactReworkDeliveryPackageReplay(record, request) {
  return (
    record.reworkPlanId === request.reworkPlanId &&
    record.qaWorkOrderAttemptId === request.qaWorkOrderAttemptId &&
    record.qaRunId === request.qaRunId &&
    record.qaEvidenceArtifactId === request.qaEvidenceArtifactId &&
    record.terminalCheckpointId === request.deliveryReadyCheckpointId &&
    record.terminalCheckpointDigest === request.checkpointDigest &&
    record.sourceDigest === request.sourceDigest &&
    record.qaInputDigest === request.qaInputDigest &&
    record.previewEvaluatedAt === request.evaluatedAt &&
    record.previewId === request.previewId &&
    record.previewDigest === request.previewDigest &&
    record.reworkDeliveryEvidenceDigest ===
      request.reworkDeliveryEvidenceDigest &&
    record.recordApprovalDigest ===
      computeRecordApprovalDigest(request.recordApproval) &&
    JSON.stringify(record.recordApproval) ===
      JSON.stringify(request.recordApproval)
  );
}

module.exports = {
  MAX_RATIONALE_BYTES,
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  RECORD_APPROVAL_KEYS,
  REWORK_DELIVERY_PACKAGE_RECORD_KEYS,
  REWORK_DELIVERY_PACKAGE_REQUEST_KEYS,
  REWORK_DELIVERY_PACKAGE_STATUS,
  assertReworkDeliveryPackageRecord,
  computeRecordApprovalDigest,
  computeReworkDeliveryPackageRecordDigest,
  createReworkDeliveryPackage,
  isExactReworkDeliveryPackageReplay,
  normalizeRecordApproval,
  normalizeReworkDeliveryPackageRequest,
};
