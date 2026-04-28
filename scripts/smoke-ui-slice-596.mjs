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
assert.match(appJs, /const shortcutGroupLabelIds = \[playbookCardLabelIds, playbookCardCurrentId, shortcutLabelId\]/);
assert.match(appJs, /\.filter\(Boolean\)\n    \.join\(' '\);/);
assert.match(appJs, /role="group" aria-labelledby="\$\{escapeHtml\(shortcutGroupLabelIds\)\}"\$\{shortcutGroupDescriptionIds \? ` aria-describedby="\$\{escapeHtml\(shortcutGroupDescriptionIds\)\}"` : ''\}/);
assert.match(
  appJs,
  /\$\{renderWorkspacePlaybookShortcutButtons\(card, activeGroupId, currentPlaybookStep, playbookCardLabelIds, playbookCardCurrentId, shortcutGroupDescriptionIds, playbookCardDescriptionIds\)\}/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookCurrentShortcutGroupLabel: {
        labelledBy: 'step + title + current-step marker + visible shortcut label',
        scope: 'current playbook shortcut group only',
        routeRuntimeScope: 'unchanged',
      },
    },
    null,
    2,
  ),
);
