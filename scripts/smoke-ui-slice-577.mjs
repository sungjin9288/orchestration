import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfigJs = fs.readFileSync(surfaceConfigPath, 'utf8');
const stylesCss = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /function renderWorkspacePlaybookShortcutButtons\(\n  card,\n  activeGroupId,\n  currentPlaybookStep,\n  playbookCardLabelIds,\n  playbookCardCurrentId,\n  shortcutGroupDescriptionIds,\n  playbookCardDescriptionIds,\n\) \{/);
assert.match(appJs, /const surfaces = Array\.isArray\(card\.surfaces\) \? card\.surfaces : \[\];/);
assert.match(appJs, /const shortcutGroupLabelIds = \[playbookCardLabelIds, playbookCardCurrentId, shortcutLabelId\]/);
assert.match(appJs, /class="workspace-playbook-shortcuts" role="group" aria-labelledby="\$\{escapeHtml\(shortcutGroupLabelIds\)\}"\$\{shortcutGroupDescriptionIds \? ` aria-describedby="\$\{escapeHtml\(shortcutGroupDescriptionIds\)\}"` : ''\}/);
assert.match(appJs, /const isCurrentStepShortcut = isCurrentSurface && card\.step === currentPlaybookStep;/);
assert.match(appJs, /const isSameSurfaceShortcut = isCurrentSurface && !isCurrentStepShortcut;/);
assert.match(appJs, /class="workspace-playbook-shortcut \$\{isCurrentStepShortcut \? 'is-current-surface' : ''\}\$\{isSameSurfaceShortcut \? ' is-same-surface' : ''\}"/);
assert.match(appJs, /const shortcutButtonId = `workspace-playbook-shortcut-\$\{activeGroupId\}-\$\{card\.step\}-\$\{surface\}`;/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /id="\$\{escapeHtml\(shortcutButtonId\)\}"/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(surface\)\}"/);
assert.match(appJs, /data-selection-state="\$\{isCurrentStepShortcut \? 'active' : isSameSurfaceShortcut \? 'same-surface' : 'idle'\}"/);
assert.match(appJs, /\$\{isCurrentStepShortcut \? 'aria-current="page"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStepShortcut \? 'page' : 'false'\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.doesNotMatch(appJs, /aria-label="\$\{escapeHtml\(shortcutAriaLabel\)\}"/);
assert.match(appJs, /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/);
assert.match(surfaceConfigJs, /surfaces: \['mission'\]/);
assert.match(surfaceConfigJs, /surfaces: \['council', 'execution'\]/);
assert.match(surfaceConfigJs, /surfaces: \['decision-inbox'\]/);
assert.match(stylesCss, /\.workspace-playbook-shortcuts \{/);
assert.match(stylesCss, /\.workspace-playbook-shortcut \{/);
assert.match(stylesCss, /\.workspace-playbook-shortcut\.is-current-surface \{/);
assert.match(stylesCss, /\.workspace-playbook-shortcut\.is-same-surface \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookSurfaceShortcuts: {
        action: 'open-surface',
        labelSource: 'visible shortcut text plus visible card step/title',
        currentSurface: 'only current-step shortcut renders aria-current=page',
        scope: 'playbook step cards',
      },
    },
    null,
    2,
  ),
);
