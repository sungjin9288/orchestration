import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /data-harness-run-field-rack="true"/);
assert.match(appJs, /class="field-grid field-grid-compact harness-run-field-rack"/);
assert.match(appJs, /class="field field-compact"/);

assert.match(stylesCss, /\.harness-run-field-rack\s*\{/);
assert.match(stylesCss, /\.harness-run-field-rack::before\s*\{/);
assert.match(stylesCss, /\.harness-run-field-rack \.field-label\s*\{/);
assert.match(stylesCss, /\.harness-run-field-rack \.field input\s*\{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunFieldRackDesign: {
        insertionPoint: 'harnessRunForm->fieldRackDesign->inputCluster',
        marker: 'data-harness-run-field-rack',
      },
    },
    null,
    2,
  ),
);
