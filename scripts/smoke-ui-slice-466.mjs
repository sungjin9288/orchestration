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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*padding:\s*14px 15px;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.22\);[\s\S]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.06\),[\s\S]*0 10px 18px rgba\(20,\s*34,\s*42,\s*0\.08\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewInnerHighlight: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->innerHighlight',
        marker: 'hidden result preview excerpt uses stronger inner highlight',
      },
    },
    null,
    2,
  ),
);
