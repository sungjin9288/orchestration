import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionBriefActionLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '리포트 요약' : '출력 요약'/);
assert.match(appJs, /handoffs\.push\('미리보기', getHarnessExecutionBriefActionLabel\(execution\)\)/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionBriefActionLabel\(execution\)/);
assert.match(appJs, /data-harness-output-brief="true"/);
assert.match(appJs, /data-harness-result-hidden-output-brief="true"/);
assert.match(appJs, /data-harness-history-output-brief="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionBriefActionLabel: {
        helper: 'getHarnessExecutionBriefActionLabel',
        labels: ['리포트 요약', '출력 요약'],
        surfaces: ['latest-result', 'hidden-result', 'recent-history', 'handoff-summary'],
      },
    },
    null,
    2,
  ),
);
