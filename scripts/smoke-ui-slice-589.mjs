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
assert.match(appJs, /const playbookCardDescriptionIds = \[playbookCardCurrentId, playbookCardNoteId, playbookCardWhereId\]/);
assert.match(appJs, /const shortcutButtonLabelIds = \[shortcutButtonId, playbookCardLabelIds\]/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(shortcutButtonLabelIds\)\}"/);
assert.match(appJs, /aria-describedby="\$\{escapeHtml\(playbookCardDescriptionIds\)\}"/);
assert.doesNotMatch(appJs, /shortcutAriaLabel/);
assert.match(appJs, /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/);
assert.match(appJs, /data-action="open-surface"/);
assert.match(appJs, /data-target-surface="\$\{escapeHtml\(surface\)\}"/);
assert.match(appJs, /aria-controls="surface-\$\{escapeHtml\(surface\)\}"/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookShortcutDescriptions: {
        labelledBy: 'visible shortcut text + visible step/title',
        describedBy: 'current-step marker + visible note + where chip',
        actionPath: 'open-surface unchanged',
        scope: 'playbook shortcut buttons',
      },
    },
    null,
    2,
  ),
);
