import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-worktree-slice-01');
const port = 4313;
const baseUrl = `http://127.0.0.1:${port}`;

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-worktree-slice-01-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPathA = path.join(fixtureRoot, 'linked-a');
  const linkedProjectPathB = path.join(fixtureRoot, 'linked-b');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'worktree-slice-01']);
  runGit(mainProjectPath, ['config', 'user.email', 'worktree-slice-01@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  runGit(mainProjectPath, ['add', 'scoped.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', `${label}-a`, linkedProjectPathA]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', `${label}-b`, linkedProjectPathB]);

  return {
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

  throw new Error('Timed out waiting for worktree-slice-01 server');
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

  const project = runtime.createProject({
    name: 'worktree-slice-01',
    projectPath: fixture.mainProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: 'Worktree selection smoke',
    intent: 'Detect linked worktrees and persist task.worktreeRef through the shell server.',
  });

  const serveUiSource = fs.readFileSync(
    path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs'),
    'utf8',
  );
  const appJsSource = fs.readFileSync(path.join(repoRoot, 'ui', 'app.js'), 'utf8');

  assert.match(serveUiSource, /activeProjectLinkedWorktrees/);
  assert.match(serveUiSource, /worktree-ref/);
  assert.match(appJsSource, /Apply Worktree/);
  assert.match(appJsSource, /set-task-worktree-ref/);
  assert.match(appJsSource, /clear-task-worktree-ref/);
  assert.match(appJsSource, /Detected Linked Worktrees/);

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
    const linkedWorktreeOptions = initialSnapshot.derived.activeProjectLinkedWorktrees.options;
    const linkedWorktreePaths = linkedWorktreeOptions.map((option) => option.path);

    assert.equal(initialSnapshotResponse.status, 200);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.projectId, project.id);
    assert.equal(initialSnapshot.derived.activeProjectLinkedWorktrees.error, null);
    assert.equal(linkedWorktreeOptions.length, 2);
    assert.deepEqual(linkedWorktreePaths, [fixture.linkedProjectPathA, fixture.linkedProjectPathB]);
    assert.ok(linkedWorktreeOptions.every((option) => option.isCurrentProjectPath === false));
    assert.ok(!linkedWorktreePaths.includes(fixture.mainProjectPath));
    assert.equal(initialSnapshot.snapshot.tasks[task.id].worktreeRef, null);

    const setPayload = await postJson(`/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`, {
      worktreeRef: fixture.linkedProjectPathA,
    });

    assert.equal(setPayload.mutation.kind, 'set-task-worktree-ref');
    assert.equal(setPayload.snapshot.tasks[task.id].worktreeRef, fixture.linkedProjectPathA);

    const changePayload = await postJson(`/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`, {
      worktreeRef: fixture.linkedProjectPathB,
    });

    assert.equal(changePayload.mutation.kind, 'set-task-worktree-ref');
    assert.equal(changePayload.snapshot.tasks[task.id].worktreeRef, fixture.linkedProjectPathB);

    await assert.rejects(
      () =>
        postJson(`/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`, {
          worktreeRef: fixture.mainProjectPath,
        }),
      /worktreeRef must match a detected linked worktree/i,
    );

    const clearPayload = await postJson(`/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`, {
      worktreeRef: null,
    });

    assert.equal(clearPayload.mutation.kind, 'clear-task-worktree-ref');
    assert.equal(clearPayload.snapshot.tasks[task.id].worktreeRef, null);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          taskId: task.id,
          linkedWorktreePaths,
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
