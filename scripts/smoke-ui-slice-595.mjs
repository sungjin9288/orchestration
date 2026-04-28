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

assert.match(appJs, /const isSameSurfaceShortcut = isCurrentSurface && !isCurrentStepShortcut;/);
assert.match(appJs, /\? `같은 desk · \$\{surfaceLabel\}`/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /\$\{isSameSurfaceShortcut \? ' is-same-surface' : ''\}/);
assert.match(appJs, /data-selection-state="\$\{isCurrentStepShortcut \? 'active' : isSameSurfaceShortcut \? 'same-surface' : 'idle'\}"/);
assert.match(appJs, /\$\{isCurrentStepShortcut \? 'aria-current="page"' : ''\}/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStepShortcut \? 'page' : 'false'\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.match(stylesCss, /\.workspace-playbook-shortcut\.is-same-surface \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookSameSurfaceShortcut: {
        visibleCopy: '같은 desk · surface label',
        currentState: 'aria-current remains limited to the active step shortcut',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
