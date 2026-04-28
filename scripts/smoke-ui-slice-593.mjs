import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const currentPlaybookCard = meta\.cards\.find\(/);
assert.match(
  appJs,
  /\(card\) => Array\.isArray\(card\.surfaces\) && card\.surfaces\.includes\(state\.surface\),/,
);
assert.match(appJs, /const currentPlaybookStep = currentPlaybookCard \? currentPlaybookCard\.step : '';/);
assert.match(appJs, /const isCurrentStep = card\.step === currentPlaybookStep;/);
assert.doesNotMatch(
  appJs,
  /const isCurrentStep = Array\.isArray\(card\.surfaces\) && card\.surfaces\.includes\(state\.surface\);/,
);
assert.match(appJs, /\$\{isCurrentStep \? 'aria-current="step"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStep \? 'step' : 'false'\}"/);
assert.match(appJs, /data-step-state="\$\{isCurrentStep \? 'current' : 'idle'\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookSingleCurrentStep: {
        currentStepSource: 'first matching card for current surface',
        prevents: 'multiple or false aria-current markers when cards share one surface',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
