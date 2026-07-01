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
assert.match(appJs, /const visibleHarnessPreviewText =\s+visibleHarnessExecutionResult\?\.outputPreview \|\| visibleHarnessExecutionResult\?\.stdoutPreview \|\| '';/);
assert.match(appJs, /const hiddenHarnessPreviewText =\s+hiddenHarnessExecutionResult\?\.outputPreview \|\| hiddenHarnessExecutionResult\?\.stdoutPreview \|\| '';/);
assert.match(appJs, /const historyHarnessPreviewText = execution\.outputPreview \|\| execution\.stdoutPreview \|\| '';/);
assert.match(appJs, /data-harness-execution-preview="true">\$\{escapeHtml\(visibleHarnessPreviewText\)\}<\/pre>/);
assert.match(appJs, /data-preview-text="\$\{escapeHtml\(historyHarnessPreviewText\)\}"/);
assert.match(appJs, /copyHarnessExecutionPreview\(actionButton\.dataset\.previewText\)/);
assert.match(appJs, /하네스 실행 미리보기를 복사했습니다/);
assert.match(appJs, />\s*미리보기\s*</);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessPreviewCopyCoverage: {
        action: 'copy-harness-execution-preview',
        surfaces: ['latest-result', 'hidden-result', 'recent-history'],
      },
    },
    null,
    2,
  ),
);
