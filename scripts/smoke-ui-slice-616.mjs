import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionModeLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '정책 리포트' : '실행 결과'/);
assert.match(appJs, /`모드: \$\{getHarnessExecutionModeLabel\(execution\)\}`/);
assert.match(appJs, /<span class="control-overview-register-label">모드<\/span>/);
assert.match(appJs, /<strong class="control-overview-register-value">\$\{escapeHtml\(getHarnessExecutionModeLabel\(execution\)\)\}<\/strong>/);
assert.match(appJs, /data-harness-execution-history-item="true"/);
assert.match(appJs, /data-harness-history-policy-report-copy="true"/);
assert.match(appJs, /data-harness-history-packet-copy="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryModeRow: {
        helper: 'getHarnessExecutionModeLabel',
        labels: ['정책 리포트', '실행 결과'],
        preserved: ['history policy-report copy', 'history packet copy'],
      },
    },
    null,
    2,
  ),
);
