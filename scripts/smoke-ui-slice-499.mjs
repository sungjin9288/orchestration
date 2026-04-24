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
  /\.harness-execution-result-packet \.card-title-row-tight\s*\{[\s\S]*padding:\s*6px 8px;[\s\S]*border-radius:\s*10px;[\s\S]*background:\s*[\s\S]*rgba\(252,\s*253,\s*254,\s*0\.95\)[\s\S]*rgba\(247,\s*249,\s*251,\s*0\.98\)[\s\S]*box-shadow:\s*[\s\S]*0 5px 11px rgba\(20,\s*34,\s*42,\s*0\.035\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultHeaderRowOuterShadow: {
        insertionPoint: 'visibleExecutionResultRegister->headerStatusRow->outerShadow',
        marker: 'visible result header row uses stronger outer shadow',
      },
    },
    null,
    2,
  ),
);
