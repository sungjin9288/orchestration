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
assert.match(appJs, /const shortcutLabelId = `workspace-playbook-shortcut-label-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardStepId = `workspace-playbook-card-step-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardTitleId = `workspace-playbook-card-title-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardLabelIds = `\$\{playbookCardStepId\} \$\{playbookCardTitleId\}`;/);
assert.match(appJs, /<strong class="workspace-playbook-card-title" id="\$\{escapeHtml\(playbookCardTitleId\)\}">\$\{escapeHtml\(card\.title\)\}<\/strong>/);
assert.match(appJs, /const shortcutGroupLabelIds = \[playbookCardLabelIds, playbookCardCurrentId, shortcutLabelId\]/);
assert.match(appJs, /role="group" aria-labelledby="\$\{escapeHtml\(shortcutGroupLabelIds\)\}"\$\{shortcutGroupDescriptionIds \? ` aria-describedby="\$\{escapeHtml\(shortcutGroupDescriptionIds\)\}"` : ''\}/);
assert.match(appJs, /<span class="workspace-playbook-shortcut-label" id="\$\{escapeHtml\(shortcutLabelId\)\}">바로 열기<\/span>/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.match(appJs, /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/);
assert.doesNotMatch(appJs, /class="workspace-playbook-shortcuts" role="group" aria-label=/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutLabelledGroup: {
        labelledBy: 'visible step number + visible card title + visible shortcut label',
        visibleLabel: '바로 열기',
        scope: 'playbook shortcut groups',
      },
    },
    null,
    2,
  ),
);
