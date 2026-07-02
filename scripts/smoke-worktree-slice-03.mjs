import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-worktree-slice-03');
const port = 4315;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-worktree-slice-03-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'worktree-slice-03']);
  runGit(mainProjectPath, ['config', 'user.email', 'worktree-slice-03@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  runGit(mainProjectPath, ['add', 'scoped.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    mainProjectPath: fs.realpathSync(mainProjectPath),
  };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for worktree-slice-03 server');
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

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status} ${response.statusText}`);
  }

  return payload;
}

async function main() {
  const fixture = createWorktreeFixture('smoke');
  const runtime = createRuntimeService({ runtimeRoot });

  runtime.resetRuntime();

  const mainProject = runtime.createProject({
    name: 'worktree-slice-03-main',
    projectPath: fixture.mainProjectPath,
  });
  const task = runtime.createTask({
    projectId: mainProject.id,
    title: 'Worktree create smoke',
    intent: 'Create a linked worktree from Project Bootstrap and reuse register/select without task migration.',
  });

  const serveUiSource = fs.readFileSync(
    path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
    'utf8',
  );
  const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');

  assert.match(serveUiSource, /linked-worktrees/);
  assert.match(serveUiSource, /worktree\/\$\{slug\}/);
  assert.match(appJsSource, /연결 워크트리 만들기/);
  assert.match(appJsSource, /linkedWorktreeSlug/);

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

    const initialSnapshotResponse = await fetch(`${baseUrl}/api/snapshot`);
    const initialSnapshot = await initialSnapshotResponse.json();

    assert.equal(initialSnapshotResponse.status, 200);
    assert.equal(initialSnapshot.snapshot.activeProjectId, mainProject.id);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.options.length, 0);
    assert.equal(initialSnapshot.snapshot.tasks[task.id].projectId, mainProject.id);
    assert.equal(initialSnapshot.snapshot.tasks[task.id].worktreeRef, null);

    const createPayload = await postJson(
      `/api/projects/${encodeURIComponent(mainProject.id)}/linked-worktrees`,
      { slug: 'feature-a' },
    );
    const expectedLinkedPath = fs.realpathSync(
      path.join(
        path.dirname(fixture.mainProjectPath),
        `${path.basename(fixture.mainProjectPath)}--feature-a`,
      ),
    );
    const currentLinkedOption =
      createPayload.derived.activeProjectLinkedWorktrees.options.find(
        (option) => option.path === expectedLinkedPath,
      ) || null;

    assert.equal(createPayload.mutation.kind, 'create-linked-worktree');
    assert.equal(createPayload.mutation.mode, 'create-project');
    assert.equal(createPayload.linkedWorktree.slug, 'feature-a');
    assert.equal(createPayload.linkedWorktree.branch, 'worktree/feature-a');
    assert.equal(createPayload.linkedWorktree.path, expectedLinkedPath);
    assert.equal(createPayload.project.projectPath, expectedLinkedPath);
    assert.equal(createPayload.snapshot.activeProjectId, createPayload.project.id);
    assert.equal(runGit(expectedLinkedPath, ['branch', '--show-current']).trim(), 'worktree/feature-a');
    assert.equal(createPayload.snapshot.tasks[task.id].projectId, mainProject.id);
    assert.equal(createPayload.snapshot.tasks[task.id].worktreeRef, null);
    assert.equal(
      Object.values(createPayload.snapshot.tasks).filter((candidate) => candidate.projectId === createPayload.project.id)
        .length,
      0,
    );
    assert.ok(currentLinkedOption);
    assert.equal(currentLinkedOption.isCurrentProjectPath, true);
    assert.equal(currentLinkedOption.registeredProjectId, createPayload.project.id);

    const switchedBackPayload = await postJson(
      `/api/projects/${encodeURIComponent(mainProject.id)}/select`,
      {},
    );
    const detectedLinkedOption =
      switchedBackPayload.derived.activeProjectLinkedWorktrees.options.find(
        (option) => option.path === expectedLinkedPath,
      ) || null;

    assert.equal(switchedBackPayload.snapshot.activeProjectId, mainProject.id);
    assert.ok(detectedLinkedOption);
    assert.equal(detectedLinkedOption.registeredProjectId, createPayload.project.id);
    assert.equal(detectedLinkedOption.isCurrentProjectPath, false);

    await assert.rejects(
      () =>
        postJson(`/api/projects/${encodeURIComponent(mainProject.id)}/linked-worktrees`, {
          slug: 'feature-a',
        }),
      /연결 워크트리 브랜치가 이미 존재합니다: worktree\/feature-a.*기존 탐지\/전환 흐름/,
    );

    const conflictingPath = path.join(
      path.dirname(fixture.mainProjectPath),
      `${path.basename(fixture.mainProjectPath)}--feature-b`,
    );
    fs.mkdirSync(conflictingPath, { recursive: true });

    await assert.rejects(
      () =>
        postJson(`/api/projects/${encodeURIComponent(mainProject.id)}/linked-worktrees`, {
          slug: 'feature-b',
        }),
      /연결 워크트리 경로가 이미 존재합니다: .*feature-b.*기존 탐지\/전환 흐름/,
    );

    const finalSnapshotResponse = await fetch(`${baseUrl}/api/snapshot`);
    const finalSnapshot = await finalSnapshotResponse.json();

    assert.equal(finalSnapshotResponse.status, 200);
    assert.equal(Object.keys(finalSnapshot.snapshot.projects).length, 2);
    assert.equal(
      Object.values(finalSnapshot.snapshot.tasks).filter((candidate) => candidate.projectId === createPayload.project.id)
        .length,
      0,
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          linkedProjectId: createPayload.project.id,
          linkedProjectPath: expectedLinkedPath,
          runtimeRoot,
          taskId: task.id,
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

await main();
