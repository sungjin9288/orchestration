import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createRuntimeService } = runtimeServiceModule;

const repoRoot = process.cwd();
const PLAYWRIGHT_CLI_VERSION = '0.1.1';

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
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-03-${label}-`));
  const projectPath = path.join(fixtureRoot, 'project');

  fs.mkdirSync(projectPath, { recursive: true });
  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'qa-slice-03']);
  runGit(projectPath, ['config', 'user.email', 'qa-slice-03@example.com']);
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(projectPath, ['add', 'README.md']);
  runGit(projectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    projectPath: fs.realpathSync(projectPath),
  };
}

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
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
  assert.doesNotMatch(String(value || ''), new RegExp(escapeRegExp(secret)), label);
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

function startUiServer(port, runtimeRootPath, childEnv) {
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRootPath],
    {
      cwd: repoRoot,
      env: childEnv,
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
    getStderr() {
      return stderr;
    },
    getStdout() {
      return stdout;
    },
    async stop() {
      server.kill('SIGTERM');
      await delay(150);

      if (server.exitCode === null) {
        server.kill('SIGKILL');
      }
    },
  };
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

function buildPlaywrightCliCommand(playwrightCliBinEnvVar) {
  const override = String(process.env[playwrightCliBinEnvVar] || '').trim();

  if (override) {
    return override.endsWith('.js') ? [process.execPath, override] : [override];
  }

  return ['npx', '--yes', '--package', `@playwright/cli@${PLAYWRIGHT_CLI_VERSION}`, 'playwright-cli'];
}

function runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, args, options = {}) {
  const [command, ...baseArgs] = buildPlaywrightCliCommand(playwrightCliBinEnvVar);

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

function evaluate(sessionName, outputRoot, playwrightCliBinEnvVar, expression) {
  return parsePlaywrightResult(
    runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['eval', expression], {
      timeoutMs: 60_000,
    }),
  );
}

function runCode(sessionName, outputRoot, playwrightCliBinEnvVar, codeBody, options = {}) {
  const wrappedCode = `async page => {\n${codeBody}\n}`;

  return runPlaywrightCli(
    sessionName,
    outputRoot,
    playwrightCliBinEnvVar,
    ['run-code', wrappedCode],
    {
      timeoutMs: options.timeoutMs || 60_000,
    },
  );
}

function jsLiteral(value) {
  return JSON.stringify(value);
}

function openPlaywrightSession(
  sessionName,
  baseUrl,
  outputRoot,
  playwrightCliBinEnvVar,
  playwrightBrowser,
  playwrightConfigPath,
) {
  const [command, ...baseArgs] = buildPlaywrightCliCommand(playwrightCliBinEnvVar);
  const child = spawn(
    command,
    [
      ...baseArgs,
      '--session',
      sessionName,
      'open',
      `--browser=${playwrightBrowser}`,
      `--config=${playwrightConfigPath}`,
      baseUrl,
    ],
    {
      cwd: outputRoot,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  let stderr = '';
  let stdout = '';

  child.stdout.on('data', (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  return {
    getStderr() {
      return stderr;
    },
    getStdout() {
      return stdout;
    },
    async waitUntilReady() {
      await delay(8_000);

      if (child.exitCode !== null && child.exitCode !== 0) {
        throw new Error(
          `Playwright open failed with code ${child.exitCode}: ${stderr || stdout || 'no output'}`,
        );
      }
    },
    stop() {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
      }
    },
  };
}

function closePlaywrightSession(sessionName, outputRoot, playwrightCliBinEnvVar) {
  try {
    runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['close'], {
      timeoutMs: 30_000,
    });
  } catch (_error) {
    // Best-effort cleanup only.
  }
}

function captureFailureScreenshot(sessionName, outputRoot, playwrightCliBinEnvVar, filename) {
  try {
    runPlaywrightCli(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      ['screenshot', `--filename=${filename}`],
      {
        timeoutMs: 30_000,
      },
    );
  } catch (_error) {
    // Best-effort capture only.
  }
}

function getSnapshotDirectory(outputRoot) {
  return path.join(outputRoot, '.playwright-cli');
}

function readLatestAccessibilitySnapshot(outputRoot) {
  const snapshotDir = getSnapshotDirectory(outputRoot);
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

function snapshotPage(sessionName, outputRoot, playwrightCliBinEnvVar) {
  runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['snapshot'], {
    timeoutMs: 60_000,
  });
  return readLatestAccessibilitySnapshot(outputRoot);
}

function findRef(snapshotText, pattern, label) {
  const match = String(snapshotText).match(pattern);

  if (!match) {
    throw new Error(`Missing ${label} in Playwright snapshot`);
  }

  return match[1];
}

function clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, ref) {
  runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['click', ref], {
    timeoutMs: 60_000,
  });
  return true;
}

function fillInput(sessionName, outputRoot, playwrightCliBinEnvVar, selector, value) {
  runCode(
    sessionName,
    outputRoot,
    playwrightCliBinEnvVar,
    `await page.locator(${jsLiteral(selector)}).fill(${jsLiteral(String(value))});`,
  );
  return true;
}

function selectOption(sessionName, outputRoot, playwrightCliBinEnvVar, selector, value) {
  runCode(
    sessionName,
    outputRoot,
    playwrightCliBinEnvVar,
    `await page.locator(${jsLiteral(selector)}).selectOption(${jsLiteral(String(value))});`,
  );
  return true;
}

function getBodyText(sessionName, outputRoot, playwrightCliBinEnvVar) {
  return evaluate(
    sessionName,
    outputRoot,
    playwrightCliBinEnvVar,
    `document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : ''`,
  );
}

async function waitForSnapshotText(
  sessionName,
  outputRoot,
  playwrightCliBinEnvVar,
  pattern,
  label,
) {
  return waitForValue(async () => {
    const snapshotText = snapshotPage(sessionName, outputRoot, playwrightCliBinEnvVar);

    return pattern.test(snapshotText) ? snapshotText : null;
  }, label);
}

function findLatestArtifact(snapshotPayload, taskId, type) {
  return Object.values(snapshotPayload.snapshot.artifacts)
    .filter((artifact) => artifact.taskId === taskId && artifact.type === type)
    .sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))[0] || null;
}

async function expectApiFailure(baseUrl, pathname, expectedPattern) {
  const response = await postJsonAllowError(baseUrl, pathname);

  assert.equal(response.status, 400);
  assert.match(response.payload.error || '', expectedPattern);

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

function createSyntheticPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify qa-slice-03 planner-only live browser/API execution.

## Intended Outcome
Run planner through openai-responses from the UI, store a plan artifact, and confirm planner-only live gating.

## Acceptance Target
- live planner opt-in is explicit
- planner run succeeds and records providerRunId
- non-planner roles remain blocked

## Verification Approach
- browser click-through plus snapshot/log/artifact API assertions
`;
}

function createSyntheticPlannerResponse(label) {
  return {
    status: 200,
    payload: {
      id: `resp-${label}`,
      model: 'qa-slice-03-synthetic-model',
      output_text: JSON.stringify({
        artifactMarkdown: createSyntheticPlannerArtifactMarkdown(label),
        normalizedResult: {
          blockers: [],
          needsDecision: false,
          nextStage: 'architect',
          summary: 'Planner output is ready for architect handoff.',
          decisionTitle: '',
          decisionPrompt: '',
        },
      }),
      usage: {
        input_tokens: 12,
        output_tokens: 24,
        total_tokens: 36,
      },
    },
  };
}

export async function runQaSlice03(config) {
  const {
    apiKeyEnvVarName,
    apiKeyValue,
    captureFilePath = null,
    label,
    model,
    outputRoot,
    playwrightBrowser,
    playwrightCliBinEnvVar,
    runtimeRoot,
    sessionName,
    syntheticFetchPayloads = null,
  } = config;

  ensureCleanDir(outputRoot);
  ensureCleanDir(runtimeRoot);
  fs.mkdirSync(getSnapshotDirectory(outputRoot), { recursive: true });

  const playwrightConfigPath = path.join(outputRoot, 'playwright-cli.json');
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

  const fixture = createFixtureProject(label);
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const runtime = createRuntimeService({ runtimeRoot });
  const childEnv = {
    ...process.env,
    [apiKeyEnvVarName]: apiKeyValue,
  };
  const previousApiKeyEnvValue = process.env[apiKeyEnvVarName];

  process.env[apiKeyEnvVarName] = apiKeyValue;

  if (syntheticFetchPayloads) {
    const preloadPath = path.join(repoRoot, 'scripts', 'openai-responses-fetch-preload.cjs');
    const existingNodeOptions = String(process.env.NODE_OPTIONS || '').trim();
    const preloadOption = `--require=${preloadPath}`;

    childEnv.NODE_OPTIONS = existingNodeOptions
      ? `${existingNodeOptions} ${preloadOption}`
      : preloadOption;
    childEnv.QA_SLICE_03_OPENAI_FETCH_STUB_PAYLOADS = JSON.stringify(syntheticFetchPayloads);

    if (captureFilePath) {
      childEnv.QA_SLICE_03_OPENAI_FETCH_CAPTURE_PATH = captureFilePath;
    }
  }

  runtime.resetRuntime();

  const server = startUiServer(port, runtimeRoot, childEnv);
  const browserSession = openPlaywrightSession(
    sessionName,
    baseUrl,
    outputRoot,
    playwrightCliBinEnvVar,
    playwrightBrowser,
    playwrightConfigPath,
  );

  try {
    await waitForServer(baseUrl);
    await browserSession.waitUntilReady();

    const bootstrapSnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      /Register Project/,
      'project bootstrap landing',
    );
    const bootstrapRefreshRef = findRef(
      bootstrapSnapshot,
      /button "Refresh" \[ref=(e\d+)\]/,
      'Refresh button on bootstrap page',
    );

    assert.match(bootstrapSnapshot, /option "local-stub" \[selected\]/i);
    assertSecretAbsent(bootstrapSnapshot, apiKeyValue, 'bootstrap snapshot');

    const afterRegister = await postJson(baseUrl, '/api/projects', {
      name: label,
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
    assert.equal(
      clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, bootstrapRefreshRef),
      true,
    );

    const projectId = afterRegister.project.id;
    const projectSummary = afterRegister.derived.providerExecutionSummaries[projectId];

    assert.equal(projectSummary.mode, 'local-stub');
    assert.equal(projectSummary.adapter, 'local-stub');
    assert.equal(projectSummary.readiness, 'ready');
    assert.equal(projectSummary.allowed, true);
    assert.deepEqual(projectSummary.reasons, []);

    const registeredTaskboardSnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      /provider readiness:ready/i,
      'provider readiness ready DOM',
    );
    const registeredRefreshRef = findRef(
      registeredTaskboardSnapshot,
      /button "Refresh" \[ref=(e\d+)\]/,
      'Refresh button after project registration',
    );

    assert.match(registeredTaskboardSnapshot, /provider:local-stub/i);
    assertSecretAbsent(registeredTaskboardSnapshot, apiKeyValue, 'registered taskboard snapshot');

    const taskTitle = `${label} planner browser live smoke`;
    const taskIntent =
      'Verify planner-only live browser/API flow after project-level openai-responses opt-in.';
    const afterTaskPayload = await postJson(baseUrl, '/api/tasks', {
      intent: taskIntent,
      title: taskTitle,
    });
    assert.equal(
      clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, registeredRefreshRef),
      true,
    );

    const taskId = afterTaskPayload.task.id;
    const taskReadySnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      /Run Planner/,
      'task actions visible',
    );
    const taskReadyRefreshRef = findRef(
      taskReadySnapshot,
      /button "Refresh" \[ref=(e\d+)\]/,
      'Refresh button before live provider update',
    );

    assertSecretAbsent(taskReadySnapshot, apiKeyValue, 'taskboard snapshot after task creation');

    await postJson(baseUrl, `/api/projects/${encodeURIComponent(projectId)}/provider-config`, {
      provider: {
        adapter: 'openai-responses',
        env: {
          apiKeyVar: apiKeyEnvVarName,
        },
        mode: 'live',
        model,
      },
    });
    assert.equal(
      clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, taskReadyRefreshRef),
      true,
    );

    const liveReadySnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      /provider readiness:ready/i,
      'live provider ready DOM',
    );
    const liveRunPlannerRef = findRef(
      liveReadySnapshot,
      /button "Run Planner" \[ref=(e\d+)\]/,
      'Run Planner button after live opt-in',
    );

    assert.match(liveReadySnapshot, /provider:openai-responses/i);
    assertSecretAbsent(liveReadySnapshot, apiKeyValue, 'live-ready taskboard snapshot');

    const afterLiveProviderUpdate = await waitForSnapshotPayload(
      baseUrl,
      'live provider config snapshot',
      (payload) => payload.derived.providerExecutionSummaries[projectId]?.mode === 'live',
    );
    const liveSummary = afterLiveProviderUpdate.derived.providerExecutionSummaries[projectId];

    assert.equal(liveSummary.mode, 'live');
    assert.equal(liveSummary.adapter, 'openai-responses');
    assert.equal(liveSummary.readiness, 'ready');
    assert.equal(liveSummary.allowed, true);
    assert.deepEqual(liveSummary.reasons, []);

    const sharedRuntime = createRuntimeService({ runtimeRoot });
    const coordinator = createExecutionCoordinator({
      repoRoot,
      runtimeService: sharedRuntime,
    });
    const plannerReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'planner',
    });
    const architectReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'architect',
    });
    const taskBreakerReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'task-breaker',
    });
    const builderPreflightReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-preflight',
    });
    const builderLiveMutationReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-live-mutation',
    });
    const reviewerReadiness = coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'reviewer',
    });

    assert.equal(plannerReadiness.readiness, 'ready');
    assert.equal(plannerReadiness.allowed, true);
    assert.equal(architectReadiness.readiness, 'degraded');
    assert.equal(taskBreakerReadiness.readiness, 'degraded');
    assert.equal(builderPreflightReadiness.readiness, 'degraded');
    assert.equal(builderLiveMutationReadiness.readiness, 'degraded');
    assert.equal(reviewerReadiness.readiness, 'degraded');
    assert.equal(architectReadiness.allowed, false);
    assert.equal(taskBreakerReadiness.allowed, false);
    assert.equal(builderPreflightReadiness.allowed, false);
    assert.equal(builderLiveMutationReadiness.allowed, false);
    assert.equal(reviewerReadiness.allowed, false);
    assert.match(architectReadiness.reasons.join('; '), /planner-only/i);
    assert.match(taskBreakerReadiness.reasons.join('; '), /planner-only/i);
    assert.match(builderPreflightReadiness.reasons.join('; '), /planner-only/i);
    assert.match(builderLiveMutationReadiness.reasons.join('; '), /planner-only/i);
    assert.match(reviewerReadiness.reasons.join('; '), /planner-only/i);

    assert.equal(
      clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, liveRunPlannerRef),
      true,
    );

    const afterPlanner = await waitForValue(async () => {
      const snapshotPayload = await fetchJson(baseUrl, '/api/snapshot');
      const task = snapshotPayload.snapshot.tasks[taskId];
      const planArtifact = findLatestArtifact(snapshotPayload, taskId, 'plan');

      if (!task?.latestRunId || !planArtifact) {
        return null;
      }

      const run = snapshotPayload.snapshot.runs[task.latestRunId];

      if (run?.summary?.adapter !== 'openai-responses') {
        return null;
      }

      return {
        planArtifact,
        run,
        snapshotPayload,
      };
    }, 'live planner run');

    const plannerRunId = afterPlanner.run.id;
    const planArtifactId = afterPlanner.planArtifact.id;
    const providerRunId = afterPlanner.run.summary.providerRunId;

    assert.equal(afterPlanner.run.summary.adapter, 'openai-responses');
    assert.ok(providerRunId);
    assert.equal(countRuns(afterPlanner.snapshotPayload.snapshot, taskId), 1);
    assert.equal(countArtifacts(afterPlanner.snapshotPayload.snapshot, taskId, 'plan'), 1);
    assert.equal(countArtifacts(afterPlanner.snapshotPayload.snapshot, taskId, 'architecture'), 0);
    assert.equal(countArtifacts(afterPlanner.snapshotPayload.snapshot, taskId, 'breakdown'), 0);
    assert.equal(countArtifacts(afterPlanner.snapshotPayload.snapshot, taskId, 'preflight'), 0);
    assert.equal(countArtifacts(afterPlanner.snapshotPayload.snapshot, taskId, 'review'), 0);

    const planArtifactPayload = await fetchJson(
      baseUrl,
      `/api/artifacts/${encodeURIComponent(planArtifactId)}`,
    );
    const plannerLogsPayload = await fetchJson(
      baseUrl,
      `/api/runs/${encodeURIComponent(plannerRunId)}/logs`,
    );

    assert.equal(planArtifactPayload.artifact.type, 'plan');
    assert.ok(String(planArtifactPayload.artifact.content || '').trim().length > 0);
    assert.match(
      plannerLogsPayload.logs.map((entry) => entry.message).join('\n'),
      /invoking provider adapter openai-responses/i,
    );

    const plannerTaskboardSnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      new RegExp(escapeRegExp(planArtifactId)),
      'taskboard after live planner',
    );
    const logsNavRef = findRef(
      plannerTaskboardSnapshot,
      /button "Logs \(\d+\)" \[ref=(e\d+)\]/,
      'Logs navigation button',
    );

    assertSecretAbsent(plannerTaskboardSnapshot, apiKeyValue, 'planner taskboard snapshot');

    assert.equal(clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, logsNavRef), true);

    const logsSnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      new RegExp(escapeRegExp(plannerRunId)),
      'logs DOM after live planner',
    );
    const artifactsNavRef = findRef(
      logsSnapshot,
      /button "Artifacts \(\d+\)" \[ref=(e\d+)\]/,
      'Artifacts navigation button',
    );

    assertSecretAbsent(logsSnapshot, apiKeyValue, 'logs snapshot');

    assert.equal(clickRef(sessionName, outputRoot, playwrightCliBinEnvVar, artifactsNavRef), true);

    const artifactsSnapshot = await waitForSnapshotText(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      new RegExp(escapeRegExp(planArtifactId)),
      'artifacts DOM after live planner',
    );

    assertSecretAbsent(artifactsSnapshot, apiKeyValue, 'artifacts snapshot');

    const architectRunCountBefore = countRuns(afterPlanner.snapshotPayload.snapshot, taskId);
    const architectArtifactCountBefore = countArtifacts(
      afterPlanner.snapshotPayload.snapshot,
      taskId,
      'architecture',
    );
    const architectApiError = await expectApiFailure(
      baseUrl,
      `/api/tasks/${encodeURIComponent(taskId)}/run-architect`,
      /planner-only/i,
    );
    const afterArchitectFailure = await waitForSnapshotPayload(
      baseUrl,
      'architect fail-closed snapshot',
      (payload) =>
        countRuns(payload.snapshot, taskId) === architectRunCountBefore &&
        countArtifacts(payload.snapshot, taskId, 'architecture') === architectArtifactCountBefore,
    );

    assert.equal(countRuns(afterArchitectFailure.snapshot, taskId), architectRunCountBefore);
    assert.equal(
      countArtifacts(afterArchitectFailure.snapshot, taskId, 'architecture'),
      architectArtifactCountBefore,
    );

    const finalSnapshotPayload = await fetchJson(baseUrl, '/api/snapshot');

    await scanApiPayloadsForSecret(baseUrl, finalSnapshotPayload, apiKeyValue);

    const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, apiKeyValue);
    const stdoutSecretMatch = server.getStdout().includes(apiKeyValue);
    const stderrSecretMatch = server.getStderr().includes(apiKeyValue);

    assert.deepEqual(runtimeSecretMatches, []);
    assert.equal(stdoutSecretMatch, false);
    assert.equal(stderrSecretMatch, false);

    if (captureFilePath && fs.existsSync(captureFilePath)) {
      const capturedCalls = JSON.parse(fs.readFileSync(captureFilePath, 'utf8'));

      assert.equal(Array.isArray(capturedCalls), true);
      assert.equal(capturedCalls.length, 1);
      assert.equal(capturedCalls[0].method, 'POST');
      assert.equal(capturedCalls[0].headers.authorizationPresent, true);
      assert.equal(capturedCalls[0].headers.contentType, 'application/json');
      assert.equal(capturedCalls[0].url, 'https://api.openai.com/v1/responses');
      assertSecretAbsent(JSON.stringify(capturedCalls), apiKeyValue, 'captured fetch calls');
    }

    return {
      architectApiError,
      liveSummary: {
        adapter: liveSummary.adapter,
        allowed: liveSummary.allowed,
        readiness: liveSummary.readiness,
      },
      planArtifactId,
      plannerReadiness: plannerReadiness.readiness,
      plannerRunId,
      providerRunId,
      runtimeRoot,
      taskId,
      blockedRoles: {
        architect: architectReadiness.readiness,
        builderLiveMutation: builderLiveMutationReadiness.readiness,
        builderPreflight: builderPreflightReadiness.readiness,
        reviewer: reviewerReadiness.readiness,
        taskBreaker: taskBreakerReadiness.readiness,
      },
    };
  } catch (error) {
    try {
      fs.writeFileSync(
        path.join(outputRoot, `${label}-console.txt`),
        runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['console'], {
          timeoutMs: 30_000,
        }),
        'utf8',
      );
    } catch (_consoleError) {
      // Best-effort debug capture only.
    }

    try {
      fs.writeFileSync(
        path.join(outputRoot, `${label}-network.txt`),
        runPlaywrightCli(sessionName, outputRoot, playwrightCliBinEnvVar, ['network'], {
          timeoutMs: 30_000,
        }),
        'utf8',
      );
    } catch (_networkError) {
      // Best-effort debug capture only.
    }

    captureFailureScreenshot(
      sessionName,
      outputRoot,
      playwrightCliBinEnvVar,
      `${label}-failure.png`,
    );
    throw error;
  } finally {
    if (previousApiKeyEnvValue === undefined) {
      delete process.env[apiKeyEnvVarName];
    } else {
      process.env[apiKeyEnvVarName] = previousApiKeyEnvValue;
    }

    closePlaywrightSession(sessionName, outputRoot, playwrightCliBinEnvVar);
    browserSession.stop();
    await server.stop();
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true });
  }
}

export {
  PLAYWRIGHT_CLI_VERSION,
  createSyntheticPlannerArtifactMarkdown,
  createSyntheticPlannerResponse,
};
