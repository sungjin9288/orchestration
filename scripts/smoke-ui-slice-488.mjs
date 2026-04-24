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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*margin-top:\s*4px;[\s\S]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.06\),[\s\S]*0 12px 21px rgba\(20,\s*34,\s*42,\s*0\.1\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewOuterShadowFollowup: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->outerShadowFollowup',
        marker: 'hidden result preview excerpt uses stronger outer shadow followup',
      },
    },
    null,
    2,
  ),
);
