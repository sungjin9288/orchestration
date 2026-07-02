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
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-307');
const port = 4607;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');

assert.match(serveUi, /outputPreview:/);
assert.match(appJs, /data-harness-execution-result="true"/);
assert.match(appJs, /data-harness-execution-preview="true"/);
assert.match(harnessLabels, /최근 실행 결과/);
assert.match(appJs, /state\.lastHarnessExecutionResult = payload\.harnessExecution \|\| null;/);

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

  throw new Error('Timed out waiting for ui-slice-307 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-307-'));
  const inputPath = path.join(tempDir, 'harness-input.txt');
  const outputPath = path.join(tempDir, 'harness-output.md');

  fs.writeFileSync(
    inputPath,
    [
      'Execution result preview smoke',
      '',
      'This fixture proves the execution route also returns preview evidence.',
      '',
      '- local-only execution evidence',
      '- preview contract',
    ].join('\n'),
    'utf8',
  );

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });

    assert.equal(runPayload.harnessExecution?.harnessId, 'markitdown');
    assert.equal(runPayload.harnessExecution?.resolvedOutputPath, outputPath);
    assert.ok(runPayload.harnessExecution?.executedAt);
    assert.match(runPayload.harnessExecution?.outputPreview || '', /Execution result preview smoke/i);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionEvidence: {
            insertionPoint: 'executionOperatorActionShelf->executionResultRegister',
            route: '/api/harness/operator-action/run',
            previewMarker: 'data-harness-execution-preview',
            outputPath: runPayload.harnessExecution.resolvedOutputPath,
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
