import assert from 'node:assert/strict';
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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-09');

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-09-'));
  const fixtureFiles = new Map([
    ['prompts/builder.md', '# Builder Prompt Contract\n\nUI slice 09 commit-package fixture.\n'],
    ['src/execution/execution-coordinator.js', "'use strict';\n\nexport const fixtureCoordinator = true;\n"],
    [
      'src/execution/providers/local-stub-adapter.js',
      "'use strict';\n\nexport const fixtureLocalStubAdapter = true;\n",
    ],
    ['src/runtime/runtime-service.js', "'use strict';\n\nexport const fixtureRuntimeService = true;\n"],
    ['scripts/smoke-execution-slice-05.mjs', "console.log('fixture smoke execution slice 05');\n"],
    ['scripts/serve-ui-slice-01.mjs', "console.log('fixture serve ui slice 01');\n"],
    ['ui/app.js', "'use strict';\n\nexport const fixtureUiApp = true;\n"],
  ]);

  for (const [relativePath, content] of fixtureFiles.entries()) {
    const filePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, content, 'utf8');
  }

  return projectPath;
}

function buildTaskRoutingOutcome(task) {
  const scopeStatement = (task.intent || task.title || '').trim();

  return {
    classification: task.latestRunId ? 'task continuation' : 'new task',
    decisionNote: '',
    missingContext: [],
    scopeStatement: scopeStatement || `Plan the next thin slice for ${task.id}.`,
  };
}

async function runThroughLiveMutation(runtime, coordinator, taskId) {
  const task = runtime.getTask(taskId);

  await coordinator.runPlanner({
    taskId,
    routingOutcome: buildTaskRoutingOutcome(task),
  });
  await coordinator.runArchitect({ taskId });
  await coordinator.runTaskBreaker({ taskId });
  await coordinator.runBuilderPreflight({ taskId });

  const approval = runtime.requestBuilderLiveMutationApproval({ taskId });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: 'approved',
    note: 'Approve builder live mutation for ui-slice-09 smoke.',
  });

  return coordinator.runBuilderLiveMutation({ taskId });
}

async function runThroughReviewerPass(runtime, coordinator, taskId) {
  await runThroughLiveMutation(runtime, coordinator, taskId);
  return coordinator.runReviewer({ taskId });
}

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();
const fixtureProjectPath = createFixtureProject();

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

try {
  assert.match(serveUiSource, /commitPackageReadinessSummaries/);
  assert.match(serveUiSource, /run-commit-package/);
  assert.match(appJsSource, /커밋 패키지 준비/);
  assert.match(appJsSource, /run-commit-package/);
  assert.match(appJsSource, /commitPackageReadinessSummaries/);
  assert.match(appJsSource, /parseCommitPackageArtifact/);
  assert.match(appJsSource, /renderCommitPackagePanel/);
  assert.match(appJsSource, /구조 요약이 없으면 원문으로 확인합니다\./);
  assert.match(appJsSource, /approval\?\.allowedNextAction === 'commit-intent'/);
  assert.match(appJsSource, /state\.surface = currentSurface;/);
  assert.match(
    appJsSource,
    /state\.loading \|\| state\.mutating \|\| !summary\?\.allowed/,
  );

  const project = runtime.createProject({
    name: 'orchestration',
    projectPath: fixtureProjectPath,
  });

  const task = runtime.createTask({
    projectId: project.id,
    title: 'ui-slice-09 commit package smoke',
    intent: 'Review the latest builder live mutation bundle and pass it.',
  });

  const firstReview = await runThroughReviewerPass(runtime, coordinator, task.id);
  const readinessBefore = coordinator.getCommitPackageReadiness({ taskId: task.id });

  assert.equal(firstReview.artifact.type, 'review');
  assert.equal(readinessBefore.allowed, true);
  assert.equal(readinessBefore.latestApprovalId, null);
  assert.equal(readinessBefore.latestApprovalStatus, null);
  assert.equal(readinessBefore.approvalStale, false);

  const firstCommitPackage = await coordinator.runCommitPackage({ taskId: task.id });
  const firstCommitArtifact = runtime.getArtifact(firstCommitPackage.artifact.id);
  const firstCommitApproval = runtime.getApproval(firstCommitPackage.approval.id);
  const readinessAfterFirst = coordinator.getCommitPackageReadiness({ taskId: task.id });

  assert.equal(firstCommitArtifact.type, 'commit-package');
  assert.equal(firstCommitApproval.allowedNextAction, 'commit-intent');
  assert.equal(firstCommitApproval.metadata.commitPackageArtifactId, firstCommitArtifact.id);
  assert.equal(firstCommitApproval.metadata.sourceReviewerRunId, firstReview.run.id);
  assert.match(firstCommitArtifact.content, /^## Source Reviewer Bundle$/m);
  assert.match(firstCommitArtifact.content, /^## Source Builder Bundle$/m);
  assert.match(firstCommitArtifact.content, /^## Execution Safety$/m);
  assert.match(firstCommitArtifact.content, /- git commit executed: no/);
  assert.equal(readinessAfterFirst.allowed, false);
  assert.equal(readinessAfterFirst.latestApprovalStatus, 'pending');
  assert.equal(readinessAfterFirst.approvalStale, false);
  assert.equal(readinessAfterFirst.currentCommitPackageArtifactId, firstCommitArtifact.id);

  runtime.resolveDecisionInboxItem({
    itemId: firstCommitApproval.inboxItemId,
    action: 'rejected',
    note: 'Reject the first commit approval in ui-slice-09 smoke.',
  });

  const readinessAfterReject = coordinator.getCommitPackageReadiness({ taskId: task.id });

  assert.equal(readinessAfterReject.allowed, true);
  assert.equal(readinessAfterReject.latestApprovalStatus, 'rejected');
  assert.equal(readinessAfterReject.currentCommitPackageArtifactId, firstCommitArtifact.id);

  const retryCommitPackage = await coordinator.runCommitPackage({ taskId: task.id });
  const retryCommitApproval = runtime.getApproval(retryCommitPackage.approval.id);

  assert.equal(retryCommitPackage.artifact.id, firstCommitArtifact.id);
  assert.notEqual(retryCommitApproval.id, firstCommitApproval.id);

  runtime.resolveDecisionInboxItem({
    itemId: retryCommitApproval.inboxItemId,
    action: 'approved',
    note: 'Approve the second commit approval in ui-slice-09 smoke.',
  });

  const secondReview = await runThroughReviewerPass(runtime, coordinator, task.id);
  const staleReadiness = coordinator.getCommitPackageReadiness({ taskId: task.id });

  assert.equal(secondReview.artifact.type, 'review');
  assert.equal(staleReadiness.allowed, true);
  assert.equal(staleReadiness.latestApprovalStatus, 'approved');
  assert.equal(staleReadiness.approvalStale, true);
  assert.equal(staleReadiness.currentCommitPackageArtifactId, null);
  assert.equal(staleReadiness.latestCommitPackageArtifactId, firstCommitArtifact.id);

  const staleCommitPackage = await coordinator.runCommitPackage({ taskId: task.id });
  const staleCommitApproval = runtime.getApproval(staleCommitPackage.approval.id);

  assert.notEqual(staleCommitPackage.artifact.id, firstCommitArtifact.id);
  assert.equal(
    staleCommitApproval.metadata.commitPackageArtifactId,
    staleCommitPackage.artifact.id,
  );
  assert.equal(
    staleCommitApproval.metadata.sourceReviewerRunId,
    secondReview.run.id,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        runtimeRoot,
        taskId: task.id,
        firstReviewRunId: firstReview.run.id,
        firstCommitArtifactId: firstCommitArtifact.id,
        retryCommitApprovalId: retryCommitApproval.id,
        secondReviewRunId: secondReview.run.id,
        staleCommitArtifactId: staleCommitPackage.artifact.id,
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(fixtureProjectPath, { recursive: true, force: true });
}
