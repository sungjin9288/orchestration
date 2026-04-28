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
assert.match(appJs, /\$\{isCurrentStepShortcut \? 'aria-current="page"' : ''\}/);
assert.match(appJs, /data-selection-state="\$\{isCurrentStepShortcut \? 'active' : isSameSurfaceShortcut \? 'same-surface' : 'idle'\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentStepShortcut \? 'page' : 'false'\}"/);
assert.doesNotMatch(appJs, /aria-current="\$\{isCurrentSurface \? 'page' : 'false'\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutCurrentAttribute: {
        currentShortcut: 'renders aria-current=page',
        nonCurrentShortcut: 'omits aria-current instead of rendering false',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
