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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-316');
const port = 4617;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="copy-harness-execution-preview"/);
assert.match(appJs, /data-harness-preview-copy="true"/);
assert.match(appJs, /미리보기 복사/);
assert.match(appJs, /async function copyHarnessExecutionPreview\(previewText\)/);
assert.match(appJs, /emptyErrorMessage: '복사할 하네스 실행 미리보기가 없습니다\.'/);
assert.match(appJs, /copiedMessage: \(\) => '하네스 실행 미리보기를 복사했습니다\.'/);
assert.match(appJs, /actionButton\.dataset\.action === 'copy-harness-execution-preview'/);

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

  throw new Error('Timed out waiting for ui-slice-316 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-316-'));
  const inputPath = path.join(tempDir, 'preview-copy.txt');
  const outputPath = path.join(tempDir, 'preview-copy.md');

  fs.writeFileSync(inputPath, 'Execution preview copy smoke\n', 'utf8');

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

    assert.ok(harnessExecution);
    assert.equal(harnessExecution.resolvedInputPath, inputPath);
    assert.equal(harnessExecution.resolvedOutputPath, outputPath);
    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.ok(latestHarnessExecution.outputPreview || latestHarnessExecution.stdoutPreview);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionPreviewCopy: {
            insertionPoint: 'executionResultRegister->copyExecutionPreviewAction->localClipboardOrStatus',
            sourceMarker: 'data-harness-preview-copy',
            route: '/api/harness/operator-action/run',
            previewLength: String(latestHarnessExecution.outputPreview || latestHarnessExecution.stdoutPreview || '').length,
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
