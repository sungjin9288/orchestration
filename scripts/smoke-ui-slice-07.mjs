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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-07');
const port = 4319;
const baseUrl = `http://127.0.0.1:${port}`;

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-07-'));
  const fixturePath = path.join(projectPath, 'prompts', 'builder.md');

  fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
  fs.writeFileSync(
    fixturePath,
    '# Builder Prompt Contract\n\nUI slice 07 live-mutation fixture.\n',
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
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-07 server');
}

async function runThroughTaskBreaker(taskId) {
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-planner`);
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-architect`);
  await postJson(`/api/tasks/${encodeURIComponent(taskId)}/run-task-breaker`);
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
    assert.match(appJs, /selectionSeeded/);
    assert.match(appJs, /state\.surface = 'logs';/);
    assert.match(appJs, /Run Linkage/);
    assert.match(appJs, /Provenance/);
    assert.match(appJs, /planned patch/);
    assert.match(appJs, /observed diff/);
    assert.match(stylesCss, /\.relation-strip/);
    assert.match(stylesCss, /\.token-button/);

    const liveTaskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-07 live mutation linkage smoke',
      intent: 'Keep Logs as the landing surface and expose run to artifact linkage without reviewer or commit execution.',
    });
    const liveTask = liveTaskPayload.task;

    await runThroughTaskBreaker(liveTask.id);

    const preflightPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/run-builder-preflight`,
    );
    const approvalRequestPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/request-builder-live-mutation-approval`,
    );
    const approvedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(approvalRequestPayload.mutation.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const liveMutationPayload = await postJson(
      `/api/tasks/${encodeURIComponent(liveTask.id)}/run-builder-live-mutation`,
    );

    assert.equal(
      approvedPayload.derived.taskGuardSummaries[liveTask.id].builderLiveMutation.allowed,
      true,
    );
    assert.equal(liveMutationPayload.mutation.kind, 'run-builder-live-mutation');
    assert.ok(liveMutationPayload.mutation.runId);
    assert.ok(liveMutationPayload.mutation.artifactId);
    assert.ok(liveMutationPayload.mutation.patchArtifactId);
    assert.ok(liveMutationPayload.mutation.diffArtifactId);

    const runLogsPayload = await fetchJson(
      `${baseUrl}/api/runs/${encodeURIComponent(liveMutationPayload.mutation.runId)}/logs`,
    );
    const changeSummaryPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(liveMutationPayload.mutation.artifactId)}`,
    );
    const patchPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(liveMutationPayload.mutation.patchArtifactId)}`,
    );
    const diffPayload = await fetchJson(
      `${baseUrl}/api/artifacts/${encodeURIComponent(liveMutationPayload.mutation.diffArtifactId)}`,
    );

    assert.equal(runLogsPayload.run.summary.executionMode, 'live-mutation');
    assert.equal(
      runLogsPayload.run.summary.preflightArtifactId,
      preflightPayload.mutation.artifactId,
    );
    assert.deepEqual(runLogsPayload.run.summary.changedFiles, liveMutationPayload.mutation.changedFiles);
    assert.equal(
      runLogsPayload.run.summary.artifactIds.changeSummary,
      liveMutationPayload.mutation.artifactId,
    );
    assert.equal(
      runLogsPayload.run.summary.artifactIds.patch,
      liveMutationPayload.mutation.patchArtifactId,
    );
    assert.equal(
      runLogsPayload.run.summary.artifactIds.diff,
      liveMutationPayload.mutation.diffArtifactId,
    );
    assert.equal(changeSummaryPayload.artifact.type, 'change-summary');
    assert.equal(patchPayload.artifact.type, 'patch');
    assert.equal(diffPayload.artifact.type, 'diff');
    assert.match(changeSummaryPayload.artifact.content, /^## Change Summary$/m);
    assert.match(changeSummaryPayload.artifact.content, /^## Verification Notes$/m);
    assert.match(patchPayload.artifact.content, /^diff --git /m);
    assert.match(diffPayload.artifact.content, /^diff --git /m);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          taskId: liveTask.id,
          preflightArtifactId: preflightPayload.mutation.artifactId,
          liveMutationRunId: liveMutationPayload.mutation.runId,
          changeSummaryArtifactId: liveMutationPayload.mutation.artifactId,
          patchArtifactId: liveMutationPayload.mutation.patchArtifactId,
          diffArtifactId: liveMutationPayload.mutation.diffArtifactId,
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
