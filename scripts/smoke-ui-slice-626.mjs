import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionResultTitle\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '최근 정책 리포트' : '최근 실행 결과'/);
assert.match(appJs, /getHarnessExecutionResultTitle\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionResultTitle\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /\$\{getHarnessExecutionResultTitle\(currentExecution\)\}를 숨겼습니다/);
assert.match(appJs, /숨긴 \$\{getHarnessExecutionModeLabel\(currentExecution\)\}를 다시 표시했습니다/);
assert.match(appJs, /\$\{getHarnessExecutionModeLabel\(targetExecution\)\}를 다시 표시했습니다/);
assert.doesNotMatch(appJs, /<strong>최근 실행 결과가 숨겨져 있습니다<\/strong>/);
assert.doesNotMatch(appJs, /최근 실행 결과를 숨겼습니다\. 필요하면 실행 기록에서 다시 볼 수 있습니다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultTitle: {
        helper: 'getHarnessExecutionResultTitle',
        labels: ['최근 정책 리포트', '최근 실행 결과'],
      },
    },
    null,
    2,
  ),
);
