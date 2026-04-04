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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-27');
const port = 4337;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-27-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const branchName = `ui-slice-27-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'ui-slice-27']);
  runGit(mainProjectPath, ['config', 'user.email', 'ui-slice-27@example.com']);

  fs.mkdirSync(path.join(mainProjectPath, 'prompts'), { recursive: true });
  fs.writeFileSync(
    path.join(mainProjectPath, 'prompts', 'builder.md'),
    '# Builder Prompt Contract\n\nUI slice 27 fixture.\n',
    'utf8',
  );
  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(mainProjectPath, ['add', 'prompts/builder.md', 'scoped.txt', 'extra.txt']);
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
- synthetic preflight fixture for ui-slice-27 smoke
`;
}

function buildChangeSummaryContent(preflightArtifactId, approvalId, label) {
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
${Buffer.from(`scoped change ${label}\n`, 'utf8').toString('base64')}
\`\`\`

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for ui-slice-27 smoke
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
    allowedNextAction: 'builder-live-mutation',
    targetArtifactId: preflight.artifact.id,
    targetRunId: preflight.run.id,
    title: `Approval required: synthetic builder live mutation ${label}`,
    prompt: `Approve the synthetic bundle ${label} for ui-slice-27 smoke.`,
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
    content: buildChangeSummaryContent(preflight.artifact.id, approval.id, label),
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
  const review = await coordinator.runReviewer({ taskId: task.id });

  return {
    liveMutationBundle,
    review,
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

  throw new Error('Timed out waiting for ui-slice-27 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();
  const fixture = createLinkedWorktreeFixture('release-package');

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
      projectPath: fixture.linkedProjectPath,
    });

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints:
        'Keep release-package preparation bounded to the latest successful local commit bundle only.',
      goal:
        'Verify that the primary execution surface can move from a successful local commit into release-package preparation.',
      title: 'Primary release-package CTA smoke',
    });
    const mission = missionPayload.mission;
    const approveCouncilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );
    const taskId = approveCouncilPayload.task.id;
    const task = runtime.getTask(taskId);
    const label = 'primary-release-package';

    runtime.setTaskWorktreeRef({
      taskId,
      worktreeRef: fixture.linkedProjectPath,
    });
    setScopedFile(fixture.linkedProjectPath, label);

    const reviewed = await createReviewedBundle(runtime, coordinator, task, label);
    const commitPackagePayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-commit-package`,
    );
    await postJson(
      `/api/decision-inbox/${encodeURIComponent(commitPackagePayload.mutation.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const localCommitPayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-local-commit`,
    );

    const releaseReadinessBefore = coordinator.getReleasePackageReadiness({ taskId });
    assert.equal(releaseReadinessBefore.allowed, true);
    assert.equal(releaseReadinessBefore.latestApprovalDisplayStatus, 'none');

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /릴리스 패키지 준비/);
    assert.match(appJs, /실행으로 이동해 릴리스 패키지 준비/);
    assert.match(
      appJs,
      /릴리스 패키지 경로를 따라 현재 release 승인을 엽니다\./,
    );

    const releasePackagePayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-release-package`,
    );

    const releaseApproval = releasePackagePayload.snapshot.approvals[releasePackagePayload.mutation.approvalId];
    const releaseInboxItem =
      releasePackagePayload.snapshot.decisionInboxItems[releasePackagePayload.mutation.inboxItemId];
    const releaseReadinessAfter =
      releasePackagePayload.derived.releasePackageReadinessSummaries[taskId];
    const releaseArtifact = releasePackagePayload.artifactDetail;

    assert.equal(releasePackagePayload.mutation.kind, 'run-release-package');
    assert.equal(releaseArtifact.type, 'release-package');
    assert.equal(releaseApproval.allowedNextAction, 'release-ready');
    assert.equal(releaseApproval.status, 'pending');
    assert.equal(releaseInboxItem.kind, 'approval');
    assert.equal(releaseInboxItem.status, 'pending');
    assert.equal(releaseReadinessAfter.allowed, false);
    assert.equal(releaseReadinessAfter.latestApprovalDisplayStatus, 'pending');
    assert.equal(releaseReadinessAfter.currentReleasePackageArtifactId, releaseArtifact.id);
    assert.equal(releaseReadinessAfter.commitPackageArtifactId, commitPackagePayload.artifactDetail.id);
    assert.equal(
      releaseReadinessAfter.commitResultArtifactId,
      localCommitPayload.artifactDetail.id,
    );
    assert.match(releaseArtifact.content, /^## Source Local Commit Bundle$/m);
    assert.match(releaseArtifact.content, /^## Source Builder Bundle$/m);
    assert.match(releaseArtifact.content, /^## Release Candidate$/m);
    assert.match(releaseArtifact.content, /^## Human Gate$/m);
    assert.match(releaseArtifact.content, /^## Execution Safety$/m);
    assert.match(releaseArtifact.content, /push executed: no/);
    assert.match(releaseArtifact.content, /publish executed: no/);
    assert.match(releaseArtifact.content, /external release executed: no/);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          releasePackage: {
            taskId,
            reviewerRunId: reviewed.review.run.id,
            commitPackageArtifactId: commitPackagePayload.artifactDetail.id,
            commitResultArtifactId: localCommitPayload.artifactDetail.id,
            releasePackageArtifactId: releaseArtifact.id,
            approvalId: releaseApproval.id,
            inboxItemId: releaseInboxItem.id,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);
    fs.rmSync(path.dirname(fixture.mainProjectPath), { recursive: true, force: true });

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
