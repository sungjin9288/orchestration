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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-313');
const port = 4613;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="copy-harness-output-path"/);
assert.match(appJs, /data-harness-output-copy="true"/);
assert.match(appJs, /출력 경로/);
assert.match(appJs, /async function copyHarnessExecutionOutputPath\(outputPath\)/);
assert.match(appJs, /emptyErrorMessage: '복사할 하네스 출력 경로가 없습니다\.'/);
assert.match(appJs, /copiedMessage: \(value\) => `하네스 출력 경로를 복사했습니다: \$\{value\}`/);
assert.match(appJs, /actionButton\.dataset\.action === 'copy-harness-output-path'/);

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

  throw new Error('Timed out waiting for ui-slice-313 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-313-'));
  const inputPath = path.join(tempDir, 'output-copy.txt');
  const outputPath = path.join(tempDir, 'output-copy.md');

  fs.writeFileSync(inputPath, 'Execution output path copy smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    const harnessExecution = runPayload.harnessExecution || null;
    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const latestHarnessExecution = refreshedSnapshot.derived?.latestHarnessExecution || null;
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(harnessExecution);
    assert.equal(harnessExecution.resolvedInputPath, inputPath);
    assert.equal(harnessExecution.resolvedOutputPath, outputPath);
    assert.equal(harnessExecution.outputExists, true);
    assert.ok(fs.existsSync(outputPath));
    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);
    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 1);
    assert.equal(recentHarnessExecutions[0]?.resolvedOutputPath, outputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionOutputPathCopy: {
            insertionPoint: 'executionResultRegister->copyExecutionOutputPathAction->localClipboardOrStatus',
            sourceMarker: 'data-harness-output-copy',
            route: '/api/harness/operator-action/run',
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
