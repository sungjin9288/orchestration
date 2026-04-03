import assert from 'node:assert/strict';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

import runtimeServiceModule from '../src/runtime/runtime-service.js';

const { createRuntimeService } = runtimeServiceModule;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-17');
const port = 4327;
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/snapshot`);

      if (response.ok) {
        return;
      }
    } catch (_error) {
      // Retry until server startup completes.
    }

    await delay(200);
  }

  throw new Error('Timed out waiting for ui-slice-17 server');
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

    const indexResponse = await fetch(`${baseUrl}/`);
    const indexHtml = await indexResponse.text();
    const appJsResponse = await fetch(`${baseUrl}/app.js`);
    const appJs = await appJsResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.match(indexHtml, /<title>오케스트레이션 1\.0 AI 전략 본부<\/title>/);
    assert.match(indexHtml, /<h1>AI 전략 본부<\/h1>/);
    assert.match(indexHtml, /본부 운영 표면/);
    assert.match(indexHtml, /고급 운영 모드/);
    assert.match(indexHtml, /data-nav-group="primary-orchestration"/);
    assert.match(indexHtml, /data-nav-group="advanced-ops"/);
    assert.match(appJs, /const SURFACE_DISPLAY_NAMES = \{/);
    assert.match(appJs, /mission: '미션'/);
    assert.match(appJs, /taskboard: '작업판'/);
    assert.match(appJs, /'decision-inbox': '결정함'/);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          shell: {
            title: 'AI 전략 본부',
            primaryGroup: '본부 운영 표면',
            advancedOpsGroup: '고급 운영 모드',
          },
        },
        null,
        2,
      ),
    );
  } finally {
    server.kill('SIGTERM');
    await delay(100);

    if (server.exitCode === null) {
      server.kill('SIGKILL');
    }

    if (stderr.trim()) {
      process.stderr.write(stderr);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
