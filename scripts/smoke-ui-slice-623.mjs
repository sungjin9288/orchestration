import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(getHarnessExecutionOutputPathActionLabel\(visibleHarnessExecutionResult\)\)\}"/);
assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(getHarnessExecutionOutputPathActionLabel\(hiddenHarnessExecutionResult\)\)\}"/);
assert.match(appJs, /data-output-path-label="\$\{escapeHtml\(getHarnessExecutionOutputPathActionLabel\(execution\)\)\}"/);
assert.match(appJs, /async function copyHarnessExecutionOutputPath\(outputPath, label = '출력 경로'\)/);
assert.match(appJs, /const outputLabel = label \|\| '출력 경로'/);
assert.match(appJs, /복사할 하네스 \$\{outputLabel\}가 없습니다/);
assert.match(appJs, /하네스 \$\{outputLabel\}를 복사했습니다/);
assert.match(appJs, /actionButton\.dataset\.outputPathLabel/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionOutputPathCopyStatus: {
        labelSource: 'data-output-path-label',
        helper: 'copyHarnessExecutionOutputPath',
      },
    },
    null,
    2,
  ),
);
