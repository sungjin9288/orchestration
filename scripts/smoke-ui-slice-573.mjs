import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /class="workspace-location-strip" role="list" aria-label="현재 위치, 여기서 확인, 결과 확인, 다음 이동"/);
assert.match(appJs, /const locationCellIds = \{/);
assert.match(appJs, /current: \{/);
assert.match(appJs, /label: `workspace-location-label-\$\{state\.surface\}-current`/);
assert.match(appJs, /value: `workspace-location-value-\$\{state\.surface\}-current`/);
assert.match(appJs, /class="workspace-location-cell workspace-location-cell-current" role="listitem" aria-current="location" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.current\.label\} \$\{locationCellIds\.current\.value\}`\)\}"/);
assert.match(appJs, /class="workspace-location-cell" role="listitem" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.check\.label\} \$\{locationCellIds\.check\.value\}`\)\}"/);
assert.match(appJs, /class="workspace-location-cell" role="listitem" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.value\}`\)\}"/);
assert.match(appJs, /class="workspace-location-cell" role="listitem" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.value\}`\)\}"/);
assert.match(appJs, /현재 위치/);
assert.match(appJs, /여기서 확인/);
assert.match(appJs, /결과 확인/);
assert.match(appJs, /다음 이동/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationRegisterSemantics: {
        container: 'role=list',
        cells: 'role=listitem',
        items: ['현재 위치', '여기서 확인', '결과 확인', '다음 이동'],
      },
    },
    null,
    2,
  ),
);
