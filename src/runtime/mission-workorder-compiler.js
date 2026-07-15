'use strict';

const crypto = require('crypto');
const path = require('path');

const {
  buildAgendaDigest,
  buildCouncilAgenda,
  freezeJson,
  isRealCouncilMode,
} = require('./council-sessions');

const COMPILE_SPEC_KEYS = [
  'expectedArtifacts',
  'stopConditions',
  'targetPathAllowlist',
  'verificationCommands',
];
const REQUIRED_WORK_ORDER_ROLES = ['builder', 'reviewer', 'qa'];
const MAX_LIST_ENTRIES = 32;
const MAX_TEXT_LENGTH = 1024;

const CLOSED_AUTHORITY = Object.freeze({
  approvalAllowed: false,
  commitAllowed: false,
  executeAllowed: false,
  mutationAllowed: false,
  persistenceAllowed: false,
  providerCallAllowed: false,
  pushAllowed: false,
  releaseAllowed: false,
});

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }

  const normalized = value.trim();
  if (normalized.length > MAX_TEXT_LENGTH) {
    throw new Error(`${label} is too long`);
  }

  return normalized;
}

function assertExactKeys(value, keys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} fields are invalid`);
  }
}

function normalizeStringList(value, label) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${label} must be a non-empty array`);
  }
  if (value.length > MAX_LIST_ENTRIES) {
    throw new Error(`${label} has too many entries`);
  }

  const normalized = value.map((entry, index) => requiredString(entry, `${label}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }

  return normalized;
}

function normalizeTargetPath(value, label) {
  const normalized = requiredString(value, label);

  if (
    path.posix.isAbsolute(normalized) ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.includes('\\') ||
    normalized.includes('\0') ||
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

function normalizeCompileSpec(value) {
  assertExactKeys(value, COMPILE_SPEC_KEYS, 'compileSpec');

  const normalized = {
    targetPathAllowlist: normalizeStringList(
      value.targetPathAllowlist,
      'compileSpec.targetPathAllowlist',
    ).map((entry, index) =>
      normalizeTargetPath(entry, `compileSpec.targetPathAllowlist[${index}]`)),
    expectedArtifacts: normalizeStringList(
      value.expectedArtifacts,
      'compileSpec.expectedArtifacts',
    ),
    verificationCommands: normalizeStringList(
      value.verificationCommands,
      'compileSpec.verificationCommands',
    ),
    stopConditions: normalizeStringList(value.stopConditions, 'compileSpec.stopConditions'),
  };

  return freezeJson(normalized);
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(',')}]`;
  }

  if (isPlainRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }

  return JSON.stringify(value);
}

function digestJson(value) {
  return crypto.createHash('sha256').update(stableJson(value)).digest('hex');
}

function getCurrentAttempt(councilSession) {
  if (!Array.isArray(councilSession?.attempts) || councilSession.attempts.length === 0) {
    throw new Error('Council session has no attempt evidence');
  }

  const attempt =
    councilSession.attempts.find((entry) => entry.id === councilSession.currentAttemptId) ||
    councilSession.attempts.at(-1);

  if (!attempt?.synthesis) {
    throw new Error('Council session current attempt has no synthesis');
  }

  return attempt;
}

function resolveWorkOrderProfiles(companyBlueprint, projectPack) {
  if (!isPlainRecord(companyBlueprint) || !Array.isArray(companyBlueprint.agentProfiles)) {
    throw new Error('CompanyBlueprint is not ready for WorkOrder compilation');
  }
  if (projectPack !== 'development') {
    throw new Error(`WorkOrder preview does not support pack: ${projectPack}`);
  }

  const profiles = {};
  for (const role of ['conductor', ...REQUIRED_WORK_ORDER_ROLES]) {
    const profile = companyBlueprint.agentProfiles.find((entry) => entry.role === role) || null;
    if (!profile) {
      throw new Error(`CompanyBlueprint is missing WorkOrder role: ${role}`);
    }
    if (!Array.isArray(profile.supportedPacks) || !profile.supportedPacks.includes(projectPack)) {
      throw new Error(`WorkOrder role ${role} does not support pack: ${projectPack}`);
    }
    if (
      profile.authority?.canMutateSource !== false ||
      profile.authority?.canCommit !== false ||
      profile.authority?.canPush !== false
    ) {
      throw new Error(`WorkOrder role ${role} has forbidden authority`);
    }
    profiles[role] = profile;
  }

  return freezeJson(profiles);
}

function buildCompilerContext({
  mission,
  project,
  councilSession,
  companyBlueprint,
  compileSpec,
  stage,
  alignmentAction = null,
}) {
  if (!isPlainRecord(mission) || !isPlainRecord(project) || !isPlainRecord(councilSession)) {
    throw new Error('Mission, project, and Council session records are required');
  }
  if (!isRealCouncilMode(councilSession.mode)) {
    throw new Error(`Unsupported Council mode: ${councilSession.mode || 'missing'}`);
  }
  if (mission.projectId !== project.id || mission.councilSessionId !== councilSession.id) {
    throw new Error('Mission, project, and Council session refs do not match');
  }
  if (councilSession.missionId !== mission.id) {
    throw new Error('Council session mission ref does not match');
  }

  const currentSourceDigest = buildAgendaDigest(buildCouncilAgenda(mission, project));
  if (currentSourceDigest !== councilSession.sourceDigest) {
    throw new Error('Council session has a stale source digest');
  }

  if (stage === 'preflight') {
    if (
      alignmentAction !== 'approve' ||
      councilSession.phase !== 'awaiting-alignment' ||
      councilSession.status !== 'pending-alignment' ||
      councilSession.alignment?.status !== 'pending'
    ) {
      throw new Error('Council session is not awaiting explicit approval');
    }
  } else if (stage === 'final') {
    if (
      councilSession.phase !== 'terminal' ||
      councilSession.status !== 'approved' ||
      councilSession.alignment?.status !== 'approved' ||
      councilSession.alignment?.action !== 'approve'
    ) {
      throw new Error('Council session must be operator-approved before final compilation');
    }
  } else {
    throw new Error(`Unsupported compilation stage: ${stage}`);
  }

  const attempt = getCurrentAttempt(councilSession);
  if (attempt.status !== 'awaiting-alignment') {
    throw new Error('Council attempt is not ready for alignment');
  }
  if (attempt.conflictSummary?.approvalReady !== true) {
    throw new Error('Council attempt is not approval-ready');
  }

  const synthesis = attempt.synthesis;
  if (synthesis.humanDecisionRequired !== true) {
    throw new Error('Council synthesis must require a human decision');
  }
  if (!Array.isArray(synthesis.unresolvedQuestions)) {
    throw new Error('Council synthesis unresolvedQuestions must be an array');
  }
  if (synthesis.unresolvedQuestions.length > 0) {
    throw new Error('Council synthesis has unresolved questions');
  }

  const acceptanceCriteria = normalizeStringList(
    synthesis.proposedAcceptanceCriteria,
    'synthesis.proposedAcceptanceCriteria',
  );
  const normalizedCompileSpec = normalizeCompileSpec(compileSpec);
  const profiles = resolveWorkOrderProfiles(companyBlueprint, project.pack);
  const source = {
    mission: {
      id: requiredString(mission.id, 'mission.id'),
      projectId: requiredString(mission.projectId, 'mission.projectId'),
      title: requiredString(mission.title, 'mission.title'),
      goal: requiredString(mission.goal, 'mission.goal'),
      constraints: String(mission.constraints || '').trim(),
      deliverableType: String(mission.deliverableType || '').trim() || null,
    },
    project: {
      id: requiredString(project.id, 'project.id'),
      pack: requiredString(project.pack, 'project.pack'),
    },
    council: {
      id: requiredString(councilSession.id, 'councilSession.id'),
      mode: councilSession.mode,
      sourceDigest: councilSession.sourceDigest,
      attemptId: requiredString(attempt.id, 'attempt.id'),
      synthesis: {
        id: requiredString(synthesis.id, 'synthesis.id'),
        missionInterpretation: requiredString(
          synthesis.missionInterpretation,
          'synthesis.missionInterpretation',
        ),
        adoptedRecommendation: requiredString(
          synthesis.adoptedRecommendation,
          'synthesis.adoptedRecommendation',
        ),
        adoptedPositionRefs: normalizeStringList(
          synthesis.adoptedPositionRefs,
          'synthesis.adoptedPositionRefs',
        ),
        dissentRefs: Array.isArray(synthesis.dissentRefs)
          ? synthesis.dissentRefs.map((entry, index) =>
              requiredString(entry, `synthesis.dissentRefs[${index}]`))
          : [],
        proposedExecutionBoundary: requiredString(
          synthesis.proposedExecutionBoundary,
          'synthesis.proposedExecutionBoundary',
        ),
        proposedAcceptanceCriteria: acceptanceCriteria,
      },
    },
    compileSpec: normalizedCompileSpec,
    agents: Object.fromEntries(
      ['conductor', ...REQUIRED_WORK_ORDER_ROLES].map((role) => [role, profiles[role].id]),
    ),
  };

  return freezeJson({ source, profiles, compileSpec: normalizedCompileSpec, synthesis, attempt });
}

function hasDependencyPath(workOrdersById, fromId, targetId, visiting = new Set()) {
  if (fromId === targetId) return true;
  if (visiting.has(fromId)) return false;
  visiting.add(fromId);

  const workOrder = workOrdersById.get(fromId);
  return (workOrder?.dependencies || []).some((dependencyId) =>
    hasDependencyPath(workOrdersById, dependencyId, targetId, visiting));
}

function validateWorkOrderGraph(workOrders) {
  if (!Array.isArray(workOrders) || workOrders.length === 0) {
    throw new Error('WorkOrder graph must be a non-empty array');
  }

  const ids = workOrders.map((entry) => requiredString(entry?.id, 'workOrder.id'));
  if (new Set(ids).size !== ids.length) {
    throw new Error('WorkOrder graph contains duplicate ids');
  }

  const byId = new Map(workOrders.map((entry) => [entry.id, entry]));
  for (const workOrder of workOrders) {
    if (!Array.isArray(workOrder.dependencies)) {
      throw new Error(`WorkOrder ${workOrder.id} dependencies must be an array`);
    }
    for (const dependencyId of workOrder.dependencies) {
      if (dependencyId === workOrder.id) {
        throw new Error(`WorkOrder ${workOrder.id} cannot depend on itself`);
      }
      if (!byId.has(dependencyId)) {
        throw new Error(`WorkOrder ${workOrder.id} has a missing dependency: ${dependencyId}`);
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) throw new Error('WorkOrder graph contains a dependency cycle');
    if (visited.has(id)) return;
    visiting.add(id);
    for (const dependencyId of byId.get(id).dependencies) visit(dependencyId);
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of ids) visit(id);

  for (let leftIndex = 0; leftIndex < workOrders.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < workOrders.length; rightIndex += 1) {
      const left = workOrders[leftIndex];
      const right = workOrders[rightIndex];
      const leftTargets = new Set(left.targetPathAllowlist || []);
      const overlaps = (right.targetPathAllowlist || []).some((target) => leftTargets.has(target));
      if (
        overlaps &&
        !hasDependencyPath(byId, left.id, right.id) &&
        !hasDependencyPath(byId, right.id, left.id)
      ) {
        throw new Error(`WorkOrder target collision is not serialized: ${left.id}, ${right.id}`);
      }
    }
  }

  return freezeJson({
    dependencyCycleFree: true,
    mutableTargetCollisionFree: true,
  });
}

function buildWorkOrders(context, executionPlanId) {
  const { source, profiles, compileSpec, synthesis, attempt } = context;
  const prefix = executionPlanId;
  const builderId = `${prefix}-builder-preflight`;
  const reviewerId = `${prefix}-reviewer`;
  const qaId = `${prefix}-qa`;
  const shared = {
    executionPlanId,
    inputRefs: [
      `mission:${source.mission.id}`,
      `council-session:${source.council.id}`,
      `council-attempt:${attempt.id}`,
      `council-synthesis:${synthesis.id}`,
      ...source.council.synthesis.adoptedPositionRefs,
      ...source.council.synthesis.dissentRefs,
    ],
    targetPathAllowlist: [...compileSpec.targetPathAllowlist],
    expectedArtifacts: [...compileSpec.expectedArtifacts],
    acceptanceCriteria: [...source.council.synthesis.proposedAcceptanceCriteria],
    verificationCommands: [...compileSpec.verificationCommands],
    authority: { ...CLOSED_AUTHORITY, mode: 'inert-preview' },
    stopConditions: [...compileSpec.stopConditions],
    status: 'draft',
    attemptRefs: [],
  };

  return [
    {
      ...shared,
      id: builderId,
      assignedAgentId: profiles.builder.id,
      title: 'Builder preflight',
      intent: source.council.synthesis.proposedExecutionBoundary,
      dependencies: [],
    },
    {
      ...shared,
      id: reviewerId,
      assignedAgentId: profiles.reviewer.id,
      title: 'Independent review',
      intent: 'Review the inert Builder preflight evidence against the accepted decisions.',
      dependencies: [builderId],
    },
    {
      ...shared,
      id: qaId,
      assignedAgentId: profiles.qa.id,
      title: 'QA verification',
      intent: 'Evaluate the supplied verification evidence without executing commands.',
      dependencies: [reviewerId],
    },
  ];
}

function buildHandoffPackets(context, executionPlanId, workOrders, sourceDigest) {
  const { source, profiles, compileSpec } = context;
  const constraints = source.mission.constraints ? [source.mission.constraints] : [];
  const evidenceRefs = workOrders[0].inputRefs;
  const acceptedDecisions = [
    source.council.synthesis.adoptedRecommendation,
    source.council.synthesis.proposedExecutionBoundary,
  ];
  const shared = {
    missionId: source.mission.id,
    acceptedDecisions,
    constraints,
    evidenceRefs,
    artifactRefs: [...compileSpec.expectedArtifacts],
    openQuestions: [],
    acceptanceCriteria: [...source.council.synthesis.proposedAcceptanceCriteria],
    authorityBoundary: { ...CLOSED_AUTHORITY, mode: 'inert-preview' },
    stopConditions: [...compileSpec.stopConditions],
    sourceDigest,
  };

  return [
    {
      ...shared,
      id: `${executionPlanId}-handoff-conductor-builder`,
      fromAgentId: profiles.conductor.id,
      toAgentId: profiles.builder.id,
      objective: source.mission.goal,
      expectedOutput: 'One bounded Builder preflight evidence package.',
    },
    {
      ...shared,
      id: `${executionPlanId}-handoff-builder-reviewer`,
      fromAgentId: profiles.builder.id,
      toAgentId: profiles.reviewer.id,
      objective: 'Review Builder preflight evidence against the accepted Council decision.',
      expectedOutput: 'One independent review verdict with evidence refs.',
    },
    {
      ...shared,
      id: `${executionPlanId}-handoff-reviewer-qa`,
      fromAgentId: profiles.reviewer.id,
      toAgentId: profiles.qa.id,
      objective: 'Evaluate the declared acceptance and verification evidence.',
      expectedOutput: 'One QA evidence summary without command execution.',
    },
  ];
}

function preflightMissionWorkOrderCandidate(input) {
  const context = buildCompilerContext({ ...input, stage: 'preflight' });
  const sourceDigest = digestJson(context.source);
  const executionPlanId = `execution-plan-${sourceDigest.slice(0, 16)}`;
  const workOrders = buildWorkOrders(context, executionPlanId);
  const graphValidation = validateWorkOrderGraph(workOrders);

  return freezeJson({
    ok: true,
    sourceDigest,
    executionPlanId,
    workOrderIds: workOrders.map((entry) => entry.id),
    validation: {
      ...graphValidation,
      authorityClosed: workOrders.every((entry) => entry.authority.executeAllowed === false),
    },
  });
}

function compileMissionWorkOrderPreview(input) {
  const context = buildCompilerContext({ ...input, stage: 'final' });
  const sourceDigest = digestJson(context.source);
  const previewId = `mission-workorder-preview-${sourceDigest.slice(0, 16)}`;
  const executionPlanId = `execution-plan-${sourceDigest.slice(0, 16)}`;
  const workOrders = buildWorkOrders(context, executionPlanId);
  const graphValidation = validateWorkOrderGraph(workOrders);
  const handoffPackets = buildHandoffPackets(
    context,
    executionPlanId,
    workOrders,
    sourceDigest,
  );
  const executionPlan = {
    id: executionPlanId,
    missionId: context.source.mission.id,
    councilSessionId: context.source.council.id,
    alignmentDecisionRef: `${context.source.council.id}:alignment:approved`,
    objective: context.source.mission.goal,
    nonGoals: [
      'Persist ExecutionPlan or WorkOrder records.',
      'Approve, queue, schedule, or execute WorkOrders.',
      'Call providers or persist memory during compilation.',
      'Mutate source, commit, push, or release.',
    ],
    workOrderIds: workOrders.map((entry) => entry.id),
    dependencyEdges: workOrders.flatMap((entry) =>
      entry.dependencies.map((dependencyId) => ({ from: dependencyId, to: entry.id }))),
    acceptanceCriteria: [...context.source.council.synthesis.proposedAcceptanceCriteria],
    verificationPlan: [...context.compileSpec.verificationCommands],
    authorityBoundary: { ...CLOSED_AUTHORITY, mode: 'inert-preview' },
    status: 'draft',
  };

  return freezeJson({
    schemaVersion: 1,
    previewId,
    sourceDigest,
    councilSessionId: context.source.council.id,
    executionPlan,
    workOrders,
    handoffPackets,
    validation: {
      ...graphValidation,
      authorityClosed: true,
    },
    persistenceAllowed: false,
    executionAllowed: false,
    approvalAllowed: false,
  });
}

module.exports = {
  CLOSED_AUTHORITY,
  compileMissionWorkOrderPreview,
  normalizeCompileSpec,
  preflightMissionWorkOrderCandidate,
  validateWorkOrderGraph,
};
