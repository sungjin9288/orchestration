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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-11');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-11-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const branchName = `ui-slice-11-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'ui-slice-11']);
  runGit(mainProjectPath, ['config', 'user.email', 'ui-slice-11@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(mainProjectPath, ['add', 'scoped.txt', 'extra.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', branchName, linkedProjectPath]);

  return {
    linkedProjectPath: fs.realpathSync(linkedProjectPath),
    mainProjectPath: fs.realpathSync(mainProjectPath),
  };
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
- synthetic preflight fixture for ui-slice-11 smoke
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

## File Updates
### scoped.txt
\`\`\`base64
${Buffer.from('scoped change synthetic\n', 'utf8').toString('base64')}
\`\`\`

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for ui-slice-11 smoke
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
- scripts/serve-ui-slice-01.mjs
- ui/app.js
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
    prompt: `Approve the synthetic bundle ${label} for ui-slice-11 smoke.`,
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
    reviewInputs: {
      approval,
      builderRun: completedBuilderRun,
      artifacts: {
        architecture: architecture.artifact,
        breakdown: breakdown.artifact,
        changeSummary,
        diff,
        patch,
        plan: plan.artifact,
        preflight: preflight.artifact,
      },
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
    name: `ui-slice-11-${label}`,
    projectPath: fixture.linkedProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Release package ${label} smoke`,
    intent: 'Prepare a release-package artifact from the latest successful local commit bundle.',
  });

  runtime.setTaskWorktreeRef({
    taskId: task.id,
    worktreeRef: fixture.linkedProjectPath,
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
    projectPath: fixture.linkedProjectPath,
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

assert.match(serveUiSource, /releasePackageReadinessSummaries/);
assert.match(serveUiSource, /run-release-package/);
assert.match(appJsSource, /릴리스 패키지 준비/);
assert.match(appJsSource, /parseChangeSummaryArtifact/);
assert.match(appJsSource, /parseChangeSummaryFileUpdates/);
assert.match(appJsSource, /renderStructuredChangeSummary/);
assert.match(appJsSource, /parseReleasePackageArtifact/);
assert.match(appJsSource, /renderStructuredReleasePackage/);
assert.match(appJsSource, /selectedArtifactMeta\.type === 'change-summary'/);
assert.match(appJsSource, /selectedArtifactMeta\.type === 'release-package'/);
assert.match(appJsSource, /allowedNextAction === 'release-ready'/);
assert.match(appJsSource, /currentSurface === 'taskboard' \|\| currentSurface === 'artifacts'/);
assert.match(appJsSource, /Preview redacts stored repo content inside File Updates\./);
assert.match(appJsSource, /Stored raw content below remains the source of truth\./);
assert.doesNotMatch(appJsSource, /Prepare Release Package/);

const happyCase = await createReleaseReadyTask(runtime, coordinator, 'happy');
const beforeSummary = coordinator.getReleasePackageReadiness({
  taskId: happyCase.task.id,
});

assert.equal(beforeSummary.allowed, true);
assert.equal(beforeSummary.latestApprovalDisplayStatus, 'none');
assert.equal(beforeSummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(beforeSummary.commitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(beforeSummary.deliveryStance, 'local-demo-only');

const releasePackage = await coordinator.runReleasePackage({ taskId: happyCase.task.id });
const releaseArtifact = runtime.getArtifact(releasePackage.artifact.id);
const pendingSummary = coordinator.getReleasePackageReadiness({
  taskId: happyCase.task.id,
});

assert.equal(releasePackage.artifact.type, 'release-package');
assert.equal(releasePackage.run.summary.executionMode, 'release-package');
assert.equal(pendingSummary.allowed, false);
assert.equal(pendingSummary.latestApprovalDisplayStatus, 'pending');
assert.equal(pendingSummary.currentReleasePackageArtifactId, releasePackage.artifact.id);
assert.equal(pendingSummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(pendingSummary.commitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(pendingSummary.deliveryStance, 'local-demo-only');
assert.match(releaseArtifact.content, /^## Source Local Commit Bundle$/m);
assert.match(releaseArtifact.content, /^## Source Builder Bundle$/m);
assert.match(releaseArtifact.content, /^## Release Candidate$/m);
assert.match(releaseArtifact.content, /^## Human Gate$/m);
assert.match(releaseArtifact.content, /^## Execution Safety$/m);
assert.match(releaseArtifact.content, /push executed: no/);
assert.match(releaseArtifact.content, /publish executed: no/);
assert.match(releaseArtifact.content, /external release executed: no/);
assert.equal(releasePackage.approval.metadata.releasePackageArtifactId, releasePackage.artifact.id);
assert.equal(releasePackage.approval.metadata.commitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(releasePackage.approval.metadata.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(
  releasePackage.approval.metadata.sourceReviewerRunId,
  happyCase.reviewed.review.run.id,
);
assert.equal(
  releasePackage.approval.metadata.sourceBuilderRunId,
  happyCase.reviewed.liveMutationBundle.reviewInputs.builderRun.id,
);
assert.equal(
  releasePackage.approval.metadata.targetPreflightArtifactId,
  happyCase.reviewed.liveMutationBundle.reviewInputs.artifacts.preflight.id,
);

runtime.resolveDecisionInboxItem({
  itemId: releasePackage.approval.inboxItemId,
  action: APPROVAL_STATUS.APPROVED,
  note: 'Approve release-ready for ui-slice-11 smoke.',
});

const approvedSummary = coordinator.getReleasePackageReadiness({
  taskId: happyCase.task.id,
});

assert.equal(approvedSummary.allowed, false);
assert.equal(approvedSummary.latestApprovalDisplayStatus, 'approved');
assert.equal(approvedSummary.currentReleasePackageArtifactId, releasePackage.artifact.id);
assert.equal(approvedSummary.latestApprovalId, releasePackage.approval.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: happyCase.task.id,
      commitPackageArtifactId: happyCase.commitPackage.artifact.id,
      commitResultArtifactId: happyCase.localCommit.artifact.id,
      releasePackageArtifactId: releasePackage.artifact.id,
      releaseApprovalId: releasePackage.approval.id,
      beforeSummary,
      pendingSummary,
      approvedSummary,
    },
    null,
    2,
  ),
);
