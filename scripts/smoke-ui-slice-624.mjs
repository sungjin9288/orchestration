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

assert.match(harnessLabels, /export function getHarnessExecutionPathHandoffLabel\(execution\) \{/);
assert.match(harnessLabels, /const hasInputPath = Boolean\(execution\?\.resolvedInputPath \|\| execution\?\.inputPath\)/);
assert.match(harnessLabels, /const hasOutputPath = Boolean\(execution\?\.resolvedOutputPath \|\| execution\?\.outputPath\)/);
assert.match(harnessLabels, /return `입력\/\$\{getHarnessExecutionOutputPathActionLabel\(execution\)\}`/);
assert.match(harnessLabels, /return '입력 경로'/);
assert.match(harnessLabels, /return getHarnessExecutionOutputPathActionLabel\(execution\)/);
assert.match(harnessLabels, /export function getHarnessExecutionHandoffLabel\(execution, context = \{\}\) \{/);
assert.match(harnessLabels, /const pathHandoffLabel = getHarnessExecutionPathHandoffLabel\(execution\)/);
assert.match(harnessLabels, /handoffs\.push\(pathHandoffLabel\)/);
assert.doesNotMatch(appJs, /handoffs\.push\('경로'\)/);
assert.match(appJs, /getHarnessExecutionHandoffText\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffText\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionHandoffText\(execution\)/);

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
