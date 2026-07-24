'use strict';

const crypto = require('crypto');

const WORK_ORDER_ATTEMPT_STATUS = Object.freeze({
  ACTIVE: 'active',
  WAITING_GATE: 'waiting-gate',
  COMPLETED: 'completed',
  CHANGES_REQUESTED: 'changes-requested',
  FAILED: 'failed',
});

const WORK_ORDER_ATTEMPT_COMMAND = Object.freeze({
  START: 'start',
  STEP: 'step',
});

const WORK_ORDER_ATTEMPT_ACTION = Object.freeze({
  START_BUILDER: 'start-builder',
  CONTINUE_BUILDER: 'continue-builder',
  RUN_REVIEWER: 'run-reviewer',
  RUN_QA: 'run-qa',
});

const RECORD_KEYS = Object.freeze([
  'action',
  'approvalRefs',
  'artifactRefs',
  'attemptNumber',
  'authorityDigest',
  'checkpointRef',
  'command',
  'completedAt',
  'councilSessionId',
  'decisionInboxItemRefs',
  'dependencyDigest',
  'executionPlanId',
  'id',
  'missionId',
  'persisted',
  'position',
  'projectId',
  'recordDigest',
  'role',
  'runRefs',
  'sourceDigest',
  'staffingEntryId',
  'staffingPlanId',
  'startedAt',
  'status',
  'stopReason',
  'workOrderDigest',
  'workOrderId',
]);

const CREATE_INPUT_KEYS = Object.freeze([
  'action',
  'approvalRefs',
  'attemptNumber',
  'authorityDigest',
  'checkpointRef',
  'command',
  'councilSessionId',
  'dependencyDigest',
  'executionPlanId',
  'id',
  'missionId',
  'position',
  'projectId',
  'role',
  'sourceDigest',
  'staffingEntryId',
  'staffingPlanId',
  'startedAt',
  'workOrderDigest',
  'workOrderId',
]);

const TRANSITION_INPUT_KEYS = Object.freeze([
  'approvalRefs',
  'artifactRefs',
  'checkpointRef',
  'completedAt',
  'decisionInboxItemRefs',
  'runRefs',
  'status',
  'stopReason',
]);

const DIGEST_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]*$/;
const MAX_REF_COUNT = 128;
const MAX_TEXT_LENGTH = 1024;

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label, { nullable = false } = {}) {
  if (nullable && value === null) return null;
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const normalized = value.trim();
  if (
    normalized.length > MAX_TEXT_LENGTH ||
    /[\u0000-\u001f\u007f]/.test(normalized)
  ) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeIdentifier(value, label) {
  const normalized = normalizeText(value, label);
  if (!IDENTIFIER_PATTERN.test(normalized)) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeDigest(value, label) {
  const normalized = normalizeText(value, label);
  if (!DIGEST_PATTERN.test(normalized)) {
    throw new Error(`${label} must be a SHA-256 digest`);
  }
  return normalized;
}

function normalizeTimestamp(value, label) {
  const normalized = normalizeText(value, label);
  if (
    Number.isNaN(Date.parse(normalized)) ||
    new Date(normalized).toISOString() !== normalized
  ) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizeReferenceList(value, label) {
  if (!Array.isArray(value) || value.length > MAX_REF_COUNT) {
    throw new Error(`${label} must be a bounded array`);
  }
  const normalized = value.map((entry, index) =>
    normalizeIdentifier(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
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

function computeWorkOrderAttemptRecordDigest(record) {
  if (!isPlainRecord(record)) {
    throw new Error('WorkOrderAttempt record must be an object');
  }
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function computeWorkOrderAttemptDependencyDigest(input) {
  assertExactKeys(
    input,
    ['dependencies', 'executionPlanId', 'workOrderId'],
    'WorkOrderAttempt dependency input',
  );
  if (!Array.isArray(input.dependencies)) {
    throw new Error('WorkOrderAttempt dependencies must be an array');
  }
  const dependencies = input.dependencies
    .map((dependency, index) => {
      assertExactKeys(
        dependency,
        ['id', 'status'],
        `WorkOrderAttempt dependency[${index}]`,
      );
      return {
        id: normalizeIdentifier(
          dependency.id,
          `WorkOrderAttempt dependency[${index}].id`,
        ),
        status: normalizeText(
          dependency.status,
          `WorkOrderAttempt dependency[${index}].status`,
        ),
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
  return digestCanonical({
    executionPlanId: normalizeIdentifier(
      input.executionPlanId,
      'WorkOrderAttempt executionPlanId',
    ),
    workOrderId: normalizeIdentifier(input.workOrderId, 'WorkOrderAttempt workOrderId'),
    dependencies,
  });
}

function computeWorkOrderAttemptAuthorityDigest(input) {
  assertExactKeys(
    input,
    [
      'action',
      'approvalRefs',
      'checkpointDigest',
      'checkpointRef',
      'command',
      'executionPlanId',
      'expectedWorkOrderId',
      'sourceDigest',
    ],
    'WorkOrderAttempt authority input',
  );
  return digestCanonical({
    executionPlanId: normalizeIdentifier(
      input.executionPlanId,
      'WorkOrderAttempt executionPlanId',
    ),
    expectedWorkOrderId: normalizeIdentifier(
      input.expectedWorkOrderId,
      'WorkOrderAttempt expectedWorkOrderId',
    ),
    command: normalizeText(input.command, 'WorkOrderAttempt command'),
    action: normalizeText(input.action, 'WorkOrderAttempt action'),
    sourceDigest: normalizeDigest(
      input.sourceDigest,
      'WorkOrderAttempt sourceDigest',
    ),
    checkpointRef:
      input.checkpointRef === null
        ? null
        : normalizeIdentifier(input.checkpointRef, 'WorkOrderAttempt checkpointRef'),
    checkpointDigest:
      input.checkpointDigest === null
        ? null
        : normalizeDigest(
            input.checkpointDigest,
            'WorkOrderAttempt checkpointDigest',
          ),
    approvalRefs: normalizeReferenceList(
      input.approvalRefs,
      'WorkOrderAttempt approvalRefs',
    ),
  });
}

function createWorkOrderAttempt(input) {
  assertExactKeys(input, CREATE_INPUT_KEYS, 'WorkOrderAttempt create input');
  const command = normalizeText(input.command, 'WorkOrderAttempt command');
  const action = normalizeText(input.action, 'WorkOrderAttempt action');
  if (!Object.values(WORK_ORDER_ATTEMPT_COMMAND).includes(command)) {
    throw new Error('WorkOrderAttempt command is invalid');
  }
  if (!Object.values(WORK_ORDER_ATTEMPT_ACTION).includes(action)) {
    throw new Error('WorkOrderAttempt action is invalid');
  }
  if (
    (command === WORK_ORDER_ATTEMPT_COMMAND.START &&
      action !== WORK_ORDER_ATTEMPT_ACTION.START_BUILDER) ||
    (command === WORK_ORDER_ATTEMPT_COMMAND.STEP &&
      action === WORK_ORDER_ATTEMPT_ACTION.START_BUILDER)
  ) {
    throw new Error('WorkOrderAttempt command and action do not match');
  }
  if (
    !Number.isInteger(input.position) ||
    input.position < 1 ||
    !Number.isInteger(input.attemptNumber) ||
    input.attemptNumber < 1
  ) {
    throw new Error('WorkOrderAttempt position and attemptNumber must be positive integers');
  }
  const id = normalizeIdentifier(input.id, 'WorkOrderAttempt id');
  if (!/^work-order-attempt-\d{4}$/.test(id)) {
    throw new Error('WorkOrderAttempt id must use the work-order-attempt-0000 format');
  }
  const startedAt = normalizeTimestamp(input.startedAt, 'WorkOrderAttempt startedAt');
  const record = {
    id,
    persisted: true,
    executionPlanId: normalizeIdentifier(
      input.executionPlanId,
      'WorkOrderAttempt executionPlanId',
    ),
    workOrderId: normalizeIdentifier(input.workOrderId, 'WorkOrderAttempt workOrderId'),
    missionId: normalizeIdentifier(input.missionId, 'WorkOrderAttempt missionId'),
    projectId: normalizeIdentifier(input.projectId, 'WorkOrderAttempt projectId'),
    staffingPlanId: normalizeIdentifier(
      input.staffingPlanId,
      'WorkOrderAttempt staffingPlanId',
    ),
    staffingEntryId: normalizeIdentifier(
      input.staffingEntryId,
      'WorkOrderAttempt staffingEntryId',
    ),
    councilSessionId: normalizeIdentifier(
      input.councilSessionId,
      'WorkOrderAttempt councilSessionId',
    ),
    role: normalizeIdentifier(input.role, 'WorkOrderAttempt role'),
    position: input.position,
    attemptNumber: input.attemptNumber,
    command,
    action,
    status: WORK_ORDER_ATTEMPT_STATUS.ACTIVE,
    sourceDigest: normalizeDigest(
      input.sourceDigest,
      'WorkOrderAttempt sourceDigest',
    ),
    workOrderDigest: normalizeDigest(
      input.workOrderDigest,
      'WorkOrderAttempt workOrderDigest',
    ),
    dependencyDigest: normalizeDigest(
      input.dependencyDigest,
      'WorkOrderAttempt dependencyDigest',
    ),
    authorityDigest: normalizeDigest(
      input.authorityDigest,
      'WorkOrderAttempt authorityDigest',
    ),
    checkpointRef:
      input.checkpointRef === null
        ? null
        : normalizeIdentifier(input.checkpointRef, 'WorkOrderAttempt checkpointRef'),
    approvalRefs: normalizeReferenceList(
      input.approvalRefs,
      'WorkOrderAttempt approvalRefs',
    ),
    runRefs: [],
    artifactRefs: [],
    decisionInboxItemRefs: [],
    stopReason: null,
    startedAt,
    completedAt: null,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeWorkOrderAttemptRecordDigest(record),
  });
}

function transitionWorkOrderAttempt(record, input) {
  assertWorkOrderAttemptRecord(record);
  assertExactKeys(input, TRANSITION_INPUT_KEYS, 'WorkOrderAttempt transition input');
  if (record.status !== WORK_ORDER_ATTEMPT_STATUS.ACTIVE) {
    throw new Error(`WorkOrderAttempt ${record.id} is not active`);
  }
  const status = normalizeText(input.status, 'WorkOrderAttempt transition status');
  if (
    status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE ||
    !Object.values(WORK_ORDER_ATTEMPT_STATUS).includes(status)
  ) {
    throw new Error('WorkOrderAttempt transition status is invalid');
  }
  const completedAt = normalizeTimestamp(
    input.completedAt,
    'WorkOrderAttempt completedAt',
  );
  if (Date.parse(completedAt) < Date.parse(record.startedAt)) {
    throw new Error('WorkOrderAttempt completedAt precedes startedAt');
  }
  const stopReason = normalizeText(input.stopReason, 'WorkOrderAttempt stopReason', {
    nullable: status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED,
  });
  if (status === WORK_ORDER_ATTEMPT_STATUS.COMPLETED && stopReason !== null) {
    throw new Error('Completed WorkOrderAttempt must not have a stopReason');
  }
  const next = {
    ...record,
    status,
    checkpointRef:
      input.checkpointRef === null
        ? null
        : normalizeIdentifier(input.checkpointRef, 'WorkOrderAttempt checkpointRef'),
    approvalRefs: normalizeReferenceList(
      input.approvalRefs,
      'WorkOrderAttempt approvalRefs',
    ),
    runRefs: normalizeReferenceList(input.runRefs, 'WorkOrderAttempt runRefs'),
    artifactRefs: normalizeReferenceList(
      input.artifactRefs,
      'WorkOrderAttempt artifactRefs',
    ),
    decisionInboxItemRefs: normalizeReferenceList(
      input.decisionInboxItemRefs,
      'WorkOrderAttempt decisionInboxItemRefs',
    ),
    stopReason,
    completedAt,
  };
  delete next.recordDigest;
  return deepFreeze({
    ...next,
    recordDigest: computeWorkOrderAttemptRecordDigest(next),
  });
}

function assertWorkOrderAttemptRecord(record) {
  assertExactKeys(record, RECORD_KEYS, 'WorkOrderAttempt record');
  if (record.persisted !== true) {
    throw new Error('WorkOrderAttempt persisted must be true');
  }
  const reconstructed = createWorkOrderAttempt({
    id: record.id,
    executionPlanId: record.executionPlanId,
    workOrderId: record.workOrderId,
    missionId: record.missionId,
    projectId: record.projectId,
    staffingPlanId: record.staffingPlanId,
    staffingEntryId: record.staffingEntryId,
    councilSessionId: record.councilSessionId,
    role: record.role,
    position: record.position,
    attemptNumber: record.attemptNumber,
    command: record.command,
    action: record.action,
    sourceDigest: record.sourceDigest,
    workOrderDigest: record.workOrderDigest,
    dependencyDigest: record.dependencyDigest,
    authorityDigest: record.authorityDigest,
    checkpointRef: record.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE
      ? record.checkpointRef
      : null,
    approvalRefs: record.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE
      ? record.approvalRefs
      : [],
    startedAt: record.startedAt,
  });
  if (record.status === WORK_ORDER_ATTEMPT_STATUS.ACTIVE) {
    if (
      record.completedAt !== null ||
      record.stopReason !== null ||
      record.runRefs.length !== 0 ||
      record.artifactRefs.length !== 0 ||
      record.decisionInboxItemRefs.length !== 0
    ) {
      throw new Error('Active WorkOrderAttempt has terminal evidence');
    }
  } else {
    transitionWorkOrderAttempt(reconstructed, {
      status: record.status,
      checkpointRef: record.checkpointRef,
      approvalRefs: record.approvalRefs,
      runRefs: record.runRefs,
      artifactRefs: record.artifactRefs,
      decisionInboxItemRefs: record.decisionInboxItemRefs,
      stopReason: record.stopReason,
      completedAt: record.completedAt,
    });
  }
  if (computeWorkOrderAttemptRecordDigest(record) !== record.recordDigest) {
    throw new Error('WorkOrderAttempt recordDigest does not match its payload');
  }
  return record;
}

module.exports = {
  WORK_ORDER_ATTEMPT_ACTION,
  WORK_ORDER_ATTEMPT_COMMAND,
  WORK_ORDER_ATTEMPT_STATUS,
  assertWorkOrderAttemptRecord,
  computeWorkOrderAttemptAuthorityDigest,
  computeWorkOrderAttemptDependencyDigest,
  computeWorkOrderAttemptRecordDigest,
  createWorkOrderAttempt,
  transitionWorkOrderAttempt,
};
