'use strict';

const crypto = require('crypto');
const path = require('path');

const INPUT_KEYS = ['retrospectiveSpec', 'source'];
const SOURCE_KEYS = [
  'allowedNegativeEvidenceRefs',
  'allowedTargetPaths',
  'allowedVerificationCommands',
  'deliveryPackageAcceptanceId',
  'deliveryPackageId',
  'executionPlanId',
  'missionCloseOutCreatedAt',
  'missionCloseOutId',
  'projectId',
  'sourceDeliveryPreviewId',
  'sourceDigest',
  'sourceEvidenceRefs',
  'sourceMissionCloseOutDigest',
  'sourcePackageAcceptanceDigest',
  'sourcePackageDigest',
  'sourceTerminalCheckpointDigest',
  'sourceTerminalCheckpointId',
  'missionId',
  'linkedTaskId',
];
const RETROSPECTIVE_SPEC_KEYS = [
  'applicabilitySummary',
  'expiresAt',
  'lesson',
  'negativeEvidence',
  'redactionAcknowledgement',
  'targetPathAllowlist',
  'verificationCommands',
];
const NEGATIVE_EVIDENCE_KEYS = ['sourceEvidenceRef', 'statement'];
const MAX_LIST_ENTRIES = 32;
const MAX_SUMMARY_LENGTH = 1024;
const REDACTION_ACKNOWLEDGEMENT = 'source-summary-only';

const CLOSED_AUTHORITY = Object.freeze({
  persistCandidate: false,
  acceptCandidate: false,
  promoteMemory: false,
  promoteSkill: false,
  callProvider: false,
  readRawTranscript: false,
  mutateSource: false,
  commit: false,
  push: false,
  release: false,
  schedule: false,
  createNextMission: false,
  mutatePolicy: false,
  bypassApproval: false,
  callConnector: false,
});

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
  const sortedExpectedKeys = [...expectedKeys].sort();
  if (
    actualKeys.length !== sortedExpectedKeys.length ||
    actualKeys.some((key, index) => key !== sortedExpectedKeys[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeSummary(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must not contain control characters`);
  }

  const normalized = value.trim();
  if (normalized.length > MAX_SUMMARY_LENGTH) {
    throw new Error(`${label} is too long`);
  }
  if (OBVIOUS_CREDENTIAL_MARKERS.some((pattern) => pattern.test(normalized))) {
    throw new Error(`${label} contains an obvious high-risk credential marker`);
  }

  return normalized;
}

function normalizeStringList(value, label, maxEntries = MAX_LIST_ENTRIES) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  if (value.length > maxEntries) {
    throw new Error(`${label} has too many entries`);
  }

  const normalized = value.map((entry, index) =>
    normalizeSummary(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }
  return normalized;
}

function normalizeTargetPath(value, label) {
  const normalized = normalizeSummary(value, label);
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

function normalizeSourceStringList(value, label, normalizeEntry = normalizeSummary) {
  const normalized = normalizeStringList(value, label, 128).map((entry, index) =>
    normalizeEntry(entry, `${label}[${index}]`));
  return [...new Set(normalized)].sort();
}

function assertSubset(entries, allowedEntries, label) {
  const allowed = new Set(allowedEntries);
  const unsupported = entries.find((entry) => !allowed.has(entry));
  if (unsupported) {
    throw new Error(`${label} contains unsupported source value: ${unsupported}`);
  }
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeSummary(value, label);
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
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

function normalizeSource(value) {
  assertExactKeys(value, SOURCE_KEYS, 'source');
  const source = {};
  for (const key of SOURCE_KEYS) {
    if (
      [
        'allowedNegativeEvidenceRefs',
        'allowedTargetPaths',
        'allowedVerificationCommands',
        'sourceEvidenceRefs',
      ].includes(key)
    ) {
      continue;
    }
    source[key] = normalizeSummary(value[key], `source.${key}`);
  }

  source.missionCloseOutCreatedAt = normalizeIsoTimestamp(
    value.missionCloseOutCreatedAt,
    'source.missionCloseOutCreatedAt',
  );
  source.sourceEvidenceRefs = normalizeSourceStringList(
    value.sourceEvidenceRefs,
    'source.sourceEvidenceRefs',
  );
  source.allowedTargetPaths = normalizeSourceStringList(
    value.allowedTargetPaths,
    'source.allowedTargetPaths',
    normalizeTargetPath,
  );
  source.allowedVerificationCommands = normalizeSourceStringList(
    value.allowedVerificationCommands,
    'source.allowedVerificationCommands',
  );
  source.allowedNegativeEvidenceRefs = normalizeSourceStringList(
    value.allowedNegativeEvidenceRefs,
    'source.allowedNegativeEvidenceRefs',
  );
  assertSubset(
    source.allowedNegativeEvidenceRefs,
    source.sourceEvidenceRefs,
    'source.allowedNegativeEvidenceRefs',
  );
  return source;
}

function normalizeRetrospectiveSpec(value, source, evaluatedAt) {
  assertExactKeys(value, RETROSPECTIVE_SPEC_KEYS, 'retrospectiveSpec');
  if (value.redactionAcknowledgement !== REDACTION_ACKNOWLEDGEMENT) {
    throw new Error(
      `retrospectiveSpec.redactionAcknowledgement must be ${REDACTION_ACKNOWLEDGEMENT}`,
    );
  }

  const targetPathAllowlist = normalizeStringList(
    value.targetPathAllowlist,
    'retrospectiveSpec.targetPathAllowlist',
  ).map((entry, index) =>
    normalizeTargetPath(entry, `retrospectiveSpec.targetPathAllowlist[${index}]`));
  const verificationCommands = normalizeStringList(
    value.verificationCommands,
    'retrospectiveSpec.verificationCommands',
  );
  assertSubset(
    targetPathAllowlist,
    source.allowedTargetPaths,
    'retrospectiveSpec.targetPathAllowlist',
  );
  assertSubset(
    verificationCommands,
    source.allowedVerificationCommands,
    'retrospectiveSpec.verificationCommands',
  );

  if (!Array.isArray(value.negativeEvidence) || value.negativeEvidence.length === 0) {
    throw new Error('retrospectiveSpec.negativeEvidence must be a non-empty array');
  }
  if (value.negativeEvidence.length > MAX_LIST_ENTRIES) {
    throw new Error('retrospectiveSpec.negativeEvidence has too many entries');
  }
  const negativeEvidence = value.negativeEvidence.map((entry, index) => {
    const label = `retrospectiveSpec.negativeEvidence[${index}]`;
    assertExactKeys(entry, NEGATIVE_EVIDENCE_KEYS, label);
    const normalized = {
      sourceEvidenceRef: normalizeSummary(entry.sourceEvidenceRef, `${label}.sourceEvidenceRef`),
      statement: normalizeSummary(entry.statement, `${label}.statement`),
    };
    assertSubset(
      [normalized.sourceEvidenceRef],
      source.allowedNegativeEvidenceRefs,
      `${label}.sourceEvidenceRef`,
    );
    return normalized;
  });
  const negativeEvidenceKeys = negativeEvidence.map(
    (entry) => `${entry.sourceEvidenceRef}\u0000${entry.statement}`,
  );
  if (new Set(negativeEvidenceKeys).size !== negativeEvidenceKeys.length) {
    throw new Error('retrospectiveSpec.negativeEvidence must not contain duplicates');
  }

  const expiresAt = normalizeIsoTimestamp(value.expiresAt, 'retrospectiveSpec.expiresAt');
  const expiresAtMs = Date.parse(expiresAt);
  if (expiresAtMs <= Date.parse(source.missionCloseOutCreatedAt)) {
    throw new Error('retrospectiveSpec.expiresAt must be after MissionCloseOut creation');
  }
  if (expiresAtMs <= Date.parse(evaluatedAt)) {
    throw new Error('retrospectiveSpec.expiresAt must not be expired');
  }

  return {
    lesson: normalizeSummary(value.lesson, 'retrospectiveSpec.lesson'),
    applicabilitySummary: normalizeSummary(
      value.applicabilitySummary,
      'retrospectiveSpec.applicabilitySummary',
    ),
    targetPathAllowlist,
    verificationCommands,
    negativeEvidence,
    expiresAt,
    redactionAcknowledgement: REDACTION_ACKNOWLEDGEMENT,
  };
}

function compileLearningCandidatePreview(input, options = {}) {
  assertExactKeys(input, INPUT_KEYS, 'LearningCandidate preview input');
  const source = normalizeSource(input.source);
  const evaluatedAt = normalizeIsoTimestamp(
    options.evaluatedAt || new Date().toISOString(),
    'evaluatedAt',
  );
  const retrospectiveSpec = normalizeRetrospectiveSpec(
    input.retrospectiveSpec,
    source,
    evaluatedAt,
  );
  const fixedStatus = {
    persisted: false,
    redactionMode: REDACTION_ACKNOWLEDGEMENT,
    redactionStatus: 'review-required',
    reviewerStatus: 'review-required',
    promotionStatus: 'proposed',
  };
  const candidateDigest = digestCanonical({
    source,
    retrospectiveSpec,
    status: fixedStatus,
    authoritySummary: CLOSED_AUTHORITY,
  });
  const preview = {
    previewId: `learning-candidate-preview-${candidateDigest.slice(0, 16)}`,
    persisted: false,
    sourceMissionId: source.missionId,
    sourceMissionCloseOutId: source.missionCloseOutId,
    sourceExecutionPlanId: source.executionPlanId,
    sourceDeliveryPackageId: source.deliveryPackageId,
    sourceDeliveryPackageAcceptanceId: source.deliveryPackageAcceptanceId,
    sourceTerminalCheckpointId: source.sourceTerminalCheckpointId,
    sourceEvidenceRefs: [...source.sourceEvidenceRefs],
    lesson: retrospectiveSpec.lesson,
    applicability: {
      summary: retrospectiveSpec.applicabilitySummary,
      projectId: source.projectId,
      targetPathAllowlist: [...retrospectiveSpec.targetPathAllowlist],
      verificationCommands: [...retrospectiveSpec.verificationCommands],
    },
    negativeEvidence: retrospectiveSpec.negativeEvidence.map((entry) => ({ ...entry })),
    redactionMode: REDACTION_ACKNOWLEDGEMENT,
    redactionStatus: 'review-required',
    expiry: {
      expiresAt: retrospectiveSpec.expiresAt,
      status: 'review-required',
    },
    reviewerStatus: 'review-required',
    promotionStatus: 'proposed',
    authoritySummary: { ...CLOSED_AUTHORITY },
    candidateDigest,
  };

  return deepFreeze(preview);
}

module.exports = {
  CLOSED_AUTHORITY,
  REDACTION_ACKNOWLEDGEMENT,
  compileLearningCandidatePreview,
};
