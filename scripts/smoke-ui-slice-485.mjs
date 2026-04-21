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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-harness-context="true"\]\s*\{[\s\S]*border-color:\s*rgba\(33,\s*57,\s*49,\s*0\.1\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(250,\s*251,\s*252,\s*0\.94\),\s*rgba\(243,\s*246,\s*248,\s*0\.98\)\);[\s\S]*0 7px 14px rgba\(20,\s*34,\s*42,\s*0\.035\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenHarnessContextOuterShadow: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenHarnessContextGroup->outerShadow',
        marker: 'hidden harness-context block uses stronger outer shadow',
      },
    },
    null,
    2,
  ),
);
