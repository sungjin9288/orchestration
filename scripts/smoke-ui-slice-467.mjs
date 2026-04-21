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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*padding:\s*14px 15px;[\s\S]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.06\),[\s\S]*0 11px 19px rgba\(20,\s*34,\s*42,\s*0\.09\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewOuterShadow: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->outerShadow',
        marker: 'hidden result preview excerpt uses stronger outer shadow',
      },
    },
    null,
    2,
  ),
);
