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

assert.match(harnessLabels, /export function getHarnessExecutionOutputLabel\(execution\) \{/);
assert.match(harnessLabels, /execution\?\.actionMode === 'policy-report' \? '출력 예정' : '출력'/);
assert.match(appJs, /\$\{getHarnessExecutionOutputLabel\(execution\)\}: \$\{outputPath\}/);
assert.match(appJs, /getHarnessExecutionOutputLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionOutputLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionOutputLabel\(execution\)/);
assert.match(appJs, /data-harness-execution-output-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-output-summary="true"/);
assert.match(appJs, /표준 출력 전용/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionOutputLabel: {
        helper: 'getHarnessExecutionOutputLabel',
        labels: ['출력 예정', '출력'],
        surfaces: ['latest-result', 'hidden-result', 'recent-history', 'packet-copy'],
      },
    },
    null,
    2,
  ),
);
