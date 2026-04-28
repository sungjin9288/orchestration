import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');

const surfaces = [
  'mission',
  'council',
  'execution',
  'deliverables',
  'decision-inbox',
  'artifacts',
  'logs',
  'taskboard',
];

for (const surface of surfaces) {
  assert.match(
    indexHtml,
    new RegExp(`data-surface="${surface}"[\\s\\S]*aria-controls="surface-${surface}"`),
  );
  assert.match(indexHtml, new RegExp(`id="surface-${surface}"`));
}

assert.match(appJs, /button\.setAttribute\('aria-controls', `surface-\$\{surface\}`\);/);
assert.match(appJs, /button\.setAttribute\('aria-current', 'page'\);/);
assert.match(appJs, /button\.removeAttribute\('aria-current'\);/);
assert.doesNotMatch(appJs, /button\.setAttribute\('aria-current', isActive \? 'page' : 'false'\);/);
assert.match(appJs, /button\.setAttribute\('aria-label', `\$\{label\} \$\{count\}건\. \$\{guidance\}`\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceNavControlOwnership: {
        surfaces,
        contracts: ['nav button aria-controls', 'surface id target', 'render synchronization'],
      },
    },
    null,
    2,
  ),
);
