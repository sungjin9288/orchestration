import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  RELEASE_ACTION,
  TASK_LIFECYCLE,
} = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-12');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-12-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const branchName = `ui-slice-12-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'ui-slice-12']);
  runGit(mainProjectPath, ['config', 'user.email', 'ui-slice-12@example.com']);

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
- synthetic preflight fixture for ui-slice-12 smoke
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
- synthetic live mutation bundle for ui-slice-12 smoke
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
Add the close-out shell wiring for the latest approved release-package bundle.
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
    prompt: `Approve the synthetic bundle ${label} for ui-slice-12 smoke.`,
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
    name: `ui-slice-12-${label}`,
    projectPath: fixture.linkedProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `Close out ${label} smoke`,
    intent: 'Close the task from the latest approved release-package bundle without pushing or publishing.',
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
  const releasePackage = await coordinator.runReleasePackage({ taskId: task.id });

  runtime.resolveDecisionInboxItem({
    itemId: releasePackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve ${RELEASE_ACTION.RELEASE_READY} for ${label}.`,
  });

  return {
    commitPackage,
    fixture,
    localCommit,
    project,
    projectPath: fixture.linkedProjectPath,
    releasePackage,
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

assert.match(serveUiSource, /closeOutReadinessSummaries/);
assert.match(serveUiSource, /run-close-out/);
assert.match(appJsSource, /closeOutReadinessSummaries/);
assert.match(appJsSource, /function getCloseOutAvailability/);
assert.match(appJsSource, /function parseCloseOutArtifact/);
assert.match(appJsSource, /function renderStructuredCloseOut/);
assert.match(appJsSource, /data-action="run-close-out"/);
assert.match(appJsSource, /승인된 종료 정리 이어가기/);
assert.match(appJsSource, /태스크 상세 종료 정리 가드 열기/);
assert.match(
  appJsSource,
  /종료 정리 후속 처리에서 탐색 전용으로 남습니다\. 승인된 종료 정리 이어가기는 태스크 상세에서 실행합니다\./,
);
assert.match(appJsSource, /selectedArtifactMeta\.type === 'close-out'/);
assert.match(appJsSource, /function resolvePostMutationSurface/);
assert.match(appJsSource, /item\.kind === 'decision'/);
assert.doesNotMatch(appJsSource, /Resume Approved Close Out/);
assert.doesNotMatch(appJsSource, /Open Task Detail Close-Out Guard/);

const happyCase = await createReleaseReadyTask(runtime, coordinator, 'happy');
const readySummary = coordinator.getCloseOutReadiness({
  taskId: happyCase.task.id,
});
const inboxCountBefore = runtime.listDecisionInboxItems({
  taskId: happyCase.task.id,
}).length;

assert.equal(runtime.getTask(happyCase.task.id).lifecycleState, TASK_LIFECYCLE.REVIEW);
assert.equal(readySummary.allowed, true);
assert.equal(readySummary.currentReleasePackageArtifactId, happyCase.releasePackage.artifact.id);
assert.equal(readySummary.commitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(readySummary.commitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(readySummary.latestApprovedReleaseApprovalId, happyCase.releasePackage.approval.id);
assert.equal(readySummary.repoClean, true);

const closeOut = await coordinator.runCloseOut({
  taskId: happyCase.task.id,
});
const closeOutArtifact = runtime.getArtifact(closeOut.artifact.id);
const afterSummary = coordinator.getCloseOutReadiness({
  taskId: happyCase.task.id,
});
const inboxCountAfter = runtime.listDecisionInboxItems({
  taskId: happyCase.task.id,
}).length;
const closedTask = runtime.getTask(happyCase.task.id);

assert.equal(closeOut.artifact.type, 'close-out');
assert.equal(closeOut.run.summary.executionMode, 'close-out');
assert.equal(closeOut.run.summary.lifecycleTransition, 'Review -> Done');
assert.equal(closeOut.run.summary.sourceReleasePackageArtifactId, happyCase.releasePackage.artifact.id);
assert.equal(closeOut.run.summary.sourceCommitResultArtifactId, happyCase.localCommit.artifact.id);
assert.equal(closeOut.run.summary.sourceCommitPackageArtifactId, happyCase.commitPackage.artifact.id);
assert.equal(closeOut.run.summary.sourceReviewerRunId, happyCase.reviewed.review.run.id);
assert.equal(
  closeOut.run.summary.sourceBuilderRunId,
  happyCase.reviewed.liveMutationBundle.reviewInputs.builderRun.id,
);
assert.equal(closeOut.run.summary.pushExecuted, false);
assert.equal(closeOut.run.summary.publishExecuted, false);
assert.equal(closeOut.run.summary.externalReleaseExecuted, false);
assert.equal(closedTask.lifecycleState, TASK_LIFECYCLE.DONE);
assert.equal(inboxCountAfter, inboxCountBefore);
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
  new RegExp(`source builder run: ${happyCase.reviewed.liveMutationBundle.reviewInputs.builderRun.id}`),
);
assert.match(closeOutArtifact.content, /repo clean before close-out: yes/);
assert.match(closeOutArtifact.content, /push executed: no/);
assert.match(closeOutArtifact.content, /publish executed: no/);
assert.match(closeOutArtifact.content, /external release executed: no/);
assert.equal(afterSummary.allowed, false);
assert.equal(afterSummary.conflict, true);
assert.equal(afterSummary.existingCloseOutArtifactId, closeOut.artifact.id);
assert.equal(afterSummary.existingCloseOutRunId, closeOut.run.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      taskId: happyCase.task.id,
      releasePackageArtifactId: happyCase.releasePackage.artifact.id,
      closeOutArtifactId: closeOut.artifact.id,
      closeOutRunId: closeOut.run.id,
      readySummary,
      afterSummary,
    },
    null,
    2,
  ),
);
