'use strict';

const crypto = require('crypto');

const ACCEPTANCE_CRITERION_STATUS = 'active';
const PERSISTENCE_APPROVAL_DECISION = 'persist';
const PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT =
  'reviewed-workorder-verification-plan-for-durable-criteria';
const MAX_RATIONALE_LENGTH = 1024;

const BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'automatic-completion',
  'automatic-retry',
  'commit',
  'delete',
  'external-connectors',
  'mutation',
  'provider-call',
  'push',
  'release',
  'scheduling',
  'source-mutation',
]);

const APPROVAL_KEYS = [
  'acknowledgement',
  'decision',
  'rationale',
  'reviewedAt',
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
  if (normalized.length > MAX_RATIONALE_LENGTH) {
    throw new Error(`${label} is too long`);
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

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!isPlainRecord(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function computeAcceptanceCriterionRecordDigest(criterion) {
  const { recordDigest: _recordDigest, ...payload } = criterion;
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize(payload)))
    .digest('hex');
}

function normalizePersistenceApproval(value, preview) {
  assertExactKeys(value, APPROVAL_KEYS, 'persistenceApproval');
  if (value.decision !== PERSISTENCE_APPROVAL_DECISION) {
    throw new Error(`persistenceApproval.decision must be ${PERSISTENCE_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `persistenceApproval.acknowledgement must be ${PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }
  const reviewedAt = normalizeIsoTimestamp(
    value.reviewedAt,
    'persistenceApproval.reviewedAt',
  );
  if (Date.parse(reviewedAt) < Date.parse(preview.evaluatedAt)) {
    throw new Error('persistenceApproval.reviewedAt must not precede preview evaluatedAt');
  }
  return {
    decision: PERSISTENCE_APPROVAL_DECISION,
    acknowledgement: PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'persistenceApproval.rationale'),
    reviewedAt,
  };
}

function createAcceptanceCriterion({ id, preview, sourceCriterion, persistenceApproval }) {
  const approval = normalizePersistenceApproval(persistenceApproval, preview);
  const criterion = {
    id,
    persisted: true,
    status: ACCEPTANCE_CRITERION_STATUS,
    projectId: preview.projectId,
    missionId: preview.missionId,
    executionPlanId: preview.executionPlanId,
    workOrderId: preview.workOrderId,
    sourcePreviewId: preview.id,
    sourcePreviewDigest: preview.previewDigest,
    sourceExecutionPlanDigest: preview.executionPlanDigest,
    sourceWorkOrderDigest: preview.workOrderDigest,
    sourceDigest: preview.sourceDigest,
    sourceCriterionId: sourceCriterion.id,
    kind: sourceCriterion.kind,
    title: sourceCriterion.title,
    essential: sourceCriterion.essential,
    proofMode: sourceCriterion.proofMode,
    sourceField: sourceCriterion.sourceField,
    sourceValues: [...sourceCriterion.sourceValues],
    requiredEvidenceKinds: [...sourceCriterion.requiredEvidenceKinds],
    newInformationRequired: sourceCriterion.newInformationRequired,
    persistenceApproval: approval,
    blockedActions: [...BLOCKED_ACTIONS],
    createdAt: approval.reviewedAt,
  };
  return {
    ...criterion,
    recordDigest: computeAcceptanceCriterionRecordDigest(criterion),
  };
}

module.exports = {
  ACCEPTANCE_CRITERION_STATUS,
  BLOCKED_ACTIONS,
  PERSISTENCE_APPROVAL_ACKNOWLEDGEMENT,
  PERSISTENCE_APPROVAL_DECISION,
  computeAcceptanceCriterionRecordDigest,
  createAcceptanceCriterion,
  normalizePersistenceApproval,
};
