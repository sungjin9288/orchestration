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
assert.match(appJs, /visibleHarnessOutputPath[\s\S]*표준 출력 전용/);
assert.match(appJs, /hiddenHarnessOutputPath[\s\S]*표준 출력 전용/);
assert.match(appJs, /const visibleHarnessOutputLabel = getHarnessExecutionOutputLabel\(visibleHarnessExecutionResult\);/);
assert.match(appJs, /const hiddenHarnessOutputLabel = getHarnessExecutionOutputLabel\(hiddenHarnessExecutionResult\);/);
assert.match(appJs, /const visibleHarnessOutputSummaryValue = visibleHarnessOutputPath \|\| '표준 출력 전용';/);
assert.match(appJs, /const hiddenHarnessOutputSummaryValue = hiddenHarnessOutputPath \|\| '표준 출력 전용';/);
assert.match(appJs, /visibleHarnessOutputLabel[\s\S]*표준 출력 전용/);
assert.match(appJs, /hiddenHarnessOutputLabel[\s\S]*표준 출력 전용/);
assert.match(appJs, /const visibleHarnessOutputSummaryMarkup = `<p class="detail-copy detail-copy-compact" data-harness-execution-output-summary="true">\$\{escapeHtml\(visibleHarnessOutputLabel\)\}: <code>\$\{escapeHtml\(visibleHarnessOutputSummaryValue\)\}<\/code><\/p>`;/);
assert.match(appJs, /\$\{visibleHarnessOutputSummaryMarkup\}/);
assert.match(appJs, /data-harness-result-hidden-output-summary="true"[^`]*\$\{escapeHtml\(hiddenHarnessOutputSummaryValue\)\}/);
assert.doesNotMatch(
  appJs,
  /data-harness-execution-result="true"[\s\S]*?<p class="detail-copy detail-copy-compact" data-harness-execution-output-summary="true">\$\{escapeHtml\(visibleHarnessOutputLabel\)\}: <code>\$\{escapeHtml\(visibleHarnessOutputSummaryValue\)\}<\/code><\/p>/,
);
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
