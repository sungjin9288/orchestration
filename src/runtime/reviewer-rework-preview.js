'use strict';

const crypto = require('crypto');

const {
  parseReviewerArtifactContent,
} = require('../execution/coordinator/artifact-content');

const REVIEWER_REWORK_REQUEST_KEYS = Object.freeze([
  'executionPlanId',
  'reviewerWorkOrderId',
  'reviewerAttemptId',
  'reviewerRunId',
  'reviewArtifactId',
  'expectedExecutionPlanDigest',
  'expectedAttemptRecordDigest',
  'evaluatedAt',
]);

const REVIEWER_REWORK_EVIDENCE_KEYS = Object.freeze([
  'missionRef',
  'staffingPlanRef',
  'staffingEntryRef',
  'councilSessionRef',
  'builderWorkOrderRef',
  'builderRunRef',
  'reviewerWorkOrderRef',
  'reviewerAttemptRef',
  'reviewerRunRef',
  'reviewArtifactRef',
  'decisionInboxItemRefs',
]);

const REVIEWER_REWORK_BLOCKED_ACTIONS = Object.freeze([
  'persist-rework-plan',
  'append-builder-work-order',
  'append-work-order-attempt',
  'start-rework',
  'run-preflight',
  'request-approval',
  'resolve-approval',
  'mutate-source',
  'run-reviewer',
  'run-qa',
  'retry-automatically',
  'schedule-background',
  'execute-provider',
  'apply-memory',
  'commit',
  'push',
  'release',
  'mutate-policy',
  'bypass-approval',
  'enumerate-rework-plans',
]);

const REVIEWER_REWORK_RESPONSE_KEYS = Object.freeze([
  'id',
  'schemaVersion',
  'persisted',
  'status',
  'executionPlanId',
  'reviewerWorkOrderId',
  'reviewerAttemptId',
  'reviewerRunId',
  'reviewArtifactId',
  'executionPlanDigest',
  'attemptRecordDigest',
  'reviewEvidenceDigest',
  'sourceProgressDigest',
  'evaluatedAt',
  'nextAttemptNumber',
  'maxAdditionalBuilderAttempts',
  'targetPathAllowlist',
  'verificationCommands',
  'findings',
  'evidenceRefs',
  'allowedActions',
  'blockedActions',
  'previewDigest',
]);

const SOURCE_KEYS = Object.freeze([
  'executionPlanDigest',
  'attemptRecordDigest',
  'reviewerCompletedAt',
  'reviewArtifact',
  'reviewArtifactBytes',
  'builderRunId',
  'builderChangedFiles',
  'builderArtifactRefs',
  'targetPathAllowlist',
  'verificationCommands',
  'evidenceRefs',
]);

const REVIEW_ARTIFACT_KEYS = Object.freeze([
  'artifactId',
  'artifactType',
  'artifactTaskId',
  'artifactRunId',
]);

const FINDING_KEYS = Object.freeze([
  'findingId',
  'text',
  'findingDigest',
]);

const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const MAX_IDENTIFIER_LENGTH = 256;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const MAX_REVIEW_ARTIFACT_BYTES = 64 * 1024;
const MAX_FINDING_COUNT = 32;
const MAX_FINDING_BYTES = 512;
const MAX_REFERENCE_COUNT = 128;

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function errorWithStatus(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
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
    throw errorWithStatus(
      `${label} has unexpected or missing fields`,
      statusCode,
    );
  }
}

function normalizeIdentifier(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus(`${label} is required`, 400);
  }
  const normalized = value.trim();
  if (
    normalized.length > MAX_IDENTIFIER_LENGTH ||
    !IDENTIFIER_PATTERN.test(normalized)
  ) {
    throw errorWithStatus(`${label} is invalid`, 400);
  }
  return normalized;
}

function normalizeDigest(value, label) {
  if (typeof value !== 'string' || !DIGEST_PATTERN.test(value)) {
    throw errorWithStatus(`${label} must be a lowercase SHA-256 digest`, 400);
  }
  return value;
}

function normalizeTimestamp(value, label) {
  if (
    typeof value !== 'string' ||
    Number.isNaN(Date.parse(value)) ||
    new Date(value).toISOString() !== value
  ) {
    throw errorWithStatus(`${label} must be an exact ISO timestamp`, 400);
  }
  return value;
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

function normalizeReviewerReworkPreviewRequest(input) {
  assertExactKeys(
    input,
    REVIEWER_REWORK_REQUEST_KEYS,
    'ReviewerReworkPlanPreview request',
  );
  return deepFreeze({
    executionPlanId: normalizeIdentifier(input.executionPlanId, 'executionPlanId'),
    reviewerWorkOrderId: normalizeIdentifier(
      input.reviewerWorkOrderId,
      'reviewerWorkOrderId',
    ),
    reviewerAttemptId: normalizeIdentifier(
      input.reviewerAttemptId,
      'reviewerAttemptId',
    ),
    reviewerRunId: normalizeIdentifier(input.reviewerRunId, 'reviewerRunId'),
    reviewArtifactId: normalizeIdentifier(
      input.reviewArtifactId,
      'reviewArtifactId',
    ),
    expectedExecutionPlanDigest: normalizeDigest(
      input.expectedExecutionPlanDigest,
      'expectedExecutionPlanDigest',
    ),
    expectedAttemptRecordDigest: normalizeDigest(
      input.expectedAttemptRecordDigest,
      'expectedAttemptRecordDigest',
    ),
    evaluatedAt: normalizeTimestamp(input.evaluatedAt, 'evaluatedAt'),
  });
}

function normalizeExactStringArray(value, label, { allowEmpty = false } = {}) {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    value.length > MAX_REFERENCE_COUNT
  ) {
    throw errorWithStatus(`${label} is invalid`, 409);
  }
  return value.map((entry, index) => {
    if (
      typeof entry !== 'string' ||
      !entry ||
      entry !== entry.trim() ||
      CONTROL_CHARACTER_PATTERN.test(entry)
    ) {
      throw errorWithStatus(`${label}[${index}] is invalid`, 409);
    }
    return entry;
  });
}

function normalizeEvidenceRefs(value) {
  assertExactKeys(
    value,
    REVIEWER_REWORK_EVIDENCE_KEYS,
    'ReviewerReworkPlanPreview evidenceRefs',
    409,
  );
  const normalized = {};
  for (const key of REVIEWER_REWORK_EVIDENCE_KEYS) {
    if (key === 'decisionInboxItemRefs') {
      normalized[key] = normalizeExactStringArray(value[key], `evidenceRefs.${key}`, {
        allowEmpty: true,
      }).map((entry) => normalizeIdentifier(entry, `evidenceRefs.${key}`));
    } else {
      normalized[key] = normalizeIdentifier(value[key], `evidenceRefs.${key}`);
    }
  }
  return normalized;
}

function normalizeReviewFinding(value, index, reviewArtifactId) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus(`review finding ${index + 1} is empty`, 409);
  }
  if (CONTROL_CHARACTER_PATTERN.test(value)) {
    throw errorWithStatus(`review finding ${index + 1} contains control characters`, 409);
  }
  const text = value.trim().replace(/\s+/g, ' ');
  if (Buffer.byteLength(text, 'utf8') > MAX_FINDING_BYTES) {
    throw errorWithStatus(`review finding ${index + 1} exceeds the byte cap`, 409);
  }
  const sensitivePatterns = [
    /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|api[_-]?key|access[_-]?token|refresh[_-]?token)\b/i,
    /\b(?:authorization|password|passwd|secret|token)\s*[:=]\s*\S+/i,
    /(?:^|\s)[A-Z][A-Z0-9_]{1,63}=\S+/,
    /(?:^|\s)(?:\/(?:Users|home|private|tmp|var|etc|opt)\/|[A-Za-z]:\\)/,
    /\b(?:raw (?:artifact|body|command output|response)|prompt (?:body|content)|provider payload|transcript|stdout|stderr|chain[- ]of[- ]thought)\b/i,
    /```/,
  ];
  if (sensitivePatterns.some((pattern) => pattern.test(text))) {
    throw errorWithStatus(
      `review finding ${index + 1} contains disallowed raw or sensitive content`,
      409,
    );
  }
  const findingId = `rework-finding-${String(index + 1).padStart(2, '0')}`;
  const finding = {
    findingId,
    text,
    findingDigest: digestCanonical({
      reviewArtifactId,
      findingIndex: index + 1,
      text,
    }),
  };
  assertExactKeys(
    finding,
    FINDING_KEYS,
    `ReviewerReworkPlanPreview finding ${index + 1}`,
    409,
  );
  return finding;
}

function parseSourceOrderedFindings(content) {
  const match = String(content || '').match(
    /^## Findings\s*\n([\s\S]*?)(?=^## [^\n]+\n|(?![\s\S]))/m,
  );
  if (!match) return [];
  return match[1]
    .split(/\r?\n/)
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, ''));
}

function computeReviewerReworkPreviewDigest(preview) {
  const { id: _id, previewDigest: _previewDigest, ...payload } = preview;
  return digestCanonical(payload);
}

function buildReviewerReworkPlanPreview(requestInput, sourceInput, options = {}) {
  const request = normalizeReviewerReworkPreviewRequest(requestInput);
  assertExactKeys(
    sourceInput,
    SOURCE_KEYS,
    'ReviewerReworkPlanPreview source',
    409,
  );
  const now = normalizeTimestamp(
    options.now || new Date().toISOString(),
    'runtime now',
  );
  if (Date.parse(request.evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('evaluatedAt is too far in the future', 400);
  }

  const executionPlanDigest = normalizeDigest(
    sourceInput.executionPlanDigest,
    'source executionPlanDigest',
  );
  const attemptRecordDigest = normalizeDigest(
    sourceInput.attemptRecordDigest,
    'source attemptRecordDigest',
  );
  if (
    request.expectedExecutionPlanDigest !== executionPlanDigest ||
    request.expectedAttemptRecordDigest !== attemptRecordDigest
  ) {
    throw errorWithStatus('ReviewerReworkPlanPreview source digest is stale', 409);
  }

  const reviewerCompletedAt = normalizeTimestamp(
    sourceInput.reviewerCompletedAt,
    'source reviewerCompletedAt',
  );
  if (Date.parse(request.evaluatedAt) < Date.parse(reviewerCompletedAt)) {
    throw errorWithStatus('evaluatedAt precedes Reviewer completion', 409);
  }

  assertExactKeys(
    sourceInput.reviewArtifact,
    REVIEW_ARTIFACT_KEYS,
    'ReviewerReworkPlanPreview reviewArtifact',
    409,
  );
  const reviewArtifact = {
    artifactId: normalizeIdentifier(
      sourceInput.reviewArtifact.artifactId,
      'reviewArtifact.artifactId',
    ),
    artifactType: normalizeIdentifier(
      sourceInput.reviewArtifact.artifactType,
      'reviewArtifact.artifactType',
    ),
    artifactTaskId: normalizeIdentifier(
      sourceInput.reviewArtifact.artifactTaskId,
      'reviewArtifact.artifactTaskId',
    ),
    artifactRunId: normalizeIdentifier(
      sourceInput.reviewArtifact.artifactRunId,
      'reviewArtifact.artifactRunId',
    ),
  };
  if (
    reviewArtifact.artifactId !== request.reviewArtifactId ||
    reviewArtifact.artifactRunId !== request.reviewerRunId ||
    reviewArtifact.artifactType !== 'review'
  ) {
    throw errorWithStatus('ReviewerReworkPlanPreview Artifact binding is stale', 409);
  }
  if (
    !Buffer.isBuffer(sourceInput.reviewArtifactBytes) ||
    sourceInput.reviewArtifactBytes.length === 0 ||
    sourceInput.reviewArtifactBytes.length > MAX_REVIEW_ARTIFACT_BYTES
  ) {
    throw errorWithStatus('ReviewerReworkPlanPreview Artifact bytes are invalid', 409);
  }

  let parsedReview;
  try {
    parsedReview = parseReviewerArtifactContent(
      sourceInput.reviewArtifactBytes.toString('utf8'),
    );
  } catch (error) {
    throw errorWithStatus(`Review Artifact is malformed: ${error.message}`, 409);
  }
  const builderRunId = normalizeIdentifier(
    sourceInput.builderRunId,
    'source builderRunId',
  );
  if (
    parsedReview.verdict !== 'changes_requested' ||
    parsedReview.sourceBuilderRunId !== builderRunId
  ) {
    throw errorWithStatus('Review Artifact is not a current changes-requested source', 409);
  }
  const sourceFindings = parseSourceOrderedFindings(
    sourceInput.reviewArtifactBytes.toString('utf8'),
  );
  if (
    sourceFindings.length < 1 ||
    sourceFindings.length > MAX_FINDING_COUNT
  ) {
    throw errorWithStatus('Review Artifact must contain 1 through 32 findings', 409);
  }
  const findings = sourceFindings.map((finding, index) =>
    normalizeReviewFinding(finding, index, reviewArtifact.artifactId));

  const targetPathAllowlist = normalizeExactStringArray(
    sourceInput.targetPathAllowlist,
    'source targetPathAllowlist',
  );
  const verificationCommands = normalizeExactStringArray(
    sourceInput.verificationCommands,
    'source verificationCommands',
  );
  const builderChangedFiles = normalizeExactStringArray(
    sourceInput.builderChangedFiles,
    'source builderChangedFiles',
  );
  const builderArtifactRefs = normalizeExactStringArray(
    sourceInput.builderArtifactRefs,
    'source builderArtifactRefs',
  ).map((entry) => normalizeIdentifier(entry, 'source builderArtifactRefs'));
  const evidenceRefs = normalizeEvidenceRefs(sourceInput.evidenceRefs);
  const contentSha256 = crypto
    .createHash('sha256')
    .update(sourceInput.reviewArtifactBytes)
    .digest('hex');
  const reviewEvidenceDigest = digestCanonical({
    artifactId: reviewArtifact.artifactId,
    artifactType: reviewArtifact.artifactType,
    artifactTaskId: reviewArtifact.artifactTaskId,
    artifactRunId: reviewArtifact.artifactRunId,
    contentSha256,
    parsedVerdict: parsedReview.verdict,
    sourceBuilderRunId: builderRunId,
    findingCount: findings.length,
  });
  const sourceProgressDigest = digestCanonical({
    builderRunId,
    builderChangedFiles,
    builderArtifactRefs,
    reviewerRunId: request.reviewerRunId,
    reviewArtifactId: request.reviewArtifactId,
    findingDigests: findings.map((finding) => finding.findingDigest),
    targetPathAllowlist,
    verificationCommands,
  });
  const payload = {
    schemaVersion: 21,
    persisted: false,
    status: 'rework-review-required',
    executionPlanId: request.executionPlanId,
    reviewerWorkOrderId: request.reviewerWorkOrderId,
    reviewerAttemptId: request.reviewerAttemptId,
    reviewerRunId: request.reviewerRunId,
    reviewArtifactId: request.reviewArtifactId,
    executionPlanDigest,
    attemptRecordDigest,
    reviewEvidenceDigest,
    sourceProgressDigest,
    evaluatedAt: request.evaluatedAt,
    nextAttemptNumber: 2,
    maxAdditionalBuilderAttempts: 1,
    targetPathAllowlist: [...targetPathAllowlist],
    verificationCommands: [...verificationCommands],
    findings,
    evidenceRefs,
    allowedActions: [],
    blockedActions: [...REVIEWER_REWORK_BLOCKED_ACTIONS],
  };
  const previewDigest = digestCanonical(payload);
  const preview = {
    id: `reviewer-rework-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  };
  assertExactKeys(
    preview,
    REVIEWER_REWORK_RESPONSE_KEYS,
    'ReviewerReworkPlanPreview response',
    409,
  );
  return deepFreeze(preview);
}

module.exports = {
  FINDING_KEYS,
  MAX_REVIEW_ARTIFACT_BYTES,
  REVIEWER_REWORK_BLOCKED_ACTIONS,
  REVIEWER_REWORK_EVIDENCE_KEYS,
  REVIEWER_REWORK_REQUEST_KEYS,
  REVIEWER_REWORK_RESPONSE_KEYS,
  buildReviewerReworkPlanPreview,
  canonicalize,
  computeReviewerReworkPreviewDigest,
  deepFreeze,
  digestCanonical,
  normalizeReviewerReworkPreviewRequest,
};
