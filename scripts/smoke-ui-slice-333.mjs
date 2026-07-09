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
const harnessBriefLabelsPath = path.join(repoRoot, 'ui', 'harness-brief-labels.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-333');
const port = 4634;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessBriefLabels = fs.readFileSync(harnessBriefLabelsPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-message-summary="true"/);
assert.match(harnessBriefLabels, /export function getHarnessOperatorActionMessage\(operatorAction\) \{/);
assert.match(harnessBriefLabels, /export function getHarnessOperatorActionDisplayMessage\(message\) \{/);
assert.match(appJs, /const operatorActionMessage = getHarnessOperatorActionMessage\(operatorAction\);/);
assert.match(appJs, /const operatorActionDisplayMessage =\s+getHarnessOperatorActionDisplayMessage\(operatorActionMessage\);/);
assert.match(appJs, /const hiddenHarnessOperatorMessage = operatorActionMessage;/);
assert.match(appJs, /const canRenderHiddenHarnessOperatorMessageSummary = Boolean\(hiddenHarnessOperatorMessage\);/);
assert.match(appJs, /const hiddenHarnessOperatorMessageSummaryMarkup = canRenderHiddenHarnessOperatorMessageSummary/);
assert.match(appJs, /\$\{hiddenHarnessOperatorMessageSummaryMarkup\}/);
assert.doesNotMatch(appJs, /const operatorActionMessage = operatorAction\?\.message \|\| '';/);
assert.doesNotMatch(appJs, /operatorActionMessage \|\| '대표 하네스 액션이 아직 준비되지 않았습니다\.';/);
assert.doesNotMatch(appJs, /const hiddenHarnessOperatorMessageSummaryMarkup = hiddenHarnessOperatorMessage/);
assert.doesNotMatch(appJs, /escapeHtml\(operatorAction\.message/);
assert.doesNotMatch(appJs, /operatorAction\.message\s*\?\s*`<p class="detail-copy detail-copy-compact" data-harness-result-hidden-message-summary="true">운영 메모: \$\{escapeHtml\(operatorAction\.message\)\}<\/p>`/);

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

  throw new Error('Timed out waiting for ui-slice-333 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-333-'));
  const inputPath = path.join(tempDir, 'hidden-message-summary.txt');
  const outputPath = path.join(tempDir, 'hidden-message-summary.md');

  fs.writeFileSync(inputPath, 'Execution hidden message summary smoke\n', 'utf8');

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

    assert.ok(harnessConsumerStatus?.operatorAction?.message);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenMessageSummary: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenMessageSummary->operatorActionMessage',
            sourceMarker: 'data-harness-result-hidden-message-summary',
            route: '/api/harness/operator-action/run',
            namedValues: [
              'operatorActionMessage',
              'operatorActionDisplayMessage',
              'hiddenHarnessOperatorMessage',
              'canRenderHiddenHarnessOperatorMessageSummary',
              'hiddenHarnessOperatorMessageSummaryMarkup',
            ],
            messageLength: harnessConsumerStatus.operatorAction.message.length,
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
