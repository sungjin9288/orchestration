'use strict';

const crypto = require('crypto');

const STAFFING_ENTRY_STATUS = 'bound';
const STAFFING_ENTRY_KIND = 'real-council';
const STAFFING_ENTRY_ALLOWED_ACTION = 'council-start';
const STAFFING_ENTRY_APPROVAL_DECISION = 'enter';
const STAFFING_ENTRY_APPROVAL_ACKNOWLEDGEMENT =
  'bind-exact-accepted-staffing-plan-to-local-council';
const STAFFING_ENTRY_BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'auto-chain',
  'commit',
  'dynamic-staffing',
  'external-connectors',
  'memory-application',
  'parallel-specialists',
  'policy-mutation',
  'provider-call',
  'push',
  'release',
  'request-revision',
  'resume',
  'retry',
  'rework',
  'scheduler',
  'source-mutation',
  'workorder-creation',
  'workorder-dispatch',
]);

const APPROVAL_KEYS = ['acknowledgement', 'decision', 'rationale', 'requestedAt'];
const TERMINATION_POLICY_KEYS = [
  'deadlineMs',
  'maxProviderCalls',
  'maxTurnsPerAgent',
  'stopOnRequiredRoleFailure',
];
const RECORD_KEYS = [
  'allowedAction',
  'blockedActions',
  'blueprintDigest',
  'boundAt',
  'councilSessionId',
  'createdAt',
  'entryApproval',
  'entryApprovalDigest',
  'entryKind',
  'entrySourceDigest',
  'id',
  'missionDigest',
  'missionId',
  'persisted',
  'projectId',
  'projectPack',
  'providerMode',
  'recordDigest',
  'selectedAgentIds',
  'selectedRoles',
  'sourceDigest',
  'staffingPlanId',
  'staffingPlanRecordDigest',
  'staffingSpecDigest',
  'status',
  'terminationPolicy',
  'updatedAt',
  'workspaceScope',
];
const MAX_TEXT_LENGTH = 1024;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
const DIGEST_PATTERN = /^[a-f0-9]{64}$/;

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertExactKeys(value, expectedKeys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  const actualKeys = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (
    actualKeys.length !== expected.length ||
    actualKeys.some((key, index) => key !== expected[index])
  ) {
    throw new Error(`${label} has unexpected or missing fields`);
  }
}

function normalizeText(value, label, { maxLength = MAX_TEXT_LENGTH } = {}) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }

  const normalized = value.trim();
  if (/[\u0000-\u001f\u007f]/.test(normalized)) {
    throw new Error(`${label} must not contain control characters`);
  }
  if (normalized.length > maxLength) {
    throw new Error(`${label} exceeds ${maxLength} characters`);
  }
  return normalized;
}

function normalizeIdentifier(value, label) {
  const normalized = normalizeText(value, label, { maxLength: 256 });
  if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(normalized)) {
    throw new Error(`${label} is invalid`);
  }
  return normalized;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeText(value, label, { maxLength: 64 });
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed) || new Date(parsed).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizeSortedUniqueList(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  const normalized = value.map((entry) => normalizeIdentifier(entry, label));
  const sorted = [...new Set(normalized)].sort();
  if (
    sorted.length !== value.length ||
    sorted.some((entry, index) => entry !== value[index])
  ) {
    throw new Error(`${label} must be sorted and unique`);
  }
  return sorted;
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
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) {
    deepFreeze(child);
  }
  return Object.freeze(value);
}

function normalizeTerminationPolicy(value) {
  assertExactKeys(value, TERMINATION_POLICY_KEYS, 'StaffingEntry terminationPolicy');
  if (
    value.maxProviderCalls !== 0 ||
    !Number.isInteger(value.maxTurnsPerAgent) ||
    value.maxTurnsPerAgent < 1 ||
    !Number.isInteger(value.deadlineMs) ||
    value.deadlineMs < 1 ||
    value.stopOnRequiredRoleFailure !== true
  ) {
    throw new Error('StaffingEntry terminationPolicy is invalid');
  }
  return {
    maxProviderCalls: 0,
    maxTurnsPerAgent: value.maxTurnsPerAgent,
    deadlineMs: value.deadlineMs,
    stopOnRequiredRoleFailure: true,
  };
}

function normalizeStaffingEntryApproval(value, staffingPlan, now) {
  assertExactKeys(value, APPROVAL_KEYS, 'StaffingEntry entryApproval');
  if (value.decision !== STAFFING_ENTRY_APPROVAL_DECISION) {
    throw new Error(`entryApproval.decision must be ${STAFFING_ENTRY_APPROVAL_DECISION}`);
  }
  if (value.acknowledgement !== STAFFING_ENTRY_APPROVAL_ACKNOWLEDGEMENT) {
    throw new Error(
      `entryApproval.acknowledgement must be ${STAFFING_ENTRY_APPROVAL_ACKNOWLEDGEMENT}`,
    );
  }

  const requestedAt = normalizeIsoTimestamp(
    value.requestedAt,
    'StaffingEntry entryApproval.requestedAt',
  );
  const nowIso = normalizeIsoTimestamp(now || new Date().toISOString(), 'current time');
  if (Date.parse(requestedAt) < Date.parse(staffingPlan.acceptedAt)) {
    throw new Error('entryApproval.requestedAt must not precede StaffingPlan acceptance');
  }
  if (Date.parse(requestedAt) > Date.parse(nowIso) + MAX_CLOCK_SKEW_MS) {
    throw new Error('entryApproval.requestedAt is too far in the future');
  }

  return {
    decision: STAFFING_ENTRY_APPROVAL_DECISION,
    acknowledgement: STAFFING_ENTRY_APPROVAL_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'StaffingEntry entryApproval.rationale'),
    requestedAt,
  };
}

function computeStaffingEntryApprovalDigest(entryApproval) {
  return digestCanonical(entryApproval);
}

function buildStaffingEntrySourcePayload(staffingPlan, entryApprovalDigest) {
  return {
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryKind: STAFFING_ENTRY_KIND,
    selectedAgentIds: [...staffingPlan.selectedAgentIds],
    selectedRoles: [...staffingPlan.selectedRoles],
    terminationPolicy: structuredClone(staffingPlan.terminationPolicy),
    entryApprovalDigest,
  };
}

function computeStaffingEntrySourceDigest(staffingPlan, entryApprovalDigest) {
  return digestCanonical(buildStaffingEntrySourcePayload(staffingPlan, entryApprovalDigest));
}

function computeStaffingEntryRecordDigest(record) {
  if (!isPlainRecord(record)) {
    throw new Error('StaffingEntry record must be an object');
  }
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function assertAcceptedCouncilStaffingPlan(staffingPlan) {
  if (
    !isPlainRecord(staffingPlan) ||
    staffingPlan.persisted !== true ||
    staffingPlan.status !== 'accepted' ||
    staffingPlan.mode !== 'council' ||
    staffingPlan.providerMode !== 'local-stub' ||
    !Array.isArray(staffingPlan.parallelGroups) ||
    staffingPlan.parallelGroups.length !== 0
  ) {
    throw new Error('StaffingEntry requires one accepted council-mode local StaffingPlan');
  }
  if (!DIGEST_PATTERN.test(String(staffingPlan.recordDigest || ''))) {
    throw new Error('StaffingEntry StaffingPlan recordDigest is invalid');
  }
}

function createStaffingEntry(input, { now } = {}) {
  assertExactKeys(
    input,
    ['councilSessionId', 'entryApproval', 'id', 'staffingPlan'],
    'StaffingEntry input',
  );
  const id = normalizeIdentifier(input.id, 'StaffingEntry id');
  if (!/^staffing-entry-\d{4}$/.test(id)) {
    throw new Error('StaffingEntry id must use the staffing-entry-0000 sequence format');
  }
  const councilSessionId = normalizeIdentifier(
    input.councilSessionId,
    'StaffingEntry councilSessionId',
  );
  if (!/^councilSession-\d{4}$/.test(councilSessionId)) {
    throw new Error('StaffingEntry councilSessionId is invalid');
  }

  const staffingPlan = input.staffingPlan;
  assertAcceptedCouncilStaffingPlan(staffingPlan);
  const entryApproval = normalizeStaffingEntryApproval(input.entryApproval, staffingPlan, now);
  const entryApprovalDigest = computeStaffingEntryApprovalDigest(entryApproval);
  const boundAt = entryApproval.requestedAt;
  const record = {
    id,
    persisted: true,
    status: STAFFING_ENTRY_STATUS,
    entryKind: STAFFING_ENTRY_KIND,
    missionId: staffingPlan.missionId,
    projectId: staffingPlan.projectId,
    projectPack: staffingPlan.projectPack,
    workspaceScope: structuredClone(staffingPlan.workspaceScope),
    staffingPlanId: staffingPlan.id,
    staffingPlanRecordDigest: staffingPlan.recordDigest,
    councilSessionId,
    selectedAgentIds: [...staffingPlan.selectedAgentIds],
    selectedRoles: [...staffingPlan.selectedRoles],
    providerMode: 'local-stub',
    terminationPolicy: structuredClone(staffingPlan.terminationPolicy),
    sourceDigest: staffingPlan.sourceDigest,
    missionDigest: staffingPlan.missionDigest,
    blueprintDigest: staffingPlan.blueprintDigest,
    staffingSpecDigest: staffingPlan.staffingSpecDigest,
    entryApproval,
    entryApprovalDigest,
    entrySourceDigest: computeStaffingEntrySourceDigest(staffingPlan, entryApprovalDigest),
    allowedAction: STAFFING_ENTRY_ALLOWED_ACTION,
    blockedActions: [...STAFFING_ENTRY_BLOCKED_ACTIONS],
    boundAt,
    createdAt: boundAt,
    updatedAt: boundAt,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeStaffingEntryRecordDigest(record),
  });
}

function assertStaffingEntryRecord(record) {
  assertExactKeys(record, RECORD_KEYS, 'StaffingEntry record');
  for (const field of [
    'id',
    'status',
    'entryKind',
    'missionId',
    'projectId',
    'projectPack',
    'staffingPlanId',
    'staffingPlanRecordDigest',
    'councilSessionId',
    'providerMode',
    'sourceDigest',
    'missionDigest',
    'blueprintDigest',
    'staffingSpecDigest',
    'entryApprovalDigest',
    'entrySourceDigest',
    'allowedAction',
    'boundAt',
    'createdAt',
    'updatedAt',
    'recordDigest',
  ]) {
    normalizeText(record[field], `StaffingEntry ${field}`);
  }
  if (
    record.persisted !== true ||
    record.status !== STAFFING_ENTRY_STATUS ||
    record.entryKind !== STAFFING_ENTRY_KIND ||
    record.providerMode !== 'local-stub' ||
    record.allowedAction !== STAFFING_ENTRY_ALLOWED_ACTION ||
    !/^staffing-entry-\d{4}$/.test(record.id) ||
    !/^staffing-plan-\d{4}$/.test(record.staffingPlanId) ||
    !/^councilSession-\d{4}$/.test(record.councilSessionId)
  ) {
    throw new Error('StaffingEntry has invalid immutable identity or status');
  }
  for (const field of [
    'staffingPlanRecordDigest',
    'sourceDigest',
    'missionDigest',
    'blueprintDigest',
    'staffingSpecDigest',
    'entryApprovalDigest',
    'entrySourceDigest',
    'recordDigest',
  ]) {
    if (!DIGEST_PATTERN.test(record[field])) {
      throw new Error(`StaffingEntry ${field} must be sha256 hex`);
    }
  }
  assertExactKeys(record.workspaceScope, ['projectId'], 'StaffingEntry workspaceScope');
  if (record.workspaceScope.projectId !== record.projectId) {
    throw new Error('StaffingEntry workspaceScope must match its project');
  }
  normalizeSortedUniqueList(record.selectedAgentIds, 'StaffingEntry selectedAgentIds');
  normalizeSortedUniqueList(record.selectedRoles, 'StaffingEntry selectedRoles');
  if (
    record.selectedAgentIds.length !== 4 ||
    record.selectedRoles.length !== 4 ||
    record.selectedAgentIds.length !== record.selectedRoles.length
  ) {
    throw new Error('StaffingEntry must bind exactly four Council roles');
  }
  normalizeTerminationPolicy(record.terminationPolicy);
  if (
    !Array.isArray(record.blockedActions) ||
    record.blockedActions.length !== STAFFING_ENTRY_BLOCKED_ACTIONS.length ||
    record.blockedActions.some(
      (action, index) => action !== STAFFING_ENTRY_BLOCKED_ACTIONS[index],
    )
  ) {
    throw new Error('StaffingEntry blockedActions are invalid');
  }
  const entryApproval = normalizeStaffingEntryApproval(
    record.entryApproval,
    { acceptedAt: record.boundAt },
    record.boundAt,
  );
  if (
    entryApproval.requestedAt !== record.boundAt ||
    record.createdAt !== record.boundAt ||
    record.updatedAt !== record.boundAt ||
    computeStaffingEntryApprovalDigest(entryApproval) !== record.entryApprovalDigest ||
    computeStaffingEntryRecordDigest(record) !== record.recordDigest
  ) {
    throw new Error('StaffingEntry immutable digest or timestamp evidence is invalid');
  }
  return record;
}

module.exports = {
  STAFFING_ENTRY_ALLOWED_ACTION,
  STAFFING_ENTRY_APPROVAL_ACKNOWLEDGEMENT,
  STAFFING_ENTRY_APPROVAL_DECISION,
  STAFFING_ENTRY_BLOCKED_ACTIONS,
  STAFFING_ENTRY_KIND,
  STAFFING_ENTRY_STATUS,
  assertStaffingEntryRecord,
  computeStaffingEntryApprovalDigest,
  computeStaffingEntryRecordDigest,
  computeStaffingEntrySourceDigest,
  createStaffingEntry,
  normalizeStaffingEntryApproval,
};
