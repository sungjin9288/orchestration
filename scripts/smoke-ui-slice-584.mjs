import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const locationCellIds = \{/);
assert.match(appJs, /label: `workspace-location-label-\$\{state\.surface\}-current`/);
assert.match(appJs, /value: `workspace-location-value-\$\{state\.surface\}-current`/);
assert.match(appJs, /label: `workspace-location-label-\$\{state\.surface\}-check`/);
assert.match(appJs, /value: `workspace-location-value-\$\{state\.surface\}-check`/);
assert.match(appJs, /label: `workspace-location-label-\$\{state\.surface\}-result`/);
assert.match(appJs, /value: `workspace-location-value-\$\{state\.surface\}-result`/);
assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-result`/);
assert.match(appJs, /label: `workspace-location-label-\$\{state\.surface\}-next`/);
assert.match(appJs, /value: `workspace-location-value-\$\{state\.surface\}-next`/);
assert.match(appJs, /action: `workspace-location-action-\$\{state\.surface\}-next`/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.current\.label\} \$\{locationCellIds\.current\.value\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.check\.label\} \$\{locationCellIds\.check\.value\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.value\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.value\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.result\.label\} \$\{locationCellIds\.result\.action\}`\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.doesNotMatch(appJs, /aria-label="결과 확인:/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);
assert.match(appJs, /data-action="open-surface"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationCellLabels: {
        labelledBy: 'visible cell label + visible cell value',
        actions: 'visible cell label + visible action text on existing open-surface buttons',
        scope: 'workspace location register listitems',
      },
    },
    null,
    2,
  ),
);
