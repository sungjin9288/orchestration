import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfig = fs.readFileSync(surfaceConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /<title>Orchestration 1\.0 Workflow Control<\/title>/);
assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /data-nav-group-tab="workflows"/);
assert.match(indexHtml, /data-nav-group-tab="review"/);
assert.match(indexHtml, /data-nav-group-tab="ops"/);
assert.match(indexHtml, /data-nav-group="workflows"/);
assert.match(indexHtml, /data-nav-group="review"/);
assert.match(indexHtml, /data-nav-group="ops"/);
assert.match(indexHtml, /WORK/);
assert.match(indexHtml, /Workflow desk/);
assert.doesNotMatch(indexHtml, /shell-command-strip/);
assert.doesNotMatch(indexHtml, /Company ERP Desk/);
assert.doesNotMatch(indexHtml, /Operations Control Plane/);

assert.match(appJs, /class="nav-button-main"/);
assert.match(appJs, /class="nav-button-count"/);
assert.match(appJs, /from '\.\/surface-config\.js'/);
assert.match(surfaceConfig, /export const NAV_GROUPS = \{/);
assert.match(appJs, /function handleNavGroupChange\(groupId\)/);
assert.match(appJs, /button\.setAttribute\('aria-current', 'page'\);/);
assert.match(appJs, /button\.removeAttribute\('aria-current'\);/);
assert.doesNotMatch(appJs, /button\.setAttribute\('aria-current', isActive \? 'page' : 'false'\);/);
assert.doesNotMatch(appJs, /nav-button-kicker/);
assert.doesNotMatch(appJs, /nav-button-meta/);

assert.match(styles, /\.nav-group-tabs \{/);
assert.match(styles, /\.nav-group-tab \{/);
assert.match(styles, /\.nav-group\.is-active \{/);
assert.match(styles, /\.nav-button-main \{/);
assert.match(styles, /\.nav-button\.is-active \{/);
assert.doesNotMatch(styles, /\.nav-button::before \{/);
assert.doesNotMatch(styles, /\.nav-button-kicker \{/);
assert.doesNotMatch(styles, /\.nav-button-meta \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workflowMenuReset: {
        brand: ['Orchestration', 'Workflow Control', 'Workflow desk'],
        groups: ['업무', '검토', '운영'],
        groupTabs: ['workflows', 'review', 'ops'],
        navMarkup: ['nav-button-main', 'nav-button-title', 'nav-button-count'],
      },
    },
    null,
    2,
  ),
);
