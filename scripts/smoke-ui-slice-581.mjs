import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const playbookCardTitleId = `workspace-playbook-card-title-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardNoteId = `workspace-playbook-card-note-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardWhereId = card\.where/);
assert.match(appJs, /\? `workspace-playbook-card-where-\$\{activeGroupId\}-\$\{card\.step\}`/);
assert.match(appJs, /const playbookCardLabelIds = `\$\{playbookCardStepId\} \$\{playbookCardTitleId\}`;/);
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /\.filter\(Boolean\)\n              \.join\(' '\);/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(playbookCardLabelIds\)\}" aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.match(appJs, /<div class="workspace-playbook-title-row">/);
assert.match(appJs, /<strong class="workspace-playbook-card-title" id="\$\{escapeHtml\(playbookCardTitleId\)\}">\$\{escapeHtml\(card\.title\)\}<\/strong>/);
assert.match(appJs, /\$\{isCurrentStep \? `<span class="workspace-playbook-current-step" id="\$\{escapeHtml\(playbookCardCurrentId\)\}">현재 단계<\/span>` : ''\}/);
assert.match(appJs, /<p class="workspace-playbook-note" id="\$\{escapeHtml\(playbookCardNoteId\)\}">\$\{escapeHtml\(card\.note\)\}<\/p>/);
assert.match(appJs, /<span class="workspace-playbook-where" id="\$\{escapeHtml\(playbookCardWhereId\)\}">\$\{escapeHtml\(card\.where\)\}<\/span>/);
assert.match(appJs, /const shortcutGroupDescriptionIds = \[playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCardDescriptions: {
        labelledBy: 'visible step number + visible card title',
        describedBy: 'current-step marker + visible note + where chip',
        scope: 'playbook step listitems',
      },
    },
    null,
    2,
  ),
);
