import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfigJs = fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(appJs, /data-step-state="\$\{isCurrentStep \? 'current' : 'idle'\}"/);
assert.match(appJs, /\$\{isCurrentStep \? 'aria-current="step"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStep \? 'step' : 'false'\}"/);
assert.match(appJs, /workspace-playbook-card \$\{isCurrentStep \? 'is-current-step' : ''\}/);
assert.match(appJs, /const currentPlaybookCard = meta\.cards\.find\(/);
assert.match(appJs, /\(card\) => Array\.isArray\(card\.surfaces\) && card\.surfaces\.includes\(state\.surface\),/);
assert.match(appJs, /const currentPlaybookStep = currentPlaybookCard \? currentPlaybookCard\.step : '';/);
assert.match(appJs, /const isCurrentStep = card\.step === currentPlaybookStep;/);
assert.match(appJs, /const playbookCardCurrentId = isCurrentStep/);
assert.match(appJs, /\? `workspace-playbook-card-current-\$\{activeGroupId\}-\$\{card\.step\}`/);
assert.match(appJs, /<span class="workspace-playbook-current-step" id="\$\{escapeHtml\(playbookCardCurrentId\)\}">현재 단계<\/span>/);
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['mission'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['council', 'execution'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['deliverables', 'artifacts', 'logs'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['artifacts'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['logs'\]/);
assert.match(surfaceConfigJs, /surfaces:\s*\['decision-inbox'\]/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCurrentStep: {
        semanticMarker: 'current step only renders aria-current=step',
        visualMarker: 'is-current-step',
        visibleMarker: '현재 단계',
        source: 'first matching playbook step for state.surface',
      },
    },
    null,
    2,
  ),
);
