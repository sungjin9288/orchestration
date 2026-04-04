import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /id="surface-focus-strip"/);

assert.match(appJs, /function renderSurfaceFocusStrip\(data\)/);
assert.match(appJs, /label: '현재 도크'/);
assert.match(appJs, /label: '현재 포커스'/);
assert.match(appJs, /label: '지금 체크'/);
assert.match(appJs, /결정함 먼저 열기/);
assert.match(appJs, /도크:.*Surface|도크:\$\{metadata\.kicker/);

assert.match(styles, /\.surface-focus-strip \{/);
assert.match(styles, /\.surface-focus-grid \{/);
assert.match(styles, /\.surface-focus-card \{/);
assert.match(styles, /\.surface-focus-card-emphasis \{/);
assert.match(styles, /\.surface-focus-button \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeSurfaceFocus: {
        strip: 'surface-focus-strip',
        cards: ['현재 도크', '현재 포커스', '지금 체크'],
        gateAction: '결정함 먼저 열기',
      },
    },
    null,
    2,
  ),
);
