import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(
  appJs,
  /<article class="workspace-location-cell workspace-location-cell-current" role="listitem" aria-current="location" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.current\.label\} \$\{locationCellIds\.current\.value\}`\)\}" aria-describedby="\$\{escapeHtml\(locationCellIds\.current\.note\)\}">/,
);
assert.match(appJs, /<span class="workspace-location-label" id="\$\{escapeHtml\(locationCellIds\.current\.label\)\}">현재 위치<\/span>/);
assert.match(appJs, /<strong class="workspace-location-value" id="\$\{escapeHtml\(locationCellIds\.current\.value\)\}">\$\{escapeHtml\(activeSurfaceLabel\)\}<\/strong>/);
assert.match(appJs, /note: `workspace-location-note-\$\{state\.surface\}-current`,/);
assert.match(appJs, /<span class="workspace-location-current-note" id="\$\{escapeHtml\(locationCellIds\.current\.note\)\}">지금 보고 있음<\/span>/);
assert.match(appJs, /class="workspace-location-cell workspace-location-cell-current"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationCurrentCell: {
        semanticMarker: 'aria-current=location',
        visualMarker: 'workspace-location-cell-current',
        labelledBy: 'visible current label + active surface label',
        describedBy: 'visible current viewing note',
      },
    },
    null,
    2,
  ),
);
