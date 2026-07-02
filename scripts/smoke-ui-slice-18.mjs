import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-18');
const port = 4328;
const baseUrl = `http://127.0.0.1:${port}`;

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

  throw new Error('Timed out waiting for ui-slice-18 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

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
    const initialSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.equal(initialSnapshot.snapshot.activeProjectId, null);
    assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
    assert.match(appJs, /create-project-from-mission/);
    assert.match(appJs, /미션 시작/);
    assert.match(
      appJs,
      /미션 진입은 항상 로컬 스텁\(local-stub\) 기본값으로 시작합니다\. 프로바이더와 연결 워크트리 제어는 고급 운영 모드에 남습니다\./,
    );
    assert.match(appJs, /위에서 프로젝트를 고른 뒤 첫 미션을 만드세요\./);

    const projectPayload = await postJson('/api/projects', {
      name: 'orchestration',
      projectPath: repoRoot,
    });

    const project = projectPayload.project;

    assert.equal(projectPayload.mutation.kind, 'create-project');
    assert.equal(projectPayload.snapshot.activeProjectId, project.id);
    assert.equal(projectPayload.snapshot.projects[project.id].provider.mode, 'local-stub');

    const missionPayload = await postJson('/api/missions', {
      constraints: 'Keep bootstrap on Mission and leave provider/worktree controls in Advanced Ops Mode.',
      goal: 'Verify the first-run user can register a project from Mission and then create the first mission immediately.',
      title: 'Mission bootstrap smoke',
    });

    const mission = missionPayload.mission;

    assert.equal(missionPayload.mutation.kind, 'create-mission');
    assert.equal(missionPayload.snapshot.activeProjectId, project.id);
    assert.equal(missionPayload.snapshot.selectedMissionId, mission.id);
    assert.equal(missionPayload.snapshot.missions[mission.id].status, 'draft');

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          project: {
            id: project.id,
            providerMode: project.provider.mode,
          },
          mission: {
            id: mission.id,
            status: missionPayload.snapshot.missions[mission.id].status,
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);

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
