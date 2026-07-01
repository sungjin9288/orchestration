import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const harnessLabelsPath = path.join(repoRoot, 'ui', 'harness-labels.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const harnessLabels = fs.readFileSync(harnessLabelsPath, 'utf8');

assert.match(appJs, /from '\.\/harness-labels\.js'/);
assert.match(harnessLabels, /export function getHarnessExecutionHandoffLabel\(execution, context = \{\}\) \{/);
assert.match(harnessLabels, /handoffs = \['패킷 복사'\]/);
assert.match(harnessLabels, /handoffs\.push\('요청 ID'\)/);
assert.match(harnessLabels, /handoffs\.push\(pathHandoffLabel\)/);
assert.match(harnessLabels, /handoffs\.push\('미리보기', getHarnessExecutionBriefActionLabel\(execution\)\)/);
assert.match(harnessLabels, /handoffs\.push\(getHarnessExecutionBriefCopyActionLabel\(execution\)\)/);
assert.match(harnessLabels, /handoffs\.push\('리포트 복사'\)/);
assert.match(appJs, /function getHarnessExecutionHandoffContext\(execution\)/);
assert.match(appJs, /hasOutputBrief: Boolean\(getHarnessOutputBriefResult\(execution, state\.lastHarnessOutputBriefResult\)\)/);
assert.match(appJs, /hasPolicyReport: Boolean\(getHarnessPolicyReportPayload\(execution\)\)/);
assert.match(appJs, /function getHarnessExecutionHandoffText\(execution\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(execution, getHarnessExecutionHandoffContext\(execution\)\)/);
assert.match(appJs, /data-harness-execution-handoff-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-handoff-summary="true"/);
assert.match(appJs, /<span class="control-overview-register-label">핸드오프<\/span>/);
assert.match(appJs, /const visibleHarnessHandoffText = getHarnessExecutionHandoffText\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessHandoffText = getHarnessExecutionHandoffText\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const visibleHarnessHandoffSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-handoff-summary="true">/);
assert.match(appJs, /const hiddenHarnessHandoffSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-result-hidden-handoff-summary="true">/);
assert.match(appJs, /\$\{visibleHarnessHandoffSummaryMarkup\}/);
assert.match(appJs, /\$\{hiddenHarnessHandoffSummaryMarkup\}/);
assert.match(appJs, /data-harness-execution-handoff-summary="true">핸드오프: <code>\$\{escapeHtml\(visibleHarnessHandoffText\)\}<\/code>/);
assert.match(appJs, /data-harness-result-hidden-handoff-summary="true">핸드오프: <code>\$\{escapeHtml\(hiddenHarnessHandoffText\)\}<\/code>/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true"[\s\S]*?<p class="detail-copy detail-copy-compact" data-harness-execution-handoff-summary="true">핸드오프: <code>\$\{escapeHtml\(visibleHarnessHandoffText\)\}<\/code><\/p>/,
);
assert.doesNotMatch(appJs, /<p class="detail-copy detail-copy-compact" data-harness-result-hidden-handoff-summary="true">핸드오프: <code>\$\{escapeHtml\(hiddenHarnessHandoffText\)\}<\/code><\/p>\s*\$\{hiddenHarnessInputSummaryMarkup\}/);
assert.match(appJs, /const historyHarnessHandoffText = getHarnessExecutionHandoffText\(execution\);/);
assert.match(appJs, /<strong class="control-overview-register-value">\$\{escapeHtml\(historyHarnessHandoffText\)\}<\/strong>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHandoffSummary: {
        helper: 'getHarnessExecutionHandoffLabel',
        namedValues: ['visibleHarnessHandoffSummaryMarkup', 'hiddenHarnessHandoffSummaryMarkup'],
        labelSources: [
          'getHarnessExecutionPathHandoffLabel',
          'getHarnessExecutionBriefActionLabel',
          'getHarnessExecutionBriefCopyActionLabel',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
