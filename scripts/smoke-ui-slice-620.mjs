import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-execution-output-summary="true"/);
assert.match(appJs, /data-harness-result-hidden-output-summary="true"/);
assert.match(appJs, /visibleHarnessExecutionResult\.resolvedOutputPath[\s\S]*표준 출력 전용/);
assert.match(appJs, /hiddenHarnessExecutionResult\.resolvedOutputPath[\s\S]*표준 출력 전용/);
assert.match(appJs, /getHarnessExecutionOutputLabel\(visibleHarnessExecutionResult\)[\s\S]*표준 출력 전용/);
assert.match(appJs, /getHarnessExecutionOutputLabel\(hiddenHarnessExecutionResult\)[\s\S]*표준 출력 전용/);
assert.match(appJs, /data-harness-execution-preview="true"/);
assert.match(appJs, /data-harness-result-hidden-preview="true"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionStdoutOutputFallback: {
        surfaces: ['latest-result', 'hidden-result'],
        fallback: '표준 출력 전용',
      },
    },
    null,
    2,
  ),
);
