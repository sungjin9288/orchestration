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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*position:\s*relative;[\s\S]*border-radius:\s*10px;[\s\S]*border:\s*1px solid rgba\(33,\s*57,\s*49,\s*0\.(?:1|11)\);[\s\S]*background:\s*[\s\S]*linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.84\),\s*rgba\(243,\s*247,\s*249,\s*0\.94\)\);/s,
);
assert.match(
  stylesCss,
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact::before\s*\{[\s\S]*width:\s*clamp\(58px,\s*20%,\s*86px\);[\s\S]*height:\s*2px;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultActionShelf: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelfDesign->hiddenRowControls',
        marker: 'hidden result action row uses compact shelf',
      },
    },
    null,
    2,
  ),
);
