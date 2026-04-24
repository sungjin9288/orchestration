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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*border-radius:\s*12px;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.24\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewEdgeContrast: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->edgeContrast',
        marker: 'hidden result preview excerpt uses stronger edge contrast',
      },
    },
    null,
    2,
  ),
);
