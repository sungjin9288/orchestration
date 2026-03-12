'use strict';

function renderList(items, emptyValue) {
  if (!Array.isArray(items) || items.length === 0) {
    return `- ${emptyValue}`;
  }

  return items.map((item) => `- ${item}`).join('\n');
}

function buildNormalizedPlannerResult(request) {
  const missingContext = request.routingOutcome.missingContext || [];
  const blockers = [];

  if (missingContext.length > 0) {
    blockers.push(`missing context: ${missingContext.join(', ')}`);
  }

  const needsDecision = Boolean(request.routingOutcome.decisionNote);
  const decisionContext = [];

  if (needsDecision) {
    decisionContext.push(`decision required: ${request.routingOutcome.decisionNote}`);
  }

  return {
    blockers,
    needsDecision,
    nextStage: blockers.length > 0 || needsDecision ? 'human gate' : 'architect',
    summary:
      blockers.length > 0 || needsDecision
        ? 'Planner identified follow-up that must route through the human gate.'
        : 'Planner output is ready for architect handoff.',
    decisionTitle: `Planner follow-up: ${request.task.title}`,
    decisionPrompt: renderList(
      [...blockers, ...decisionContext],
      'Planner output is ready for architect handoff.',
    ),
  };
}

function renderPlannerOutput(request) {
  const normalizedResult = buildNormalizedPlannerResult(request);
  const blockers = [...normalizedResult.blockers];

  if (normalizedResult.needsDecision) {
    blockers.push(`decision required: ${request.routingOutcome.decisionNote}`);
  }

  blockers.push('initial live provider choice remains open; local stub adapter is in use');

  return `# Plan: ${request.task.title}

## Slice Goal
${request.routingOutcome.scopeStatement}

## Intended Outcome
Connect the planner role to a real run path that reads the planner prompt contract, builds an execution request, calls a single adapter, and stores run, log, and plan artifacts in runtime state.

## Acceptance Target
- planner role runs through the execution coordinator
- runtime stores planner logs and a plan artifact
- planner output is ready for architect handoff
- no downstream roles execute in this slice

## Verification Approach
- run a local smoke script that executes the planner happy path
- inspect runtime snapshot, run logs, and stored artifact content
- confirm that only one planner run is created

## Dependencies and Blockers
${renderList(blockers, 'none')}

## Expected Artifacts
- plan
- execution-log

## Worktree Need
No. This slice only plans work and stores runtime evidence.

## Non-Goals
- builder execution
- reviewer execution
- six-role orchestration
- UI refactor
- multi-provider support
`;
}

function createLocalStubProviderAdapter() {
  return {
    name: 'local-stub',
    async execute(request) {
      return {
        providerRunId: `local-stub-${request.role}-${request.task.id}`,
        model: 'local-stub-planner-v1',
        normalizedResult: buildNormalizedPlannerResult(request),
        outputText: renderPlannerOutput(request),
        usage: {
          inputTokens: 0,
          outputTokens: 0,
        },
      };
    },
  };
}

module.exports = {
  createLocalStubProviderAdapter,
};
