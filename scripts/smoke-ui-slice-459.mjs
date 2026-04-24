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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*flex-wrap:\s*wrap;[\s\S]*justify-content:\s*flex-start;[\s\S]*gap:\s*6px 8px;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfClusterFlow: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->clusterFlow',
        marker: 'hidden result action shelf uses wrapped cluster flow',
      },
    },
    null,
    2,
  ),
);
