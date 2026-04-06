import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

async function createPreparedPrdContext({ runtimeDirName, projectDirName, title }) {
  const runtimeRoot = path.join(process.cwd(), 'var', runtimeDirName);
  const projectRoot = path.join(process.cwd(), 'var', projectDirName);

  fs.rmSync(runtimeRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.rmSync(projectRoot, { force: true, recursive: true, maxRetries: 10, retryDelay: 50 });
  fs.mkdirSync(projectRoot, { recursive: true });

  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const project = runtime.createProject({
    name: projectDirName,
    pack: 'knowledge-work',
    projectPath: projectRoot,
  });

  const mission = runtime.createMission({
    projectId: project.id,
    title,
    goal: 'Draft a bounded PRD for the next operator move without widening into implementation.',
    constraints: 'Keep the slice reviewable and grounded in local context only.',
    deliverableType: 'prd',
  });

  runtime.createCouncilSessionForMission({ missionId: mission.id });
  const linkedTaskResult = runtime.createLinkedTaskForMission({ missionId: mission.id });
  const task = linkedTaskResult.task;

  const coordinator = createExecutionCoordinator({
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot: process.cwd(),
    runtimeService: runtime,
  });

  await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: {
      classification: 'new task',
      scopeStatement: 'Draft one bounded PRD and keep the next action explicit.',
      missingContext: [],
      decisionNote: '',
    },
  });
  await coordinator.runArchitect({ taskId: task.id });
  await coordinator.runTaskBreaker({ taskId: task.id });
  await coordinator.runBuilderPreflight({ taskId: task.id });

  const approval = runtime.requestBuilderLiveMutationApproval({
    taskId: task.id,
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: 'Approve the PRD write.',
  });

  await coordinator.runBuilderLiveMutation({ taskId: task.id });

  return {
    coordinator,
    project,
    projectRoot,
    runtime,
    task,
    deliverablePath: path.join(projectRoot, 'docs', 'prd.md'),
  };
}

const changesRequestedContext = await createPreparedPrdContext({
  runtimeDirName: 'runtime-slice-09-changes',
  projectDirName: 'knowledge-work-review-changes-project',
  title: 'Knowledge-work reviewer changes-requested smoke',
});

const changesRequestedOriginal = fs.readFileSync(changesRequestedContext.deliverablePath, 'utf8');
const changesRequestedMutated = changesRequestedOriginal.replace(
  /\n## Acceptance Signals\n[\s\S]*?\n## Open Questions\n/,
  '\n## Open Questions\n',
);

assert.notEqual(changesRequestedMutated, changesRequestedOriginal);
fs.writeFileSync(changesRequestedContext.deliverablePath, changesRequestedMutated, 'utf8');

const changesRequestedReview = await changesRequestedContext.coordinator.runReviewer({
  taskId: changesRequestedContext.task.id,
});
const changesRequestedArtifact = changesRequestedContext.runtime.getArtifact(
  changesRequestedReview.artifact.id,
);

assert.equal(changesRequestedReview.run.summary.rawVerdict, 'changes_requested');
assert.equal(
  changesRequestedContext.runtime.getTask(changesRequestedContext.task.id).review.status,
  'changes_requested',
);
assert.match(changesRequestedArtifact.content, /Missing required section: Acceptance Signals\./);
assert.equal(
  changesRequestedContext.runtime.listDecisionInboxItems({
    taskId: changesRequestedContext.task.id,
    kind: 'decision',
    status: 'pending',
  }).length,
  0,
);

const failContext = await createPreparedPrdContext({
  runtimeDirName: 'runtime-slice-09-fail',
  projectDirName: 'knowledge-work-review-fail-project',
  title: 'Knowledge-work reviewer fail smoke',
});

const failOriginal = fs.readFileSync(failContext.deliverablePath, 'utf8');
const failMutated = failOriginal.replace(
  /builder-live-mutation [^\n]+ docs\/prd\.md/,
  'trace-marker-removed docs/prd.md',
);

assert.notEqual(failMutated, failOriginal);
fs.writeFileSync(failContext.deliverablePath, failMutated, 'utf8');

const failReview = await failContext.coordinator.runReviewer({
  taskId: failContext.task.id,
});
const failArtifact = failContext.runtime.getArtifact(failReview.artifact.id);

assert.equal(failReview.run.summary.rawVerdict, 'fail');
assert.equal(failContext.runtime.getTask(failContext.task.id).review.status, 'changes_requested');
assert.match(
  failArtifact.content,
  /Trace section must include the builder mutation marker for docs\/prd\.md\./,
);
assert.equal(
  failContext.runtime.listDecisionInboxItems({
    taskId: failContext.task.id,
    kind: 'decision',
    status: 'pending',
  }).length,
  0,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      changesRequested: {
        reviewArtifactId: changesRequestedReview.artifact.id,
        deliverablePath: changesRequestedContext.deliverablePath,
        rawVerdict: changesRequestedReview.run.summary.rawVerdict,
      },
      fail: {
        reviewArtifactId: failReview.artifact.id,
        deliverablePath: failContext.deliverablePath,
        rawVerdict: failReview.run.summary.rawVerdict,
      },
    },
    null,
    2,
  ),
);
