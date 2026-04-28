import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-result`/);
assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-next`/);
assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.result\.action\)\}"/);
assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.next\.action\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.result\.value\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.next\.value\)\}"/);
assert.match(appJs, /\$\{escapeHtml\(resultSurfaceLabel\)\} 보기/);
assert.match(appJs, /\$\{escapeHtml\(targetSurfaceLabel\)\} 열기/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationActionVisibleNames: {
        resultButton: 'visible result label + visible result action text',
        nextButton: 'visible next label + visible next action text',
        context: 'visible target value remains aria-describedby context',
      },
    },
    null,
    2,
  ),
);
