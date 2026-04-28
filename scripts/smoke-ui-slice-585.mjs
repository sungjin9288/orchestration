import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /static: `workspace-location-static-\$\{state\.surface\}-next`/);
assert.match(
  appJs,
  /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.value\}`\)\}"\$\{location\.targetSurface \? '' : ` aria-describedby="\$\{escapeHtml\(locationCellIds\.next\.static\)\}"`\}/,
);
assert.match(
  appJs,
  /<span class="workspace-location-static" id="\$\{escapeHtml\(locationCellIds\.next\.static\)\}">결정 후 원래 desk로 돌아갑니다<\/span>/,
);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(`\$\{locationCellIds\.next\.label\} \$\{locationCellIds\.next\.action\}`\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(locationCellIds\.next\.value\)\}"/);
assert.doesNotMatch(appJs, /aria-label="다음 이동:/);
assert.match(appJs, /data-action="open-surface"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspaceLocationStaticFallbackDescription: {
        fallback: 'decision-inbox static return guidance',
        describedBy: 'next-cell static fallback copy',
        actionPath: 'open-surface buttons unchanged when targetSurface exists',
      },
    },
    null,
    2,
  ),
);
