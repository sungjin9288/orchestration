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
  /\.harness-execution-result-packet \.form-actions-compact \[data-harness-result-hide="true"\]\s*\{[\s\S]*border-color:\s*rgba\(77,\s*88,\s*100,\s*0\.1\);[\s\S]*background:\s*linear-gradient\(180deg,\s*rgba\(247,\s*249,\s*250,\s*0\.95\),\s*rgba\(239,\s*243,\s*246,\s*0\.98\)\);[\s\S]*color:\s*rgba\(74,\s*83,\s*91,\s*0\.84\);[\s\S]*box-shadow:\s*[\s\S]*0 5px 10px rgba\(77,\s*88,\s*100,\s*0\.045\);/s,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      harnessExecutionVisibleResultHideShadowFollowup: {
        insertionPoint: 'visibleExecutionResultRegister->actionRow->hideControlLift',
        marker: 'visible result action row hide button uses stronger shadow followup',
      },
    },
    null,
    2,
  ),
);
