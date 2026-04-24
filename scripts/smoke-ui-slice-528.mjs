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
  /\.harness-execution-result-packet \[data-harness-execution-preview="true"\]\s*\{[\s\S]*margin:\s*4px 0 0;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.17\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(249,\s*251,\s*253,\s*0\.98\),\s*rgba\(236,\s*242,\s*247,\s*0\.99\)\);[\s\S]*0 12px 22px rgba\(20,\s*34,\s*42,\s*0\.07\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPreviewBorderFollowup: {
        insertionPoint: 'visibleExecutionResultRegister->previewExcerpt->borderBalance',
        marker: 'visible result preview excerpt uses stronger border balance',
      },
    },
    null,
    2,
  ),
);
