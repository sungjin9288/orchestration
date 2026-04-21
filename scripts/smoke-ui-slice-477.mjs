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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*background:\s*[\s\S]*radial-gradient\(circle at top left,\s*rgba\(55,\s*93,\s*120,\s*0\.1\),\s*transparent 44%\),[\s\S]*linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.88\),\s*rgba\(240,\s*245,\s*248,\s*0\.96\)\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfBackgroundContrast: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelfDesign->backgroundContrast',
        marker: 'hidden result action shelf uses stronger background contrast',
      },
    },
    null,
    2,
  ),
);
