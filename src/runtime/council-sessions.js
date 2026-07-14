'use strict';

const crypto = require('crypto');

const REAL_COUNCIL_MODE = 'real-local-stub';
const REQUIRED_POSITION_ROLES = ['strategist', 'architect', 'decomposer'];
const SYNTHESIS_ROLE = 'conductor';
const POSITION_OUTPUT_KEYS = [
  'recommendation',
  'assumptions',
  'evidenceRefs',
  'objections',
  'risks',
  'confidence',
  'proposedNextStep',
];
const SYNTHESIS_OUTPUT_KEYS = [
  'missionInterpretation',
  'adoptedRecommendation',
  'adoptedPositionRefs',
  'rejectedAlternatives',
  'dissentRefs',
  'unresolvedQuestions',
  'proposedExecutionBoundary',
  'proposedAcceptanceCriteria',
  'humanDecisionRequired',
];
const SUPPORTED_EVIDENCE_REFS = new Set([
  'mission.title',
  'mission.goal',
  'mission.constraints',
  'mission.deliverableType',
  'project.path',
  'company.blueprint',
]);

function isPlainRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

function freezeJson(value) {
  if ((!Array.isArray(value) && !isPlainRecord(value)) || Object.isFrozen(value)) {
    return value;
  }

  for (const entry of Object.values(value)) {
    freezeJson(entry);
  }

  return Object.freeze(value);
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

function assertExactKeys(value, keys, label) {
  if (!isPlainRecord(value)) {
    throw new Error(`${label} must be an object`);
  }

  const actualKeys = Object.keys(value).sort();
  const expectedKeys = [...keys].sort();

  if (
    actualKeys.length !== expectedKeys.length ||
    actualKeys.some((key, index) => key !== expectedKeys[index])
  ) {
    throw new Error(`${label} fields are invalid`);
  }
}

function requiredString(value, label) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${label} is required`);
  }

  return value.trim();
}

function stringArray(value, label, { allowEmpty = true } = {}) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }

  const normalized = value.map((entry) => requiredString(entry, label));

  if (!allowEmpty && normalized.length === 0) {
    throw new Error(`${label} must not be empty`);
  }

  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${label} must not contain duplicates`);
  }

  return normalized;
}

function buildCouncilAgenda(mission, project) {
  return {
    missionId: requiredString(mission?.id, 'mission.id'),
    projectId: requiredString(project?.id, 'project.id'),
    title: requiredString(mission?.title, 'mission.title'),
    goal: requiredString(mission?.goal, 'mission.goal'),
    constraints: String(mission?.constraints || '').trim(),
    deliverableType: String(mission?.deliverableType || '').trim() || null,
    projectPath: requiredString(project?.projectPath, 'project.projectPath'),
  };
}

function buildAgendaDigest(agenda) {
  return digestJson(agenda);
}

function buildAttemptId(sessionId, sequence) {
  return `${sessionId}-attempt-${String(sequence).padStart(2, '0')}`;
}

function buildPositionId(attemptId, agentId) {
  return `${attemptId}-${agentId}`;
}

function findProfileByRole(blueprint, role) {
  return blueprint.agentProfiles.find((profile) => profile.role === role) || null;
}

function resolveCouncilProfiles(blueprint, projectPack) {
  if (!isPlainRecord(blueprint) || !Array.isArray(blueprint.agentProfiles)) {
    throw new Error('CompanyBlueprint is not ready for Real Council');
  }

  const profiles = [...REQUIRED_POSITION_ROLES, SYNTHESIS_ROLE].map((role) => {
    const profile = findProfileByRole(blueprint, role);

    if (!profile) {
      throw new Error(`CompanyBlueprint is missing required Council role: ${role}`);
    }

    if (!profile.supportedPacks.includes(projectPack)) {
      throw new Error(`Council role ${role} does not support pack: ${projectPack}`);
    }

    if (!profile.providerPolicy.allowedModes.includes('local-stub')) {
      throw new Error(`Council role ${role} does not allow local-stub`);
    }

    return profile;
  });

  return Object.fromEntries(profiles.map((profile) => [profile.role, profile]));
}

function createRealCouncilSession({ id, mission, project, companyRuntime, now }) {
  if (companyRuntime?.status !== 'ready' || !companyRuntime.blueprint) {
    throw new Error('CompanyBlueprint must be ready before Real Council starts');
  }

  const blueprint = companyRuntime.blueprint;
  const profilesByRole = resolveCouncilProfiles(blueprint, project.pack);
  const agenda = buildCouncilAgenda(mission, project);
  const sourceDigest = buildAgendaDigest(agenda);
  const requiredProfiles = REQUIRED_POSITION_ROLES.map((role) => profilesByRole[role]);
  const conductorProfile = profilesByRole[SYNTHESIS_ROLE];

  return {
    id,
    missionId: mission.id,
    mode: REAL_COUNCIL_MODE,
    status: 'collecting-positions',
    phase: 'collecting-positions',
    participants: [conductorProfile, ...requiredProfiles].map((profile) => ({
      agentId: profile.id,
      role: profile.displayName,
      roleId: profile.role,
      focus: profile.objective,
    })),
    summary: '',
    recommendation: '',
    openQuestions: [],
    transcript: [],
    selectedPlan: {
      title: '',
      scope: mission.title,
      nextStep: 'Council position collection',
    },
    alignment: {
      action: null,
      decidedAt: null,
      status: 'pending',
    },
    companyBlueprintRef: {
      companyId: blueprint.companyId,
      schemaVersion: blueprint.schemaVersion,
      sourceRefs: [...companyRuntime.sourceRefs],
    },
    staffingSnapshot: {
      mode: 'council',
      requiredAgentIds: requiredProfiles.map((profile) => profile.id),
      conductorAgentId: conductorProfile.id,
      providerMode: 'local-stub',
    },
    agenda,
    sourceDigest,
    attempts: [],
    currentAttemptId: null,
    terminalReason: null,
    createdAt: now,
    updatedAt: now,
  };
}

function validatePositionOutput(output) {
  assertExactKeys(output, POSITION_OUTPUT_KEYS, 'Council position output');
  const confidence = requiredString(output.confidence, 'position.confidence');

  if (!['low', 'medium', 'high'].includes(confidence)) {
    throw new Error('position.confidence is invalid');
  }

  return {
    recommendation: requiredString(output.recommendation, 'position.recommendation'),
    assumptions: stringArray(output.assumptions, 'position.assumptions'),
    evidenceRefs: stringArray(output.evidenceRefs, 'position.evidenceRefs', { allowEmpty: false }),
    objections: stringArray(output.objections, 'position.objections'),
    risks: stringArray(output.risks, 'position.risks'),
    confidence,
    proposedNextStep: requiredString(output.proposedNextStep, 'position.proposedNextStep'),
  };
}

function createPositionRecord({ output, session, attemptId, profile, now }) {
  const normalized = validatePositionOutput(output);

  return {
    id: buildPositionId(attemptId, profile.id),
    attemptId,
    agentId: profile.id,
    role: profile.role,
    sourceDigest: session.sourceDigest,
    ...normalized,
    createdAt: now,
  };
}

function buildConflictSummary(positions, requiredRoleFailures = []) {
  const evidenceRefs = positions.flatMap((position) => position.evidenceRefs);
  const unsupportedEvidenceRefs = [...new Set(evidenceRefs)]
    .filter((ref) => !SUPPORTED_EVIDENCE_REFS.has(ref))
    .sort();
  const assumptionCounts = new Map();

  for (const position of positions) {
    for (const assumption of position.assumptions) {
      assumptionCounts.set(assumption, (assumptionCounts.get(assumption) || 0) + 1);
    }
  }

  const recommendationGroups = new Map();

  for (const position of positions) {
    const key = position.recommendation.toLowerCase();
    recommendationGroups.set(key, [
      ...(recommendationGroups.get(key) || []),
      position.id,
    ]);
  }

  const conflictingRecommendations = recommendationGroups.size > 1
    ? [...recommendationGroups.values()].flat().sort()
    : [];
  const uniqueObjections = [...new Set(positions.flatMap((position) => position.objections))].sort();
  const dissentPositionRefs = positions
    .filter((position) => position.objections.length > 0 || conflictingRecommendations.includes(position.id))
    .map((position) => position.id)
    .sort();

  return {
    requiredRoleFailures: requiredRoleFailures.map((failure) => ({ ...failure })),
    unsupportedEvidenceRefs,
    sharedAssumptions: [...assumptionCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([assumption]) => assumption)
      .sort(),
    conflictingRecommendations,
    uniqueObjections,
    dissentPositionRefs,
    approvalReady: requiredRoleFailures.length === 0 && unsupportedEvidenceRefs.length === 0,
  };
}

function validateSynthesisOutput(output, positions) {
  assertExactKeys(output, SYNTHESIS_OUTPUT_KEYS, 'Council synthesis output');
  const positionIds = new Set(positions.map((position) => position.id));
  const adoptedPositionRefs = stringArray(
    output.adoptedPositionRefs,
    'synthesis.adoptedPositionRefs',
    { allowEmpty: false },
  );
  const dissentRefs = stringArray(output.dissentRefs, 'synthesis.dissentRefs');

  if ([...adoptedPositionRefs, ...dissentRefs].some((ref) => !positionIds.has(ref))) {
    throw new Error('Council synthesis references an unknown position');
  }

  if (output.humanDecisionRequired !== true) {
    throw new Error('Council synthesis must require a human decision');
  }

  return {
    missionInterpretation: requiredString(
      output.missionInterpretation,
      'synthesis.missionInterpretation',
    ),
    adoptedRecommendation: requiredString(
      output.adoptedRecommendation,
      'synthesis.adoptedRecommendation',
    ),
    adoptedPositionRefs,
    rejectedAlternatives: stringArray(
      output.rejectedAlternatives,
      'synthesis.rejectedAlternatives',
    ),
    dissentRefs,
    unresolvedQuestions: stringArray(output.unresolvedQuestions, 'synthesis.unresolvedQuestions'),
    proposedExecutionBoundary: requiredString(
      output.proposedExecutionBoundary,
      'synthesis.proposedExecutionBoundary',
    ),
    proposedAcceptanceCriteria: stringArray(
      output.proposedAcceptanceCriteria,
      'synthesis.proposedAcceptanceCriteria',
      { allowEmpty: false },
    ),
    humanDecisionRequired: true,
  };
}

function createSynthesisRecord({ output, attemptId, positions, conductorProfile, now }) {
  return {
    id: `${attemptId}-${conductorProfile.id}`,
    attemptId,
    agentId: conductorProfile.id,
    role: conductorProfile.role,
    ...validateSynthesisOutput(output, positions),
    createdAt: now,
  };
}

function getLatestPositionByAgent(session) {
  const positionsByAgent = new Map();

  for (const attempt of session.attempts || []) {
    for (const position of attempt.positions || []) {
      positionsByAgent.set(position.agentId, cloneJson(position));
    }
  }

  return positionsByAgent;
}

function applyAttemptPresentation(session, attempt) {
  const synthesis = attempt.synthesis;
  const positions = [...getLatestPositionByAgent(session).values()];

  session.summary = synthesis.missionInterpretation;
  session.recommendation = synthesis.adoptedRecommendation;
  session.openQuestions = [...synthesis.unresolvedQuestions];
  session.selectedPlan = {
    title: synthesis.adoptedRecommendation,
    scope: synthesis.proposedExecutionBoundary,
    nextStep: 'Human alignment decision',
  };
  session.transcript = [
    ...positions.map((position) => ({
      role: position.role[0].toUpperCase() + position.role.slice(1),
      stance: position.confidence,
      content: position.recommendation,
    })),
    {
      role: 'Conductor',
      stance: 'synthesis',
      content: synthesis.adoptedRecommendation,
    },
  ];
}

module.exports = {
  REAL_COUNCIL_MODE,
  REQUIRED_POSITION_ROLES,
  SYNTHESIS_ROLE,
  applyAttemptPresentation,
  buildAgendaDigest,
  buildAttemptId,
  buildConflictSummary,
  buildCouncilAgenda,
  cloneJson,
  createPositionRecord,
  createRealCouncilSession,
  createSynthesisRecord,
  freezeJson,
  getLatestPositionByAgent,
  resolveCouncilProfiles,
};
