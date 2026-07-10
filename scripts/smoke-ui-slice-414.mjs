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

assert.match(appJs, /data-harness-execution-history-action-shelf="true"/);
assert.match(
  appJs,
  /const historyHarnessActionShelfFrameMarkup = `[\s\S]*?data-harness-execution-history-action-shelf="true"[\s\S]*?<div class="form-actions form-actions-inline form-actions-compact">[\s\S]*?\$\{historyHarnessActionShelfMarkup\}/,
);
assert.match(
  appJs,
  /const historyHarnessItemRegisterMarkup = `[\s\S]*?\$\{historyHarnessActionShelfFrameMarkup\}/,
);

assert.match(stylesCss, /\.harness-execution-history-action-shelf\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-action-shelf\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 10px 18px rgba\(20,\s*34,\s*42,\s*0\.05\);/s,
);
assert.match(stylesCss, /\.harness-execution-history-action-shelf::before\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-action-shelf \.form-actions-compact\s*\{[\s\S]*margin-top:\s*0;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryActionShelfDesign: {
        insertionPoint: 'harnessRunDesk->historyActionShelfDesign->historyRowControls',
        marker: 'data-harness-execution-history-action-shelf',
      },
    },
    null,
    2,
  ),
);
