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

assert.match(appJs, /const shortcutGroupLabelIds = \[playbookCardLabelIds, playbookCardCurrentId, shortcutLabelId\]/);
assert.match(appJs, /<div class="workspace-playbook-shortcuts" role="group" aria-labelledby="\$\{escapeHtml\(shortcutGroupLabelIds\)\}"\$\{shortcutGroupDescriptionIds \? ` aria-describedby="\$\{escapeHtml\(shortcutGroupDescriptionIds\)\}"` : ''\}>/);
assert.match(appJs, /<span class="workspace-playbook-shortcut-label" id="\$\{escapeHtml\(shortcutLabelId\)\}">바로 열기<\/span>/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /id="\$\{escapeHtml\(shortcutButtonId\)\}"/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.match(stylesCss, /\.workspace-playbook-shortcuts \{\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;/);
assert.match(stylesCss, /\.workspace-playbook-shortcut-label \{/);
assert.match(stylesCss, /font-weight: 800;/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutAffordance: {
        visibleLabel: '바로 열기',
        buttonLabelSource: 'visible shortcut text plus visible card step/title',
        action: 'open-surface',
        scope: 'playbook shortcut rows',
      },
    },
    null,
    2,
  ),
);
