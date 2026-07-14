'use strict';

const fs = require('fs');
const path = require('path');

const BLUEPRINT_KEYS = [
  'schemaVersion',
  'companyId',
  'displayName',
  'operatingPrinciples',
  'defaultStaffingPolicy',
  'defaultTerminationPolicy',
  'agentProfiles',
  'authorityPolicy',
  'sourceRefs',
];
const PROFILE_KEYS = [
  'id',
  'displayName',
  'role',
  'objective',
  'instructionsRef',
  'supportedPacks',
  'skillAllowlist',
  'toolPolicy',
  'workspacePolicy',
  'sessionPolicy',
  'providerPolicy',
  'authority',
  'concurrencyLimit',
];
const TOOL_POLICY_KEYS = ['read', 'write', 'deny'];
const WORKSPACE_POLICY_KEYS = ['mode', 'projectPathRequired'];
const SESSION_POLICY_KEYS = ['scope', 'resumeAllowed'];
const PROVIDER_POLICY_KEYS = ['allowedModes'];
const AUTHORITY_KEYS = [
  'canRecommend',
  'canCreateWorkOrderDraft',
  'canRequestApproval',
  'canMutateSource',
  'canCommit',
  'canPush',
];
const STAFFING_POLICY_KEYS = [
  'defaultMode',
  'requiredCouncilAgentIds',
  'parallelSpecialistsAllowed',
];
const TERMINATION_POLICY_KEYS = [
  'maxTurnsPerAgent',
  'maxProviderCalls',
  'deadlineMs',
  'stopOnRequiredRoleFailure',
];
const COMPANY_AUTHORITY_POLICY_KEYS = [
  'approvalBeforeMutation',
  'reviewBeforeDone',
  'commitRequiresApproval',
  'runtimeAgentPushAllowed',
];
const ROLE_NAMES = [
  'conductor',
  'strategist',
  'architect',
  'decomposer',
  'researcher',
  'builder',
  'reviewer',
  'qa',
  'ops',
];
const REQUIRED_COUNCIL_ROLES = ['conductor', 'strategist', 'architect', 'decomposer'];
const WORKSPACE_MODES = new Set(['shared-readonly', 'isolated', 'approved-project']);
const SESSION_SCOPES = new Set(['mission-role', 'work-order']);
const TOOL_ACTIONS = new Set([
  'project.read',
  'source.read',
  'artifact.read',
  'evidence.read',
  'runtime.read',
  'source.write',
  'memory.write',
  'provider.call',
  'commit',
  'push',
  'release',
]);
const REQUIRED_DENIED_ACTIONS = [
  'source.write',
  'memory.write',
  'provider.call',
  'commit',
  'push',
  'release',
];
const ROLE_HEADINGS = [
  '## Objective',
  '## Inputs',
  '## Outputs',
  '## Decision Rules',
  '## Tool And Workspace Boundary',
  '## Stop And Escalation',
  '## Non-Authority',
];

class CompanyBlueprintError extends Error {
  constructor(code, sourceRef = null) {
    super(code);
    this.name = 'CompanyBlueprintError';
    this.code = code;
    this.sourceRef = sourceRef;
  }
}

function fail(code, sourceRef = null) {
  throw new CompanyBlueprintError(code, sourceRef);
}

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertRecord(value, code, sourceRef) {
  if (!isPlainRecord(value)) {
    fail(code, sourceRef);
  }
}

function assertExactKeys(value, allowedKeys, code, sourceRef) {
  assertRecord(value, code, sourceRef);
  const allowed = new Set(allowedKeys);

  if (Object.keys(value).some((key) => !allowed.has(key))) {
    fail(code, sourceRef);
  }

  if (allowedKeys.some((key) => !Object.hasOwn(value, key))) {
    fail(code, sourceRef);
  }
}

function requiredString(value, code, sourceRef) {
  if (typeof value !== 'string' || !value.trim()) {
    fail(code, sourceRef);
  }

  return value.trim();
}

function requiredBoolean(value, code, sourceRef) {
  if (typeof value !== 'boolean') {
    fail(code, sourceRef);
  }

  return value;
}

function requiredInteger(value, code, sourceRef, { min = 0 } = {}) {
  if (!Number.isInteger(value) || value < min) {
    fail(code, sourceRef);
  }

  return value;
}

function stringArray(value, code, sourceRef, allowedValues = null) {
  if (!Array.isArray(value)) {
    fail(code, sourceRef);
  }

  const normalized = value.map((entry) => requiredString(entry, code, sourceRef));

  if (new Set(normalized).size !== normalized.length) {
    fail(code, sourceRef);
  }

  if (allowedValues && normalized.some((entry) => !allowedValues.has(entry))) {
    fail(code, sourceRef);
  }

  return normalized;
}

function isPathInside(parentPath, candidatePath) {
  const relative = path.relative(parentPath, candidatePath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function repoRelative(repoRoot, targetPath) {
  const relative = path.relative(repoRoot, targetPath).split(path.sep).join('/');
  return relative && !relative.startsWith('..') ? relative : null;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function readRoleSource({ repoRoot, realRepoRoot, profile }) {
  const expectedRef = `company/roles/${profile.role}.md`;

  if (profile.instructionsRef !== expectedRef || path.isAbsolute(profile.instructionsRef)) {
    fail('BLUEPRINT_UNSAFE_INSTRUCTIONS_REF', profile.instructionsRef);
  }

  const rolePath = path.resolve(repoRoot, profile.instructionsRef);
  const roleRoot = path.join(repoRoot, 'company', 'roles');

  if (!isPathInside(roleRoot, rolePath) || !fs.existsSync(rolePath)) {
    fail('BLUEPRINT_ROLE_SOURCE_NOT_FOUND', profile.instructionsRef);
  }

  const roleRootStat = fs.lstatSync(roleRoot);

  if (!roleRootStat.isDirectory() || roleRootStat.isSymbolicLink()) {
    fail('BLUEPRINT_UNSAFE_INSTRUCTIONS_REF', profile.instructionsRef);
  }

  const roleStat = fs.lstatSync(rolePath);

  if (!roleStat.isFile() || roleStat.isSymbolicLink()) {
    fail('BLUEPRINT_UNSAFE_INSTRUCTIONS_REF', profile.instructionsRef);
  }

  const realRolePath = fs.realpathSync(rolePath);
  const realRoleRoot = fs.realpathSync(roleRoot);

  if (
    !isPathInside(realRepoRoot, realRoleRoot) ||
    !isPathInside(realRoleRoot, realRolePath)
  ) {
    fail('BLUEPRINT_UNSAFE_INSTRUCTIONS_REF', profile.instructionsRef);
  }

  const source = fs.readFileSync(realRolePath, 'utf8');
  const requiredHeadings = [`# Role: ${profile.displayName}`, ...ROLE_HEADINGS];

  for (const heading of requiredHeadings) {
    if (!new RegExp(`^${escapeRegExp(heading)}$`, 'm').test(source)) {
      fail('BLUEPRINT_ROLE_SOURCE_INVALID', profile.instructionsRef);
    }
  }
}

function normalizeProfile(profile, index, context) {
  const sourceRef = `company/blueprint.json#agentProfiles[${index}]`;
  assertExactKeys(profile, PROFILE_KEYS, 'BLUEPRINT_PROFILE_FIELDS_INVALID', sourceRef);

  const normalized = {
    id: requiredString(profile.id, 'BLUEPRINT_PROFILE_ID_INVALID', sourceRef),
    displayName: requiredString(
      profile.displayName,
      'BLUEPRINT_PROFILE_DISPLAY_NAME_INVALID',
      sourceRef,
    ),
    role: requiredString(profile.role, 'BLUEPRINT_PROFILE_ROLE_INVALID', sourceRef),
    objective: requiredString(profile.objective, 'BLUEPRINT_PROFILE_OBJECTIVE_INVALID', sourceRef),
    instructionsRef: requiredString(
      profile.instructionsRef,
      'BLUEPRINT_PROFILE_INSTRUCTIONS_REF_INVALID',
      sourceRef,
    ),
    supportedPacks: stringArray(
      profile.supportedPacks,
      'BLUEPRINT_PROFILE_PACK_INVALID',
      sourceRef,
      new Set(['development']),
    ),
    skillAllowlist: stringArray(
      profile.skillAllowlist,
      'BLUEPRINT_PROFILE_SKILL_INVALID',
      sourceRef,
    ),
    concurrencyLimit: requiredInteger(
      profile.concurrencyLimit,
      'BLUEPRINT_PROFILE_CONCURRENCY_INVALID',
      sourceRef,
      { min: 1 },
    ),
  };

  if (!ROLE_NAMES.includes(normalized.role) || normalized.concurrencyLimit !== 1) {
    fail('BLUEPRINT_PROFILE_ROLE_POLICY_INVALID', sourceRef);
  }

  if (normalized.skillAllowlist.length > 0) {
    fail('BLUEPRINT_PROFILE_SKILL_AUTHORITY_BLOCKED', sourceRef);
  }

  assertExactKeys(profile.toolPolicy, TOOL_POLICY_KEYS, 'BLUEPRINT_TOOL_POLICY_INVALID', sourceRef);
  normalized.toolPolicy = {
    read: stringArray(
      profile.toolPolicy.read,
      'BLUEPRINT_TOOL_ACTION_INVALID',
      sourceRef,
      TOOL_ACTIONS,
    ),
    write: stringArray(
      profile.toolPolicy.write,
      'BLUEPRINT_TOOL_ACTION_INVALID',
      sourceRef,
      TOOL_ACTIONS,
    ),
    deny: stringArray(
      profile.toolPolicy.deny,
      'BLUEPRINT_TOOL_ACTION_INVALID',
      sourceRef,
      TOOL_ACTIONS,
    ),
  };

  if (
    normalized.toolPolicy.write.length > 0 ||
    REQUIRED_DENIED_ACTIONS.some((action) => !normalized.toolPolicy.deny.includes(action))
  ) {
    fail('BLUEPRINT_TOOL_AUTHORITY_BLOCKED', sourceRef);
  }

  assertExactKeys(
    profile.workspacePolicy,
    WORKSPACE_POLICY_KEYS,
    'BLUEPRINT_WORKSPACE_POLICY_INVALID',
    sourceRef,
  );
  normalized.workspacePolicy = {
    mode: requiredString(
      profile.workspacePolicy.mode,
      'BLUEPRINT_WORKSPACE_POLICY_INVALID',
      sourceRef,
    ),
    projectPathRequired: requiredBoolean(
      profile.workspacePolicy.projectPathRequired,
      'BLUEPRINT_WORKSPACE_POLICY_INVALID',
      sourceRef,
    ),
  };

  if (
    !WORKSPACE_MODES.has(normalized.workspacePolicy.mode) ||
    !normalized.workspacePolicy.projectPathRequired
  ) {
    fail('BLUEPRINT_WORKSPACE_POLICY_INVALID', sourceRef);
  }

  assertExactKeys(
    profile.sessionPolicy,
    SESSION_POLICY_KEYS,
    'BLUEPRINT_SESSION_POLICY_INVALID',
    sourceRef,
  );
  normalized.sessionPolicy = {
    scope: requiredString(
      profile.sessionPolicy.scope,
      'BLUEPRINT_SESSION_POLICY_INVALID',
      sourceRef,
    ),
    resumeAllowed: requiredBoolean(
      profile.sessionPolicy.resumeAllowed,
      'BLUEPRINT_SESSION_POLICY_INVALID',
      sourceRef,
    ),
  };

  if (!SESSION_SCOPES.has(normalized.sessionPolicy.scope) || normalized.sessionPolicy.resumeAllowed) {
    fail('BLUEPRINT_SESSION_POLICY_INVALID', sourceRef);
  }

  assertExactKeys(
    profile.providerPolicy,
    PROVIDER_POLICY_KEYS,
    'BLUEPRINT_PROVIDER_POLICY_INVALID',
    sourceRef,
  );
  normalized.providerPolicy = {
    allowedModes: stringArray(
      profile.providerPolicy.allowedModes,
      'BLUEPRINT_PROVIDER_MODE_INVALID',
      sourceRef,
      new Set(['local-stub']),
    ),
  };

  if (
    normalized.providerPolicy.allowedModes.length !== 1 ||
    normalized.providerPolicy.allowedModes[0] !== 'local-stub'
  ) {
    fail('BLUEPRINT_PROVIDER_MODE_INVALID', sourceRef);
  }

  assertExactKeys(profile.authority, AUTHORITY_KEYS, 'BLUEPRINT_AUTHORITY_INVALID', sourceRef);
  normalized.authority = Object.fromEntries(
    AUTHORITY_KEYS.map((key) => [
      key,
      requiredBoolean(profile.authority[key], 'BLUEPRINT_AUTHORITY_INVALID', sourceRef),
    ]),
  );

  if (
    normalized.authority.canMutateSource ||
    normalized.authority.canCommit ||
    normalized.authority.canPush
  ) {
    fail('BLUEPRINT_FORBIDDEN_AUTHORITY', sourceRef);
  }

  if (
    normalized.authority.canCreateWorkOrderDraft &&
    !['conductor', 'decomposer'].includes(normalized.role)
  ) {
    fail('BLUEPRINT_FORBIDDEN_AUTHORITY', sourceRef);
  }

  if (
    normalized.authority.canRequestApproval &&
    !['conductor', 'decomposer', 'builder'].includes(normalized.role)
  ) {
    fail('BLUEPRINT_FORBIDDEN_AUTHORITY', sourceRef);
  }

  readRoleSource({ ...context, profile: normalized });
  return normalized;
}

function normalizeCompanyBlueprint(rawBlueprint, context) {
  const sourceRef = 'company/blueprint.json';
  assertExactKeys(rawBlueprint, BLUEPRINT_KEYS, 'BLUEPRINT_FIELDS_INVALID', sourceRef);

  if (rawBlueprint.schemaVersion !== 1) {
    fail('BLUEPRINT_SCHEMA_VERSION_UNSUPPORTED', sourceRef);
  }

  const normalized = {
    schemaVersion: 1,
    companyId: requiredString(rawBlueprint.companyId, 'BLUEPRINT_COMPANY_ID_INVALID', sourceRef),
    displayName: requiredString(
      rawBlueprint.displayName,
      'BLUEPRINT_DISPLAY_NAME_INVALID',
      sourceRef,
    ),
    operatingPrinciples: stringArray(
      rawBlueprint.operatingPrinciples,
      'BLUEPRINT_OPERATING_PRINCIPLES_INVALID',
      sourceRef,
    ),
  };

  if (normalized.operatingPrinciples.length === 0) {
    fail('BLUEPRINT_OPERATING_PRINCIPLES_INVALID', sourceRef);
  }

  assertExactKeys(
    rawBlueprint.defaultStaffingPolicy,
    STAFFING_POLICY_KEYS,
    'BLUEPRINT_STAFFING_POLICY_INVALID',
    sourceRef,
  );
  normalized.defaultStaffingPolicy = {
    defaultMode: requiredString(
      rawBlueprint.defaultStaffingPolicy.defaultMode,
      'BLUEPRINT_STAFFING_POLICY_INVALID',
      sourceRef,
    ),
    requiredCouncilAgentIds: stringArray(
      rawBlueprint.defaultStaffingPolicy.requiredCouncilAgentIds,
      'BLUEPRINT_STAFFING_POLICY_INVALID',
      sourceRef,
    ),
    parallelSpecialistsAllowed: requiredBoolean(
      rawBlueprint.defaultStaffingPolicy.parallelSpecialistsAllowed,
      'BLUEPRINT_STAFFING_POLICY_INVALID',
      sourceRef,
    ),
  };

  if (
    normalized.defaultStaffingPolicy.defaultMode !== 'council' ||
    normalized.defaultStaffingPolicy.parallelSpecialistsAllowed
  ) {
    fail('BLUEPRINT_STAFFING_POLICY_INVALID', sourceRef);
  }

  assertExactKeys(
    rawBlueprint.defaultTerminationPolicy,
    TERMINATION_POLICY_KEYS,
    'BLUEPRINT_TERMINATION_POLICY_INVALID',
    sourceRef,
  );
  normalized.defaultTerminationPolicy = {
    maxTurnsPerAgent: requiredInteger(
      rawBlueprint.defaultTerminationPolicy.maxTurnsPerAgent,
      'BLUEPRINT_TERMINATION_POLICY_INVALID',
      sourceRef,
      { min: 1 },
    ),
    maxProviderCalls: requiredInteger(
      rawBlueprint.defaultTerminationPolicy.maxProviderCalls,
      'BLUEPRINT_TERMINATION_POLICY_INVALID',
      sourceRef,
    ),
    deadlineMs: requiredInteger(
      rawBlueprint.defaultTerminationPolicy.deadlineMs,
      'BLUEPRINT_TERMINATION_POLICY_INVALID',
      sourceRef,
      { min: 1 },
    ),
    stopOnRequiredRoleFailure: requiredBoolean(
      rawBlueprint.defaultTerminationPolicy.stopOnRequiredRoleFailure,
      'BLUEPRINT_TERMINATION_POLICY_INVALID',
      sourceRef,
    ),
  };

  if (
    normalized.defaultTerminationPolicy.maxProviderCalls !== 0 ||
    !normalized.defaultTerminationPolicy.stopOnRequiredRoleFailure
  ) {
    fail('BLUEPRINT_TERMINATION_POLICY_INVALID', sourceRef);
  }

  if (!Array.isArray(rawBlueprint.agentProfiles)) {
    fail('BLUEPRINT_PROFILES_INVALID', sourceRef);
  }

  normalized.agentProfiles = rawBlueprint.agentProfiles.map((profile, index) =>
    normalizeProfile(profile, index, context),
  );

  const ids = normalized.agentProfiles.map((profile) => profile.id);
  const roles = normalized.agentProfiles.map((profile) => profile.role);

  if (
    normalized.agentProfiles.length !== ROLE_NAMES.length ||
    new Set(ids).size !== ids.length ||
    new Set(roles).size !== roles.length ||
    ROLE_NAMES.some((role) => !roles.includes(role))
  ) {
    fail('BLUEPRINT_PROFILE_SET_INVALID', sourceRef);
  }

  const requiredCouncilIds = REQUIRED_COUNCIL_ROLES.map(
    (role) => normalized.agentProfiles.find((profile) => profile.role === role).id,
  );

  if (
    requiredCouncilIds.length !== normalized.defaultStaffingPolicy.requiredCouncilAgentIds.length ||
    requiredCouncilIds.some(
      (id) => !normalized.defaultStaffingPolicy.requiredCouncilAgentIds.includes(id),
    )
  ) {
    fail('BLUEPRINT_STAFFING_POLICY_INVALID', sourceRef);
  }

  assertExactKeys(
    rawBlueprint.authorityPolicy,
    COMPANY_AUTHORITY_POLICY_KEYS,
    'BLUEPRINT_COMPANY_AUTHORITY_POLICY_INVALID',
    sourceRef,
  );
  normalized.authorityPolicy = Object.fromEntries(
    COMPANY_AUTHORITY_POLICY_KEYS.map((key) => [
      key,
      requiredBoolean(
        rawBlueprint.authorityPolicy[key],
        'BLUEPRINT_COMPANY_AUTHORITY_POLICY_INVALID',
        sourceRef,
      ),
    ]),
  );

  if (
    !normalized.authorityPolicy.approvalBeforeMutation ||
    !normalized.authorityPolicy.reviewBeforeDone ||
    !normalized.authorityPolicy.commitRequiresApproval ||
    normalized.authorityPolicy.runtimeAgentPushAllowed
  ) {
    fail('BLUEPRINT_COMPANY_AUTHORITY_POLICY_INVALID', sourceRef);
  }

  normalized.sourceRefs = stringArray(
    rawBlueprint.sourceRefs,
    'BLUEPRINT_SOURCE_REF_INVALID',
    sourceRef,
  );

  for (const policyRef of normalized.sourceRefs) {
    if (path.isAbsolute(policyRef)) {
      fail('BLUEPRINT_SOURCE_REF_INVALID', policyRef);
    }

    const policyPath = path.resolve(context.repoRoot, policyRef);

    if (!isPathInside(context.repoRoot, policyPath) || !fs.existsSync(policyPath)) {
      fail('BLUEPRINT_SOURCE_REF_INVALID', policyRef);
    }

    const policyStat = fs.lstatSync(policyPath);
    const realPolicyPath = fs.realpathSync(policyPath);

    if (
      !policyStat.isFile() ||
      policyStat.isSymbolicLink() ||
      !isPathInside(context.realRepoRoot, realPolicyPath)
    ) {
      fail('BLUEPRINT_SOURCE_REF_INVALID', policyRef);
    }
  }

  return deepFreeze(normalized);
}

function loadCompanyBlueprint(options = {}) {
  const blueprintPath = options.blueprintPath && path.resolve(options.blueprintPath);

  if (!blueprintPath) {
    fail('BLUEPRINT_PATH_REQUIRED');
  }

  const repoRoot = path.resolve(options.repoRoot || path.dirname(path.dirname(blueprintPath)));
  const sourceRef = repoRelative(repoRoot, blueprintPath) || 'company/blueprint.json';
  const expectedBlueprintPath = path.join(repoRoot, 'company', 'blueprint.json');

  if (blueprintPath !== expectedBlueprintPath) {
    fail('BLUEPRINT_UNSAFE_PATH', sourceRef);
  }

  if (!fs.existsSync(blueprintPath)) {
    fail('BLUEPRINT_NOT_FOUND', sourceRef);
  }

  const blueprintStat = fs.lstatSync(blueprintPath);
  const companyDirectoryStat = fs.lstatSync(path.dirname(blueprintPath));

  if (
    !blueprintStat.isFile() ||
    blueprintStat.isSymbolicLink() ||
    !companyDirectoryStat.isDirectory() ||
    companyDirectoryStat.isSymbolicLink()
  ) {
    fail('BLUEPRINT_UNSAFE_PATH', sourceRef);
  }

  const realRepoRoot = fs.realpathSync(repoRoot);
  const realBlueprintPath = fs.realpathSync(blueprintPath);

  if (!isPathInside(realRepoRoot, realBlueprintPath)) {
    fail('BLUEPRINT_UNSAFE_PATH', sourceRef);
  }

  let rawBlueprint;

  try {
    rawBlueprint = JSON.parse(fs.readFileSync(realBlueprintPath, 'utf8'));
  } catch {
    fail('BLUEPRINT_JSON_INVALID', sourceRef);
  }

  return normalizeCompanyBlueprint(rawBlueprint, { repoRoot, realRepoRoot });
}

function readCompanyBlueprintStatus(options = {}) {
  if (!options.blueprintPath) {
    return deepFreeze({
      status: 'not-configured',
      blueprint: null,
      sourceRefs: [],
      errors: [],
    });
  }

  try {
    const blueprint = loadCompanyBlueprint(options);
    return deepFreeze({
      status: 'ready',
      blueprint,
      sourceRefs: [
        'company/blueprint.json',
        ...blueprint.agentProfiles.map((profile) => profile.instructionsRef),
      ],
      errors: [],
    });
  } catch (error) {
    const blueprintError =
      error instanceof CompanyBlueprintError
        ? error
        : new CompanyBlueprintError('BLUEPRINT_LOAD_FAILED');
    return deepFreeze({
      status: 'invalid',
      blueprint: null,
      sourceRefs: blueprintError.sourceRef ? [blueprintError.sourceRef] : [],
      errors: [
        {
          code: blueprintError.code,
          sourceRef: blueprintError.sourceRef,
        },
      ],
    });
  }
}

module.exports = {
  CompanyBlueprintError,
  loadCompanyBlueprint,
  readCompanyBlueprintStatus,
};
