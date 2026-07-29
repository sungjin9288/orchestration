'use strict';

const crypto = require('crypto');

const ACTION = 'builder-rework-live-mutation';
const SCOPE = 'builder-rework';
const APPROVAL_DECISION = 'request-builder-rework-mutation-approval';
const APPROVAL_ACKNOWLEDGEMENT =
  'create-one-reviewable-rework-approval-without-source-mutation';
const MAX_RATIONALE_BYTES = 500;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;
const SENSITIVE_CONTENT_PATTERNS = Object.freeze([
  /\b(?:sk|pk|rk)-(?:proj-)?[a-z0-9_-]{12,}/i,
  /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
]);
const REQUEST_KEYS = Object.freeze([
  'approvalRequest',
  'builderReworkDispatchDigest',
  'builderReworkDispatchId',
  'evaluatedAt',
  'preflightArtifactContentDigest',
  'preflightArtifactId',
  'preflightArtifactRecordDigest',
  'preflightRunId',
  'preflightRunRecordDigest',
  'sourceProgressDigest',
  'workOrderAttemptId',
  'workOrderAttemptRecordDigest',
]);
const APPROVAL_REQUEST_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);
const METADATA_KEYS = Object.freeze([
  'bindingDigest',
  'builderReworkDispatchDigest',
  'builderReworkDispatchId',
  'executionPlanId',
  'preflightArtifactContentDigest',
  'preflightArtifactId',
  'preflightArtifactRecordDigest',
  'preflightRunId',
  'preflightRunRecordDigest',
  'reviewDecisionInboxItemRefs',
  'reviewEvidenceDigest',
  'reworkPlanAcceptanceDigest',
  'reworkPlanAcceptanceId',
  'reworkPlanId',
  'reworkPlanRecordDigest',
  'sourceAttemptRecordDigest',
  'sourceExecutionPlanDigest',
  'sourceProgressDigest',
  'workOrderAttemptId',
  'workOrderAttemptRecordDigest',
]);
const RUN_PROJECTION_KEYS = Object.freeze([
  'finishedAt',
  'id',
  'kind',
  'logPath',
  'metadata',
  'role',
  'startedAt',
  'status',
  'summary',
  'taskId',
]);
const ARTIFACT_PROJECTION_KEYS = Object.freeze([
  'createdAt',
  'id',
  'path',
  'runId',
  'taskId',
  'type',
]);

function errorWithStatus(message, statusCode = 400) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function isPlainRecord(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function assertExactKeys(value, expectedKeys, label, statusCode = 400) {
  if (!isPlainRecord(value)) {
    throw errorWithStatus(`${label} must be an object`, statusCode);
  }
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((field, index) => field !== expected[index])
  ) {
    throw errorWithStatus(`${label} has unexpected or missing fields`, statusCode);
  }
}

function normalizeIdentifier(value, label, statusCode = 400) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) {
    throw errorWithStatus(`${label} must be an exact non-empty identifier`, statusCode);
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

function normalizeStringArray(value, label, statusCode = 409) {
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== 'string' || !entry) ||
    new Set(value).size !== value.length
  ) {
    throw errorWithStatus(`${label} must be a unique string array`, statusCode);
  }
  return [...value];
}

function canonicalize(value, path = 'value') {
  if (value === undefined) {
    throw errorWithStatus(`${path} contains undefined`, 409);
  }
  if (Array.isArray(value)) {
    return value.map((entry, index) => canonicalize(entry, `${path}[${index}]`));
  }
  if (isPlainRecord(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key], `${path}.${key}`)]),
    );
  }
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean' ||
    (typeof value === 'number' && Number.isFinite(value))
  ) {
    return value;
  }
  throw errorWithStatus(`${path} contains a non-JSON value`, 409);
}

function digestCanonical(value) {
  return crypto
    .createHash('sha256')
    .update(Buffer.from(JSON.stringify(canonicalize(value)), 'utf8'))
    .digest('hex');
}

function digestBytes(value) {
  if (!Buffer.isBuffer(value)) {
    throw errorWithStatus('Artifact content must be provided as exact bytes', 409);
  }
  return crypto.createHash('sha256').update(value).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeRationale(value, statusCode = 400) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus('approvalRequest.rationale is required', statusCode);
  }
  const rationale = value.trim().replace(/\s+/g, ' ');
  if (
    CONTROL_CHARACTER_PATTERN.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    SENSITIVE_CONTENT_PATTERNS.some((pattern) => pattern.test(rationale))
  ) {
    throw errorWithStatus('approvalRequest.rationale is invalid', statusCode);
  }
  return rationale;
}

function normalizeBuilderReworkMutationApprovalRequest(input, options = {}) {
  assertExactKeys(input, REQUEST_KEYS, 'Builder rework mutation approval request');
  assertExactKeys(
    input.approvalRequest,
    APPROVAL_REQUEST_KEYS,
    'approvalRequest',
  );
  if (
    input.approvalRequest.decision !== APPROVAL_DECISION ||
    input.approvalRequest.acknowledgement !== APPROVAL_ACKNOWLEDGEMENT
  ) {
    throw errorWithStatus('approvalRequest authority is invalid');
  }
  const reviewedAt = normalizeTimestamp(
    input.approvalRequest.reviewedAt,
    'approvalRequest.reviewedAt',
  );
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  if (evaluatedAt !== reviewedAt) {
    throw errorWithStatus('evaluatedAt must equal approvalRequest.reviewedAt');
  }
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
  );
  if (Date.parse(reviewedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('approvalRequest.reviewedAt is outside the allowed window');
  }
  if (
    options.preflightCompletedAt &&
    Date.parse(reviewedAt) < Date.parse(options.preflightCompletedAt)
  ) {
    throw errorWithStatus(
      'approvalRequest.reviewedAt predates the completed rework preflight',
      409,
    );
  }
  return deepFreeze({
    builderReworkDispatchId: normalizeIdentifier(
      input.builderReworkDispatchId,
      'builderReworkDispatchId',
    ),
    builderReworkDispatchDigest: normalizeDigest(
      input.builderReworkDispatchDigest,
      'builderReworkDispatchDigest',
    ),
    workOrderAttemptId: normalizeIdentifier(
      input.workOrderAttemptId,
      'workOrderAttemptId',
    ),
    workOrderAttemptRecordDigest: normalizeDigest(
      input.workOrderAttemptRecordDigest,
      'workOrderAttemptRecordDigest',
    ),
    preflightRunId: normalizeIdentifier(input.preflightRunId, 'preflightRunId'),
    preflightRunRecordDigest: normalizeDigest(
      input.preflightRunRecordDigest,
      'preflightRunRecordDigest',
    ),
    preflightArtifactId: normalizeIdentifier(
      input.preflightArtifactId,
      'preflightArtifactId',
    ),
    preflightArtifactRecordDigest: normalizeDigest(
      input.preflightArtifactRecordDigest,
      'preflightArtifactRecordDigest',
    ),
    preflightArtifactContentDigest: normalizeDigest(
      input.preflightArtifactContentDigest,
      'preflightArtifactContentDigest',
    ),
    sourceProgressDigest: normalizeDigest(
      input.sourceProgressDigest,
      'sourceProgressDigest',
    ),
    evaluatedAt,
    approvalRequest: {
      decision: APPROVAL_DECISION,
      acknowledgement: APPROVAL_ACKNOWLEDGEMENT,
      rationale: normalizeRationale(input.approvalRequest.rationale),
      reviewedAt,
    },
  });
}

function projectRun(run) {
  const projection = Object.fromEntries(
    RUN_PROJECTION_KEYS.map((field) => {
      if (!Object.prototype.hasOwnProperty.call(run, field)) {
        throw errorWithStatus(`Run projection is missing ${field}`, 409);
      }
      return [field, run[field]];
    }),
  );
  return projection;
}

function projectArtifact(artifact) {
  const projection = Object.fromEntries(
    ARTIFACT_PROJECTION_KEYS.map((field) => {
      if (!Object.prototype.hasOwnProperty.call(artifact, field)) {
        throw errorWithStatus(`Artifact projection is missing ${field}`, 409);
      }
      return [field, artifact[field]];
    }),
  );
  return projection;
}

function computePreflightRunRecordDigest(run) {
  return digestCanonical(projectRun(run));
}

function computePreflightArtifactRecordDigest(artifact) {
  return digestCanonical(projectArtifact(artifact));
}

function computePreflightArtifactContentDigest(bytes) {
  return digestBytes(bytes);
}

function buildBuilderReworkMutationApprovalMetadata(source) {
  const metadata = {
    builderReworkDispatchId: normalizeIdentifier(
      source.builderReworkDispatchId,
      'builderReworkDispatchId',
      409,
    ),
    builderReworkDispatchDigest: normalizeDigest(
      source.builderReworkDispatchDigest,
      'builderReworkDispatchDigest',
      409,
    ),
    executionPlanId: normalizeIdentifier(
      source.executionPlanId,
      'executionPlanId',
      409,
    ),
    workOrderAttemptId: normalizeIdentifier(
      source.workOrderAttemptId,
      'workOrderAttemptId',
      409,
    ),
    workOrderAttemptRecordDigest: normalizeDigest(
      source.workOrderAttemptRecordDigest,
      'workOrderAttemptRecordDigest',
      409,
    ),
    preflightRunId: normalizeIdentifier(source.preflightRunId, 'preflightRunId', 409),
    preflightRunRecordDigest: normalizeDigest(
      source.preflightRunRecordDigest,
      'preflightRunRecordDigest',
      409,
    ),
    preflightArtifactId: normalizeIdentifier(
      source.preflightArtifactId,
      'preflightArtifactId',
      409,
    ),
    preflightArtifactRecordDigest: normalizeDigest(
      source.preflightArtifactRecordDigest,
      'preflightArtifactRecordDigest',
      409,
    ),
    preflightArtifactContentDigest: normalizeDigest(
      source.preflightArtifactContentDigest,
      'preflightArtifactContentDigest',
      409,
    ),
    reworkPlanId: normalizeIdentifier(source.reworkPlanId, 'reworkPlanId', 409),
    reworkPlanRecordDigest: normalizeDigest(
      source.reworkPlanRecordDigest,
      'reworkPlanRecordDigest',
      409,
    ),
    reworkPlanAcceptanceId: normalizeIdentifier(
      source.reworkPlanAcceptanceId,
      'reworkPlanAcceptanceId',
      409,
    ),
    reworkPlanAcceptanceDigest: normalizeDigest(
      source.reworkPlanAcceptanceDigest,
      'reworkPlanAcceptanceDigest',
      409,
    ),
    sourceExecutionPlanDigest: normalizeDigest(
      source.sourceExecutionPlanDigest,
      'sourceExecutionPlanDigest',
      409,
    ),
    sourceAttemptRecordDigest: normalizeDigest(
      source.sourceAttemptRecordDigest,
      'sourceAttemptRecordDigest',
      409,
    ),
    reviewEvidenceDigest: normalizeDigest(
      source.reviewEvidenceDigest,
      'reviewEvidenceDigest',
      409,
    ),
    sourceProgressDigest: normalizeDigest(
      source.sourceProgressDigest,
      'sourceProgressDigest',
      409,
    ),
    reviewDecisionInboxItemRefs: normalizeStringArray(
      source.reviewDecisionInboxItemRefs,
      'reviewDecisionInboxItemRefs',
      409,
    ),
  };
  return deepFreeze({
    ...metadata,
    bindingDigest: digestCanonical(metadata),
  });
}

function assertBuilderReworkMutationApprovalMetadata(metadata) {
  assertExactKeys(metadata, METADATA_KEYS, 'Builder rework mutation metadata', 409);
  const normalized = buildBuilderReworkMutationApprovalMetadata(metadata);
  if (metadata.bindingDigest !== normalized.bindingDigest) {
    throw errorWithStatus(
      'Builder rework mutation metadata binding is invalid',
      409,
    );
  }
  return metadata;
}

function assertBuilderReworkMutationApprovalRecord(approval) {
  if (!isPlainRecord(approval)) {
    throw errorWithStatus('Builder rework mutation Approval is invalid', 409);
  }
  if (
    approval.allowedNextAction !== ACTION ||
    approval.scope !== SCOPE ||
    approval.placeholder !== true ||
    !['pending', 'approved', 'rejected'].includes(approval.status) ||
    typeof approval.prompt !== 'string' ||
    normalizeRationale(approval.prompt, 409) !== approval.prompt ||
    typeof approval.title !== 'string' ||
    !approval.title ||
    typeof approval.targetArtifactId !== 'string' ||
    typeof approval.targetRunId !== 'string'
  ) {
    throw errorWithStatus(
      'Builder rework mutation Approval contract is invalid',
      409,
    );
  }
  assertBuilderReworkMutationApprovalMetadata(approval.metadata);
  if (
    approval.targetRunId !== approval.metadata.preflightRunId ||
    approval.targetArtifactId !== approval.metadata.preflightArtifactId
  ) {
    throw errorWithStatus(
      'Builder rework mutation Approval target binding is invalid',
      409,
    );
  }
  normalizeTimestamp(approval.createdAt, 'Approval createdAt', 409);
  normalizeTimestamp(approval.updatedAt, 'Approval updatedAt', 409);
  if (
    (approval.status === 'pending' && approval.resolvedAt !== null) ||
    (approval.status !== 'pending' &&
      normalizeTimestamp(approval.resolvedAt, 'Approval resolvedAt', 409) !==
        approval.resolvedAt)
  ) {
    throw errorWithStatus(
      'Builder rework mutation Approval lifecycle is invalid',
      409,
    );
  }
  return approval;
}

function isExactBuilderReworkMutationApprovalReplay(
  approval,
  request,
  metadata,
) {
  try {
    assertBuilderReworkMutationApprovalRecord(approval);
  } catch (_error) {
    return false;
  }
  return Boolean(
    approval.targetRunId === request.preflightRunId &&
      approval.targetArtifactId === request.preflightArtifactId &&
      approval.createdAt === request.evaluatedAt &&
      approval.prompt === request.approvalRequest.rationale &&
      digestCanonical(approval.metadata) === digestCanonical(metadata),
  );
}

module.exports = {
  ACTION,
  APPROVAL_ACKNOWLEDGEMENT,
  APPROVAL_DECISION,
  APPROVAL_REQUEST_KEYS,
  METADATA_KEYS,
  REQUEST_KEYS,
  SCOPE,
  assertBuilderReworkMutationApprovalMetadata,
  assertBuilderReworkMutationApprovalRecord,
  buildBuilderReworkMutationApprovalMetadata,
  canonicalize,
  computePreflightArtifactContentDigest,
  computePreflightArtifactRecordDigest,
  computePreflightRunRecordDigest,
  digestCanonical,
  isExactBuilderReworkMutationApprovalReplay,
  normalizeBuilderReworkMutationApprovalRequest,
};
