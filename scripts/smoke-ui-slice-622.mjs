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

assert.match(harnessLabels, /export function getHarnessExecutionOutputPathActionLabel\(execution\) \{/);
assert.match(harnessLabels, /outputPathAction:\s*\{\s*policyReport: '출력 예정 경로',\s*execution: '출력 경로',\s*\}/);
assert.match(harnessLabels, /return getHarnessExecutionLabel\(execution, 'outputPathAction'\);/);
assert.match(
  appJs,
  /const visibleHarnessOutputPathActionLabel = getHarnessExecutionOutputPathActionLabel\(\s*visibleHarnessExecutionResult,\s*\);/,
);
assert.match(
  appJs,
  /const hiddenHarnessOutputPathActionLabel = getHarnessExecutionOutputPathActionLabel\(\s*hiddenHarnessExecutionResult,\s*\);/,
);
assert.match(
  appJs,
  /const historyHarnessOutputPathActionLabel =\s+getHarnessExecutionOutputPathActionLabel\(execution\);/,
);
assert.match(appJs, /data-action="copy-harness-output-path"/);
assert.match(appJs, /data-harness-output-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-output-copy="true"/);
assert.match(harnessLabels, /출력 예정 경로/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionOutputPathActionLabel: {
        helper: 'getHarnessExecutionOutputPathActionLabel',
        labels: ['출력 예정 경로', '출력 경로'],
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
