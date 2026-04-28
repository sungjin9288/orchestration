import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function getHarnessExecutionOutputPathActionLabel\(execution\)/);
assert.match(appJs, /execution\?\.actionMode === 'policy-report' \? '출력 예정 경로' : '출력 경로'/);
assert.match(appJs, /getHarnessExecutionOutputPathActionLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionOutputPathActionLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionOutputPathActionLabel\(execution\)/);
assert.match(appJs, /data-action="copy-harness-output-path"/);
assert.match(appJs, /data-harness-output-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-output-copy="true"/);
assert.match(appJs, /출력 예정 경로/);

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
