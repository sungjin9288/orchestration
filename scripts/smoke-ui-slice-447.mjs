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
  /\.harness-execution-result-packet \.card-title-row-tight\s*\{[\s\S]*padding:\s*6px 8px;[\s\S]*border-radius:\s*10px;[\s\S]*box-shadow:\s*[\s\S]*0 5px 11px rgba\(20,\s*34,\s*42,\s*0\.035\);/s,
);
assert.match(
  stylesCss,
  /\.harness-execution-result-packet \.card-title-row-tight strong\s*\{[\s\S]*color:\s*rgba\(20,\s*34,\s*46,\s*0\.98\);[\s\S]*letter-spacing:\s*0\.01em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultHeaderTitleInk: {
        insertionPoint: 'visibleExecutionResultRegister->headerStatusRow->titleInkEmphasis',
        marker: 'visible result header title uses stronger title ink',
      },
    },
    null,
    2,
  ),
);
