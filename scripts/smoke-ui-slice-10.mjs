import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-10');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createGitFixtureRepo(label) {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-10-${label}-`));

  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'ui-slice-10']);
  runGit(projectPath, ['config', 'user.email', 'ui-slice-10@example.com']);

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
- synthetic preflight fixture for ui-slice-10 smoke
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
- synthetic live mutation bundle for ui-slice-10 smoke
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
- ui/app.js
- scripts/serve-ui-slice-01.mjs
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
    allowedNextAction: 'builder-live-mutation',
    targetArtifactId: preflight.artifact.id,
    targetRunId: preflight.run.id,
    title: `Approval required: synthetic builder live mutation ${label}`,
    prompt: `Approve the synthetic bundle ${label} for ui-slice-10 smoke.`,
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
    name: `ui-slice-10-${label}`,
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

const serveUiSource = fs.readFileSync(
  path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
  'utf8',
);
const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');

assert.match(serveUiSource, /commitExecutionReadinessSummaries/);
assert.match(serveUiSource, /run-local-commit/);
assert.match(appJsSource, /Run Local Commit/);
assert.match(appJsSource, /commitExecutionReadinessSummaries/);
assert.match(appJsSource, /parseCommitResultArtifact/);
assert.match(appJsSource, /renderStructuredCommitResult/);
assert.match(appJsSource, /selectedArtifactMeta\.type === 'commit-result'/);
assert.match(appJsSource, /data-action="run-local-commit"/);
assert.match(appJsSource, /state\.surface = 'artifacts';/);

const happyCase = await createCommitReadyTask(runtime, coordinator, 'happy');

const pendingSummary = coordinator.getCommitExecutionReadiness({
  taskId: happyCase.task.id,
});

assert.equal(pendingSummary.allowed, false);
assert.equal(pendingSummary.latestApprovalStatus, 'pending');
assert.equal(pendingSummary.latestApprovalDisplayStatus, 'pending');
assert.equal(pendingSummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(pendingSummary.changedFileCount, 1);
assert.equal(pendingSummary.commitMessagePresent, true);

runtime.resolveDecisionInboxItem({
  itemId: happyCase.commitPackage.approval.inboxItemId,
  action: 'approved',
  note: 'Approve commit approval for ui-slice-10 smoke.',
});

const readySummary = coordinator.getCommitExecutionReadiness({
  taskId: happyCase.task.id,
});

assert.equal(readySummary.allowed, true);
assert.equal(readySummary.latestApprovalStatus, 'approved');
assert.equal(readySummary.latestApprovalDisplayStatus, 'approved');
assert.equal(readySummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(readySummary.sourceReviewerRunId, happyCase.reviewed.review.run.id);
assert.equal(readySummary.sourceBuilderRunId, happyCase.reviewed.liveMutationBundle.runs.builder.id);

const localCommit = await coordinator.runLocalCommit({ taskId: happyCase.task.id });
const commitResultArtifact = runtime.getArtifact(localCommit.artifact.id);
const afterSummary = coordinator.getCommitExecutionReadiness({
  taskId: happyCase.task.id,
});

assert.equal(localCommit.artifact.type, 'commit-result');
assert.equal(localCommit.run.summary.executionMode, 'local-commit');
assert.equal(localCommit.run.summary.commitResultArtifactId, localCommit.artifact.id);
assert.equal(afterSummary.allowed, false);
assert.equal(afterSummary.conflict, true);
assert.equal(afterSummary.existingCommitResultArtifactId, localCommit.artifact.id);
assert.equal(afterSummary.existingLocalCommitRunId, localCommit.run.id);
assert.match(commitResultArtifact.content, /^## Source Commit Package$/m);
assert.match(commitResultArtifact.content, /^## Commit$/m);
assert.match(commitResultArtifact.content, /^## Validation$/m);
assert.match(commitResultArtifact.content, /^## Safety$/m);
assert.match(commitResultArtifact.content, new RegExp(`commit sha: ${localCommit.commitSha}`));
assert.match(
  commitResultArtifact.content,
  new RegExp(`source commit-package artifact: ${happyCase.commitPackage.artifact.id}`),
);
assert.match(commitResultArtifact.content, /push executed: no/);
assert.match(commitResultArtifact.content, /merge executed: no/);
assert.match(commitResultArtifact.content, /release executed: no/);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: happyCase.task.id,
      commitPackageArtifactId: happyCase.commitPackage.artifact.id,
      commitResultArtifactId: localCommit.artifact.id,
      commitSha: localCommit.commitSha,
      readySummary,
      afterSummary,
    },
    null,
    2,
  ),
);
