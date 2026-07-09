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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-331');
const port = 4632;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessBriefLabels = fs.readFileSync(harnessBriefLabelsPath, 'utf8');

assert.match(appJs, /data-harness-result-hidden-action-summary="true"/);
assert.match(appJs, /getHarnessOperatorActionLabel\(operatorAction\)/);
assert.match(appJs, /const harnessOperatorActionLabel = getHarnessOperatorActionLabel\(operatorAction\);/);
assert.match(appJs, /const harnessOperatorActionTone = getHarnessOperatorActionTone\(operatorAction\);/);
assert.match(
  appJs,
  /const harnessOperatorActionTokenMarkup = createToken\(\s+harnessOperatorActionLabel,\s+harnessOperatorActionTone,\s+\);/,
);
assert.match(harnessBriefLabels, /if \(!operatorAction\?\.kind\) \{\s+return '액션 없음';\s+\}/);
assert.match(harnessBriefLabels, /if \(!operatorAction\?\.kind \|\| operatorAction\.kind === 'none'\) \{\s+return 'neutral';\s+\}/);
assert.match(appJs, /const hiddenHarnessOperatorActionLabel = harnessOperatorActionLabel;/);
assert.match(appJs, /const hiddenHarnessOperatorActionSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-action-summary="true">/);
assert.match(appJs, /\$\{hiddenHarnessOperatorActionSummaryMarkup\}/);
assert.match(appJs, /\$\{harnessOperatorActionTokenMarkup\}/);
assert.match(appJs, /\$\{escapeHtml\(harnessOperatorActionLabel\)\}/);
assert.doesNotMatch(appJs, /const hasHarnessOperatorAction = Boolean\(operatorAction\);/);
assert.doesNotMatch(appJs, /const harnessOperatorActionLabel = hasHarnessOperatorAction/);
assert.doesNotMatch(appJs, /const harnessOperatorActionTone = hasHarnessOperatorAction/);
assert.doesNotMatch(appJs, /const harnessOperatorActionLabel = operatorAction/);
assert.doesNotMatch(appJs, /const harnessOperatorActionTone = operatorAction/);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-action-summary="true">권장 액션: <code>\$\{escapeHtml\(getHarnessOperatorActionLabel\(operatorAction\)\)\}<\/code><\/p>\s*<p class="detail-copy detail-copy-compact" data-harness-result-hidden-command-summary="true">/);
assert.doesNotMatch(appJs, /createToken\(getHarnessOperatorActionLabel\(operatorAction\), getHarnessOperatorActionTone\(operatorAction\)\)/);
assert.doesNotMatch(appJs, /\$\{createToken\(harnessOperatorActionLabel, harnessOperatorActionTone\)\}/);
assert.doesNotMatch(appJs, /<strong class="control-overview-register-value">\$\{escapeHtml\(getHarnessOperatorActionLabel\(operatorAction\)\)\}<\/strong>/);

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

  throw new Error('Timed out waiting for ui-slice-331 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-331-'));
  const inputPath = path.join(tempDir, 'hidden-action-summary.txt');
  const outputPath = path.join(tempDir, 'hidden-action-summary.md');

  fs.writeFileSync(inputPath, 'Execution hidden action summary smoke\n', 'utf8');

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

    assert.ok(harnessConsumerStatus?.operatorAction?.kind);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHiddenActionSummary: {
            insertionPoint: 'hiddenExecutionResultRegister->hiddenActionSummary->operatorActionLabel',
            sourceMarker: 'data-harness-result-hidden-action-summary',
            route: '/api/harness/operator-action/run',
            namedValues: [
              'harnessOperatorActionLabel',
              'harnessOperatorActionTone',
              'harnessOperatorActionTokenMarkup',
              'hiddenHarnessOperatorActionLabel',
              'hiddenHarnessOperatorActionSummaryMarkup',
            ],
            helperFallback: 'getHarnessOperatorActionLabel',
            actionKind: harnessConsumerStatus.operatorAction.kind,
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
