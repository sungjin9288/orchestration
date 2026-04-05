import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import contractsModule from '../src/runtime/contracts.js';
import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const {
  APPROVAL_STATUS,
  BUILDER_ACTION,
  RELEASE_ACTION,
  TASK_LIFECYCLE,
} = contractsModule;
const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'output', 'playwright', 'qa-slice-01');
const flowOneRuntimeRoot = path.join(repoRoot, 'var', 'runtime-qa-slice-01-flow-1');
const flowTwoRuntimeRoot = path.join(repoRoot, 'var', 'runtime-qa-slice-01-flow-2');
const PLAYWRIGHT_BROWSER = process.env.QA_SLICE_01_PLAYWRIGHT_BROWSER || 'chrome';
const PLAYWRIGHT_CLI_VERSION = '0.1.1';
const playwrightConfigPath = path.join(outputRoot, 'playwright-cli.json');

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { force: true, recursive: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createMainRepoFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-01-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'qa-slice-01']);
  runGit(mainProjectPath, ['config', 'user.email', 'qa-slice-01@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  runGit(mainProjectPath, ['add', 'scoped.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    mainProjectPath: fs.realpathSync(mainProjectPath),
  };
}

function createLinkedWorktreeFixture(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-01-close-out-${label}-`));
  const mainProjectPath = path.join(fixtureRoot, 'main');
  const linkedProjectPath = path.join(fixtureRoot, 'linked');
  const branchName = `qa-slice-01-${label}`.replace(/[^A-Za-z0-9._-]/g, '-');

  fs.mkdirSync(mainProjectPath, { recursive: true });

  runGit(mainProjectPath, ['init', '-q']);
  runGit(mainProjectPath, ['config', 'user.name', 'qa-slice-01']);
  runGit(mainProjectPath, ['config', 'user.email', 'qa-slice-01@example.com']);

  fs.writeFileSync(path.join(mainProjectPath, 'scoped.txt'), 'base scoped\n', 'utf8');
  fs.writeFileSync(path.join(mainProjectPath, 'extra.txt'), 'base extra\n', 'utf8');
  runGit(mainProjectPath, ['add', 'scoped.txt', 'extra.txt']);
  runGit(mainProjectPath, ['commit', '-q', '-m', `fixture:${label}`]);
  runGit(mainProjectPath, ['worktree', 'add', '-q', '-b', branchName, linkedProjectPath]);

  return {
    fixtureRoot,
    linkedProjectPath: fs.realpathSync(linkedProjectPath),
    mainProjectPath: fs.realpathSync(mainProjectPath),
  };
}

function setScopedFile(projectPath, label) {
  fs.writeFileSync(path.join(projectPath, 'scoped.txt'), `scoped change ${label}\n`, 'utf8');
}

function createArtifactRun(runtime, taskId, options) {
  const run = runtime.startRun({
    taskId,
    kind: 'role',
    role: options.role,
    metadata: options.metadata || null,
  });
  const artifact = runtime.recordArtifact({
    taskId,
    runId: run.id,
    type: options.type,
    extension: options.extension || 'md',
    content: options.content,
  });
  const completedRun = runtime.completeRun({
    runId: run.id,
    summary: options.summary || null,
  });

  return {
    artifact,
    run: completedRun,
  };
}

function buildPreflightContent(taskTitle) {
  return `# Builder Preflight: ${taskTitle}

## Target Files
- scoped.txt

## Intended Changes
- keep close-out and release semantics unchanged while validating browser landing paths

## Risks
- none

## Verification Plan
- run close-out from the dedicated linked worktree happy path only

## Review Evidence Expectations
- review artifact must capture verdict and evidence

## Escalation Triggers
- escalate only when release or close-out guards disagree with runtime state

## Input Summary
- synthetic preflight fixture for qa-slice-01 browser smoke
`;
}

function buildChangeSummaryContent(preflightArtifactId, approvalId) {
  return `# Builder Live Mutation: synthetic

## Change Summary
- preflight artifact: ${preflightArtifactId}
- approval id: ${approvalId}
- target file allowlist count: 1
- prepared file updates: 1
- reviewer executed: no
- commit or release executed: no

## Target Files
- scoped.txt

## File Updates
### scoped.txt
\`\`\`base64
${Buffer.from('scoped change synthetic\n', 'utf8').toString('base64')}
\`\`\`

## Risks
- none

## Verification Notes
- synthetic live mutation bundle for qa-slice-01 browser smoke
`;
}

function buildPatchContent(label) {
  return `diff --git a/scoped.txt b/scoped.txt
index 1111111..2222222 100644
--- a/scoped.txt
+++ b/scoped.txt
@@ -1 +1 @@
-base scoped
+scoped change ${label}
`;
}

function buildDiffContent(label) {
  return `diff --git a/scoped.txt b/scoped.txt
index 1111111..2222222 100644
--- a/scoped.txt
+++ b/scoped.txt
@@ -1 +1 @@
-base scoped
+scoped change ${label}
`;
}

function createLiveMutationBundle(runtime, task, label) {
  const plan = createArtifactRun(runtime, task.id, {
    role: 'planner',
    type: 'plan',
    content: `# Plan: ${task.title}

## Slice Goal
Add a thin browser-level QA smoke without changing product semantics.
`,
  });
  const architecture = createArtifactRun(runtime, task.id, {
    role: 'architect',
    type: 'architecture',
    content: `# Architecture Note: ${task.title}

## Affected Components or Contracts
- scripts/smoke-qa-slice-01.mjs
- scripts/serve-ui-slice-01.mjs
- ui/app.js
`,
  });
  const breakdown = createArtifactRun(runtime, task.id, {
    role: 'task-breaker',
    type: 'breakdown',
    content: `# Task Breakdown: ${task.title}

## Ordered Sub-Tasks
- prepare dedicated linked worktree release-ready fixture
- validate Close Out browser landing path
- verify Done lane after close-out

## Review Trigger Point
- run reviewer after the latest builder live mutation bundle is available
`,
  });
  const preflight = createArtifactRun(runtime, task.id, {
    role: 'builder',
    type: 'preflight',
    content: buildPreflightContent(`${task.title} ${label}`),
    summary: {
      executionMode: 'preflight',
      mutationAllowed: false,
    },
  });
  const approval = runtime.createApprovalPlaceholder({
    taskId: task.id,
    scope: 'builder',
    allowedNextAction: BUILDER_ACTION.LIVE_MUTATION,
    targetArtifactId: preflight.artifact.id,
    targetRunId: preflight.run.id,
    title: `Approval required: synthetic builder live mutation ${label}`,
    prompt: `Approve the synthetic bundle ${label} for qa-slice-01 browser smoke.`,
  });

  runtime.resolveDecisionInboxItem({
    itemId: approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve the synthetic live mutation bundle ${label}.`,
  });

  const builderRun = runtime.startRun({
    taskId: task.id,
    kind: 'role',
    role: 'builder',
    metadata: {
      executionMode: 'live-mutation',
    },
  });

  runtime.appendLog({
    runId: builderRun.id,
    message: `synthetic builder live mutation run started for ${task.id} (${label})`,
  });
  runtime.appendLog({
    runId: builderRun.id,
    message: `anchored synthetic approval ${approval.id} to preflight ${preflight.artifact.id}`,
  });
  const changeSummary = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'change-summary',
    content: buildChangeSummaryContent(preflight.artifact.id, approval.id),
  });
  const patch = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'patch',
    extension: 'patch',
    content: buildPatchContent(label),
  });
  const diff = runtime.recordArtifact({
    taskId: task.id,
    runId: builderRun.id,
    type: 'diff',
    extension: 'diff',
    content: buildDiffContent(label),
  });
  const completedBuilderRun = runtime.completeRun({
    runId: builderRun.id,
    summary: {
      approvalId: approval.id,
      artifactIds: {
        changeSummary: changeSummary.id,
        patch: patch.id,
        diff: diff.id,
      },
      changedFiles: ['scoped.txt'],
      executionMode: 'live-mutation',
      inputArtifactIds: [
        plan.artifact.id,
        architecture.artifact.id,
        breakdown.artifact.id,
        preflight.artifact.id,
      ],
      inputRunIds: [plan.run.id, architecture.run.id, breakdown.run.id, preflight.run.id],
      approvalTargetArtifactId: preflight.artifact.id,
      approvalTargetRunId: preflight.run.id,
      preflightArtifactId: preflight.artifact.id,
      preflightRunId: preflight.run.id,
    },
  });

  return {
    approval,
    artifacts: {
      architecture: architecture.artifact,
      breakdown: breakdown.artifact,
      changeSummary,
      diff,
      patch,
      plan: plan.artifact,
      preflight: preflight.artifact,
    },
    runs: {
      builder: completedBuilderRun,
    },
  };
}

async function createReviewedBundle(runtime, coordinator, task, label) {
  const liveMutationBundle = createLiveMutationBundle(runtime, task, label);
  const review = await coordinator.runReviewer({
    taskId: task.id,
  });

  return {
    liveMutationBundle,
    review,
  };
}

async function createCloseOutReadyFixture(runtimeRoot, label) {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const coordinator = createExecutionCoordinator({
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
  });

  const fixture = createLinkedWorktreeFixture(label);
  const project = runtime.createProject({
    name: `qa-slice-01-close-out-${label}`,
    projectPath: fixture.linkedProjectPath,
  });
  const task = runtime.createTask({
    projectId: project.id,
    title: `QA slice 01 close-out ${label}`,
    intent: 'Close out from the dedicated linked worktree happy path without changing runtime semantics.',
  });

  setScopedFile(fixture.linkedProjectPath, label);

  const reviewed = await createReviewedBundle(runtime, coordinator, task, label);
  const commitPackage = await coordinator.runCommitPackage({ taskId: task.id });

  runtime.resolveDecisionInboxItem({
    itemId: commitPackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve commit approval for ${label}.`,
  });

  const localCommit = await coordinator.runLocalCommit({ taskId: task.id });
  runtime.setTaskWorktreeRef({
    taskId: task.id,
    worktreeRef: fixture.linkedProjectPath,
  });

  const releasePackage = await coordinator.runReleasePackage({ taskId: task.id });

  runtime.resolveDecisionInboxItem({
    itemId: releasePackage.approval.inboxItemId,
    action: APPROVAL_STATUS.APPROVED,
    note: `Approve ${RELEASE_ACTION.RELEASE_READY} for ${label}.`,
  });

  const closeOutReadiness = coordinator.getCloseOutReadiness({ taskId: task.id });

  assert.equal(closeOutReadiness.allowed, true);
  assert.equal(runtime.getTask(task.id).lifecycleState, TASK_LIFECYCLE.REVIEW);

  return {
    closeOutReadiness,
    fixture,
    project,
    releasePackage,
    reviewed,
    runtime,
    task,
    localCommit,
    commitPackage,
  };
}

async function waitForServer(baseUrl) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
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

  throw new Error(`Timed out waiting for UI server ${baseUrl}`);
}

function startUiServer(port, runtimeRoot) {
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

  return {
    async stop() {
      server.kill('SIGTERM');
      await delay(150);

      if (server.exitCode === null) {
        server.kill('SIGKILL');
      }

      if (stderr.trim()) {
        process.stderr.write(stderr);
      }
    },
  };
}

async function allocatePort() {
  return new Promise((resolve, reject) => {
    const probe = createNetServer();

    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();

      if (!address || typeof address === 'string') {
        probe.close(() => reject(new Error('Failed to allocate local UI smoke port.')));
        return;
      }

      const { port } = address;
      probe.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(port);
      });
    });
  });
}

async function fetchJson(baseUrl, pathname) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    headers: {
      Accept: 'application/json',
    },
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status} ${response.statusText}`);
  }

  return payload;
}

async function postJson(baseUrl, pathname, body = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status} ${response.statusText}`);
  }

  return payload;
}

async function waitForValue(check, label) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    let value = null;

    try {
      value = await check();
    } catch (_error) {
      value = null;
    }

    if (value) {
      return value;
    }

    await delay(200);
  }

  throw new Error(`Timed out waiting for ${label}`);
}

function buildPlaywrightCliCommand() {
  const override = String(process.env.QA_SLICE_01_PLAYWRIGHT_CLI_BIN || '').trim();

  if (override) {
    return override.endsWith('.js') ? [process.execPath, override] : [override];
  }

  return ['npx', '--yes', '--package', `@playwright/cli@${PLAYWRIGHT_CLI_VERSION}`, 'playwright-cli'];
}

function parsePlaywrightResult(output) {
  const match = String(output || '').match(/### Result\s*\n([\s\S]*?)(?=\n### |\s*$)/);

  if (!match) {
    return null;
  }

  return JSON.parse(match[1].trim());
}

function runPlaywrightCli(sessionName, args, options = {}) {
  const [command, ...baseArgs] = buildPlaywrightCliCommand();

  return execFileSync(command, [...baseArgs, ...args], {
    cwd: outputRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      PLAYWRIGHT_CLI_SESSION: sessionName,
    },
    maxBuffer: 10 * 1024 * 1024,
    timeout: options.timeoutMs || 120_000,
  });
}

function openPlaywrightSession(sessionName, url) {
  return runPlaywrightCli(sessionName, [
    'open',
    `--browser=${PLAYWRIGHT_BROWSER}`,
    `--config=${playwrightConfigPath}`,
    url,
  ]);
}

function closePlaywrightSession(sessionName) {
  try {
    const [command, ...baseArgs] = buildPlaywrightCliCommand();
    const child = spawn(command, [...baseArgs, 'close'], {
      cwd: outputRoot,
      env: {
        ...process.env,
        PLAYWRIGHT_CLI_SESSION: sessionName,
      },
      stdio: 'ignore',
      detached: true,
    });

    child.unref();
  } catch (_error) {
    // Best-effort cleanup only.
  }
}

function captureFailureScreenshot(sessionName, filename) {
  try {
    runPlaywrightCli(sessionName, ['screenshot', `--filename=${filename}`], {
      timeoutMs: 30_000,
    });
  } catch (_error) {
    // Best-effort capture only.
  }
}

function runCode(sessionName, codeBody) {
  const wrappedCode = `async page => {\n${codeBody}\n}`;

  return runPlaywrightCli(sessionName, ['run-code', wrappedCode]);
}

function evaluate(sessionName, expression) {
  return parsePlaywrightResult(runPlaywrightCli(sessionName, ['eval', expression]));
}

function jsLiteral(value) {
  return JSON.stringify(value);
}

function waitForSelector(sessionName, selector) {
  runCode(sessionName, `await page.locator(${jsLiteral(selector)}).waitFor();`);
}

function waitForEnabled(sessionName, selector) {
  runCode(
    sessionName,
    `await page.waitForFunction((selector) => {
      const element = document.querySelector(selector);
      return Boolean(element) && !element.disabled;
    }, ${jsLiteral(selector)});`,
  );
}

function fillInput(sessionName, selector, value) {
  runCode(
    sessionName,
    `{
      const element = document.querySelector(${jsLiteral(selector)});
      if (!element) {
        throw new Error('Missing input for fill: ' + ${jsLiteral(selector)});
      }
      element.focus();
      element.value = ${jsLiteral(value)};
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }`,
  );
}

function clickSelector(sessionName, selector) {
  runCode(
    sessionName,
    `{
      const element = document.querySelector(${jsLiteral(selector)});
      if (!element) {
        throw new Error('Missing element for click: ' + ${jsLiteral(selector)});
      }
      element.scrollIntoView({ block: 'center', inline: 'center' });
      element.click();
    }`,
  );
}

function submitForm(sessionName, selector) {
  runCode(
    sessionName,
    `{
      const form = document.querySelector(${jsLiteral(selector)});
      if (!form) {
        throw new Error('Missing form for submit: ' + ${jsLiteral(selector)});
      }
      form.requestSubmit();
    }`,
  );
}

function selectOption(sessionName, selector, value) {
  runCode(
    sessionName,
    `await page.locator(${jsLiteral(selector)}).selectOption(${jsLiteral(value)});`,
  );
}

async function runFlowOne() {
  const label = 'flow-1';
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const sessionName = `q1a${process.pid.toString(36)}`;
  const runtime = createRuntimeService({ runtimeRoot: flowOneRuntimeRoot });
  const fixture = createMainRepoFixture(label);
  const linkedWorktreeSlug = 'feature-qa-slice-01';
  const linkedWorktreePath = path.join(
    path.dirname(fixture.mainProjectPath),
    `${path.basename(fixture.mainProjectPath)}--${linkedWorktreeSlug}`,
  );
  let resolvedLinkedWorktreePath = null;

  runtime.resetRuntime();

  const server = startUiServer(port, flowOneRuntimeRoot);

  try {
    await waitForServer(baseUrl);
    openPlaywrightSession(sessionName, baseUrl);

    waitForSelector(sessionName, '[data-form="create-project-from-mission"] button');
    waitForEnabled(sessionName, '[data-form="create-project-from-mission"] button');
    assert.equal(
      evaluate(sessionName, `document.querySelector(${jsLiteral('[data-form="create-project-from-mission"] button')})?.textContent?.includes('이 프로젝트로 시작') || false`),
      true,
    );

    const afterRegister = await postJson(baseUrl, '/api/projects', {
      name: 'qa-slice-01-main',
      projectPath: fixture.mainProjectPath,
      provider: {
        adapter: 'local-stub',
        env: {
          apiKeyVar: '',
        },
        mode: 'local-stub',
        model: '',
      },
    });
    const mainProject = afterRegister.project;

    clickSelector(sessionName, '#refresh-button');

    await waitForValue(async () => {
      const activeProjectName = evaluate(
        sessionName,
        `document.querySelector('#active-project-name')?.textContent?.trim()`,
      );

      return activeProjectName === 'qa-slice-01-main' ? activeProjectName : null;
    }, 'mission refresh after first project registration');

    assert.equal(mainProject.projectPath, fixture.mainProjectPath);
    assert.equal(
      evaluate(sessionName, `document.querySelector('#active-project-name')?.textContent?.trim()`),
      'qa-slice-01-main',
    );

    clickSelector(sessionName, '.nav-button[data-surface="taskboard"]');
    waitForSelector(sessionName, '#surface-taskboard.is-active');

    const afterTask = await postJson(baseUrl, '/api/tasks', {
      title: 'QA slice 01 worktree relation',
      intent: 'Keep task.worktreeRef and active project_path relation inspectable through the shell.',
    });
    const task = afterTask.task;

    const afterLinkedWorktreeCreate = await postJson(
      baseUrl,
      `/api/projects/${encodeURIComponent(mainProject.id)}/linked-worktrees`,
      { slug: linkedWorktreeSlug },
    );
    resolvedLinkedWorktreePath = await waitForValue(
      async () => (fs.existsSync(linkedWorktreePath) ? fs.realpathSync(linkedWorktreePath) : null),
      'linked worktree path',
    );
    const linkedProject = afterLinkedWorktreeCreate.project;

    clickSelector(sessionName, '#refresh-button');

    await waitForValue(async () => {
      const activeProjectPath = evaluate(
        sessionName,
        `document.querySelector('#active-project-path')?.textContent || ''`,
      );

      return activeProjectPath.includes(resolvedLinkedWorktreePath) ? activeProjectPath : null;
    }, 'linked worktree refresh');

    assert.equal(linkedProject.projectPath, resolvedLinkedWorktreePath);

    await postJson(baseUrl, `/api/projects/${encodeURIComponent(mainProject.id)}/select`);
    await postJson(baseUrl, `/api/tasks/${encodeURIComponent(task.id)}/worktree-ref`, {
      worktreeRef: resolvedLinkedWorktreePath,
    });
    const afterWorktreeApply = await fetchJson(baseUrl, '/api/snapshot');
    assert.equal(afterWorktreeApply.snapshot.tasks[task.id].worktreeRef, resolvedLinkedWorktreePath);
    assert.equal(
      afterWorktreeApply.snapshot.projects[afterWorktreeApply.snapshot.activeProjectId].projectPath,
      fixture.mainProjectPath,
    );

    const afterLinkedProjectSwitch = await postJson(
      baseUrl,
      `/api/projects/${encodeURIComponent(linkedProject.id)}/select`,
    );
    assert.equal(afterLinkedProjectSwitch.snapshot.tasks[task.id].worktreeRef, resolvedLinkedWorktreePath);
    assert.equal(
      afterLinkedProjectSwitch.snapshot.projects[afterLinkedProjectSwitch.snapshot.activeProjectId].projectPath,
      resolvedLinkedWorktreePath,
    );

    return {
      linkedProjectId: linkedProject.id,
      linkedProjectPath: resolvedLinkedWorktreePath,
      mainProjectId: mainProject.id,
      taskId: task.id,
    };
  } catch (error) {
    captureFailureScreenshot(sessionName, 'flow-1-failure.png');
    throw error;
  } finally {
    closePlaywrightSession(sessionName);
    await server.stop();
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true });
  }
}

async function runFlowTwo() {
  const label = 'flow-2';
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const sessionName = `q1b${process.pid.toString(36)}`;
  const seeded = await createCloseOutReadyFixture(flowTwoRuntimeRoot, label);
  const server = startUiServer(port, flowTwoRuntimeRoot);

  try {
    await waitForServer(baseUrl);
    openPlaywrightSession(sessionName, baseUrl);

    clickSelector(sessionName, '.nav-button[data-surface="taskboard"]');
    waitForSelector(sessionName, '#surface-taskboard.is-active');

    const closeOutPayload = await postJson(
      baseUrl,
      `/api/tasks/${encodeURIComponent(seeded.task.id)}/run-close-out`,
    );

    assert.equal(closeOutPayload.mutation.kind, 'run-close-out');

    const afterCloseOut = await waitForValue(async () => {
      const snapshot = await fetchJson(baseUrl, '/api/snapshot');
      const closeOutArtifact = Object.values(snapshot.snapshot.artifacts).find(
        (artifact) => artifact.taskId === seeded.task.id && artifact.type === 'close-out',
      );
      const updatedTask = snapshot.snapshot.tasks[seeded.task.id];

      if (!closeOutArtifact || updatedTask?.lifecycleState !== TASK_LIFECYCLE.DONE) {
        return null;
      }

      return {
        closeOutArtifact,
        snapshot,
      };
    }, 'close-out completion');

    const closeOutArtifactPayload = await fetchJson(
      baseUrl,
      `/api/artifacts/${encodeURIComponent(afterCloseOut.closeOutArtifact.id)}`,
    );

    assert.equal(closeOutArtifactPayload.artifact.type, 'close-out');
    assert.match(closeOutArtifactPayload.artifact.content, /task lifecycle after close-out: Done/);
    assert.equal(
      afterCloseOut.snapshot.snapshot.tasks[seeded.task.id]?.lifecycleState,
      TASK_LIFECYCLE.DONE,
    );

    return {
      closeOutArtifactId: afterCloseOut.closeOutArtifact.id,
      releasePackageArtifactId: seeded.releasePackage.artifact.id,
      taskId: seeded.task.id,
    };
  } catch (error) {
    captureFailureScreenshot(sessionName, 'flow-2-failure.png');
    throw error;
  } finally {
    closePlaywrightSession(sessionName);
    await server.stop();
    fs.rmSync(seeded.fixture.fixtureRoot, { force: true, recursive: true });
  }
}

ensureCleanDir(outputRoot);
ensureCleanDir(flowOneRuntimeRoot);
ensureCleanDir(flowTwoRuntimeRoot);
fs.writeFileSync(
  playwrightConfigPath,
  `${JSON.stringify(
    {
      browser: {
        contextOptions: {
          viewport: {
            height: 960,
            width: 1440,
          },
        },
        launchOptions: {
          headless: true,
        },
      },
    },
    null,
    2,
  )}\n`,
  'utf8',
);

const flowOne = await runFlowOne();
const flowTwo = await runFlowTwo();

console.log(
  JSON.stringify(
    {
      ok: true,
      outputRoot,
      playwright: {
        browser: PLAYWRIGHT_BROWSER,
        cliMode: process.env.QA_SLICE_01_PLAYWRIGHT_CLI_BIN ? 'override' : 'npx-fixed',
        cliVersion: PLAYWRIGHT_CLI_VERSION,
      },
      scenarios: {
        flowOne,
        flowTwo,
      },
    },
    null,
    2,
  ),
);
