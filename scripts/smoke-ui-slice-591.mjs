import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /note: `workspace-location-note-\$\{state\.surface\}-current`,/);
assert.match(
  appJs,
  /aria-current="location" aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.current\.label\} \$\{locationCellIds\.current\.value\}`\)\}" aria-describedby="\$\{escapeHtml\(locationCellIds\.current\.note\)\}"/,
);
assert.match(
  appJs,
  /<span class="workspace-location-current-note" id="\$\{escapeHtml\(locationCellIds\.current\.note\)\}">지금 보고 있음<\/span>/,
);
assert.match(stylesCss, /\.workspace-location-current-note \{/);
assert.match(stylesCss, /background:\s*rgba\(37, 99, 235, 0\.11\);/);
assert.match(stylesCss, /font-weight:\s*800;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationCurrentViewingNote: {
        visibleCopy: '지금 보고 있음',
        describedBy: 'current location cell',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
