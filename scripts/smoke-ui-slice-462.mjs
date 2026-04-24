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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact \.secondary-button\s*\{[\s\S]*max-width:\s*100%;[\s\S]*white-space:\s*nowrap;[\s\S]*overflow:\s*hidden;[\s\S]*text-overflow:\s*ellipsis;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfButtonOverflowBoundary: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->buttonOverflowBoundary',
        marker: 'hidden result action shelf buttons keep overflow inside rack boundary',
      },
    },
    null,
    2,
  ),
);
