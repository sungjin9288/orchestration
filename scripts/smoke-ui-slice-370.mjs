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
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-370');
const port = 4671;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-harness-execution-history="true"/);
assert.match(
  appJs,
  /data-harness-execution-history="true"[\s\S]*?<div class="card-title-row card-title-row-tight">/,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-packet \.card-title-row-tight\s*\{[\s\S]*padding:\s*5px 7px;[\s\S]*border-radius:\s*10px;[\s\S]*box-shadow:\s*[\s\S]*0 4px 10px rgba\(20,\s*34,\s*42,\s*0\.03\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-packet \.card-title-row-tight \.token-neutral\s*\{[\s\S]*border-color:\s*rgba\(33,\s*57,\s*49,\s*0\.1\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(248,\s*250,\s*251,\s*0\.96\),\s*rgba\(240,\s*244,\s*247,\s*0\.99\)\);[\s\S]*color:\s*rgba\(67,\s*79,\s*90,\s*0\.84\);/s,
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

  throw new Error('Timed out waiting for ui-slice-370 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-370-'));
  const inputPath = path.join(tempDir, 'history-header-density.txt');
  const outputPath = path.join(tempDir, 'history-header-density.md');

  fs.writeFileSync(inputPath, 'Execution history header density smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
    });
    const recentHarnessExecutions = runPayload.derived?.recentHarnessExecutions || [];

    assert.ok(Array.isArray(recentHarnessExecutions));
    assert.ok(recentHarnessExecutions.length >= 1);
    assert.equal(recentHarnessExecutions[0]?.resolvedInputPath, inputPath);
    assert.equal(recentHarnessExecutions[0]?.resolvedOutputPath, outputPath);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionHistoryHeaderDensity: {
            insertionPoint: 'executionHistoryRegister->historyHeaderDensity->tightTitleRow',
            headerClass: 'card-title-row-tight',
            route: '/api/harness/operator-action/run',
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
