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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-336');
const port = 4637;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-primary-command-summary="true"/);
assert.match(appJs, /function getHarnessStatusSummaryValue\(value\) \{/);
assert.match(appJs, /return value \|\| '미확인';/);
assert.match(
  appJs,
  /const hiddenHarnessPrimaryCommandValue =\s+getHarnessStatusSummaryValue\(statusCard\.primaryCommand\);/,
);
assert.match(appJs, /const hiddenHarnessPrimaryCommandSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-command-summary="true">/);
assert.match(appJs, /대표 명령: <code>\$\{escapeHtml\(hiddenHarnessPrimaryCommandValue\)\}<\/code>/);
assert.match(appJs, /\$\{hiddenHarnessPrimaryCommandSummaryMarkup\}/);
assert.doesNotMatch(appJs, /const hiddenHarnessPrimaryCommandValue = statusCard\.primaryCommand \|\| '미확인';/);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-command-summary="true">대표 명령: <code>\$\{escapeHtml\(statusCard\.primaryCommand \|\| '미확인'\)\}<\/code><\/p>\s*<p class="detail-copy detail-copy-compact" data-harness-result-hidden-primary-runner-summary="true">/);

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

  throw new Error('Timed out waiting for ui-slice-336 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-336-'));
  const inputPath = path.join(tempDir, 'hidden-primary-command-summary.txt');
  const outputPath = path.join(tempDir, 'hidden-primary-command-summary.md');

  fs.writeFileSync(inputPath, 'Execution hidden primary command summary smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    const harnessConsumerStatus = runPayload.derived?.harnessConsumerStatus || null;

    assert.ok(harnessConsumerStatus?.statusCard?.primaryCommand);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenPrimaryCommandSummary: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenPrimaryCommandSummary->statusCardPrimaryCommand',
            helper: 'getHarnessStatusSummaryValue',
            sourceMarker: 'data-harness-result-hidden-primary-command-summary',
            route: '/api/harness/operator-action/run',
            namedValues: [
              'hiddenHarnessPrimaryCommandValue',
              'hiddenHarnessPrimaryCommandSummaryMarkup',
            ],
            primaryCommand: harnessConsumerStatus.statusCard.primaryCommand,
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
