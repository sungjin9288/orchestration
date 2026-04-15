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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-298');
const port = 4598;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function renderLogs\(data\) \{/);
assert.match(appJs, /function renderHarnessBriefRegister\(brief\)/);
assert.match(appJs, /const harnessBrief = getHarnessConsumerBrief\(data\);/);
assert.match(
  appJs,
  /\$\{logsDeck\}\s*\n\s*\$\{renderHarnessBriefRegister\(harnessBrief\)\}\s*\n\s*<div class="surface-grid surface-grid-wide">/,
);

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until the server is ready.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-298 server');
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

    const snapshotPayload = await fetchJson(`${baseUrl}/api/snapshot`);
    const harnessBrief = snapshotPayload.derived?.harnessConsumerBrief?.brief;

    assert.equal(harnessBrief?.currentHostState, 'runnable');
    assert.equal(harnessBrief?.primaryHarnessId, 'markitdown');
    assert.equal(harnessBrief?.actionLabel, 'Run approved harness');
    assert.equal(harnessBrief?.actionCommand, 'node scripts/harness-run.mjs markitdown');

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessLogsRegister: {
            derivedKey: 'harnessConsumerBrief',
            insertionPoint: 'logsDeck->harnessRegister->surfaceGrid',
            actionCommand: harnessBrief.actionCommand,
            actionLabel: harnessBrief.actionLabel,
            currentHostState: harnessBrief.currentHostState,
            primaryHarnessId: harnessBrief.primaryHarnessId,
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
