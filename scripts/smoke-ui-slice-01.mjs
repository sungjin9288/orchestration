import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

import contractsModule from '../src/runtime/contracts.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { APPROVAL_STATUS, COMMIT_ACTION, REVIEW_STATUS, TASK_LIFECYCLE } = contractsModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-01');
const port = 4311;
const baseUrl = `http://127.0.0.1:${port}`;

async function seedRuntime() {
  const runtime = createRuntimeService({ runtimeRoot });

  runtime.resetRuntime();

  const project = runtime.createProject({
    name: 'orchestration',
    projectPath: repoRoot,
  });

  const pendingTask = runtime.createTask({
    projectId: project.id,
    title: 'Pending gate task',
    intent: 'Show lifecycle, flags, review, decision, and approval waiting state in the shell.',
  });

  const pendingRun = runtime.startPlaceholderRun({ taskId: pendingTask.id });

  runtime.appendLog({
    runId: pendingRun.id,
    message: 'Pending gate task placeholder run started',
  });

  runtime.recordArtifact({
    taskId: pendingTask.id,
    runId: pendingRun.id,
    content: '# pending-gate-task\n\nartifact preview\n',
  });

  runtime.finishRunWithReviewPending({ runId: pendingRun.id });

  runtime.createDecisionInboxItem({
    taskId: pendingTask.id,
    title: 'Decision required: pending gate task',
    prompt: 'Resolve the pending product decision before this task is done.',
    blocksTask: true,
  });

  runtime.createApprovalPlaceholder({
    taskId: pendingTask.id,
    scope: 'commit',
    allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
    title: 'Approval required: commit-intent',
    prompt: 'Commit intent must remain blocked until approval is recorded.',
  });

  const completeTask = runtime.createTask({
    projectId: project.id,
    title: 'Completed task',
    intent: 'Show review passed and approvals resolved state.',
  });

  const completeRun = runtime.startPlaceholderRun({ taskId: completeTask.id });

  runtime.appendLog({
    runId: completeRun.id,
    message: 'Completed task placeholder run started',
  });

  const verificationArtifact = runtime.recordArtifact({
    taskId: completeTask.id,
    runId: completeRun.id,
    content: '# completed-task\n\nverification artifact\n',
  });

  runtime.finishRunWithReviewPending({ runId: completeRun.id });

  const reviewItem = runtime.listDecisionInboxItems({
    taskId: completeTask.id,
    status: 'pending',
    kind: 'review',
  })[0];

  runtime.resolveReview({
    taskId: completeTask.id,
    itemId: reviewItem.id,
    action: REVIEW_STATUS.PASSED,
    note: 'Review passed with verification evidence.',
    verificationArtifactIds: [verificationArtifact.id],
  });

  const commitIntentApproval = runtime.createApprovalPlaceholder({
    taskId: completeTask.id,
    scope: 'commit',
    allowedNextAction: COMMIT_ACTION.COMMIT_INTENT,
    title: 'Approval required: commit-intent',
    prompt: 'Commit-intent must remain blocked until approval is recorded.',
  });

  runtime.resolveDecisionInboxItem({
    itemId: commitIntentApproval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: 'Commit-intent approved.',
  });

  const commitReadyApproval = runtime.createApprovalPlaceholder({
    taskId: completeTask.id,
    scope: 'commit',
    allowedNextAction: COMMIT_ACTION.COMMIT_READY,
    title: 'Approval required: commit-ready',
    prompt: 'Commit-ready must remain blocked until approval is recorded.',
  });

  runtime.resolveDecisionInboxItem({
    itemId: commitReadyApproval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: 'Commit-ready approved.',
  });

  runtime.transitionTaskLifecycle({
    taskId: completeTask.id,
    to: TASK_LIFECYCLE.DONE,
  });
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (error) {
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-01 server');
}

async function main() {
  await seedRuntime();

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

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();
    const artifactPreviewJsResponse = await fetch(`${baseUrl}/artifact-preview.js`);
    const artifactPreviewJs = await artifactPreviewJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.equal(artifactPreviewJsResponse.status, 200);
    assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
    assert.match(indexHtml, /office-register-value">advanced</);
    assert.match(indexHtml, /작업판/);
    assert.match(indexHtml, /결정함/);
    assert.match(appJs, /function getArtifactCatalogEntry\(artifact, data\)/);
    assert.match(appJs, /function renderArtifactPolicyTokens\(artifact, data\)/);
    assert.match(artifactPreviewJs, /tier-c-generic-fallback/);
    assert.match(artifactPreviewJs, /raw-only/);
    assert.match(artifactPreviewJs, /일반 보존/);
    assert.match(artifactPreviewJs, /원문만 제공/);
    assert.match(artifactPreviewJs, /최종 기준/);

    const snapshotResponse = await fetch(`${baseUrl}/api/snapshot`);
    const snapshotPayload = await snapshotResponse.json();

    assert.equal(snapshotPayload.snapshot.activeProjectId, 'project-0001');
    assert.equal(Object.keys(snapshotPayload.snapshot.tasks).length, 2);
    assert.ok(snapshotPayload.artifactCatalog);
    assert.equal(
      snapshotPayload.artifactCatalog.output.previewMode,
      'raw-only',
    );
    assert.equal(
      snapshotPayload.artifactCatalog.output.retentionTier,
      'tier-c-generic-fallback',
    );

    const pendingTask = Object.values(snapshotPayload.snapshot.tasks).find(
      (task) => task.title === 'Pending gate task',
    );
    const completedTask = Object.values(snapshotPayload.snapshot.tasks).find(
      (task) => task.title === 'Completed task',
    );

    assert.ok(pendingTask);
    assert.ok(completedTask);
    assert.deepEqual(pendingTask.flags, {
      blocked: true,
      waitingApproval: true,
      waitingDecision: true,
    });
    assert.equal(pendingTask.review.status, 'pending');
    assert.equal(completedTask.lifecycleState, 'Done');
    assert.equal(completedTask.review.status, 'passed');

    const logsResponse = await fetch(`${baseUrl}/api/runs/${encodeURIComponent(pendingTask.latestRunId)}/logs`);
    const logsPayload = await logsResponse.json();

    assert.equal(logsResponse.status, 200);
    assert.equal(logsPayload.run.id, pendingTask.latestRunId);
    assert.match(logsPayload.logs[0].message, /Pending gate task placeholder run started/);

    const artifactId = pendingTask.artifactIds[0];
    const artifactResponse = await fetch(`${baseUrl}/api/artifacts/${encodeURIComponent(artifactId)}`);
    const artifactPayload = await artifactResponse.json();

    assert.equal(artifactResponse.status, 200);
    assert.ok(artifactPayload.artifactCatalog);
    assert.equal(artifactPayload.artifact.id, artifactId);
    assert.match(artifactPayload.artifact.content, /artifact preview/);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          counts: {
            tasks: Object.keys(snapshotPayload.snapshot.tasks).length,
            runs: Object.keys(snapshotPayload.snapshot.runs).length,
            artifacts: Object.keys(snapshotPayload.snapshot.artifacts).length,
            inboxItems: Object.keys(snapshotPayload.snapshot.decisionInboxItems).length,
            approvals: Object.keys(snapshotPayload.snapshot.approvals).length,
          },
          pendingTask: {
            id: pendingTask.id,
            flags: pendingTask.flags,
            reviewStatus: pendingTask.review.status,
          },
          completedTask: {
            id: completedTask.id,
            lifecycleState: completedTask.lifecycleState,
            reviewStatus: completedTask.review.status,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(150);

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

await main();
