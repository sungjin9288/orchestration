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
const harnessExecutionTokensPath = path.join(repoRoot, 'ui', 'harness-execution-tokens.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');
const serveUiPath = path.join(repoRoot, 'scripts', 'serve-ui-slice-01.mjs');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-606');
const port = 4706;
const baseUrl = `http://127.0.0.1:${port}`;

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');
const serveUi = fs.readFileSync(serveUiPath, 'utf8');

assert.match(serveUi, /const policyReport = input\.policyReport === true;/);
assert.match(serveUi, /\.\.\.\(policyReport \? \['--policy-report'\] : \[\]\)/);
assert.match(serveUi, /actionMode: policyReport \? 'policy-report' : 'conversion'/);
assert.match(appJs, /data-action="preview-harness-policy-report"/);
assert.match(appJs, /data-harness-policy-report="true"/);
assert.match(appJs, /정책 리포트 확인/);
assert.match(appJs, /policyReport: true/);
assert.match(harnessLabels, /최근 정책 리포트/);
assert.match(harnessLabels, /출력 예정/);
assert.match(appJs, /function getHarnessPolicyReportPayload\(execution\)/);
assert.match(appJs, /data-harness-policy-report-summary="true"/);
assert.match(appJs, /data-harness-policy-report-guidance="true"/);
assert.match(appJs, /const visibleHarnessPolicyReportSummaryMarkup = renderHarnessPolicyReportSummary\(\s+visibleHarnessExecutionResult,\s+\);/);
assert.match(appJs, /\$\{visibleHarnessPolicyReportSummaryMarkup\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true"[\s\S]*?\$\{renderHarnessPolicyReportSummary\(visibleHarnessExecutionResult\)\}/,
);
assert.match(appJs, /현재 프로세스 권한으로 읽음/);
assert.match(appJs, /const policyReportInputStateLabel = payload\.input\?\.exists \? '파일 있음' : '파일 없음';/);
assert.match(appJs, /const policyReportInputSizeLabel = `\$\{String\(payload\.input\?\.sizeBytes \?\? 0\)\} bytes`;/);
assert.match(appJs, /const policyReportOutputPlanLabel = payload\.output\?\.wouldWrite/);
assert.match(appJs, /const policyReportPermissionLabel = pathPolicy\.readsWithCurrentProcessPrivileges/);
assert.match(appJs, /const policyReportExecutionModeLabel = pathPolicy\.executesConversion/);
assert.match(appJs, /const policyReportCliStateLabel = markitdown\.available/);
assert.match(appJs, /\$\{escapeHtml\(policyReportInputStateLabel\)\} · \$\{escapeHtml\(policyReportInputSizeLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(policyReportOutputPlanLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(policyReportPermissionLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(policyReportExecutionModeLabel\)\}/);
assert.match(appJs, /\$\{escapeHtml\(policyReportCliStateLabel\)\}/);
assert.doesNotMatch(appJs, /\$\{escapeHtml\(payload\.input\?\.exists \? '파일 있음' : '파일 없음'\)\}/);
assert.doesNotMatch(appJs, /\$\{escapeHtml\(payload\.output\?\.wouldWrite \?/);
assert.doesNotMatch(appJs, /\$\{escapeHtml\(pathPolicy\.readsWithCurrentProcessPrivileges \?/);
assert.doesNotMatch(appJs, /\$\{escapeHtml\(markitdown\.available \?/);
assert.match(appJs, /function getHarnessExecutionOutputCopy\(execution\) \{/);
assert.match(appJs, /function getHarnessExecutionCompletionCopy\(\{ execution, fallbackHarnessId \}\) \{/);
assert.match(appJs, /const executionHarnessId = execution\?\.harnessId \|\| fallbackHarnessId;/);
assert.match(appJs, /const executionRequestId = execution\?\.requestId \|\| execution\?\.executionId \|\| '';/);
assert.match(appJs, /const executionRequestCopy = executionRequestId \? `요청: \$\{executionRequestId\}\. ` : '';/);
assert.match(appJs, /const executionOutputCopy = getHarnessExecutionOutputCopy\(execution\);/);
assert.match(harnessExecutionTokens, /export function isHarnessPolicyReportExecution\(execution\) \{/);
assert.match(harnessLabels, /completionLead: \{\s+policyReport: '정책 리포트 확인 완료',\s+execution: '실행 완료',\s+\}/);
assert.match(harnessLabels, /export function getHarnessExecutionCompletionLead\(execution, harnessId\) \{/);
assert.match(harnessLabels, /getHarnessExecutionLabel\(execution, 'completionLead'\)/);
assert.match(harnessLabels, /export function getHarnessExecutionCompletionOutputCopy\(execution, fallbackOutputCopy\) \{/);
assert.match(harnessLabels, /isHarnessPolicyReportExecution\(execution\) && execution\?\.stdoutPreview/);
assert.match(appJs, /const executionCompletionLead = getHarnessExecutionCompletionLead\(\s+execution,\s+executionHarnessId,\s+\);/);
assert.match(appJs, /const executionCompletionOutputCopy = getHarnessExecutionCompletionOutputCopy\(\s+execution,\s+executionOutputCopy,\s+\);/);
assert.match(appJs, /const primaryHarnessId = statusCard\?\.primaryHarnessId \|\| '';/);
assert.match(appJs, /const operatorActionKind = operatorAction\?\.kind \|\| '';/);
assert.match(appJs, /const canRunHarnessOperatorAction =\s+primaryHarnessId && operatorActionKind === 'repo-native-run';/);
assert.match(appJs, /if \(!canRunHarnessOperatorAction\) \{/);
assert.match(appJs, /const defaultExecutionPendingMessage =\s+`하네스 \$\{primaryHarnessId\} 실행을 시작하는 중…`;/);
assert.match(appJs, /const executionPendingMessage = pendingMessage \|\| defaultExecutionPendingMessage;/);
assert.match(appJs, /elements\.refreshStatus\.textContent = executionPendingMessage;/);
assert.match(appJs, /const policyReportPendingMessage = '하네스 정책 리포트를 확인하는 중…';/);
assert.match(appJs, /pendingMessage: policyReportPendingMessage,/);
assert.match(appJs, /const executionCompletionCopy = getHarnessExecutionCompletionCopy\(\{\s+execution,\s+fallbackHarnessId: primaryHarnessId,/);
assert.match(appJs, /elements\.refreshStatus\.textContent = executionCompletionCopy;/);
assert.doesNotMatch(appJs, /execution\.actionMode === 'policy-report'\s+\?\s+`하네스 \$\{execution\.harnessId/);
assert.doesNotMatch(appJs, /const executionIsPolicyReport = execution\?\.actionMode === 'policy-report';/);
assert.doesNotMatch(appJs, /const executionIsPolicyReport = isHarnessPolicyReportExecution\(execution\);/);
assert.doesNotMatch(appJs, /const executionCompletionLead = executionIsPolicyReport/);
assert.doesNotMatch(appJs, /const executionCompletionOutputCopy =\s+executionIsPolicyReport && execution\?\.stdoutPreview/);
assert.doesNotMatch(appJs, /const executionOutputCopy = execution\.resolvedOutputPath\s+\?/);
assert.doesNotMatch(appJs, /const policyReportOutputCopy = execution\.stdoutPreview/);
assert.doesNotMatch(appJs, /elements\.refreshStatus\.textContent =\s+pendingMessage \|\| `하네스 \$\{statusCard\.primaryHarnessId\} 실행을 시작하는 중…`;/);
assert.doesNotMatch(appJs, /fallbackHarnessId: statusCard\.primaryHarnessId/);
assert.doesNotMatch(appJs, /if \(!statusCard\?\.primaryHarnessId \|\| !operatorAction\?\.kind \|\| operatorAction\.kind !== 'repo-native-run'\) \{/);
assert.doesNotMatch(appJs, /pendingMessage: '하네스 정책 리포트를 확인하는 중…'/);
assert.match(serveUi, /stdoutPreview: stdout \? stdout\.slice\(0, policyReport \? 1600 : 400\) : null/);

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

  throw new Error('Timed out waiting for ui-slice-606 server');
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
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'orchestration-ui-slice-606-'));
  const inputPath = path.join(tempDir, 'policy-report-input.txt');
  const outputPath = path.join(tempDir, 'policy-report-output.md');

  fs.writeFileSync(inputPath, 'Policy report UI route smoke\n', 'utf8');

  server.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  try {
    await waitForServer();

    const payload = await postJson('/api/harness/operator-action/run', {
      inputPath,
      outputPath,
      policyReport: true,
    });

    assert.equal(payload.mutation?.kind, 'run-harness-operator-action');
    assert.equal(payload.harnessExecution?.harnessId, 'markitdown');
    assert.equal(payload.harnessExecution?.actionMode, 'policy-report');
    assert.equal(payload.harnessExecution?.resolvedInputPath, inputPath);
    assert.equal(payload.harnessExecution?.resolvedOutputPath, outputPath);
    assert.equal(payload.harnessExecution?.outputExists, false);
    assert.equal(fs.existsSync(outputPath), false, 'policy report route must not write output');
    assert.match(payload.harnessExecution?.stdoutPreview || '', /markitdown-policy-report/);

    const policyReportPayload = JSON.parse(payload.harnessExecution.stdoutPreview);
    assert.equal(policyReportPayload.mode, 'markitdown-policy-report');
    assert.equal(policyReportPayload.pathPolicy.executesConversion, false);
    assert.equal(policyReportPayload.pathPolicy.readsWithCurrentProcessPrivileges, true);
    assert.equal(policyReportPayload.output.wouldWrite, true);

    const snapshotPayload = await fetchJson(`${baseUrl}/api/snapshot`);
    assert.equal(snapshotPayload.derived?.latestHarnessExecution?.actionMode, 'policy-report');
    assert.equal(snapshotPayload.derived?.recentHarnessExecutions?.[0]?.actionMode, 'policy-report');

    console.log(
      JSON.stringify(
        {
          ok: true,
          harnessPolicyReportUiRoute: {
            route: '/api/harness/operator-action/run',
            actionMode: payload.harnessExecution.actionMode,
            outputExists: payload.harnessExecution.outputExists,
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
