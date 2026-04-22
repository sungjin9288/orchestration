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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*margin-top:\s*(?:2|4)px;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.(?:16|22|24)\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(28,\s*39,\s*49,\s*0\.985\),\s*rgba\(18,\s*27,\s*34,\s*0\.99\)\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewPanel: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->compactEvidencePanel',
        marker: 'hidden result preview excerpt uses compact evidence panel',
      },
    },
    null,
    2,
  ),
);
