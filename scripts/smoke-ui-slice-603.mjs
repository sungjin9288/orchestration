import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /for \(const button of elements\.navButtons\) \{/);
assert.match(appJs, /const isActive = surface === state\.surface;/);
assert.match(appJs, /button\.setAttribute\('aria-controls', `surface-\$\{surface\}`\);/);
assert.match(appJs, /button\.setAttribute\('aria-current', 'page'\);/);
assert.match(appJs, /button\.removeAttribute\('aria-current'\);/);
assert.match(appJs, /button\.setAttribute\('aria-label', `\$\{label\} \$\{count\}건\. \$\{guidance\}`\);/);
assert.match(appJs, /button\.classList\.toggle\('is-active', isActive\);/);
assert.doesNotMatch(appJs, /button\.setAttribute\('aria-current', isActive \? 'page' : 'false'\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceNavCurrentAttribute: {
        activeSurfaceButton: 'renders aria-current=page',
        inactiveSurfaceButtons: 'remove aria-current instead of rendering false',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
