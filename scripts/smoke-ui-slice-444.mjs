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
  /\.harness-execution-result-packet \.token-row-compact \.token-neutral\s*\{[\s\S]*border-color:\s*rgba\(33,\s*57,\s*49,\s*0\.08\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(248,\s*250,\s*251,\s*0\.96\),\s*rgba\(239,\s*244,\s*247,\s*0\.99\)\);[\s\S]*color:\s*rgba\(67,\s*79,\s*90,\s*0\.82\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultTokenRowNeutralSupportTier: {
        insertionPoint: 'visibleExecutionResultRegister->summaryTokenRow->neutralSupportTier',
        marker: 'visible result token row neutral tokens use support tier',
      },
    },
    null,
    2,
  ),
);
