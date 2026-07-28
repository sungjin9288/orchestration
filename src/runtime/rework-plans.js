'use strict';

const {
  FINDING_KEYS,
  REVIEWER_REWORK_BLOCKED_ACTIONS,
  REVIEWER_REWORK_EVIDENCE_KEYS,
  REVIEWER_REWORK_RESPONSE_KEYS,
  canonicalize,
  computeReviewerReworkPreviewDigest,
  deepFreeze,
  digestCanonical,
  normalizeReviewerReworkPreviewRequest,
} = require('./reviewer-rework-preview');

const REWORK_PLAN_STATUS = 'review-required';
const RECORD_APPROVAL_DECISION = 'record-rework-plan';
const RECORD_APPROVAL_ACKNOWLEDGEMENT =
  'record-exact-reviewer-rework-plan-without-execution';

const REWORK_PLAN_REQUEST_KEYS = Object.freeze([
  'executionPlanId',
  'reviewerWorkOrderId',
  'reviewerAttemptId',
  'reviewerRunId',
  'reviewArtifactId',
  'expectedExecutionPlanDigest',
  'expectedAttemptRecordDigest',
  'evaluatedAt',
  'previewId',
  'previewDigest',
  'recordApproval',
]);

const RECORD_APPROVAL_KEYS = Object.freeze([
  'decision',
  'acknowledgement',
  'rationale',
  'reviewedAt',
]);

const REWORK_PLAN_RECORD_KEYS = Object.freeze([
  'id',
  'persisted',
  'status',
  'projectId',
  'missionId',
  'staffingPlanId',
  'staffingEntryId',
  'councilSessionId',
  'executionPlanId',
  'reviewerWorkOrderId',
  'reviewerAttemptId',
  'reviewerRunId',
  'reviewArtifactId',
  'sourceExecutionPlanDigest',
  'sourceAttemptRecordDigest',
  'previewId',
  'previewDigest',
  'previewEvaluatedAt',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'nextAttemptNumber',
  'maxAdditionalBuilderAttempts',
  'targetPathAllowlist',
  'verificationCommands',
  'findings',
  'evidenceRefs',
  'allowedActions',
  'blockedActions',
  'recordApproval',
  'recordApprovalDigest',
  'createdAt',
  'recordDigest',
]);

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const MAX_IDENTIFIER_LENGTH = 256;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_RATIONALE_BYTES = 500;
const MAX_FINDING_COUNT = 32;
const MAX_FINDING_BYTES = 512;
const MAX_REFERENCE_COUNT = 128;
const SENSITIVE_CONTENT_PATTERNS = Object.freeze([
  /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|api[_-]?key|access[_-]?token|refresh[_-]?token)\b/i,
  /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
  /(?:^|\s)[A-Z][A-Z0-9_]{1,63}=\S+/,
  /(?:^|\s)(?:\/(?:Users|home|private|tmp|var|etc|opt)\/|[A-Za-z]:\\)/,
  /\b(?:raw (?:artifact|body|command output|response)|prompt (?:body|content)|provider payload|transcript|stdout|stderr|chain[- ]of[- ]thought)\b/i,
  /```/,
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

function normalizeIdentifier(value, label) {
  if (typeof value !== 'string' || value !== value.trim()) {
    throw errorWithStatus(`${label} is invalid`);
  }
  if (
    !value ||
    value.length > MAX_IDENTIFIER_LENGTH ||
    !IDENTIFIER_PATTERN.test(value)
  ) {
    throw errorWithStatus(`${label} is invalid`);
  }
  return value;
}

function normalizeDigest(value, label) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`);
  }
  return value;
}

function normalizeTimestamp(value, label) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`);
  }
  return value;
}

function normalizeRecordApproval(value, options = {}) {
  assertExactKeys(value, RECORD_APPROVAL_KEYS, 'ReworkPlan recordApproval');
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
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES
  ) {
    throw errorWithStatus('recordApproval.rationale is invalid');
  }
  if (SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))) {
    throw errorWithStatus(
      'recordApproval.rationale contains disallowed raw or sensitive content',
    );
  }

  const reviewedAt = normalizeTimestamp(value.reviewedAt, 'recordApproval.reviewedAt');
  const previewEvaluatedAt = options.previewEvaluatedAt
    ? normalizeTimestamp(options.previewEvaluatedAt, 'previewEvaluatedAt')
    : null;
  const now = options.now
    ? normalizeTimestamp(options.now, 'runtime now')
    : new Date().toISOString();
  if (
    (previewEvaluatedAt &&
      Date.parse(reviewedAt) < Date.parse(previewEvaluatedAt)) ||
    Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS
  ) {
    throw errorWithStatus('recordApproval.reviewedAt is outside the allowed window');
  }

  return deepFreeze({
    decision: RECORD_APPROVAL_DECISION,
    acknowledgement: RECORD_APPROVAL_ACKNOWLEDGEMENT,
    rationale,
    reviewedAt,
  });
}

function normalizeReworkPlanRequest(input, options = {}) {
  assertExactKeys(input, REWORK_PLAN_REQUEST_KEYS, 'ReworkPlan request');
  const previewRequest = normalizeReviewerReworkPreviewRequest({
    executionPlanId: input.executionPlanId,
    reviewerWorkOrderId: input.reviewerWorkOrderId,
    reviewerAttemptId: input.reviewerAttemptId,
    reviewerRunId: input.reviewerRunId,
    reviewArtifactId: input.reviewArtifactId,
    expectedExecutionPlanDigest: input.expectedExecutionPlanDigest,
    expectedAttemptRecordDigest: input.expectedAttemptRecordDigest,
    evaluatedAt: input.evaluatedAt,
  });
  return deepFreeze({
    ...previewRequest,
    previewId: normalizeIdentifier(input.previewId, 'previewId'),
    previewDigest: normalizeDigest(input.previewDigest, 'previewDigest'),
    recordApproval: normalizeRecordApproval(input.recordApproval, {
      previewEvaluatedAt: previewRequest.evaluatedAt,
      now: options.now,
    }),
  });
}

function computeRecordApprovalDigest(recordApproval) {
  return digestCanonical(recordApproval);
}

function computeReworkPlanRecordDigest(record) {
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function buildPreviewProjection(record) {
  return {
    id: record.previewId,
    schemaVersion: 21,
    persisted: false,
    status: 'rework-review-required',
    executionPlanId: record.executionPlanId,
    reviewerWorkOrderId: record.reviewerWorkOrderId,
    reviewerAttemptId: record.reviewerAttemptId,
    reviewerRunId: record.reviewerRunId,
    reviewArtifactId: record.reviewArtifactId,
    executionPlanDigest: record.sourceExecutionPlanDigest,
    attemptRecordDigest: record.sourceAttemptRecordDigest,
    reviewEvidenceDigest: record.reviewEvidenceDigest,
    sourceProgressDigest: record.sourceProgressDigest,
    evaluatedAt: record.previewEvaluatedAt,
    nextAttemptNumber: record.nextAttemptNumber,
    maxAdditionalBuilderAttempts: record.maxAdditionalBuilderAttempts,
    targetPathAllowlist: structuredClone(record.targetPathAllowlist),
    verificationCommands: structuredClone(record.verificationCommands),
    findings: structuredClone(record.findings),
    evidenceRefs: structuredClone(record.evidenceRefs),
    allowedActions: structuredClone(record.allowedActions),
    blockedActions: structuredClone(record.blockedActions),
    previewDigest: record.previewDigest,
  };
}

function assertExactStringArray(value, label, { allowEmpty = false } = {}) {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    value.length > MAX_REFERENCE_COUNT ||
    value.some(
      (entry) =>
        typeof entry !== 'string' ||
        !entry ||
        entry !== entry.trim() ||
        CONTROL_CHARACTER_PATTERN.test(entry),
    )
  ) {
    throw errorWithStatus(`${label} is invalid`, 409);
  }
}

function assertReworkPlanRecord(record) {
  assertExactKeys(record, REWORK_PLAN_RECORD_KEYS, 'ReworkPlan record', 409);
  for (const field of [
    'id',
    'projectId',
    'missionId',
    'staffingPlanId',
    'staffingEntryId',
    'councilSessionId',
    'executionPlanId',
    'reviewerWorkOrderId',
    'reviewerAttemptId',
    'reviewerRunId',
    'reviewArtifactId',
    'previewId',
  ]) {
    normalizeIdentifier(record[field], field);
  }
  for (const field of [
    'sourceExecutionPlanDigest',
    'sourceAttemptRecordDigest',
    'previewDigest',
    'reviewEvidenceDigest',
    'sourceProgressDigest',
    'recordApprovalDigest',
    'recordDigest',
  ]) {
    normalizeDigest(record[field], field);
  }
  normalizeTimestamp(record.previewEvaluatedAt, 'previewEvaluatedAt');
  normalizeTimestamp(record.createdAt, 'createdAt');
  if (
    record.persisted !== true ||
    record.status !== REWORK_PLAN_STATUS ||
    record.nextAttemptNumber !== 2 ||
    record.maxAdditionalBuilderAttempts !== 1 ||
    !Array.isArray(record.allowedActions) ||
    record.allowedActions.length !== 0
  ) {
    throw errorWithStatus('ReworkPlan fixed values are invalid', 409);
  }
  assertExactStringArray(record.targetPathAllowlist, 'targetPathAllowlist');
  assertExactStringArray(record.verificationCommands, 'verificationCommands');
  assertExactStringArray(record.blockedActions, 'blockedActions');
  if (
    JSON.stringify(record.blockedActions) !==
    JSON.stringify(REVIEWER_REWORK_BLOCKED_ACTIONS)
  ) {
    throw errorWithStatus('ReworkPlan blockedActions are invalid', 409);
  }
  if (
    !Array.isArray(record.findings) ||
    record.findings.length < 1 ||
    record.findings.length > MAX_FINDING_COUNT
  ) {
    throw errorWithStatus('ReworkPlan findings are invalid', 409);
  }
  record.findings.forEach((finding, index) => {
    assertExactKeys(finding, FINDING_KEYS, `ReworkPlan finding ${index + 1}`, 409);
    if (
      finding.findingId !==
        `rework-finding-${String(index + 1).padStart(2, '0')}` ||
      typeof finding.text !== 'string' ||
      !finding.text ||
      finding.text !== finding.text.trim() ||
      CONTROL_CHARACTER_PATTERN.test(finding.text) ||
      Buffer.byteLength(finding.text, 'utf8') > MAX_FINDING_BYTES ||
      SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(finding.text)) ||
      digestCanonical({
        reviewArtifactId: record.reviewArtifactId,
        findingIndex: index + 1,
        text: finding.text,
      }) !== finding.findingDigest
    ) {
      throw errorWithStatus(`ReworkPlan finding ${index + 1} is invalid`, 409);
    }
  });
  assertExactKeys(
    record.evidenceRefs,
    REVIEWER_REWORK_EVIDENCE_KEYS,
    'ReworkPlan evidenceRefs',
    409,
  );
  for (const key of REVIEWER_REWORK_EVIDENCE_KEYS) {
    if (key === 'decisionInboxItemRefs') {
      assertExactStringArray(
        record.evidenceRefs[key],
        `evidenceRefs.${key}`,
        { allowEmpty: true },
      );
    } else {
      normalizeIdentifier(record.evidenceRefs[key], `evidenceRefs.${key}`);
    }
  }
  const approval = normalizeRecordApproval(record.recordApproval, {
    previewEvaluatedAt: record.previewEvaluatedAt,
    now: record.createdAt,
  });
  if (
    record.createdAt !== approval.reviewedAt ||
    record.recordApprovalDigest !== computeRecordApprovalDigest(approval)
  ) {
    throw errorWithStatus('ReworkPlan record approval binding is invalid', 409);
  }
  const preview = buildPreviewProjection(record);
  assertExactKeys(
    preview,
    REVIEWER_REWORK_RESPONSE_KEYS,
    'ReworkPlan preview projection',
    409,
  );
  if (
    record.previewId !==
      `reviewer-rework-preview-${record.previewDigest.slice(0, 16)}` ||
    computeReviewerReworkPreviewDigest(preview) !== record.previewDigest
  ) {
    throw errorWithStatus('ReworkPlan preview binding is invalid', 409);
  }
  if (computeReworkPlanRecordDigest(record) !== record.recordDigest) {
    throw errorWithStatus('ReworkPlan recordDigest is invalid', 409);
  }
  return record;
}

function createReworkPlan(input, options = {}) {
  assertExactKeys(input, ['id', 'preview', 'recordApproval'], 'ReworkPlan input');
  const preview = input.preview;
  assertExactKeys(
    preview,
    REVIEWER_REWORK_RESPONSE_KEYS,
    'ReworkPlan source preview',
    409,
  );
  if (
    preview.persisted !== false ||
    preview.status !== 'rework-review-required' ||
    preview.schemaVersion !== 21 ||
    preview.allowedActions.length !== 0 ||
    computeReviewerReworkPreviewDigest(preview) !== preview.previewDigest
  ) {
    throw errorWithStatus('ReworkPlan source preview is invalid', 409);
  }
  const recordApproval = normalizeRecordApproval(input.recordApproval, {
    previewEvaluatedAt: preview.evaluatedAt,
    now: options.now,
  });
  const record = {
    id: normalizeIdentifier(input.id, 'id'),
    persisted: true,
    status: REWORK_PLAN_STATUS,
    projectId: normalizeIdentifier(options.projectId, 'projectId'),
    missionId: preview.evidenceRefs.missionRef,
    staffingPlanId: preview.evidenceRefs.staffingPlanRef,
    staffingEntryId: preview.evidenceRefs.staffingEntryRef,
    councilSessionId: preview.evidenceRefs.councilSessionRef,
    executionPlanId: preview.executionPlanId,
    reviewerWorkOrderId: preview.reviewerWorkOrderId,
    reviewerAttemptId: preview.reviewerAttemptId,
    reviewerRunId: preview.reviewerRunId,
    reviewArtifactId: preview.reviewArtifactId,
    sourceExecutionPlanDigest: preview.executionPlanDigest,
    sourceAttemptRecordDigest: preview.attemptRecordDigest,
    previewId: preview.id,
    previewDigest: preview.previewDigest,
    previewEvaluatedAt: preview.evaluatedAt,
    reviewEvidenceDigest: preview.reviewEvidenceDigest,
    sourceProgressDigest: preview.sourceProgressDigest,
    nextAttemptNumber: preview.nextAttemptNumber,
    maxAdditionalBuilderAttempts: preview.maxAdditionalBuilderAttempts,
    targetPathAllowlist: structuredClone(preview.targetPathAllowlist),
    verificationCommands: structuredClone(preview.verificationCommands),
    findings: structuredClone(preview.findings),
    evidenceRefs: structuredClone(preview.evidenceRefs),
    allowedActions: [],
    blockedActions: structuredClone(preview.blockedActions),
    recordApproval: structuredClone(recordApproval),
    recordApprovalDigest: computeRecordApprovalDigest(recordApproval),
    createdAt: recordApproval.reviewedAt,
  };
  record.recordDigest = computeReworkPlanRecordDigest(record);
  assertReworkPlanRecord(record);
  return deepFreeze(record);
}

function isExactReworkPlanReplay(record, request) {
  const approvalDigest = computeRecordApprovalDigest(request.recordApproval);
  return (
    record.executionPlanId === request.executionPlanId &&
    record.reviewerWorkOrderId === request.reviewerWorkOrderId &&
    record.reviewerAttemptId === request.reviewerAttemptId &&
    record.reviewerRunId === request.reviewerRunId &&
    record.reviewArtifactId === request.reviewArtifactId &&
    record.sourceExecutionPlanDigest === request.expectedExecutionPlanDigest &&
    record.sourceAttemptRecordDigest === request.expectedAttemptRecordDigest &&
    record.previewEvaluatedAt === request.evaluatedAt &&
    record.previewId === request.previewId &&
    record.previewDigest === request.previewDigest &&
    record.recordApprovalDigest === approvalDigest &&
    JSON.stringify(canonicalize(record.recordApproval)) ===
      JSON.stringify(canonicalize(request.recordApproval))
  );
}

module.exports = {
  MAX_RATIONALE_BYTES,
  RECORD_APPROVAL_ACKNOWLEDGEMENT,
  RECORD_APPROVAL_DECISION,
  RECORD_APPROVAL_KEYS,
  REWORK_PLAN_RECORD_KEYS,
  REWORK_PLAN_REQUEST_KEYS,
  REWORK_PLAN_STATUS,
  assertReworkPlanRecord,
  computeRecordApprovalDigest,
  computeReworkPlanRecordDigest,
  createReworkPlan,
  isExactReworkPlanReplay,
  normalizeRecordApproval,
  normalizeReworkPlanRequest,
};
