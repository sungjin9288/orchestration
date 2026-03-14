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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-dev-loop-m2');

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createGitFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-dev-loop-m2-'));
  const builderPromptPath = path.join(projectPath, 'prompts', 'builder.md');

  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'dev-loop-m2']);
  runGit(projectPath, ['config', 'user.email', 'dev-loop-m2@example.com']);

  fs.mkdirSync(path.dirname(builderPromptPath), { recursive: true });
  fs.writeFileSync(
    builderPromptPath,
    '# Builder Prompt Contract\n\nM2 dev-loop smoke fixture.\n',
    'utf8',
  );

  runGit(projectPath, ['add', 'prompts/builder.md']);
  runGit(projectPath, ['commit', '-q', '-m', 'fixture:m2-dev-loop']);

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

const runtime = createRuntimeService({ runtimeRoot });
runtime.resetRuntime();

const fixtureProjectPath = createGitFixtureProject();

try {
  const coordinator = createExecutionCoordinator({
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
  });

  const project = runtime.createProject({
    name: 'dev-loop-m2-fixture',
    projectPath: fixtureProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: 'milestone-m2-consolidation dev loop smoke',
    intent:
      'Run planner through local commit on a clean temp repo and keep the path bounded to the approved live-mutation target.',
  });

  const planner = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: buildTaskRoutingOutcome(task),
  });
  const architect = await coordinator.runArchitect({ taskId: task.id });
  const taskBreaker = await coordinator.runTaskBreaker({ taskId: task.id });
  const preflight = await coordinator.runBuilderPreflight({ taskId: task.id });

  const liveMutationApproval = runtime.requestBuilderLiveMutationApproval({
    taskId: task.id,
  });

  runtime.resolveDecisionInboxItem({
    itemId: liveMutationApproval.inboxItemId,
    action: 'approved',
    note: 'Approve live mutation for the M2 dev-loop smoke.',
  });

  const liveMutation = await coordinator.runBuilderLiveMutation({ taskId: task.id });
  const reviewer = await coordinator.runReviewer({ taskId: task.id });
  const commitPackage = await coordinator.runCommitPackage({ taskId: task.id });

  runtime.resolveDecisionInboxItem({
    itemId: commitPackage.approval.inboxItemId,
    action: 'approved',
    note: 'Approve commit intent for the M2 dev-loop smoke.',
  });

  const localCommit = await coordinator.runLocalCommit({ taskId: task.id });
  const commitResultArtifact = runtime.getArtifact(localCommit.artifact.id);
  const changedFileContent = fs.readFileSync(
    path.join(fixtureProjectPath, 'prompts', 'builder.md'),
    'utf8',
  );
  const repoStatusAfterCommit = runGit(fixtureProjectPath, ['status', '--short']).trim();

  assert.equal(planner.run.summary.nextStage, 'architect');
  assert.equal(architect.run.summary.nextStage, 'task-breaker');
  assert.equal(taskBreaker.run.summary.nextStage, 'builder');
  assert.equal(preflight.run.summary.executionMode, 'preflight');
  assert.equal(liveMutation.run.summary.executionMode, 'live-mutation');
  assert.deepEqual(liveMutation.changedFiles, ['prompts/builder.md']);
  assert.equal(reviewer.run.summary.rawVerdict, 'pass');
  assert.equal(reviewer.run.summary.mappedReviewStatus, 'passed');
  assert.equal(commitPackage.run.summary.executionMode, 'commit-package');
  assert.equal(commitPackage.approval.allowedNextAction, 'commit-intent');
  assert.equal(localCommit.run.summary.executionMode, 'local-commit');
  assert.equal(localCommit.artifact.type, 'commit-result');
  assert.match(changedFileContent, /builder-live-mutation/);
  assert.equal(repoStatusAfterCommit, '');
  assert.match(commitResultArtifact.content, /^# Commit Result:/m);
  assert.match(commitResultArtifact.content, /- repo clean after commit: yes/);

  console.log(
    JSON.stringify(
      {
        ok: true,
        runtimeRoot,
        taskId: task.id,
        projectPath: fixtureProjectPath,
        plannerRunId: planner.run.id,
        architectRunId: architect.run.id,
        taskBreakerRunId: taskBreaker.run.id,
        preflightArtifactId: preflight.artifact.id,
        liveMutationRunId: liveMutation.run.id,
        reviewerRunId: reviewer.run.id,
        commitPackageArtifactId: commitPackage.artifact.id,
        commitResultArtifactId: localCommit.artifact.id,
        commitSha: localCommit.commitSha,
        committedFiles: localCommit.committedFiles,
      },
      null,
      2,
    ),
  );
} finally {
  fs.rmSync(fixtureProjectPath, { recursive: true, force: true });
}
