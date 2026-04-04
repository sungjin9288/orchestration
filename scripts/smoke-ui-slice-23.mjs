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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-23');
const port = 4333;
const baseUrl = `http://127.0.0.1:${port}`;

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-23-'));
  const fixtureFiles = new Map([
    ['prompts/builder.md', '# Builder Prompt Contract\n\nUI slice 23 reviewer CTA fixture.\n'],
    ['src/execution/execution-coordinator.js', 'export const executionCoordinatorFixture = true;\n'],
    ['src/execution/providers/local-stub-adapter.js', 'export const localStubAdapterFixture = true;\n'],
    ['src/runtime/runtime-service.js', 'export const runtimeServiceFixture = true;\n'],
    ['scripts/smoke-execution-slice-05.mjs', 'console.log("smoke execution fixture");\n'],
    ['scripts/serve-ui-slice-01.mjs', 'console.log("serve ui fixture");\n'],
    ['ui/app.js', 'export const appFixture = true;\n'],
  ]);

  for (const [relativePath, content] of fixtureFiles.entries()) {
    const fixturePath = path.join(projectPath, relativePath);
    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, content, 'utf8');
  }

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
    } catch (_error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-23 server');
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

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /최신 라이브 변경 번들이 준비됐습니다\./);
    assert.match(appJs, /리뷰어 실행/);
    assert.match(appJs, /리뷰어 경로를 따라 아티팩트로 이어집니다\./);

    const taskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-23 reviewer CTA smoke',
      intent: 'Review the latest builder live mutation bundle and pass it.',
    });
    const task = taskPayload.task;

    const liveMutationPayload = await runThroughLiveMutation(task.id);
    const reviewerReadinessBefore = liveMutationPayload.derived.reviewerReadinessSummaries[task.id];

    assert.equal(reviewerReadinessBefore.allowed, true);
    assert.ok(reviewerReadinessBefore.sourceBuilderRunId);
    assert.ok(reviewerReadinessBefore.changeSummaryArtifactId);

    const reviewerPayload = await postJson(
      `/api/tasks/${encodeURIComponent(task.id)}/run-reviewer`,
    );
    const reviewArtifactPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(reviewerPayload.mutation.artifactId)}`,
    );

    assert.equal(reviewerPayload.mutation.kind, 'run-reviewer');
    assert.equal(reviewerPayload.mutation.rawVerdict, 'pass');
    assert.equal(reviewerPayload.mutation.mappedReviewStatus, 'passed');
    assert.equal(reviewerPayload.snapshot.tasks[task.id].review.status, 'passed');
    assert.equal(reviewerPayload.derived.reviewerReadinessSummaries[task.id].allowed, false);
    assert.equal(
      reviewerPayload.derived.reviewerReadinessSummaries[task.id].existingReviewerRunId,
      reviewerPayload.mutation.runId,
    );
    assert.equal(reviewArtifactPayload.artifact.type, 'review');
    assert.match(reviewArtifactPayload.artifact.content, /^## Review Verdict$/m);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          reviewer: {
            taskId: task.id,
            sourceBuilderRunId: reviewerReadinessBefore.sourceBuilderRunId,
            reviewerRunId: reviewerPayload.mutation.runId,
            reviewArtifactId: reviewerPayload.mutation.artifactId,
            mappedReviewStatus: reviewerPayload.mutation.mappedReviewStatus,
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
