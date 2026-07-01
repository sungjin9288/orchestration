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

assert.match(harnessLabels, /export function getHarnessExecutionResultTitle\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '최근 정책 리포트' : '최근 실행 결과'/);
assert.match(appJs, /const visibleHarnessResultTitle = getHarnessExecutionResultTitle\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessResultTitle = getHarnessExecutionResultTitle\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /<strong>\$\{escapeHtml\(visibleHarnessResultTitle\)\}<\/strong>/);
assert.match(appJs, /<strong>\$\{escapeHtml\(hiddenHarnessResultTitle\)\}가 숨겨져 있습니다<\/strong>/);
assert.match(appJs, /const visibleHarnessResultStateLabel =\s+visibleHarnessPolicyReportFlag === 'true' \? 'no-write' : '완료';/);
assert.match(appJs, /const visibleHarnessResultStateTone =\s+visibleHarnessPolicyReportFlag === 'true' \? 'neutral' : 'success';/);
assert.match(appJs, /createToken\(visibleHarnessResultStateLabel, visibleHarnessResultStateTone\)/);
assert.match(appJs, /\$\{getHarnessExecutionResultTitle\(currentExecution\)\}를 숨겼습니다/);
assert.match(appJs, /숨긴 \$\{getHarnessExecutionModeLabel\(currentExecution\)\}를 다시 표시했습니다/);
assert.match(appJs, /\$\{getHarnessExecutionModeLabel\(targetExecution\)\}를 다시 표시했습니다/);
assert.doesNotMatch(appJs, /<strong>\$\{escapeHtml\(getHarnessExecutionResultTitle\(visibleHarnessExecutionResult\)\)\}<\/strong>/);
assert.doesNotMatch(appJs, /<strong>\$\{escapeHtml\(getHarnessExecutionResultTitle\(hiddenHarnessExecutionResult\)\)\}가 숨겨져 있습니다<\/strong>/);
assert.doesNotMatch(appJs, /<strong>최근 실행 결과가 숨겨져 있습니다<\/strong>/);
assert.doesNotMatch(appJs, /최근 실행 결과를 숨겼습니다\. 필요하면 실행 기록에서 다시 볼 수 있습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultTitle: {
        helper: 'getHarnessExecutionResultTitle',
        labels: ['최근 정책 리포트', '최근 실행 결과'],
        namedValues: ['visibleHarnessResultTitle', 'hiddenHarnessResultTitle'],
      },
    },
    null,
    2,
  ),
);
