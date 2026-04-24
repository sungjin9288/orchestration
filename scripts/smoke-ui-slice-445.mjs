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
  /\.harness-execution-result-packet \.token-row-compact \.token-accent\s*\{[\s\S]*border-color:\s*rgba\(55,\s*93,\s*120,\s*0\.14\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(235,\s*245,\s*255,\s*0\.98\),\s*rgba\(222,\s*237,\s*249,\s*0\.99\)\);[\s\S]*color:\s*rgba\(42,\s*72,\s*96,\s*0\.96\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-result-packet \.token-row-compact \.token-accent\s*\{[\s\S]*box-shadow:\s*[\s\S]*0 6px 12px rgba\(55,\s*93,\s*120,\s*0\.08\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultTokenRowAccentHighlight: {
        insertionPoint: 'visibleExecutionResultRegister->summaryTokenRow->accentHighlightTier',
        marker: 'visible result token row accent token uses highlight tier',
      },
    },
    null,
    2,
  ),
);
