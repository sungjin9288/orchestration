import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /const playbookCardCurrentId = isCurrentStep/);
assert.match(appJs, /const currentPlaybookCard = meta\.cards\.find\(/);
assert.match(appJs, /const currentPlaybookStep = currentPlaybookCard \? currentPlaybookCard\.step : '';/);
assert.match(appJs, /const isCurrentStep = card\.step === currentPlaybookStep;/);
assert.match(appJs, /\? `workspace-playbook-card-current-\$\{activeGroupId\}-\$\{card\.step\}`/);
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.match(
  appJs,
  /\$\{isCurrentStep \? `<span class="workspace-playbook-current-step" id="\$\{escapeHtml\(playbookCardCurrentId\)\}">현재 단계<\/span>` : ''\}/,
);
assert.match(appJs, /\$\{isCurrentStep \? 'aria-current="step"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStep \? 'step' : 'false'\}"/);
assert.match(stylesCss, /\.workspace-playbook-title-row \{/);
assert.match(stylesCss, /\.workspace-playbook-current-step \{/);
assert.match(stylesCss, /background:\s*rgba\(37, 99, 235, 0\.12\);/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCurrentStepVisibleMarker: {
        visibleCopy: '현재 단계',
        describedBy: 'active step card',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
