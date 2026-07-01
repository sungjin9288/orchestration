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
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-380');
const port = 4681;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  appJs,
  /const visibleHarnessOutputChannelLabel =\s+visibleHarnessExecutionResult\?\.outputPath \? '출력 파일' : '표준 출력';/,
);
assert.match(
  appJs,
  /const visibleHarnessOutputChannelTone =\s+visibleHarnessExecutionResult\?\.outputPath \? 'accent' : 'neutral';/,
);
assert.match(
  appJs,
  /createToken\(visibleHarnessOutputChannelLabel, visibleHarnessOutputChannelTone\)/,
);
assert.doesNotMatch(appJs, /createToken\('표준 출력', 'neutral'\)/);

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

  throw new Error('Timed out waiting for ui-slice-380 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-380-'));
  const inputPath = path.join(tempDir, 'visible-stdout-token-wording.txt');

  fs.writeFileSync(inputPath, 'Execution visible stdout token wording smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const runPayload = await postJson('/api/harness/operator-action/run', {
      inputPath,
    });

    assert.equal(runPayload.harnessExecution?.harnessId, 'markitdown');
    assert.ok(runPayload.harnessExecution?.executedAt);
    assert.equal(runPayload.harnessExecution?.resolvedOutputPath || null, null);
    assert.match(runPayload.harnessExecution?.stdoutPreview || '', /Execution visible stdout token wording smoke/i);

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionVisibleStdoutTokenWording: {
            insertionPoint: 'executionResultRegister->visibleStdoutTokenWording->tokenLabel',
            tokenLabel: '표준 출력',
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
