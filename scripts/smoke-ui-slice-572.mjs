import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const resultSurface = location\.resultSurface \|\| 'deliverables';/);
assert.match(appJs, /const resultSurfaceLabel = getSurfaceDisplayName\(resultSurface\);/);
assert.match(
  appJs,
  /const targetSurfaceLabel = location\.targetSurface[\s\S]*\? getSurfaceDisplayName\(location\.targetSurface\)[\s\S]*: '';/,
);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(resultSurface\)\}"/);
assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-result`/);
assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.result\.action\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.result\.value\)\}"/);
assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-next`/);
assert.match(appJs, /id="\$\{escapeHtml\(locationCellIds\.next\.action\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(location\.targetSurface\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.next\.value\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);
assert.match(appJs, /\$\{escapeHtml\(resultSurfaceLabel\)\}에서 결과 보기/);
assert.match(appJs, /\$\{escapeHtml\(targetSurfaceLabel\)\}에서 다음 처리 열기/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationActionLabels: {
        resultAction: 'visible result cell label + visible action text',
        nextAction: 'visible next cell label + visible action text',
        routeContract: 'existing data-action=open-surface',
      },
    },
    null,
    2,
  ),
);
