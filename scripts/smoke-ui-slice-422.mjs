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
  /\.harness-execution-history-action-shelf \[data-harness-history-preview="true"\]\s*\{[\s\S]*border-color:\s*rgba\(60,\s*95,\s*137,\s*0\.(?:1|12)\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(246,\s*249,\s*252,\s*0\.95\),\s*rgba\(237,\s*242,\s*247,\s*0\.98\)\);[\s\S]*color:\s*rgba\(67,\s*79,\s*90,\s*0\.86\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryPreviewReadTierDesign: {
        insertionPoint: 'harnessRunDesk->historyPreviewReadTierDesign->historyRowPreviewControl',
        marker: 'history action shelf preview button uses read-tier emphasis',
      },
    },
    null,
    2,
  ),
);
