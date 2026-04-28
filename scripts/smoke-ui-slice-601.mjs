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
assert.match(appJs, /const currentPlaybookStep = currentPlaybookCard \? currentPlaybookCard\.step : '';/);
assert.match(appJs, /const isCurrentStep = card\.step === currentPlaybookStep;/);
assert.match(appJs, /data-step-state="\$\{isCurrentStep \? 'current' : 'idle'\}"/);
assert.match(appJs, /\$\{isCurrentStep \? 'aria-current="step"' : ''\}/);
assert.match(appJs, /const playbookCardCurrentId = isCurrentStep/);
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStep \? 'step' : 'false'\}"/);
assert.doesNotMatch(
  appJs,
  /const isCurrentStep = Array\.isArray\(card\.surfaces\) && card\.surfaces\.includes\(state\.surface\);/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCardCurrentAttribute: {
        currentCard: 'renders aria-current=step',
        nonCurrentCard: 'omits aria-current instead of rendering false',
        currentSource: 'first matching playbook card for state.surface',
      },
    },
    null,
    2,
  ),
);
