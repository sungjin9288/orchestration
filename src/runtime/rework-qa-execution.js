'use strict';

const crypto = require('crypto');

const REWORK_QA_DECISION = 'run-rework-qa-once';
const REWORK_QA_ACKNOWLEDGEMENT =
  'run-only-source-bound-node-checks-and-stop-before-delivery-package';
const REQUEST_KEYS = Object.freeze([
  'authorityDigest',
  'checkpointDigest',
  'evaluatedAt',
  'inputDigest',
  'mutationEvidenceDigest',
  'qaInputDigest',
  'qaReadyCheckpointId',
  'qaRequest',
  'qaWorkOrderDigest',
  'qaWorkOrderId',
  'reviewerEvidenceDigest',
  'reviewerReexecutionAttemptId',
  'reviewerReexecutionAttemptRecordDigest',
  'reviewerRunId',
  'sourceDigest',
]);
const QA_REQUEST_KEYS = Object.freeze([
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

function digestBytes(value, label) {
  if (!Buffer.isBuffer(value)) {
    throw errorWithStatus(`${label} requires exact bytes`, 409);
  }
  return crypto.createHash('sha256').update(value).digest('hex');
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
    throw errorWithStatus('qaRequest.rationale is required');
  }
  const rationale = value.trim().replace(/\s+/g, ' ');
  if (
    /[\u0000-\u001f\u007f]/.test(rationale) ||
    Buffer.byteLength(rationale, 'utf8') > MAX_RATIONALE_BYTES ||
    /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]+|authorization|password|secret|token)\b/i.test(rationale)
  ) {
    throw errorWithStatus('qaRequest.rationale is invalid');
  }
  return rationale;
}

function normalizeReworkQaExecutionRequest(input, options = {}) {
  assertExactKeys(input, REQUEST_KEYS, 'Rework QA execution request');
  assertExactKeys(input.qaRequest, QA_REQUEST_KEYS, 'qaRequest');
  if (
    input.qaRequest.decision !== REWORK_QA_DECISION ||
    input.qaRequest.acknowledgement !== REWORK_QA_ACKNOWLEDGEMENT
  ) {
    throw errorWithStatus('qaRequest authority is invalid');
  }
  const evaluatedAt = normalizeTimestamp(input.evaluatedAt, 'evaluatedAt');
  const reviewedAt = normalizeTimestamp(input.qaRequest.reviewedAt, 'qaRequest.reviewedAt');
  const now = normalizeTimestamp(options.now || new Date().toISOString(), 'runtime now');
  if (evaluatedAt !== reviewedAt || Date.parse(evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw errorWithStatus('qaRequest timestamp is invalid');
  }
  return deepFreeze({
    reviewerReexecutionAttemptId: normalizeIdentifier(
      input.reviewerReexecutionAttemptId,
      'reviewerReexecutionAttemptId',
    ),
    reviewerReexecutionAttemptRecordDigest: normalizeDigest(
      input.reviewerReexecutionAttemptRecordDigest,
      'reviewerReexecutionAttemptRecordDigest',
    ),
    reviewerRunId: normalizeIdentifier(input.reviewerRunId, 'reviewerRunId'),
    reviewerEvidenceDigest: normalizeDigest(input.reviewerEvidenceDigest, 'reviewerEvidenceDigest'),
    mutationEvidenceDigest: normalizeDigest(input.mutationEvidenceDigest, 'mutationEvidenceDigest'),
    qaWorkOrderId: normalizeIdentifier(input.qaWorkOrderId, 'qaWorkOrderId'),
    qaWorkOrderDigest: normalizeDigest(input.qaWorkOrderDigest, 'qaWorkOrderDigest'),
    qaReadyCheckpointId: normalizeIdentifier(input.qaReadyCheckpointId, 'qaReadyCheckpointId'),
    checkpointDigest: normalizeDigest(input.checkpointDigest, 'checkpointDigest'),
    inputDigest: normalizeDigest(input.inputDigest, 'inputDigest'),
    authorityDigest: normalizeDigest(input.authorityDigest, 'authorityDigest'),
    sourceDigest: normalizeDigest(input.sourceDigest, 'sourceDigest'),
    qaInputDigest: normalizeDigest(input.qaInputDigest, 'qaInputDigest'),
    evaluatedAt,
    qaRequest: {
      decision: REWORK_QA_DECISION,
      acknowledgement: REWORK_QA_ACKNOWLEDGEMENT,
      rationale: normalizeRationale(input.qaRequest.rationale),
      reviewedAt,
    },
  });
}

function computeReworkQaExecutionRequestDigest(request) {
  return digestCanonical(
    normalizeReworkQaExecutionRequest(request, { now: request.evaluatedAt }),
  );
}

function computeReviewerEvidenceDigest(input) {
  assertExactKeys(
    input,
    [
      'mutationEvidenceDigest',
      'qaReadyCheckpoint',
      'reviewArtifact',
      'reviewArtifactBytes',
      'reviewerAttempt',
      'reviewerRun',
    ],
    'Rework QA Reviewer evidence',
    409,
  );
  return digestCanonical({
    reviewerAttempt: structuredClone(input.reviewerAttempt),
    reviewerRun: structuredClone(input.reviewerRun),
    reviewArtifact: structuredClone(input.reviewArtifact),
    reviewArtifactContentDigest: digestBytes(input.reviewArtifactBytes, 'Reviewer review Artifact'),
    mutationEvidenceDigest: normalizeDigest(input.mutationEvidenceDigest, 'mutationEvidenceDigest', 409),
    qaReadyCheckpoint: {
      authorityDigest: normalizeDigest(
        input.qaReadyCheckpoint?.authorityDigest,
        'qaReadyCheckpoint.authorityDigest',
        409,
      ),
      checkpointDigest: normalizeDigest(
        input.qaReadyCheckpoint?.checkpointDigest,
        'qaReadyCheckpoint.checkpointDigest',
        409,
      ),
      id: normalizeIdentifier(input.qaReadyCheckpoint?.id, 'qaReadyCheckpoint.id', 409),
      inputDigest: normalizeDigest(
        input.qaReadyCheckpoint?.inputDigest,
        'qaReadyCheckpoint.inputDigest',
        409,
      ),
      stage: input.qaReadyCheckpoint?.stage,
    },
  });
}

function computeQaInputDigest(input) {
  assertExactKeys(
    input,
    [
      'builderRunId',
      'changedFiles',
      'qaWorkOrder',
      'reviewerRunId',
      'targetFileDigests',
      'targetPathAllowlist',
      'verificationCommands',
    ],
    'Rework QA input',
    409,
  );
  return digestCanonical({
    builderRunId: normalizeIdentifier(input.builderRunId, 'builderRunId', 409),
    reviewerRunId: normalizeIdentifier(input.reviewerRunId, 'reviewerRunId', 409),
    qaWorkOrder: structuredClone(input.qaWorkOrder),
    changedFiles: [...input.changedFiles],
    targetPathAllowlist: [...input.targetPathAllowlist],
    verificationCommands: [...input.verificationCommands],
    targetFileDigests: input.targetFileDigests.map((entry) => ({
      digest: normalizeDigest(entry.digest, 'targetFileDigests digest', 409),
      path: normalizeIdentifier(entry.path, 'targetFileDigests path', 409),
    })),
  });
}

function buildPreConsumeQaReadyProjection(source) {
  return deepFreeze({
    authorityDigest: source.qaReadyCheckpoint.authorityDigest,
    checkpointDigest: source.qaReadyCheckpoint.checkpointDigest,
    inputDigest: source.qaReadyCheckpoint.inputDigest,
    mutationEvidenceDigest: source.mutationEvidenceDigest,
    qaInputDigest: source.qaInputDigest,
    qaReadyCheckpointId: source.qaReadyCheckpoint.id,
    qaWorkOrderDigest: source.qaWorkOrderDigest || null,
    qaWorkOrderId: source.qaWorkOrder.id,
    reviewerEvidenceDigest: source.reviewerEvidenceDigest,
    reviewerReexecutionAttemptId: source.reexecutionAttempt.id,
    reviewerReexecutionAttemptRecordDigest: source.reexecutionAttempt.recordDigest,
    reviewerRunId: source.reexecutionRun.id,
    sourceDigest: source.executionPlan.sourceDigest,
  });
}

function isExactReworkQaExecutionReplay(run, requestDigest, source) {
  return Boolean(
    run &&
      run.metadata?.executionMode === 'rework-qa-node-check' &&
      run.metadata?.requestDigest === requestDigest &&
      run.metadata?.reviewerEvidenceDigest === source.reviewerEvidenceDigest &&
      run.metadata?.mutationEvidenceDigest === source.mutationEvidenceDigest &&
      run.metadata?.qaInputDigest === source.qaInputDigest &&
      run.metadata?.qaWorkOrderDigest === source.qaWorkOrderDigest &&
      run.metadata?.checkpointDigest === source.qaReadyCheckpoint.checkpointDigest &&
      run.metadata?.inputDigest === source.qaReadyCheckpoint.inputDigest &&
      run.metadata?.authorityDigest === source.qaReadyCheckpoint.authorityDigest &&
      run.metadata?.sourceDigest === source.executionPlan.sourceDigest &&
      run.metadata?.workerInputDigest === source.workerInputDigest,
  );
}

module.exports = {
  QA_REQUEST_KEYS,
  REQUEST_KEYS,
  REWORK_QA_ACKNOWLEDGEMENT,
  REWORK_QA_DECISION,
  buildPreConsumeQaReadyProjection,
  computeQaInputDigest,
  computeReviewerEvidenceDigest,
  computeReworkQaExecutionRequestDigest,
  deepFreeze,
  digestCanonical,
  isExactReworkQaExecutionReplay,
  normalizeReworkQaExecutionRequest,
};
