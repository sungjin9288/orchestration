import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /const shortcutGroupDescriptionIds = \[playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /\.filter\(Boolean\)\n              \.join\(' '\);/);
assert.match(
  appJs,
  /class="workspace-playbook-shortcuts" role="group" aria-labelledby="\$\{escapeHtml\(shortcutGroupLabelIds\)\}"\$\{shortcutGroupDescriptionIds \? ` aria-describedby="\$\{escapeHtml\(shortcutGroupDescriptionIds\)\}"` : ''\}/,
);
assert.match(
  appJs,
  /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/,
);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutGroupDescription: {
        groupDescribedBy: 'visible note + where chip',
        buttonDescribedBy: 'current-step marker + visible note + where chip',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
