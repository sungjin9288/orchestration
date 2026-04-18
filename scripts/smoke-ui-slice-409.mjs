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

assert.match(appJs, /data-harness-run-helper-cluster="true"/);
assert.match(
  appJs,
  /data-harness-run-helper-cluster="true"[\s\S]*data-harness-run-command-desk="true"[\s\S]*data-harness-run-path-guidance="true"/,
);

assert.match(stylesCss, /\.harness-run-helper-cluster\s*\{/);
assert.match(stylesCss, /\.harness-run-helper-cluster::before\s*\{/);
assert.match(stylesCss, /\.harness-run-helper-cluster \.harness-run-command-desk,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunHelperClusterDesign: {
        insertionPoint: 'harnessRunDesk->helperClusterDesign->commandZoneAndPolicyNote',
        marker: 'data-harness-run-helper-cluster',
      },
    },
    null,
    2,
  ),
);
