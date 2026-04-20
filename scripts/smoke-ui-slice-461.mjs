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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact \.secondary-button\s*\{[\s\S]*flex:\s*0 0 auto;[\s\S]*display:\s*inline-flex;[\s\S]*white-space:\s*nowrap;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfButtonIntrinsicWidth: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->buttonIntrinsicWidth',
        marker: 'hidden result action shelf buttons keep intrinsic width',
      },
    },
    null,
    2,
  ),
);
