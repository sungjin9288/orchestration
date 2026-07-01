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
assert.match(appJs, /const visibleHarnessResultStateLabel =\s+visibleHarnessIsPolicyReport \? 'no-write' : '완료';/);
assert.match(appJs, /const visibleHarnessResultStateTone =\s+visibleHarnessIsPolicyReport \? 'neutral' : 'success';/);
assert.match(appJs, /createToken\(visibleHarnessResultStateLabel, visibleHarnessResultStateTone\)/);
assert.match(appJs, /const previewSummaryPendingMessage = '하네스 실행 미리보기를 요약하는 중…';/);
assert.match(appJs, /const previewSummaryDoneMessage = '하네스 실행 미리보기 요약을 만들었습니다\.';/);
assert.match(appJs, /elements\.refreshStatus\.textContent = previewSummaryPendingMessage;/);
assert.match(appJs, /elements\.refreshStatus\.textContent = previewSummaryDoneMessage;/);
assert.match(appJs, /const currentExecutionTitle = getHarnessExecutionResultTitle\(currentExecution\);/);
assert.match(appJs, /const hideHarnessExecutionMessage =\s+`\$\{currentExecutionTitle\}를 숨겼습니다\. 필요하면 실행 기록에서 다시 볼 수 있습니다\.`;/);
assert.match(appJs, /elements\.refreshStatus\.textContent = hideHarnessExecutionMessage;/);
assert.match(appJs, /function getHarnessExecutionDisplayStamp\(execution\) \{/);
assert.match(appJs, /const modeLabel = getHarnessExecutionModeLabel\(execution\);/);
assert.match(appJs, /const harnessId = execution\?\.harnessId \|\| '미확인';/);
assert.match(appJs, /const executedAtLabel = execution\?\.executedAt \? formatDate\(execution\.executedAt\) : '최근 실행';/);
assert.match(appJs, /return `\$\{modeLabel\}: \$\{harnessId\} · \$\{executedAtLabel\}`;/);
assert.match(appJs, /const currentExecutionDisplayStamp = getHarnessExecutionDisplayStamp\(currentExecution\);/);
assert.match(appJs, /elements\.refreshStatus\.textContent = showHarnessExecutionMessage;/);
assert.match(appJs, /const showHarnessExecutionMessage =\s+`숨긴 하네스 실행을 다시 표시했습니다: \$\{currentExecutionDisplayStamp\}`;/);
assert.match(appJs, /const targetExecutionDisplayStamp = getHarnessExecutionDisplayStamp\(targetExecution\);/);
assert.match(appJs, /const restoreHarnessExecutionMessage =\s+`하네스 실행 기록을 다시 표시했습니다: \$\{targetExecutionDisplayStamp\}`;/);
assert.match(appJs, /elements\.refreshStatus\.textContent = restoreHarnessExecutionMessage;/);
assert.doesNotMatch(appJs, /<strong>\$\{escapeHtml\(getHarnessExecutionResultTitle\(visibleHarnessExecutionResult\)\)\}<\/strong>/);
assert.doesNotMatch(appJs, /<strong>\$\{escapeHtml\(getHarnessExecutionResultTitle\(hiddenHarnessExecutionResult\)\)\}가 숨겨져 있습니다<\/strong>/);
assert.doesNotMatch(appJs, /<strong>최근 실행 결과가 숨겨져 있습니다<\/strong>/);
assert.doesNotMatch(appJs, /최근 실행 결과를 숨겼습니다\. 필요하면 실행 기록에서 다시 볼 수 있습니다\./);
assert.doesNotMatch(appJs, /\$\{getHarnessExecutionResultTitle\(currentExecution\)\}를 숨겼습니다/);
assert.doesNotMatch(appJs, /elements\.refreshStatus\.textContent = '하네스 실행 미리보기를 요약하는 중…';/);
assert.doesNotMatch(appJs, /elements\.refreshStatus\.textContent = '하네스 실행 미리보기 요약을 만들었습니다\.';/);
assert.doesNotMatch(appJs, /visibleHarnessPolicyReportFlag/);
assert.doesNotMatch(appJs, /숨긴 \$\{getHarnessExecutionModeLabel\(currentExecution\)\}를 다시 표시했습니다/);
assert.doesNotMatch(appJs, /\$\{getHarnessExecutionModeLabel\(targetExecution\)\}를 다시 표시했습니다/);
assert.doesNotMatch(appJs, /const currentExecutionHarnessId = currentExecution\.harnessId;/);
assert.doesNotMatch(appJs, /const targetExecutionHarnessId = targetExecution\.harnessId;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultTitle: {
        helper: 'getHarnessExecutionResultTitle',
        labels: ['최근 정책 리포트', '최근 실행 결과'],
        namedValues: ['visibleHarnessResultTitle', 'hiddenHarnessResultTitle'],
        namedMessages: [
          'currentExecutionDisplayStamp',
          'hideHarnessExecutionMessage',
          'showHarnessExecutionMessage',
          'targetExecutionDisplayStamp',
          'restoreHarnessExecutionMessage',
        ],
      },
    },
    null,
    2,
  ),
);
