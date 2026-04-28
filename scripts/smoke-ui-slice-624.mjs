import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionPathHandoffLabel\(execution\)/);
assert.match(appJs, /const hasInputPath = Boolean\(execution\?\.resolvedInputPath \|\| execution\?\.inputPath\)/);
assert.match(appJs, /const hasOutputPath = Boolean\(execution\?\.resolvedOutputPath \|\| execution\?\.outputPath\)/);
assert.match(appJs, /return `입력\/\$\{getHarnessExecutionOutputPathActionLabel\(execution\)\}`/);
assert.match(appJs, /return '입력 경로'/);
assert.match(appJs, /return getHarnessExecutionOutputPathActionLabel\(execution\)/);
assert.match(appJs, /const pathHandoffLabel = getHarnessExecutionPathHandoffLabel\(execution\)/);
assert.match(appJs, /handoffs\.push\(pathHandoffLabel\)/);
assert.doesNotMatch(appJs, /handoffs\.push\('경로'\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffLabel\(execution\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionPathHandoffLabel: {
        helper: 'getHarnessExecutionPathHandoffLabel',
        labels: ['입력/출력 예정 경로', '입력/출력 경로', '입력 경로'],
      },
    },
    null,
    2,
  ),
);
