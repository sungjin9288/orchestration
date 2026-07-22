'use strict';

const crypto = require('crypto');

const INPUT_KEYS = ['evaluatedAt', 'executionPlan', 'workOrder'];
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

const BLOCKED_ACTIONS = Object.freeze([
  'approval',
  'automatic-completion',
  'automatic-retry',
  'commit',
  'durable-proof',
  'execute-command',
  'external-connectors',
  'persist',
  'provider-call',
  'push',
  'release',
  'scheduling',
  'schema-migration',
  'source-mutation',
]);

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

function normalizeStoredText(value, label) {
  if (typeof value !== 'string' || !value) {
    throw new Error(`${label} is invalid`);
  }
  return value;
}

function normalizeStringList(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  const normalized = value.map((entry, index) =>
    normalizeStoredText(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }
  return normalized;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeStoredText(value, label);
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

function computeExecutionPlanRecordDigest(executionPlan) {
  if (!isPlainRecord(executionPlan)) {
    throw new Error('ExecutionPlan record is required');
  }
  return digestCanonical(executionPlan);
}

function computeWorkOrderRecordDigest(workOrder) {
  if (!isPlainRecord(workOrder)) {
    throw new Error('WorkOrder record is required');
  }
  const { acceptanceCriterionRefs: _acceptanceCriterionRefs, ...sourceRecord } = workOrder;
  return digestCanonical(sourceRecord);
}

function buildCriterion(id, kind, title, proofMode, sourceField, sourceValues, evidenceKinds) {
  return {
    id,
    kind,
    title,
    essential: true,
    proofMode,
    sourceField,
    sourceValues: [...sourceValues],
    requiredEvidenceKinds: [...evidenceKinds],
    newInformationRequired: true,
    status: 'unverified',
    evidenceArtifactIds: [],
    lastVerifiedDigest: null,
  };
}

function previewWorkOrderVerificationPlan(input, options = {}) {
  assertExactKeys(input, INPUT_KEYS, 'WorkOrderVerificationPlan preview input');
  const { executionPlan, workOrder } = input;
  if (!isPlainRecord(executionPlan) || !isPlainRecord(workOrder)) {
    throw new Error('ExecutionPlan and WorkOrder records are required');
  }

  const executionPlanId = normalizeStoredText(executionPlan.id, 'ExecutionPlan id');
  const workOrderId = normalizeStoredText(workOrder.id, 'WorkOrder id');
  const sourceDigest = normalizeStoredText(executionPlan.sourceDigest, 'ExecutionPlan sourceDigest');
  if (!/^[a-f0-9]{64}$/.test(sourceDigest)) {
    throw new Error('ExecutionPlan sourceDigest is invalid');
  }
  if (
    workOrder.executionPlanId !== executionPlanId ||
    !Array.isArray(executionPlan.workOrderIds) ||
    !executionPlan.workOrderIds.includes(workOrderId) ||
    workOrder.sourceDigest !== sourceDigest
  ) {
    throw new Error('WorkOrder does not belong to the source-current ExecutionPlan');
  }

  const evaluatedAt = normalizeIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  const now = normalizeIsoTimestamp(options.now || new Date().toISOString(), 'now');
  const createdAt = normalizeIsoTimestamp(workOrder.createdAt, 'WorkOrder createdAt');
  if (Date.parse(evaluatedAt) < Date.parse(createdAt)) {
    throw new Error('evaluatedAt must follow WorkOrder creation');
  }
  if (Date.parse(evaluatedAt) > Date.parse(now) + MAX_CLOCK_SKEW_MS) {
    throw new Error('evaluatedAt is too far in the future');
  }

  const acceptanceCriteria = normalizeStringList(
    workOrder.acceptanceCriteria,
    'WorkOrder acceptanceCriteria',
  );
  const expectedArtifacts = normalizeStringList(
    workOrder.expectedArtifacts,
    'WorkOrder expectedArtifacts',
  );
  const stopConditions = normalizeStringList(
    workOrder.stopConditions,
    'WorkOrder stopConditions',
  );
  const verificationCommands = normalizeStringList(
    workOrder.verificationCommands,
    'WorkOrder verificationCommands',
  );
  const executionPlanDigest = computeExecutionPlanRecordDigest(executionPlan);
  const workOrderDigest = computeWorkOrderRecordDigest(workOrder);
  const criteria = [
    buildCriterion(
      'criterion-happy-path',
      'happy-path',
      'Accepted outcome',
      'review',
      'acceptanceCriteria',
      acceptanceCriteria,
      ['review-verdict'],
    ),
    buildCriterion(
      'criterion-risk',
      'risk',
      'Stop boundary',
      'review',
      'stopConditions',
      stopConditions,
      ['review-verdict'],
    ),
    buildCriterion(
      'criterion-regression',
      'regression',
      'Command verification',
      'command',
      'verificationCommands',
      verificationCommands,
      ['command-transcript'],
    ),
    buildCriterion(
      'criterion-manual',
      'manual',
      'Artifact inspection',
      'manual',
      'expectedArtifacts',
      expectedArtifacts,
      ['artifact'],
    ),
  ];

  const payload = {
    schemaVersion: 1,
    persisted: false,
    status: 'review-ready',
    executionPlanId,
    executionPlanDigest,
    workOrderId,
    workOrderDigest,
    missionId: normalizeStoredText(executionPlan.missionId, 'ExecutionPlan missionId'),
    projectId: normalizeStoredText(executionPlan.projectId, 'ExecutionPlan projectId'),
    sourceDigest,
    criteria,
    coverage: {
      complete: true,
      acceptanceCriteria: acceptanceCriteria.length,
      expectedArtifacts: expectedArtifacts.length,
      stopConditions: stopConditions.length,
      verificationCommands: verificationCommands.length,
    },
    approvalAllowed: false,
    completionAllowed: false,
    commandExecutionAllowed: false,
    persistenceAllowed: false,
    blockedActions: [...BLOCKED_ACTIONS],
    evaluatedAt,
  };
  const previewDigest = digestCanonical(payload);

  return deepFreeze({
    ...payload,
    id: `workorder-verification-plan-preview-${previewDigest.slice(0, 16)}`,
    previewDigest,
  });
}

module.exports = {
  BLOCKED_ACTIONS,
  computeExecutionPlanRecordDigest,
  computeWorkOrderRecordDigest,
  previewWorkOrderVerificationPlan,
};
