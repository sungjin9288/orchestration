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

assert.match(appJs, /data-harness-execution-history-item-packet="true"/);
assert.match(
  appJs,
  /const historyHarnessItemRegisterMarkup = `[\s\S]*?<div class="control-overview-register control-overview-register-compact" data-harness-execution-history-item="true">/,
);
assert.match(
  appJs,
  /const historyHarnessItemPacketMarkup = `[\s\S]*?data-harness-execution-history-item-packet="true"[\s\S]*?\$\{historyHarnessItemRegisterMarkup\}/,
);

assert.match(stylesCss, /\.harness-execution-history-item-packet\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-item-packet\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 12px 22px rgba\(20,\s*34,\s*42,\s*0\.06\);/s,
);
assert.match(stylesCss, /\.harness-execution-history-item-packet::before\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-item-packet \.control-overview-register\s*\{[\s\S]*padding:\s*0;[\s\S]*background:\s*transparent;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryRowPacketDesign: {
        insertionPoint: 'harnessRunDesk->historyRowPacketDesign->historyRowSurface',
        marker: 'data-harness-execution-history-item-packet',
      },
    },
    null,
    2,
  ),
);
