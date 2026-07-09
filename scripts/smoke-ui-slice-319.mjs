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
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');
const harnessStatePath = path.join(repoRoot, 'ui', 'harness-state.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-319');
const port = 4620;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');
const harnessState = fs.readFileSync(harnessStatePath, 'utf8');

assert.match(appJs, /hiddenHarnessExecutionResultKey: null,/);
assert.match(appJs, /from '\.\/harness-labels\.js'/);
assert.match(harnessLabels, /export function getHarnessExecutionResultKey\(execution\) \{/);
assert.match(appJs, /from '\.\/harness-state\.js'/);
assert.match(harnessState, /export function isHarnessExecutionResultHidden\(execution, hiddenExecutionResultKey = null\) \{/);
assert.match(appJs, /state\.hiddenHarnessExecutionResultKey,\s*\n\s+\)/);
assert.match(appJs, /const isVisibleHarnessResultForPrimaryHarness =\s+visibleHarnessExecutionResult\?\.harnessId === primaryHarnessId;/);
assert.match(appJs, /const isHiddenHarnessResultForPrimaryHarness =\s+hiddenHarnessExecutionResult\?\.harnessId === primaryHarnessId;/);
assert.match(appJs, /const visibleHarnessExecutionKey = getHarnessExecutionResultKey\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessExecutionKey = getHarnessExecutionResultKey\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /\$\{\s+isVisibleHarnessResultForPrimaryHarness\s+\?/);
assert.match(appJs, /\$\{\s+isHiddenHarnessResultForPrimaryHarness\s+\?/);
assert.doesNotMatch(appJs, /visibleHarnessExecutionResult\?\.harnessId === statusCard\.primaryHarnessId/);
assert.doesNotMatch(appJs, /hiddenHarnessExecutionResult\?\.harnessId === statusCard\.primaryHarnessId/);
assert.match(appJs, /data-action="hide-harness-execution-result"/);
assert.match(appJs, /data-harness-result-hide="true"/);
assert.match(appJs, /const visibleHarnessHideActionMarkup = `/);
assert.match(appJs, /const visibleHarnessActionShelfMarkup = `\s+\$\{visibleHarnessInputPathActionsMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessHideActionMarkup\}/);
assert.match(appJs, /\$\{visibleHarnessActionShelfMarkup\}/);
assert.doesNotMatch(
  appJs,
  /\$\{visibleHarnessPolicyReportCopyMarkup\}[\s\S]*?<button[\s\S]*?data-action="hide-harness-execution-result"/,
);
assert.doesNotMatch(
  appJs,
  /form-actions-compact">\s+\$\{visibleHarnessInputPathActionsMarkup\}\s+\$\{visibleHarnessOutputPathCopyMarkup\}/,
);
assert.match(appJs, /function hideHarnessExecutionResult\(actionButton\)/);
assert.match(appJs, /state\.hiddenHarnessExecutionResultKey = executionKey;/);
assert.match(appJs, /state\.hiddenHarnessExecutionResultKey = null;/);

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

  throw new Error('Timed out waiting for ui-slice-319 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-319-'));
  const inputPath = path.join(tempDir, 'result-hide.txt');
  const outputPath = path.join(tempDir, 'result-hide.md');

  fs.writeFileSync(inputPath, 'Execution result hide smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const latestHarnessExecution = refreshedSnapshot.derived?.latestHarnessExecution || null;
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(runPayload.harnessExecution);
    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.resolvedInputPath, inputPath);
    assert.equal(latestHarnessExecution.resolvedOutputPath, outputPath);
    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 1);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionResultHide: {
            insertionPoint: 'executionResultRegister->hideExecutionResultAction->localVisibilityState',
            derivedKey: 'latestHarnessExecution',
            sourceMarker: 'data-harness-result-hide',
            namedValues: ['visibleHarnessHideActionMarkup', 'visibleHarnessActionShelfMarkup'],
            latestHarnessId: latestHarnessExecution.harnessId,
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
