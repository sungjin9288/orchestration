import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const runtimeRoot = path.join(process.cwd(), 'var', 'runtime-slice-08');
const projectRoot = path.join(process.cwd(), 'var', 'knowledge-work-checklist-project');

fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
fs.mkdirSync(projectRoot, { recursive: true });

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'knowledge-work-checklist-project',
  pack: 'knowledge-work',
  projectPath: projectRoot,
});

const mission = runtime.createMission({
  projectId: project.id,
  title: 'Checklist template smoke',
  goal: 'Prepare a bounded operator checklist for the next review cycle.',
  constraints: 'Keep it actionable and stop before implementation.',
  deliverableType: 'checklist',
});

runtime.createCouncilSessionForMission({ missionId: mission.id });
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
    scopeStatement: 'Draft one bounded operator checklist and keep the next action explicit.',
    missingContext: [],
    decisionNote: '',
  },
});

const plannerArtifact = runtime.getArtifact(plannerResult.artifact.id);

assert.match(plannerArtifact.content, /operational checklist/i);
assert.match(plannerArtifact.content, /Preferred Sections/);
assert.match(plannerArtifact.content, /Checklist/);

await coordinator.runArchitect({ taskId: task.id });
await coordinator.runTaskBreaker({ taskId: task.id });
const preflightResult = await coordinator.runBuilderPreflight({ taskId: task.id });
const preflightArtifact = runtime.getArtifact(preflightResult.artifact.id);

assert.match(preflightArtifact.content, /docs\/checklist\.md/);
assert.match(preflightArtifact.content, /Objective, Checklist, Readiness Signals, Risks, Next Action, Trace/);

const approval = runtime.requestBuilderLiveMutationApproval({
  taskId: task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: approval.inboxItemId,
  action: 'approved',
  note: 'Approve the checklist write.',
});

await coordinator.runBuilderLiveMutation({ taskId: task.id });

const deliverablePath = path.join(projectRoot, 'docs', 'checklist.md');
const deliverableContent = fs.readFileSync(deliverablePath, 'utf8');

assert.match(deliverableContent, /^## Objective$/m);
assert.match(deliverableContent, /^## Checklist$/m);
assert.match(deliverableContent, /^- \[ \] Confirm the outcome and owner of this slice$/m);
assert.match(deliverableContent, /^## Readiness Signals$/m);

const reviewerResult = await coordinator.runReviewer({ taskId: task.id });
const reviewArtifact = runtime.getArtifact(reviewerResult.artifact.id);

assert.equal(reviewerResult.run.summary.rawVerdict, 'pass');
assert.match(reviewArtifact.content, /operational checklist/i);
assert.match(reviewArtifact.content, /deliverable file reviewed: docs\/checklist\.md/);
assert.match(reviewArtifact.content, /Required knowledge-work rubric checks passed/i);

console.log(
  JSON.stringify(
    {
      ok: true,
      project: {
        id: project.id,
        pack: project.pack,
      },
      mission: {
        id: mission.id,
        deliverableType: mission.deliverableType,
      },
      reviewer: {
        artifactId: reviewerResult.artifact.id,
        rawVerdict: reviewerResult.run.summary.rawVerdict,
      },
      deliverablePath,
    },
    null,
    2,
  ),
);
