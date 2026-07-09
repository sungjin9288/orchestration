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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-317');
const port = 4618;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-action="reuse-harness-execution-paths"/);
assert.match(appJs, /data-harness-result-reuse="true"/);
assert.match(appJs, /function reuseHarnessExecutionPaths\(actionButton\)/);
assert.match(appJs, /state\.harnessExecutionDraftInputPath = inputPath;/);
assert.match(appJs, /state\.harnessExecutionDraftOutputPath = outputPath;/);
assert.match(appJs, /const reusePathsMessage = `최근 실행 경로를 폼에 다시 채웠습니다: \$\{inputPath\}`;/);
assert.match(appJs, /elements\.refreshStatus\.textContent = reusePathsMessage;/);
assert.match(appJs, /const visibleHarnessInputPath = visibleHarnessExecutionResult\?\.resolvedInputPath \|\| '';/);
assert.match(appJs, /const canRenderVisibleHarnessInputPathActions = Boolean\(visibleHarnessInputPath\);/);
assert.match(appJs, /const visibleHarnessInputPathActionsMarkup = canRenderVisibleHarnessInputPathActions/);
assert.match(appJs, /canRenderVisibleHarnessInputPathActions\s+\?\s+`\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"/);
assert.match(appJs, /\$\{visibleHarnessInputPathActionsMarkup\}/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessInputPathActions\s+\?\s+`\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessInputPath\s+\?\s+`\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"/);
assert.match(appJs, /data-input-path="\$\{escapeHtml\(visibleHarnessInputPath\)\}"/);

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

  throw new Error('Timed out waiting for ui-slice-317 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-317-'));
  const inputPath = path.join(tempDir, 'result-reuse.txt');
  const outputPath = path.join(tempDir, 'result-reuse.md');

  fs.writeFileSync(inputPath, 'Execution result reuse smoke\n', 'utf8');

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
    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);

    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);
    assert.equal(refreshedSnapshot.derived?.latestHarnessExecution?.resolvedInputPath, inputPath);
    assert.equal(refreshedSnapshot.derived?.latestHarnessExecution?.resolvedOutputPath, outputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionResultReuse: {
            insertionPoint: 'executionResultRegister->reuseExecutionPathsAction->executionFormDraft',
            sourceMarker: 'data-harness-result-reuse',
            namedValues: ['canRenderVisibleHarnessInputPathActions', 'visibleHarnessInputPathActionsMarkup'],
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
