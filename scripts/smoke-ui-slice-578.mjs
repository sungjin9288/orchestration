import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const isCurrentStepShortcut = isCurrentSurface && card\.step === currentPlaybookStep;/);
assert.match(appJs, /const isSameSurfaceShortcut = isCurrentSurface && !isCurrentStepShortcut;/);
assert.match(appJs, /\? `같은 desk · \$\{surfaceLabel\}`/);
assert.match(appJs, /const shortcutButtonId = `workspace-playbook-shortcut-\$\{activeGroupId\}-\$\{card\.step\}-\$\{surface\}`;/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /\$\{isCurrentStepShortcut \? 'aria-current="page"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStepShortcut \? 'page' : 'false'\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.match(appJs, />\n              \$\{escapeHtml\(shortcutLabel\)\}\n            <\/button>/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCurrentShortcutLabel: {
        visible: '현재 · surface label',
        sameSurface: '같은 desk · surface label',
        aria: 'visible shortcut text plus visible card step/title',
        currentState: 'single current-step shortcut renders aria-current=page',
      },
    },
    null,
    2,
  ),
);
