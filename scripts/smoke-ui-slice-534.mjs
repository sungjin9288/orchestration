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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-preview="true"\]\s*\{[\s\S]*margin-top:\s*4px;[\s\S]*min-height:\s*168px;[\s\S]*padding:\s*14px 15px;[\s\S]*border-radius:\s*12px;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.24\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(28,\s*39,\s*49,\s*0\.985\),\s*rgba\(18,\s*27,\s*34,\s*0\.99\)\);[\s\S]*line-height:\s*1\.5;[\s\S]*0 12px 21px rgba\(20,\s*34,\s*42,\s*0\.1\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenResultPreviewLineHeightFollowup: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenPreviewExcerpt->lineHeightRhythm',
        marker: 'hidden result preview excerpt uses tighter evidence rhythm',
      },
    },
    null,
    2,
  ),
);
