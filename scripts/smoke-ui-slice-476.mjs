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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact::before\s*\{[\s\S]*width:\s*clamp\(58px,\s*20%,\s*86px\);[\s\S]*height:\s*2px;[\s\S]*border-radius:\s*999px;[\s\S]*box-shadow:\s*0 4px 10px rgba\(55,\s*93,\s*120,\s*0\.09\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfRailGlow: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelfDesign->railGlow',
        marker: 'hidden result action shelf uses stronger rail glow',
      },
    },
    null,
    2,
  ),
);
