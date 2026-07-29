'use strict';

const crypto = require('crypto');

const REVIEWER_REEXECUTION_DECISION = 'run-reviewer-reexecution';
const REVIEWER_REEXECUTION_ACKNOWLEDGEMENT =
  'review-exact-rework-result-once-and-stop-before-qa';
const REQUEST_KEYS = Object.freeze([
  'builderReworkDispatchDigest',
  'builderReworkDispatchId',
  'builderReworkAttemptId',
  'builderReworkAttemptRecordDigest',
  'evaluatedAt',
  'mutationEvidenceDigest',
  'mutationRunId',
  'reviewerRequest',
  'reviewerWorkOrderDigest',
  'reviewerWorkOrderId',
  'sourceProgressDigest',
  'sourceReviewerAttemptId',
  'sourceReviewerAttemptRecordDigest',
]);
const REVIEWER_REQUEST_KEYS = Object.freeze([
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
]);
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const MAX_RATIONALE_BYTES = 500;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

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

function digestCanonical(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex');
}

function digestBytes(bytes) {
  if (!Buffer.isBuffer(bytes)) throw errorWithStatus('mutation evidence requires exact artifact bytes', 409);
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function normalizeIdentifier(value, label, statusCode = 400) {
  if (typeof value !== 'string' || !IDENTIFIER_PATTERN.test(value) || value.length > 256) {
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

function normalizeRationale(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw errorWithStatus('reviewerRequest.rationale is required');
  }
  const rationale = value.trim().replace(/\s+/g, ' ');
  if (
    /[\u0000-\u001f\u007f]/.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|authorization|password|secret|token)\b/i.test(rationale)
  ) {
    throw errorWithStatus('reviewerRequest.rationale is invalid');
  }
  return rationale;
}

function normalizeReviewerReexecutionRequest(input, options = {}) {
  assertExactKeys(input, REQUEST_KEYS, 'Reviewer re-execution request');
  assertExactKeys(input.reviewerRequest, REVIEWER_REQUEST_KEYS, 'reviewerRequest');
  if (
    input.reviewerRequest.decision !== REVIEWER_REEXECUTION_DECISION ||
    input.reviewerRequest.acknowledgement !== REVIEWER_REEXECUTION_ACKNOWLEDGEMENT
  ) {
    throw errorWithStatus('reviewerRequest authority is invalid');
  }
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  const reviewedAt = normalizeTimestamp(input.reviewerRequest.reviewedAt, 'reviewerRequest.reviewedAt');
  const now = normalizeTimestamp(options.now || new Date().toISOString(), 'runtime now');
  if (evaluatedAt !== reviewedAt || Date.parse(evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('reviewerRequest timestamp is invalid');
  }
  return deepFreeze({
    builderReworkDispatchId: normalizeIdentifier(input.builderReworkDispatchId, 'builderReworkDispatchId'),
    builderReworkDispatchDigest: normalizeDigest(input.builderReworkDispatchDigest, 'builderReworkDispatchDigest'),
    builderReworkAttemptId: normalizeIdentifier(input.builderReworkAttemptId, 'builderReworkAttemptId'),
    builderReworkAttemptRecordDigest: normalizeDigest(input.builderReworkAttemptRecordDigest, 'builderReworkAttemptRecordDigest'),
    mutationRunId: normalizeIdentifier(input.mutationRunId, 'mutationRunId'),
    mutationEvidenceDigest: normalizeDigest(input.mutationEvidenceDigest, 'mutationEvidenceDigest'),
    reviewerWorkOrderId: normalizeIdentifier(input.reviewerWorkOrderId, 'reviewerWorkOrderId'),
    reviewerWorkOrderDigest: normalizeDigest(input.reviewerWorkOrderDigest, 'reviewerWorkOrderDigest'),
    sourceReviewerAttemptId: normalizeIdentifier(input.sourceReviewerAttemptId, 'sourceReviewerAttemptId'),
    sourceReviewerAttemptRecordDigest: normalizeDigest(input.sourceReviewerAttemptRecordDigest, 'sourceReviewerAttemptRecordDigest'),
    sourceProgressDigest: normalizeDigest(input.sourceProgressDigest, 'sourceProgressDigest'),
    evaluatedAt,
    reviewerRequest: {
      decision: REVIEWER_REEXECUTION_DECISION,
      acknowledgement: REVIEWER_REEXECUTION_ACKNOWLEDGEMENT,
      rationale: normalizeRationale(input.reviewerRequest.rationale),
      reviewedAt,
    },
  });
}

function computeReviewerReexecutionRequestDigest(request) {
  return digestCanonical(request);
}

function computeReviewerReexecutionWorkOrderDigest(workOrder) {
  if (!isPlainRecord(workOrder)) {
    throw errorWithStatus('Reviewer re-execution WorkOrder is missing', 409);
  }
  const {
    acceptanceCriterionRefs: _acceptanceCriterionRefs,
    artifactRefs: _artifactRefs,
    attemptRefs: _attemptRefs,
    completedAt: _completedAt,
    completionRunId: _completionRunId,
    inboxItemRefs: _inboxItemRefs,
    reviewArtifactId: _reviewArtifactId,
    runRefs: _runRefs,
    startedAt: _startedAt,
    status: _status,
    updatedAt: _updatedAt,
    ...stableContract
  } = workOrder;
  return digestCanonical(stableContract);
}

function projectRecord(record) {
  if (!record || typeof record !== 'object') throw errorWithStatus('mutation evidence record is missing', 409);
  return structuredClone(record);
}

function normalizeDigestEntries(entries, label) {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw errorWithStatus(`${label} is invalid`, 409);
  }
  return entries.map((entry, index) => {
    assertExactKeys(entry, ['digest', 'path'], `${label}[${index}]`, 409);
    return {
      path: normalizeIdentifier(entry.path, `${label}[${index}].path`, 409),
      digest: normalizeDigest(entry.digest, `${label}[${index}].digest`, 409),
    };
  });
}

function computeMutationEvidenceDigest(input) {
  assertExactKeys(
    input,
    [
      'approval',
      'artifacts',
      'builderAttempt',
      'currentTargetDigests',
      'dispatch',
      'mutationRun',
      'postMutationTargetDigests',
      'sourceReviewerAttempt',
      'sourceReviewerRun',
    ],
    'Reviewer re-execution mutation evidence',
    409,
  );
  if (!Array.isArray(input.artifacts) || input.artifacts.length !== 3) {
    throw errorWithStatus('mutation evidence requires exactly three artifacts', 409);
  }
  const artifacts = input.artifacts.map((entry, index) => {
    assertExactKeys(entry, ['artifact', 'bytes'], `mutation evidence artifact[${index}]`, 409);
    return {
      artifact: projectRecord(entry.artifact),
      contentDigest: digestBytes(entry.bytes),
    };
  });
  return digestCanonical({
    approval: projectRecord(input.approval),
    dispatch: projectRecord(input.dispatch),
    builderAttempt: projectRecord(input.builderAttempt),
    mutationRun: projectRecord(input.mutationRun),
    artifacts,
    postMutationTargetDigests: normalizeDigestEntries(input.postMutationTargetDigests, 'postMutationTargetDigests'),
    currentTargetDigests: normalizeDigestEntries(input.currentTargetDigests, 'currentTargetDigests'),
    sourceReviewerAttempt: projectRecord(input.sourceReviewerAttempt),
    sourceReviewerRun: projectRecord(input.sourceReviewerRun),
  });
}

function isExactReviewerReexecutionReplay(record, requestDigest, mutationEvidenceDigest) {
  return Boolean(
    record &&
      record.metadata?.executionMode === 'rework-reviewer' &&
      record.metadata?.requestDigest === requestDigest &&
      record.metadata?.mutationEvidenceDigest === mutationEvidenceDigest,
  );
}

module.exports = {
  REVIEWER_REEXECUTION_ACKNOWLEDGEMENT,
  REVIEWER_REEXECUTION_DECISION,
  computeMutationEvidenceDigest,
  computeReviewerReexecutionRequestDigest,
  computeReviewerReexecutionWorkOrderDigest,
  deepFreeze,
  digestCanonical,
  isExactReviewerReexecutionReplay,
  normalizeReviewerReexecutionRequest,
};
