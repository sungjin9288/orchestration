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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-29');
const port = 4339;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-ui-slice-29-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const branchName = `ui-slice-29-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'ui-slice-29']);
  runGit(mainProjectPath, ['config', 'user.email', 'ui-slice-29@example.com']);

  fs.mkdirSync(path.join(mainProjectPath, 'prompts'), { recursive: true });
  fs.writeFileSync(
    path.join(mainProjectPath, 'prompts', 'builder.md'),
    '# Builder Prompt Contract\n\nUI slice 29 fixture.\n',
    'utf8',
  );
  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');

  runGit(mainProjectPath, ['add', 'prompts/builder.md', 'scoped.txt', 'extra.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', branchName, linkedProjectPath]);

  return {
    fixtureRoot,
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
- keep the close-out flow bounded to the current approved release bundle only

## Risks
- none

## Verification Plan
- prepare release package, approve release gate, transition to review, then run close-out

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when an explicit human decision is required

## Input Summary
- synthetic preflight fixture for ui-slice-29 smoke
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
- synthetic live mutation bundle for ui-slice-29 smoke
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
Prepare a close-out-ready primary shell path from the current approved release bundle.
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
- prepare the current release package and approve the release gate
- transition the task to review and run bounded close-out

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
    prompt: `Approve the synthetic bundle ${label} for ui-slice-29 smoke.`,
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
  runtime.completeRun({
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
      approvalTargetArtifactId: preflight.artifact.id,
      approvalTargetRunId: preflight.run.id,
    },
  });
}

async function createReviewedBundle(runtime, coordinator, task, label) {
  createLiveMutationBundle(runtime, task, label);
  return coordinator.runReviewer({ taskId: task.id });
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

  throw new Error('Timed out waiting for ui-slice-29 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();
  const fixture = createLinkedWorktreeFixture('close-out');

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
        'Keep close-out execution bounded to the current approved release bundle only.',
      goal:
        'Verify that the primary execution surface can resume bounded close-out without entering Advanced Ops Mode first.',
      title: 'Primary close-out CTA smoke',
    });
    const mission = missionPayload.mission;
    const approveCouncilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );
    const taskId = approveCouncilPayload.task.id;
    const task = runtime.getTask(taskId);
    const label = 'primary-close-out';
    const initialBuilderApproval = runtime
      .listApprovals({
        taskId,
        allowedNextAction: 'builder-live-mutation',
        status: 'pending',
      })
      .at(-1);

    runtime.setTaskWorktreeRef({
      taskId,
      worktreeRef: fixture.linkedProjectPath,
    });
    setScopedFile(fixture.linkedProjectPath, label);

    if (initialBuilderApproval?.inboxItemId) {
      runtime.resolveDecisionInboxItem({
        itemId: initialBuilderApproval.inboxItemId,
        action: 'approved',
        note: 'Approve the mission auto-chain builder gate before the synthetic close-out fixture continues.',
      });
    }

    const review = await createReviewedBundle(runtime, coordinator, task, label);
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
    const releasePackagePayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-release-package`,
    );

    const releaseApprovalId = releasePackagePayload.mutation.approvalId;
    const releaseInboxItemId = releasePackagePayload.mutation.inboxItemId;

    const approveReleasePayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(releaseInboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const approvedRelease = approveReleasePayload.snapshot.approvals[releaseApprovalId];

    assert.equal(approvedRelease.status, 'approved');

    runtime.transitionTaskLifecycle({
      taskId,
      to: 'Review',
    });

    const snapshotAfterReady = await fetchJson(`${baseUrl}/api/snapshot`);
    const closeOutReady = snapshotAfterReady.derived.closeOutReadinessSummaries[taskId];

    assert.equal(closeOutReady.allowed, true);
    assert.equal(closeOutReady.latestApprovedReleaseApprovalStatus, 'approved');
    assert.equal(
      closeOutReady.currentReleasePackageArtifactId,
      releasePackagePayload.artifactDetail.id,
    );
    assert.equal(
      snapshotAfterReady.snapshot.tasks[taskId].lifecycleState,
      'Review',
    );

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /승인된 종료 정리 이어가기/);
    assert.match(appJs, /실행으로 이동해 종료 정리 실행/);
    assert.match(
      appJs,
      /현재 승인된 release 번들이 준비됐습니다\. 이 CTA는 종료 정리 경로를 따라 종료 정리 번들로 이어집니다\./,
    );

    const closeOutPayload = await postJson(
      `/api/tasks/${encodeURIComponent(taskId)}/run-close-out`,
    );
    const closeOutArtifact = runtime.getArtifact(closeOutPayload.artifactDetail.id);
    const closeOutAfter = closeOutPayload.derived.closeOutReadinessSummaries[taskId];
    const closedTask = closeOutPayload.snapshot.tasks[taskId];

    assert.equal(closeOutPayload.mutation.kind, 'run-close-out');
    assert.equal(closeOutPayload.artifactDetail.type, 'close-out');
    assert.equal(closedTask.lifecycleState, 'Done');
    assert.match(closeOutArtifact.content, /^## Source Review Bundle$/m);
    assert.match(closeOutArtifact.content, /^## Source Builder Bundle$/m);
    assert.match(closeOutArtifact.content, /^## Worktree Verification$/m);
    assert.match(closeOutArtifact.content, /^## Release Safety$/m);
    assert.match(
      closeOutArtifact.content,
      new RegExp(`source release-package artifact: ${releasePackagePayload.artifactDetail.id}`),
    );
    assert.match(
      closeOutArtifact.content,
      new RegExp(`source commit-result artifact: ${localCommitPayload.artifactDetail.id}`),
    );
    assert.match(
      closeOutArtifact.content,
      new RegExp(`source reviewer run: ${review.run.id}`),
    );
    assert.match(closeOutArtifact.content, /repo clean before close-out: yes/);
    assert.match(closeOutArtifact.content, /push executed: no/);
    assert.match(closeOutArtifact.content, /publish executed: no/);
    assert.match(closeOutArtifact.content, /external release executed: no/);
    assert.equal(closeOutAfter.allowed, false);
    assert.equal(closeOutAfter.conflict, true);
    assert.equal(closeOutAfter.existingCloseOutArtifactId, closeOutPayload.artifactDetail.id);
    assert.equal(closeOutAfter.existingCloseOutRunId, closeOutPayload.mutation.runId);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          closeOut: {
            taskId,
            reviewerRunId: review.run.id,
            commitPackageArtifactId: commitPackagePayload.artifactDetail.id,
            commitResultArtifactId: localCommitPayload.artifactDetail.id,
            releasePackageArtifactId: releasePackagePayload.artifactDetail.id,
            closeOutArtifactId: closeOutPayload.artifactDetail.id,
            closeOutRunId: closeOutPayload.mutation.runId,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);
    fs.rmSync(fixture.fixtureRoot, { recursive: true, force: true });

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
