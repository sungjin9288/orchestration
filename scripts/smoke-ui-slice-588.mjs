import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.result\.action\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.result\.value\)\}"/);
assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.next\.action\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.next\.value\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(location\.targetSurface\)\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationActionDescriptions: {
        resultButton: 'visible result label/action naming + visible result value context',
        nextButton: 'visible next label/action naming + visible next value context',
        actionPath: 'open-surface unchanged',
      },
    },
    null,
    2,
  ),
);
