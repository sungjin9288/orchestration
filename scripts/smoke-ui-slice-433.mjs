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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-operator-context="true"\]\s*\{/,
);
assert.match(stylesCss, /border-color:\s*rgba\(121,\s*98,\s*47,\s*0\.(?:1|11)\);/);
assert.match(
  stylesCss,
  /background:\s*linear-gradient\(180deg,\s*rgba\(250,\s*252,\s*254,\s*0\.94\),\s*rgba\(238,\s*242,\s*246,\s*0\.98\)\);/,
);
assert.match(
  stylesCss,
  /box-shadow:\s*(?:inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.7\);|inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.7\),\s*0 6px 12px rgba\(20,\s*34,\s*42,\s*0\.03\);)/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenOperatorContextNoteTier: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenOperatorContextGroup->noteTier',
        marker: 'hidden operator-context block uses note tier',
      },
    },
    null,
    2,
  ),
);
