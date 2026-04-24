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
  /\.harness-execution-result-packet \.token-row-compact\s*\{[\s\S]*gap:\s*5px;[\s\S]*padding:\s*7px 8px;[\s\S]*border-radius:\s*10px;[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.1\);[\s\S]*box-shadow:\s*(?:inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.66\);|[\s\S]*0 6px 12px rgba\(20,\s*34,\s*42,\s*0\.04\);)/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-result-packet \.token-row-compact \.token\s*\{[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.42\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultTokenRowSummaryStrip: {
        insertionPoint: 'visibleExecutionResultRegister->summaryTokenRow->compactStripTreatment',
        marker: 'visible result token row uses compact summary strip',
      },
    },
    null,
    2,
  ),
);
