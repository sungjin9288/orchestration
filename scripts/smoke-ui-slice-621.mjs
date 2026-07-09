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

assert.match(harnessLabels, /export function getHarnessExecutionOutputLabel\(execution\) \{/);
assert.match(harnessLabels, /output:\s*\{\s*policyReport: '출력 예정',\s*execution: '출력',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'output'\);/);
assert.match(harnessLabels, /`\$\{getHarnessExecutionOutputLabel\(execution\)\}: \$\{outputPath\}`/);
assert.match(harnessExecutionTokens, /export function getHarnessOutputSummaryValue\(outputPath\) \{/);
assert.match(harnessExecutionTokens, /return outputPath \|\| '표준 출력 전용';/);
assert.match(harnessExecutionTokens, /export function getHarnessInputSummaryValue\(inputPath\) \{/);
assert.match(harnessExecutionTokens, /return inputPath \|\| '경로 없음';/);
assert.match(appJs, /const visibleHarnessOutputLabel = getHarnessExecutionOutputLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessOutputLabel = getHarnessExecutionOutputLabel\(hiddenHarnessExecutionResult\);/);
assert.match(
  appJs,
  /const visibleHarnessOutputSummaryValue =\s+getHarnessOutputSummaryValue\(visibleHarnessOutputPath\);/,
);
assert.match(
  appJs,
  /const hiddenHarnessOutputSummaryValue =\s+getHarnessOutputSummaryValue\(hiddenHarnessOutputPath\);/,
);
assert.doesNotMatch(appJs, /const visibleHarnessOutputSummaryValue = visibleHarnessOutputPath \|\| '표준 출력 전용';/);
assert.doesNotMatch(appJs, /const hiddenHarnessOutputSummaryValue = hiddenHarnessOutputPath \|\| '표준 출력 전용';/);
assert.match(appJs, /const visibleHarnessOutputSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-output-summary="true">\$\{escapeHtml\(visibleHarnessOutputLabel\)\}:/);
assert.match(appJs, /\$\{visibleHarnessOutputSummaryMarkup\}/);
assert.match(appJs, /const historyHarnessOutputLabel = getHarnessExecutionOutputLabel\(execution\);/);
assert.match(
  appJs,
  /const historyHarnessOutputSummaryValue =\s+getHarnessOutputSummaryValue\(historyHarnessOutputPath\);/,
);
assert.doesNotMatch(appJs, /const historyHarnessOutputSummaryValue =\s+historyHarnessOutputPath \|\| '표준 출력 전용';/);
assert.match(
  appJs,
  /const historyHarnessInputSummaryValue =\s+getHarnessInputSummaryValue\(historyHarnessInputPath\);/,
);
assert.doesNotMatch(appJs, /const historyHarnessInputSummaryValue =\s+historyHarnessInputPath \|\| '경로 없음';/);
assert.match(appJs, /const historyHarnessInputSummaryMarkup =\s+renderHarnessHistorySummaryRow\('입력', historyHarnessInputSummaryValue\);/);
assert.match(appJs, /const historyHarnessOutputSummaryMarkup = renderHarnessHistorySummaryRow\(\s+historyHarnessOutputLabel,\s+historyHarnessOutputSummaryValue,\s+\);/);
assert.match(appJs, /\$\{historyHarnessInputSummaryMarkup\}/);
assert.match(appJs, /\$\{historyHarnessOutputSummaryMarkup\}/);
assert.doesNotMatch(
  appJs,
  /<span class="control-overview-register-label">\$\{escapeHtml\(historyHarnessOutputLabel\)\}<\/span>\s*<strong class="control-overview-register-value">\$\{escapeHtml\(historyHarnessOutputSummaryValue\)\}<\/strong>/,
);
assert.match(appJs, /data-harness-execution-output-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-output-summary="true"/);
assert.match(harnessExecutionTokens, /표준 출력 전용/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionOutputLabel: {
        helper: 'getHarnessExecutionOutputLabel',
        labels: ['출력 예정', '출력'],
        inputSummaryHelper: 'getHarnessInputSummaryValue',
        namedValues: [
          'historyHarnessInputSummaryMarkup',
          'historyHarnessOutputSummaryMarkup',
        ],
        surfaces: ['latest-result', 'hidden-result', 'recent-history', 'packet-copy'],
      },
    },
    null,
    2,
  ),
);
