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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-322');
const port = 4623;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-preview-copy="true"/);
assert.match(appJs, /data-action="copy-harness-execution-preview"/);
assert.match(appJs, /function getHarnessExecutionPreviewText\(execution\) \{/);
assert.match(appJs, /return execution\?\.outputPreview \|\| execution\?\.stdoutPreview \|\| '';/);
assert.match(
  appJs,
  /const hiddenHarnessPreviewText =\s+getHarnessExecutionPreviewText\(hiddenHarnessExecutionResult\);/,
);
assert.doesNotMatch(
  appJs,
  /const hiddenHarnessPreviewText =\s+hiddenHarnessExecutionResult\?\.outputPreview \|\| hiddenHarnessExecutionResult\?\.stdoutPreview \|\| '';/,
);
assert.match(appJs, /const canRenderHiddenHarnessPreview = Boolean\(hiddenHarnessPreviewText\);/);
assert.match(appJs, /canRenderHiddenHarnessPreview\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"/);
assert.doesNotMatch(appJs, /\$\{\s*hiddenHarnessPreviewText\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"/);
assert.match(appJs, /data-preview-text="\$\{escapeHtml\(hiddenHarnessPreviewText\)\}"/);

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

  throw new Error('Timed out waiting for ui-slice-322 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-322-'));
  const inputPath = path.join(tempDir, 'hidden-preview-copy.txt');
  const outputPath = path.join(tempDir, 'hidden-preview-copy.md');

  fs.writeFileSync(inputPath, 'Execution hidden preview copy smoke\n', 'utf8');

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

    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);
    assert.ok(latestHarnessExecution.outputPreview || latestHarnessExecution.stdoutPreview);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenPreviewCopy: {
            insertionPoint: 'hiddenExecutionResultRegister->copyHiddenPreviewAction->localClipboardOrStatus',
            sourceMarker: 'data-harness-result-hidden-preview-copy',
            namedValues: ['canRenderHiddenHarnessPreview'],
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
