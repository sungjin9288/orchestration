import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(visibleHarnessOutputPathActionLabel\)\}"/);
assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(hiddenHarnessOutputPathActionLabel\)\}"/);
assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(historyHarnessOutputPathActionLabel\)\}"/);
assert.match(appJs, /const canRenderVisibleHarnessOutputPathCopy = Boolean\(visibleHarnessOutputPath\);/);
assert.match(appJs, /canRenderVisibleHarnessOutputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/);
assert.doesNotMatch(appJs, /\$\{\s*visibleHarnessOutputPath\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/);
assert.match(appJs, /const canRenderHistoryHarnessOutputPathCopy = Boolean\(historyHarnessOutputPath\);/);
assert.match(appJs, /canRenderHistoryHarnessOutputPathCopy\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/);
assert.doesNotMatch(appJs, /\$\{\s*historyHarnessOutputPath\s+\?\s+`\s+<button[\s\S]*?data-action="copy-harness-output-path"/);
assert.match(appJs, /async function copyHarnessExecutionOutputPath\(outputPath, label = '출력 경로'\)/);
assert.match(appJs, /const outputLabel = label \|\| '출력 경로'/);
assert.match(appJs, /const emptyOutputPathCopyMessage = `복사할 하네스 \$\{outputLabel\}가 없습니다\.`;/);
assert.match(appJs, /const copiedOutputPathMessage = \(value\) => `하네스 \$\{outputLabel\}를 복사했습니다: \$\{value\}`;/);
assert.match(appJs, /const unsupportedOutputPathCopyMessage = \(value\) =>\s+`클립보드 미지원 환경입니다\. \$\{outputLabel\}를 직접 확인하세요: \$\{value\}`;/);
assert.match(appJs, /emptyErrorMessage: emptyOutputPathCopyMessage/);
assert.match(appJs, /copiedMessage: copiedOutputPathMessage/);
assert.match(appJs, /unsupportedMessage: unsupportedOutputPathCopyMessage/);
assert.doesNotMatch(appJs, /copiedMessage: \(value\) => `하네스 \$\{outputLabel\}를 복사했습니다: \$\{value\}`/);
assert.match(appJs, /actionButton\.dataset\.outputPathLabel/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionOutputPathCopyStatus: {
        labelSource: 'data-output-path-label',
        helper: 'copyHarnessExecutionOutputPath',
        namedValues: [
          'canRenderVisibleHarnessOutputPathCopy',
          'canRenderHistoryHarnessOutputPathCopy',
        ],
      },
    },
    null,
    2,
  ),
);
