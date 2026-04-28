import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionBriefCopyActionLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '리포트 요약 복사' : '요약 복사'/);
assert.match(appJs, /function getHarnessExecutionBriefCopyStatusLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '리포트 요약' : '출력 요약'/);
assert.match(appJs, /handoffs\.push\(getHarnessExecutionBriefCopyActionLabel\(execution\)\)/);
assert.match(appJs, /data-output-brief-label="\$\{escapeHtml\(getHarnessExecutionBriefCopyStatusLabel\(visibleHarnessExecutionResult\)\)\}"/);
assert.match(appJs, /getHarnessExecutionBriefCopyActionLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /async function copyHarnessOutputBrief\(briefText, label = '출력 요약'\)/);
assert.match(appJs, /const briefLabel = label \|\| '출력 요약'/);
assert.match(appJs, /`하네스 \$\{briefLabel\}을 복사했습니다\.`/);
assert.match(appJs, /actionButton\.dataset\.outputBriefLabel/);
assert.match(appJs, /data-harness-output-brief-copy="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionBriefCopyLabel: {
        helpers: [
          'getHarnessExecutionBriefCopyActionLabel',
          'getHarnessExecutionBriefCopyStatusLabel',
        ],
        labels: ['리포트 요약 복사', '요약 복사', '리포트 요약', '출력 요약'],
        surfaces: ['latest-result', 'handoff-summary', 'clipboard-status'],
      },
    },
    null,
    2,
  ),
);
