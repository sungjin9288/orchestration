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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-314');
const port = 4614;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="restore-harness-execution-preview"/);
assert.match(appJs, /data-harness-history-preview="true"/);
assert.match(appJs, /function restoreHarnessExecutionPreview\(actionButton, statusPayload\)/);
assert.match(appJs, /const historyIndex = Number\.parseInt\(actionButton\?\.dataset\.historyIndex \|\| '', 10\);/);
assert.match(appJs, /state\.lastHarnessExecutionResult = targetExecution;/);
assert.match(appJs, /data-history-index="\$\{String\(index\)\}"/);

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
      // Retry until ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-314 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-314-'));
  const inputPathA = path.join(tempDir, 'preview-a.txt');
  const outputPathA = path.join(tempDir, 'preview-a.md');
  const inputPathB = path.join(tempDir, 'preview-b.txt');
  const outputPathB = path.join(tempDir, 'preview-b.md');

  fs.writeFileSync(inputPathA, 'Execution preview restore smoke A\n', 'utf8');
  fs.writeFileSync(inputPathB, 'Execution preview restore smoke B\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const firstRun = await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathA,
      outputPath: outputPathA,
    });
    const secondRun = await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathB,
      outputPath: outputPathB,
    });

    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(firstRun.harnessExecution);
    assert.ok(secondRun.harnessExecution);
    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 2);
    assert.equal(recentHarnessExecutions[0]?.resolvedInputPath, inputPathB);
    assert.equal(recentHarnessExecutions[1]?.resolvedInputPath, inputPathA);
    assert.ok(recentHarnessExecutions[1]?.outputPreview || recentHarnessExecutions[1]?.stdoutPreview);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHistoryPreview: {
            insertionPoint: 'executionHistoryRegister->restoreExecutionPreviewAction->latestExecutionResultRegister',
            derivedKey: 'recentHarnessExecutions',
            sourceMarker: 'data-harness-history-preview',
            restoredHistoryIndex: 1,
            historyCount: recentHarnessExecutions.length,
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
