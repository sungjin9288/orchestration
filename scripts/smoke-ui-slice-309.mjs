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
const appPath = path.join(repoRoot, 'ui', 'app.js');
const harnessStatePath = path.join(repoRoot, 'ui', 'harness-state.js');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-309');
const port = 4609;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessState = fs.readFileSync(harnessStatePath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /let recentHarnessExecutions = \[];/);
assert.match(serveUi, /recentHarnessExecutions,/);
assert.match(serveUi, /function rememberHarnessExecution\(harnessExecution\)/);
assert.match(appJs, /from '\.\/harness-state\.js'/);
assert.match(harnessState, /export function getRecentHarnessExecutions\(data, statusPayload\) \{/);
assert.match(harnessState, /export function hasHarnessExecutionHistory\(execution, recentExecutions, statusPayload\) \{/);
assert.match(appJs, /hasHarnessExecutionHistory\(\s*\n\s+harnessExecutionResult,\s*\n\s+recentHarnessExecutions,\s*\n\s+statusPayload,\s*\n\s+\)/);
assert.match(appJs, /data-harness-execution-history="true"/);
assert.match(appJs, /data-harness-execution-history-item="true"/);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function postJson(pathname, body = {}) {
  return fetchJson(`${baseUrl}${pathname}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
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

  throw new Error('Timed out waiting for ui-slice-309 server');
}

async function main() {
  const runtime = createRuntimeService({ runtimeRoot });
  runtime.resetRuntime();

  const server = spawn(
    process.execPath,
    ['scripts/serve-ui-slice-01.mjs', '--port', String(port), '--runtime-root', runtimeRoot],
    {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  let stderr = '';
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-309-'));
  const inputPathA = path.join(tempDir, 'harness-input-a.txt');
  const outputPathA = path.join(tempDir, 'harness-output-a.md');
  const inputPathB = path.join(tempDir, 'harness-input-b.txt');
  const outputPathB = path.join(tempDir, 'harness-output-b.md');

  fs.writeFileSync(inputPathA, 'Execution history smoke A\n', 'utf8');
  fs.writeFileSync(inputPathB, 'Execution history smoke B\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathA,
      outputPath: outputPathA,
    });
    await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathB,
      outputPath: outputPathB,
    });

    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 2);
    assert.equal(recentHarnessExecutions[0]?.resolvedOutputPath, outputPathB);
    assert.equal(recentHarnessExecutions[1]?.resolvedOutputPath, outputPathA);
    assert.match(recentHarnessExecutions[0]?.outputPreview || '', /Execution history smoke B/i);
    assert.match(recentHarnessExecutions[1]?.outputPreview || '', /Execution history smoke A/i);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHistory: {
            insertionPoint: 'snapshotDerivedRecentHarnessExecutions->executionHistoryRegister',
            route: '/api/harness/operator-action/run',
            derivedKey: 'recentHarnessExecutions',
            historyCount: recentHarnessExecutions.length,
            newestOutputPath: recentHarnessExecutions[0].resolvedOutputPath,
          },
        },
        null,
        2,
      ),
    );
  } catch (error) {
    const detail = stderr.trim();

    throw new Error(
      detail
        ? `${error instanceof Error ? error.message : String(error)}\n${detail}`
        : error instanceof Error
          ? error.message
          : String(error),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(50);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    fs.rmSync(runtimeRoot, { recursive: true, force: true });
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
