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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact \.secondary-button\s*\{[\s\S]*padding:\s*8px 11px;[\s\S]*min-height:\s*31px;[\s\S]*font-size:\s*0\.75rem;[\s\S]*line-height:\s*1\.1;[\s\S]*letter-spacing:\s*0\.01em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfButtonLineHeightFollowup: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->buttonLabelRhythm',
        marker: 'hidden result action shelf buttons use denser label rhythm',
      },
    },
    null,
    2,
  ),
);
