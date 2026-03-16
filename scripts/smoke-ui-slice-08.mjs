import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-08');
const port = 4320;
const baseUrl = `http://127.0.0.1:${port}`;

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-08-'));
  const fixturePath = path.join(projectPath, 'prompts', 'builder.md');

  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  fs.writeFileSync(
    fixturePath,
    '# Builder Prompt Contract\n\nUI slice 08 reviewer fixture.\n',
    'utf8',
  );

  return projectPath;
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
    } catch (error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-08 server');
}

async function runThroughLiveMutation(taskId) {
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-architect`);
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`);
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-builder-preflight`);

  const approvalRequestPayload = await postJson(
    `/api/tasks/${encodeURIComponent(taskId)}/request-builder-live-mutation-approval`,
  );

  await postJson(
    `/api/decision-inbox/${encodeURIComponent(approvalRequestPayload.mutation.inboxItemId)}/actions`,
    { verb: 'approve' },
  );

  return postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`);
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();
  const fixtureProjectPath = createFixtureProject();

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

    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();
    const stylesResponse = await fetch(`${baseUrl}/styles.css`);
    const stylesCss = await stylesResponse.text();

    assert.equal(appJsResponse.status, 200);
    assert.equal(stylesResponse.status, 200);
    assert.match(appJs, /Run Reviewer/);
    assert.match(appJs, /run-reviewer/);
    assert.match(appJs, /mapped review:/);
    assert.match(appJs, /Structured preview is best-effort/);
    assert.match(appJs, /preferredInboxItemId: payload\.mutation\.inboxItemId \|\| null/);
    assert.match(appJs, /state\.surface = 'artifacts';/);
    assert.match(stylesCss, /\.review-structured/);

    const passTaskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-08 reviewer pass smoke',
      intent: 'Review the latest builder live mutation bundle and pass it.',
    });
    const passTask = passTaskPayload.task;

    await runThroughLiveMutation(passTask.id);

    const passReviewPayload = await postJson(
      `/api/tasks/${encodeURIComponent(passTask.id)}/run-reviewer`,
    );
    const passReviewArtifactPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(passReviewPayload.mutation.artifactId)}`,
    );

    assert.equal(passReviewPayload.mutation.kind, 'run-reviewer');
    assert.equal(passReviewPayload.mutation.rawVerdict, 'pass');
    assert.equal(passReviewPayload.mutation.mappedReviewStatus, 'passed');
    assert.equal(passReviewPayload.artifactDetail.type, 'review');
    assert.equal(passReviewPayload.snapshot.tasks[passTask.id].review.status, 'passed');
    assert.equal(passReviewPayload.derived.reviewerReadinessSummaries[passTask.id].allowed, false);
    assert.equal(
      passReviewPayload.derived.reviewerReadinessSummaries[passTask.id].existingReviewerRunId,
      passReviewPayload.mutation.runId,
    );
    assert.match(passReviewArtifactPayload.artifact.content, /^## Review Verdict$/m);
    assert.match(passReviewArtifactPayload.artifact.content, /^## Evidence Reviewed$/m);
    assert.match(passReviewArtifactPayload.artifact.content, /^## Follow-Up Gate$/m);

    const failTaskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-08 reviewer fail smoke',
      intent: 'Review verdict: fail',
    });
    const failTask = failTaskPayload.task;

    await runThroughLiveMutation(failTask.id);

    const failReviewPayload = await postJson(
      `/api/tasks/${encodeURIComponent(failTask.id)}/run-reviewer`,
    );
    const failReviewArtifactPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(failReviewPayload.mutation.artifactId)}`,
    );

    assert.equal(failReviewPayload.mutation.rawVerdict, 'fail');
    assert.equal(failReviewPayload.mutation.mappedReviewStatus, 'changes_requested');
    assert.equal(failReviewPayload.snapshot.tasks[failTask.id].review.status, 'changes_requested');
    assert.match(failReviewArtifactPayload.artifact.content, /- verdict: fail/);

    const decisionTaskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-08 reviewer decision smoke',
      intent: 'Review decision required blocking review issue',
    });
    const decisionTask = decisionTaskPayload.task;

    await runThroughLiveMutation(decisionTask.id);

    const decisionReviewPayload = await postJson(
      `/api/tasks/${encodeURIComponent(decisionTask.id)}/run-reviewer`,
    );
    const decisionItem = decisionReviewPayload.snapshot.decisionInboxItems[
      decisionReviewPayload.mutation.inboxItemId
    ];

    assert.ok(decisionReviewPayload.mutation.inboxItemId);
    assert.equal(decisionItem.kind, 'decision');
    assert.equal(decisionItem.status, 'pending');
    assert.equal(decisionItem.blocksTask, true);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          tasks: {
            pass: {
              taskId: passTask.id,
              reviewerRunId: passReviewPayload.mutation.runId,
              reviewArtifactId: passReviewPayload.mutation.artifactId,
            },
            fail: {
              taskId: failTask.id,
              reviewerRunId: failReviewPayload.mutation.runId,
              rawVerdict: failReviewPayload.mutation.rawVerdict,
              mappedReviewStatus: failReviewPayload.mutation.mappedReviewStatus,
            },
            explicitDecision: {
              taskId: decisionTask.id,
              reviewerRunId: decisionReviewPayload.mutation.runId,
              inboxItemId: decisionReviewPayload.mutation.inboxItemId,
            },
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(150);
    fs.rmSync(fixtureProjectPath, { recursive: true, force: true });

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

await main();
