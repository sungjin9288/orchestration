import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

const groups = [
  ['workflows', '업무'],
  ['review', '검토'],
  ['ops', '운영'],
];

for (const [groupId] of groups) {
  assert.match(indexHtml, new RegExp(`id="nav-group-tab-${groupId}"[\\s\\S]*aria-controls="nav-group-${groupId}"`));
  assert.match(
    indexHtml,
    new RegExp(
      `id="nav-group-${groupId}"[\\s\\S]*data-nav-group="${groupId}"[\\s\\S]*role="tabpanel"[\\s\\S]*aria-labelledby="nav-group-tab-${groupId}"`,
    ),
  );
}

assert.match(indexHtml, /id="nav-group-workflows"[\s\S]*aria-hidden="false"[\s\S]*tabindex="0"/);
assert.match(indexHtml, /id="nav-group-review"[\s\S]*aria-hidden="true"[\s\S]*tabindex="-1"[\s\S]*hidden/);
assert.match(indexHtml, /id="nav-group-ops"[\s\S]*aria-hidden="true"[\s\S]*tabindex="-1"[\s\S]*hidden/);

assert.match(appJs, /tab\.setAttribute\('tabindex', isActive \? '0' : '-1'\);/);
assert.match(appJs, /group\.setAttribute\('aria-hidden', isActive \? 'false' : 'true'\);/);
assert.match(appJs, /group\.setAttribute\('tabindex', isActive \? '0' : '-1'\);/);
assert.match(styles, /\.nav-group:focus-visible \{[\s\S]*outline:\s*2px solid rgba\(37, 99, 235, 0\.18\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      sidebarTabpanelAccessibility: {
        groups: groups.map(([groupId, label]) => `${groupId}:${label}`),
        contracts: ['aria-controls', 'role=tabpanel', 'aria-labelledby', 'aria-hidden', 'tabindex'],
      },
    },
    null,
    2,
  ),
);
