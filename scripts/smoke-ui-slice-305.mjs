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
const harnessStatePath = path.join(repoRoot, 'ui', 'harness-state.js');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-305');
const port = 4605;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessState = fs.readFileSync(harnessStatePath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(
  serveUi,
  /const harnessConsumerStatusScript = path\.join\(repoRoot, 'scripts', 'harness-consumer-status\.mjs'\);/,
);
assert.match(serveUi, /mode === 'harness-consumer-status'/);
assert.match(serveUi, /harnessConsumerStatus,/);
assert.match(serveUi, /url\.pathname === '\/harness-state\.js'/);

assert.match(appJs, /from '\.\/harness-state\.js'/);
assert.match(harnessState, /export function getHarnessConsumerStatus\(data\) \{/);
assert.match(appJs, /function renderHarnessExecutionActionShelf\(statusPayload\) \{/);
assert.match(appJs, /const primaryHarnessId = statusCard\?\.primaryHarnessId \|\| '';/);
assert.match(appJs, /const operatorActionKind = operatorAction\?\.kind \|\| '';/);
assert.match(appJs, /const canShowHarnessOperatorAction =\s+primaryHarnessId && operatorActionKind && operatorActionKind !== 'none';/);
assert.match(appJs, /const operatorActionCommand = operatorAction\?\.repoNativeCommand \|\| '';/);
assert.match(appJs, /const canRenderHarnessRunForm = Boolean\(operatorActionCommand\);/);
assert.match(appJs, /const hiddenHarnessOperatorCommand = operatorActionCommand;/);
assert.match(appJs, /if \(!canShowHarnessOperatorAction\) \{/);
assert.match(appJs, /const harnessConsumerStatus = getHarnessConsumerStatus\(data\);/);
assert.match(appJs, /data-harness-execution-action="true"/);
assert.match(appJs, /harnessExecutionResult\?\.harnessId === primaryHarnessId/);
assert.match(appJs, /대표 하네스: <code>\$\{escapeHtml\(primaryHarnessId\)\}<\/code>/);
assert.match(appJs, /<strong class="control-overview-register-value">\$\{escapeHtml\(primaryHarnessId\)\}<\/strong>/);
assert.match(appJs, /canRenderHarnessRunForm\s+\?/);
assert.match(appJs, /<code class="harness-run-template-command">\$\{escapeHtml\(operatorActionCommand\)\}<\/code>/);
assert.match(appJs, /data-command="\$\{escapeHtml\(operatorActionCommand\)\}"/);
assert.doesNotMatch(
  appJs,
  /if \(!statusCard\?\.primaryHarnessId \|\| !operatorAction\?\.kind \|\| operatorAction\.kind === 'none'\) \{/,
);
assert.doesNotMatch(appJs, /operatorAction\.repoNativeCommand\s+\?/);
assert.doesNotMatch(appJs, /escapeHtml\(operatorAction\.repoNativeCommand\)/);
assert.match(
  appJs,
  /\$\{renderNarrativeDeck\(\{[\s\S]*?\}\)\}\s*\n\s*\$\{renderHarnessExecutionActionShelf\(harnessConsumerStatus\)\}\s*\n\s*\$\{executionEvidenceRail\}/,
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

  throw new Error('Timed out waiting for ui-slice-305 server');
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
    const harnessStatus = snapshotPayload.derived?.harnessConsumerStatus;

    assert.equal(harnessStatus?.ok, true);
    assert.equal(harnessStatus?.mode, 'harness-consumer-status');
    assert.equal(harnessStatus?.statusCard?.currentHostState, 'runnable');
    assert.equal(harnessStatus?.statusCard?.primaryHarnessId, 'markitdown');
    assert.equal(harnessStatus?.operatorAction?.kind, 'repo-native-run');
    assert.equal(
      harnessStatus?.operatorAction?.repoNativeCommand,
      'node scripts/harness-run.mjs markitdown <input-file> [output-file]',
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessExecutionOperatorAction: {
            derivedKey: 'harnessConsumerStatus',
            insertionPoint: 'executionNarrative->harnessExecutionAction->executionEvidenceRail',
            operatorKind: harnessStatus.operatorAction.kind,
            repoNativeCommand: harnessStatus.operatorAction.repoNativeCommand,
            primaryHarnessId: harnessStatus.statusCard.primaryHarnessId,
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
