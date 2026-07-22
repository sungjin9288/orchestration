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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-bootstrap-slice-01');
const port = 4313;
const baseUrl = `http://127.0.0.1:${port}`;

function createProjectFixture(label) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-bootstrap-slice-01-${label}-`));
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

  throw new Error('Timed out waiting for bootstrap-slice-01 server');
}

async function postJson(url, body) {
  const response = await fetch(`${baseUrl}${url}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json();

  return {
    payload,
    response,
  };
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const altProjectPath = createProjectFixture('alt');
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

    const snapshotResponse = await fetch(`${baseUrl}/api/snapshot`);
    const initialSnapshot = await snapshotResponse.json();

    assert.equal(snapshotResponse.status, 200);
    assert.equal(initialSnapshot.snapshot.activeProjectId, null);
    assert.deepEqual(initialSnapshot.snapshot.projects, {});

    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJsSource = await appJsResponse.text();
    const projectBootstrapResponse = await fetch(`${baseUrl}/project-bootstrap.js`);
    const projectBootstrapSource = await projectBootstrapResponse.text();
    const serveUiSource = fs.readFileSync(
      path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
      'utf8',
    );

    assert.equal(projectBootstrapResponse.status, 200);
    assert.match(appJsSource, /from '\.\/project-bootstrap\.js'/);
    assert.match(projectBootstrapSource, /export function getProjectBootstrapState\(data\)/);
    assert.match(projectBootstrapSource, /export function getMissionProjectBootstrapState\(data\)/);
    assert.match(projectBootstrapSource, /export function getProjectGateCopy\(data, surfaceName\)/);
    assert.match(projectBootstrapSource, /title: '최초 진입 준비'/);
    assert.match(projectBootstrapSource, /title: '프로젝트 등록부'/);
    assert.match(projectBootstrapSource, /heading: '작업할 프로젝트를 연결하세요'/);
    assert.match(projectBootstrapSource, /고급 운영 모드에서 프로젝트를 등록한 뒤/);
    assert.match(appJsSource, /select-project/);
    assert.match(serveUiSource, /\/project-bootstrap\.js/);
    assert.match(serveUiSource, /\/api\/projects/);
    assert.match(serveUiSource, /\/select/);

    const blockedTaskCreate = await postJson('/api/tasks', {
      title: 'Should fail without project',
    });

    assert.equal(blockedTaskCreate.response.status, 400);
    assert.match(blockedTaskCreate.payload.error, /태스크를 만들기 전에 활성 프로젝트가 필요합니다\./);

    const firstProjectCreate = await postJson('/api/projects', {
      name: 'orchestration',
      projectPath: repoRoot,
    });

    assert.equal(firstProjectCreate.response.status, 201);
    assert.equal(firstProjectCreate.payload.snapshot.activeProjectId, 'project-0001');
    assert.equal(firstProjectCreate.payload.project.id, 'project-0001');

    const secondProjectCreate = await postJson('/api/projects', {
      name: 'alt-project',
      projectPath: altProjectPath,
    });

    assert.equal(secondProjectCreate.response.status, 201);
    assert.equal(secondProjectCreate.payload.snapshot.activeProjectId, 'project-0002');
    assert.equal(secondProjectCreate.payload.project.id, 'project-0002');

    const altTaskCreate = await postJson('/api/tasks', {
      title: 'Alt bootstrap task',
      intent: 'Created after registering the second project.',
    });

    assert.equal(altTaskCreate.response.status, 201);
    assert.equal(altTaskCreate.payload.task.projectId, 'project-0002');

    const projectSelect = await postJson('/api/projects/project-0001/select');

    assert.equal(projectSelect.response.status, 200);
    assert.equal(projectSelect.payload.snapshot.activeProjectId, 'project-0001');
    assert.equal(projectSelect.payload.project.id, 'project-0001');

    const mainTaskCreate = await postJson('/api/tasks', {
      title: 'Main bootstrap task',
      intent: 'Created after re-selecting the first project.',
    });

    assert.equal(mainTaskCreate.response.status, 201);
    assert.equal(mainTaskCreate.payload.task.projectId, 'project-0001');

    const finalSnapshotResponse = await fetch(`${baseUrl}/api/snapshot`);
    const finalSnapshot = await finalSnapshotResponse.json();

    assert.equal(finalSnapshotResponse.status, 200);
    assert.equal(finalSnapshot.snapshot.activeProjectId, 'project-0001');
    assert.equal(Object.keys(finalSnapshot.snapshot.projects).length, 2);
    assert.equal(Object.keys(finalSnapshot.snapshot.tasks).length, 2);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          projects: Object.values(finalSnapshot.snapshot.projects).map((project) => ({
            id: project.id,
            name: project.name,
            projectPath: project.projectPath,
          })),
          tasks: Object.values(finalSnapshot.snapshot.tasks).map((task) => ({
            id: task.id,
            projectId: task.projectId,
            title: task.title,
          })),
          activeProjectId: finalSnapshot.snapshot.activeProjectId,
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
