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

assert.match(appJs, /data-panel-state="readonly"/);
assert.match(appJs, /data-panel-state="editing"/);
assert.match(appJs, /data-editor-state="editing"/);
assert.match(appJs, /Read-only roster/);
assert.match(appJs, /Editing rows/);
assert.match(appJs, /편집 대상/);
assert.match(appJs, /역할\/데스크 편집/);

assert.match(styles, /\.ops-current-lineup\[data-panel-state='readonly'\] \{/);
assert.match(styles, /\.ops-assignment-editor\[data-panel-state='editing'\] \{/);
assert.match(styles, /\.ops-staffing-row\[data-editor-state='editing'\] \{/);
assert.match(styles, /\.ops-editing-badge \{/);
assert.match(styles, /\.ops-editing-ribbon \{/);
assert.match(styles, /\.ops-editing-ribbon-title \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      opsEditingContrastAndBodyDensity: {
        app: [
          'data-panel-state="readonly"',
          'data-panel-state="editing"',
          'data-editor-state="editing"',
          'Read-only roster',
          'Editing rows',
          '편집 대상',
          '역할/데스크 편집',
        ],
        styles: [
          "ops-current-lineup[data-panel-state='readonly']",
          "ops-assignment-editor[data-panel-state='editing']",
          "ops-staffing-row[data-editor-state='editing']",
          'ops-editing-badge',
          'ops-editing-ribbon',
          'ops-editing-ribbon-title',
        ],
      },
    },
    null,
    2,
  ),
);
