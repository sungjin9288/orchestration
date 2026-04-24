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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-run-context="true"\]\s*\{[\s\S]*border-color:\s*rgba\(55,\s*93,\s*120,\s*0\.18\);[\s\S]*radial-gradient\(circle at top left,\s*rgba\(55,\s*93,\s*120,\s*0\.08\),\s*transparent 46%\),[\s\S]*0 (?:8px 16px rgba\(20,\s*34,\s*42,\s*0\.04\)|9px 18px rgba\(20,\s*34,\s*42,\s*0\.05\));/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenRunContextBorderContrast: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenRunContextGroup->borderContrast',
        marker: 'hidden run-context block uses stronger border contrast',
      },
    },
    null,
    2,
  ),
);
