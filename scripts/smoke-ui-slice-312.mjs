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
const harnessExecutionTokensPath = path.join(repoRoot, 'ui', 'harness-execution-tokens.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-312');
const port = 4612;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');

assert.match(appJs, /data-action="rerun-harness-execution-paths"/);
assert.match(appJs, /data-harness-history-rerun="true"/);
assert.match(
  appJs,
  /const historyHarnessPathActionsMarkup = `\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"[\s\S]*?data-action="rerun-harness-execution-paths"/,
);
assert.match(appJs, /\$\{historyHarnessPathActionsMarkup\}/);
assert.match(harnessExecutionTokens, /export function getHarnessHistoryInputPath\(execution\) \{/);
assert.match(harnessExecutionTokens, /export function getHarnessHistoryOutputPath\(execution\) \{/);
assert.match(appJs, /const historyHarnessInputPath = getHarnessHistoryInputPath\(execution\);/);
assert.match(appJs, /const historyHarnessOutputPath = getHarnessHistoryOutputPath\(execution\);/);
assert.match(appJs, /data-input-path="\$\{escapeHtml\(historyHarnessInputPath\)\}"/);
assert.match(appJs, /data-output-path="\$\{escapeHtml\(historyHarnessOutputPath\)\}"/);
assert.match(appJs, /async function executeHarnessOperatorAction\(\{\s+inputPath,\s+outputPath,\s+statusPayload,\s+pendingMessage,\s+policyReport = false,\s+\}\)/);
assert.match(appJs, /async function rerunHarnessExecutionPaths\(actionButton\)/);
assert.match(appJs, /await executeHarnessOperatorAction\(\{/);
assert.doesNotMatch(appJs, /const historyHarnessInputPath = execution\.inputPath \|\| execution\.resolvedInputPath \|\| '';/);
assert.doesNotMatch(appJs, /const historyHarnessOutputPath = execution\.outputPath \|\| execution\.resolvedOutputPath \|\| '';/);
assert.doesNotMatch(
  appJs,
  /\$\{historyHarnessPolicyReportCopyMarkup\}\s+<button[\s\S]*?data-action="reuse-harness-execution-paths"[\s\S]*?data-action="rerun-harness-execution-paths"/,
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

  throw new Error('Timed out waiting for ui-slice-312 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-312-'));
  const inputPath = path.join(tempDir, 'rerun.txt');
  const outputPath = path.join(tempDir, 'rerun.md');

  fs.writeFileSync(inputPath, 'Execution rerun smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const firstRunPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    assert.equal(firstRunPayload.harnessExecution?.resolvedInputPath, inputPath);
    assert.equal(firstRunPayload.harnessExecution?.resolvedOutputPath, outputPath);

    const secondRunPayload = await postJson('/api/harness/operator-action/run', {
      inputPath: firstRunPayload.harnessExecution?.resolvedInputPath,
      outputPath: firstRunPayload.harnessExecution?.resolvedOutputPath,
    });
    assert.equal(secondRunPayload.harnessExecution?.resolvedInputPath, inputPath);
    assert.equal(secondRunPayload.harnessExecution?.resolvedOutputPath, outputPath);

    const refreshedSnapshot = await fetchJson(`${baseUrl}/api/snapshot`);
    const recentHarnessExecutions = refreshedSnapshot.derived?.recentHarnessExecutions || [];

    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 2);
    assert.equal(recentHarnessExecutions[0]?.resolvedInputPath, inputPath);
    assert.equal(recentHarnessExecutions[0]?.resolvedOutputPath, outputPath);
    assert.equal(recentHarnessExecutions[1]?.resolvedInputPath, inputPath);
    assert.equal(recentHarnessExecutions[1]?.resolvedOutputPath, outputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHistoryRerun: {
            insertionPoint: 'executionHistoryRegister->rerunExecutionPathsAction->runHarnessOperatorActionRoute',
            route: '/api/harness/operator-action/run',
            sourceMarker: 'data-harness-history-rerun',
            newestInputPath: recentHarnessExecutions[0].resolvedInputPath,
            newestOutputPath: recentHarnessExecutions[0].resolvedOutputPath,
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
