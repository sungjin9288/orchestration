import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import { createServer as createNetServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import executionCoordinatorModule from '../src/execution/execution-coordinator.js';
import localStubAdapterModule from '../src/execution/providers/local-stub-adapter.js';
import openaiResponsesAdapterModule from '../src/execution/providers/openai-responses-adapter.js';
import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createExecutionCoordinator } = executionCoordinatorModule;
const { createLocalStubProviderAdapter } = localStubAdapterModule;
const { createOpenAIResponsesProviderAdapter } = openaiResponsesAdapterModule;
const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const PLAYWRIGHT_CLI_VERSION = '0.1.1';
const PLAYWRIGHT_VIEWPORT = {
  height: 960,
  width: 1440,
};
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];

function ensureCleanDir(dirPath) {
  fs.rmSync(dirPath, { force: true, recursive: true });
  fs.mkdirSync(dirPath, { recursive: true });
}

function ensurePlaywrightConfig(outputRoot, configPath) {
  fs.mkdirSync(path.join(outputRoot, '.playwright-cli'), { recursive: true });
  fs.writeFileSync(
    configPath,
    `${JSON.stringify(
      {
        browser: {
          contextOptions: {
            viewport: PLAYWRIGHT_VIEWPORT,
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
}

function runGit(projectPath, args) {
  return execFileSync('git', args, {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function createFixtureProject(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-04-${label}-`));
  const projectPath = path.join(fixtureRoot, 'project');

  fs.mkdirSync(projectPath, { recursive: true });
  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'qa-slice-04']);
  runGit(projectPath, ['config', 'user.email', 'qa-slice-04@example.com']);
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(projectPath, ['add', 'README.md']);
  runGit(projectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    projectPath: fs.realpathSync(projectPath),
  };
}

function countArtifacts(snapshot, taskId, type = null) {
  return Object.values(snapshot.artifacts).filter(
    (artifact) => artifact.taskId === taskId && (!type || artifact.type === type),
  ).length;
}

function countPendingDecisionItems(snapshot, taskId) {
  return Object.values(snapshot.decisionInboxItems).filter(
    (item) => item.taskId === taskId && item.status === 'pending',
  ).length;
}

function findLatestArtifact(snapshotPayload, taskId, type) {
  return Object.values(snapshotPayload.snapshot.artifacts)
    .filter((artifact) => artifact.taskId === taskId && artifact.type === type)
    .sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))[0] || null;
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

function createRoutingOutcome(scopeStatement) {
  return {
    classification: 'new task',
    scopeStatement,
    missingContext: [],
    decisionNote: '',
  };
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

function startUiServer({ port, runtimeRoot, extraEnv = {} }) {
  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        ...extraEnv,
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

function buildPlaywrightCliCommand(overrideEnvVar) {
  const override = String(process.env[overrideEnvVar] || '').trim();

  if (override) {
    return override.endsWith('.js') ? [process.execPath, override] : [override];
  }

  return ['npx', '--yes', '--package', `@playwright/cli@${PLAYWRIGHT_CLI_VERSION}`, 'playwright-cli'];
}

function runPlaywrightCli({ outputRoot, overrideEnvVar, sessionName, args, timeoutMs = 120_000 }) {
  const [command, ...baseArgs] = buildPlaywrightCliCommand(overrideEnvVar);

  return execFileSync(command, [...baseArgs, '--session', sessionName, ...args], {
    cwd: outputRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 10 * 1024 * 1024,
    timeout: timeoutMs,
  });
}

function parsePlaywrightResult(output) {
  const match = String(output || '').match(/### Result\s*\n([\s\S]*?)(?=\n### |\s*$)/);

  if (!match) {
    return null;
  }

  return JSON.parse(match[1].trim());
}

function openPlaywrightSession({ browser, configPath, outputRoot, overrideEnvVar, sessionName, url }) {
  runPlaywrightCli({
    outputRoot,
    overrideEnvVar,
    sessionName,
    args: ['open', `--browser=${browser}`, `--config=${configPath}`, url],
  });
}

function closePlaywrightSession({ outputRoot, overrideEnvVar, sessionName }) {
  try {
    runPlaywrightCli({
      outputRoot,
      overrideEnvVar,
      sessionName,
      args: ['close'],
      timeoutMs: 30_000,
    });
  } catch (_error) {
    // Best-effort cleanup only.
  }
}

function captureFailureScreenshot({ filename, outputRoot, overrideEnvVar, sessionName }) {
  try {
    runPlaywrightCli({
      outputRoot,
      overrideEnvVar,
      sessionName,
      args: ['screenshot', `--filename=${filename}`],
      timeoutMs: 30_000,
    });
  } catch (_error) {
    // Best-effort debug capture only.
  }
}

function runCode({ codeBody, outputRoot, overrideEnvVar, sessionName, timeoutMs = 60_000 }) {
  const wrappedCode = `async page => {\n${codeBody}\n}`;

  return runPlaywrightCli({
    outputRoot,
    overrideEnvVar,
    sessionName,
    args: ['run-code', wrappedCode],
    timeoutMs,
  });
}

function evaluate({ expression, outputRoot, overrideEnvVar, sessionName }) {
  return parsePlaywrightResult(
    runPlaywrightCli({
      outputRoot,
      overrideEnvVar,
      sessionName,
      args: ['eval', expression],
      timeoutMs: 60_000,
    }),
  );
}

function readLatestAccessibilitySnapshot(outputRoot) {
  const snapshotDir = path.join(outputRoot, '.playwright-cli');
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

function snapshotPage({ outputRoot, overrideEnvVar, sessionName }) {
  runPlaywrightCli({
    outputRoot,
    overrideEnvVar,
    sessionName,
    args: ['snapshot'],
    timeoutMs: 60_000,
  });
  return readLatestAccessibilitySnapshot(outputRoot);
}

function clickSelector({ outputRoot, overrideEnvVar, selector, sessionName }) {
  runCode({
    codeBody: `await page.locator(${JSON.stringify(selector)}).click();`,
    outputRoot,
    overrideEnvVar,
    sessionName,
  });
}

const SURFACE_NAV_GROUPS = {
  artifacts: 'review',
  'decision-inbox': 'review',
  logs: 'review',
  taskboard: 'ops',
};

function navigateToSurface({ outputRoot, overrideEnvVar, sessionName, surface }) {
  const navGroup = SURFACE_NAV_GROUPS[surface];

  if (navGroup) {
    clickSelector({
      outputRoot,
      overrideEnvVar,
      selector: `[data-nav-group-tab="${navGroup}"]`,
      sessionName,
    });
  }

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `.nav-button[data-surface="${surface}"]`,
    sessionName,
  });
}

function selectTaskViaQaHook({ outputRoot, overrideEnvVar, sessionName, taskId }) {
  // The current shell's global click dispatcher resolves any click inside a
  // surface section to its [data-surface] ancestor before the generic action
  // dispatch runs, so in-surface buttons such as [data-action="select-task"]
  // never reach their handlers. Task selection therefore goes through the
  // official QA hook (openSurface + refresh), which runs the same
  // syncSelectionsFromTask + hydration path the click handler would.
  runCode({
    codeBody: `
await page.waitForFunction(() => Boolean(window.__orchestrationQa));
await page.evaluate(async (taskId) => {
  const qa = window.__orchestrationQa;

  if (!qa.openSurface('taskboard', { taskId })) {
    throw new Error('QA surface hook rejected taskboard');
  }

  await qa.refresh();
}, ${JSON.stringify(taskId)});
`,
    outputRoot,
    overrideEnvVar,
    sessionName,
  });
}

function getBodyText({ outputRoot, overrideEnvVar, sessionName }) {
  return evaluate({
    expression: `document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : ''`,
    outputRoot,
    overrideEnvVar,
    sessionName,
  });
}

async function waitForSnapshotText({ outputRoot, overrideEnvVar, pattern, sessionName, label }) {
  return waitForValue(async () => {
    const snapshotText = snapshotPage({
      outputRoot,
      overrideEnvVar,
      sessionName,
    });

    return pattern.test(snapshotText) ? snapshotText : null;
  }, label);
}

async function waitForBodyText({ outputRoot, overrideEnvVar, pattern, sessionName, label }) {
  return waitForValue(async () => {
    const bodyText = getBodyText({
      outputRoot,
      overrideEnvVar,
      sessionName,
    });

    return pattern.test(bodyText) ? bodyText : null;
  }, label);
}

function createResponse(status, payload) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
}

function createQueuedFetch(initialResponses = []) {
  const queue = [...initialResponses];
  const calls = [];

  async function fetchImpl(url, init = {}) {
    calls.push({
      body: init.body || '',
      headers: init.headers || {},
      method: init.method || 'GET',
      url,
    });

    if (queue.length === 0) {
      throw new Error('No queued response for openai-responses fetch stub');
    }

    const next = queue.shift();

    if (next && Object.prototype.hasOwnProperty.call(next, 'throwError')) {
      throw next.throwError;
    }

    return createResponse(next.status ?? 200, next.payload ?? {});
  }

  return {
    calls,
    fetchImpl,
    push(response) {
      queue.push(response);
    },
  };
}

function createPlannerArtifactMarkdown(label) {
  return `# Plan: ${label}

## Slice Goal
Verify qa-slice-04 planner, architect, and task-breaker live verification through browser plus API assertions.

## Intended Outcome
Keep browser checks surface-only while closing live semantics through API endpoints and direct coordinator assertions.

## Acceptance Target
- live project provider summary stays coarse in browser
- planner, architect, and task-breaker execute live
- architecture and breakdown artifacts stay inspectable
- human-gate state surfaces on Decision Inbox without widening UI semantics

## Verification Approach
- browser landing, selection, and visibility checks
- /api/snapshot, /api/artifacts, /api/runs/:id/logs assertions

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
`;
}

function createPlannerStructuredText({ artifactMarkdown, normalizedResult = {} }) {
  return JSON.stringify({
    artifactMarkdown,
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'architect',
      summary: normalizedResult.summary || 'Planner output is ready for architect handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createArchitectStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      boundaryFit: artifact.boundaryFit || 'fit',
      affectedComponentsOrContracts: Array.isArray(artifact.affectedComponentsOrContracts)
        ? artifact.affectedComponentsOrContracts
        : ['src/execution/execution-coordinator.js'],
      policyImpact: Array.isArray(artifact.policyImpact)
        ? artifact.policyImpact
        : ['The slice keeps project-level provider summary coarse in browser surfaces.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : ['Role readiness beyond project summary is verified outside the browser.'],
      noArchitectureChangeStatement:
        artifact.noArchitectureChangeStatement ||
        'No architecture change is approved by this note. Downstream work must stay inside the current live boundary.',
      blockingArchitectureIssues: Array.isArray(artifact.blockingArchitectureIssues)
        ? artifact.blockingArchitectureIssues
        : [],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'task-breaker',
      summary:
        normalizedResult.summary || 'Architect output is ready for task-breaker handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createTaskBreakerStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      orderedSubTasks: Array.isArray(artifact.orderedSubTasks)
        ? artifact.orderedSubTasks
        : [
            'Validate the approved plan-plus-architecture provenance chain before builder handoff.',
            'Prepare the minimum implementation sequence without widening scope.',
            'Stop after the bounded implementation slice is ready for builder preflight.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the current boundary and non-goals',
            'checkpoint 2: define the smallest builder-ready sequence',
            'checkpoint 3: mark verification and review handoff points',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : ['checkpoint 1: breakdown', 'checkpoint 2: diff', 'checkpoint 3: review'],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Confirm the planned verification step before builder execution.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review after the bounded builder sequence and verification evidence are ready.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if execution would widen scope beyond the approved architecture boundary.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['Builder handoff stays bounded to the current approved slice only.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'builder',
      summary:
        normalizedResult.summary || 'Task-breaker output is ready for builder handoff.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createPlannerApiPayload(label, options = {}) {
  const outputText = createPlannerStructuredText({
    artifactMarkdown: createPlannerArtifactMarkdown(label),
    normalizedResult: options.normalizedResult || {},
  });
  const payload = {
    id: options.providerRunId || `resp-planner-${label}`,
    model: options.model || 'gpt-4.1-mini',
    usage: {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30,
    },
  };

  if (options.useAggregatedOutput === true) {
    payload.output = [
      {
        type: 'reasoning',
        content: [],
      },
      {
        type: 'message',
        content: [{ type: 'output_text', text: outputText }],
      },
    ];
  } else {
    payload.output_text = outputText;
  }

  return {
    payload,
    status: options.status ?? 200,
  };
}

function createArchitectApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createArchitectStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-architect',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 12,
        output_tokens: 24,
        total_tokens: 36,
      },
    },
    status: options.status ?? 200,
  };
}

function createTaskBreakerApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createTaskBreakerStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-task-breaker',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 14,
        output_tokens: 28,
        total_tokens: 42,
      },
    },
    status: options.status ?? 200,
  };
}

function createSyntheticCoordinator(runtime, fetchImpl) {
  return createExecutionCoordinator({
    liveProviderAdapter: createOpenAIResponsesProviderAdapter({
      fetchImpl,
    }),
    providerAdapter: createLocalStubProviderAdapter(),
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: CODE_CONTEXT_PATHS,
  });
}

function createDefaultCoordinator(runtime) {
  return createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: CODE_CONTEXT_PATHS,
  });
}

function collectRoleReadiness(coordinator, projectId) {
  return {
    architect: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'architect',
    }),
    builderLiveMutation: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-live-mutation',
    }),
    builderPreflight: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-preflight',
    }),
    planner: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'planner',
    }),
    reviewer: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'reviewer',
    }),
    taskBreaker: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'task-breaker',
    }),
  };
}

function assertProjectProviderSummary(summary) {
  assert.equal(summary.mode, 'live');
  assert.equal(summary.adapter, 'openai-responses');
  assert.equal(summary.readiness, 'ready');
  assert.equal(summary.allowed, true);
}

function assertRoleReadiness(roleReadiness) {
  assert.equal(roleReadiness.planner.readiness, 'ready');
  assert.equal(roleReadiness.planner.allowed, true);
  assert.equal(roleReadiness.architect.readiness, 'ready');
  assert.equal(roleReadiness.architect.allowed, true);
  assert.equal(roleReadiness.taskBreaker.readiness, 'ready');
  assert.equal(roleReadiness.taskBreaker.allowed, true);
  assert.equal(roleReadiness.builderPreflight.readiness, 'ready');
  assert.equal(roleReadiness.builderPreflight.allowed, true);
  assert.equal(roleReadiness.builderLiveMutation.readiness, 'ready');
  assert.equal(roleReadiness.builderLiveMutation.allowed, true);
  assert.equal(roleReadiness.reviewer.readiness, 'ready');
  assert.equal(roleReadiness.reviewer.allowed, true);
}

async function fetchArtifactPayload(baseUrl, artifactId) {
  return fetchJson(baseUrl, `/api/artifacts/${encodeURIComponent(artifactId)}`);
}

async function fetchRunLogsPayload(baseUrl, runId) {
  return fetchJson(baseUrl, `/api/runs/${encodeURIComponent(runId)}/logs`);
}

async function scanApiPayloadsForSecret(baseUrl, snapshotPayload, secret) {
  assertSecretAbsent(JSON.stringify(snapshotPayload), secret, 'snapshot payload');

  for (const run of Object.values(snapshotPayload.snapshot.runs)) {
    const logsPayload = await fetchRunLogsPayload(baseUrl, run.id);

    assertSecretAbsent(JSON.stringify(logsPayload), secret, `run logs payload ${run.id}`);
  }

  for (const artifact of Object.values(snapshotPayload.snapshot.artifacts)) {
    const artifactPayload = await fetchArtifactPayload(baseUrl, artifact.id);

    assertSecretAbsent(JSON.stringify(artifactPayload), secret, `artifact payload ${artifact.id}`);
  }
}

function assertOpenAiLogs(logsPayload) {
  const messages = (logsPayload.logs || []).map((entry) => entry.message).join('\n');

  assert.match(messages, /invoking provider adapter openai-responses/i);
  assert.doesNotMatch(messages, /local-stub/i);
}

async function verifyBrowserProjectSummary({
  outputRoot,
  overrideEnvVar,
  projectSummary,
  secret,
  sessionName,
}) {
  // The provider readiness tokens render in the project list of the advanced-ops
  // bootstrap panel, which lives on the taskboard surface (ops nav group).
  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'taskboard',
  });

  const providerReadySnapshot = await waitForSnapshotText({
    outputRoot,
    overrideEnvVar,
    pattern: /준비도:준비됨/,
    sessionName,
    label: 'provider readiness ready DOM',
  });

  assert.match(providerReadySnapshot, /프로바이더:openai-responses/i);
  assert.match(providerReadySnapshot, /프로바이더준비:준비됨/);
  assert.match(
    providerReadySnapshot,
    /기획 셀[\s\S]*설계 셀[\s\S]*분해 셀[\s\S]*사전 점검[\s\S]*리뷰 검토/,
  );
  assertSecretAbsent(providerReadySnapshot, secret, 'project summary snapshot');
  assertProjectProviderSummary(projectSummary);

  return providerReadySnapshot;
}

async function verifyBrowserHumanGateFlow({
  architectRunId,
  architectureArtifactId,
  decisionTitle,
  outputRoot,
  overrideEnvVar,
  plannerArtifactId,
  secret,
  sessionName,
  taskId,
  taskTitle,
}) {
  const collectedDomTexts = [];

  selectTaskViaQaHook({
    outputRoot,
    overrideEnvVar,
    sessionName,
    taskId,
  });

  const selectedTaskText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(taskTitle)),
    sessionName,
    label: 'selected gate task body',
  });

  collectedDomTexts.push(selectedTaskText);
  assert.match(selectedTaskText, new RegExp(escapeRegExp(plannerArtifactId)));
  assert.match(selectedTaskText, new RegExp(escapeRegExp(architectureArtifactId)));
  assert.match(selectedTaskText, /태스크 분해는[^.]*비활성입니다/);
  assert.match(selectedTaskText, /빌더 프리플라이트는[^.]*비활성입니다/);
  assert.match(selectedTaskText, /리뷰어 비활성 사유/);
  assertSecretAbsent(selectedTaskText, secret, 'taskboard selected task body');

  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'logs',
  });

  const logsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(architectRunId)),
    sessionName,
    label: 'logs surface body',
  });
  collectedDomTexts.push(logsText);
  assertSecretAbsent(logsText, secret, 'logs surface body');

  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'artifacts',
  });

  const artifactsListText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(architectureArtifactId)),
    sessionName,
    label: 'artifacts surface body',
  });
  collectedDomTexts.push(artifactsListText);
  assertSecretAbsent(artifactsListText, secret, 'artifacts surface list body');

  // The breakdown artifact is already the preferred selection for the gate
  // task (selected and hydrated by selectTaskViaQaHook), so its raw markdown
  // renders in the artifacts detail pane without an extra click.
  const artifactsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: /Stop-And-Escalate Conditions/i,
    sessionName,
    label: 'selected artifact raw content body',
  });
  collectedDomTexts.push(artifactsText);
  assert.match(artifactsText, new RegExp(escapeRegExp(architectureArtifactId)));
  assertSecretAbsent(artifactsText, secret, 'artifacts surface body');

  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'decision-inbox',
  });

  const decisionInboxText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(decisionTitle)),
    sessionName,
    label: 'decision inbox body',
  });
  collectedDomTexts.push(decisionInboxText);
  assertSecretAbsent(decisionInboxText, secret, 'decision inbox body');

  return collectedDomTexts;
}

async function verifyBrowserRealFlow({
  architectRunId,
  architectureArtifactId,
  decisionTitle,
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
  taskId,
  taskTitle,
}) {
  const collectedDomTexts = [];

  selectTaskViaQaHook({
    outputRoot,
    overrideEnvVar,
    sessionName,
    taskId,
  });

  const taskBodyText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(taskTitle)),
    sessionName,
    label: 'selected real live task body',
  });
  collectedDomTexts.push(taskBodyText);
  assert.match(taskBodyText, new RegExp(escapeRegExp(architectureArtifactId)));
  assertSecretAbsent(taskBodyText, secret, 'real live task body');

  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'logs',
  });

  const logsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(architectRunId)),
    sessionName,
    label: 'real live logs body',
  });
  collectedDomTexts.push(logsText);
  assertSecretAbsent(logsText, secret, 'real live logs body');

  navigateToSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'artifacts',
  });

  const artifactsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(architectureArtifactId)),
    sessionName,
    label: 'real live artifacts body',
  });
  collectedDomTexts.push(artifactsText);
  assertSecretAbsent(artifactsText, secret, 'real live artifacts body');

  if (decisionTitle) {
    navigateToSurface({
      outputRoot,
      overrideEnvVar,
      sessionName,
      surface: 'decision-inbox',
    });

    const decisionText = await waitForBodyText({
      outputRoot,
      overrideEnvVar,
      pattern: new RegExp(escapeRegExp(decisionTitle)),
      sessionName,
      label: 'real live decision inbox body',
    });
    collectedDomTexts.push(decisionText);
    assertSecretAbsent(decisionText, secret, 'real live decision inbox body');
  }

  return collectedDomTexts;
}

async function prepareBrowserHarness({ browser, outputRoot, overrideEnvVar, runtimeRoot, serverEnv }) {
  const configPath = path.join(outputRoot, 'playwright-cli.json');
  const sessionName = 'qa-slice-04';
  const port = await allocatePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startUiServer({
    port,
    runtimeRoot,
    extraEnv: serverEnv,
  });

  await waitForServer(baseUrl);
  openPlaywrightSession({
    browser,
    configPath,
    outputRoot,
    overrideEnvVar,
    sessionName,
    url: baseUrl,
  });

  return {
    baseUrl,
    configPath,
    server,
    sessionName,
  };
}

async function refreshBrowser({ outputRoot, overrideEnvVar, sessionName }) {
  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: '#refresh-button',
    sessionName,
  });
}

export async function runQaSlice04SyntheticSmoke(options = {}) {
  const outputRoot = options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-04');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-slice-04');
  const browser = options.browser || process.env.QA_SLICE_04_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_04_PLAYWRIGHT_CLI_BIN';
  const liveProviderEnvVar = options.liveProviderEnvVar || 'QA_SLICE_04_LIVE_PROVIDER_API_KEY';
  const sentinelSecret = options.secret || 'qa-slice-04-secret-sentinel';
  const providerModel = options.model || 'qa-slice-04-operator-model';
  const runtime = createRuntimeService({ runtimeRoot });
  const fixture = createFixtureProject('synthetic-live');

  ensureCleanDir(outputRoot);
  ensureCleanDir(runtimeRoot);
  ensurePlaywrightConfig(outputRoot, path.join(outputRoot, 'playwright-cli.json'));
  process.env[liveProviderEnvVar] = sentinelSecret;
  runtime.resetRuntime();

  const serverEnv = {
    [liveProviderEnvVar]: sentinelSecret,
  };
  const harness = await prepareBrowserHarness({
    browser,
    outputRoot,
    overrideEnvVar,
    runtimeRoot,
    serverEnv,
  });

  const domTexts = [];

  try {
    const landingSnapshot = await waitForSnapshotText({
      outputRoot,
      overrideEnvVar,
      pattern: /등록된 프로젝트 없음/,
      sessionName: harness.sessionName,
      label: 'project bootstrap landing',
    });
    domTexts.push(landingSnapshot);
    assertSecretAbsent(landingSnapshot, sentinelSecret, 'landing snapshot');

    const projectPayload = await postJson(harness.baseUrl, '/api/projects', {
      name: 'qa-slice-04',
      projectPath: fixture.projectPath,
      provider: {
        adapter: 'openai-responses',
        mode: 'live',
        model: providerModel,
        env: {
          apiKeyVar: liveProviderEnvVar,
        },
      },
    });
    const projectId = projectPayload.project.id;

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const providerReadySnapshot = await verifyBrowserProjectSummary({
      outputRoot,
      overrideEnvVar,
      projectSummary: projectPayload.derived.providerExecutionSummaries[projectId],
      secret: sentinelSecret,
      sessionName: harness.sessionName,
    });
    domTexts.push(providerReadySnapshot);

    const fitTaskPayload = await postJson(harness.baseUrl, '/api/tasks', {
      intent: 'Verify synthetic fit task-breaker live flow for qa-slice-04.',
      title: 'QA slice 04 task-breaker fit',
    });
    const gateTaskPayload = await postJson(harness.baseUrl, '/api/tasks', {
      intent: 'Verify synthetic human-gate task-breaker live flow for qa-slice-04.',
      title: 'QA slice 04 task-breaker human gate',
    });

    const syntheticRuntime = createRuntimeService({ runtimeRoot });
    const queuedFetch = createQueuedFetch();
    const syntheticCoordinator = createSyntheticCoordinator(syntheticRuntime, queuedFetch.fetchImpl);
    const roleReadiness = collectRoleReadiness(syntheticCoordinator, projectId);

    assertRoleReadiness(roleReadiness);

    queuedFetch.push(createPlannerApiPayload('qa-slice-04-fit'));
    const fitPlannerResult = await syntheticCoordinator.runPlanner({
      taskId: fitTaskPayload.task.id,
      routingOutcome: createRoutingOutcome(
        'Verify synthetic fit task-breaker live flow for qa-slice-04.',
      ),
    });
    const fitAnchor = {
      projectId,
      taskId: fitTaskPayload.task.id,
      planArtifactId: fitPlannerResult.artifact.id,
      planRunId: fitPlannerResult.run.id,
      sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
      codeContextPaths: CODE_CONTEXT_PATHS,
    };
    queuedFetch.push(
      createArchitectApiPayload(fitAnchor, {
        providerRunId: 'resp-architect-fit',
      }),
    );
    const fitArchitectResult = await syntheticCoordinator.runArchitect({
      taskId: fitTaskPayload.task.id,
    });
    const fitTaskBreakerAnchor = {
      projectId,
      taskId: fitTaskPayload.task.id,
      planArtifactId: fitPlannerResult.artifact.id,
      planRunId: fitPlannerResult.run.id,
      architectureArtifactId: fitArchitectResult.artifact.id,
      architectureRunId: fitArchitectResult.run.id,
      sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    };
    queuedFetch.push(
      createTaskBreakerApiPayload(fitTaskBreakerAnchor, {
        providerRunId: 'resp-task-breaker-fit',
      }),
    );
    const fitTaskBreakerResult = await syntheticCoordinator.runTaskBreaker({
      taskId: fitTaskPayload.task.id,
    });

    queuedFetch.push(createPlannerApiPayload('qa-slice-04-human-gate'));
    const gatePlannerResult = await syntheticCoordinator.runPlanner({
      taskId: gateTaskPayload.task.id,
      routingOutcome: createRoutingOutcome(
        'Verify synthetic human-gate task-breaker live flow for qa-slice-04.',
      ),
    });
    const gateAnchor = {
      projectId,
      taskId: gateTaskPayload.task.id,
      planArtifactId: gatePlannerResult.artifact.id,
      planRunId: gatePlannerResult.run.id,
      sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
      codeContextPaths: CODE_CONTEXT_PATHS,
    };
    queuedFetch.push(
      createArchitectApiPayload(gateAnchor, {
        providerRunId: 'resp-architect-human-gate',
      }),
    );
    const gateArchitectResult = await syntheticCoordinator.runArchitect({
      taskId: gateTaskPayload.task.id,
    });
    const gateTaskBreakerAnchor = {
      projectId,
      taskId: gateTaskPayload.task.id,
      planArtifactId: gatePlannerResult.artifact.id,
      planRunId: gatePlannerResult.run.id,
      architectureArtifactId: gateArchitectResult.artifact.id,
      architectureRunId: gateArchitectResult.run.id,
      sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    };
    queuedFetch.push(
      createTaskBreakerApiPayload(gateTaskBreakerAnchor, {
        providerRunId: 'resp-task-breaker-human-gate',
        artifact: {
          stopAndEscalateConditions: [
            'Stop because an operator decision is still required before builder handoff.',
          ],
          executionBoundarySummary: [
            'Builder must remain blocked until the current human gate is resolved.',
          ],
        },
        normalizedResult: {
          blockers: ['An operator decision is required before builder handoff may proceed.'],
          needsDecision: true,
          nextStage: 'human gate',
          summary: 'Task-breaker found a blocking issue that routes through the human gate.',
          decisionTitle: 'Task-breaker decision required',
          decisionPrompt: 'Resolve the blocked implementation choice before builder work may continue.',
        },
      }),
    );
    const gateTaskBreakerResult = await syntheticCoordinator.runTaskBreaker({
      taskId: gateTaskPayload.task.id,
    });

    assert.equal(fitPlannerResult.run.summary.adapter, 'openai-responses');
    assert.equal(fitArchitectResult.run.summary.adapter, 'openai-responses');
    assert.equal(fitArchitectResult.run.summary.inputArtifactId, fitPlannerResult.artifact.id);
    assert.equal(fitArchitectResult.run.summary.inputRunId, fitPlannerResult.run.id);
    assert.equal(fitArchitectResult.run.summary.nextStage, 'task-breaker');
    assert.equal(fitArchitectResult.decisionInboxItem, null);
    assert.equal(fitTaskBreakerResult.run.summary.adapter, 'openai-responses');
    assert.equal(fitTaskBreakerResult.run.summary.architectureArtifactId, fitArchitectResult.artifact.id);
    assert.equal(fitTaskBreakerResult.run.summary.architectureRunId, fitArchitectResult.run.id);
    assert.equal(fitTaskBreakerResult.run.summary.nextStage, 'builder');
    assert.equal(fitTaskBreakerResult.decisionInboxItem, null);
    assert.equal(gatePlannerResult.run.summary.adapter, 'openai-responses');
    assert.equal(gateArchitectResult.run.summary.adapter, 'openai-responses');
    assert.equal(gateArchitectResult.run.summary.inputArtifactId, gatePlannerResult.artifact.id);
    assert.equal(gateArchitectResult.run.summary.inputRunId, gatePlannerResult.run.id);
    assert.equal(gateArchitectResult.run.summary.nextStage, 'task-breaker');
    assert.equal(gateArchitectResult.decisionInboxItem, null);
    assert.equal(gateTaskBreakerResult.run.summary.adapter, 'openai-responses');
    assert.equal(gateTaskBreakerResult.run.summary.nextStage, 'human gate');
    assert.ok(gateTaskBreakerResult.decisionInboxItem);

    const snapshotPayload = await waitForSnapshotPayload(
      harness.baseUrl,
      'synthetic qa-slice-04 snapshot',
      (payload) =>
        countArtifacts(payload.snapshot, fitTaskPayload.task.id, 'breakdown') === 1 &&
        countArtifacts(payload.snapshot, gateTaskPayload.task.id, 'breakdown') === 1 &&
        countPendingDecisionItems(payload.snapshot, gateTaskPayload.task.id) === 1,
    );

    const gateSnapshotTask = snapshotPayload.snapshot.tasks[gateTaskPayload.task.id];
    const gateDecisionItem =
      Object.values(snapshotPayload.snapshot.decisionInboxItems).find(
        (item) =>
          item.taskId === gateTaskPayload.task.id &&
          item.status === 'pending' &&
          item.title === gateTaskBreakerResult.decisionInboxItem.title,
      ) || null;

    assert.ok(gateDecisionItem);
    assert.equal(gateDecisionItem.kind, 'decision');
    assert.equal(gateDecisionItem.sourceType, 'decision');
    assert.equal(gateDecisionItem.blocksTask, true);
    assert.equal(gateSnapshotTask.flags.blocked, true);
    assert.equal(gateSnapshotTask.flags.waitingDecision, true);
    assert.equal(gateSnapshotTask.flags.waitingApproval, false);
    assertProjectProviderSummary(snapshotPayload.derived.providerExecutionSummaries[projectId]);

    const fitArtifactPayload = await fetchArtifactPayload(
      harness.baseUrl,
      fitTaskBreakerResult.artifact.id,
    );
    const gateArtifactPayload = await fetchArtifactPayload(
      harness.baseUrl,
      gateTaskBreakerResult.artifact.id,
    );
    const fitPlannerLogs = await fetchRunLogsPayload(harness.baseUrl, fitPlannerResult.run.id);
    const fitArchitectLogs = await fetchRunLogsPayload(harness.baseUrl, fitArchitectResult.run.id);
    const fitTaskBreakerLogs = await fetchRunLogsPayload(harness.baseUrl, fitTaskBreakerResult.run.id);
    const gatePlannerLogs = await fetchRunLogsPayload(harness.baseUrl, gatePlannerResult.run.id);
    const gateArchitectLogs = await fetchRunLogsPayload(harness.baseUrl, gateArchitectResult.run.id);
    const gateTaskBreakerLogs = await fetchRunLogsPayload(
      harness.baseUrl,
      gateTaskBreakerResult.run.id,
    );

    assert.match(fitArtifactPayload.artifact.content, /## Ordered Sub-Tasks/);
    assert.match(gateArtifactPayload.artifact.content, /## Stop-And-Escalate Conditions/);
    assertOpenAiLogs(fitPlannerLogs);
    assertOpenAiLogs(fitArchitectLogs);
    assertOpenAiLogs(fitTaskBreakerLogs);
    assertOpenAiLogs(gatePlannerLogs);
    assertOpenAiLogs(gateArchitectLogs);
    assertOpenAiLogs(gateTaskBreakerLogs);

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const browserGateTexts = await verifyBrowserHumanGateFlow({
      architectRunId: gateTaskBreakerResult.run.id,
      architectureArtifactId: gateTaskBreakerResult.artifact.id,
      decisionTitle: gateTaskBreakerResult.decisionInboxItem.title,
      outputRoot,
      overrideEnvVar,
      plannerArtifactId: gatePlannerResult.artifact.id,
      secret: sentinelSecret,
      sessionName: harness.sessionName,
      taskId: gateTaskPayload.task.id,
      taskTitle: gateTaskPayload.task.title,
    });
    domTexts.push(...browserGateTexts);

    await scanApiPayloadsForSecret(harness.baseUrl, snapshotPayload, sentinelSecret);

    for (const domText of domTexts) {
      assertSecretAbsent(domText, sentinelSecret, 'browser DOM text');
    }

    const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, sentinelSecret);
    assert.deepEqual(runtimeSecretMatches, []);

    return {
      ok: true,
      outputRoot,
      playwright: {
        browser,
        cliMode: process.env[overrideEnvVar] ? 'override' : 'npx-fixed',
        cliVersion: PLAYWRIGHT_CLI_VERSION,
      },
      runtimeRoot,
      scenarios: {
        fit: {
          breakdownArtifactId: fitTaskBreakerResult.artifact.id,
          nextStage: fitTaskBreakerResult.run.summary.nextStage,
          planArtifactId: fitPlannerResult.artifact.id,
          plannerRunId: fitPlannerResult.run.id,
        },
        humanGate: {
          breakdownArtifactId: gateTaskBreakerResult.artifact.id,
          decisionInboxItemId: gateTaskBreakerResult.decisionInboxItem.id,
          nextStage: gateTaskBreakerResult.run.summary.nextStage,
          planArtifactId: gatePlannerResult.artifact.id,
          plannerRunId: gatePlannerResult.run.id,
        },
      },
      roleReadiness: {
        architect: roleReadiness.architect.readiness,
        builderLiveMutation: roleReadiness.builderLiveMutation.readiness,
        builderPreflight: roleReadiness.builderPreflight.readiness,
        planner: roleReadiness.planner.readiness,
        reviewer: roleReadiness.reviewer.readiness,
        taskBreaker: roleReadiness.taskBreaker.readiness,
      },
    };
  } catch (error) {
    captureFailureScreenshot({
      filename: 'qa-slice-04-failure.png',
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });
    throw error;
  } finally {
    closePlaywrightSession({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });
    await harness.server.stop();
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true });
  }
}

export async function runQaSlice04RealSmoke(options = {}) {
  const outputRoot =
    options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-04-live');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-live-slice-04');
  const browser = options.browser || process.env.QA_SLICE_04_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_04_PLAYWRIGHT_CLI_BIN';
  const apiKeyVar = options.apiKeyVar || 'OPENAI_API_KEY';
  const apiKey = process.env[apiKeyVar] || '';
  const model = options.model || process.env.OPENAI_RESPONSES_MODEL || '';

  if (!apiKey || !model) {
    return {
      ok: true,
      skipped: true,
      reason: 'OPENAI_API_KEY and OPENAI_RESPONSES_MODEL are required for the optional real live smoke.',
    };
  }

  const runtime = createRuntimeService({ runtimeRoot });
  const fixture = createFixtureProject('real-live');

  ensureCleanDir(outputRoot);
  ensureCleanDir(runtimeRoot);
  ensurePlaywrightConfig(outputRoot, path.join(outputRoot, 'playwright-cli.json'));
  runtime.resetRuntime();

  const harness = await prepareBrowserHarness({
    browser,
    outputRoot,
    overrideEnvVar,
    runtimeRoot,
    serverEnv: {
      [apiKeyVar]: apiKey,
    },
  });
  const domTexts = [];

  try {
    const landingSnapshot = await waitForSnapshotText({
      outputRoot,
      overrideEnvVar,
      pattern: /등록된 프로젝트 없음/,
      sessionName: harness.sessionName,
      label: 'real live project bootstrap landing',
    });
    domTexts.push(landingSnapshot);
    assertSecretAbsent(landingSnapshot, apiKey, 'real live landing snapshot');

    const projectPayload = await postJson(harness.baseUrl, '/api/projects', {
      name: 'qa-slice-04-live',
      projectPath: fixture.projectPath,
      provider: {
        adapter: 'openai-responses',
        mode: 'live',
        model,
        env: {
          apiKeyVar,
        },
      },
    });
    const projectId = projectPayload.project.id;

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const providerReadySnapshot = await verifyBrowserProjectSummary({
      outputRoot,
      overrideEnvVar,
      projectSummary: projectPayload.derived.providerExecutionSummaries[projectId],
      secret: apiKey,
      sessionName: harness.sessionName,
    });
    domTexts.push(providerReadySnapshot);

    const taskPayload = await postJson(harness.baseUrl, '/api/tasks', {
      intent: 'Run planner, architect, and task-breaker through the optional real qa-slice-04 live smoke.',
      title: 'QA slice 04 optional real live',
    });

    const realRuntime = createRuntimeService({ runtimeRoot });
    const coordinator = createDefaultCoordinator(realRuntime);
    const roleReadiness = collectRoleReadiness(coordinator, projectId);

    assertRoleReadiness(roleReadiness);

    const plannerResult = await coordinator.runPlanner({
      taskId: taskPayload.task.id,
      routingOutcome: createRoutingOutcome(
        'Validate the optional real planner, architect, and task-breaker live path for qa-slice-04.',
      ),
    });
    const architectResult = await coordinator.runArchitect({
      taskId: taskPayload.task.id,
    });
    let taskBreakerResult = null;

    if (architectResult.run.summary.nextStage === 'task-breaker') {
      taskBreakerResult = await coordinator.runTaskBreaker({
        taskId: taskPayload.task.id,
      });
    }

    assert.equal(plannerResult.run.summary.adapter, 'openai-responses');
    assert.ok(plannerResult.run.summary.providerRunId);
    assert.equal(architectResult.run.summary.adapter, 'openai-responses');
    assert.ok(architectResult.run.summary.providerRunId);
    assert.equal(architectResult.run.summary.inputArtifactId, plannerResult.artifact.id);
    assert.equal(architectResult.run.summary.inputRunId, plannerResult.run.id);
    assert.ok(['task-breaker', 'human gate'].includes(architectResult.run.summary.nextStage));
    if (taskBreakerResult) {
      assert.equal(taskBreakerResult.run.summary.adapter, 'openai-responses');
      assert.ok(taskBreakerResult.run.summary.providerRunId);
      assert.ok(['builder', 'human gate'].includes(taskBreakerResult.run.summary.nextStage));
    }

    const snapshotPayload = await waitForSnapshotPayload(
      harness.baseUrl,
      'real qa-slice-04 snapshot',
      (payload) =>
        countArtifacts(payload.snapshot, taskPayload.task.id, 'plan') === 1 &&
        countArtifacts(payload.snapshot, taskPayload.task.id, 'architecture') === 1 &&
        (architectResult.run.summary.nextStage !== 'task-breaker' ||
          countArtifacts(payload.snapshot, taskPayload.task.id, 'breakdown') === 1),
    );

    assertProjectProviderSummary(snapshotPayload.derived.providerExecutionSummaries[projectId]);

    const artifactPayload = await fetchArtifactPayload(
      harness.baseUrl,
      taskBreakerResult ? taskBreakerResult.artifact.id : architectResult.artifact.id,
    );
    const plannerLogs = await fetchRunLogsPayload(harness.baseUrl, plannerResult.run.id);
    const architectLogs = await fetchRunLogsPayload(harness.baseUrl, architectResult.run.id);
    const taskBreakerLogs = taskBreakerResult
      ? await fetchRunLogsPayload(harness.baseUrl, taskBreakerResult.run.id)
      : null;

    assert.match(
      artifactPayload.artifact.content,
      taskBreakerResult ? /## Ordered Sub-Tasks/ : /## Affected Components or Contracts/,
    );
    assertOpenAiLogs(plannerLogs);
    assertOpenAiLogs(architectLogs);
    if (taskBreakerLogs) {
      assertOpenAiLogs(taskBreakerLogs);
    }

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const browserTexts = await verifyBrowserRealFlow({
      architectRunId: architectResult.run.id,
      architectureArtifactId: architectResult.artifact.id,
      decisionTitle: architectResult.decisionInboxItem?.title || null,
      outputRoot,
      overrideEnvVar,
      secret: apiKey,
      sessionName: harness.sessionName,
      taskId: taskPayload.task.id,
      taskTitle: taskPayload.task.title,
    });
    domTexts.push(...browserTexts);

    await scanApiPayloadsForSecret(harness.baseUrl, snapshotPayload, apiKey);

    for (const domText of domTexts) {
      assertSecretAbsent(domText, apiKey, 'browser DOM text');
    }

    const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, apiKey);
    assert.deepEqual(runtimeSecretMatches, []);

    return {
      ok: true,
      outputRoot,
      playwright: {
        browser,
        cliMode: process.env[overrideEnvVar] ? 'override' : 'npx-fixed',
        cliVersion: PLAYWRIGHT_CLI_VERSION,
      },
      runtimeRoot,
      roleReadiness: {
        architect: roleReadiness.architect.readiness,
        builderLiveMutation: roleReadiness.builderLiveMutation.readiness,
        builderPreflight: roleReadiness.builderPreflight.readiness,
        planner: roleReadiness.planner.readiness,
        reviewer: roleReadiness.reviewer.readiness,
        taskBreaker: roleReadiness.taskBreaker.readiness,
      },
      scenario: {
        artifactId: taskBreakerResult ? taskBreakerResult.artifact.id : architectResult.artifact.id,
        architectNextStage: architectResult.run.summary.nextStage,
        decisionInboxItemId:
          (taskBreakerResult && taskBreakerResult.decisionInboxItem?.id) ||
          architectResult.decisionInboxItem?.id ||
          null,
        planArtifactId: plannerResult.artifact.id,
        plannerRunId: plannerResult.run.id,
        taskBreakerNextStage: taskBreakerResult?.run.summary.nextStage || null,
      },
    };
  } catch (error) {
    captureFailureScreenshot({
      filename: 'qa-slice-04-live-failure.png',
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });
    throw error;
  } finally {
    closePlaywrightSession({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });
    await harness.server.stop();
    fs.rmSync(fixture.fixtureRoot, { force: true, recursive: true });
  }
}
