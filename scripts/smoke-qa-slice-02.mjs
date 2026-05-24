import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const outputRoot = path.join(repoRoot, 'output', 'playwright', 'qa-slice-02');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-qa-slice-02');
const PLAYWRIGHT_BROWSER = process.env.QA_SLICE_02_PLAYWRIGHT_BROWSER || 'chrome';
const PLAYWRIGHT_CLI_VERSION = '0.1.1';
const playwrightConfigPath = path.join(outputRoot, 'playwright-cli.json');
const sentinelSecret = 'qa-slice-02-secret-sentinel-explicit';
const liveProviderEnvVar = 'QA_SLICE_02_LIVE_PROVIDER_API_KEY';
const MISSION_BOOTSTRAP_LANDING_PATTERN = /Start With This Project|이 프로젝트로 시작/i;
const MISSION_BOOTSTRAP_CONTEXT_PATTERN =
  /Mission Start|Mission Project Access|Start With This Project|미션 시작|프로젝트를 먼저 고른 뒤 미션을 만듭니다|로컬 프로젝트 경로를 먼저 등록하세요/i;
const MISSION_READY_PATTERN = /Create Mission|Mission title|신규 안건 등록|접수 인계/i;
const TASKBOARD_READY_PATTERN = /provider readiness:ready|프로바이더준비:준비됨/i;
const TASK_CREATE_PATTERN = /Create Task|새 실행 셀|실행 셀 추가/i;
const RUN_PLANNER_PATTERN = /Run Planner|플래너 실행/i;
const DISABLED_RUN_PLANNER_BUTTON_PATTERN = /button "(?:Run Planner|플래너 실행)" \[disabled\]/i;
const PROVIDER_NOT_CONFIGURED_PATTERN = /provider readiness:not-configured|프로바이더준비:미설정/i;

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

function createFixtureProject(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-02-${label}-`));
  const projectPath = path.join(fixtureRoot, 'project');

  fs.mkdirSync(projectPath, { recursive: true });
  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'qa-slice-02']);
  runGit(projectPath, ['config', 'user.email', 'qa-slice-02@example.com']);
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(projectPath, ['add', 'README.md']);
  runGit(projectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    projectPath: fs.realpathSync(projectPath),
  };
}

function countRuns(snapshot, taskId) {
  return Object.values(snapshot.runs).filter((run) => run.taskId === taskId).length;
}

function countArtifacts(snapshot, taskId, type = null) {
  return Object.values(snapshot.artifacts).filter(
    (artifact) => artifact.taskId === taskId && (!type || artifact.type === type),
  ).length;
}

function scanFilesForSecret(rootPath, secret) {
  const matches = [];

  function visit(currentPath) {
    if (!fs.existsSync(currentPath)) {
      return;
    }

    const stat = fs.statSync(currentPath);

    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(currentPath)) {
        visit(path.join(currentPath, entry));
      }
      return;
    }

    const content = fs.readFileSync(currentPath, 'utf8');

    if (content.includes(secret)) {
      matches.push(currentPath);
    }
  }

  visit(rootPath);
  return matches;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function assertSecretAbsent(value, secret, label) {
  assert.doesNotMatch(String(value || ''), new RegExp(escapeRegExp(secret)));
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

async function allocatePort() {
  return new Promise((resolve, reject) => {
    const server = createNetServer();

    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      server.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

function startUiServer(port, runtimeRootPath) {
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRootPath],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        [liveProviderEnvVar]: sentinelSecret,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let stderr = '';
  let stdout = '';

  server.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
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

      if (server.exitCode !== 0 && stdout.trim()) {
        process.stdout.write(stdout);
      }
    },
  };
}

async function fetchJson(baseUrl, pathname) {
  const response = await fetchWithRetry(`${baseUrl}${pathname}`, {
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

async function postJsonAllowError(baseUrl, pathname, body = {}) {
  const response = await fetchWithRetry(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  return {
    payload,
    status: response.status,
  };
}

async function postJson(baseUrl, pathname, body = {}) {
  const response = await postJsonAllowError(baseUrl, pathname, body);

  if (response.status < 200 || response.status >= 300) {
    throw new Error(response.payload?.error || `Request failed: ${response.status}`);
  }

  return response.payload;
}

async function fetchWithRetry(url, options = {}, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (attempt === attempts - 1) {
        throw error;
      }

      await delay(200);
    }
  }

  throw new Error(`Failed to fetch ${url}`);
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

async function waitForSnapshotPayload(baseUrl, label, predicate = null) {
  return waitForValue(async () => {
    try {
      const snapshotPayload = await fetchJson(baseUrl, '/api/snapshot');

      if (typeof predicate === 'function' && !predicate(snapshotPayload)) {
        return null;
      }

      return snapshotPayload;
    } catch (_error) {
      return null;
    }
  }, label);
}

function buildPlaywrightCliCommand() {
  const override = String(process.env.QA_SLICE_02_PLAYWRIGHT_CLI_BIN || '').trim();

  if (override) {
    return override.endsWith('.js') ? [process.execPath, override] : [override];
  }

  return ['npx', '--yes', '--package', `@playwright/cli@${PLAYWRIGHT_CLI_VERSION}`, 'playwright-cli'];
}

function runPlaywrightCli(sessionName, args, options = {}) {
  const [command, ...baseArgs] = buildPlaywrightCliCommand();

  return execFileSync(command, [...baseArgs, '--session', sessionName, ...args], {
    cwd: outputRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
    timeout: options.timeoutMs || 120_000,
  });
}

function parsePlaywrightResult(output) {
  const match = String(output || '').match(/### Result\s*\n([\s\S]*?)(?=\n### |\s*$)/);

  if (!match) {
    return null;
  }

  return JSON.parse(match[1].trim());
}

function evaluate(sessionName, expression) {
  return parsePlaywrightResult(
    runPlaywrightCli(sessionName, ['eval', expression], {
      timeoutMs: 60_000,
    }),
  );
}

function runCode(sessionName, codeBody, options = {}) {
  const wrappedCode = `async page => {\n${codeBody}\n}`;

  return runPlaywrightCli(sessionName, ['run-code', wrappedCode], {
    timeoutMs: options.timeoutMs || 60_000,
  });
}

function waitForInitialRefresh(sessionName) {
  runCode(
    sessionName,
    `await page.waitForFunction(() => {
      return document.querySelector('#refresh-status')?.textContent?.includes('최근 갱신');
    });`,
  );
}

function refreshQaSnapshot(sessionName) {
  runCode(
    sessionName,
    `await page.evaluate(async () => {
      if (typeof window.__orchestrationQa?.refresh !== 'function') {
        throw new Error('QA refresh hook unavailable');
      }

      await window.__orchestrationQa.refresh();
    });`,
  );
}

function openQaSurface(sessionName, surface, options = {}) {
  runCode(
    sessionName,
    `await page.evaluate(({ surface, options }) => {
      if (typeof window.__orchestrationQa?.openSurface !== 'function') {
        throw new Error('QA openSurface hook unavailable');
      }

      if (!window.__orchestrationQa.openSurface(surface, options)) {
        throw new Error(\`Unable to open QA surface: \${surface}\`);
      }
    }, { surface: ${jsLiteral(surface)}, options: ${jsLiteral(options)} });`,
  );
}

function jsLiteral(value) {
  return JSON.stringify(value);
}

function openPlaywrightSession(sessionName, url) {
  runPlaywrightCli(sessionName, [
    'open',
    `--browser=${PLAYWRIGHT_BROWSER}`,
    `--config=${playwrightConfigPath}`,
    url,
  ]);
}

function closePlaywrightSession(sessionName) {
  try {
    runPlaywrightCli(sessionName, ['close'], {
      timeoutMs: 30_000,
    });
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

function clickRef(sessionName, ref) {
  runPlaywrightCli(sessionName, ['click', ref], {
    timeoutMs: 60_000,
  });
  return true;
}

function fillRef(sessionName, ref, value) {
  runPlaywrightCli(sessionName, ['fill', ref, String(value)], {
    timeoutMs: 60_000,
  });
  return true;
}

function typeText(sessionName, value) {
  runPlaywrightCli(sessionName, ['type', String(value)], {
    timeoutMs: 60_000,
  });
  return true;
}

function selectRef(sessionName, ref, value) {
  runPlaywrightCli(sessionName, ['select', ref, String(value)], {
    timeoutMs: 60_000,
  });
  return true;
}

function getSnapshotDirectory() {
  return path.join(outputRoot, '.playwright-cli');
}

function readLatestAccessibilitySnapshot() {
  const snapshotDir = getSnapshotDirectory();
  const snapshotPaths = fs
    .readdirSync(snapshotDir)
    .filter((entry) => entry.startsWith('page-') && entry.endsWith('.yml'))
    .map((entry) => {
      const filePath = path.join(snapshotDir, entry);
      return {
        filePath,
        mtimeMs: fs.statSync(filePath).mtimeMs,
      };
    })
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  if (snapshotPaths.length === 0) {
    throw new Error('No Playwright accessibility snapshot was captured');
  }

  return fs.readFileSync(snapshotPaths[0].filePath, 'utf8');
}

function snapshotPage(sessionName) {
  runPlaywrightCli(sessionName, ['snapshot'], {
    timeoutMs: 60_000,
  });
  return readLatestAccessibilitySnapshot();
}

function findRef(snapshotText, pattern, label) {
  const match = String(snapshotText).match(pattern);

  if (!match) {
    throw new Error(`Missing ${label} in Playwright snapshot`);
  }

  return match[1];
}

function clickSelector(sessionName, selector) {
  runCode(sessionName, `await page.locator(${jsLiteral(selector)}).click();`);
  return true;
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
  runCode(sessionName, `await page.locator(${jsLiteral(selector)}).fill(${jsLiteral(String(value))});`);
  return true;
}

function selectOption(sessionName, selector, value) {
  runCode(
    sessionName,
    `await page.locator(${jsLiteral(selector)}).selectOption(${jsLiteral(String(value))});`,
  );
  return true;
}

function getText(sessionName, selector) {
  return evaluate(
    sessionName,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      return element ? (element.textContent || '').replace(/\\s+/g, ' ').trim() : null;
    })()`,
  );
}

function getValue(sessionName, selector) {
  return evaluate(
    sessionName,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      return element ? element.value ?? null : null;
    })()`,
  );
}

function getBodyText(sessionName) {
  return evaluate(
    sessionName,
    `document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : ''`,
  );
}

function isDisabled(sessionName, selector) {
  return evaluate(
    sessionName,
    `(() => {
      const element = document.querySelector(${JSON.stringify(selector)});
      return element ? Boolean(element.disabled) : null;
    })()`,
  );
}

function findTaskByTitle(snapshotPayload, title) {
  return Object.values(snapshotPayload.snapshot.tasks).find((task) => task.title === title) || null;
}

function findLatestArtifact(snapshotPayload, taskId, type) {
  return Object.values(snapshotPayload.snapshot.artifacts)
    .filter((artifact) => artifact.taskId === taskId && artifact.type === type)
    .sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))[0] || null;
}

async function expectPlannerApiFailClosed(baseUrl, taskId, expectedPattern, expectedCounts) {
  const response = await postJsonAllowError(baseUrl, `/api/tasks/${encodeURIComponent(taskId)}/run-planner`);

  assert.equal(response.status, 400);
  assert.match(response.payload.error || '', expectedPattern);

  const snapshotPayload = await waitForSnapshotPayload(
    baseUrl,
    'planner fail-closed snapshot',
    (payload) =>
      countRuns(payload.snapshot, taskId) === expectedCounts.runs &&
      countArtifacts(payload.snapshot, taskId, 'plan') === expectedCounts.planArtifacts,
  );

  assert.equal(countRuns(snapshotPayload.snapshot, taskId), expectedCounts.runs);
  assert.equal(countArtifacts(snapshotPayload.snapshot, taskId, 'plan'), expectedCounts.planArtifacts);

  return response.payload.error || '';
}

async function scanApiPayloadsForSecret(baseUrl, snapshotPayload, secret) {
  assertSecretAbsent(JSON.stringify(snapshotPayload), secret, 'snapshot payload');

  for (const run of Object.values(snapshotPayload.snapshot.runs)) {
    const logsPayload = await fetchJson(baseUrl, `/api/runs/${encodeURIComponent(run.id)}/logs`);

    assertSecretAbsent(JSON.stringify(logsPayload), secret, `run logs payload ${run.id}`);
  }

  for (const artifact of Object.values(snapshotPayload.snapshot.artifacts)) {
    const artifactPayload = await fetchJson(
      baseUrl,
      `/api/artifacts/${encodeURIComponent(artifact.id)}`,
    );

    assertSecretAbsent(JSON.stringify(artifactPayload), secret, `artifact payload ${artifact.id}`);
  }
}

async function waitForSnapshotText(sessionName, pattern, label) {
  return waitForValue(async () => {
    const snapshotText = snapshotPage(sessionName);

    return pattern.test(snapshotText) ? snapshotText : null;
  }, label);
}

async function runFlow() {
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const sessionName = 'qa-slice-02';
  const runtime = createRuntimeService({ runtimeRoot });
  const fixture = createFixtureProject('provider-opt-in');
  const taskTitle = 'QA slice 02 provider opt-in';
  const taskIntent =
    'Verify provider opt-in UI state and fail-closed behavior without changing runtime semantics.';

  runtime.resetRuntime();

  const server = startUiServer(port, runtimeRoot);

  try {
    await waitForServer(baseUrl);
    openPlaywrightSession(sessionName, baseUrl);
    waitForInitialRefresh(sessionName);
    const bootstrapSnapshot = await waitForSnapshotText(
      sessionName,
      MISSION_BOOTSTRAP_LANDING_PATTERN,
      'project bootstrap landing',
    );

    assert.match(bootstrapSnapshot, MISSION_BOOTSTRAP_CONTEXT_PATTERN);
    assertSecretAbsent(bootstrapSnapshot, sentinelSecret, 'mission bootstrap snapshot');

    const afterRegister = await postJson(baseUrl, '/api/projects', {
      name: 'qa-slice-02',
      projectPath: fixture.projectPath,
      provider: {
        adapter: 'local-stub',
        env: {
          apiKeyVar: '',
        },
        mode: 'local-stub',
        model: '',
      },
    });
    refreshQaSnapshot(sessionName);
    const projectId = afterRegister.project.id;
    const projectSummary = afterRegister.derived.providerExecutionSummaries[projectId];

    assert.equal(projectSummary.mode, 'local-stub');
    assert.equal(projectSummary.adapter, 'local-stub');
    assert.equal(projectSummary.readiness, 'ready');
    assert.equal(projectSummary.allowed, true);
    assert.deepEqual(projectSummary.reasons, []);
    const registeredMissionSnapshot = await waitForSnapshotText(
      sessionName,
      MISSION_READY_PATTERN,
      'mission snapshot after project registration',
    );

    assert.match(registeredMissionSnapshot, /Mission|미션|안건/i);
    assertSecretAbsent(
      registeredMissionSnapshot,
      sentinelSecret,
      'mission snapshot after project registration',
    );
    openQaSurface(sessionName, 'taskboard');

    const registeredTaskboardSnapshot = await waitForSnapshotText(
      sessionName,
      TASKBOARD_READY_PATTERN,
      'provider readiness ready DOM',
    );

    assert.match(registeredTaskboardSnapshot, /provider:local-stub|프로바이더:local-stub/i);
    assertSecretAbsent(
      registeredTaskboardSnapshot,
      sentinelSecret,
      'taskboard snapshot after project registration',
    );
    assert.match(registeredTaskboardSnapshot, TASK_CREATE_PATTERN);

    const afterTaskPayload = await postJson(baseUrl, '/api/tasks', {
      intent: taskIntent,
      title: taskTitle,
    });
    refreshQaSnapshot(sessionName);
    const afterTask = {
      snapshotPayload: afterTaskPayload,
      task: afterTaskPayload.task,
    };
    const taskId = afterTask.task.id;
    const runPlannerSelector = `[data-action="run-planner"][data-id="${taskId}"]`;
    openQaSurface(sessionName, 'taskboard', { taskId });
    const taskReadySnapshot = await waitForSnapshotText(
      sessionName,
      RUN_PLANNER_PATTERN,
      'task actions visible',
    );

    assertSecretAbsent(taskReadySnapshot, sentinelSecret, 'taskboard snapshot after task creation');
    waitForSelector(sessionName, runPlannerSelector);
    waitForEnabled(sessionName, runPlannerSelector);
    const localStubPlannerPayload = await postJson(
      baseUrl,
      `/api/tasks/${encodeURIComponent(taskId)}/run-planner`,
    );
    assert.equal(localStubPlannerPayload.mutation.kind, 'run-planner');

    const afterLocalStubPlanner = await waitForValue(async () => {
      const snapshotPayload = await fetchJson(baseUrl, '/api/snapshot');
      const task = snapshotPayload.snapshot.tasks[taskId];
      const planArtifact = findLatestArtifact(snapshotPayload, taskId, 'plan');

      if (!task?.latestRunId || !planArtifact) {
        return null;
      }

      return {
        planArtifact,
        run: snapshotPayload.snapshot.runs[task.latestRunId],
        snapshotPayload,
      };
    }, 'local-stub planner run');
    const localStubRunId = afterLocalStubPlanner.run.id;
    const localStubPlanArtifactId = afterLocalStubPlanner.planArtifact.id;

    assert.equal(afterLocalStubPlanner.run.summary.adapter, 'local-stub');
    assert.equal(countRuns(afterLocalStubPlanner.snapshotPayload.snapshot, taskId), 1);
    assert.equal(countArtifacts(afterLocalStubPlanner.snapshotPayload.snapshot, taskId, 'plan'), 1);
    refreshQaSnapshot(sessionName);
    const plannerTaskboardSnapshot = await waitForSnapshotText(
      sessionName,
      new RegExp(escapeRegExp(localStubPlanArtifactId)),
      'taskboard after local-stub planner',
    );

    assertSecretAbsent(
      plannerTaskboardSnapshot,
      sentinelSecret,
      'taskboard snapshot after local-stub planner',
    );

    openQaSurface(sessionName, 'logs');

    const logsSnapshot = await waitForSnapshotText(
      sessionName,
      new RegExp(escapeRegExp(localStubRunId)),
      'logs DOM',
    );

    assertSecretAbsent(logsSnapshot, sentinelSecret, 'logs snapshot');

    openQaSurface(sessionName, 'artifacts');

    const artifactsSnapshot = await waitForSnapshotText(
      sessionName,
      new RegExp(escapeRegExp(localStubPlanArtifactId)),
      'artifacts DOM',
    );

    assertSecretAbsent(artifactsSnapshot, sentinelSecret, 'artifacts snapshot');

    openQaSurface(sessionName, 'taskboard', { taskId });

    const providerReadySnapshot = await waitForSnapshotText(
      sessionName,
      TASKBOARD_READY_PATTERN,
      'provider form ready on taskboard',
    );

    await postJson(baseUrl, `/api/projects/${encodeURIComponent(projectId)}/provider-config`, {
      provider: {
        mode: 'live',
      },
    });
    refreshQaSnapshot(sessionName);
    openQaSurface(sessionName, 'taskboard', { taskId });

    const liveProviderSnapshot = await waitForSnapshotText(
      sessionName,
      PROVIDER_NOT_CONFIGURED_PATTERN,
      'invalid provider live mode rendered',
    );
    assert.match(liveProviderSnapshot, /provider:openai-responses|프로바이더:openai-responses/i);

    const afterInvalidProviderUpdate = await waitForValue(async () => {
      const snapshotPayload = await fetchJson(baseUrl, '/api/snapshot');
      const summary = snapshotPayload.derived.providerExecutionSummaries[projectId];

      return summary?.readiness === 'not-configured' ? snapshotPayload : null;
    }, 'invalid live provider config');
    const invalidSummary = afterInvalidProviderUpdate.derived.providerExecutionSummaries[projectId];

    assert.equal(invalidSummary.allowed, false);
    assert.match(invalidSummary.reasons.join('; '), /model is required/i);
    assert.match(invalidSummary.reasons.join('; '), /apiKey env var is required/i);
    const invalidProviderSnapshot = await waitForSnapshotText(
      sessionName,
      /live provider model is required before execution/i,
      'invalid provider DOM',
    );

    assert.match(invalidProviderSnapshot, PROVIDER_NOT_CONFIGURED_PATTERN);
    assertSecretAbsent(
      invalidProviderSnapshot,
      sentinelSecret,
      'taskboard snapshot after invalid provider update',
    );
    assert.match(invalidProviderSnapshot, DISABLED_RUN_PLANNER_BUTTON_PATTERN);

    refreshQaSnapshot(sessionName);
    const invalidRefreshSnapshot = await waitForSnapshotText(
      sessionName,
      /live provider model is required before execution/i,
      'invalid provider refresh status',
    );

    assert.match(invalidRefreshSnapshot, /live provider model is required before execution/);
    const expectedCounts = {
      planArtifacts: 1,
      runs: 1,
    };
    const afterInvalidBrowserFailure = await waitForSnapshotPayload(
      baseUrl,
      'snapshot after invalid provider browser failure',
      (payload) =>
        countRuns(payload.snapshot, taskId) === expectedCounts.runs &&
        countArtifacts(payload.snapshot, taskId, 'plan') === expectedCounts.planArtifacts,
    );

    assert.equal(countRuns(afterInvalidBrowserFailure.snapshot, taskId), expectedCounts.runs);
    assert.equal(
      countArtifacts(afterInvalidBrowserFailure.snapshot, taskId, 'plan'),
      expectedCounts.planArtifacts,
    );

    const invalidApiError = await expectPlannerApiFailClosed(
      baseUrl,
      taskId,
      /model is required/i,
      expectedCounts,
    );
    const finalSnapshotPayload = await fetchJson(baseUrl, '/api/snapshot');

    await scanApiPayloadsForSecret(baseUrl, finalSnapshotPayload, sentinelSecret);

    const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, sentinelSecret);

    assert.deepEqual(runtimeSecretMatches, []);

    return {
      invalidApiError,
      invalidSummary: {
        allowed: invalidSummary.allowed,
        readiness: invalidSummary.readiness,
      },
      localStubPlanArtifactId,
      localStubRunId,
      projectId,
      runtimeRoot,
      taskId,
    };
  } catch (error) {
    try {
      fs.writeFileSync(
        path.join(outputRoot, 'qa-slice-02-console.txt'),
        runPlaywrightCli(sessionName, ['console'], {
          timeoutMs: 30_000,
        }),
        'utf8',
      );
    } catch (_consoleError) {
      // Best-effort debug capture only.
    }

    try {
      fs.writeFileSync(
        path.join(outputRoot, 'qa-slice-02-network.txt'),
        runPlaywrightCli(sessionName, ['network'], {
          timeoutMs: 30_000,
        }),
        'utf8',
      );
    } catch (_networkError) {
      // Best-effort debug capture only.
    }

    captureFailureScreenshot(sessionName, 'qa-slice-02-failure.png');
    throw error;
  } finally {
    closePlaywrightSession(sessionName);
    await server.stop();
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true });
  }
}

ensureCleanDir(outputRoot);
ensureCleanDir(runtimeRoot);
fs.mkdirSync(getSnapshotDirectory(), { recursive: true });
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

const flow = await runFlow();

console.log(
  JSON.stringify(
    {
      ok: true,
      outputRoot,
      playwright: {
        browser: PLAYWRIGHT_BROWSER,
        cliMode: process.env.QA_SLICE_02_PLAYWRIGHT_CLI_BIN ? 'override' : 'npx-fixed',
        cliVersion: PLAYWRIGHT_CLI_VERSION,
      },
      scenario: flow,
    },
    null,
    2,
  ),
);
