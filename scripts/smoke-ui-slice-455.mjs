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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact > \.form-actions-hidden-compact\s*\{[\s\S]*gap:\s*(?:6px|7px) 8px;[\s\S]*padding:\s*(?:10px 11px 11px|11px 11px 12px);[\s\S]*border-radius:\s*10px;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenActionShelfCadence: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenActionShelf->compactRackCadence',
        marker: 'hidden result action shelf uses tighter rack cadence',
      },
    },
    null,
    2,
  ),
);
