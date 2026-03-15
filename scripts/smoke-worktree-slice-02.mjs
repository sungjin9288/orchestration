import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-worktree-slice-02');
const port = 4314;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-worktree-slice-02-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPathA = path.join(fixtureRoot, 'linked-a');
  const linkedProjectPathB = path.join(fixtureRoot, 'linked-b');
  const linkedProjectAliasA = path.join(fixtureRoot, 'linked-a-alias');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'worktree-slice-02']);
  runGit(mainProjectPath, ['config', 'user.email', 'worktree-slice-02@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  runGit(mainProjectPath, ['add', 'scoped.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', `${label}-a`, linkedProjectPathA]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', `${label}-b`, linkedProjectPathB]);
  fs.symlinkSync(linkedProjectPathA, linkedProjectAliasA);

  return {
    linkedProjectAliasA: path.resolve(linkedProjectAliasA),
    linkedProjectPathA: fs.realpathSync(linkedProjectPathA),
    linkedProjectPathB: fs.realpathSync(linkedProjectPathB),
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

  throw new Error('Timed out waiting for worktree-slice-02 server');
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

function getLinkedOption(snapshotPayload, worktreePath) {
  return (
    snapshotPayload.derived.activeProjectLinkedWorktrees.options.find((option) => option.path === worktreePath) ||
    null
  );
}

async function main() {
  const fixture = createWorktreeFixture('smoke');
  const runtime = createRuntimeService({ runtimeRoot });

  runtime.resetRuntime();

  const mainProject = runtime.createProject({
    name: 'worktree-slice-02-main',
    projectPath: fixture.mainProjectPath,
  });
  const linkedAliasProject = runtime.createProject({
    name: 'worktree-slice-02-linked-a',
    projectPath: fixture.linkedProjectAliasA,
  });

  runtime.selectProject(mainProject.id);

  const task = runtime.createTask({
    projectId: mainProject.id,
    title: 'Worktree switch smoke',
    intent: 'Switch active project to a detected linked worktree root without changing runtime semantics.',
  });

  const serveUiSource = fs.readFileSync(
    path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
    'utf8',
  );
  const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');

  assert.match(serveUiSource, /registeredProjectId/);
  assert.match(serveUiSource, /suggestedProjectName/);
  assert.match(appJsSource, /switch-active-project-worktree/);
  assert.match(appJsSource, /task\.worktreeRef vs active project_path/);
  assert.match(appJsSource, /worktree:mismatch/);

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
    const linkedOptionA = getLinkedOption(initialSnapshot, fixture.linkedProjectPathA);
    const linkedOptionB = getLinkedOption(initialSnapshot, fixture.linkedProjectPathB);

    assert.equal(initialSnapshotResponse.status, 200);
    assert.equal(initialSnapshot.snapshot.activeProjectId, mainProject.id);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.error, null);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.notice, null);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.projectId, mainProject.id);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.options.length, 2);
    assert.ok(linkedOptionA);
    assert.ok(linkedOptionB);
    assert.equal(linkedOptionA.registeredProjectId, linkedAliasProject.id);
    assert.equal(linkedOptionA.registeredProjectName, linkedAliasProject.name);
    assert.equal(linkedOptionA.isCurrentProjectPath, false);
    assert.equal(linkedOptionB.registeredProjectId, null);
    assert.ok(linkedOptionB.suggestedProjectName);
    assert.ok(
      !initialSnapshot.derived.activeProjectLinkedWorktrees.options.some(
        (option) => option.path === fixture.mainProjectPath,
      ),
    );

    const setTaskWorktreePayload = await postJson(
      `/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`,
      { worktreeRef: fixture.linkedProjectPathA },
    );

    assert.equal(setTaskWorktreePayload.snapshot.tasks[task.id].worktreeRef, fixture.linkedProjectPathA);

    const switchRegisteredPayload = await postJson(
      `/api/projects/${encodeURIComponent(linkedOptionA.registeredProjectId)}/select`,
      {},
    );
    const switchedRegisteredOption = getLinkedOption(switchRegisteredPayload, fixture.linkedProjectPathA);

    assert.equal(switchRegisteredPayload.snapshot.activeProjectId, linkedAliasProject.id);
    assert.equal(switchRegisteredPayload.project.id, linkedAliasProject.id);
    assert.ok(switchedRegisteredOption);
    assert.equal(switchedRegisteredOption.isCurrentProjectPath, true);
    assert.ok(
      !switchRegisteredPayload.derived.activeProjectLinkedWorktrees.options.some(
        (option) => option.path === fixture.mainProjectPath,
      ),
    );

    await postJson(`/api/projects/${encodeURIComponent(mainProject.id)}/select`, {});

    const switchUnregisteredPayload = await postJson('/api/projects', {
      name: linkedOptionB.suggestedProjectName,
      projectPath: linkedOptionB.path,
    });
    const switchedUnregisteredOption = getLinkedOption(switchUnregisteredPayload, fixture.linkedProjectPathB);

    assert.equal(switchUnregisteredPayload.project.projectPath, fixture.linkedProjectPathB);
    assert.equal(switchUnregisteredPayload.snapshot.activeProjectId, switchUnregisteredPayload.project.id);
    assert.ok(switchedUnregisteredOption);
    assert.equal(switchedUnregisteredOption.isCurrentProjectPath, true);

    console.log(
      JSON.stringify(
        {
          ok: true,
          linkedRegisteredProjectId: linkedAliasProject.id,
          linkedUnregisteredProjectId: switchUnregisteredPayload.project.id,
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
