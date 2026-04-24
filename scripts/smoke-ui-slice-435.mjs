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
  /\.harness-execution-result-packet \[data-harness-execution-preview="true"\]\s*\{[\s\S]*min-height:\s*168px;[\s\S]*border:\s*1px solid rgba\(55,\s*93,\s*120,\s*0\.17\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultPreviewCompactHeight: {
        insertionPoint: 'visibleExecutionResultRegister->previewExcerpt->compactEvidenceHeight',
        marker: 'visible result preview excerpt uses compact height floor',
      },
    },
    null,
    2,
  ),
);
