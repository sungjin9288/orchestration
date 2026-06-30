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
    const surfaceConfigResponse = await fetch(`${baseUrl}/surface-config.js`);
    const surfaceConfig = await surfaceConfigResponse.text();

    assert.equal(indexResponse.status, 200);
    assert.equal(appJsResponse.status, 200);
    assert.equal(surfaceConfigResponse.status, 200);
    assert.match(indexHtml, /<title>Orchestration 1\.0 Workflow Control<\/title>/);
    assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
    assert.match(indexHtml, /Workflow Control/);
    assert.match(indexHtml, /업무/);
    assert.match(indexHtml, /검토/);
    assert.match(indexHtml, /운영/);
    assert.match(indexHtml, /data-nav-group-tab="workflows"/);
    assert.match(indexHtml, /data-nav-group-tab="review"/);
    assert.match(indexHtml, /data-nav-group-tab="ops"/);
    assert.match(indexHtml, /data-nav-group="workflows"/);
    assert.match(indexHtml, /data-nav-group="review"/);
    assert.match(indexHtml, /data-nav-group="ops"/);
    assert.match(appJs, /from '\.\/surface-config\.js'/);
    assert.match(surfaceConfig, /export const SURFACE_DISPLAY_NAMES = \{/);
    assert.match(surfaceConfig, /export function getSurfaceDisplayName\(surface\) \{/);
    assert.match(surfaceConfig, /mission: '미션'/);
    assert.match(surfaceConfig, /taskboard: '작업판'/);
    assert.match(surfaceConfig, /'decision-inbox': '결정함'/);

    console.log(
      JSON.stringify(
        {
          ok: true,
          runtimeRoot,
          shell: {
            title: 'Orchestration',
            menuGroups: ['업무', '검토', '운영'],
            navTabs: ['workflows', 'review', 'ops'],
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
