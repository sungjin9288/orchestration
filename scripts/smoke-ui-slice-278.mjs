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
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(appJs, /opsEditorGroup: 'all'/);
assert.match(appJs, /function renderOpsEditorScopeTabs\(activeGroupId = 'all'\)/);
assert.match(appJs, /data-action="set-ops-editor-group"/);
assert.match(appJs, /범위/);
assert.match(appJs, /인력/);
assert.match(appJs, /역할/);
assert.match(appJs, /desk/);
assert.match(appJs, /Read-only roster/);
assert.match(appJs, /Editing rows/);

assert.match(styles, /\.ops-admin-toolbar \{/);
assert.match(styles, /\.ops-editor-filter-tabs \{/);
assert.match(styles, /\.ops-editor-filter-tab \{/);
assert.match(styles, /\.ops-editor-filter-tab\.is-active \{/);
assert.match(styles, /\.ops-staffing-snapshot \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsEditorScopePolish: {
        app: ['opsEditorGroup', 'renderOpsEditorScopeTabs(activeGroupId = \'all\')', '범위', '인력', 'Read-only roster', 'Editing rows'],
        styles: ['ops-admin-toolbar', 'ops-editor-filter-tabs', 'ops-editor-filter-tab', 'ops-staffing-snapshot'],
      },
    },
    null,
    2,
  ),
);
