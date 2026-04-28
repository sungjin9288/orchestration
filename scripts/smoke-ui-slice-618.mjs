import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionHandoffLabel\(execution\)/);
assert.match(appJs, /handoffs = \['패킷 복사'\]/);
assert.match(appJs, /handoffs\.push\('요청 ID'\)/);
assert.match(appJs, /handoffs\.push\(pathHandoffLabel\)/);
assert.match(appJs, /handoffs\.push\('미리보기', getHarnessExecutionBriefActionLabel\(execution\)\)/);
assert.match(appJs, /handoffs\.push\(getHarnessExecutionBriefCopyActionLabel\(execution\)\)/);
assert.match(appJs, /handoffs\.push\('리포트 복사'\)/);
assert.match(appJs, /data-harness-execution-handoff-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-handoff-summary="true"/);
assert.match(appJs, /<span class="control-overview-register-label">핸드오프<\/span>/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(execution\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHandoffSummary: {
        helper: 'getHarnessExecutionHandoffLabel',
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
