import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-24');
const port = 4334;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createGitFixtureRepo(label) {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-24-${label}-`));

  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'ui-slice-24']);
  runGit(projectPath, ['config', 'user.email', 'ui-slice-24@example.com']);

  fs.mkdirSync(path.join(projectPath, 'prompts'), { recursive: true });
  fs.writeFileSync(path.join(projectPath, 'prompts', 'builder.md'), '# Builder Prompt Contract\n\nUI slice 24 fixture.\n', 'utf8');
  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(projectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(projectPath, ['add', 'prompts/builder.md', 'scoped.txt', 'extra.txt']);
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
- keep the commit-package scope limited to the latest passing reviewer bundle

## Risks
- none

## Verification Plan
- run reviewer against the anchored builder bundle

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture for ui-slice-24 smoke
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
- synthetic live mutation bundle for ui-slice-24 smoke
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
Prepare a commit-package artifact from the latest successful terminal reviewer pass bundle.
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
- create a commit-package artifact from the latest successful terminal reviewer pass bundle
- request a commit approval without running local commit

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
    prompt: `Approve the synthetic bundle ${label} for ui-slice-24 smoke.`,
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
      inputArtifactIds: [
        plan.artifact.id,
        architecture.artifact.id,
        breakdown.artifact.id,
        preflight.artifact.id,
      ],
      inputRunIds: [plan.run.id, architecture.run.id, breakdown.run.id, preflight.run.id],
      preflightArtifactId: preflight.artifact.id,
      preflightRunId: preflight.run.id,
      targetPreflightArtifactId: preflight.artifact.id,
      targetPreflightRunId: preflight.run.id,
    },
  });

  return {
    approval,
    builderRun: completedBuilderRun,
    artifacts: {
      changeSummary,
      diff,
      patch,
      preflight: preflight.artifact,
    },
  };
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function postJson(pathname, body = {}) {
  return fetchJson(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-24 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();
  const fixtureProjectPath = createGitFixtureRepo('commit-package');

  const coordinator = createExecutionCoordinator({
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
  });

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stderr = '';

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    runtime.createProject({
      name: 'orchestration',
      projectPath: fixtureProjectPath,
    });

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep commit-package preparation bounded to the latest passing reviewer bundle only.',
      goal: 'Verify that the primary execution surface can move from a passing reviewer result into commit-package preparation.',
      title: 'Primary commit-package CTA smoke',
    });
    const mission = missionPayload.mission;
    const approveCouncilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );
    const taskId = approveCouncilPayload.task.id;
    const task = runtime.getTask(taskId);

    createLiveMutationBundle(runtime, task, 'primary-commit-package');
    const review = await coordinator.runReviewer({ taskId });

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /The latest passing reviewer bundle is ready\./);
    assert.match(appJs, /Open Execution To Prepare Commit Package/);
    assert.match(appJs, /Primary commit-package CTA lives on Execution after the latest passing reviewer bundle is available\./);

    const readinessBefore = coordinator.getCommitPackageReadiness({ taskId });

    assert.equal(review.artifact.type, 'review');
    assert.equal(readinessBefore.allowed, true);
    assert.equal(readinessBefore.latestApprovalStatus, null);

    const commitPackagePayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-commit-package`,
    );

    const approval = commitPackagePayload.snapshot.approvals[commitPackagePayload.mutation.approvalId];
    const inboxItem =
      commitPackagePayload.snapshot.decisionInboxItems[commitPackagePayload.mutation.inboxItemId];
    const readinessAfter =
      commitPackagePayload.derived.commitPackageReadinessSummaries[taskId];

    assert.equal(commitPackagePayload.mutation.kind, 'run-commit-package');
    assert.equal(commitPackagePayload.artifactDetail.type, 'commit-package');
    assert.equal(approval.allowedNextAction, 'commit-intent');
    assert.equal(approval.status, 'pending');
    assert.equal(inboxItem.kind, 'approval');
    assert.equal(inboxItem.status, 'pending');
    assert.equal(
      approval.metadata.commitPackageArtifactId,
      commitPackagePayload.artifactDetail.id,
    );
    assert.equal(
      approval.metadata.sourceReviewerRunId,
      review.run.id,
    );
    assert.equal(readinessAfter.allowed, false);
    assert.equal(readinessAfter.latestApprovalStatus, 'pending');
    assert.equal(readinessAfter.currentCommitPackageArtifactId, commitPackagePayload.artifactDetail.id);
    assert.match(commitPackagePayload.artifactDetail.content, /^## Source Reviewer Bundle$/m);
    assert.match(commitPackagePayload.artifactDetail.content, /^## Source Builder Bundle$/m);
    assert.match(commitPackagePayload.artifactDetail.content, /^## Execution Safety$/m);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          commitPackage: {
            taskId,
            reviewerRunId: review.run.id,
            commitPackageArtifactId: commitPackagePayload.artifactDetail.id,
            approvalId: approval.id,
            inboxItemId: inboxItem.id,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);
    fs.rmSync(fixtureProjectPath, { recursive: true, force: true });

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
