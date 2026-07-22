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
const SERVER_FETCH_STATE_ENV = 'QA_SLICE_05_SERVER_FETCH_STUB_STATE';
const SOURCE_OF_TRUTH_PATHS = [
  'AGENTS.md',
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
];
const ARCHITECT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
  'ui/app.js',
];
const BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS = [
  'src/runtime/contracts.js',
  'src/runtime/runtime-service.js',
  'src/execution/provider-adapter.js',
  'src/execution/execution-coordinator.js',
  'src/execution/providers/openai-responses-adapter.js',
  'src/execution/providers/openai-responses-retry-policy.js',
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
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-05-${label}-`));
  const projectPath = path.join(fixtureRoot, 'project');

  fs.mkdirSync(projectPath, { recursive: true });
  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'qa-slice-05']);
  runGit(projectPath, ['config', 'user.email', 'qa-slice-05@example.com']);
  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(projectPath, ['add', 'README.md']);
  runGit(projectPath, ['commit', '-q', '-m', `fixture:${label}`]);

  return {
    fixtureRoot,
    projectPath: fs.realpathSync(projectPath),
  };
}

function countApprovals(snapshot, taskId) {
  return Object.values(snapshot.approvals).filter((approval) => approval.taskId === taskId).length;
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

function createServerFetchStubFiles(outputRoot) {
  const preloadPath = path.join(outputRoot, 'qa-slice-05-server-fetch-stub.cjs');
  const statePath = path.join(outputRoot, 'qa-slice-05-server-fetch-state.json');
  const preload = `'use strict';

const fs = require('node:fs');

const statePath = process.env[${JSON.stringify(SERVER_FETCH_STATE_ENV)}];

function loadState() {
  if (!statePath || !fs.existsSync(statePath)) {
    return { calls: [], queue: [] };
  }

  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function saveState(state) {
  fs.writeFileSync(statePath, \`\${JSON.stringify(state, null, 2)}\\n\`, 'utf8');
}

global.fetch = async function qaSlice05ServerFetch(url, init = {}) {
  const state = loadState();

  state.calls.push({
    body: init.body || '',
    headers: init.headers || {},
    method: init.method || 'GET',
    url,
  });

  if (!Array.isArray(state.queue) || state.queue.length === 0) {
    saveState(state);
    throw new Error('No queued response for qa-slice-05 server fetch stub');
  }

  const next = state.queue.shift();
  saveState(state);

  if (next && Object.prototype.hasOwnProperty.call(next, 'throwError')) {
    const error = new Error(next.throwError.message || 'qa-slice-05 server fetch stub error');

    error.name = next.throwError.name || 'Error';
    throw error;
  }

  const status = next && Number.isInteger(next.status) ? next.status : 200;
  const payload = next && next.payload ? next.payload : {};

  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(payload);
    },
  };
};
`;

  fs.writeFileSync(preloadPath, preload, 'utf8');
  fs.writeFileSync(statePath, `${JSON.stringify({ calls: [], queue: [] }, null, 2)}\n`, 'utf8');

  return {
    preloadPath,
    statePath,
  };
}

function readServerFetchState(statePath) {
  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function writeServerFetchQueue(statePath, responses = []) {
  fs.writeFileSync(
    statePath,
    `${JSON.stringify({ calls: [], queue: responses }, null, 2)}\n`,
    'utf8',
  );
}

function mergeNodeOptions(existing, extraParts = []) {
  return [String(existing || '').trim(), ...extraParts.map((value) => String(value || '').trim())]
    .filter(Boolean)
    .join(' ');
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
  // Real click: the global dispatcher matches nav buttons via
  // .nav-button[data-surface], so in-surface [data-action="select-task"]
  // clicks reach their handler (syncSelectionsFromTask + render).
  navigateToSurface({ outputRoot, overrideEnvVar, sessionName, surface: 'taskboard' });
  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="select-task"][data-id="${taskId}"]`,
    sessionName,
  });
}

function launchBuilderPreflightViaBrowser({ outputRoot, overrideEnvVar, sessionName, taskId }) {
  // Real click: the enabled [data-action="run-builder-preflight"] button now
  // reaches its handler, which posts run-builder-preflight and lands on the
  // Artifacts surface exactly like an operator click.
  navigateToSurface({ outputRoot, overrideEnvVar, sessionName, surface: 'taskboard' });
  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="run-builder-preflight"][data-id="${taskId}"]:not([disabled])`,
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
Verify qa-slice-05 builder-preflight live verification through browser plus API assertions.

## Intended Outcome
Keep browser checks limited to happy-path provider summary, builder-preflight launch, Artifacts landing, and selected preflight visibility.

## Acceptance Target
- live project provider summary stays coarse in browser
- planner, architect, task-breaker, and builder-preflight execute live
- builder-preflight lands on Artifacts with the new preflight artifact selected
- builder live mutation and reviewer remain blocked or degraded through API and coordinator summaries

## Verification Approach
- browser landing, button click, Artifacts landing, and selected artifact visibility checks
- /api/snapshot, /api/artifacts, /api/runs/:id/logs, direct coordinator readiness assertions

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
- breakdown
- preflight
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
        : [...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS],
      policyImpact: Array.isArray(artifact.policyImpact)
        ? artifact.policyImpact
        : ['The slice keeps project-level provider summary coarse in browser surfaces.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : [
            'Browser checks stay happy-path only while API and coordinator assertions close semantics.',
          ],
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
            'Validate the current plan-plus-architecture provenance chain before builder-preflight handoff.',
            'Prepare the minimum implementation sequence without widening scope.',
            'Stop after the bounded implementation slice is builder-preflight-ready.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the current boundary and non-goals',
            'checkpoint 2: define the smallest builder-preflight-ready sequence',
            'checkpoint 3: capture API and browser happy-path verification points',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : [
            'checkpoint 1: breakdown',
            'checkpoint 2: preflight',
            'checkpoint 3: approval request',
          ],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Confirm provider readiness, provenance, and no-secret-leak checks.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review only after approved live mutation plus verification evidence are ready.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if execution would widen scope beyond the approved architecture boundary.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['Builder-preflight handoff stays bounded to the current approved slice only.'],
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

function createBuilderPreflightStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  return JSON.stringify({
    anchor,
    artifact: {
      targetFiles: Array.isArray(artifact.targetFiles)
        ? artifact.targetFiles
        : ['src/execution/execution-coordinator.js', 'src/runtime/runtime-service.js'],
      intendedChanges: Array.isArray(artifact.intendedChanges)
        ? artifact.intendedChanges
        : [
            'Prepare a no-write builder-preflight artifact for the approved slice.',
            'Preserve approval-request-only handoff without widening builder live mutation or reviewer live.',
          ],
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when provenance, path validation, or structured output validation does not match.'],
      verificationPlan: Array.isArray(artifact.verificationPlan)
        ? artifact.verificationPlan
        : [
            'Verify provider summary and role readiness through browser plus coordinator assertions.',
            'Verify the selected preflight artifact and run logs through API endpoints.',
          ],
      reviewEvidenceExpectations: Array.isArray(artifact.reviewEvidenceExpectations)
        ? artifact.reviewEvidenceExpectations
        : ['Keep the preflight artifact parser-compatible with explicit target files and verification plan.'],
      escalationTriggers: Array.isArray(artifact.escalationTriggers)
        ? artifact.escalationTriggers
        : ['Escalate if target files would leave the approved architecture boundary.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage:
        normalizedResult.nextStage || 'request-builder-live-mutation-approval',
      summary:
        normalizedResult.summary ||
        'Builder-preflight output is ready for explicit live-mutation approval request.',
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

function createBuilderPreflightApiPayload(anchor, options = {}) {
  const outputText =
    options.rawOutputText ||
    createBuilderPreflightStructuredText({
      anchor: options.anchor || anchor,
      artifact: options.artifact,
      normalizedResult: options.normalizedResult,
    });

  return {
    payload: {
      id: options.providerRunId || 'resp-builder-preflight',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 16,
        output_tokens: 32,
        total_tokens: 48,
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
    architectCodeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
    builderPreflightCodeContextPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  });
}

function createDefaultCoordinator(runtime) {
  return createExecutionCoordinator({
    repoRoot,
    runtimeService: runtime,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectCodeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
    builderPreflightCodeContextPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
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

function createArchitectAnchor(projectId, taskId, planArtifactId, planRunId) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    codeContextPaths: ARCHITECT_CODE_CONTEXT_PATHS,
  };
}

function createTaskBreakerAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
  };
}

function createBuilderPreflightAnchor(
  projectId,
  taskId,
  planArtifactId,
  planRunId,
  architectureArtifactId,
  architectureRunId,
  breakdownArtifactId,
  breakdownRunId,
  architectureAllowlistPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
  codeContextPaths = BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
) {
  return {
    projectId,
    taskId,
    planArtifactId,
    planRunId,
    architectureArtifactId,
    architectureRunId,
    breakdownArtifactId,
    breakdownRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectureAllowlistPaths,
    codeContextPaths,
  };
}

async function runPlannerArchitectTaskBreakerForTask({
  coordinator,
  projectId,
  queuedFetch,
  runtime,
  label,
  taskId,
  intent,
  scopeStatement,
}) {
  const task = taskId
    ? runtime.getTask(taskId)
    : runtime.createTask({
        projectId,
        title: `qa-slice-05 ${label}`,
        intent,
      });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);
  const architectAnchor = createArchitectAnchor(
    projectId,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
  );

  queuedFetch.push(
    createArchitectApiPayload(architectAnchor, {
      providerRunId: 'resp-architect-fit',
    }),
  );

  const architectResult = await coordinator.runArchitect({
    taskId: task.id,
  });
  const architectureArtifact = runtime.getArtifact(architectResult.artifact.id);
  const taskBreakerAnchor = createTaskBreakerAnchor(
    projectId,
    task.id,
    planArtifact.id,
    plannerResult.run.id,
    architectureArtifact.id,
    architectResult.run.id,
  );

  queuedFetch.push(
    createTaskBreakerApiPayload(taskBreakerAnchor, {
      providerRunId: 'resp-task-breaker-fit',
    }),
  );

  const taskBreakerResult = await coordinator.runTaskBreaker({
    taskId: task.id,
  });
  const breakdownArtifact = runtime.getArtifact(taskBreakerResult.artifact.id);

  return {
    architectResult,
    architectureArtifact,
    breakdownArtifact,
    planArtifact,
    plannerResult,
    task,
    taskBreakerResult,
  };
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

async function triggerBrowserBuilderPreflight({
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

  const selectedTaskText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(taskTitle)),
    sessionName,
    label: 'selected builder-preflight task body',
  });
  collectedDomTexts.push(selectedTaskText);
  assertSecretAbsent(selectedTaskText, secret, 'taskboard selected task body');

  const buildReadyText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: /빌더 프리플라이트 실행/,
    sessionName,
    label: 'builder-preflight button visibility',
  });
  collectedDomTexts.push(buildReadyText);
  assertSecretAbsent(buildReadyText, secret, 'builder-preflight button body');

  launchBuilderPreflightViaBrowser({
    outputRoot,
    overrideEnvVar,
    sessionName,
    taskId,
  });

  const activeSurface = await waitForValue(async () => {
    const surface = evaluate({
      expression: `document.querySelector('.nav-button.is-active')?.dataset.surface || null`,
      outputRoot,
      overrideEnvVar,
      sessionName,
    });

    return surface === 'artifacts' ? surface : null;
  }, 'Artifacts landing after builder preflight');

  assert.equal(activeSurface, 'artifacts');

  return collectedDomTexts;
}

async function verifyBrowserArtifactSelection({
  artifactId,
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
}) {
  const selectedArtifactId = await waitForValue(async () => {
    const value = evaluate({
      expression: `document.querySelector('[data-action="select-artifact"].is-selected')?.dataset.id || null`,
      outputRoot,
      overrideEnvVar,
      sessionName,
    });

    return value === artifactId ? value : null;
  }, 'selected preflight artifact');

  assert.equal(selectedArtifactId, artifactId);

  const artifactsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(`${escapeRegExp(artifactId)}[\\s\\S]*Target Files`, 'i'),
    sessionName,
    label: 'selected preflight artifact body',
  });

  assert.match(artifactsText, /Builder Preflight/i);
  assert.match(artifactsText, /Target Files/i);
  assert.match(artifactsText, /Verification Plan/i);
  assert.match(artifactsText, /Review Evidence Expectations/i);
  assertSecretAbsent(artifactsText, secret, 'artifacts surface body');

  return artifactsText;
}

async function prepareBrowserHarness({ browser, outputRoot, overrideEnvVar, runtimeRoot, serverEnv }) {
  const configPath = path.join(outputRoot, 'playwright-cli.json');
  const sessionName = 'qa-slice-05';
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

export async function runQaSlice05SyntheticSmoke(options = {}) {
  const outputRoot = options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-05');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-slice-05');
  const browser = options.browser || process.env.QA_SLICE_05_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_05_PLAYWRIGHT_CLI_BIN';
  const liveProviderEnvVar = options.liveProviderEnvVar || 'QA_SLICE_05_LIVE_PROVIDER_API_KEY';
  const sentinelSecret = options.secret || 'qa-slice-05-secret-sentinel';
  const providerModel = options.model || 'qa-slice-05-operator-model';
  const runtime = createRuntimeService({ runtimeRoot });
  const fixture = createFixtureProject('synthetic-live');

  ensureCleanDir(outputRoot);
  ensureCleanDir(runtimeRoot);
  ensurePlaywrightConfig(outputRoot, path.join(outputRoot, 'playwright-cli.json'));
  process.env[liveProviderEnvVar] = sentinelSecret;
  runtime.resetRuntime();

  const serverFetchStub = createServerFetchStubFiles(outputRoot);
  const serverEnv = {
    [liveProviderEnvVar]: sentinelSecret,
    [SERVER_FETCH_STATE_ENV]: serverFetchStub.statePath,
    NODE_OPTIONS: mergeNodeOptions(process.env.NODE_OPTIONS, [
      `--require=${serverFetchStub.preloadPath}`,
    ]),
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
      pattern: /등록된 프로젝트 없음|작업할 프로젝트를 연결하세요/,
      sessionName: harness.sessionName,
      label: 'project bootstrap landing',
    });
    domTexts.push(landingSnapshot);
    assertSecretAbsent(landingSnapshot, sentinelSecret, 'landing snapshot');

    const projectPayload = await postJson(harness.baseUrl, '/api/projects', {
      name: 'qa-slice-05',
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

    const taskPayload = await postJson(harness.baseUrl, '/api/tasks', {
      intent:
        'Run planner, architect, task-breaker, and builder-preflight through synthetic qa-slice-05 while keeping browser assertions limited to provider summary, builder-preflight launch, Artifacts landing, and selected preflight visibility.',
      title: 'QA slice 05 builder-preflight fit',
    });

    const syntheticRuntime = createRuntimeService({ runtimeRoot });
    const queuedFetch = createQueuedFetch([createPlannerApiPayload('qa-slice-05-fit')]);
    const syntheticCoordinator = createSyntheticCoordinator(syntheticRuntime, queuedFetch.fetchImpl);
    const roleReadiness = collectRoleReadiness(syntheticCoordinator, projectId);

    assertRoleReadiness(roleReadiness);

    const context = await runPlannerArchitectTaskBreakerForTask({
      coordinator: syntheticCoordinator,
      projectId,
      queuedFetch,
      runtime: syntheticRuntime,
      label: 'builder-preflight fit',
      taskId: taskPayload.task.id,
      intent:
        'Run planner, architect, and task-breaker live before browser-triggered builder-preflight verification.',
      scopeStatement:
        'Verify qa-slice-05 happy-path browser and API coverage for builder-preflight live execution.',
    });

    assert.equal(context.task.id, taskPayload.task.id);

    assert.equal(context.plannerResult.run.summary.adapter, 'openai-responses');
    assert.equal(context.architectResult.run.summary.adapter, 'openai-responses');
    assert.equal(context.architectResult.run.summary.inputArtifactId, context.planArtifact.id);
    assert.equal(context.architectResult.run.summary.inputRunId, context.plannerResult.run.id);
    assert.equal(context.taskBreakerResult.run.summary.adapter, 'openai-responses');
    assert.equal(
      context.taskBreakerResult.run.summary.architectureArtifactId,
      context.architectureArtifact.id,
    );
    assert.equal(
      context.taskBreakerResult.run.summary.architectureRunId,
      context.architectResult.run.id,
    );
    assert.equal(context.taskBreakerResult.run.summary.nextStage, 'builder');
    assert.equal(context.taskBreakerResult.decisionInboxItem, null);

    const builderPreflightAnchor = createBuilderPreflightAnchor(
      projectId,
      context.task.id,
      context.planArtifact.id,
      context.plannerResult.run.id,
      context.architectureArtifact.id,
      context.architectResult.run.id,
      context.breakdownArtifact.id,
      context.taskBreakerResult.run.id,
    );

    writeServerFetchQueue(serverFetchStub.statePath, [
      createBuilderPreflightApiPayload(builderPreflightAnchor, {
        providerRunId: 'resp-builder-preflight-fit',
      }),
    ]);

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const browserTaskTexts = await triggerBrowserBuilderPreflight({
      outputRoot,
      overrideEnvVar,
      secret: sentinelSecret,
      sessionName: harness.sessionName,
      taskId: taskPayload.task.id,
      taskTitle: taskPayload.task.title,
    });
    domTexts.push(...browserTaskTexts);

    const snapshotPayload = await waitForSnapshotPayload(
      harness.baseUrl,
      'synthetic qa-slice-05 snapshot',
      (payload) =>
        countArtifacts(payload.snapshot, taskPayload.task.id, 'preflight') === 1 &&
        countPendingDecisionItems(payload.snapshot, taskPayload.task.id) === 0,
    );

    const preflightArtifact = findLatestArtifact(snapshotPayload, taskPayload.task.id, 'preflight');
    const preflightRun = preflightArtifact?.runId
      ? snapshotPayload.snapshot.runs[preflightArtifact.runId] || null
      : null;
    const taskGuardSummary = snapshotPayload.derived.taskGuardSummaries?.[taskPayload.task.id] || null;
    const reviewerSummary =
      snapshotPayload.derived.reviewerReadinessSummaries?.[taskPayload.task.id] || null;

    assert.ok(preflightArtifact);
    assert.ok(preflightRun);
    assertProjectProviderSummary(snapshotPayload.derived.providerExecutionSummaries[projectId]);
    assert.equal(countApprovals(snapshotPayload.snapshot, taskPayload.task.id), 0);
    assert.equal(preflightRun.summary.adapter, 'openai-responses');
    assert.equal(preflightRun.summary.planArtifactId, context.planArtifact.id);
    assert.equal(preflightRun.summary.planRunId, context.plannerResult.run.id);
    assert.equal(preflightRun.summary.architectureArtifactId, context.architectureArtifact.id);
    assert.equal(preflightRun.summary.architectureRunId, context.architectResult.run.id);
    assert.equal(preflightRun.summary.breakdownArtifactId, context.breakdownArtifact.id);
    assert.equal(preflightRun.summary.breakdownRunId, context.taskBreakerResult.run.id);
    assert.equal(preflightRun.summary.nextStage, 'request-builder-live-mutation-approval');
    assert.equal(preflightRun.summary.decisionCreated, false);
    assert.ok(taskGuardSummary);
    assert.equal(taskGuardSummary.builderLiveMutationApprovalRequest.allowed, true);
    assert.equal(taskGuardSummary.builderLiveMutation.allowed, false);
    assert.ok(reviewerSummary);
    assert.equal(reviewerSummary.allowed, false);

    const artifactPayload = await fetchArtifactPayload(harness.baseUrl, preflightArtifact.id);
    const preflightLogs = await fetchRunLogsPayload(harness.baseUrl, preflightRun.id);

    assert.match(artifactPayload.artifact.content, /^# Builder Preflight:/m);
    assert.match(artifactPayload.artifact.content, /^## Target Files$/m);
    assert.match(artifactPayload.artifact.content, /^## Verification Plan$/m);
    assert.match(artifactPayload.artifact.content, /^## Review Evidence Expectations$/m);
    assert.match(artifactPayload.artifact.content, /^## Input Summary$/m);
    assertOpenAiLogs(preflightLogs);

    const artifactSurfaceText = await verifyBrowserArtifactSelection({
      artifactId: preflightArtifact.id,
      outputRoot,
      overrideEnvVar,
      secret: sentinelSecret,
      sessionName: harness.sessionName,
    });
    domTexts.push(artifactSurfaceText);

    await scanApiPayloadsForSecret(harness.baseUrl, snapshotPayload, sentinelSecret);

    const serverFetchState = readServerFetchState(serverFetchStub.statePath);

    assert.equal(serverFetchState.calls.length, 1);

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
      roleReadiness: {
        architect: roleReadiness.architect.readiness,
        builderLiveMutation: roleReadiness.builderLiveMutation.readiness,
        builderPreflight: roleReadiness.builderPreflight.readiness,
        planner: roleReadiness.planner.readiness,
        reviewer: roleReadiness.reviewer.readiness,
        taskBreaker: roleReadiness.taskBreaker.readiness,
      },
      scenario: {
        builderPreflightRunId: preflightRun.id,
        nextStage: preflightRun.summary.nextStage,
        preflightArtifactId: preflightArtifact.id,
        selectedSurface: 'artifacts',
        taskId: taskPayload.task.id,
      },
    };
  } catch (error) {
    captureFailureScreenshot({
      filename: 'qa-slice-05-failure.png',
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

export async function runQaSlice05RealSmoke(options = {}) {
  const outputRoot =
    options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-05-live');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-live-slice-05');
  const browser = options.browser || process.env.QA_SLICE_05_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_05_PLAYWRIGHT_CLI_BIN';
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
      pattern: /등록된 프로젝트 없음|작업할 프로젝트를 연결하세요/,
      sessionName: harness.sessionName,
      label: 'real live project bootstrap landing',
    });
    domTexts.push(landingSnapshot);
    assertSecretAbsent(landingSnapshot, apiKey, 'real live landing snapshot');

    const projectPayload = await postJson(harness.baseUrl, '/api/projects', {
      name: 'qa-slice-05-live',
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
      intent:
        'Run planner, architect, task-breaker, and builder-preflight live for optional qa-slice-05 verification while keeping browser assertions limited to provider summary, builder-preflight launch, Artifacts landing, and selected preflight visibility. Stay inside these repo-relative files only: src/runtime/contracts.js, src/runtime/runtime-service.js, src/execution/provider-adapter.js, src/execution/execution-coordinator.js, src/execution/providers/openai-responses-adapter.js, ui/app.js.',
      title: 'QA slice 05 optional real live',
    });

    const realRuntime = createRuntimeService({ runtimeRoot });
    const coordinator = createDefaultCoordinator(realRuntime);
    const roleReadiness = collectRoleReadiness(coordinator, projectId);

    assertRoleReadiness(roleReadiness);

    const plannerResult = await coordinator.runPlanner({
      taskId: taskPayload.task.id,
      routingOutcome: createRoutingOutcome(
        'Validate the optional real planner, architect, task-breaker, and builder-preflight live path for qa-slice-05.',
      ),
    });
    const architectResult = await coordinator.runArchitect({
      taskId: taskPayload.task.id,
    });
    const taskBreakerResult = await coordinator.runTaskBreaker({
      taskId: taskPayload.task.id,
    });

    assert.equal(plannerResult.run.summary.adapter, 'openai-responses');
    assert.ok(plannerResult.run.summary.providerRunId);
    assert.equal(architectResult.run.summary.adapter, 'openai-responses');
    assert.ok(architectResult.run.summary.providerRunId);
    assert.equal(architectResult.run.summary.inputArtifactId, plannerResult.artifact.id);
    assert.equal(architectResult.run.summary.inputRunId, plannerResult.run.id);
    assert.equal(architectResult.run.summary.nextStage, 'task-breaker');
    assert.equal(taskBreakerResult.run.summary.adapter, 'openai-responses');
    assert.ok(taskBreakerResult.run.summary.providerRunId);
    assert.equal(taskBreakerResult.run.summary.nextStage, 'builder');

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const browserTaskTexts = await triggerBrowserBuilderPreflight({
      outputRoot,
      overrideEnvVar,
      secret: apiKey,
      sessionName: harness.sessionName,
      taskId: taskPayload.task.id,
      taskTitle: taskPayload.task.title,
    });
    domTexts.push(...browserTaskTexts);

    const snapshotPayload = await waitForSnapshotPayload(
      harness.baseUrl,
      'real qa-slice-05 snapshot',
      (payload) => countArtifacts(payload.snapshot, taskPayload.task.id, 'preflight') === 1,
    );

    const preflightArtifact = findLatestArtifact(snapshotPayload, taskPayload.task.id, 'preflight');
    const preflightRun = preflightArtifact?.runId
      ? snapshotPayload.snapshot.runs[preflightArtifact.runId] || null
      : null;
    const taskGuardSummary = snapshotPayload.derived.taskGuardSummaries?.[taskPayload.task.id] || null;
    const reviewerSummary =
      snapshotPayload.derived.reviewerReadinessSummaries?.[taskPayload.task.id] || null;

    assert.ok(preflightArtifact);
    assert.ok(preflightRun);
    assertProjectProviderSummary(snapshotPayload.derived.providerExecutionSummaries[projectId]);
    assert.equal(preflightRun.summary.adapter, 'openai-responses');
    assert.ok(preflightRun.summary.providerRunId);
    assert.equal(preflightRun.summary.planArtifactId, plannerResult.artifact.id);
    assert.equal(preflightRun.summary.planRunId, plannerResult.run.id);
    assert.equal(preflightRun.summary.architectureArtifactId, architectResult.artifact.id);
    assert.equal(preflightRun.summary.architectureRunId, architectResult.run.id);
    assert.equal(preflightRun.summary.breakdownArtifactId, taskBreakerResult.artifact.id);
    assert.equal(preflightRun.summary.breakdownRunId, taskBreakerResult.run.id);
    assert.ok(
      ['request-builder-live-mutation-approval', 'architect', 'task-breaker', 'human gate'].includes(
        preflightRun.summary.nextStage,
      ),
    );
    assert.ok(taskGuardSummary);
    assert.equal(taskGuardSummary.builderLiveMutation.allowed, false);
    assert.ok(reviewerSummary);
    assert.equal(reviewerSummary.allowed, false);

    const artifactPayload = await fetchArtifactPayload(harness.baseUrl, preflightArtifact.id);
    const preflightLogs = await fetchRunLogsPayload(harness.baseUrl, preflightRun.id);

    assert.match(artifactPayload.artifact.content, /^# Builder Preflight:/m);
    assert.match(artifactPayload.artifact.content, /^## Target Files$/m);
    assert.match(artifactPayload.artifact.content, /^## Input Summary$/m);
    assertOpenAiLogs(preflightLogs);

    const artifactSurfaceText = await verifyBrowserArtifactSelection({
      artifactId: preflightArtifact.id,
      outputRoot,
      overrideEnvVar,
      secret: apiKey,
      sessionName: harness.sessionName,
    });
    domTexts.push(artifactSurfaceText);

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
        builderPreflightRunId: preflightRun.id,
        nextStage: preflightRun.summary.nextStage,
        preflightArtifactId: preflightArtifact.id,
        selectedSurface: 'artifacts',
        taskId: taskPayload.task.id,
      },
    };
  } catch (error) {
    captureFailureScreenshot({
      filename: 'qa-slice-05-live-failure.png',
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
