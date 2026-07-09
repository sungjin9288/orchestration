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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-328');
const port = 4629;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-executed-at-summary="true"/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutionTimestampLabel\(execution, fallbackLabel = '기록 없음'\) \{/);
assert.match(harnessExecutionTokens, /if \(!execution\?\.executedAt\) \{\s+return fallbackLabel;\s+\}/);
assert.match(harnessExecutionTokens, /return formatDate\(execution\.executedAt\);/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutedAtTokenLabel\(executedAtLabel\) \{/);
assert.match(harnessExecutionTokens, /if \(!executedAtLabel\) \{\s+return '';\s+\}/);
assert.match(harnessExecutionTokens, /return `실행:\$\{executedAtLabel\}`;/);
assert.match(appJs, /const visibleHarnessExecutedAtLabel = getHarnessExecutionTimestampLabel\(\s+visibleHarnessExecutionResult,\s+'',\s+\);/);
assert.match(appJs, /const hiddenHarnessExecutedAtLabel = getHarnessExecutionTimestampLabel\(\s+hiddenHarnessExecutionResult,\s+'',\s+\);/);
assert.match(appJs, /const visibleHarnessExecutedAtTokenLabel =\s+getHarnessExecutedAtTokenLabel\(visibleHarnessExecutedAtLabel\);/);
assert.match(appJs, /const canRenderVisibleHarnessExecutedAtToken = Boolean\(visibleHarnessExecutedAtTokenLabel\);/);
assert.match(appJs, /const visibleHarnessExecutedAtTokenTone = 'neutral';/);
assert.match(appJs, /const visibleHarnessExecutedAtTokenMarkup = canRenderVisibleHarnessExecutedAtToken/);
assert.match(appJs, /createToken\(visibleHarnessExecutedAtTokenLabel, visibleHarnessExecutedAtTokenTone\)/);
assert.match(appJs, /\$\{visibleHarnessExecutedAtTokenMarkup\}/);
assert.match(appJs, /const canRenderHiddenHarnessExecutedAtSummary = Boolean\(hiddenHarnessExecutedAtLabel\);/);
assert.match(appJs, /const hiddenHarnessExecutedAtSummaryMarkup = canRenderHiddenHarnessExecutedAtSummary/);
assert.match(appJs, /\$\{hiddenHarnessExecutedAtSummaryMarkup\}/);
assert.match(appJs, /data-harness-result-hidden-executed-at-summary="true">실행 시각: <code>\$\{escapeHtml\(hiddenHarnessExecutedAtLabel\)\}<\/code>/);
assert.doesNotMatch(appJs, /escapeHtml\(formatDate\(hiddenHarnessExecutionResult\.executedAt\)\)/);
assert.doesNotMatch(appJs, /createToken\(`실행:\$\{formatDate\(visibleHarnessExecutionResult\.executedAt\)\}`/);
assert.doesNotMatch(appJs, /createToken\(visibleHarnessExecutedAtTokenLabel, 'neutral'\)/);
assert.doesNotMatch(appJs, /const visibleHarnessExecutedAtLabel = visibleHarnessExecutionResult\?\.executedAt/);
assert.doesNotMatch(appJs, /const hiddenHarnessExecutedAtLabel = hiddenHarnessExecutionResult\?\.executedAt/);
assert.doesNotMatch(appJs, /const visibleHarnessExecutedAtTokenLabel = visibleHarnessExecutedAtLabel\s+\?\s+`실행:\$\{visibleHarnessExecutedAtLabel\}`\s+:\s+'';/);
assert.doesNotMatch(appJs, /\$\{\s*hiddenHarnessExecutedAtLabel\s+\?\s+`<p class="detail-copy detail-copy-compact" data-harness-result-hidden-executed-at-summary="true">/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessExecutedAtTokenLabel\s+\?\s+createToken\(visibleHarnessExecutedAtTokenLabel, 'neutral'\)/);
assert.doesNotMatch(appJs, /\$\{\s*canRenderVisibleHarnessExecutedAtToken\s+\?\s+createToken\(visibleHarnessExecutedAtTokenLabel, 'neutral'\)/);

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

  throw new Error('Timed out waiting for ui-slice-328 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-328-'));
  const inputPath = path.join(tempDir, 'hidden-run-metadata.txt');
  const outputPath = path.join(tempDir, 'hidden-run-metadata.md');

  fs.writeFileSync(inputPath, 'Execution hidden run metadata smoke\n', 'utf8');

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
    assert.ok(latestHarnessExecution.executedAt);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenRunMetadata: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenExecutedAtSummary->localLatestExecutionPayload',
            sourceMarker: 'data-harness-result-hidden-executed-at-summary',
            namedValues: [
              'visibleHarnessExecutedAtLabel',
              'hiddenHarnessExecutedAtLabel',
              'getHarnessExecutionTimestampLabel',
              'getHarnessExecutedAtTokenLabel',
              'canRenderHiddenHarnessExecutedAtSummary',
              'hiddenHarnessExecutedAtSummaryMarkup',
              'visibleHarnessExecutedAtTokenLabel',
              'visibleHarnessExecutedAtTokenTone',
              'visibleHarnessExecutedAtTokenMarkup',
              'canRenderVisibleHarnessExecutedAtToken',
            ],
            route: '/api/harness/operator-action/run',
            executedAt: latestHarnessExecution.executedAt,
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
