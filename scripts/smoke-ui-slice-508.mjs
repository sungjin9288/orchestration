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
  /\.harness-run-prep-cluster\s+\.harness-run-field-rack\s*\{[\s\S]*box-shadow:\s*0 14px 24px rgba\(20,\s*34,\s*42,\s*0\.05\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessRunFieldRackOuterShadow: {
        insertionPoint: 'harnessRunDesk->prepClusterShell->fieldRackShell->outerShadow',
        marker: 'field rack uses stronger outer shadow followup',
      },
    },
    null,
    2,
  ),
);
