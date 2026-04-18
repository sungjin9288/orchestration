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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-harness-context="true"\]\s*\{/,
);
assert.match(stylesCss, /border-color:\s*rgba\(33,\s*57,\s*49,\s*0\.09\);/);
assert.match(
  stylesCss,
  /background:\s*linear-gradient\(180deg,\s*rgba\(250,\s*251,\s*252,\s*0\.94\),\s*rgba\(243,\s*246,\s*248,\s*0\.98\)\);/,
);
assert.match(stylesCss, /box-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.68\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenHarnessContextSupportTier: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenHarnessContextGroup->supportingTier',
        marker: 'hidden harness-context block uses supporting tier',
      },
    },
    null,
    2,
  ),
);
