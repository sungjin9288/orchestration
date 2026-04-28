import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const isCurrentSurface = member\.surface === state\.surface;/);
assert.match(appJs, /class="company-directory-row \$\{isActiveGroup \? 'is-current-group' : ''\} \$\{isCurrentSurface \? 'is-current-surface' : ''\}"/);
assert.match(appJs, /data-action="open-company-seat"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(member\.surface\)\}"/);
assert.match(appJs, /\$\{isCurrentSurface \? 'aria-current="true"' : ''\}/);
assert.match(appJs, /data-selection-state="\$\{isCurrentSurface \? 'active' : isActiveGroup \? 'group' : 'idle'\}"/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentSurface \? 'true' : 'false'\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      companyDirectoryRowCurrentAttribute: {
        currentSurfaceRow: 'renders aria-current=true',
        groupOrIdleRows: 'omit aria-current instead of rendering false',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
