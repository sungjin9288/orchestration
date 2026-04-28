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
assert.match(appJs, /data-harness-execution-mode-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-mode-summary="true"/);
assert.match(appJs, /getHarnessExecutionModeLabel\(visibleHarnessExecutionResult\)/);
assert.match(appJs, /getHarnessExecutionModeLabel\(hiddenHarnessExecutionResult\)/);
assert.match(appJs, /data-harness-execution-packet-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-packet-copy="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionResultModeSummary: {
        helper: 'getHarnessExecutionModeLabel',
        surfaces: ['latest-result', 'hidden-result'],
      },
    },
    null,
    2,
  ),
);
