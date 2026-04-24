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
  /\.harness-execution-result-packet \[data-harness-execution-preview="true"\]\s*\{[\s\S]*margin:\s*(?:0|4px 0 0);[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.(?:15|17)\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(249,\s*251,\s*253,\s*0\.98\),\s*rgba\(236,\s*242,\s*247,\s*0\.99\)\);/s,
);
assert.match(
  stylesCss,
  /box-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.7\),\s*(?:0 10px 18px rgba\(20,\s*34,\s*42,\s*0\.05\)|0 11px 20px rgba\(20,\s*34,\s*42,\s*0\.06\)|0 12px 22px rgba\(20,\s*34,\s*42,\s*0\.07\));/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPreviewPanel: {
        insertionPoint: 'visibleExecutionResultRegister->previewExcerpt->compactEvidencePanel',
        marker: 'visible result preview excerpt uses compact evidence panel',
      },
    },
    null,
    2,
  ),
);
