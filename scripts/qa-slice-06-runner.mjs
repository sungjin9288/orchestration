import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import crypto from 'node:crypto';
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
const SERVER_FETCH_STATE_ENV = 'QA_SLICE_06_SERVER_FETCH_STUB_STATE';
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
  'ui/app.js',
];
const DEFAULT_TARGET_FILES = [
  'src/runtime/runtime-service.js',
  'src/execution/execution-coordinator.js',
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

function ensureParentDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function copyFixtureFile(projectPath, relativePath) {
  const sourcePath = path.join(repoRoot, relativePath);
  const targetPath = path.join(projectPath, relativePath);

  ensureParentDir(targetPath);
  fs.copyFileSync(sourcePath, targetPath);
}

function createFixtureProject(label) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), `orchestration-qa-slice-06-${label}-`));
  const projectPath = path.join(fixtureRoot, 'project');
  const fixtureFiles = [
    ...new Set([...ARCHITECT_CODE_CONTEXT_PATHS, ...BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS]),
  ];

  fs.mkdirSync(projectPath, { recursive: true });

  for (const relativePath of fixtureFiles) {
    copyFixtureFile(projectPath, relativePath);
  }

  fs.writeFileSync(path.join(projectPath, 'README.md'), `# ${label}\n`, 'utf8');
  runGit(projectPath, ['init', '-q']);
  runGit(projectPath, ['config', 'user.name', 'qa-slice-06']);
  runGit(projectPath, ['config', 'user.email', 'qa-slice-06@example.com']);
  runGit(projectPath, ['add', '.']);
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
  return (
    Object.values(snapshotPayload.snapshot.artifacts)
      .filter((artifact) => artifact.taskId === taskId && artifact.type === type)
      .sort((left, right) => (right.createdAt || '').localeCompare(left.createdAt || ''))[0] || null
  );
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
  const preloadPath = path.join(outputRoot, 'qa-slice-06-server-fetch-stub.cjs');
  const statePath = path.join(outputRoot, 'qa-slice-06-server-fetch-state.json');
  const preload = `'use strict';

const fs = require('node:fs');

const statePath = process.env[${JSON.stringify(SERVER_FETCH_STATE_ENV)}];

function loadState() {
  if (!statePath || !fs.existsSync(statePath)) {
    return { calls: [], queue: [] };
  }

  return JSON.parse(fs.readFileSync(statePath, 'utf8'));
}

function sanitizeHeaders(headers) {
  const sanitized = {};

  if (!headers || typeof headers !== 'object') {
    return sanitized;
  }

  for (const [key, value] of Object.entries(headers)) {
    if (/authorization|api[-_]?key|cookie/i.test(String(key))) {
      sanitized[key] = '[redacted]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function saveState(state) {
  fs.writeFileSync(statePath, \`\${JSON.stringify(state, null, 2)}\\n\`, 'utf8');
}

global.fetch = async function qaSlice06ServerFetch(url, init = {}) {
  const state = loadState();

  state.calls.push({
    body: init.body || '',
    headers: sanitizeHeaders(init.headers || {}),
    method: init.method || 'GET',
    url,
  });

  if (!Array.isArray(state.queue) || state.queue.length === 0) {
    saveState(state);
    throw new Error('No queued response for qa-slice-06 server fetch stub');
  }

  const next = state.queue.shift();
  saveState(state);

  if (next && Object.prototype.hasOwnProperty.call(next, 'throwError')) {
    const error = new Error(next.throwError.message || 'qa-slice-06 server fetch stub error');

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
    .map((entry) => ({
      filePath: path.join(snapshotDir, entry),
      mtimeMs: fs.statSync(path.join(snapshotDir, entry)).mtimeMs,
    }))
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
Verify qa-slice-06 builder-live-mutation browser and API verification.

## Intended Outcome
Keep browser checks limited to approval request, inbox approval, live mutation launch, logs landing, and selected change-summary visibility.

## Acceptance Target
- live project provider summary stays coarse in browser
- planner, architect, task-breaker, and builder-preflight are prepared without widening semantics
- builder live mutation approval is requested and consumed once for the current preflight pair
- builder live mutation stores change-summary, patch, and diff as one bundle
- duplicate rerun stays blocked
- reviewer provider execution remains blocked or degraded

## Verification Approach
- browser landing, selection, button visibility, logs landing, and selected artifact visibility checks
- /api/snapshot, /api/artifacts, /api/runs/:id/logs, and direct coordinator readiness assertions

## Dependencies and Blockers
- none

## Expected Artifacts
- plan
- architecture
- breakdown
- preflight
- change-summary
- patch
- diff
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
        : ['The slice keeps browser checks limited and leaves runtime semantics unchanged.'],
      decisionLogImpact: Array.isArray(artifact.decisionLogImpact)
        ? artifact.decisionLogImpact
        : ['None. The current decision log remains unchanged.'],
      approvedAssumptions: Array.isArray(artifact.approvedAssumptions)
        ? artifact.approvedAssumptions
        : [
            'Builder live mutation browser QA should keep browser assertions shallow and close semantics through API payloads.',
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
            'Prepare the smallest implementation path that reaches builder live mutation approval request.',
            'Stop after the bounded slice is ready for approval request and live mutation execution.',
          ],
      checkpoints: Array.isArray(artifact.checkpoints)
        ? artifact.checkpoints
        : [
            'checkpoint 1: confirm the current boundary and non-goals',
            'checkpoint 2: define the smallest builder-live-mutation-ready sequence',
            'checkpoint 3: capture browser and API verification points',
          ],
      expectedArtifactsPerCheckpoint: Array.isArray(artifact.expectedArtifactsPerCheckpoint)
        ? artifact.expectedArtifactsPerCheckpoint
        : [
            'checkpoint 1: breakdown',
            'checkpoint 2: preflight',
            'checkpoint 3: approval request and mutation bundle',
          ],
      verificationCheckpoints: Array.isArray(artifact.verificationCheckpoints)
        ? artifact.verificationCheckpoints
        : ['Confirm approval consumption, duplicate rerun block, and no-secret-leak guarantees.'],
      reviewTriggerPoints: Array.isArray(artifact.reviewTriggerPoints)
        ? artifact.reviewTriggerPoints
        : ['Trigger review only after live mutation bundle is saved.'],
      stopAndEscalateConditions: Array.isArray(artifact.stopAndEscalateConditions)
        ? artifact.stopAndEscalateConditions
        : ['Stop if mutation would leave the approved allowlist or change runtime semantics.'],
      executionBoundarySummary: Array.isArray(artifact.executionBoundarySummary)
        ? artifact.executionBoundarySummary
        : ['The slice ends at builder live mutation verification; reviewer live remains blocked.'],
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
      targetFiles: Array.isArray(artifact.targetFiles) ? artifact.targetFiles : [...DEFAULT_TARGET_FILES],
      intendedChanges: Array.isArray(artifact.intendedChanges)
        ? artifact.intendedChanges
        : [
            'Prepare the current builder live mutation allowlist without widening provider or reviewer semantics.',
            'Preserve approval-request-only handoff before the live mutation run.',
          ],
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when approval, allowlist, or exact-match validation diverges.'],
      verificationPlan: Array.isArray(artifact.verificationPlan)
        ? artifact.verificationPlan
        : [
            'Verify approval request, approval consumption, and mutation bundle creation through browser plus API assertions.',
            'Verify duplicate rerun block and no-secret-leak through runtime, logs, and artifact payloads.',
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
      nextStage: normalizedResult.nextStage || 'request-builder-live-mutation-approval',
      summary:
        normalizedResult.summary ||
        'Builder-preflight output is ready for explicit live-mutation approval request.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createBuilderLiveMutationStructuredText({ anchor, artifact = {}, normalizedResult = {} }) {
  const fileUpdates = Array.isArray(artifact.fileUpdates) ? artifact.fileUpdates : [];

  return JSON.stringify({
    anchor,
    artifact: {
      changeSummary: Array.isArray(artifact.changeSummary)
        ? artifact.changeSummary
        : ['Prepare a bounded mutation bundle for the approved preflight target set.'],
      targetFiles: Array.isArray(artifact.targetFiles)
        ? artifact.targetFiles
        : [...anchor.targetFileAllowlistPaths],
      fileUpdates: fileUpdates.map((fileUpdate) => ({
        path: fileUpdate.path,
        contentBase64:
          fileUpdate.contentBase64 || Buffer.from(fileUpdate.content || '', 'utf8').toString('base64'),
      })),
      risks: Array.isArray(artifact.risks)
        ? artifact.risks
        : ['Fail closed when actual changed files diverge from the validated file update set.'],
      verificationNotes: Array.isArray(artifact.verificationNotes)
        ? artifact.verificationNotes
        : ['Do not run reviewer live from this slice.'],
    },
    normalizedResult: {
      blockers: Array.isArray(normalizedResult.blockers) ? normalizedResult.blockers : [],
      needsDecision: Boolean(normalizedResult.needsDecision),
      nextStage: normalizedResult.nextStage || 'reviewer',
      summary:
        normalizedResult.summary ||
        'Builder live mutation prepared a bounded file update inside the approved target allowlist.',
      decisionTitle: normalizedResult.decisionTitle || '',
      decisionPrompt: normalizedResult.decisionPrompt || '',
    },
  });
}

function createApiPayload(outputText, options = {}) {
  return {
    payload: {
      id: options.providerRunId || 'resp-qa-slice-06',
      model: options.model || 'gpt-4.1-mini',
      output_text: outputText,
      usage: {
        input_tokens: 18,
        output_tokens: 36,
        total_tokens: 54,
      },
    },
    status: options.status ?? 200,
  };
}

function createPlannerApiPayload(label, options = {}) {
  return createApiPayload(
    createPlannerStructuredText({
      artifactMarkdown: createPlannerArtifactMarkdown(label),
      normalizedResult: options.normalizedResult || {},
    }),
    options,
  );
}

function createArchitectApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createArchitectStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createTaskBreakerApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createTaskBreakerStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createBuilderPreflightApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createBuilderPreflightStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
}

function createBuilderLiveMutationApiPayload(anchor, options = {}) {
  return createApiPayload(
    options.rawOutputText ||
      createBuilderLiveMutationStructuredText({
        anchor: options.anchor || anchor,
        artifact: options.artifact,
        normalizedResult: options.normalizedResult,
      }),
    options,
  );
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
    planner: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'planner',
    }),
    architect: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'architect',
    }),
    taskBreaker: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'task-breaker',
    }),
    builderPreflight: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-preflight',
    }),
    builderLiveMutation: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'builder-live-mutation',
    }),
    reviewer: coordinator.getProviderExecutionReadiness({
      projectId,
      role: 'reviewer',
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
  assert.equal(roleReadiness.reviewer.readiness, 'degraded');
  assert.equal(roleReadiness.reviewer.allowed, false);
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

function captureDigests(projectPath, relativePaths) {
  return relativePaths.map((relativePath) => {
    const filePath = path.join(projectPath, relativePath);
    const content = fs.readFileSync(filePath, 'utf8');

    return {
      path: relativePath,
      digest: crypto.createHash('sha256').update(content, 'utf8').digest('hex'),
    };
  });
}

function createBuilderLiveMutationAnchor(context) {
  const digests = captureDigests(context.project.projectPath, context.targetFiles);

  return {
    projectId: context.project.id,
    taskId: context.task.id,
    planArtifactId: context.planArtifact.id,
    planRunId: context.plannerResult.run.id,
    architectureArtifactId: context.architectureArtifact.id,
    architectureRunId: context.architectResult.run.id,
    breakdownArtifactId: context.breakdownArtifact.id,
    breakdownRunId: context.taskBreakerResult.run.id,
    preflightArtifactId: context.preflightResult.artifact.id,
    preflightRunId: context.preflightResult.run.id,
    approvalId: context.approval.id,
    approvalTargetArtifactId: context.approval.targetArtifactId,
    approvalTargetRunId: context.approval.targetRunId,
    sourceOfTruthPaths: SOURCE_OF_TRUTH_PATHS,
    architectureAllowlistPaths: BUILDER_PREFLIGHT_CODE_CONTEXT_PATHS,
    targetFileAllowlistPaths: context.targetFiles,
    codeContextPaths: context.targetFiles,
    targetFileBaselineDigests: digests,
  };
}

function buildMutationMarker(approvalId, relativePath) {
  return `qa-slice-06 ${approvalId} ${relativePath}`;
}

function createMutatedFileContent(projectPath, relativePath, approvalId) {
  const filePath = path.join(projectPath, relativePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const marker = buildMutationMarker(approvalId, relativePath);
  const suffix =
    path.extname(relativePath).toLowerCase() === '.js'
      ? `\n// ${marker}\n`
      : `\n<!-- ${marker} -->\n`;

  return {
    marker,
    mutated: `${content.replace(/\s*$/, '\n').replace(/\n$/, '')}${suffix}`,
    original: content,
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
        title: `qa-slice-06 ${label}`,
        intent,
      });
  const plannerResult = await coordinator.runPlanner({
    taskId: task.id,
    routingOutcome: createRoutingOutcome(scopeStatement),
  });
  const planArtifact = runtime.getArtifact(plannerResult.artifact.id);
  const architectAnchor = createArchitectAnchor(projectId, task.id, planArtifact.id, plannerResult.run.id);

  queuedFetch.push(
    createArchitectApiPayload(architectAnchor, {
      providerRunId: `resp-qa-slice-06-architect-${label}`,
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
      providerRunId: `resp-qa-slice-06-task-breaker-${label}`,
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

async function prepareBuilderLiveMutationContext({
  coordinator,
  projectId,
  queuedFetch,
  runtime,
  taskId,
  label,
  targetFiles = DEFAULT_TARGET_FILES,
}) {
  const context = await runPlannerArchitectTaskBreakerForTask({
    coordinator,
    projectId,
    queuedFetch,
    runtime,
    label,
    taskId,
    intent:
      'Prepare the current builder live mutation browser/API verification slice without widening runtime or reviewer semantics.',
    scopeStatement:
      'Verify approval request, approval consumption, mutation bundle creation, duplicate rerun block, and no-secret-leak for builder live mutation.',
  });
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

  queuedFetch.push(
    createBuilderPreflightApiPayload(builderPreflightAnchor, {
      artifact: {
        targetFiles,
      },
      providerRunId: `resp-qa-slice-06-preflight-${label}`,
    }),
  );

  const preflightResult = await coordinator.runBuilderPreflight({
    taskId: context.task.id,
  });

  assert.equal(preflightResult.run.summary.nextStage, 'request-builder-live-mutation-approval');

  return {
    ...context,
    preflightResult,
    project: runtime.getProject(projectId),
    targetFiles,
  };
}

async function verifyBrowserProjectSummary({
  outputRoot,
  overrideEnvVar,
  projectSummary,
  secret,
  sessionName,
}) {
  const providerReadySnapshot = await waitForSnapshotText({
    outputRoot,
    overrideEnvVar,
    pattern: /provider readiness:ready/i,
    sessionName,
    label: 'provider readiness ready DOM',
  });

  assert.match(providerReadySnapshot, /provider:openai-responses/i);
  assertSecretAbsent(providerReadySnapshot, secret, 'project summary snapshot');
  assertProjectProviderSummary(projectSummary);

  return providerReadySnapshot;
}

function clickSurface({ outputRoot, overrideEnvVar, sessionName, surface }) {
  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `.nav-button[data-surface="${surface}"]`,
    sessionName,
  });
}

async function waitForActiveSurface({
  outputRoot,
  overrideEnvVar,
  sessionName,
  surface,
  label,
}) {
  return waitForValue(async () => {
    const value = evaluate({
      expression: `document.querySelector('.nav-button.is-active')?.dataset.surface || null`,
      outputRoot,
      overrideEnvVar,
      sessionName,
    });

    return value === surface ? value : null;
  }, label);
}

async function triggerBrowserApprovalRequest({
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
  taskId,
  taskTitle,
}) {
  const domTexts = [];

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="select-task"][data-id="${taskId}"]`,
    sessionName,
  });

  const taskText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(taskTitle)),
    sessionName,
    label: 'selected builder-live-mutation task body',
  });
  domTexts.push(taskText);
  assertSecretAbsent(taskText, secret, 'taskboard selected task body');

  const requestText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: /Request Live Mutation Approval/i,
    sessionName,
    label: 'live mutation approval request button visibility',
  });
  domTexts.push(requestText);
  assertSecretAbsent(requestText, secret, 'live mutation request body');

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: '[data-action="request-builder-live-mutation-approval"]',
    sessionName,
  });

  return domTexts;
}

async function triggerBrowserApprovalResolve({
  inboxItemId,
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
}) {
  const domTexts = [];

  clickSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'decision-inbox',
  });
  await waitForActiveSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'decision-inbox',
    label: 'decision inbox landing',
  });

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="select-inbox-item"][data-id="${inboxItemId}"]`,
    sessionName,
  });

  const itemText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(`${escapeRegExp(inboxItemId)}|Approve`, 'i'),
    sessionName,
    label: 'selected approval inbox item body',
  });
  domTexts.push(itemText);
  assertSecretAbsent(itemText, secret, 'selected inbox approval body');

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: '[data-action="run-inbox-action"][data-verb="approve"]',
    sessionName,
  });

  return domTexts;
}

async function triggerBrowserBuilderLiveMutation({
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
  taskId,
  taskTitle,
}) {
  const domTexts = [];

  clickSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'taskboard',
  });
  await waitForActiveSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'taskboard',
    label: 'taskboard landing before live mutation',
  });

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="select-task"][data-id="${taskId}"]`,
    sessionName,
  });

  const taskText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(taskTitle)),
    sessionName,
    label: 'selected task before live mutation run',
  });
  domTexts.push(taskText);
  assertSecretAbsent(taskText, secret, 'taskboard pre-run body');

  const guardReadyText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: /live mutation guard:ready[\s\S]*latest approval:approved|latest approval:approved[\s\S]*live mutation guard:ready/i,
    sessionName,
    label: 'live mutation ready guard visibility',
  });
  domTexts.push(guardReadyText);
  assertSecretAbsent(guardReadyText, secret, 'live mutation ready guard body');

  const runButtonText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: /Run Live Mutation/i,
    sessionName,
    label: 'live mutation run button visibility',
  });
  domTexts.push(runButtonText);
  assertSecretAbsent(runButtonText, secret, 'live mutation run body');

  return domTexts;
}

async function verifyBrowserLogsLanding({
  outputRoot,
  overrideEnvVar,
  runId,
  secret,
  sessionName,
}) {
  clickSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'logs',
  });
  await waitForActiveSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'logs',
    label: 'logs landing after builder live mutation',
  });

  const logsText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(runId), 'i'),
    sessionName,
    label: 'selected builder live mutation run visibility',
  });

  assertSecretAbsent(logsText, secret, 'logs surface body');
  return logsText;
}

async function verifyBrowserArtifactSelection({
  artifactId,
  outputRoot,
  overrideEnvVar,
  secret,
  sessionName,
}) {
  clickSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'artifacts',
  });
  await waitForActiveSurface({
    outputRoot,
    overrideEnvVar,
    sessionName,
    surface: 'artifacts',
    label: 'artifacts landing after builder live mutation',
  });

  clickSelector({
    outputRoot,
    overrideEnvVar,
    selector: `[data-action="select-artifact"][data-id="${artifactId}"]`,
    sessionName,
  });

  const artifactText = await waitForBodyText({
    outputRoot,
    overrideEnvVar,
    pattern: new RegExp(escapeRegExp(artifactId), 'i'),
    sessionName,
    label: 'selected change-summary artifact detail visibility',
  });

  assert.match(artifactText, new RegExp(escapeRegExp(artifactId), 'i'));
  assertSecretAbsent(artifactText, secret, 'artifacts surface body');

  return artifactText;
}

async function prepareBrowserHarness({
  browser,
  outputRoot,
  overrideEnvVar,
  runtimeRoot,
  serverEnv,
}) {
  const configPath = path.join(outputRoot, 'playwright-cli.json');
  const sessionName = 'qa-slice-06';
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

async function assertDuplicateLiveMutationBlocks(baseUrl, taskId) {
  const rerun = await postJsonAllowError(
    baseUrl,
    `/api/tasks/${encodeURIComponent(taskId)}/run-builder-live-mutation`,
  );
  const rerequest = await postJsonAllowError(
    baseUrl,
    `/api/tasks/${encodeURIComponent(taskId)}/request-builder-live-mutation-approval`,
  );

  assert.ok(rerun.status >= 400);
  assert.match(
    String(rerun.payload?.error || ''),
    /already has successful builder live mutation run|already consumed/i,
  );
  assert.equal(rerequest.status, 409);
  assert.match(
    String(rerequest.payload?.error || ''),
    /successful builder live mutation run|already covers/i,
  );
}

async function runSharedQaSlice06Flow({
  browser,
  outputRoot,
  runtimeRoot,
  overrideEnvVar,
  secretToCheck,
  createServerEnv,
  createUpstreamCoordinator,
  createReadinessCoordinator,
  queueBuilderLiveMutationResponse,
  getServerStatePath = null,
  projectName,
  taskTitle,
  liveProviderApiKeyVar,
  providerModel,
}) {
  const runtime = createRuntimeService({ runtimeRoot });
  const fixture = createFixtureProject(projectName);
  const domTexts = [];

  ensureCleanDir(outputRoot);
  ensureCleanDir(runtimeRoot);
  ensurePlaywrightConfig(outputRoot, path.join(outputRoot, 'playwright-cli.json'));
  runtime.resetRuntime();

  const harness = await prepareBrowserHarness({
    browser,
    outputRoot,
    overrideEnvVar,
    runtimeRoot,
    serverEnv: createServerEnv(),
  });

  try {
    const landingSnapshot = await waitForSnapshotText({
      outputRoot,
      overrideEnvVar,
      pattern: /Register Project/i,
      sessionName: harness.sessionName,
      label: 'project bootstrap landing',
    });
    domTexts.push(landingSnapshot);
    assertSecretAbsent(landingSnapshot, secretToCheck, 'landing snapshot');

    const projectPayload = await postJson(harness.baseUrl, '/api/projects', {
      name: projectName,
      projectPath: fixture.projectPath,
      provider: {
        adapter: 'openai-responses',
        mode: 'live',
        model: providerModel,
        env: {
          apiKeyVar: liveProviderApiKeyVar,
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
      secret: secretToCheck,
      sessionName: harness.sessionName,
    });
    domTexts.push(providerReadySnapshot);

    const taskPayload = await postJson(harness.baseUrl, '/api/tasks', {
      title: taskTitle,
      intent:
        'Verify builder live mutation through browser and API without widening runtime, reviewer, release, or close-out semantics.',
    });

    const readinessCoordinator = createReadinessCoordinator(runtime);
    const roleReadinessBefore = collectRoleReadiness(readinessCoordinator, projectId);

    assertRoleReadiness(roleReadinessBefore);

    const upstreamContext = await createUpstreamCoordinator(runtime, taskPayload.task.id, projectId);

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const approvalRequestPayload = await postJson(
      harness.baseUrl,
      `/api/tasks/${encodeURIComponent(taskPayload.task.id)}/request-builder-live-mutation-approval`,
    );
    const approvalRequestedSnapshot = await waitForSnapshotPayload(
      harness.baseUrl,
      'builder live mutation approval requested snapshot',
      (payload) => payload.snapshot.approvals[approvalRequestPayload.mutation.approvalId]?.status === 'pending',
    );
    const approval = Object.values(approvalRequestedSnapshot.snapshot.approvals).find(
      (candidate) => candidate.taskId === taskPayload.task.id,
    );
    const inboxItem = Object.values(approvalRequestedSnapshot.snapshot.decisionInboxItems).find(
      (candidate) => candidate.taskId === taskPayload.task.id && candidate.status === 'pending',
    );
    const taskGuardAfterRequest =
      approvalRequestedSnapshot.derived.taskGuardSummaries?.[taskPayload.task.id] || null;

    assert.ok(approval);
    assert.ok(inboxItem);
    assert.equal(approval.status, 'pending');
    assert.ok(taskGuardAfterRequest);
    assert.equal(taskGuardAfterRequest.builderLiveMutation.allowed, false);
    assert.equal(taskGuardAfterRequest.builderLiveMutationApprovalRequest.allowed, false);

    await postJson(
      harness.baseUrl,
      `/api/decision-inbox/${encodeURIComponent(inboxItem.id)}/actions`,
      { verb: 'approve' },
    );

    const approvalResolvedSnapshot = await waitForSnapshotPayload(
      harness.baseUrl,
      'builder live mutation approval approved snapshot',
      (payload) => {
        const nextApproval = payload.snapshot.approvals[approval.id];
        const guardSummary = payload.derived.taskGuardSummaries?.[taskPayload.task.id]?.builderLiveMutation;
        return nextApproval?.status === 'approved' && guardSummary?.allowed === true;
      },
    );
    const approvedRecord = approvalResolvedSnapshot.snapshot.approvals[approval.id];
    const taskGuardAfterApprove =
      approvalResolvedSnapshot.derived.taskGuardSummaries?.[taskPayload.task.id] || null;

    assert.ok(approvedRecord);
    assert.equal(approvedRecord.status, 'approved');
    assert.ok(taskGuardAfterApprove);
    assert.equal(taskGuardAfterApprove.builderLiveMutation.allowed, true);

    const builderAnchor = createBuilderLiveMutationAnchor({
      ...upstreamContext,
      approval: approvedRecord,
      project: projectPayload.project,
    });
    const mutationPlan = createMutatedFileContent(
      fixture.projectPath,
      upstreamContext.targetFiles[0],
      approvedRecord.id,
    );

    await queueBuilderLiveMutationResponse({
      anchor: builderAnchor,
      approval: approvedRecord,
      context: {
        ...upstreamContext,
        approval: approvedRecord,
        project: projectPayload.project,
      },
      mutationPlan,
    });

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });

    const runTexts = await triggerBrowserBuilderLiveMutation({
      outputRoot,
      overrideEnvVar,
      secret: secretToCheck,
      sessionName: harness.sessionName,
      taskId: taskPayload.task.id,
      taskTitle: taskPayload.task.title,
    });
    domTexts.push(...runTexts);
    const mutationPayload = await postJson(
      harness.baseUrl,
      `/api/tasks/${encodeURIComponent(taskPayload.task.id)}/run-builder-live-mutation`,
    );

    const successSnapshot = await waitForSnapshotPayload(
      harness.baseUrl,
      'builder live mutation success snapshot',
      (payload) => {
        const guardSummary = payload.derived.taskGuardSummaries?.[taskPayload.task.id]?.builderLiveMutation;
        return (
          countArtifacts(payload.snapshot, taskPayload.task.id, 'change-summary') === 1 &&
          countArtifacts(payload.snapshot, taskPayload.task.id, 'patch') === 1 &&
          countArtifacts(payload.snapshot, taskPayload.task.id, 'diff') === 1 &&
          payload.snapshot.runs[mutationPayload.mutation.runId] &&
          payload.snapshot.approvals[approval.id]?.metadata?.consumedAt &&
          guardSummary?.latestApprovalDisplayStatus === 'consumed'
        );
      },
    );

    const changeSummaryArtifact = findLatestArtifact(successSnapshot, taskPayload.task.id, 'change-summary');
    const patchArtifact = findLatestArtifact(successSnapshot, taskPayload.task.id, 'patch');
    const diffArtifact = findLatestArtifact(successSnapshot, taskPayload.task.id, 'diff');
    const builderRun = changeSummaryArtifact?.runId
      ? successSnapshot.snapshot.runs[changeSummaryArtifact.runId] || null
      : null;
    const finalApproval = successSnapshot.snapshot.approvals[approval.id];
    const finalGuardSummary =
      successSnapshot.derived.taskGuardSummaries?.[taskPayload.task.id]?.builderLiveMutation || null;

    assert.ok(changeSummaryArtifact);
    assert.ok(patchArtifact);
    assert.ok(diffArtifact);
    assert.ok(builderRun);
    assert.ok(finalApproval?.metadata?.consumedAt);
    assert.equal(finalApproval.metadata.consumedByRunId, builderRun.id);
    assert.equal(builderRun.summary.adapter, 'openai-responses');
    assert.equal(builderRun.summary.nextStage, 'reviewer');
    assert.equal(builderRun.summary.approvalId, approval.id);
    assert.deepEqual(builderRun.summary.changedFiles, [upstreamContext.targetFiles[0]]);
    assert.equal(
      fs.readFileSync(path.join(fixture.projectPath, upstreamContext.targetFiles[0]), 'utf8'),
      mutationPlan.mutated,
    );
    assert.ok(finalGuardSummary);
    assert.equal(finalGuardSummary.allowed, false);
    assert.equal(finalGuardSummary.latestApprovalDisplayStatus, 'consumed');
    assert.equal(mutationPayload.mutation.runId, builderRun.id);
    assert.equal(mutationPayload.mutation.artifactId, changeSummaryArtifact.id);
    assert.equal(mutationPayload.mutation.patchArtifactId, patchArtifact.id);
    assert.equal(mutationPayload.mutation.diffArtifactId, diffArtifact.id);

    const changeSummaryPayload = await fetchArtifactPayload(harness.baseUrl, changeSummaryArtifact.id);
    const patchPayload = await fetchArtifactPayload(harness.baseUrl, patchArtifact.id);
    const diffPayload = await fetchArtifactPayload(harness.baseUrl, diffArtifact.id);
    const builderLogs = await fetchRunLogsPayload(harness.baseUrl, builderRun.id);

    assert.match(changeSummaryPayload.artifact.content, /^# Builder Live Mutation:/m);
    assert.match(changeSummaryPayload.artifact.content, /^## Change Summary$/m);
    assert.match(changeSummaryPayload.artifact.content, /^## File Updates$/m);
    assert.match(patchPayload.artifact.content, /^diff --git /m);
    assert.match(diffPayload.artifact.content, /^diff --git /m);
    assertOpenAiLogs(builderLogs);
    assert.match(
      (builderLogs.logs || []).map((entry) => entry.message).join('\n'),
      /saved builder live mutation bundle/i,
    );

    await refreshBrowser({
      outputRoot,
      overrideEnvVar,
      sessionName: harness.sessionName,
    });
    const logsText = await verifyBrowserLogsLanding({
      outputRoot,
      overrideEnvVar,
      runId: builderRun.id,
      secret: secretToCheck,
      sessionName: harness.sessionName,
    });
    domTexts.push(logsText);

    const artifactText = await verifyBrowserArtifactSelection({
      artifactId: changeSummaryArtifact.id,
      outputRoot,
      overrideEnvVar,
      secret: secretToCheck,
      sessionName: harness.sessionName,
    });
    domTexts.push(artifactText);

    await assertDuplicateLiveMutationBlocks(harness.baseUrl, taskPayload.task.id);
    await scanApiPayloadsForSecret(harness.baseUrl, successSnapshot, secretToCheck);

    const roleReadinessAfter = collectRoleReadiness(readinessCoordinator, projectId);

    assertRoleReadiness(roleReadinessAfter);

    for (const domText of domTexts) {
      assertSecretAbsent(domText, secretToCheck, 'browser DOM text');
    }

    const runtimeSecretMatches = scanFilesForSecret(runtimeRoot, secretToCheck);
    assert.deepEqual(runtimeSecretMatches, []);

    const projectSecretMatches = scanFilesForSecret(fixture.fixtureRoot, secretToCheck);
    assert.deepEqual(projectSecretMatches, []);

    const outputSecretMatches = scanFilesForSecret(outputRoot, secretToCheck);
    assert.deepEqual(outputSecretMatches, []);

    const serverStatePath = typeof getServerStatePath === 'function' ? getServerStatePath() : null;

    if (serverStatePath) {
      const stateText = fs.readFileSync(serverStatePath, 'utf8');
      const statePayload = readServerFetchState(serverStatePath);

      assertSecretAbsent(stateText, secretToCheck, 'server fetch stub state');
      assert.ok(Array.isArray(statePayload.calls));
    }

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
        architect: roleReadinessAfter.architect.readiness,
        builderLiveMutation: roleReadinessAfter.builderLiveMutation.readiness,
        builderPreflight: roleReadinessAfter.builderPreflight.readiness,
        planner: roleReadinessAfter.planner.readiness,
        reviewer: roleReadinessAfter.reviewer.readiness,
        taskBreaker: roleReadinessAfter.taskBreaker.readiness,
      },
      scenario: {
        approvalId: approval.id,
        builderRunId: builderRun.id,
        changeSummaryArtifactId: changeSummaryArtifact.id,
        diffArtifactId: diffArtifact.id,
        patchArtifactId: patchArtifact.id,
        selectedSurface: 'artifacts',
        taskId: taskPayload.task.id,
      },
    };
  } catch (error) {
    captureFailureScreenshot({
      filename: 'qa-slice-06-failure.png',
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

export async function runQaSlice06SyntheticSmoke(options = {}) {
  const outputRoot = options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-06');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-slice-06');
  const browser = options.browser || process.env.QA_SLICE_06_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_06_PLAYWRIGHT_CLI_BIN';
  const liveProviderEnvVar = options.liveProviderEnvVar || 'QA_SLICE_06_LIVE_PROVIDER_API_KEY';
  const sentinelSecret = options.secret || 'qa-slice-06-secret-sentinel';
  const providerModel = options.model || 'qa-slice-06-operator-model';
  let serverFetchStub = null;

  return runSharedQaSlice06Flow({
    browser,
    outputRoot,
    runtimeRoot,
    overrideEnvVar,
    secretToCheck: sentinelSecret,
    createServerEnv() {
      process.env[liveProviderEnvVar] = sentinelSecret;
      serverFetchStub = createServerFetchStubFiles(outputRoot);
      return {
        [liveProviderEnvVar]: sentinelSecret,
        [SERVER_FETCH_STATE_ENV]: serverFetchStub.statePath,
        NODE_OPTIONS: mergeNodeOptions(process.env.NODE_OPTIONS, [`--require=${serverFetchStub.preloadPath}`]),
      };
    },
    createReadinessCoordinator(runtime) {
      return createDefaultCoordinator(runtime);
    },
    createUpstreamCoordinator(runtime, taskId, projectId) {
      const queuedFetch = createQueuedFetch([createPlannerApiPayload('qa-slice-06-synthetic-fit')]);
      const syntheticCoordinator = createSyntheticCoordinator(runtime, queuedFetch.fetchImpl);

      return prepareBuilderLiveMutationContext({
        coordinator: syntheticCoordinator,
        projectId,
        queuedFetch,
        runtime,
        taskId,
        label: 'synthetic-fit',
      });
    },
    async queueBuilderLiveMutationResponse({ anchor, context, mutationPlan }) {
      writeServerFetchQueue(serverFetchStub.statePath, [
        createBuilderLiveMutationApiPayload(anchor, {
          artifact: {
            changeSummary: ['Prepare one bounded file update inside the approved allowlist.'],
            fileUpdates: [
              {
                path: context.targetFiles[0],
                content: mutationPlan.mutated,
              },
            ],
            targetFiles: context.targetFiles,
            risks: ['Fail closed if actual changed files do not match the validated file updates.'],
            verificationNotes: [
              'Store change-summary, patch, and diff together as one mutation bundle.',
            ],
          },
          providerRunId: 'resp-qa-slice-06-builder-live-mutation',
        }),
      ]);
    },
    getServerStatePath() {
      return serverFetchStub?.statePath || null;
    },
    projectName: 'qa-slice-06',
    taskTitle: 'QA slice 06 builder-live-mutation fit',
    liveProviderApiKeyVar: liveProviderEnvVar,
    providerModel,
  });
}

export async function runQaSlice06RealSmoke(options = {}) {
  const outputRoot =
    options.outputRoot || path.join(repoRoot, 'output', 'playwright', 'qa-slice-06-live');
  const runtimeRoot = options.runtimeRoot || path.join(repoRoot, 'var', 'runtime-qa-live-slice-06');
  const browser = options.browser || process.env.QA_SLICE_06_PLAYWRIGHT_BROWSER || 'chrome';
  const overrideEnvVar = options.overrideEnvVar || 'QA_SLICE_06_PLAYWRIGHT_CLI_BIN';
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

  return runSharedQaSlice06Flow({
    browser,
    outputRoot,
    runtimeRoot,
    overrideEnvVar,
    secretToCheck: apiKey,
    createServerEnv() {
      return {
        [apiKeyVar]: apiKey,
      };
    },
    createReadinessCoordinator(runtime) {
      return createDefaultCoordinator(runtime);
    },
    createUpstreamCoordinator(runtime, taskId, projectId) {
      const queuedFetch = createQueuedFetch([createPlannerApiPayload('qa-slice-06-real-upstream')]);
      const syntheticCoordinator = createSyntheticCoordinator(runtime, queuedFetch.fetchImpl);

      return prepareBuilderLiveMutationContext({
        coordinator: syntheticCoordinator,
        projectId,
        queuedFetch,
        runtime,
        taskId,
        label: 'real-upstream',
      });
    },
    async queueBuilderLiveMutationResponse(_input) {
      // Real live smoke intentionally uses the server's actual openai-responses adapter.
    },
    projectName: 'qa-slice-06-live',
    taskTitle: 'QA slice 06 optional real live',
    liveProviderApiKeyVar: apiKeyVar,
    providerModel: model,
  });
}
