import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /id="shell-header-project"/);
assert.match(indexHtml, /id="shell-header-surface"/);
assert.match(indexHtml, /id="shell-header-gates"/);
assert.doesNotMatch(indexHtml, /shell-window-badge/);
assert.doesNotMatch(indexHtml, /shell-header-copy/);

assert.match(appJs, /project: document\.querySelector\('#shell-header-project'\)/);
assert.match(appJs, /surface: document\.querySelector\('#shell-header-surface'\)/);
assert.match(appJs, /gates: document\.querySelector\('#shell-header-gates'\)/);
assert.match(appJs, /function renderWorkspaceHeader\(data, context\)/);
assert.match(appJs, /const projectLabel = activeProject\?\.name \|\| '미지정';/);
assert.match(appJs, /const providerConfig = getProjectProviderConfig\(activeProject\);/);
assert.match(appJs, /elements\.shellHeader\.project\.textContent = projectLabel;/);
assert.match(appJs, /elements\.shellHeader\.surface\.textContent = surfaceLabel;/);
assert.match(appJs, /elements\.shellHeader\.gates\.textContent = `gate \$\{context\.pendingGateCount\}`;/);
assert.doesNotMatch(appJs, /company-directory-note/);

assert.match(styles, /\.shell-header-register \{/);
assert.match(styles, /\.shell-header-register-cell \{/);
assert.match(styles, /\.shell-header-register-label \{/);
assert.match(styles, /\.shell-header-register-value \{/);
assert.doesNotMatch(styles, /\.shell-window-badge \{/);
assert.doesNotMatch(styles, /\.company-directory-note \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      compactHeader: {
        ids: ['shell-header-project', 'shell-header-surface', 'shell-header-gates'],
        bindings: ['renderWorkspaceHeader(data, context)', 'activeProject', 'providerConfig', 'pendingGateCount'],
        removedNoise: ['shell-window-badge', 'shell-header-copy', 'company-directory-note'],
      },
    },
    null,
    2,
  ),
);
