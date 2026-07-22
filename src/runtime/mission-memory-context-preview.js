'use strict';

const crypto = require('crypto');
const path = require('path');

const {
  computeMemoryItemRecordDigest,
  MEMORY_ITEM_STATUS,
} = require('./memory-items');
const {
  computeMemoryRecallRecordDigest,
  MEMORY_RECALL_STATUS,
} = require('./memory-recalls');

const INPUT_KEYS = ['contextSpec', 'evaluatedAt', 'item', 'mission', 'recall'];
const CONTEXT_SPEC_KEYS = [
  'acknowledgement',
  'applicability',
  'evidenceRefs',
  'negativeEvidenceRefs',
  'nonInjectionStatement',
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
const CONTEXT_ACKNOWLEDGEMENT =
  'operator-selected-recorded-recall-for-mission-context-review';
const NON_INJECTION_STATEMENT =
  'memory-context-preview-not-mission-or-prompt-injection';

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'apply',
  'automatic-retrieval',
  'commit',
  'cross-workspace-use',
  'durable-context',
  'external-connectors',
  'mission-injection',
  'next-mission',
  'policy-injection',
  'policy-mutation',
  'prompt-injection',
  'provider-generation',
  'push',
  'ranking',
  'recommendation',
  'release',
  'scheduling',
  'schema-migration',
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

function normalizeStoredText(value, label, { allowEmpty = false } = {}) {
  if (typeof value !== 'string' || (!allowEmpty && !value)) {
    throw new Error(`${label} is invalid`);
  }
  return value;
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

function buildMissionDigestPayload(mission) {
  if (!isPlainRecord(mission)) {
    throw new Error('MissionMemoryContext preview requires one Mission record');
  }
  const status = normalizeStoredText(mission.status, 'Mission status');
  if (status !== 'draft' || mission.linkedTaskId !== null || mission.councilSessionId !== null) {
    throw new Error('MissionMemoryContext target Mission must be current draft evidence');
  }
  return {
    id: normalizeStoredText(mission.id, 'Mission id'),
    projectId: normalizeStoredText(mission.projectId, 'Mission projectId'),
    title: normalizeStoredText(mission.title, 'Mission title'),
    goal: normalizeStoredText(mission.goal, 'Mission goal'),
    constraints: normalizeStoredText(mission.constraints, 'Mission constraints', {
      allowEmpty: true,
    }),
    deliverableType:
      mission.deliverableType === null
        ? null
        : normalizeStoredText(mission.deliverableType, 'Mission deliverableType'),
    status,
    linkedTaskId: null,
    councilSessionId: null,
    createdAt: normalizeIsoTimestamp(mission.createdAt, 'Mission createdAt'),
    updatedAt: normalizeIsoTimestamp(mission.updatedAt, 'Mission updatedAt'),
  };
}

function computeMissionMemoryContextTargetDigest(mission) {
  return digestCanonical(buildMissionDigestPayload(mission));
}

function assertSourceTuple(recall, item, mission, evaluatedAt, now) {
  if (!isPlainRecord(recall)) {
    throw new Error('MissionMemoryContext preview requires one MemoryRecall record');
  }
  if (
    recall.persisted !== true ||
    recall.status !== MEMORY_RECALL_STATUS ||
    recall.recordDigest !== computeMemoryRecallRecordDigest(recall)
  ) {
    throw new Error('MissionMemoryContext source MemoryRecall is not immutable current evidence');
  }
  if (
    recall.applicationStatus !== 'blocked' ||
    recall.recommendationStatus !== 'blocked' ||
    recall.missionInjectionStatus !== 'blocked' ||
    !['apply', 'automatic-retrieval', 'mission-injection', 'recommendation', 'workorder-injection']
      .every((action) => recall.blockedActions?.includes(action))
  ) {
    throw new Error('MissionMemoryContext source MemoryRecall has widened downstream authority');
  }
  if (!isPlainRecord(item)) {
    throw new Error('MissionMemoryContext preview requires one MemoryItem record');
  }
  if (
    item.persisted !== true ||
    item.status !== MEMORY_ITEM_STATUS ||
    item.recordDigest !== computeMemoryItemRecordDigest(item)
  ) {
    throw new Error('MissionMemoryContext source MemoryItem is not immutable current evidence');
  }
  if (
    item.applicationStatus !== 'blocked' ||
    item.promotionStatus !== 'blocked' ||
    recall.sourceMemoryItemId !== item.id ||
    recall.sourceMemoryItemRecordDigest !== item.recordDigest
  ) {
    throw new Error('MissionMemoryContext source item tuple is not current');
  }

  const missionPayload = buildMissionDigestPayload(mission);
  if (
    recall.projectId !== item.projectId ||
    recall.workspaceScope?.projectId !== recall.projectId ||
    item.workspaceScope?.projectId !== item.projectId ||
    missionPayload.projectId !== recall.projectId
  ) {
    throw new Error('MissionMemoryContext source and target must share one project');
  }

  const evaluatedAtMs = Date.parse(evaluatedAt);
  const nowMs = Date.parse(now);
  const recallCreatedAt = normalizeIsoTimestamp(recall.createdAt, 'MemoryRecall createdAt');
  const recallExpiresAt = normalizeIsoTimestamp(recall.expiresAt, 'MemoryRecall expiresAt');
  const itemExpiresAt = normalizeIsoTimestamp(item.expiresAt, 'MemoryItem expiresAt');
  if (
    evaluatedAtMs < Date.parse(recallCreatedAt) ||
    evaluatedAtMs < Date.parse(missionPayload.createdAt) ||
    evaluatedAtMs < Date.parse(missionPayload.updatedAt)
  ) {
    throw new Error('MissionMemoryContext evaluatedAt must follow source and target creation');
  }
  if (evaluatedAtMs > nowMs + MAX_CLOCK_SKEW_MS) {
    throw new Error('MissionMemoryContext evaluatedAt is too far in the future');
  }
  if (
    Date.parse(recallExpiresAt) <= evaluatedAtMs ||
    Date.parse(recallExpiresAt) <= nowMs ||
    Date.parse(itemExpiresAt) <= evaluatedAtMs ||
    Date.parse(itemExpiresAt) <= nowMs
  ) {
    throw new Error('MissionMemoryContext source evidence is expired');
  }

  return {
    expiresAt:
      Date.parse(recallExpiresAt) <= Date.parse(itemExpiresAt)
        ? recallExpiresAt
        : itemExpiresAt,
    missionPayload,
  };
}

function normalizeContextSpec(value, recall, missionPayload) {
  assertExactKeys(value, CONTEXT_SPEC_KEYS, 'contextSpec');
  assertExactKeys(value.workspaceScope, WORKSPACE_SCOPE_KEYS, 'contextSpec.workspaceScope');
  assertExactKeys(value.applicability, APPLICABILITY_KEYS, 'contextSpec.applicability');

  const projectId = normalizeText(
    value.workspaceScope.projectId,
    'contextSpec.workspaceScope.projectId',
  );
  if (projectId !== recall.projectId || projectId !== missionPayload.projectId) {
    throw new Error('contextSpec.workspaceScope must match source and target project');
  }
  if (value.acknowledgement !== CONTEXT_ACKNOWLEDGEMENT) {
    throw new Error(`contextSpec.acknowledgement must be ${CONTEXT_ACKNOWLEDGEMENT}`);
  }
  if (value.nonInjectionStatement !== NON_INJECTION_STATEMENT) {
    throw new Error(
      `contextSpec.nonInjectionStatement must be ${NON_INJECTION_STATEMENT}`,
    );
  }

  const targetPathAllowlist = normalizeStringList(
    value.applicability.targetPathAllowlist,
    'contextSpec.applicability.targetPathAllowlist',
    normalizeTargetPath,
  );
  const verificationCommands = normalizeStringList(
    value.applicability.verificationCommands,
    'contextSpec.applicability.verificationCommands',
  );
  assertSubset(
    targetPathAllowlist,
    recall.applicability.targetPathAllowlist,
    'contextSpec.applicability.targetPathAllowlist',
  );
  assertSubset(
    verificationCommands,
    recall.applicability.verificationCommands,
    'contextSpec.applicability.verificationCommands',
  );

  const evidenceRefs = normalizeStringList(value.evidenceRefs, 'contextSpec.evidenceRefs');
  const negativeEvidenceRefs = normalizeStringList(
    value.negativeEvidenceRefs,
    'contextSpec.negativeEvidenceRefs',
  );
  const redactionRefs = normalizeStringList(
    value.redactionRefs,
    'contextSpec.redactionRefs',
  );
  const reviewRefs = normalizeStringList(value.reviewRefs, 'contextSpec.reviewRefs');
  assertExactSet(evidenceRefs, recall.evidenceRefs, 'contextSpec.evidenceRefs');
  assertExactSet(
    negativeEvidenceRefs,
    recall.negativeEvidenceRefs,
    'contextSpec.negativeEvidenceRefs',
  );
  assertExactSet(redactionRefs, recall.redactionRefs, 'contextSpec.redactionRefs');
  assertExactSet(reviewRefs, recall.reviewRefs, 'contextSpec.reviewRefs');

  return {
    purpose: normalizeText(value.purpose, 'contextSpec.purpose'),
    workspaceScope: { projectId },
    applicability: {
      summary: normalizeText(
        value.applicability.summary,
        'contextSpec.applicability.summary',
      ),
      targetPathAllowlist,
      verificationCommands,
    },
    evidenceRefs,
    negativeEvidenceRefs,
    redactionRefs,
    reviewRefs,
    acknowledgement: CONTEXT_ACKNOWLEDGEMENT,
    nonInjectionStatement: NON_INJECTION_STATEMENT,
  };
}

function previewMissionMemoryContext(input, options = {}) {
  assertExactKeys(input, INPUT_KEYS, 'MissionMemoryContext preview input');
  const evaluatedAt = normalizeIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeIsoTimestamp(
    options.now || new Date().toISOString(),
    'current time',
  );
  const { expiresAt, missionPayload } = assertSourceTuple(
    input.recall,
    input.item,
    input.mission,
    evaluatedAt,
    now,
  );
  const contextSpec = normalizeContextSpec(input.contextSpec, input.recall, missionPayload);
  const targetMissionDigest = digestCanonical(missionPayload);
  const payload = {
    persisted: false,
    status: 'context-review-ready',
    selectionMode: 'exact-id-operator-selected',
    projectId: input.recall.projectId,
    workspaceScope: contextSpec.workspaceScope,
    targetMissionId: missionPayload.id,
    targetMissionDigest,
    targetMissionStatus: missionPayload.status,
    sourceMemoryRecallId: input.recall.id,
    sourceMemoryRecallRecordDigest: input.recall.recordDigest,
    sourceMemoryItemId: input.item.id,
    sourceMemoryItemRecordDigest: input.item.recordDigest,
    sourceMemoryRecallPreviewId: input.recall.sourceMemoryRecallPreviewId,
    purpose: contextSpec.purpose,
    summary: input.recall.summary,
    applicability: contextSpec.applicability,
    evidenceRefs: contextSpec.evidenceRefs,
    negativeEvidenceRefs: contextSpec.negativeEvidenceRefs,
    redactionRefs: contextSpec.redactionRefs,
    reviewRefs: contextSpec.reviewRefs,
    expiresAt,
    recommendationStatus: 'blocked',
    applicationStatus: 'blocked',
    missionInjectionStatus: 'blocked',
    workOrderInjectionStatus: 'blocked',
    blockedActions: [...BLOCKED_ACTIONS],
    nonInjectionStatement: NON_INJECTION_STATEMENT,
    evaluatedAt,
  };
  const previewDigest = digestCanonical(payload);
  return deepFreeze({
    id: `mission-memory-context-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  });
}

module.exports = {
  BLOCKED_ACTIONS,
  CONTEXT_ACKNOWLEDGEMENT,
  NON_INJECTION_STATEMENT,
  computeMissionMemoryContextTargetDigest,
  previewMissionMemoryContext,
};
