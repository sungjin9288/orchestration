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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.11\);[\s\S]*background:\s*[\s\S]*linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.88\),\s*rgba\(240,\s*245,\s*248,\s*0\.96\)\);[\s\S]*0 9px 16px rgba\(20,\s*34,\s*42,\s*0\.05\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfBorderBalance: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelfDesign->borderBalance',
        marker: 'hidden result action shelf uses stronger border balance',
      },
    },
    null,
    2,
  ),
);
