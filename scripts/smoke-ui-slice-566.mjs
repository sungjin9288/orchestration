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
  ['mission', '미션'],
  ['council', '협의회'],
  ['execution', '실행'],
  ['deliverables', '산출물'],
  ['taskboard', '작업판'],
  ['logs', '로그'],
  ['artifacts', '아티팩트'],
  ['decision-inbox', '결정함'],
];

for (const [surface, label] of surfaces) {
  assert.match(
    indexHtml,
    new RegExp(
      `id="surface-${surface}"[\\s\\S]*data-surface="${surface}"[\\s\\S]*aria-label="${label}"[\\s\\S]*aria-hidden="(true|false)"[\\s\\S]*tabindex="(0|-1)"`,
    ),
  );
}

assert.match(indexHtml, /id="surface-mission"[\s\S]*aria-hidden="false"[\s\S]*tabindex="0"/);
assert.match(indexHtml, /id="surface-council"[\s\S]*aria-hidden="true"[\s\S]*tabindex="-1"/);
assert.match(indexHtml, /id="surface-decision-inbox"[\s\S]*aria-hidden="true"[\s\S]*tabindex="-1"/);

assert.match(appJs, /const isActive = surfaceId === state\.surface;/);
assert.match(appJs, /surface\.classList\.toggle\('is-active', isActive\);/);
assert.match(appJs, /surface\.setAttribute\('aria-hidden', isActive \? 'false' : 'true'\);/);
assert.match(appJs, /surface\.setAttribute\('tabindex', isActive \? '0' : '-1'\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfacePanelAccessibility: {
        activeInitialSurface: 'mission',
        contracts: ['aria-hidden', 'tabindex', 'render synchronization'],
        surfaces: surfaces.map(([surface]) => surface),
      },
    },
    null,
    2,
  ),
);
