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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact \.secondary-button\s*\{[\s\S]*padding:\s*(?:7px|8px) 11px;[\s\S]*padding-inline:\s*(?:9px|10px);[\s\S]*min-height:\s*(?:31px|32px);[\s\S]*font-size:\s*0\.(?:75|76)rem;[\s\S]*line-height:\s*(?:1\.1|1\.12);[\s\S]*letter-spacing:\s*(?:0|0\.01em);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfButtonRhythm: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->buttonRhythm',
        marker: 'hidden result action shelf buttons use tighter vertical rhythm',
      },
    },
    null,
    2,
  ),
);
