'use strict';

function createPositionOutput(request) {
  const role = request.agent.role;
  const outputs = {
    strategist: {
      recommendation: `Prioritize the smallest outcome that proves ${request.agenda.goal}`,
      assumptions: ['The operator needs one bounded and inspectable result.'],
      evidenceRefs: ['mission.goal', 'mission.title'],
      objections: ['Scope expansion would weaken the first validation signal.'],
      risks: ['The mission goal may still contain an implicit product assumption.'],
      confidence: 'high',
      proposedNextStep: 'Confirm the outcome and acceptance signal before execution.',
    },
    architect: {
      recommendation: 'Preserve current runtime contracts and add only an opt-in execution path.',
      assumptions: ['Existing compatibility behavior remains authoritative.'],
      evidenceRefs: ['mission.constraints', 'project.path', 'company.blueprint'],
      objections: ['A shared mutable role context would invalidate position independence.'],
      risks: ['Persistence changes could widen rollback beyond this mission.'],
      confidence: 'high',
      proposedNextStep: 'Validate compatibility and rollback before opening execution.',
    },
    decomposer: {
      recommendation: 'Create one reviewable task handoff after explicit human alignment.',
      assumptions: ['One linked task is enough for the first execution boundary.'],
      evidenceRefs: ['mission.title', 'mission.deliverableType'],
      objections: ['Automatic downstream execution must stop at the existing approval boundary.'],
      risks: ['A broad handoff could imply WorkOrder authority that is not approved.'],
      confidence: 'medium',
      proposedNextStep: 'Approve, request a targeted revision, or stop the Council session.',
    },
  };

  if (!outputs[role]) {
    throw new Error(`Unsupported local-stub Council role: ${role}`);
  }

  return outputs[role];
}

function createSynthesisOutput(request) {
  const decomposer = request.positions.find((position) => position.role === 'decomposer');
  const adopted = decomposer || request.positions[0];

  return {
    missionInterpretation: `The mission requires one bounded, source-backed decision for ${request.agenda.title}.`,
    adoptedRecommendation: adopted.recommendation,
    adoptedPositionRefs: [adopted.id],
    rejectedAlternatives: request.positions
      .filter((position) => position.id !== adopted.id)
      .map((position) => position.recommendation),
    dissentRefs: [...request.conflictSummary.dissentPositionRefs],
    unresolvedQuestions: [...request.conflictSummary.uniqueObjections],
    proposedExecutionBoundary: 'One linked task through the existing builder-preflight approval boundary.',
    proposedAcceptanceCriteria: [
      'Independent position evidence remains inspectable.',
      'The operator makes an explicit alignment decision.',
      'No provider, memory, source mutation, commit, push, or release authority opens.',
    ],
    humanDecisionRequired: true,
  };
}

function createCouncilLocalStubAdapter() {
  return {
    id: 'council-local-stub',
    mode: 'local-stub',
    executePosition(request) {
      return createPositionOutput(request);
    },
    executeSynthesis(request) {
      return createSynthesisOutput(request);
    },
  };
}

module.exports = {
  createCouncilLocalStubAdapter,
};
