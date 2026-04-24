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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-310');
const port = 4610;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /url\.pathname === '\/api\/harness\/operator-action\/clear-history'/);
assert.match(serveUi, /function clearHarnessExecutionMemory\(\)/);
assert.match(serveUi, /kind: 'clear-harness-operator-action-history'/);
assert.match(serveUi, /하네스 실행 기록을 비우지 못했습니다\./);
assert.match(appJs, /data-action="clear-harness-execution-history"/);
assert.match(appJs, /data-harness-clear-history="true"/);
assert.match(appJs, /await postJson\('\/api\/harness\/operator-action\/clear-history', \{/);
assert.match(appJs, /현재 비울 실행 기록이 없습니다\./);
assert.match(appJs, /하네스 \$\{statusCard\.primaryHarnessId\}의 실행 기록을 비우는 중…/);
assert.match(appJs, /하네스 \$\{statusCard\.primaryHarnessId\}의 실행 기록을 비웠습니다\./);

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

  throw new Error('Timed out waiting for ui-slice-310 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-310-'));
  const inputPathA = path.join(tempDir, 'history-a.txt');
  const inputPathB = path.join(tempDir, 'history-b.txt');
  const outputPathA = path.join(tempDir, 'history-a.md');
  const outputPathB = path.join(tempDir, 'history-b.md');

  fs.writeFileSync(inputPathA, 'Execution history clear smoke A\n', 'utf8');
  fs.writeFileSync(inputPathB, 'Execution history clear smoke B\n', 'utf8');

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

    const beforeClear = await fetchJson(`${baseUrl}/api/snapshot`);
    assert.ok((beforeClear.derived?.recentHarnessExecutions || []).length >= 2);
    assert.ok(beforeClear.derived?.latestHarnessExecution);

    const clearPayload = await postJson('/api/harness/operator-action/clear-history', {
      harnessId: 'markitdown',
    });
    assert.equal(clearPayload.mutation?.kind, 'clear-harness-operator-action-history');
    assert.equal(clearPayload.mutation?.harnessId, 'markitdown');

    const afterClear = await fetchJson(`${baseUrl}/api/snapshot`);
    assert.equal(afterClear.derived?.latestHarnessExecution || null, null);
    assert.deepEqual(afterClear.derived?.recentHarnessExecutions || [], []);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHistoryClear: {
            insertionPoint: 'executionOperatorActionShelf->clearExecutionHistoryAction->localOnlyRoute',
            route: '/api/harness/operator-action/clear-history',
            clearedLatest: afterClear.derived?.latestHarnessExecution || null,
            clearedHistoryCount: (afterClear.derived?.recentHarnessExecutions || []).length,
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
