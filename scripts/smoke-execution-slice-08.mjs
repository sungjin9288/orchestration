import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, BUILDER_ACTION } = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-execution-slice-08');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parseGitPathLines(output) {
  return String(output || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function createGitFixtureRepo(label) {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-slice-08-${label}-`));

  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'slice-08']);
  runGit(projectPath, ['config', 'user.email', 'slice-08@example.com']);

  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(projectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(projectPath, ['add', 'scoped.txt', 'extra.txt']);
  runGit(projectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return projectPath;
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
- keep the local commit scope limited to the reviewed file

## Risks
- none

## Verification Plan
- run reviewer against the anchored builder bundle

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture for local commit smoke
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
- synthetic live mutation bundle for local commit smoke
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
Prepare local commit evidence from the latest successful terminal reviewer pass bundle.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- src/execution/execution-coordinator.js
- scripts/smoke-execution-slice-08.mjs
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- create a commit-package artifact from the latest successful terminal reviewer pass bundle
- execute a limited local git commit after explicit approval

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
    prompt: `Approve the synthetic bundle ${label} for local commit smoke.`,
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

async function createCommitReadyTask(runtime, coordinator, label) {
  const projectPath = createGitFixtureRepo(label);
  const project = runtime.createProject({
    name: `local-commit-${label}`,
    projectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Local commit ${label} smoke`,
    intent: 'Execute a limited local git commit from the latest valid commit-package and approval.',
  });

  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), `scoped change ${label}\n`, 'utf8');

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

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const coordinator = createExecutionCoordinator({
  providerAdapter: createLocalStubProviderAdapter(),
  repoRoot,
  runtimeService: runtime,
});

const pendingCase = await createCommitReadyTask(runtime, coordinator, 'pending');

await assert.rejects(
  () => coordinator.runLocalCommit({ taskId: pendingCase.task.id }),
  /approval is unresolved|pending/i,
);

const rejectedCase = await createCommitReadyTask(runtime, coordinator, 'rejected');

runtime.resolveDecisionInboxItem({
  itemId: rejectedCase.commitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.REJECTED,
  note: 'Reject commit approval for rejected smoke.',
});

await assert.rejects(
  () => coordinator.runLocalCommit({ taskId: rejectedCase.task.id }),
  /rejected/i,
);

const staleCase = await createCommitReadyTask(runtime, coordinator, 'stale');

runtime.resolveDecisionInboxItem({
  itemId: staleCase.commitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve commit approval for stale smoke.',
});

createArtifactRun(runtime, staleCase.task.id, {
  role: 'builder',
  type: 'preflight',
  content: buildPreflightContent('stale newer preflight'),
  summary: {
    executionMode: 'preflight',
    mutationAllowed: false,
  },
});

await assert.rejects(
  () => coordinator.runLocalCommit({ taskId: staleCase.task.id }),
  /stale/i,
);

const outsideScopeCase = await createCommitReadyTask(runtime, coordinator, 'outside-scope');

runtime.resolveDecisionInboxItem({
  itemId: outsideScopeCase.commitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve commit approval for exact-match smoke.',
});

fs.writeFileSync(path.join(outsideScopeCase.projectPath, 'outside.txt'), 'untracked outside scope\n', 'utf8');

await assert.rejects(
  () => coordinator.runLocalCommit({ taskId: outsideScopeCase.task.id }),
  /exactly match commit-package scope/i,
);

const happyCase = await createCommitReadyTask(runtime, coordinator, 'happy');

runtime.resolveDecisionInboxItem({
  itemId: happyCase.commitPackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve commit approval for happy smoke.',
});

const commitPackageArtifact = runtime.getArtifact(happyCase.commitPackage.artifact.id);
const localCommit = await coordinator.runLocalCommit({ taskId: happyCase.task.id });
const commitResultArtifact = runtime.getArtifact(localCommit.artifact.id);
const committedFiles = parseGitPathLines(
  runGit(happyCase.projectPath, ['diff-tree', '--no-commit-id', '--name-only', '-r', localCommit.commitSha]),
);
const repoStatusAfterCommit = runGit(happyCase.projectPath, ['status', '--short']).trim();

assert.match(commitPackageArtifact.content, /^## Commit Message$/m);
assert.equal(localCommit.run.summary.executionMode, 'local-commit');
assert.equal(localCommit.run.summary.gitCommitExecuted, true);
assert.equal(localCommit.run.summary.pushExecuted, false);
assert.equal(localCommit.run.summary.mergeExecuted, false);
assert.equal(localCommit.run.summary.releaseExecuted, false);
assert.deepEqual(localCommit.committedFiles, ['scoped.txt']);
assert.deepEqual(committedFiles, ['scoped.txt']);
assert.equal(repoStatusAfterCommit, '');
assert.match(commitResultArtifact.content, /^# Commit Result:/m);
assert.match(commitResultArtifact.content, new RegExp(`commit sha: ${localCommit.commitSha}`));
assert.match(
  commitResultArtifact.content,
  new RegExp(`source commit-package artifact: ${happyCase.commitPackage.artifact.id}`),
);
assert.match(
  commitResultArtifact.content,
  new RegExp(`source reviewer run: ${happyCase.reviewed.review.run.id}`),
);
assert.match(commitResultArtifact.content, /push executed: no/);
assert.match(commitResultArtifact.content, /merge executed: no/);
assert.match(commitResultArtifact.content, /release executed: no/);
assert.equal(localCommit.run.summary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(localCommit.run.summary.sourceReviewerRunId, happyCase.reviewed.review.run.id);
assert.equal(
  localCommit.run.summary.sourceBuilderRunId,
  happyCase.reviewed.liveMutationBundle.runs.builder.id,
);

await assert.rejects(
  () => coordinator.runLocalCommit({ taskId: happyCase.task.id }),
  (error) => error.statusCode === 409 && /already executed/i.test(error.message),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      pendingTaskId: pendingCase.task.id,
      rejectedTaskId: rejectedCase.task.id,
      staleTaskId: staleCase.task.id,
      outsideScopeTaskId: outsideScopeCase.task.id,
      happy: {
        taskId: happyCase.task.id,
        commitPackageArtifactId: happyCase.commitPackage.artifact.id,
        commitResultArtifactId: localCommit.artifact.id,
        commitSha: localCommit.commitSha,
        committedFiles,
      },
    },
    null,
    2,
  ),
);
