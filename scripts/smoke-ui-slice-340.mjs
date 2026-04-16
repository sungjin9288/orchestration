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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-340');
const port = 4641;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

const runContextIndex = appJs.indexOf('data-harness-result-hidden-run-context="true"');
const harnessContextIndex = appJs.indexOf('data-harness-result-hidden-harness-context="true"');
const operatorContextIndex = appJs.indexOf('data-harness-result-hidden-operator-context="true"');

assert.notEqual(runContextIndex, -1);
assert.notEqual(harnessContextIndex, -1);
assert.notEqual(operatorContextIndex, -1);
assert.ok(runContextIndex < harnessContextIndex);
assert.ok(harnessContextIndex < operatorContextIndex);
assert.match(appJs, /<strong>실행 기록<\/strong>/);

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

  throw new Error('Timed out waiting for ui-slice-340 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-340-'));
  const inputPath = path.join(tempDir, 'hidden-run-order.txt');
  const outputPath = path.join(tempDir, 'hidden-run-order.md');

  fs.writeFileSync(inputPath, 'Execution hidden block ordering smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    const latestHarnessExecution = runPayload.derived?.latestHarnessExecution || null;

    assert.ok(latestHarnessExecution?.executedAt);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenBlockOrdering: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenBlockOrdering->runContextFirst',
            runContextMarker: 'data-harness-result-hidden-run-context',
            harnessContextMarker: 'data-harness-result-hidden-harness-context',
            operatorContextMarker: 'data-harness-result-hidden-operator-context',
            route: '/api/harness/operator-action/run',
            order: ['run-context', 'harness-context', 'operator-context'],
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
