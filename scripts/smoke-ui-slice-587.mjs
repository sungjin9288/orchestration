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
assert.match(appJs, />현재 위치<\/span>/);
assert.match(appJs, />여기서 확인<\/span>/);
assert.match(appJs, />결과 확인<\/span>/);
assert.match(appJs, />다음 이동<\/span>/);
assert.match(appJs, /role="listitem" aria-current="location"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationContainerLabel: {
        container: 'role=list',
        label: '현재 위치, 여기서 확인, 결과 확인, 다음 이동',
        cells: ['현재 위치', '여기서 확인', '결과 확인', '다음 이동'],
      },
    },
    null,
    2,
  ),
);
