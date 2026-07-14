'use strict';

const {
  REQUIRED_POSITION_ROLES,
  SYNTHESIS_ROLE,
  applyAttemptPresentation,
  buildAttemptId,
  buildConflictSummary,
  cloneJson,
  createPositionRecord,
  createSynthesisRecord,
  freezeJson,
  getLatestPositionByAgent,
  resolveCouncilProfiles,
} = require('../runtime/council-sessions');

function createCouncilCoordinator(options = {}) {
  const adapter = options.adapter;

  if (!adapter || typeof adapter.executePosition !== 'function' || typeof adapter.executeSynthesis !== 'function') {
    throw new Error('Council coordinator requires a position and synthesis adapter');
  }

  function runAttempt({
    session,
    blueprint,
    projectPack,
    targetAgentIds = null,
    revisionRequest = null,
    synthesisOnly = false,
    now,
  }) {
    const profilesByRole = resolveCouncilProfiles(blueprint, projectPack);
    const requiredProfiles = REQUIRED_POSITION_ROLES.map((role) => profilesByRole[role]);
    const allowedAgentIds = new Set(requiredProfiles.map((profile) => profile.id));
    const requestedAgentIds = synthesisOnly
      ? []
      : targetAgentIds === null
      ? [...allowedAgentIds]
      : [...new Set(targetAgentIds)];

    if (
      (!synthesisOnly && requestedAgentIds.length === 0) ||
      requestedAgentIds.some((agentId) => !allowedAgentIds.has(agentId))
    ) {
      throw new Error('Council targetAgentIds must name at least one required position agent');
    }

    const sequence = session.attempts.length + 1;
    const attemptId = buildAttemptId(session.id, sequence);
    const attempt = {
      id: attemptId,
      sequence,
      sourceDigest: session.sourceDigest,
      status: 'collecting-positions',
      positions: [],
      conflictSummary: null,
      synthesis: null,
      revisionRequest: revisionRequest ? cloneJson(revisionRequest) : null,
      createdAt: now,
      completedAt: null,
    };
    const failures = [];

    session.phase = 'collecting-positions';
    session.status = 'collecting-positions';
    session.currentAttemptId = attempt.id;

    for (const profile of requiredProfiles.filter((entry) => requestedAgentIds.includes(entry.id))) {
      const request = freezeJson({
        sessionId: session.id,
        attemptId,
        sourceDigest: session.sourceDigest,
        agenda: cloneJson(session.agenda),
        agent: {
          id: profile.id,
          role: profile.role,
          objective: profile.objective,
        },
        revisionRequest: revisionRequest ? cloneJson(revisionRequest) : null,
      });

      try {
        const output = adapter.executePosition(request);
        attempt.positions.push(
          createPositionRecord({ output, session, attemptId, profile, now }),
        );
      } catch (error) {
        failures.push({
          agentId: profile.id,
          role: profile.role,
          code: 'POSITION_EXECUTION_FAILED',
          message: error.message,
        });
      }
    }

    const latestPositions = getLatestPositionByAgent(session);

    for (const agentId of requestedAgentIds) {
      latestPositions.delete(agentId);
    }

    for (const position of attempt.positions) {
      latestPositions.set(position.agentId, position);
    }

    const effectivePositions = requiredProfiles
      .map((profile) => latestPositions.get(profile.id) || null)
      .filter(Boolean);
    const missingProfiles = requiredProfiles.filter(
      (profile) => !latestPositions.has(profile.id) && !failures.some((failure) => failure.agentId === profile.id),
    );

    for (const profile of missingProfiles) {
      failures.push({
        agentId: profile.id,
        role: profile.role,
        code: 'POSITION_MISSING',
        message: `No valid position exists for ${profile.role}`,
      });
    }

    attempt.conflictSummary = buildConflictSummary(effectivePositions, failures);

    if (!attempt.conflictSummary.approvalReady) {
      attempt.status = 'failed';
      attempt.completedAt = now;
      session.attempts.push(attempt);
      session.status = 'failed';
      session.phase = 'collecting-positions';
      session.updatedAt = now;
      return attempt;
    }

    session.phase = 'synthesizing';
    session.status = 'synthesizing';
    const conductorProfile = profilesByRole[SYNTHESIS_ROLE];

    try {
      const output = adapter.executeSynthesis(freezeJson({
        sessionId: session.id,
        attemptId,
        sourceDigest: session.sourceDigest,
        agenda: cloneJson(session.agenda),
        agent: {
          id: conductorProfile.id,
          role: conductorProfile.role,
          objective: conductorProfile.objective,
        },
        positions: cloneJson(effectivePositions),
        conflictSummary: cloneJson(attempt.conflictSummary),
        revisionRequest: revisionRequest ? cloneJson(revisionRequest) : null,
      }));
      attempt.synthesis = createSynthesisRecord({
        output,
        attemptId,
        positions: effectivePositions,
        conductorProfile,
        now,
      });
    } catch (error) {
      attempt.status = 'failed';
      attempt.completedAt = now;
      attempt.conflictSummary.requiredRoleFailures.push({
        agentId: conductorProfile.id,
        role: conductorProfile.role,
        code: 'SYNTHESIS_EXECUTION_FAILED',
        message: error.message,
      });
      attempt.conflictSummary.approvalReady = false;
      session.attempts.push(attempt);
      session.status = 'failed';
      session.phase = 'synthesizing';
      session.updatedAt = now;
      return attempt;
    }

    attempt.status = 'awaiting-alignment';
    attempt.completedAt = now;
    session.attempts.push(attempt);
    session.status = 'pending-alignment';
    session.phase = 'awaiting-alignment';
    session.updatedAt = now;
    applyAttemptPresentation(session, attempt);
    return attempt;
  }

  return {
    runAttempt,
  };
}

module.exports = {
  createCouncilCoordinator,
};
