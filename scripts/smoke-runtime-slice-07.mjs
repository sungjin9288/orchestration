import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-slice-07');
const projectRoot = path.join(process.cwd(), 'var', 'knowledge-work-project');

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(projectRoot, { recursive: true });

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'knowledge-work-project',
  pack: 'knowledge-work',
  projectPath: projectRoot,
});

const mission = runtime.createMission({
  projectId: project.id,
  title: 'Knowledge work pack smoke',
  goal: 'Draft a bounded PRD for the next operator move without widening into implementation.',
  constraints: 'Keep the slice reviewable and grounded in local context only.',
  deliverableType: 'prd',
});
const councilResult = runtime.createCouncilSessionForMission({ missionId: mission.id });
const linkedTaskResult = runtime.createLinkedTaskForMission({ missionId: mission.id });
const task = linkedTaskResult.task;

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot: process.cwd(),
  runtimeService: runtime,
});

const plannerResult = await coordinator.runPlanner({
  taskId: task.id,
  routingOutcome: {
    classification: 'new task',
    scopeStatement: 'Draft one bounded decision memo that clarifies the next operator move, evidence gaps, and recommended action.',
    missingContext: [],
    decisionNote: '',
  },
});

const plannerArtifact = runtime.getArtifact(plannerResult.artifact.id);

assert.match(plannerArtifact.content, /product requirements document/i);
assert.match(plannerArtifact.content, /target file: docs\/prd\.md/i);

const architectResult = await coordinator.runArchitect({ taskId: task.id });
const architectArtifact = runtime.getArtifact(architectResult.artifact.id);

assert.match(architectArtifact.content, /knowledge-work boundary/i);
assert.match(architectArtifact.content, /docs\/prd\.md/);

const taskBreakerResult = await coordinator.runTaskBreaker({ taskId: task.id });
const breakdownArtifact = runtime.getArtifact(taskBreakerResult.artifact.id);

assert.match(breakdownArtifact.content, /decision, planning, or documentation objective/i);

const preflightResult = await coordinator.runBuilderPreflight({ taskId: task.id });
const preflightArtifact = runtime.getArtifact(preflightResult.artifact.id);

assert.match(preflightArtifact.content, /docs\/prd\.md/);
assert.match(preflightArtifact.content, /knowledge-work/i);

const approval = runtime.requestBuilderLiveMutationApproval({
  taskId: task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: approval.inboxItemId,
  action: 'approved',
  note: 'Approve the bounded knowledge-work deliverable write.',
});

const mutationResult = await coordinator.runBuilderLiveMutation({ taskId: task.id });
const deliverablePath = path.join(projectRoot, 'docs', 'prd.md');

assert.equal(mutationResult.run.summary.executionMode, 'live-mutation');
assert.equal(fs.existsSync(deliverablePath), true);
const deliverableContent = fs.readFileSync(deliverablePath, 'utf8');

assert.match(deliverableContent, /^## Problem$/m);
assert.match(deliverableContent, /^## Goals$/m);
assert.match(deliverableContent, /^## Requirements$/m);
assert.match(deliverableContent, /^## Acceptance Signals$/m);

const reviewerResult = await coordinator.runReviewer({ taskId: task.id });
const reviewArtifact = runtime.getArtifact(reviewerResult.artifact.id);

assert.match(reviewArtifact.content, /product requirements document/i);
assert.match(reviewArtifact.content, /verdict: pass/);
assert.match(reviewArtifact.content, /expected section set reviewed: Problem, User, Goals, Non-Goals, Requirements, Acceptance Signals, Open Questions, Trace/);
assert.match(reviewArtifact.content, /deliverable file reviewed: docs\/prd\.md/);
assert.match(reviewArtifact.content, /Required knowledge-work rubric checks passed/i);

console.log(
  JSON.stringify(
    {
      ok: true,
      mission: {
        id: mission.id,
        deliverableType: councilResult.mission.deliverableType,
      },
      project: {
        id: project.id,
        pack: project.pack,
        projectPath: project.projectPath,
      },
      artifacts: {
        planner: plannerResult.artifact.id,
        architect: architectResult.artifact.id,
        breakdown: taskBreakerResult.artifact.id,
        preflight: preflightResult.artifact.id,
        reviewer: reviewerResult.artifact.id,
      },
      deliverablePath,
    },
    null,
    2,
  ),
);
