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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact \[data-harness-result-hidden-preview-copy="true"\]\s*\{[\s\S]*border-color:\s*rgba\(60,\s*95,\s*137,\s*0\.(?:08|1)\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(245,\s*248,\s*251,\s*0\.94\),\s*rgba\(236,\s*241,\s*246,\s*0\.97\)\);[\s\S]*color:\s*rgba\(67,\s*79,\s*90,\s*0\.82\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewReadTier: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewReadTier->previewControl',
        marker: 'hidden result preview button uses read-tier emphasis',
      },
    },
    null,
    2,
  ),
);
