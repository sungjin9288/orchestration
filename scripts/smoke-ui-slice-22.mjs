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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-22');
const port = 4332;
const baseUrl = `http://127.0.0.1:${port}`;

function createFixtureProject() {
  const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-22-'));
  const fixtureFiles = new Map([
    ['prompts/builder.md', '# Builder Prompt Contract\n\nUI slice 22 live-mutation CTA fixture.\n'],
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

  throw new Error('Timed out waiting for ui-slice-22 server');
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

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /data-surface="execution"/);
    assert.match(appJs, /현재 빌더 승인은 이미 승인됐습니다\./);
    assert.match(appJs, /라이브 변경 적용/);
    assert.match(appJs, /라이브 변경 경로를 따라 한정된 변경 번들을 실행 로그로 남깁니다\./);

    const missionPayload = await postJson('/api/missions', {
      autoDraftCouncil: true,
      constraints: 'Keep live mutation bounded to the approved preflight target files only.',
      goal: 'Verify that the primary execution surface can move from approved builder gate into bounded live mutation.',
      title: 'Primary live mutation CTA smoke',
    });

    const mission = missionPayload.mission;
    const approveCouncilPayload = await postJson(
      `/api/missions/${encodeURIComponent(mission.id)}/approve-council`,
    );

    const task = approveCouncilPayload.task;
    const pendingApproval = approveCouncilPayload.approval;

    const approveGatePayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(pendingApproval.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const missionBuilderGuard =
      approveGatePayload.derived.taskGuardSummaries[task.id].builderLiveMutation;

    assert.equal(missionBuilderGuard.allowed, true);
    assert.equal(missionBuilderGuard.latestApprovalStatus, 'approved');
    assert.equal(approveGatePayload.snapshot.missions[mission.id].status, 'executing');

    const directTaskPayload = await postJson('/api/tasks', {
      title: 'ui-slice-07 live mutation linkage smoke',
      intent: 'Keep Logs as the landing surface and expose run to artifact linkage without reviewer or commit execution.',
    });
    const directTask = directTaskPayload.task;

    await runThroughTaskBreaker(directTask.id);

    const preflightPayload = await postJson(
      `/api/tasks/${encodeURIComponent(directTask.id)}/run-builder-preflight`,
    );
    const directApprovalRequestPayload = await postJson(
      `/api/tasks/${encodeURIComponent(directTask.id)}/request-builder-live-mutation-approval`,
    );
    const directApprovedPayload = await postJson(
      `/api/decision-inbox/${encodeURIComponent(directApprovalRequestPayload.mutation.inboxItemId)}/actions`,
      { verb: 'approve' },
    );
    const liveMutationPayload = await postJson(
      `/api/tasks/${encodeURIComponent(directTask.id)}/run-builder-live-mutation`,
    );

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

    assert.equal(
      directApprovedPayload.derived.taskGuardSummaries[directTask.id].builderLiveMutation.allowed,
      true,
    );
    assert.equal(liveMutationPayload.mutation.kind, 'run-builder-live-mutation');
    assert.ok(liveMutationPayload.mutation.runId);
    assert.ok(liveMutationPayload.mutation.artifactId);
    assert.ok(liveMutationPayload.mutation.patchArtifactId);
    assert.ok(liveMutationPayload.mutation.diffArtifactId);
    assert.equal(runLogsPayload.run.summary.executionMode, 'live-mutation');
    assert.equal(runLogsPayload.run.summary.preflightArtifactId, preflightPayload.mutation.artifactId);
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
    assert.equal(approveGatePayload.snapshot.missions[mission.id].status, 'executing');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          mission: {
            id: mission.id,
            linkedTaskId: task.id,
            status: approveGatePayload.snapshot.missions[mission.id].status,
          },
          liveMutation: {
            taskId: directTask.id,
            runId: liveMutationPayload.mutation.runId,
            changeSummaryArtifactId: liveMutationPayload.mutation.artifactId,
            patchArtifactId: liveMutationPayload.mutation.patchArtifactId,
            diffArtifactId: liveMutationPayload.mutation.diffArtifactId,
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
