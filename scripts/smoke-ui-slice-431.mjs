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
  /\.surface\[data-surface="execution"\] \.relation-strip-hidden-compact \[data-harness-result-hidden-run-context="true"\]\s*\{/,
);
assert.match(stylesCss, /border-color:\s*rgba\(55,\s*93,\s*120,\s*0\.16\);/);
assert.match(stylesCss, /radial-gradient\(circle at top left,\s*rgba\(55,\s*93,\s*120,\s*0\.08\),\s*transparent 46%\)/);
assert.match(stylesCss, /0 8px 16px rgba\(20,\s*34,\s*42,\s*0\.04\)/);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionHiddenRunContextAccent: {
        insertionPoint: 'hiddenExecutionResultRegister->hiddenRunContextGroup->firstReadSummaryAccent',
        marker: 'hidden run-context block uses first-read summary accent',
      },
    },
    null,
    2,
  ),
);
