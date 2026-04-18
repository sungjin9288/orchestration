import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(
  stylesCss,
  /\.harness-execution-history-action-shelf \[data-harness-input-copy="true"\],\s*\.harness-execution-history-action-shelf \[data-harness-output-copy="true"\]\s*\{[\s\S]*border-color:\s*rgba\(33,\s*57,\s*49,\s*0\.11\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(252,\s*248,\s*240,\s*0\.9\),\s*rgba\(246,\s*241,\s*232,\s*0\.95\)\);[\s\S]*color:\s*rgba\(58,\s*71,\s*80,\s*0\.82\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryCopyButtonUtilityTierDesign: {
        insertionPoint: 'harnessRunDesk->historyCopyButtonUtilityTierDesign->historyRowCopyControls',
        marker: 'history action shelf copy buttons use utility tier',
      },
    },
    null,
    2,
  ),
);
