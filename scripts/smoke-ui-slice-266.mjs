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

assert.match(indexHtml, /role="tablist"/);
assert.match(indexHtml, /data-nav-group-tab="workflows"/);
assert.match(indexHtml, /data-nav-group-tab="review"/);
assert.match(indexHtml, /data-nav-group-tab="ops"/);
assert.match(indexHtml, /data-nav-group="workflows"/);
assert.match(indexHtml, /data-nav-group="review" hidden/);
assert.match(indexHtml, /data-nav-group="ops" hidden/);

assert.match(appJs, /const NAV_GROUPS = \{/);
assert.match(appJs, /const SURFACE_TO_NAV_GROUP = Object\.fromEntries/);
assert.match(appJs, /menuGroup: 'workflows'/);
assert.match(appJs, /function getNavGroupForSurface\(surface\)/);
assert.match(appJs, /function getActiveNavGroupId\(\)/);
assert.match(appJs, /function handleNavGroupChange\(groupId\)/);
assert.match(appJs, /const navGroupButton = event\.target\.closest\('\[data-nav-group-tab\]'\);/);
assert.match(appJs, /group\.removeAttribute\('hidden'\);/);
assert.match(appJs, /group\.setAttribute\('hidden', ''\);/);
assert.match(appJs, /state\.menuGroup = getNavGroupForSurface\(surface\);/);

assert.match(styles, /\.nav-group-tabs \{/);
assert.match(styles, /\.nav-group-tab \{/);
assert.match(styles, /\.nav-group-tab\.is-active \{/);
assert.match(styles, /\.nav-group \{/);
assert.match(styles, /\.nav-group\.is-active \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      groupedNavigation: {
        tabs: ['workflows', 'review', 'ops'],
        defaultGroup: 'workflows',
        behavior: ['single group visible', 'surface sync', 'qa-clickable nav'],
      },
    },
    null,
    2,
  ),
);
