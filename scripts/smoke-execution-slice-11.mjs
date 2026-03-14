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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-11');
const statePath = path.join(runtimeRoot, 'state.json');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-slice-11-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const nonWorktreePath = path.join(fixtureRoot, 'plain');
  const branchName = `slice-11-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });
  fs.mkdirSync(nonWorktreePath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'slice-11']);
  runGit(mainProjectPath, ['config', 'user.email', 'slice-11@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(mainProjectPath, ['add', 'scoped.txt', 'extra.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', branchName, linkedProjectPath]);

  return {
    linkedProjectPath,
    mainProjectPath,
    nonWorktreePath,
  };
}

function setScopedFile(projectPath, label) {
  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), `scoped change ${label}\n`, 'utf8');
}

function updateRuntimeState(mutator) {
  const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  mutator(state);
  fs.writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

function setProjectPath(projectId, projectPath) {
  updateRuntimeState((state) => {
    state.projects[projectId].projectPath = projectPath;
    state.projects[projectId].updatedAt = new Date().toISOString();
  });
}

function setTaskWorktreeRef(taskId, worktreeRef) {
  updateRuntimeState((state) => {
    state.tasks[taskId].worktreeRef = worktreeRef;
    state.tasks[taskId].updatedAt = new Date().toISOString();
  });
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
- keep release-package and close-out blocked outside a dedicated linked worktree root

## Risks
- none

## Verification Plan
- run release-package and close-out through dedicated linked worktree guard cases

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when the dedicated linked worktree guard disagrees with git state

## Input Summary
- synthetic preflight fixture for execution-slice-11 smoke
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
- synthetic live mutation bundle for execution-slice-11 smoke
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
Add a dedicated linked worktree guard for release-package and close-out.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- scripts/smoke-execution-slice-11.mjs
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- prepare release-package provenance from the latest local commit bundle
- keep close-out limited to the approved release bundle inside a dedicated linked worktree

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
    prompt: `Approve the synthetic bundle ${label} for execution-slice-11 smoke.`,
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
  const fixture = createLinkedWorktreeFixture(label);
  const project = runtime.createProject({
    name: `execution-slice-11-release-${label}`,
    projectPath: fixture.linkedProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Execution slice 11 release ${label}`,
    intent: 'Guard release-package behind a dedicated linked worktree root.',
  });

  setScopedFile(fixture.linkedProjectPath, label);

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
    fixture,
    localCommit,
    project,
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

const releaseMainCase = await createReleaseReadyTask(runtime, coordinator, 'release-main');
setProjectPath(releaseMainCase.project.id, releaseMainCase.fixture.mainProjectPath);
const releaseMainSummary = coordinator.getReleasePackageReadiness({
  taskId: releaseMainCase.task.id,
});

assert.equal(releaseMainSummary.allowed, false);
assert.match(releaseMainSummary.reasons.join(' '), /main worktree is blocked before release-package/i);
await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: releaseMainCase.task.id }),
  /main worktree is blocked before release-package/i,
);

const releaseNonWorktreeCase = await createReleaseReadyTask(runtime, coordinator, 'release-non-worktree');
setProjectPath(releaseNonWorktreeCase.project.id, releaseNonWorktreeCase.fixture.nonWorktreePath);
const releaseNonWorktreeSummary = coordinator.getReleasePackageReadiness({
  taskId: releaseNonWorktreeCase.task.id,
});

assert.equal(releaseNonWorktreeSummary.allowed, false);
assert.match(releaseNonWorktreeSummary.reasons.join(' '), /project_path is not a git worktree/i);
await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: releaseNonWorktreeCase.task.id }),
  /project_path is not a git worktree/i,
);

const releaseMismatchCase = await createReleaseReadyTask(runtime, coordinator, 'release-mismatch');
setTaskWorktreeRef(releaseMismatchCase.task.id, releaseMismatchCase.fixture.mainProjectPath);
const releaseMismatchSummary = coordinator.getReleasePackageReadiness({
  taskId: releaseMismatchCase.task.id,
});

assert.equal(releaseMismatchSummary.allowed, false);
assert.match(
  releaseMismatchSummary.reasons.join(' '),
  /task\.worktreeRef must match the current linked worktree root before release-package/i,
);
await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: releaseMismatchCase.task.id }),
  /task\.worktreeRef must match the current linked worktree root before release-package/i,
);

const releaseHappyCase = await createReleaseReadyTask(runtime, coordinator, 'release-happy');
setTaskWorktreeRef(releaseHappyCase.task.id, releaseHappyCase.fixture.linkedProjectPath);
const releaseHappySummary = coordinator.getReleasePackageReadiness({
  taskId: releaseHappyCase.task.id,
});
const releasePackage = await coordinator.runReleasePackage({ taskId: releaseHappyCase.task.id });

assert.equal(releaseHappySummary.allowed, true);
assert.equal(releasePackage.artifact.type, 'release-package');
assert.equal(releasePackage.run.summary.executionMode, 'release-package');
assert.equal(releasePackage.run.summary.pushExecuted, false);
assert.equal(releasePackage.run.summary.publishExecuted, false);
assert.equal(releasePackage.run.summary.externalReleaseExecuted, false);

const closeOutMainCase = await createCloseOutReadyTask(runtime, coordinator, 'close-main');
setProjectPath(closeOutMainCase.project.id, closeOutMainCase.fixture.mainProjectPath);
const closeOutMainSummary = coordinator.getCloseOutReadiness({
  taskId: closeOutMainCase.task.id,
});

assert.equal(closeOutMainSummary.allowed, false);
assert.match(closeOutMainSummary.reasons.join(' '), /main worktree is blocked before close-out/i);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: closeOutMainCase.task.id }),
  /main worktree is blocked before close-out/i,
);

const closeOutNonWorktreeCase = await createCloseOutReadyTask(runtime, coordinator, 'close-non-worktree');
setProjectPath(closeOutNonWorktreeCase.project.id, closeOutNonWorktreeCase.fixture.nonWorktreePath);
const closeOutNonWorktreeSummary = coordinator.getCloseOutReadiness({
  taskId: closeOutNonWorktreeCase.task.id,
});

assert.equal(closeOutNonWorktreeSummary.allowed, false);
assert.match(closeOutNonWorktreeSummary.reasons.join(' '), /project_path is not a git worktree/i);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: closeOutNonWorktreeCase.task.id }),
  /project_path is not a git worktree/i,
);

const closeOutMismatchCase = await createCloseOutReadyTask(runtime, coordinator, 'close-mismatch');
setTaskWorktreeRef(closeOutMismatchCase.task.id, closeOutMismatchCase.fixture.mainProjectPath);
const closeOutMismatchSummary = coordinator.getCloseOutReadiness({
  taskId: closeOutMismatchCase.task.id,
});

assert.equal(closeOutMismatchSummary.allowed, false);
assert.match(
  closeOutMismatchSummary.reasons.join(' '),
  /task\.worktreeRef must match the current linked worktree root before close-out/i,
);
await assert.rejects(
  () => coordinator.runCloseOut({ taskId: closeOutMismatchCase.task.id }),
  /task\.worktreeRef must match the current linked worktree root before close-out/i,
);

const closeOutHappyCase = await createCloseOutReadyTask(runtime, coordinator, 'close-happy');
setTaskWorktreeRef(closeOutHappyCase.task.id, closeOutHappyCase.fixture.linkedProjectPath);
const closeOutHappySummary = coordinator.getCloseOutReadiness({
  taskId: closeOutHappyCase.task.id,
});
const closeOut = await coordinator.runCloseOut({ taskId: closeOutHappyCase.task.id });
const closedTask = runtime.getTask(closeOutHappyCase.task.id);

assert.equal(closeOutHappySummary.allowed, true);
assert.equal(closeOut.artifact.type, 'close-out');
assert.equal(closeOut.run.summary.executionMode, 'close-out');
assert.equal(closeOut.run.summary.pushExecuted, false);
assert.equal(closeOut.run.summary.publishExecuted, false);
assert.equal(closeOut.run.summary.externalReleaseExecuted, false);
assert.equal(closedTask.lifecycleState, TASK_LIFECYCLE.DONE);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      release: {
        happyTaskId: releaseHappyCase.task.id,
        happyArtifactId: releasePackage.artifact.id,
      },
      closeOut: {
        happyTaskId: closeOutHappyCase.task.id,
        happyArtifactId: closeOut.artifact.id,
      },
    },
    null,
    2,
  ),
);
