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
  /\.harness-execution-history-action-shelf \.form-actions-compact\s*\{[\s\S]*margin-top:\s*0;[\s\S]*gap:\s*5px;/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-history-action-shelf \.secondary-button\s*\{[\s\S]*padding:\s*6px 9px;[\s\S]*min-height:\s*28px;[\s\S]*font-size:\s*0\.68rem;[\s\S]*line-height:\s*1\.08;[\s\S]*letter-spacing:\s*0\.03em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHistoryActionButtonDensityDesign: {
        insertionPoint: 'harnessRunDesk->historyActionButtonDensityDesign->historyRowControlButtons',
        marker: 'history action shelf buttons use compact density',
      },
    },
    null,
    2,
  ),
);
