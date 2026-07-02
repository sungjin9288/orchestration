import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-harness-preview-copy="true"/);
assert.match(appJs, /data-harness-result-hidden-preview-copy="true"/);
assert.match(appJs, /data-harness-history-preview-copy="true"/);
assert.match(appJs, /data-action="copy-harness-execution-preview"/);
assert.match(appJs, /function getHarnessExecutionPreviewText\(execution\) \{/);
assert.match(appJs, /return execution\?\.outputPreview \|\| execution\?\.stdoutPreview \|\| '';/);
assert.match(
  appJs,
  /const visibleHarnessPreviewText =\s+getHarnessExecutionPreviewText\(visibleHarnessExecutionResult\);/,
);
assert.match(
  appJs,
  /const hiddenHarnessPreviewText =\s+getHarnessExecutionPreviewText\(hiddenHarnessExecutionResult\);/,
);
assert.match(appJs, /const historyHarnessPreviewText = getHarnessExecutionPreviewText\(execution\);/);
assert.doesNotMatch(
  appJs,
  /const visibleHarnessPreviewText =\s+visibleHarnessExecutionResult\?\.outputPreview \|\| visibleHarnessExecutionResult\?\.stdoutPreview \|\| '';/,
);
assert.doesNotMatch(
  appJs,
  /const hiddenHarnessPreviewText =\s+hiddenHarnessExecutionResult\?\.outputPreview \|\| hiddenHarnessExecutionResult\?\.stdoutPreview \|\| '';/,
);
assert.doesNotMatch(appJs, /const historyHarnessPreviewText = execution\.outputPreview \|\| execution\.stdoutPreview \|\| '';/);
assert.match(appJs, /const canRenderVisibleHarnessPreview = Boolean\(visibleHarnessPreviewText\);/);
assert.match(appJs, /canRenderVisibleHarnessPreview\s+\?\s+`<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">/);
assert.match(appJs, /data-harness-execution-preview="true">\$\{escapeHtml\(visibleHarnessPreviewText\)\}<\/pre>/);
assert.match(appJs, /const canRenderHistoryHarnessPreview = Boolean\(historyHarnessPreviewText\);/);
assert.match(appJs, /canRenderHistoryHarnessPreview\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"/);
assert.doesNotMatch(appJs, /\$\{\s*historyHarnessPreviewText\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-execution-preview"/);
assert.match(appJs, /data-preview-text="\$\{escapeHtml\(historyHarnessPreviewText\)\}"/);
assert.match(appJs, /copyHarnessExecutionPreview\(actionButton\.dataset\.previewText\)/);
assert.match(appJs, /하네스 실행 미리보기를 복사했습니다/);
assert.match(appJs, />\s*미리보기\s*</);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessPreviewText\s+\?\s+`<pre class="log-viewer log-viewer-compact" data-harness-execution-preview="true">/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPreviewCopyCoverage: {
        action: 'copy-harness-execution-preview',
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
        namedValues: [
          'visibleHarnessPreviewText',
          'canRenderVisibleHarnessPreview',
          'canRenderHistoryHarnessPreview',
        ],
      },
    },
    null,
    2,
  ),
);
