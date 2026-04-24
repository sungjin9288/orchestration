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

assert.match(appJs, /data-harness-run-prep-cluster="true"/);
assert.match(
  appJs,
  /data-harness-run-prep-cluster="true"[\s\S]*data-harness-run-template-note="true"[\s\S]*data-harness-run-field-rack="true"/,
);

assert.match(stylesCss, /\.harness-run-prep-cluster\s*\{/);
assert.match(stylesCss, /\.harness-run-prep-cluster::before\s*\{/);
assert.match(stylesCss, /\.harness-run-prep-cluster \.harness-run-template-note,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunPrepClusterDesign: {
        insertionPoint: 'harnessRunDesk->prepClusterDesign->templateAndInputZone',
        marker: 'data-harness-run-prep-cluster',
      },
    },
    null,
    2,
  ),
);
