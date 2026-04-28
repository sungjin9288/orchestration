import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /function renderWorkspacePlaybookShortcutButtons\(\n  card,\n  activeGroupId,\n  currentPlaybookStep,\n  playbookCardLabelIds,\n  playbookCardCurrentId,\n  shortcutGroupDescriptionIds,\n  playbookCardDescriptionIds,\n\) \{/);
assert.match(appJs, /const isCurrentSurface = surface === state\.surface;/);
assert.match(appJs, /const isCurrentStepShortcut = isCurrentSurface && card\.step === currentPlaybookStep;/);
assert.match(appJs, /const isSameSurfaceShortcut = isCurrentSurface && !isCurrentStepShortcut;/);
assert.match(appJs, /\? `같은 desk · \$\{surfaceLabel\}`/);
assert.match(appJs, /const shortcutButtonId = `workspace-playbook-shortcut-\$\{activeGroupId\}-\$\{card\.step\}-\$\{surface\}`;/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /class="workspace-playbook-shortcut \$\{isCurrentStepShortcut \? 'is-current-surface' : ''\}\$\{isSameSurfaceShortcut \? ' is-same-surface' : ''\}"/);
assert.match(appJs, /data-selection-state="\$\{isCurrentStepShortcut \? 'active' : isSameSurfaceShortcut \? 'same-surface' : 'idle'\}"/);
assert.match(appJs, /\$\{isCurrentStepShortcut \? 'aria-current="page"' : ''\}/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(
  appJs,
  /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/,
);
assert.doesNotMatch(appJs, /const shortcutLabel = isCurrentSurface \? `현재 · \$\{surfaceLabel\}` : surfaceLabel;/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentSurface \? 'page' : 'false'\}"/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStepShortcut \? 'page' : 'false'\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookSingleCurrentShortcut: {
        currentShortcutSource: 'current surface plus current playbook step',
        sameSurfaceShortcut: 'visible same-desk label without aria-current',
        prevents: 'multiple current shortcut buttons when cards share one surface',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
