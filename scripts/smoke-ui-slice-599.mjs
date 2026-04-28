import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const shortcutButtonId = `workspace-playbook-shortcut-\$\{activeGroupId\}-\$\{card\.step\}-\$\{surface\}`;/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /id="\$\{escapeHtml\(shortcutButtonId\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.match(appJs, /\$\{escapeHtml\(shortcutLabel\)\}/);
assert.match(appJs, /const shortcutLabel = isCurrentStepShortcut/);
assert.match(appJs, /\? `현재 · \$\{surfaceLabel\}`/);
assert.match(appJs, /\? `같은 desk · \$\{surfaceLabel\}`/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.doesNotMatch(appJs, /aria-label="\$\{escapeHtml\(shortcutAriaLabel\)\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutVisibleNames: {
        labelSource: 'visible shortcut text plus visible card step/title',
        descriptionSource: 'visible current marker, note, and where chip',
        actionPath: 'open-surface unchanged',
      },
    },
    null,
    2,
  ),
);
