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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-605');
const port = 4705;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /let harnessExecutionSequence = 0;/);
assert.match(serveUi, /function nextHarnessExecutionRequestId\(\)/);
assert.match(serveUi, /requestId,/);
assert.match(serveUi, /executionId: requestId/);
assert.match(appJs, /data-harness-execution-request-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-request-summary="true"/);
assert.match(appJs, /const visibleHarnessRequestId =\s+visibleHarnessExecutionResult\?\.requestId \|\| visibleHarnessExecutionResult\?\.executionId \|\| '';/);
assert.match(appJs, /const visibleHarnessPrimaryTokenLabel = visibleHarnessExecutionResult\?\.harnessId/);
assert.match(appJs, /const visibleHarnessRequestTokenLabel = visibleHarnessRequestId/);
assert.match(appJs, /const canRenderVisibleHarnessRequestSummary = Boolean\(visibleHarnessRequestId\);/);
assert.match(appJs, /const canRenderHiddenHarnessRequestSummary = Boolean\(hiddenHarnessRequestId\);/);
assert.match(appJs, /const visibleHarnessRequestSummaryMarkup = canRenderVisibleHarnessRequestSummary/);
assert.match(appJs, /const hiddenHarnessRequestSummaryMarkup = canRenderHiddenHarnessRequestSummary/);
assert.match(appJs, /const visibleHarnessPolicyReportTokenLabel =\s+visibleHarnessIsPolicyReport \? '정책 리포트' : '';/);
assert.match(appJs, /createToken\(visibleHarnessPrimaryTokenLabel, 'neutral'\)/);
assert.match(appJs, /createToken\(visibleHarnessRequestTokenLabel, 'neutral'\)/);
assert.match(appJs, /createToken\(visibleHarnessPolicyReportTokenLabel, 'neutral'\)/);
assert.match(appJs, /\$\{visibleHarnessRequestSummaryMarkup\}/);
assert.match(appJs, /\$\{hiddenHarnessRequestSummaryMarkup\}/);
assert.doesNotMatch(appJs, /createToken\(`대표:\$\{visibleHarnessExecutionResult\.harnessId\}`/);
assert.doesNotMatch(appJs, /createToken\(`요청:\$\{visibleHarnessRequestId\}`/);
assert.doesNotMatch(appJs, /createToken\('정책 리포트', 'neutral'\)/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessRequestId\s+\?\s+`<p class="detail-copy detail-copy-compact" data-harness-execution-request-summary="true">/);
assert.doesNotMatch(appJs, /\$\{\s*hiddenHarnessRequestId\s+\?\s+`<p class="detail-copy detail-copy-compact" data-harness-result-hidden-request-summary="true">/);

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

  throw new Error('Timed out waiting for ui-slice-605 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-605-'));
  const inputPathA = path.join(tempDir, 'request-id-a.txt');
  const inputPathB = path.join(tempDir, 'request-id-b.txt');
  const outputPathA = path.join(tempDir, 'request-id-a.md');
  const outputPathB = path.join(tempDir, 'request-id-b.md');

  fs.writeFileSync(inputPathA, 'Execution request id smoke A\n', 'utf8');
  fs.writeFileSync(inputPathB, 'Execution request id smoke B\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const firstPayload = await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathA,
      outputPath: outputPathA,
    });
    const secondPayload = await postJson('/api/harness/operator-action/run', {
      inputPath: inputPathB,
      outputPath: outputPathB,
    });

    assert.equal(firstPayload.harnessExecution?.requestId, 'harness-exec-0001');
    assert.equal(firstPayload.harnessExecution?.executionId, 'harness-exec-0001');
    assert.equal(secondPayload.harnessExecution?.requestId, 'harness-exec-0002');
    assert.equal(secondPayload.harnessExecution?.executionId, 'harness-exec-0002');

    const snapshotPayload = await fetchJson(`${baseUrl}/api/snapshot`);
    const recentHarnessExecutions = snapshotPayload.derived?.recentHarnessExecutions || [];

    assert.equal(recentHarnessExecutions[0]?.requestId, 'harness-exec-0002');
    assert.equal(recentHarnessExecutions[1]?.requestId, 'harness-exec-0001');

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionRequestIds: {
            route: '/api/harness/operator-action/run',
            namedValues: [
              'visibleHarnessPrimaryTokenLabel',
              'visibleHarnessRequestTokenLabel',
              'canRenderVisibleHarnessRequestSummary',
              'visibleHarnessRequestSummaryMarkup',
              'canRenderHiddenHarnessRequestSummary',
              'hiddenHarnessRequestSummaryMarkup',
              'visibleHarnessPolicyReportTokenLabel',
            ],
            firstRequestId: firstPayload.harnessExecution.requestId,
            secondRequestId: secondPayload.harnessExecution.requestId,
            newestHistoryRequestId: recentHarnessExecutions[0].requestId,
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
