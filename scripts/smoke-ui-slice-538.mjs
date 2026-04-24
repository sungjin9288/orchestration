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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-run-context="true"\] \.detail-copy-compact\s*\{[\s\S]*color:\s*rgba\(71,\s*84,\s*96,\s*0\.82\);[\s\S]*font-size:\s*0\.84rem;[\s\S]*line-height:\s*1\.42;[\s\S]*letter-spacing:\s*0\.01em;/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenRunContextFontSizeFollowup: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenRunContextGroup->copyDensity',
        marker: 'hidden run-context copy uses compact metadata density',
      },
    },
    null,
    2,
  ),
);
