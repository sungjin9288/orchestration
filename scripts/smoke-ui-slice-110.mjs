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

assert.match(appJs, /class="task-create-form task-create-form-compact mission-order-desk"/);
assert.match(appJs, /class="task-create-form task-create-form-compact taskboard-order-desk"/);
assert.match(appJs, /class="secondary-button viewport-handoff-button"/);

assert.match(styles, /--surface-control-border:/);
assert.match(styles, /\.surface\[data-surface\] \.surface-entry-frame \.secondary-button,/);
assert.match(styles, /\.surface\[data-surface\] \.mission-order-desk,/);
assert.match(styles, /\.surface\[data-surface\] \.mission-order-desk \.field-label,/);
assert.match(styles, /\.surface\[data-surface\] \.mission-order-desk \.field input:focus-visible,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceControlAccent: {
        selectors: [
          'surface-entry-frame .secondary-button',
          'mission-order-desk',
          'taskboard-order-desk',
          'field input:focus-visible',
        ],
      },
    },
    null,
    2,
  ),
);
