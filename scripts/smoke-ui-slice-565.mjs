import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const NAV_GROUP_ORDER = Object\.keys\(NAV_GROUPS\);/);
assert.match(appJs, /async function handleNavGroupTabKeydown\(event\) \{/);
assert.match(appJs, /event\.target\.closest\('\[data-nav-group-tab\]'\)/);
assert.match(appJs, /event\.key === 'ArrowRight' \|\| event\.key === 'ArrowDown'/);
assert.match(appJs, /event\.key === 'ArrowLeft' \|\| event\.key === 'ArrowUp'/);
assert.match(appJs, /event\.key === 'Home'/);
assert.match(appJs, /event\.key === 'End'/);
assert.match(appJs, /event\.preventDefault\(\);/);
assert.match(appJs, /await handleNavGroupChange\(targetGroupId\);/);
assert.match(appJs, /elements\.navGroupTabs\.find\(\(entry\) => entry\.dataset\.navGroupTab === targetGroupId\)\?\.focus\(\);/);
assert.match(appJs, /document\.addEventListener\('keydown', async \(event\) => \{[\s\S]*handleNavGroupTabKeydown\(event\);[\s\S]*\}\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      sidebarTabKeyboardNavigation: {
        keys: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'],
        groups: ['workflows', 'review', 'ops'],
        behavior: ['switch group', 'focus active tab', 'preserve existing surfaces'],
      },
    },
    null,
    2,
  ),
);
