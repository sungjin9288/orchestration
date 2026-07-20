'use strict';

const crypto = require('crypto');
const path = require('path');

const {
  computeLearningCandidateRecordDigest,
} = require('./learning-candidates');
const {
  computeLearningCandidateReviewDigest,
  LEARNING_CANDIDATE_REVIEW_DECISION,
} = require('./learning-candidate-reviews');

const INPUT_KEYS = ['candidate', 'evaluatedAt', 'memorySpec', 'review'];
const MEMORY_SPEC_KEYS = [
  'applicability',
  'evidenceRefs',
  'expiresAt',
  'negativeEvidenceRefs',
  'nonPersistenceStatement',
  'redactionAcknowledgement',
  'redactionRefs',
  'reviewRefs',
  'summary',
  'workspaceScope',
];
const APPLICABILITY_KEYS = [
  'summary',
  'targetPathAllowlist',
  'verificationCommands',
];
const WORKSPACE_SCOPE_KEYS = ['projectId'];
const MAX_LIST_ENTRIES = 64;
const MAX_TEXT_LENGTH = 1024;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const REDACTION_ACKNOWLEDGEMENT = 'source-summary-only';
const NON_PERSISTENCE_STATEMENT = 'readiness-only-not-durable-memory';

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'candidate-mutation',
  'commit',
  'cross-workspace-use',
  'delete',
  'durable-memory',
  'expiry-mutation',
  'export',
  'external-connectors',
  'gc',
  'import',
  'next-mission',
  'policy-mutation',
  'provider-generation',
  'push',
  'refresh',
  'release',
  'retrieval',
  'scheduling',
  'skill-promotion',
  'source-mutation',
]);

const OBVIOUS_CREDENTIAL_MARKERS = [
  /-----BEGIN (?:RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/i,
  /\bsk-(?:proj-)?[A-Za-z0-9_-]{12,}\b/,
  /\bAKIA[A-Z0-9]{16}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\b(?:api[_ -]?key|client[_ -]?secret|password|authorization|bearer)\s*[:=]\s*\S{6,}/i,
];

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actualKeys = Object.keys(value).sort();
  const sortedExpected = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpected.length ||
    actualKeys.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must not contain control characters`);
  }
  const normalized = value.trim();
  if (normalized.length > MAX_TEXT_LENGTH) {
    throw new Error(`${label} is too long`);
  }
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))) {
    throw new Error(`${label} contains an obvious high-risk credential marker`);
  }
  return normalized;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeText(value, label);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizeStringList(value, label, normalizeEntry = normalizeText) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  if (value.length > MAX_LIST_ENTRIES) {
    throw new Error(`${label} has too many entries`);
  }
  const normalized = value.map((entry, index) =>
    normalizeEntry(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }
  return [...normalized].sort();
}

function normalizeTargetPath(value, label) {
  const normalized = normalizeText(value, label);
  if (
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.includes('\\') ||
    /[*?[\]{}!]/.test(normalized)
  ) {
    throw new Error(`${label} must be a literal project-relative POSIX path`);
  }
  const segments = normalized.split('/');
  if (
    segments.some((segment) => !segment || segment === '.' || segment === '..') ||
    path.posix.normalize(normalized) !== normalized
  ) {
    throw new Error(`${label} must not contain traversal or empty segments`);
  }
  return normalized;
}

function assertSubset(entries, allowedEntries, label) {
  const allowed = new Set(allowedEntries);
  const unsupported = entries.find((entry) => !allowed.has(entry));
  if (unsupported) {
    throw new Error(`${label} contains unsupported source value: ${unsupported}`);
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

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function assertSourceRecords(candidate, review, evaluatedAt, now) {
  if (!isPlainRecord(candidate) || !isPlainRecord(review)) {
    throw new Error('MemoryCandidate preview requires candidate and review records');
  }
  if (
    candidate.persisted !== true ||
    candidate.recordDigest !== computeLearningCandidateRecordDigest(candidate)
  ) {
    throw new Error('MemoryCandidate source LearningCandidate is not immutable current evidence');
  }
  if (
    review.reviewDigest !== computeLearningCandidateReviewDigest(review) ||
    review.learningCandidateId !== candidate.id ||
    review.projectId !== candidate.projectId ||
    review.sourceMissionId !== candidate.sourceMissionId ||
    review.previewId !== candidate.previewId ||
    review.candidateDigest !== candidate.candidateDigest ||
    review.candidateRecordDigest !== candidate.recordDigest
  ) {
    throw new Error('MemoryCandidate source LearningCandidateReview is not candidate-current');
  }
  if (review.decision !== LEARNING_CANDIDATE_REVIEW_DECISION.ACCEPT) {
    throw new Error('MemoryCandidate preview requires an accepted LearningCandidateReview');
  }

  const candidateExpiresAt = normalizeIsoTimestamp(
    candidate.expiry?.expiresAt,
    'LearningCandidate expiry.expiresAt',
  );
  const reviewCreatedAt = normalizeIsoTimestamp(
    review.createdAt,
    'LearningCandidateReview createdAt',
  );
  const evaluatedAtMs = Date.parse(evaluatedAt);
  const nowMs = Date.parse(now);
  if (evaluatedAtMs < Date.parse(reviewCreatedAt)) {
    throw new Error('MemoryCandidate evaluatedAt must not precede the accepted review');
  }
  if (evaluatedAtMs > nowMs + MAX_CLOCK_SKEW_MS) {
    throw new Error('MemoryCandidate evaluatedAt is too far in the future');
  }
  if (
    Date.parse(candidateExpiresAt) <= evaluatedAtMs ||
    Date.parse(candidateExpiresAt) <= nowMs
  ) {
    throw new Error(`LearningCandidate ${candidate.id} is expired`);
  }
  return candidateExpiresAt;
}

function normalizeMemorySpec(value, candidate, review, evaluatedAt, candidateExpiresAt) {
  assertExactKeys(value, MEMORY_SPEC_KEYS, 'memorySpec');
  assertExactKeys(value.workspaceScope, WORKSPACE_SCOPE_KEYS, 'memorySpec.workspaceScope');
  assertExactKeys(value.applicability, APPLICABILITY_KEYS, 'memorySpec.applicability');

  const workspaceProjectId = normalizeText(
    value.workspaceScope.projectId,
    'memorySpec.workspaceScope.projectId',
  );
  if (workspaceProjectId !== candidate.projectId) {
    throw new Error('memorySpec.workspaceScope must match the source project');
  }
  if (value.redactionAcknowledgement !== REDACTION_ACKNOWLEDGEMENT) {
    throw new Error(
      `memorySpec.redactionAcknowledgement must be ${REDACTION_ACKNOWLEDGEMENT}`,
    );
  }
  if (value.nonPersistenceStatement !== NON_PERSISTENCE_STATEMENT) {
    throw new Error(
      `memorySpec.nonPersistenceStatement must be ${NON_PERSISTENCE_STATEMENT}`,
    );
  }

  const targetPathAllowlist = normalizeStringList(
    value.applicability.targetPathAllowlist,
    'memorySpec.applicability.targetPathAllowlist',
    normalizeTargetPath,
  );
  const verificationCommands = normalizeStringList(
    value.applicability.verificationCommands,
    'memorySpec.applicability.verificationCommands',
  );
  assertSubset(
    targetPathAllowlist,
    candidate.applicability.targetPathAllowlist,
    'memorySpec.applicability.targetPathAllowlist',
  );
  assertSubset(
    verificationCommands,
    candidate.applicability.verificationCommands,
    'memorySpec.applicability.verificationCommands',
  );

  const sourceRefs = [
    ...new Set([
      candidate.id,
      review.id,
      ...candidate.sourceEvidenceRefs,
      ...review.evidenceRefs,
    ]),
  ].sort();
  const evidenceRefs = normalizeStringList(
    value.evidenceRefs,
    'memorySpec.evidenceRefs',
  );
  const negativeEvidenceRefs = normalizeStringList(
    value.negativeEvidenceRefs,
    'memorySpec.negativeEvidenceRefs',
  );
  const redactionRefs = normalizeStringList(
    value.redactionRefs,
    'memorySpec.redactionRefs',
  );
  const reviewRefs = normalizeStringList(
    value.reviewRefs,
    'memorySpec.reviewRefs',
  );
  assertSubset(evidenceRefs, candidate.sourceEvidenceRefs, 'memorySpec.evidenceRefs');
  assertSubset(
    negativeEvidenceRefs,
    candidate.negativeEvidence.map((entry) => entry.sourceEvidenceRef),
    'memorySpec.negativeEvidenceRefs',
  );
  assertSubset(redactionRefs, sourceRefs, 'memorySpec.redactionRefs');
  assertSubset(
    reviewRefs,
    [candidate.id, review.id, ...review.evidenceRefs],
    'memorySpec.reviewRefs',
  );

  const expiresAt = normalizeIsoTimestamp(value.expiresAt, 'memorySpec.expiresAt');
  if (Date.parse(expiresAt) <= Date.parse(evaluatedAt)) {
    throw new Error('memorySpec.expiresAt must be after evaluatedAt');
  }
  if (Date.parse(expiresAt) > Date.parse(candidateExpiresAt)) {
    throw new Error('memorySpec.expiresAt must not exceed the source candidate expiry');
  }

  return {
    summary: normalizeText(value.summary, 'memorySpec.summary'),
    workspaceScope: { projectId: workspaceProjectId },
    applicability: {
      summary: normalizeText(
        value.applicability.summary,
        'memorySpec.applicability.summary',
      ),
      targetPathAllowlist,
      verificationCommands,
    },
    sourceRefs,
    evidenceRefs,
    negativeEvidenceRefs,
    redactionRefs,
    reviewRefs,
    expiresAt,
    redactionAcknowledgement: REDACTION_ACKNOWLEDGEMENT,
    nonPersistenceStatement: NON_PERSISTENCE_STATEMENT,
  };
}

function previewLearningCandidateMemory(input, options = {}) {
  assertExactKeys(input, INPUT_KEYS, 'MemoryCandidate preview input');
  const evaluatedAt = normalizeIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeIsoTimestamp(
    options.now || new Date().toISOString(),
    'current time',
  );
  const candidateExpiresAt = assertSourceRecords(
    input.candidate,
    input.review,
    evaluatedAt,
    now,
  );
  const memorySpec = normalizeMemorySpec(
    input.memorySpec,
    input.candidate,
    input.review,
    evaluatedAt,
    candidateExpiresAt,
  );
  const payload = {
    persisted: false,
    status: 'review-ready',
    projectId: input.candidate.projectId,
    sourceMissionId: input.candidate.sourceMissionId,
    sourceLearningCandidateId: input.candidate.id,
    sourceLearningCandidateReviewId: input.review.id,
    previewId: input.candidate.previewId,
    candidateDigest: input.candidate.candidateDigest,
    candidateRecordDigest: input.candidate.recordDigest,
    reviewDigest: input.review.reviewDigest,
    summary: memorySpec.summary,
    applicability: memorySpec.applicability,
    workspaceScope: memorySpec.workspaceScope,
    sourceRefs: memorySpec.sourceRefs,
    evidenceRefs: memorySpec.evidenceRefs,
    negativeEvidenceRefs: memorySpec.negativeEvidenceRefs,
    redactionRefs: memorySpec.redactionRefs,
    reviewRefs: memorySpec.reviewRefs,
    expiresAt: memorySpec.expiresAt,
    redactionStatus: 'review-required',
    storageStatus: 'not-approved',
    promotionStatus: 'blocked',
    blockedActions: [...BLOCKED_ACTIONS],
    nonPersistenceStatement: NON_PERSISTENCE_STATEMENT,
    evaluatedAt,
  };
  const previewDigest = digestCanonical(payload);
  return deepFreeze({
    id: `memory-candidate-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  });
}

module.exports = {
  BLOCKED_ACTIONS,
  NON_PERSISTENCE_STATEMENT,
  REDACTION_ACKNOWLEDGEMENT,
  previewLearningCandidateMemory,
};
