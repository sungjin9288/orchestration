import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-surface="\$\{escapeHtml\(surface\)\}"/);
assert.match(appJs, /surface-focus-card-\$\{card\.kind\}/);
assert.match(appJs, /kind: 'dock'/);
assert.match(appJs, /kind: 'focus'/);
assert.match(appJs, /kind: 'check'/);

assert.match(styles, /\.surface-focus-grid\[data-surface="mission"\] \{/);
assert.match(styles, /\.surface-focus-grid\[data-surface="decision-inbox"\] \{/);
assert.match(styles, /\.surface-focus-card::before \{/);
assert.match(styles, /\.surface-focus-card::after \{/);
assert.match(styles, /\.nav-button::before \{/);
assert.match(styles, /\.nav-button\.is-active\[data-surface="logs"\] \{/);
assert.match(styles, /\.nav-button\.is-active\[data-surface="decision-inbox"\] \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeToneVariation: {
        focusThemes: ['mission', 'council', 'execution', 'deliverables', 'taskboard', 'logs', 'artifacts', 'decision-inbox'],
        accentCarriers: ['surface-focus-card::before', 'nav-button::before'],
      },
    },
    null,
    2,
  ),
);
