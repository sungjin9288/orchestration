import assert from 'node:assert/strict';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION, COMMIT_ACTION } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-07');

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

## File Updates
### prompts/builder.md
\`\`\`base64
${Buffer.from('# Builder Prompt Contract\n# synthetic commit-package smoke fixture\n', 'utf8').toString('base64')}
\`\`\`

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for commit-package smoke
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

function createLiveMutationBundle(runtime, task, label) {
  const plan = createArtifactRun(runtime, task.id, {
    role: 'planner',
    type: 'plan',
    content: `# Plan: ${task.title}

## Slice Goal
Prepare commit-package evidence from the latest successful terminal reviewer pass bundle.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- src/runtime/runtime-service.js
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- create a commit-package artifact from the latest successful terminal reviewer pass bundle
- request commit approval without running git commit

## Review Trigger Point
- run reviewer after the latest builder live mutation bundle is available
`,
  });
  const preflight = createArtifactRun(runtime, task.id, {
    role: 'builder',
    type: 'preflight',
    content: buildPreflightContent(`${task.title} ${label}`),
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
    title: `Approval required: synthetic builder live mutation ${label}`,
    prompt: `Approve the synthetic bundle ${label} for reviewer smoke.`,
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: `Approve the synthetic live mutation bundle ${label}.`,
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
    message: `synthetic builder live mutation run started for ${task.id} (${label})`,
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
      inputArtifactIds: [
        plan.artifact.id,
        architecture.artifact.id,
        breakdown.artifact.id,
        preflight.artifact.id,
      ],
      inputRunIds: [plan.run.id, architecture.run.id, breakdown.run.id, preflight.run.id],
      approvalTargetArtifactId: preflight.artifact.id,
      approvalTargetRunId: preflight.run.id,
      preflightArtifactId: preflight.artifact.id,
      preflightRunId: preflight.run.id,
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

async function createReviewedBundle(runtime, coordinator, task, label) {
  const liveMutationBundle = createLiveMutationBundle(runtime, task, label);
  const review = await coordinator.runReviewer({
    taskId: task.id,
  });

  return {
    liveMutationBundle,
    review,
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const project = runtime.createProject({
  name: 'commit-package-fixture',
  projectPath: repoRoot,
});

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const missingPassTask = runtime.createTask({
  projectId: project.id,
  title: 'Commit package missing pass smoke',
  intent: 'Reject commit-package creation until the latest terminal reviewer run passes.',
});
createLiveMutationBundle(runtime, missingPassTask, 'missing-pass');

assert.equal(
  coordinator.getCommitPackageReadiness({ taskId: missingPassTask.id }).allowed,
  false,
);
await assert.rejects(
  () => coordinator.runCommitPackage({ taskId: missingPassTask.id }),
  /latest successful terminal reviewer pass bundle is required/i,
);

const happyTask = runtime.createTask({
  projectId: project.id,
  title: 'Commit package happy path smoke',
  intent: 'Review the anchored builder bundle and pass it.',
});
const happyBundle = await createReviewedBundle(runtime, coordinator, happyTask, 'happy');
const unrelatedApproval = runtime.createApprovalPlaceholder({
  taskId: happyTask.id,
  scope: 'commit',
  allowedNextAction: COMMIT_ACTION.COMMIT_READY,
  title: 'Approval required: commit-ready unrelated smoke',
  prompt: 'This unrelated pending approval must not block commit-package creation.',
});
const happyReadinessBefore = coordinator.getCommitPackageReadiness({
  taskId: happyTask.id,
});

assert.equal(happyReadinessBefore.allowed, true);
assert.equal(happyReadinessBefore.latestApprovalId, null);

const firstCommitPackage = await coordinator.runCommitPackage({
  taskId: happyTask.id,
});
const firstCommitPackageArtifact = runtime.getArtifact(firstCommitPackage.artifact.id);
const firstCommitApproval = runtime.getApproval(firstCommitPackage.approval.id);
const firstCommitLogs = runtime.getLogs(firstCommitPackage.run.id);

assert.equal(firstCommitPackageArtifact.type, 'commit-package');
assert.equal(firstCommitApproval.allowedNextAction, COMMIT_ACTION.COMMIT_INTENT);
assert.equal(
  firstCommitApproval.metadata.commitPackageArtifactId,
  firstCommitPackageArtifact.id,
);
assert.equal(
  firstCommitApproval.metadata.sourceReviewerRunId,
  happyBundle.review.run.id,
);
assert.equal(
  firstCommitApproval.metadata.sourceBuilderRunId,
  happyBundle.liveMutationBundle.runs.builder.id,
);
assert.equal(
  firstCommitApproval.metadata.targetPreflightArtifactId,
  happyBundle.liveMutationBundle.artifacts.preflight.id,
);
assert.match(
  firstCommitApproval.title,
  new RegExp(`commitPackageArtifactId=${firstCommitPackageArtifact.id}`),
);
assert.match(firstCommitPackageArtifact.content, /^# Commit Package:/m);
assert.match(firstCommitPackageArtifact.content, /^## Source Reviewer Bundle$/m);
assert.match(firstCommitPackageArtifact.content, /- git commit executed: no/);
assert.equal(firstCommitPackage.run.summary.executionMode, 'commit-package');
assert.equal(firstCommitPackage.run.summary.gitCommitExecuted, false);
assert.equal(firstCommitPackage.run.summary.mergeExecuted, false);
assert.equal(firstCommitPackage.run.summary.releaseExecuted, false);
assert.match(firstCommitLogs[0].message, /commit-package run started/i);

await assert.rejects(
  () => coordinator.runCommitPackage({ taskId: happyTask.id }),
  (error) => error.statusCode === 409 && /already pending/i.test(error.message),
);

runtime.resolveDecisionInboxItem({
  itemId: firstCommitApproval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject the first commit-intent approval.',
});

const retryCommitPackage = await coordinator.runCommitPackage({
  taskId: happyTask.id,
});
const retryCommitApproval = runtime.getApproval(retryCommitPackage.approval.id);

assert.notEqual(retryCommitApproval.id, firstCommitApproval.id);
assert.equal(retryCommitPackage.artifact.id, firstCommitPackageArtifact.id);
assert.equal(retryCommitPackage.run.summary.reusedCommitPackageArtifact, true);

runtime.resolveDecisionInboxItem({
  itemId: retryCommitApproval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve the second commit-intent approval.',
});

await assert.rejects(
  () => coordinator.runCommitPackage({ taskId: happyTask.id }),
  (error) => error.statusCode === 409 && /already approved/i.test(error.message),
);

const blockedTask = runtime.createTask({
  projectId: project.id,
  title: 'Commit package blocked decision smoke',
  intent: 'Review the anchored builder bundle and pass it.',
});
await createReviewedBundle(runtime, coordinator, blockedTask, 'blocked');
runtime.createDecisionInboxItem({
  taskId: blockedTask.id,
  title: 'Blocking decision before commit package',
  prompt: 'Resolve this blocking decision before commit approval may be requested.',
  blocksTask: true,
});

const blockedReadiness = coordinator.getCommitPackageReadiness({
  taskId: blockedTask.id,
});

assert.equal(blockedReadiness.allowed, false);
assert.match(blockedReadiness.reasons.join('; '), /blocking decision items/i);
await assert.rejects(
  () => coordinator.runCommitPackage({ taskId: blockedTask.id }),
  /blocking decision items/i,
);

const staleTask = runtime.createTask({
  projectId: project.id,
  title: 'Commit package stale bundle smoke',
  intent: 'Review the anchored builder bundle and pass it.',
});
const staleFirstBundle = await createReviewedBundle(runtime, coordinator, staleTask, 'stale-one');
const staleFirstCommitPackage = await coordinator.runCommitPackage({
  taskId: staleTask.id,
});

runtime.resolveDecisionInboxItem({
  itemId: staleFirstCommitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve the first stale commit-intent approval.',
});

const staleSecondBundle = await createReviewedBundle(runtime, coordinator, staleTask, 'stale-two');
const staleReadiness = coordinator.getCommitPackageReadiness({
  taskId: staleTask.id,
});

assert.equal(staleReadiness.allowed, true);
assert.equal(staleReadiness.packageStale, true);
assert.equal(staleReadiness.approvalStale, true);
assert.equal(staleReadiness.sourceReviewerRunId, staleSecondBundle.review.run.id);
assert.equal(
  staleReadiness.currentCommitPackageArtifactId,
  null,
);

const staleSecondCommitPackage = await coordinator.runCommitPackage({
  taskId: staleTask.id,
});
const staleSecondCommitApproval = runtime.getApproval(staleSecondCommitPackage.approval.id);

assert.notEqual(staleSecondCommitPackage.artifact.id, staleFirstCommitPackage.artifact.id);
assert.equal(
  staleSecondCommitApproval.metadata.sourceReviewerRunId,
  staleSecondBundle.review.run.id,
);
assert.equal(
  staleSecondCommitApproval.metadata.sourceBuilderRunId,
  staleSecondBundle.liveMutationBundle.runs.builder.id,
);
assert.equal(
  staleSecondCommitApproval.targetArtifactId,
  staleSecondBundle.liveMutationBundle.artifacts.preflight.id,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      tasks: {
        happy: {
          taskId: happyTask.id,
          commitPackageArtifactId: firstCommitPackageArtifact.id,
          firstCommitApprovalId: firstCommitApproval.id,
          retryCommitApprovalId: retryCommitApproval.id,
          unrelatedApprovalId: unrelatedApproval.id,
        },
        blocked: {
          taskId: blockedTask.id,
          readinessReasons: blockedReadiness.reasons,
        },
        stale: {
          taskId: staleTask.id,
          firstReviewerRunId: staleFirstBundle.review.run.id,
          secondReviewerRunId: staleSecondBundle.review.run.id,
          firstCommitPackageArtifactId: staleFirstCommitPackage.artifact.id,
          secondCommitPackageArtifactId: staleSecondCommitPackage.artifact.id,
        },
      },
    },
    null,
    2,
  ),
);
