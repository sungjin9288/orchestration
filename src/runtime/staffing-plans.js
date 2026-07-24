'use strict';

const crypto = require('crypto');

const STAFFING_PLAN_STATUS = 'accepted';
const STAFFING_PLAN_PREVIEW_STATUS = 'review-ready';
const STAFFING_PLAN_ACCEPTANCE_DECISION = 'accept';
const STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT =
  'reviewed-exact-staffing-plan-for-local-record';
const STAFFING_PLAN_BLOCKED_ACTIONS = Object.freeze([
  'approval-bypass',
  'automatic-staffing',
  'commit',
  'council-start',
  'dynamic-staffing',
  'external-connectors',
  'memory-application',
  'parallel-execution',
  'policy-mutation',
  'provider-call',
  'push',
  'release',
  'retry',
  'rework',
  'scheduler',
  'source-mutation',
  'workorder-creation',
]);

const PREVIEW_INPUT_KEYS = [
  'activeProjectId',
  'blueprintEvidence',
  'evaluatedAt',
  'mission',
  'project',
  'staffingSpec',
];
const STAFFING_SPEC_KEYS = [
  'mode',
  'parallelGroups',
  'providerMode',
  'selectedAgentIds',
  'selectionRationale',
  'terminationPolicy',
];
const TERMINATION_POLICY_KEYS = [
  'deadlineMs',
  'maxProviderCalls',
  'maxTurnsPerAgent',
  'stopOnRequiredRoleFailure',
];
const ACCEPTANCE_KEYS = ['acknowledgement', 'decision', 'rationale', 'reviewedAt'];
const PREVIEW_KEYS = [
  'blueprintDigest',
  'blueprintSourceRefs',
  'blockedActions',
  'evaluatedAt',
  'id',
  'missionDigest',
  'missionId',
  'mode',
  'parallelGroups',
  'persisted',
  'previewDigest',
  'projectId',
  'projectPack',
  'providerMode',
  'roleSourceDigests',
  'selectedAgentIds',
  'selectedRoles',
  'selectionRationale',
  'sourceDigest',
  'sourceRefs',
  'staffingSpecDigest',
  'status',
  'terminationPolicy',
  'workspaceScope',
];
const RECORD_INPUT_KEYS = ['acceptance', 'id', 'preview'];
const MAX_TEXT_LENGTH = 1024;
const MAX_LIST_ENTRIES = 64;
const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;
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
  if (/[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error(`${label} must not contain control characters`);
  }
  return value;
}

function normalizeIsoTimestamp(value, label) {
  const normalized = normalizeText(value, label, { maxLength: 64 });
  const timestamp = Date.parse(normalized);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString() !== normalized) {
    throw new Error(`${label} must be an exact ISO timestamp`);
  }
  return normalized;
}

function normalizePositiveInteger(value, label, maximum) {
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${label} must be a positive integer no greater than ${maximum}`);
  }
  return value;
}

function normalizeIdentifier(value, label) {
  return normalizeText(value, label, { maxLength: 256 });
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (!isPlainRecord(value)) {
    return value;
  }
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

function normalizeIdList(value, label, { allowEmpty = false } = {}) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0)) {
    throw new Error(`${label} must be a ${allowEmpty ? '' : 'non-empty '}array`);
  }
  if (value.length > MAX_LIST_ENTRIES) {
    throw new Error(`${label} has too many entries`);
  }
  const normalized = value.map((entry, index) => normalizeIdentifier(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }
  return normalized.sort();
}

function normalizeParallelGroups(value, selectedAgentIds) {
  if (!Array.isArray(value) || value.length > MAX_LIST_ENTRIES) {
    throw new Error('staffingSpec.parallelGroups must be a bounded array');
  }

  const selected = new Set(selectedAgentIds);
  const assigned = new Set();
  const groups = value.map((group, groupIndex) => {
    const normalized = normalizeIdList(group, `staffingSpec.parallelGroups[${groupIndex}]`);
    for (const agentId of normalized) {
      if (!selected.has(agentId)) {
        throw new Error('staffingSpec.parallelGroups must only contain selected agents');
      }
      if (assigned.has(agentId)) {
        throw new Error('staffingSpec.parallelGroups must not repeat agents');
      }
      assigned.add(agentId);
    }
    return normalized;
  });

  const keys = new Set();
  for (const group of groups) {
    const key = group.join('\u0000');
    if (keys.has(key)) {
      throw new Error('staffingSpec.parallelGroups must not contain duplicates');
    }
    keys.add(key);
  }

  return groups.sort((left, right) => left.join('\u0000').localeCompare(right.join('\u0000')));
}

function normalizeTerminationPolicy(value, blueprint) {
  assertExactKeys(value, TERMINATION_POLICY_KEYS, 'staffingSpec.terminationPolicy');
  const defaults = blueprint.defaultTerminationPolicy;
  if (!isPlainRecord(defaults)) {
    throw new Error('CompanyBlueprint termination policy is invalid');
  }
  if (value.maxProviderCalls !== 0) {
    throw new Error('staffingSpec.terminationPolicy.maxProviderCalls must be 0');
  }
  if (value.stopOnRequiredRoleFailure !== true) {
    throw new Error(
      'staffingSpec.terminationPolicy.stopOnRequiredRoleFailure must be true',
    );
  }
  return {
    maxProviderCalls: 0,
    maxTurnsPerAgent: normalizePositiveInteger(
      value.maxTurnsPerAgent,
      'staffingSpec.terminationPolicy.maxTurnsPerAgent',
      defaults.maxTurnsPerAgent,
    ),
    deadlineMs: normalizePositiveInteger(
      value.deadlineMs,
      'staffingSpec.terminationPolicy.deadlineMs',
      defaults.deadlineMs,
    ),
    stopOnRequiredRoleFailure: true,
  };
}

function normalizeStaffingSpec(value, blueprint) {
  assertExactKeys(value, STAFFING_SPEC_KEYS, 'staffingSpec');
  if (!isPlainRecord(blueprint)) {
    throw new Error('CompanyBlueprint is required to normalize staffingSpec');
  }

  const mode = normalizeText(value.mode, 'staffingSpec.mode', { maxLength: 32 });
  if (!['solo', 'council', 'parallel-specialists'].includes(mode)) {
    throw new Error('staffingSpec.mode must be solo, council, or parallel-specialists');
  }

  const selectedAgentIds = normalizeIdList(value.selectedAgentIds, 'staffingSpec.selectedAgentIds');
  const parallelGroups = normalizeParallelGroups(value.parallelGroups, selectedAgentIds);
  const providerMode = normalizeText(value.providerMode, 'staffingSpec.providerMode', {
    maxLength: 32,
  });
  if (providerMode !== 'local-stub') {
    throw new Error('staffingSpec.providerMode must be local-stub');
  }

  return {
    mode,
    selectedAgentIds,
    selectionRationale: normalizeText(value.selectionRationale, 'staffingSpec.selectionRationale'),
    parallelGroups,
    providerMode,
    terminationPolicy: normalizeTerminationPolicy(value.terminationPolicy, blueprint),
  };
}

function buildMissionDigestPayload(mission) {
  if (!isPlainRecord(mission)) {
    throw new Error('StaffingPlan requires one Mission record');
  }
  const status = normalizeStoredText(mission.status, 'Mission status');
  if (status !== 'draft' || mission.linkedTaskId !== null || mission.councilSessionId !== null) {
    throw new Error('StaffingPlan Mission must be current draft evidence');
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

function computeStaffingPlanMissionDigest(mission) {
  return digestCanonical(buildMissionDigestPayload(mission));
}

function assertBlueprintEvidence(value) {
  assertExactKeys(
    value,
    ['blueprint', 'blueprintDigest', 'roleSourceDigests', 'sourceRefs'],
    'blueprintEvidence',
  );
  if (!isPlainRecord(value.blueprint) || !Array.isArray(value.blueprint.agentProfiles)) {
    throw new Error('blueprintEvidence.blueprint is invalid');
  }
  if (!Array.isArray(value.sourceRefs) || !Array.isArray(value.roleSourceDigests)) {
    throw new Error('blueprintEvidence source evidence is invalid');
  }

  const profiles = value.blueprint.agentProfiles;
  const expectedRoleRefs = profiles
    .map((profile) => normalizeIdentifier(profile?.instructionsRef, 'AgentProfile instructionsRef'))
    .sort();
  const expectedSourceRefs = ['company/blueprint.json', ...expectedRoleRefs].sort();
  const sourceRefs = normalizeIdList(value.sourceRefs, 'blueprintEvidence.sourceRefs');
  if (
    sourceRefs.length !== expectedSourceRefs.length ||
    sourceRefs.some((ref, index) => ref !== expectedSourceRefs[index])
  ) {
    throw new Error('blueprintEvidence.sourceRefs must contain the blueprint and every role source');
  }

  const roleSourceDigests = value.roleSourceDigests.map((entry, index) => {
    assertExactKeys(entry, ['ref', 'sha256'], `blueprintEvidence.roleSourceDigests[${index}]`);
    const ref = normalizeIdentifier(entry.ref, `blueprintEvidence.roleSourceDigests[${index}].ref`);
    const sha256 = normalizeIdentifier(
      entry.sha256,
      `blueprintEvidence.roleSourceDigests[${index}].sha256`,
    );
    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      throw new Error('blueprintEvidence role source digest must be sha256 hex');
    }
    return { ref, sha256 };
  });
  roleSourceDigests.sort((left, right) => left.ref.localeCompare(right.ref));
  if (
    roleSourceDigests.length !== expectedRoleRefs.length ||
    roleSourceDigests.some((entry, index) => entry.ref !== expectedRoleRefs[index])
  ) {
    throw new Error('blueprintEvidence.roleSourceDigests must cover every role source');
  }

  const expectedDigest = digestCanonical({
    normalizedBlueprint: value.blueprint,
    roleSources: roleSourceDigests,
  });
  if (value.blueprintDigest !== expectedDigest) {
    throw new Error('blueprintEvidence.blueprintDigest is not current');
  }

  return {
    blueprint: value.blueprint,
    sourceRefs,
    roleSourceDigests,
    blueprintDigest: expectedDigest,
  };
}

function resolveSelectedProfiles(staffingSpec, blueprint, projectPack) {
  const profilesById = new Map();
  for (const profile of blueprint.agentProfiles) {
    const id = normalizeIdentifier(profile?.id, 'AgentProfile id');
    if (profilesById.has(id)) {
      throw new Error('CompanyBlueprint contains duplicate AgentProfile ids');
    }
    profilesById.set(id, profile);
  }

  const selectedProfiles = staffingSpec.selectedAgentIds.map((id) => {
    const profile = profilesById.get(id);
    if (!profile) {
      throw new Error(`staffingSpec selects unknown AgentProfile: ${id}`);
    }
    if (!Array.isArray(profile.supportedPacks) || !profile.supportedPacks.includes(projectPack)) {
      throw new Error(`AgentProfile ${id} does not support project pack: ${projectPack}`);
    }
    if (!Array.isArray(profile.providerPolicy?.allowedModes) || !profile.providerPolicy.allowedModes.includes('local-stub')) {
      throw new Error(`AgentProfile ${id} does not allow local-stub`);
    }
    if (profile.concurrencyLimit !== 1 || profile.toolPolicy?.write?.length !== 0) {
      throw new Error(`AgentProfile ${id} exceeds the StaffingPlan authority boundary`);
    }
    if (
      profile.authority?.canMutateSource !== false ||
      profile.authority?.canCommit !== false ||
      profile.authority?.canPush !== false
    ) {
      throw new Error(`AgentProfile ${id} has forbidden StaffingPlan authority`);
    }
    return profile;
  });

  if (staffingSpec.mode === 'solo') {
    if (selectedProfiles.length !== 1 || staffingSpec.parallelGroups.length !== 0) {
      throw new Error('solo StaffingPlan must select one agent with no parallel groups');
    }
  }

  if (staffingSpec.mode === 'council') {
    const required = normalizeIdList(
      blueprint.defaultStaffingPolicy?.requiredCouncilAgentIds,
      'CompanyBlueprint requiredCouncilAgentIds',
    );
    if (
      selectedProfiles.length !== required.length ||
      staffingSpec.selectedAgentIds.some((id, index) => id !== required[index]) ||
      staffingSpec.parallelGroups.length !== 0
    ) {
      throw new Error('council StaffingPlan must select exactly the required Council agents');
    }
  }

  if (staffingSpec.mode === 'parallel-specialists') {
    if (blueprint.defaultStaffingPolicy?.parallelSpecialistsAllowed !== true) {
      throw new Error('parallel-specialists StaffingPlan is disabled by CompanyBlueprint');
    }
    if (staffingSpec.parallelGroups.length === 0) {
      throw new Error('parallel-specialists StaffingPlan requires parallel groups');
    }
  }

  return selectedProfiles;
}

function normalizePreviewInput(input, now) {
  assertExactKeys(input, PREVIEW_INPUT_KEYS, 'StaffingPlan preview input');
  const nowIso = normalizeIsoTimestamp(now || new Date().toISOString(), 'current time');
  const missionPayload = buildMissionDigestPayload(input.mission);
  const activeProjectId = normalizeIdentifier(input.activeProjectId, 'activeProjectId');
  if (activeProjectId !== missionPayload.projectId) {
    throw new Error('StaffingPlan Mission must belong to the active project');
  }
  if (!isPlainRecord(input.project)) {
    throw new Error('StaffingPlan requires one project record');
  }
  const projectId = normalizeStoredText(input.project.id, 'Project id');
  const projectPack = normalizeStoredText(input.project.pack, 'Project pack');
  if (projectId !== missionPayload.projectId) {
    throw new Error('StaffingPlan Mission and project must match');
  }

  const evaluatedAt = normalizeIsoTimestamp(input.evaluatedAt, 'evaluatedAt');
  if (Date.parse(evaluatedAt) < Date.parse(missionPayload.updatedAt)) {
    throw new Error('StaffingPlan evaluatedAt must not precede Mission updatedAt');
  }
  if (Date.parse(evaluatedAt) > Date.parse(nowIso) + MAX_CLOCK_SKEW_MS) {
    throw new Error('StaffingPlan evaluatedAt is too far in the future');
  }

  const blueprintEvidence = assertBlueprintEvidence(input.blueprintEvidence);
  const staffingSpec = normalizeStaffingSpec(input.staffingSpec, blueprintEvidence.blueprint);
  const selectedProfiles = resolveSelectedProfiles(
    staffingSpec,
    blueprintEvidence.blueprint,
    projectPack,
  );

  return {
    missionPayload,
    projectId,
    projectPack,
    blueprintEvidence,
    staffingSpec,
    selectedProfiles,
    evaluatedAt,
  };
}

function computeStaffingPlanPreviewDigest(preview) {
  if (!isPlainRecord(preview)) {
    throw new Error('StaffingPlan preview must be an object');
  }
  const { id: _id, previewDigest: _previewDigest, ...payload } = preview;
  return digestCanonical(payload);
}

function previewMissionStaffingPlan(input, { now } = {}) {
  const context = normalizePreviewInput(input, now);
  const missionDigest = digestCanonical(context.missionPayload);
  const staffingSpecDigest = digestCanonical(context.staffingSpec);
  const sourceDigest = digestCanonical({
    missionDigest,
    projectId: context.projectId,
    projectPack: context.projectPack,
    blueprintDigest: context.blueprintEvidence.blueprintDigest,
    staffingSpecDigest,
  });
  const sourceRefs = [
    `mission:${context.missionPayload.id}`,
    `project:${context.projectId}`,
    ...context.blueprintEvidence.blueprint.sourceRefs,
    ...context.blueprintEvidence.sourceRefs,
  ].sort();
  const payload = {
    persisted: false,
    status: STAFFING_PLAN_PREVIEW_STATUS,
    missionId: context.missionPayload.id,
    projectId: context.projectId,
    projectPack: context.projectPack,
    workspaceScope: { projectId: context.projectId },
    mode: context.staffingSpec.mode,
    selectedAgentIds: [...context.staffingSpec.selectedAgentIds],
    selectedRoles: context.selectedProfiles.map((profile) => profile.role),
    selectionRationale: context.staffingSpec.selectionRationale,
    parallelGroups: structuredClone(context.staffingSpec.parallelGroups),
    providerMode: 'local-stub',
    terminationPolicy: structuredClone(context.staffingSpec.terminationPolicy),
    sourceRefs: [...new Set(sourceRefs)],
    blueprintSourceRefs: [...context.blueprintEvidence.sourceRefs],
    roleSourceDigests: structuredClone(context.blueprintEvidence.roleSourceDigests),
    sourceDigest,
    missionDigest,
    blueprintDigest: context.blueprintEvidence.blueprintDigest,
    staffingSpecDigest,
    blockedActions: [...STAFFING_PLAN_BLOCKED_ACTIONS],
    evaluatedAt: context.evaluatedAt,
  };
  const previewDigest = computeStaffingPlanPreviewDigest(payload);
  return deepFreeze({
    id: `staffing-plan-preview-${previewDigest.slice(0, 16)}`,
    ...payload,
    previewDigest,
  });
}

function assertPreview(value) {
  assertExactKeys(value, PREVIEW_KEYS, 'StaffingPlan preview');
  if (
    value.persisted !== false ||
    value.status !== STAFFING_PLAN_PREVIEW_STATUS ||
    !/^staffing-plan-preview-[a-f0-9]{16}$/.test(value.id)
  ) {
    throw new Error('StaffingPlan preview is invalid');
  }
  const computedDigest = computeStaffingPlanPreviewDigest(value);
  if (
    value.previewDigest !== computedDigest ||
    value.id !== `staffing-plan-preview-${computedDigest.slice(0, 16)}`
  ) {
    throw new Error('StaffingPlan preview digest is not current');
  }

  const selectedAgentIds = normalizeIdList(value.selectedAgentIds, 'StaffingPlan preview agents');
  const selectedRoles = normalizeIdList(value.selectedRoles, 'StaffingPlan preview roles');
  if (
    selectedAgentIds.length !== value.selectedAgentIds.length ||
    selectedRoles.length !== value.selectedRoles.length ||
    selectedAgentIds.some((id, index) => id !== value.selectedAgentIds[index]) ||
    selectedRoles.some((role, index) => role !== value.selectedRoles[index])
  ) {
    throw new Error('StaffingPlan preview selected agents and roles must be sorted and unique');
  }
  if (selectedAgentIds.length !== selectedRoles.length) {
    throw new Error('StaffingPlan preview selected agents and roles must match');
  }
  if (
    !['solo', 'council'].includes(value.mode) ||
    value.providerMode !== 'local-stub' ||
    !Array.isArray(value.parallelGroups) ||
    value.parallelGroups.length !== 0
  ) {
    throw new Error('StaffingPlan preview has an unsupported mode or execution boundary');
  }
  if ((value.mode === 'solo' && selectedAgentIds.length !== 1) ||
      (value.mode === 'council' && selectedAgentIds.length !== 4)) {
    throw new Error('StaffingPlan preview selected agents do not match its mode');
  }
  assertExactKeys(value.workspaceScope, ['projectId'], 'StaffingPlan preview workspaceScope');
  if (value.workspaceScope.projectId !== value.projectId) {
    throw new Error('StaffingPlan preview workspaceScope must match its project');
  }
  assertExactKeys(
    value.terminationPolicy,
    TERMINATION_POLICY_KEYS,
    'StaffingPlan preview terminationPolicy',
  );
  if (
    value.terminationPolicy.maxProviderCalls !== 0 ||
    !Number.isInteger(value.terminationPolicy.maxTurnsPerAgent) ||
    value.terminationPolicy.maxTurnsPerAgent < 1 ||
    !Number.isInteger(value.terminationPolicy.deadlineMs) ||
    value.terminationPolicy.deadlineMs < 1 ||
    value.terminationPolicy.stopOnRequiredRoleFailure !== true
  ) {
    throw new Error('StaffingPlan preview terminationPolicy is invalid');
  }
  for (const field of [
    'sourceDigest',
    'missionDigest',
    'blueprintDigest',
    'staffingSpecDigest',
  ]) {
    if (!/^[a-f0-9]{64}$/.test(value[field])) {
      throw new Error(`StaffingPlan preview ${field} must be sha256 hex`);
    }
  }
  const sourceRefs = normalizeIdList(value.sourceRefs, 'StaffingPlan preview sourceRefs');
  const blueprintSourceRefs = normalizeIdList(
    value.blueprintSourceRefs,
    'StaffingPlan preview blueprintSourceRefs',
  );
  if (
    sourceRefs.length !== value.sourceRefs.length ||
    sourceRefs.some((ref, index) => ref !== value.sourceRefs[index]) ||
    blueprintSourceRefs.length !== 10 ||
    blueprintSourceRefs.some((ref, index) => ref !== value.blueprintSourceRefs[index]) ||
    !blueprintSourceRefs.includes('company/blueprint.json') ||
    !Array.isArray(value.roleSourceDigests) ||
    value.roleSourceDigests.length !== 9 ||
    !Array.isArray(value.blockedActions) ||
    value.blockedActions.length !== STAFFING_PLAN_BLOCKED_ACTIONS.length ||
    value.blockedActions.some((action, index) => action !== STAFFING_PLAN_BLOCKED_ACTIONS[index])
  ) {
    throw new Error('StaffingPlan preview source or blocked-action evidence is invalid');
  }
  for (const [index, entry] of value.roleSourceDigests.entries()) {
    assertExactKeys(entry, ['ref', 'sha256'], `StaffingPlan preview roleSourceDigests[${index}]`);
    if (!/^[a-f0-9]{64}$/.test(entry.sha256)) {
      throw new Error('StaffingPlan preview role source digest must be sha256 hex');
    }
  }
  normalizeText(value.selectionRationale, 'StaffingPlan preview selectionRationale');
  normalizeIsoTimestamp(value.evaluatedAt, 'StaffingPlan preview evaluatedAt');
  return value;
}

function normalizeAcceptance(value, preview, now) {
  assertExactKeys(value, ACCEPTANCE_KEYS, 'acceptance');
  if (value.decision !== STAFFING_PLAN_ACCEPTANCE_DECISION) {
    throw new Error(`acceptance.decision must be ${STAFFING_PLAN_ACCEPTANCE_DECISION}`);
  }
  if (value.acknowledgement !== STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT) {
    throw new Error(
      `acceptance.acknowledgement must be ${STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT}`,
    );
  }
  const reviewedAt = normalizeIsoTimestamp(value.reviewedAt, 'acceptance.reviewedAt');
  const nowIso = normalizeIsoTimestamp(now || new Date().toISOString(), 'current time');
  if (Date.parse(reviewedAt) < Date.parse(preview.evaluatedAt)) {
    throw new Error('acceptance.reviewedAt must not precede preview evaluatedAt');
  }
  if (Date.parse(reviewedAt) > Date.parse(nowIso) + MAX_CLOCK_SKEW_MS) {
    throw new Error('acceptance.reviewedAt is too far in the future');
  }
  return {
    decision: STAFFING_PLAN_ACCEPTANCE_DECISION,
    acknowledgement: STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT,
    rationale: normalizeText(value.rationale, 'acceptance.rationale'),
    reviewedAt,
  };
}

function computeStaffingPlanRecordDigest(record) {
  if (!isPlainRecord(record)) {
    throw new Error('StaffingPlan record must be an object');
  }
  const { recordDigest: _recordDigest, ...payload } = record;
  return digestCanonical(payload);
}

function createStaffingPlan(input, { now } = {}) {
  assertExactKeys(input, RECORD_INPUT_KEYS, 'StaffingPlan record input');
  const { id, preview, acceptance } = input;
  const normalizedId = normalizeIdentifier(id, 'StaffingPlan id');
  if (!/^staffing-plan-\d{4}$/.test(normalizedId)) {
    throw new Error('StaffingPlan id must use the staffing-plan-0000 sequence format');
  }
  const sourcePreview = assertPreview(preview);
  const normalizedAcceptance = normalizeAcceptance(acceptance, sourcePreview, now);
  const acceptedAt = normalizedAcceptance.reviewedAt;
  const record = {
    id: normalizedId,
    persisted: true,
    status: STAFFING_PLAN_STATUS,
    missionId: sourcePreview.missionId,
    projectId: sourcePreview.projectId,
    projectPack: sourcePreview.projectPack,
    workspaceScope: structuredClone(sourcePreview.workspaceScope),
    mode: sourcePreview.mode,
    selectedAgentIds: [...sourcePreview.selectedAgentIds],
    selectedRoles: [...sourcePreview.selectedRoles],
    selectionRationale: sourcePreview.selectionRationale,
    parallelGroups: structuredClone(sourcePreview.parallelGroups),
    providerMode: sourcePreview.providerMode,
    terminationPolicy: structuredClone(sourcePreview.terminationPolicy),
    sourceRefs: [...sourcePreview.sourceRefs],
    blueprintSourceRefs: [...sourcePreview.blueprintSourceRefs],
    sourceDigest: sourcePreview.sourceDigest,
    missionDigest: sourcePreview.missionDigest,
    blueprintDigest: sourcePreview.blueprintDigest,
    staffingSpecDigest: sourcePreview.staffingSpecDigest,
    sourcePreviewId: sourcePreview.id,
    sourcePreviewDigest: sourcePreview.previewDigest,
    acceptance: normalizedAcceptance,
    blockedActions: [...STAFFING_PLAN_BLOCKED_ACTIONS],
    evaluatedAt: sourcePreview.evaluatedAt,
    acceptedAt,
    createdAt: acceptedAt,
    updatedAt: acceptedAt,
  };
  return deepFreeze({
    ...record,
    recordDigest: computeStaffingPlanRecordDigest(record),
  });
}

module.exports = {
  STAFFING_PLAN_ACCEPTANCE_ACKNOWLEDGEMENT,
  STAFFING_PLAN_ACCEPTANCE_DECISION,
  STAFFING_PLAN_BLOCKED_ACTIONS,
  STAFFING_PLAN_PREVIEW_STATUS,
  STAFFING_PLAN_STATUS,
  computeStaffingPlanMissionDigest,
  computeStaffingPlanPreviewDigest,
  computeStaffingPlanRecordDigest,
  createStaffingPlan,
  normalizeStaffingSpec,
  previewMissionStaffingPlan,
};
