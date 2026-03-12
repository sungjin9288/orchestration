import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { BUILDER_ACTION } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-06');

function createArtifactRun(runtime, taskId, options) {
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role: options.role,
    metadata: options.metadata || null,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type: options.type,
    extension: options.extension || 'md',
    content: options.content,
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary: options.summary || null,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function buildPreflightContent(taskTitle) {
  return `# Builder Preflight: ${taskTitle}

## Target Files
- prompts/builder.md

## Intended Changes
- keep the latest builder mutation bundle bounded and inspectable

## Risks
- none

## Verification Plan
- run reviewer against the anchored builder bundle

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture
`;
}

function buildChangeSummaryContent(preflightArtifactId, approvalId) {
  return `# Builder Live Mutation: synthetic

## Change Summary
- preflight artifact: ${preflightArtifactId}
- approval id: ${approvalId}
- target file allowlist count: 1
- prepared file updates: 1
- reviewer executed: no
- commit or release executed: no

## Target Files
- prompts/builder.md

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for reviewer smoke
`;
}

function buildPatchContent() {
  return `diff --git a/prompts/builder.md b/prompts/builder.md
index 1111111..2222222 100644
--- a/prompts/builder.md
+++ b/prompts/builder.md
@@ -1,1 +1,2 @@
 # Builder Prompt Contract
+# synthetic patch fixture
`;
}

function buildDiffContent() {
  return `diff --git a/prompts/builder.md b/prompts/builder.md
index 1111111..2222222 100644
--- a/prompts/builder.md
+++ b/prompts/builder.md
@@ -1,1 +1,2 @@
 # Builder Prompt Contract
+# synthetic observed diff fixture
`;
}

function createApprovedLiveMutationBundle(runtime, task) {
  const plan = createArtifactRun(runtime, task.id, {
    role: 'planner',
    type: 'plan',
    content: `# Plan: ${task.title}

## Slice Goal
Attach reviewer to the latest builder live mutation run bundle.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- src/runtime/runtime-service.js
- prompts/reviewer.md
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- anchor reviewer input to the latest builder live mutation run bundle
- persist a review artifact with verdict and evidence

## Review Trigger Point
- run reviewer after the latest builder live mutation bundle is available
`,
  });
  const preflight = createArtifactRun(runtime, task.id, {
    role: 'builder',
    type: 'preflight',
    content: buildPreflightContent(task.title),
    summary: {
      executionMode: 'preflight',
      mutationAllowed: false,
    },
  });
  const approval = runtime.createApprovalPlaceholder({
    taskId: task.id,
    scope: 'builder',
    allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
    targetArtifactId: preflight.artifact.id,
    targetRunId: preflight.run.id,
    title: 'Approval required: synthetic builder live mutation',
    prompt: 'Approve the synthetic bundle for reviewer smoke.',
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: 'Approve the synthetic live mutation bundle.',
  });

  const builderRun = runtime.startRun({
    taskId: task.id,
    kind: 'role',
    role: 'builder',
    metadata: {
      executionMode: 'live-mutation',
    },
  });

  runtime.appendLog({
    runId: builderRun.id,
    message: `synthetic builder live mutation run started for ${task.id}`,
  });
  runtime.appendLog({
    runId: builderRun.id,
    message: `anchored synthetic approval ${approval.id} to preflight ${preflight.artifact.id}`,
  });

  const changeSummary = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'change-summary',
    content: buildChangeSummaryContent(preflight.artifact.id, approval.id),
  });
  const patch = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'patch',
    extension: 'patch',
    content: buildPatchContent(),
  });
  const diff = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'diff',
    extension: 'diff',
    content: buildDiffContent(),
  });
  const completedBuilderRun = runtime.completeRun({
    runId: builderRun.id,
    summary: {
      approvalId: approval.id,
      artifactIds: {
        changeSummary: changeSummary.id,
        patch: patch.id,
        diff: diff.id,
      },
      changedFiles: ['prompts/builder.md'],
      executionMode: 'live-mutation',
      inputArtifactIds: [plan.artifact.id, architecture.artifact.id, breakdown.artifact.id],
      preflightArtifactId: preflight.artifact.id,
    },
  });

  return {
    approval,
    artifacts: {
      architecture: architecture.artifact,
      breakdown: breakdown.artifact,
      changeSummary,
      diff,
      patch,
      plan: plan.artifact,
      preflight: preflight.artifact,
    },
    runs: {
      architecture: architecture.run,
      breakdown: breakdown.run,
      builder: completedBuilderRun,
      plan: plan.run,
      preflight: preflight.run,
    },
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'reviewer-fixture',
  projectPath: repoRoot,
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const emptyTask = runtime.createTask({
  projectId: project.id,
  title: 'Reviewer missing bundle smoke',
  intent: 'Reject reviewer execution when no latest builder live mutation run bundle exists.',
});

await assert.rejects(
  () => coordinator.runReviewer({ taskId: emptyTask.id }),
  /latest builder live mutation run is required/i,
);

const passTask = runtime.createTask({
  projectId: project.id,
  title: 'Reviewer pass smoke',
  intent: 'Review the anchored builder bundle and pass it.',
});
const passBundle = createApprovedLiveMutationBundle(runtime, passTask);
const passReview = await coordinator.runReviewer({
  taskId: passTask.id,
});
const passReviewArtifact = runtime.getArtifact(passReview.artifact.id);
const passTaskAfter = runtime.getTask(passTask.id);

assert.equal(passReview.run.summary.rawVerdict, 'pass');
assert.equal(passReview.run.summary.sourceRunId, passBundle.runs.builder.id);
assert.equal(passTaskAfter.review.status, 'passed');
assert.equal(
  runtime.listDecisionInboxItems({
    taskId: passTask.id,
    kind: 'decision',
    status: 'pending',
  }).length,
  0,
);
assert.match(passReviewArtifact.content, /^## Verification Evidence$/m);
assert.match(
  passReviewArtifact.content,
  new RegExp(`- source builder run: ${passBundle.runs.builder.id}`),
);

await assert.rejects(
  () => coordinator.runReviewer({ taskId: passTask.id }),
  (error) => error.statusCode === 409 && /terminal reviewer run/i.test(error.message),
);

const changesTask = runtime.createTask({
  projectId: project.id,
  title: 'Reviewer changes requested smoke',
  intent: 'Review verdict: changes_requested',
});
createApprovedLiveMutationBundle(runtime, changesTask);
const changesReview = await coordinator.runReviewer({
  taskId: changesTask.id,
});
const changesTaskAfter = runtime.getTask(changesTask.id);

assert.equal(changesReview.run.summary.rawVerdict, 'changes_requested');
assert.equal(changesTaskAfter.review.status, 'changes_requested');
assert.equal(
  runtime.listDecisionInboxItems({
    taskId: changesTask.id,
    kind: 'decision',
    status: 'pending',
  }).length,
  0,
);

const failTask = runtime.createTask({
  projectId: project.id,
  title: 'Reviewer fail mapping smoke',
  intent: 'Review verdict: fail',
});
createApprovedLiveMutationBundle(runtime, failTask);
const failReview = await coordinator.runReviewer({
  taskId: failTask.id,
});
const failTaskAfter = runtime.getTask(failTask.id);

assert.equal(failReview.run.summary.rawVerdict, 'fail');
assert.equal(failTaskAfter.review.status, 'changes_requested');
assert.equal(
  runtime.listDecisionInboxItems({
    taskId: failTask.id,
    kind: 'decision',
    status: 'pending',
  }).length,
  0,
);

const decisionTask = runtime.createTask({
  projectId: project.id,
  title: 'Reviewer explicit decision smoke',
  intent: 'Review decision required blocking review issue',
});
createApprovedLiveMutationBundle(runtime, decisionTask);
const decisionReview = await coordinator.runReviewer({
  taskId: decisionTask.id,
});
const decisionTaskAfter = runtime.getTask(decisionTask.id);
const decisionItems = runtime.listDecisionInboxItems({
  taskId: decisionTask.id,
  kind: 'decision',
  status: 'pending',
});

assert.equal(decisionReview.run.summary.rawVerdict, 'pass');
assert.equal(decisionTaskAfter.review.status, 'passed');
assert.equal(decisionItems.length, 1);
assert.equal(decisionItems[0].blocksTask, true);
assert.equal(decisionReview.run.summary.decisionCreated, true);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      tasks: {
        pass: {
          taskId: passTask.id,
          reviewerRunId: passReview.run.id,
          reviewArtifactId: passReview.artifact.id,
          reviewStatus: passTaskAfter.review.status,
        },
        changesRequested: {
          taskId: changesTask.id,
          reviewerRunId: changesReview.run.id,
          rawVerdict: changesReview.run.summary.rawVerdict,
          reviewStatus: changesTaskAfter.review.status,
        },
        fail: {
          taskId: failTask.id,
          reviewerRunId: failReview.run.id,
          rawVerdict: failReview.run.summary.rawVerdict,
          reviewStatus: failTaskAfter.review.status,
        },
        explicitDecision: {
          taskId: decisionTask.id,
          reviewerRunId: decisionReview.run.id,
          decisionItemId: decisionItems[0].id,
          reviewStatus: decisionTaskAfter.review.status,
        },
      },
    },
    null,
    2,
  ),
);
