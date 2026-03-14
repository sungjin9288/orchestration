import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION, RELEASE_ACTION } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-09');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createGitFixtureRepo(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-slice-09-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const projectPath = path.join(fixtureRoot, 'worktree');
  const branchName = `slice-09-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'slice-09']);
  runGit(mainProjectPath, ['config', 'user.email', 'slice-09@example.com']);

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
- keep the release-package scope anchored to the latest successful local commit bundle

## Risks
- none

## Verification Plan
- run reviewer against the anchored builder bundle

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture for release-package smoke
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
- synthetic live mutation bundle for release-package smoke
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
Prepare a release-package artifact from the latest successful local commit bundle.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- scripts/smoke-execution-slice-09.mjs
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- create a release-package artifact from the latest successful local commit bundle
- request a release-ready approval without push or publish

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
    prompt: `Approve the synthetic bundle ${label} for release-package smoke.`,
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

async function createCommitReadyTask(runtime, coordinator, label) {
  const projectPath = createGitFixtureRepo(label);
  const project = runtime.createProject({
    name: `release-package-${label}`,
    projectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Release package ${label} smoke`,
    intent: 'Prepare a release-package artifact from the latest successful local commit bundle.',
  });

  setScopedFile(projectPath, label);

  const reviewed = await createReviewedBundle(runtime, coordinator, task, label);
  const commitPackage = await coordinator.runCommitPackage({ taskId: task.id });

  return {
    commitPackage,
    project,
    projectPath,
    reviewed,
    task,
  };
}

async function createReleaseReadyTask(runtime, coordinator, label) {
  const readyTask = await createCommitReadyTask(runtime, coordinator, label);

  runtime.resolveDecisionInboxItem({
    itemId: readyTask.commitPackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve commit approval for ${label}.`,
  });

  const localCommit = await coordinator.runLocalCommit({ taskId: readyTask.task.id });

  return {
    ...readyTask,
    localCommit,
  };
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const missingLocalCommit = await createCommitReadyTask(runtime, coordinator, 'missing-local-commit');

await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: missingLocalCommit.task.id }),
  /latest successful local commit bundle is required/i,
);

const blockedCase = await createReleaseReadyTask(runtime, coordinator, 'blocked');

runtime.createDecisionInboxItem({
  taskId: blockedCase.task.id,
  title: 'Blocking release decision',
  prompt: 'Resolve this decision before release-package may proceed.',
  blocksTask: true,
});

await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: blockedCase.task.id }),
  /blocking decision items/i,
);

const pendingCase = await createReleaseReadyTask(runtime, coordinator, 'pending');
const pendingReleasePackage = await coordinator.runReleasePackage({ taskId: pendingCase.task.id });
const pendingReleaseArtifact = runtime.getArtifact(pendingReleasePackage.artifact.id);
const pendingReleaseApproval = runtime.getApproval(pendingReleasePackage.approval.id);

assert.equal(pendingReleasePackage.artifact.type, 'release-package');
assert.equal(pendingReleaseApproval.allowedNextAction, RELEASE_ACTION.RELEASE_READY);
assert.equal(pendingReleasePackage.run.summary.executionMode, 'release-package');
assert.equal(pendingReleasePackage.run.summary.pushExecuted, false);
assert.equal(pendingReleasePackage.run.summary.publishExecuted, false);
assert.equal(pendingReleasePackage.run.summary.externalReleaseExecuted, false);
assert.equal(pendingReleasePackage.run.summary.deliveryStance, 'local-demo-only');
assert.match(pendingReleaseArtifact.content, /^## Source Local Commit Bundle$/m);
assert.match(pendingReleaseArtifact.content, /^## Source Builder Bundle$/m);
assert.match(pendingReleaseArtifact.content, /^## Release Candidate$/m);
assert.match(pendingReleaseArtifact.content, /^## Human Gate$/m);
assert.match(pendingReleaseArtifact.content, /^## Execution Safety$/m);
assert.match(pendingReleaseArtifact.content, /push executed: no/);
assert.match(pendingReleaseArtifact.content, /publish executed: no/);
assert.match(pendingReleaseArtifact.content, /external release executed: no/);
assert.match(
  pendingReleaseApproval.title,
  new RegExp(`releasePackageArtifactId=${pendingReleasePackage.artifact.id}`),
);
assert.match(
  pendingReleaseApproval.prompt,
  new RegExp(`commitResultArtifactId: ${pendingCase.localCommit.artifact.id}`),
);

await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: pendingCase.task.id }),
  (error) => error.statusCode === 409 && /already pending/i.test(error.message),
);

const approvedCase = await createReleaseReadyTask(runtime, coordinator, 'approved');
const approvedReleasePackage = await coordinator.runReleasePackage({ taskId: approvedCase.task.id });

runtime.resolveDecisionInboxItem({
  itemId: approvedReleasePackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve release-ready for approved smoke.',
});

await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: approvedCase.task.id }),
  (error) => error.statusCode === 409 && /already approved/i.test(error.message),
);

const rejectedCase = await createReleaseReadyTask(runtime, coordinator, 'rejected');
const firstRejectedReleasePackage = await coordinator.runReleasePackage({ taskId: rejectedCase.task.id });

runtime.resolveDecisionInboxItem({
  itemId: firstRejectedReleasePackage.approval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject release-ready for retry smoke.',
});

const retriedReleasePackage = await coordinator.runReleasePackage({ taskId: rejectedCase.task.id });

assert.notEqual(retriedReleasePackage.approval.id, firstRejectedReleasePackage.approval.id);
assert.equal(retriedReleasePackage.artifact.id, firstRejectedReleasePackage.artifact.id);
assert.equal(retriedReleasePackage.run.summary.reusedReleasePackageArtifact, true);

const staleUpstreamCase = await createReleaseReadyTask(runtime, coordinator, 'stale-upstream');
const staleUpstreamReleasePackage = await coordinator.runReleasePackage({
  taskId: staleUpstreamCase.task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: staleUpstreamReleasePackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve stale-upstream release-ready before source changes.',
});

await createReviewedBundle(runtime, coordinator, staleUpstreamCase.task, 'stale-upstream-next');

const staleUpstreamSummary = coordinator.getReleasePackageReadiness({
  taskId: staleUpstreamCase.task.id,
});

assert.equal(staleUpstreamSummary.allowed, false);
assert.equal(staleUpstreamSummary.approvalStale, true);
assert.match(staleUpstreamSummary.reasons.join(' '), /stale/i);

await assert.rejects(
  () => coordinator.runReleasePackage({ taskId: staleUpstreamCase.task.id }),
  /stale/i,
);

const staleLocalCommitCase = await createReleaseReadyTask(runtime, coordinator, 'stale-local-commit');
const firstStaleLocalReleasePackage = await coordinator.runReleasePackage({
  taskId: staleLocalCommitCase.task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: firstStaleLocalReleasePackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve release-ready before the next local commit.',
});

setScopedFile(staleLocalCommitCase.projectPath, 'stale-local-commit-next');
const secondReviewedBundle = await createReviewedBundle(
  runtime,
  coordinator,
  staleLocalCommitCase.task,
  'stale-local-commit-next',
);
const secondCommitPackage = await coordinator.runCommitPackage({
  taskId: staleLocalCommitCase.task.id,
});

runtime.resolveDecisionInboxItem({
  itemId: secondCommitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve second commit approval for stale-local-commit smoke.',
});

const secondLocalCommit = await coordinator.runLocalCommit({
  taskId: staleLocalCommitCase.task.id,
});
const staleLocalCommitSummary = coordinator.getReleasePackageReadiness({
  taskId: staleLocalCommitCase.task.id,
});
const secondReleasePackage = await coordinator.runReleasePackage({
  taskId: staleLocalCommitCase.task.id,
});
const secondReleaseApproval = runtime.getApproval(secondReleasePackage.approval.id);

assert.equal(staleLocalCommitSummary.allowed, true);
assert.equal(staleLocalCommitSummary.approvalStale, true);
assert.equal(staleLocalCommitSummary.commitResultArtifactId, secondLocalCommit.artifact.id);
assert.notEqual(secondReleasePackage.artifact.id, firstStaleLocalReleasePackage.artifact.id);
assert.notEqual(secondReleasePackage.approval.id, firstStaleLocalReleasePackage.approval.id);
assert.equal(
  secondReleasePackage.run.summary.sourceCommitResultArtifactId,
  secondLocalCommit.artifact.id,
);
assert.equal(
  secondReleasePackage.run.summary.sourceCommitPackageArtifactId,
  secondCommitPackage.artifact.id,
);
assert.equal(
  secondReleasePackage.run.summary.sourceReviewerRunId,
  secondReviewedBundle.review.run.id,
);
assert.equal(
  secondReleasePackage.run.summary.sourceBuilderRunId,
  secondReviewedBundle.liveMutationBundle.runs.builder.id,
);
assert.equal(secondReleaseApproval.metadata.commitResultArtifactId, secondLocalCommit.artifact.id);
assert.equal(secondReleaseApproval.metadata.commitPackageArtifactId, secondCommitPackage.artifact.id);
assert.equal(secondReleaseApproval.metadata.deliveryStance, 'local-demo-only');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      pendingTaskId: pendingCase.task.id,
      approvedTaskId: approvedCase.task.id,
      rejectedTaskId: rejectedCase.task.id,
      staleUpstreamTaskId: staleUpstreamCase.task.id,
      staleLocalCommitTaskId: staleLocalCommitCase.task.id,
      latestReleasePackage: {
        taskId: staleLocalCommitCase.task.id,
        releasePackageArtifactId: secondReleasePackage.artifact.id,
        releaseApprovalId: secondReleasePackage.approval.id,
        commitResultArtifactId: secondLocalCommit.artifact.id,
        commitSha: secondLocalCommit.commitSha,
      },
    },
    null,
    2,
  ),
);
