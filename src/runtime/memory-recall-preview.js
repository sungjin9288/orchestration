'use strict';

const crypto = require('crypto');
const path = require('path');

const {
  computeMemoryItemRecordDigest,
  MEMORY_ITEM_STATUS,
} = require('./memory-items');

const INPUT_KEYS = ['evaluatedAt', 'item', 'recallSpec'];
const RECALL_SPEC_KEYS = [
  'acknowledgement',
  'applicability',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'nonApplicationStatement',
  'purpose',
  'redactionRefs',
  'reviewRefs',
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
const RECALL_ACKNOWLEDGEMENT =
  'operator-selected-exact-memory-item-for-read-only-recall';
const NON_APPLICATION_STATEMENT = 'recall-preview-not-runtime-application';

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'automatic-retrieval',
  'commit',
  'cross-workspace-use',
  'delete',
  'durable-recall',
  'export',
  'external-connectors',
  'import',
  'mission-injection',
  'next-mission',
  'policy-mutation',
  'provider-generation',
  'push',
  'ranking',
  'recommendation',
  'refresh',
  'release',
  'scheduling',
  'search',
  'skill-promotion',
  'source-mutation',
  'workorder-injection',
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
  if (!isPlainRecord(value)) throw new Error(`${label} must be an object`);
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const normalized = value.trim();
  if (/[\x00-\x1F\x7F]/.test(normalized)) {
    throw new Error(`${label} must not contain control characters`);
  }
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

function assertExactSet(entries, expectedEntries, label) {
  const expected = [...new Set(expectedEntries)].sort();
  if (
    entries.length !== expected.length ||
    entries.some((entry, index) => entry !== expected[index])
  ) {
    throw new Error(`${label} must preserve every source value`);
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

function assertSourceItem(item, evaluatedAt, now) {
  if (!isPlainRecord(item)) {
    throw new Error('MemoryRecall preview requires one MemoryItem record');
  }
  if (
    item.persisted !== true ||
    item.status !== MEMORY_ITEM_STATUS ||
    item.recordDigest !== computeMemoryItemRecordDigest(item)
  ) {
    throw new Error('MemoryRecall source MemoryItem is not immutable current evidence');
  }
  if (
    item.applicationStatus !== 'blocked' ||
    item.promotionStatus !== 'blocked' ||
    !Array.isArray(item.exportRefs) ||
    item.exportRefs.length !== 0 ||
    !Array.isArray(item.deletionRefs) ||
    item.deletionRefs.length !== 0 ||
    !['retrieval', 'search', 'ranking', 'apply'].every((action) =>
      item.blockedActions?.includes(action))
  ) {
    throw new Error('MemoryRecall source MemoryItem has widened downstream authority');
  }

  const createdAt = normalizeIsoTimestamp(item.createdAt, 'MemoryItem createdAt');
  const expiresAt = normalizeIsoTimestamp(item.expiresAt, 'MemoryItem expiresAt');
  const evaluatedAtMs = Date.parse(evaluatedAt);
  const nowMs = Date.parse(now);
  if (evaluatedAtMs < Date.parse(createdAt)) {
    throw new Error('MemoryRecall evaluatedAt must not precede MemoryItem creation');
  }
  if (evaluatedAtMs > nowMs + MAX_CLOCK_SKEW_MS) {
    throw new Error('MemoryRecall evaluatedAt is too far in the future');
  }
  if (Date.parse(expiresAt) <= evaluatedAtMs || Date.parse(expiresAt) <= nowMs) {
    throw new Error(`MemoryItem ${item.id} is expired`);
  }
  return expiresAt;
}

function normalizeRecallSpec(value, item) {
  assertExactKeys(value, RECALL_SPEC_KEYS, 'recallSpec');
  assertExactKeys(value.workspaceScope, WORKSPACE_SCOPE_KEYS, 'recallSpec.workspaceScope');
  assertExactKeys(value.applicability, APPLICABILITY_KEYS, 'recallSpec.applicability');

  const projectId = normalizeText(
    value.workspaceScope.projectId,
    'recallSpec.workspaceScope.projectId',
  );
  if (projectId !== item.projectId || item.workspaceScope?.projectId !== item.projectId) {
    throw new Error('recallSpec.workspaceScope must match the source project');
  }
  if (value.acknowledgement !== RECALL_ACKNOWLEDGEMENT) {
    throw new Error(`recallSpec.acknowledgement must be ${RECALL_ACKNOWLEDGEMENT}`);
  }
  if (value.nonApplicationStatement !== NON_APPLICATION_STATEMENT) {
    throw new Error(
      `recallSpec.nonApplicationStatement must be ${NON_APPLICATION_STATEMENT}`,
    );
  }

  const targetPathAllowlist = normalizeStringList(
    value.applicability.targetPathAllowlist,
    'recallSpec.applicability.targetPathAllowlist',
    normalizeTargetPath,
  );
  const verificationCommands = normalizeStringList(
    value.applicability.verificationCommands,
    'recallSpec.applicability.verificationCommands',
  );
  assertSubset(
    targetPathAllowlist,
    item.applicability.targetPathAllowlist,
    'recallSpec.applicability.targetPathAllowlist',
  );
  assertSubset(
    verificationCommands,
    item.applicability.verificationCommands,
    'recallSpec.applicability.verificationCommands',
  );

  const sourceRefs = [...new Set([item.id, ...item.sourceRefs])].sort();
  const evidenceRefs = normalizeStringList(value.evidenceRefs, 'recallSpec.evidenceRefs');
  const negativeEvidenceRefs = normalizeStringList(
    value.negativeEvidenceRefs,
    'recallSpec.negativeEvidenceRefs',
  );
  const redactionRefs = normalizeStringList(
    value.redactionRefs,
    'recallSpec.redactionRefs',
  );
  const reviewRefs = normalizeStringList(value.reviewRefs, 'recallSpec.reviewRefs');
  assertSubset(evidenceRefs, item.evidenceRefs, 'recallSpec.evidenceRefs');
  assertExactSet(
    negativeEvidenceRefs,
    item.negativeEvidenceRefs,
    'recallSpec.negativeEvidenceRefs',
  );
  assertSubset(redactionRefs, item.redactionRefs, 'recallSpec.redactionRefs');
  assertSubset(reviewRefs, item.reviewRefs, 'recallSpec.reviewRefs');

  return {
    purpose: normalizeText(value.purpose, 'recallSpec.purpose'),
    workspaceScope: { projectId },
    applicability: {
      summary: normalizeText(
        value.applicability.summary,
        'recallSpec.applicability.summary',
      ),
      targetPathAllowlist,
      verificationCommands,
    },
    sourceRefs,
    evidenceRefs,
    negativeEvidenceRefs,
    redactionRefs,
    reviewRefs,
    acknowledgement: RECALL_ACKNOWLEDGEMENT,
    nonApplicationStatement: NON_APPLICATION_STATEMENT,
  };
}

function previewMemoryItemRecall(input, options = {}) {
  assertExactKeys(input, INPUT_KEYS, 'MemoryRecall preview input');
  const evaluatedAt = normalizeIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeIsoTimestamp(
    options.now || new Date().toISOString(),
    'current time',
  );
  const expiresAt = assertSourceItem(input.item, evaluatedAt, now);
  const recallSpec = normalizeRecallSpec(input.recallSpec, input.item);
  const payload = {
    persisted: false,
    status: 'recall-ready',
    retrievalMode: 'exact-id-operator-selected',
    projectId: input.item.projectId,
    workspaceScope: recallSpec.workspaceScope,
    sourceMemoryItemId: input.item.id,
    sourceMemoryItemRecordDigest: input.item.recordDigest,
    sourceMemoryCandidatePreviewId: input.item.sourceMemoryCandidatePreviewId,
    sourceLearningCandidateId: input.item.sourceLearningCandidateId,
    sourceLearningCandidateReviewId: input.item.sourceLearningCandidateReviewId,
    purpose: recallSpec.purpose,
    summary: input.item.summary,
    applicability: recallSpec.applicability,
    sourceRefs: recallSpec.sourceRefs,
    evidenceRefs: recallSpec.evidenceRefs,
    negativeEvidenceRefs: recallSpec.negativeEvidenceRefs,
    redactionRefs: recallSpec.redactionRefs,
    reviewRefs: recallSpec.reviewRefs,
    expiresAt,
    recommendationStatus: 'blocked',
    applicationStatus: 'blocked',
    missionInjectionStatus: 'blocked',
    blockedActions: [...BLOCKED_ACTIONS],
    nonApplicationStatement: NON_APPLICATION_STATEMENT,
    evaluatedAt,
  };
  const previewDigest = digestCanonical(payload);
  return deepFreeze({
    id: `memory-recall-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  });
}

module.exports = {
  BLOCKED_ACTIONS,
  NON_APPLICATION_STATEMENT,
  RECALL_ACKNOWLEDGEMENT,
  previewMemoryItemRecall,
};
