import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(styles, /\.surface\[data-surface="decision-inbox"\] \.decision-action-block::before,/);
assert.match(styles, /\.surface\[data-surface="execution"\] \.relation-strip > \.form-actions::before,/);
assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions::before \{/);
assert.match(styles, /\.surface\[data-surface="decision-inbox"\] \.decision-action-copy,/);
assert.match(styles, /\.surface\[data-surface="deliverables"\] \.relation-strip > \.form-actions \+ \.form-help \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      actionShelfRhythmSync: {
        selectors: [
          'decision-action-block::before',
          'execution relation-strip > .form-actions::before',
          'deliverables relation-strip > .form-actions + .form-help',
        ],
      },
    },
    null,
    2,
  ),
);
