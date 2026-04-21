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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-operator-context="true"\]\s*\{[\s\S]*border-color:\s*rgba\(121,\s*98,\s*47,\s*0\.11\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(251,\s*249,\s*242,\s*0\.94\),\s*rgba\(246,\s*243,\s*236,\s*0\.98\)\);[\s\S]*box-shadow:\s*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0\.7\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenOperatorContextBorderBalance: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenOperatorContextGroup->borderBalance',
        marker: 'hidden operator-context block uses stronger border balance',
      },
    },
    null,
    2,
  ),
);
