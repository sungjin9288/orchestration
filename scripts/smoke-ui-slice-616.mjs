import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const harnessExecutionTokensPath = path.join(repoRoot, 'ui', 'harness-execution-tokens.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessExecutionTokens = fs.readFileSync(harnessExecutionTokensPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');

assert.match(harnessLabels, /export function getHarnessExecutionModeLabel\(execution\) \{/);
assert.match(harnessLabels, /mode:\s*\{\s*policyReport: '정책 리포트',\s*execution: '실행 결과',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'mode'\);/);
assert.match(harnessLabels, /`모드: \$\{getHarnessExecutionModeLabel\(execution\)\}`/);
assert.match(appJs, /const visibleHarnessModeLabel = getHarnessExecutionModeLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessModeLabel = getHarnessExecutionModeLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessModeSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-mode-summary="true">/);
assert.match(appJs, /\$\{hiddenHarnessModeSummaryMarkup\}/);
assert.match(appJs, /data-harness-execution-mode-summary="true">모드: <code>\$\{escapeHtml\(visibleHarnessModeLabel\)\}<\/code>/);
assert.match(appJs, /data-harness-result-hidden-mode-summary="true">모드: <code>\$\{escapeHtml\(hiddenHarnessModeLabel\)\}<\/code>/);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-mode-summary="true">모드: <code>\$\{escapeHtml\(hiddenHarnessModeLabel\)\}<\/code><\/p>\s*<p class="detail-copy detail-copy-compact" data-harness-result-hidden-handoff-summary="true">/);
assert.match(appJs, /const renderHarnessHistorySummaryRow = \(label, value\) => `/);
assert.match(harnessExecutionTokens, /export function getHarnessHistoryRequestLabel\(requestId, index\) \{/);
assert.match(harnessExecutionTokens, /return requestId \|\| `최근 \$\{index \+ 1\}`;/);
assert.match(harnessExecutionTokens, /export function getHarnessExecutionRequestId\(execution\) \{/);
assert.match(appJs, /const historyHarnessModeLabel = getHarnessExecutionModeLabel\(execution\);/);
assert.match(appJs, /const historyHarnessExecutedAtLabel =\s+getHarnessExecutionTimestampLabel\(execution\);/);
assert.match(appJs, /const historyHarnessRequestId = getHarnessExecutionRequestId\(execution\);/);
assert.match(
  appJs,
  /const historyHarnessRequestLabel =\s+getHarnessHistoryRequestLabel\(historyHarnessRequestId, index\);/,
);
assert.doesNotMatch(appJs, /const historyHarnessRequestId = execution\.requestId \|\| execution\.executionId \|\| '';/);
assert.doesNotMatch(appJs, /const historyHarnessRequestLabel =\s+historyHarnessRequestId \|\| `최근 \$\{index \+ 1\}`;/);
assert.match(appJs, /const historyHarnessRequestSummaryMarkup =\s+renderHarnessHistorySummaryRow\('요청', historyHarnessRequestLabel\);/);
assert.match(appJs, /const historyHarnessExecutedAtSummaryMarkup =\s+renderHarnessHistorySummaryRow\('실행', historyHarnessExecutedAtLabel\);/);
assert.match(appJs, /const historyHarnessModeSummaryMarkup =\s+renderHarnessHistorySummaryRow\('모드', historyHarnessModeLabel\);/);
assert.match(appJs, /\$\{historyHarnessRequestSummaryMarkup\}/);
assert.match(appJs, /\$\{historyHarnessExecutedAtSummaryMarkup\}/);
assert.match(appJs, /\$\{historyHarnessModeSummaryMarkup\}/);
assert.match(appJs, /data-harness-execution-history-item="true"/);
assert.match(appJs, /data-harness-history-policy-report-copy="true"/);
assert.match(appJs, /data-harness-history-packet-copy="true"/);
assert.doesNotMatch(appJs, /escapeHtml\(formatDate\(execution\.executedAt\)\)/);
assert.doesNotMatch(
  appJs,
  /<span class="control-overview-register-label">모드<\/span>\s*<strong class="control-overview-register-value">\$\{escapeHtml\(historyHarnessModeLabel\)\}<\/strong>/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryModeRow: {
        helper: 'getHarnessExecutionModeLabel',
        requestLabelHelper: 'getHarnessHistoryRequestLabel',
        labels: ['정책 리포트', '실행 결과'],
        namedValues: [
          'hiddenHarnessModeSummaryMarkup',
          'historyHarnessRequestSummaryMarkup',
          'historyHarnessExecutedAtSummaryMarkup',
          'historyHarnessExecutedAtLabel',
          'historyHarnessModeSummaryMarkup',
          'historyHarnessModeLabel',
        ],
        preserved: ['history policy-report copy', 'history packet copy'],
      },
    },
    null,
    2,
  ),
);
