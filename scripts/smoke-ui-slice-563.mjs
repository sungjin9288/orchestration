import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /class="nav-group-tab-label">업무<\/span>/);
assert.match(indexHtml, /class="nav-group-tab-help">목표·실행<\/span>/);
assert.match(indexHtml, /class="nav-group-tab-label">검토<\/span>/);
assert.match(indexHtml, /class="nav-group-tab-help">승인·근거<\/span>/);
assert.match(indexHtml, /class="nav-group-tab-label">운영<\/span>/);
assert.match(indexHtml, /class="nav-group-tab-help">작업판<\/span>/);
assert.match(indexHtml, /role="tablist"/);
assert.match(indexHtml, /data-nav-group-tab="workflows"/);
assert.match(indexHtml, /data-nav-group-tab="review"/);
assert.match(indexHtml, /data-nav-group-tab="ops"/);

assert.match(styles, /\.nav-group-tab \{[\s\S]*display:\s*grid;[\s\S]*place-items:\s*center;/);
assert.match(styles, /\.nav-group-tab-label \{/);
assert.match(styles, /\.nav-group-tab-help \{/);
assert.match(styles, /\.nav-group-tab\.is-active \.nav-group-tab-help \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      navGroupTabHelper: {
        tabs: ['업무:목표·실행', '검토:승인·근거', '운영:작업판'],
        roles: ['tablist', 'tab'],
        cssMarkers: ['nav-group-tab-label', 'nav-group-tab-help'],
      },
    },
    null,
    2,
  ),
);
