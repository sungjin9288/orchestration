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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-315');
const port = 4616;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="copy-harness-input-path"/);
assert.match(appJs, /data-harness-input-copy="true"/);
assert.match(appJs, /const canRenderVisibleHarnessInputPathActions = Boolean\(visibleHarnessInputPath\);/);
assert.match(appJs, /const canRenderVisibleHarnessPathActionShelf =\s+canRenderVisibleHarnessInputPathActions \|\| canRenderVisibleHarnessOutputPathCopy;/);
assert.match(appJs, /const visibleHarnessInputPathCopyActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /const visibleHarnessPathReuseActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /const visibleHarnessPathRerunActionMarkup =\s+canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /canRenderVisibleHarnessInputPathActions\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"/);
assert.match(
  appJs,
  /const visibleHarnessInputPathActionsMarkup = `\s+\$\{visibleHarnessInputPathCopyActionMarkup\}\s+\$\{visibleHarnessPathReuseActionMarkup\}\s+\$\{visibleHarnessPathRerunActionMarkup\}/,
);
assert.match(appJs, /\$\{visibleHarnessInputPathActionsMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessInputPathActions\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessInputPath\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessInputPath \|\| visibleHarnessOutputPath\s+\?\s+`/);
assert.doesNotMatch(
  appJs,
  /const visibleHarnessInputPathActionsMarkup =\s+canRenderVisibleHarnessInputPathActions\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-input-path"[\s\S]*?data-action="reuse-harness-execution-paths"[\s\S]*?data-action="rerun-harness-execution-paths"/,
);
assert.match(appJs, /입력 경로/);
assert.match(appJs, /async function copyHarnessExecutionInputPath\(inputPath\)/);
assert.match(appJs, /const emptyInputPathCopyMessage = '복사할 하네스 입력 경로가 없습니다\.';/);
assert.match(appJs, /const copiedInputPathMessage = \(value\) => `하네스 입력 경로를 복사했습니다: \$\{value\}`;/);
assert.match(appJs, /const unsupportedInputPathCopyMessage = \(value\) =>\s+`클립보드 미지원 환경입니다\. 입력 경로를 직접 확인하세요: \$\{value\}`;/);
assert.match(appJs, /emptyErrorMessage: emptyInputPathCopyMessage/);
assert.match(appJs, /copiedMessage: copiedInputPathMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedInputPathCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(value\) => `하네스 입력 경로를 복사했습니다: \$\{value\}`/);
assert.match(appJs, /actionButton\.dataset\.action === 'copy-harness-input-path'/);

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

  throw new Error('Timed out waiting for ui-slice-315 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-315-'));
  const inputPath = path.join(tempDir, 'input-copy.txt');
  const outputPath = path.join(tempDir, 'input-copy.md');

  fs.writeFileSync(inputPath, 'Execution input path copy smoke\n', 'utf8');

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
    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 1);
    assert.equal(recentHarnessExecutions[0]?.resolvedInputPath, inputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionInputPathCopy: {
            insertionPoint: 'executionResultRegister->copyExecutionInputPathAction->localClipboardOrStatus',
            sourceMarker: 'data-harness-input-copy',
            namedValues: [
              'canRenderVisibleHarnessPathActionShelf',
              'canRenderVisibleHarnessInputPathActions',
              'visibleHarnessInputPathCopyActionMarkup',
              'visibleHarnessPathReuseActionMarkup',
              'visibleHarnessPathRerunActionMarkup',
              'visibleHarnessInputPathActionsMarkup',
            ],
            route: '/api/harness/operator-action/run',
            resolvedInputPath: inputPath,
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
