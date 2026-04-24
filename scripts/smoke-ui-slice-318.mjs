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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-318');
const port = 4619;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="rerun-harness-execution-paths"/);
assert.match(appJs, /data-harness-result-rerun="true"/);
assert.match(appJs, /async function rerunHarnessExecutionPaths\(actionButton\)/);
assert.match(appJs, /await executeHarnessOperatorAction\(\{/);
assert.match(
  appJs,
  /pendingMessage: statusCard\?\.primaryHarnessId[\s\S]*\? `하네스 \$\{statusCard\.primaryHarnessId\}의 최근 실행 경로를 다시 실행하는 중…`[\s\S]*: '미확인 하네스의 최근 실행 경로를 다시 실행하는 중…',/,
);

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

  throw new Error('Timed out waiting for ui-slice-318 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-318-'));
  const inputPath = path.join(tempDir, 'result-rerun.txt');
  const outputPath = path.join(tempDir, 'result-rerun.md');

  fs.writeFileSync(inputPath, 'Execution result rerun smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const firstRun = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    assert.equal(firstRun.harnessExecution?.resolvedInputPath, inputPath);
    assert.equal(firstRun.harnessExecution?.resolvedOutputPath, outputPath);

    const secondRun = await postJson('/api/harness/operator-action/run', {
      inputPath: firstRun.harnessExecution?.resolvedInputPath,
      outputPath: firstRun.harnessExecution?.resolvedOutputPath,
    });
    assert.equal(secondRun.harnessExecution?.resolvedInputPath, inputPath);
    assert.equal(secondRun.harnessExecution?.resolvedOutputPath, outputPath);

    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const latestHarnessExecution = refreshedSnapshot.derived?.latestHarnessExecution || null;
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);
    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 2);
    assert.equal(recentHarnessExecutions[0]?.resolvedInputPath, inputPath);
    assert.equal(recentHarnessExecutions[1]?.resolvedInputPath, inputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionResultRerun: {
            insertionPoint: 'executionResultRegister->rerunExecutionPathsAction->runHarnessOperatorActionRoute',
            sourceMarker: 'data-harness-result-rerun',
            route: '/api/harness/operator-action/run',
            resolvedInputPath: inputPath,
            resolvedOutputPath: outputPath,
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
