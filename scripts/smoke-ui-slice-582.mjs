import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const playbookCardStepId = `workspace-playbook-card-step-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardTitleId = `workspace-playbook-card-title-\$\{activeGroupId\}-\$\{card\.step\}`;/);
assert.match(appJs, /const playbookCardCurrentId = isCurrentStep/);
assert.match(appJs, /const playbookCardLabelIds = `\$\{playbookCardStepId\} \$\{playbookCardTitleId\}`;/);
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(playbookCardLabelIds\)\}" aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.match(appJs, /<span class="workspace-playbook-step" id="\$\{escapeHtml\(playbookCardStepId\)\}">\$\{escapeHtml\(card\.step\)\}<\/span>/);
assert.match(appJs, /const shortcutGroupDescriptionIds = \[playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookStepLabels: {
        labelledBy: 'visible step number + visible card title',
        describedBy: 'current-step marker + visible note + where chip',
        scope: 'playbook step listitems',
      },
    },
    null,
    2,
  ),
);
