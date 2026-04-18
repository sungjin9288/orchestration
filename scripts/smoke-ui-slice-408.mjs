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

assert.match(appJs, /data-harness-run-command-desk="true"/);
assert.match(
  appJs,
  /data-harness-run-command-desk="true"[\s\S]*data-harness-run-prep-cluster="true"[\s\S]*data-harness-run-action-shelf="true"/,
);

assert.match(stylesCss, /\.harness-run-command-desk\s*\{/);
assert.match(stylesCss, /\.harness-run-command-desk::before\s*\{/);
assert.match(stylesCss, /\.harness-run-command-desk \.harness-run-prep-cluster,/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunCommandDeskDesign: {
        insertionPoint: 'harnessRunDesk->commandDeskDesign->prepAndActionZone',
        marker: 'data-harness-run-command-desk',
      },
    },
    null,
    2,
  ),
);
