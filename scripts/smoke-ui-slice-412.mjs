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

assert.match(appJs, /data-harness-execution-history-packet="true"/);
assert.match(
  appJs,
  /data-harness-execution-history="true"[\s\S]*data-harness-execution-history-packet="true"[\s\S]*data-harness-execution-history-list="true"/,
);

assert.match(stylesCss, /\.harness-execution-history-packet\s*\{/);
assert.match(
  stylesCss,
  /\.harness-execution-history-packet\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 18px 32px rgba\(20,\s*34,\s*42,\s*0\.07\);/s,
);
assert.match(stylesCss, /\.harness-execution-history-packet::before\s*\{/);
assert.match(stylesCss, /\.harness-execution-history-packet \.harness-execution-history-list-compact\s*\{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryPacketDesign: {
        insertionPoint: 'harnessRunDesk->historyPacketDesign->historySurface',
        marker: 'data-harness-execution-history-packet',
      },
    },
    null,
    2,
  ),
);
