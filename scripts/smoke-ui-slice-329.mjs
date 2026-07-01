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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-329');
const port = 4630;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-harness-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-state-summary="true"/);
assert.match(appJs, /const hiddenHarnessIdSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-harness-summary="true">/);
assert.match(appJs, /const hiddenHarnessStateValue = statusCard\.primaryHarnessState;/);
assert.match(appJs, /const hiddenHarnessStateSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-state-summary="true">/);
assert.match(appJs, /\$\{hiddenHarnessIdSummaryMarkup\}/);
assert.match(appJs, /\$\{hiddenHarnessStateSummaryMarkup\}/);
assert.match(appJs, /statusCard\.primaryHarnessId/);
assert.match(appJs, /현재 상태: <code>\$\{escapeHtml\(hiddenHarnessStateValue\)\}<\/code>/);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-harness-summary="true">대표 하네스: <code>\$\{escapeHtml\(statusCard\.primaryHarnessId\)\}<\/code><\/p>\s*<p class="detail-copy detail-copy-compact" data-harness-result-hidden-kind-summary="true">/);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-state-summary="true">현재 상태: <code>\$\{escapeHtml\(statusCard\.primaryHarnessState\)\}<\/code><\/p>\s*<p class="detail-copy detail-copy-compact" data-harness-result-hidden-host-summary="true">/);

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

  throw new Error('Timed out waiting for ui-slice-329 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-329-'));
  const inputPath = path.join(tempDir, 'hidden-harness-state-summary.txt');
  const outputPath = path.join(tempDir, 'hidden-harness-state-summary.md');

  fs.writeFileSync(inputPath, 'Execution hidden harness/state summary smoke\n', 'utf8');

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
    const harnessConsumerStatus = runPayload.derived?.harnessConsumerStatus || null;

    assert.ok(latestHarnessExecution);
    assert.equal(latestHarnessExecution.harnessId, 'markitdown');
    assert.ok(harnessConsumerStatus?.statusCard);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenHarnessStateSummary: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenHarnessStateSummary->statusCard',
            harnessMarker: 'data-harness-result-hidden-harness-summary',
            stateMarker: 'data-harness-result-hidden-state-summary',
            namedValues: [
              'hiddenHarnessIdSummaryMarkup',
              'hiddenHarnessStateValue',
              'hiddenHarnessStateSummaryMarkup',
            ],
            route: '/api/harness/operator-action/run',
            primaryHarnessId: harnessConsumerStatus.statusCard.primaryHarnessId,
            primaryHarnessState: harnessConsumerStatus.statusCard.primaryHarnessState,
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
