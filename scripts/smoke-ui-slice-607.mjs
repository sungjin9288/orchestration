import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-607');
const port = 4707;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /verificationOutputBriefScript/);
assert.match(serveUi, /function runVerificationOutputBrief\(input = \{\}\)/);
assert.match(serveUi, /url\.pathname === '\/api\/harness\/output-brief'/);
assert.match(serveUi, /mode: 'harness-output-brief'/);
assert.match(appJs, /lastHarnessOutputBriefResult: null/);
assert.match(appJs, /function renderHarnessOutputBriefSummary\(execution\)/);
assert.match(appJs, /data-harness-output-brief-summary="true"/);
assert.match(appJs, /data-harness-output-brief-lines="true"/);
assert.match(appJs, /data-action="summarize-harness-execution-preview"/);
assert.match(appJs, /data-harness-output-brief="true"/);
assert.match(appJs, /data-harness-history-output-brief="true"/);
assert.match(appJs, /state\.lastHarnessExecutionResult = historyExecution;/);
assert.match(appJs, /data-history-index="\$\{String\(index\)\}"/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(execution\)/);

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

  throw new Error('Timed out waiting for ui-slice-607 server');
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

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const payload = await postJson('/api/harness/output-brief', {
      maxLines: 4,
      text: [
        'node scripts/smoke-ui-slice-606.mjs',
        'ok policy report summary passed',
        'warning optional browser check skipped',
        'Error: fixture failure first',
        'context only line',
      ].join('\n'),
    });

    assert.equal(payload.ok, true);
    assert.equal(payload.mode, 'harness-output-brief');
    assert.equal(payload.outputBrief?.mode, 'verification-output-brief');
    assert.equal(payload.outputBrief?.installsShellHooks, false);
    assert.equal(payload.outputBrief?.rewritesCommands, false);
    assert.equal(payload.outputBrief?.countsByType.fail, 1);
    assert.equal(payload.outputBrief?.countsByType.warn, 1);
    assert.equal(payload.outputBrief?.countsByType.pass, 1);
    assert.equal(payload.outputBrief?.countsByType.command, 1);
    assert.deepEqual(
      payload.outputBrief?.briefLines.map((line) => line.type),
      ['fail', 'warn', 'pass', 'command'],
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessOutputBriefUiRoute: {
            route: '/api/harness/output-brief',
            briefLineCount: payload.outputBrief.briefLines.length,
            failCount: payload.outputBrief.countsByType.fail,
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
  }
}

await main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
