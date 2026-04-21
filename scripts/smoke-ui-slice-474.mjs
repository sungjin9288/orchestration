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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.11\);[\s\S]*box-shadow:\s*[\s\S]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.62\),[\s\S]*0 8px 14px rgba\(20,\s*34,\s*42,\s*0\.045\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfInnerHighlight: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelfDesign->innerHighlight',
        marker: 'hidden result action shelf uses stronger inner highlight',
      },
    },
    null,
    2,
  ),
);
