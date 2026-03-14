import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION, RELEASE_ACTION, TASK_LIFECYCLE } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-10');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createGitFixtureRepo(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-slice-10-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const projectPath = path.join(fixtureRoot, 'worktree');
  const branchName = `slice-10-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'slice-10']);
  runGit(mainProjectPath, ['config', 'user.email', 'slice-10@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(mainProjectPath, ['add', 'scoped.txt', 'extra.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', branchName, projectPath]);

  return projectPath;
}

function setScopedFile(projectPath, label) {
  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), `scoped change ${label}\n`, 'utf8');
}

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
- scoped.txt

## Intended Changes
- keep the close-out scope anchored to the latest approved release-package bundle

## Risks
- none

## Verification Plan
- run reviewer and close-out against the anchored bundle

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture for close-out smoke
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
- scoped.txt

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for close-out smoke
`;
}

function buildPatchContent(label) {
  return `diff --git a/scoped.txt b/scoped.txt
index 1111111..2222222 100644
--- a/scoped.txt
+++ b/scoped.txt
@@ -1 +1 @@
-base scoped
+scoped change ${label}
`;
}

function buildDiffContent(label) {
  return `diff --git a/scoped.txt b/scoped.txt
index 1111111..2222222 100644
--- a/scoped.txt
+++ b/scoped.txt
@@ -1 +1 @@
-base scoped
+scoped change ${label}
`;
}

function createLiveMutationBundle(runtime, task, label) {
  const plan = createArtifactRun(runtime, task.id, {
    role: 'planner',
    type: 'plan',
    content: `# Plan: ${task.title}

## Slice Goal
Add an explicit close-out runner for the latest approved release-package bundle.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- scripts/smoke-execution-slice-10.mjs
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- create a close-out artifact from the latest approved release-package bundle
- transition the task from Review to Done after guards pass

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
    prompt: `Approve the synthetic bundle ${label} for close-out smoke.`,
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
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
    content: buildPatchContent(label),
  });
  const diff = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'diff',
    extension: 'diff',
    content: buildDiffContent(label),
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
      changedFiles: ['scoped.txt'],
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
      builder: completedBuilderRun,
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

async function createReleaseReadyTask(runtime, coordinator, label) {
  const projectPath = createGitFixtureRepo(label);
  const project = runtime.createProject({
    name: `close-out-${label}`,
    projectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Close-out ${label} smoke`,
    intent: 'Close the task from the latest approved release-package bundle without pushing or publishing.',
  });

  setScopedFile(projectPath, label);

  const reviewed = await createReviewedBundle(runtime, coordinator, task, label);
  const commitPackage = await coordinator.runCommitPackage({ taskId: task.id });

  runtime.resolveDecisionInboxItem({
    itemId: commitPackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve commit approval for ${label}.`,
  });

  const localCommit = await coordinator.runLocalCommit({ taskId: task.id });

  return {
    commitPackage,
    localCommit,
    project,
    projectPath,
    reviewed,
    task,
  };
}

async function createCloseOutReadyTask(runtime, coordinator, label) {
  const releaseReady = await createReleaseReadyTask(runtime, coordinator, label);
  const releasePackage = await coordinator.runReleasePackage({ taskId: releaseReady.task.id });

  runtime.resolveDecisionInboxItem({
    itemId: releasePackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve ${RELEASE_ACTION.RELEASE_READY} for ${label}.`,
  });

  return {
    ...releaseReady,
    releasePackage,
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const waitingApprovalCase = await createReleaseReadyTask(runtime, coordinator, 'waiting-approval');
const pendingRelease = await coordinator.runReleasePackage({
  taskId: waitingApprovalCase.task.id,
});
const waitingApprovalSummary = coordinator.getCloseOutReadiness({
  taskId: waitingApprovalCase.task.id,
});

assert.equal(waitingApprovalSummary.allowed, false);
assert.equal(waitingApprovalSummary.latestApprovedReleaseApprovalId, null);
assert.match(waitingApprovalSummary.reasons.join(' '), /waitingApproval/);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: waitingApprovalCase.task.id }),
  /flags remain active: waitingApproval/i,
);
assert.equal(pendingRelease.approval.status, APPROVAL_STATUS.PENDING);

const blockedCase = await createCloseOutReadyTask(runtime, coordinator, 'blocked');
runtime.createDecisionInboxItem({
  taskId: blockedCase.task.id,
  title: 'Blocking close-out decision',
  prompt: 'Resolve this decision before close-out may proceed.',
  blocksTask: true,
});
const blockedSummary = coordinator.getCloseOutReadiness({
  taskId: blockedCase.task.id,
});

assert.equal(blockedSummary.allowed, false);
assert.match(blockedSummary.reasons.join(' '), /blocked/);
assert.match(blockedSummary.reasons.join(' '), /waitingDecision/);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: blockedCase.task.id }),
  /flags remain active: blocked, waitingDecision/i,
);

const notReviewCase = await createCloseOutReadyTask(runtime, coordinator, 'not-review');
runtime.transitionTaskLifecycle({
  taskId: notReviewCase.task.id,
  to: TASK_LIFECYCLE.IN_PROGRESS,
});
const notReviewSummary = coordinator.getCloseOutReadiness({
  taskId: notReviewCase.task.id,
});

assert.equal(notReviewSummary.allowed, false);
assert.match(notReviewSummary.reasons.join(' '), /must be in Review/i);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: notReviewCase.task.id }),
  /must be in Review/i,
);

const dirtyCase = await createCloseOutReadyTask(runtime, coordinator, 'dirty');
fs.writeFileSync(path.join(dirtyCase.projectPath, 'extra.txt'), 'dirty close-out repo\n', 'utf8');
const dirtySummary = coordinator.getCloseOutReadiness({
  taskId: dirtyCase.task.id,
});

assert.equal(dirtySummary.allowed, false);
assert.equal(dirtySummary.repoClean, false);
assert.match(dirtySummary.reasons.join(' '), /Repo must be clean before close-out/i);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: dirtyCase.task.id }),
  /Repo must be clean before close-out/i,
);

const staleCase = await createCloseOutReadyTask(runtime, coordinator, 'stale');
setScopedFile(staleCase.projectPath, 'stale-next');
const nextReviewed = await createReviewedBundle(runtime, coordinator, staleCase.task, 'stale-next');
const nextCommitPackage = await coordinator.runCommitPackage({
  taskId: staleCase.task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: nextCommitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve the second commit approval for stale close-out smoke.',
});

const nextLocalCommit = await coordinator.runLocalCommit({
  taskId: staleCase.task.id,
});
const staleSummary = coordinator.getCloseOutReadiness({
  taskId: staleCase.task.id,
});

assert.equal(staleSummary.allowed, false);
assert.equal(staleSummary.approvalStale, true);
assert.equal(staleSummary.commitResultArtifactId, nextLocalCommit.artifact.id);
assert.match(staleSummary.reasons.join(' '), /stale/i);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: staleCase.task.id }),
  /stale/i,
);
assert.equal(nextReviewed.review.review.status, 'passed');

const happyCase = await createCloseOutReadyTask(runtime, coordinator, 'happy');
const happyBeforeSummary = coordinator.getCloseOutReadiness({
  taskId: happyCase.task.id,
});

assert.equal(runtime.getTask(happyCase.task.id).lifecycleState, TASK_LIFECYCLE.REVIEW);
assert.equal(happyBeforeSummary.allowed, true);
assert.equal(happyBeforeSummary.approvalStale, false);
assert.equal(happyBeforeSummary.currentReleasePackageArtifactId, happyCase.releasePackage.artifact.id);
assert.equal(happyBeforeSummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(happyBeforeSummary.commitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(happyBeforeSummary.deliveryStance, 'local-demo-only');
assert.equal(happyBeforeSummary.latestApprovedReleaseApprovalId, happyCase.releasePackage.approval.id);
assert.equal(happyBeforeSummary.repoClean, true);
assert.equal(happyBeforeSummary.repoDirtyFileCount, 0);
assert.equal(happyBeforeSummary.repoStagedFileCount, 0);
assert.equal(happyBeforeSummary.repoUntrackedFileCount, 0);

const closeOut = await coordinator.runCloseOut({
  taskId: happyCase.task.id,
});
const closeOutArtifact = runtime.getArtifact(closeOut.artifact.id);
const happyTask = runtime.getTask(happyCase.task.id);
const happyAfterSummary = coordinator.getCloseOutReadiness({
  taskId: happyCase.task.id,
});

assert.equal(closeOut.artifact.type, 'close-out');
assert.equal(closeOut.run.summary.executionMode, 'close-out');
assert.equal(closeOut.run.summary.lifecycleTransition, 'Review -> Done');
assert.equal(closeOut.run.summary.repoClean, true);
assert.equal(closeOut.run.summary.pushExecuted, false);
assert.equal(closeOut.run.summary.publishExecuted, false);
assert.equal(closeOut.run.summary.externalReleaseExecuted, false);
assert.equal(closeOut.run.summary.sourceReleaseApprovalId, happyCase.releasePackage.approval.id);
assert.equal(
  closeOut.run.summary.sourceReleasePackageArtifactId,
  happyCase.releasePackage.artifact.id,
);
assert.equal(
  closeOut.run.summary.sourceCommitResultArtifactId,
  happyCase.localCommit.artifact.id,
);
assert.equal(
  closeOut.run.summary.sourceCommitPackageArtifactId,
  happyCase.commitPackage.artifact.id,
);
assert.equal(
  closeOut.run.summary.sourceReviewerRunId,
  happyCase.reviewed.review.run.id,
);
assert.equal(
  closeOut.run.summary.sourceBuilderRunId,
  happyCase.reviewed.liveMutationBundle.runs.builder.id,
);
assert.equal(happyTask.lifecycleState, TASK_LIFECYCLE.DONE);
assert.deepEqual(happyTask.flags, {
  blocked: false,
  waitingApproval: false,
  waitingDecision: false,
});
assert.match(closeOutArtifact.content, /^## Done Transition$/m);
assert.match(closeOutArtifact.content, /^## Source Release Bundle$/m);
assert.match(closeOutArtifact.content, /^## Source Review Bundle$/m);
assert.match(closeOutArtifact.content, /^## Source Builder Bundle$/m);
assert.match(closeOutArtifact.content, /^## Worktree Verification$/m);
assert.match(closeOutArtifact.content, /^## Release Safety$/m);
assert.match(
  closeOutArtifact.content,
  new RegExp(`source release-package artifact: ${happyCase.releasePackage.artifact.id}`),
);
assert.match(
  closeOutArtifact.content,
  new RegExp(`source commit-result artifact: ${happyCase.localCommit.artifact.id}`),
);
assert.match(
  closeOutArtifact.content,
  new RegExp(`source reviewer run: ${happyCase.reviewed.review.run.id}`),
);
assert.match(
  closeOutArtifact.content,
  new RegExp(`source builder run: ${happyCase.reviewed.liveMutationBundle.runs.builder.id}`),
);
assert.match(closeOutArtifact.content, /lifecycle transition: Review -> Done/);
assert.match(closeOutArtifact.content, /repo clean before close-out: yes/);
assert.match(closeOutArtifact.content, /push executed: no/);
assert.match(closeOutArtifact.content, /publish executed: no/);
assert.match(closeOutArtifact.content, /external release executed: no/);
assert.equal(happyAfterSummary.allowed, false);
assert.equal(happyAfterSummary.conflict, true);
assert.equal(happyAfterSummary.existingCloseOutArtifactId, closeOut.artifact.id);
assert.equal(happyAfterSummary.existingCloseOutRunId, closeOut.run.id);

await assert.rejects(
  () => coordinator.runCloseOut({ taskId: happyCase.task.id }),
  (error) => error.statusCode === 409 && /already completed/i.test(error.message),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      waitingApprovalTaskId: waitingApprovalCase.task.id,
      blockedTaskId: blockedCase.task.id,
      notReviewTaskId: notReviewCase.task.id,
      dirtyTaskId: dirtyCase.task.id,
      staleTaskId: staleCase.task.id,
      happyTask: {
        id: happyTask.id,
        lifecycleState: happyTask.lifecycleState,
        closeOutArtifactId: closeOut.artifact.id,
        closeOutRunId: closeOut.run.id,
      },
      happyBeforeSummary,
      happyAfterSummary,
    },
    null,
    2,
  ),
);
