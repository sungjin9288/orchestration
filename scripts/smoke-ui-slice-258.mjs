import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /회사 디렉터리/);
assert.match(indexHtml, /office-sidebar-section-status/);
assert.match(indexHtml, /office-sidebar-status-register/);
assert.match(indexHtml, /id="office-sidebar-project"/);
assert.match(indexHtml, /id="office-sidebar-surface"/);
assert.match(indexHtml, /id="office-sidebar-runs"/);
assert.match(indexHtml, /id="office-sidebar-gates"/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);

assert.match(appJs, /officeSidebarStatus: \{/);
assert.match(appJs, /project: document\.querySelector\('#office-sidebar-project'\)/);
assert.match(appJs, /surface: document\.querySelector\('#office-sidebar-surface'\)/);
assert.match(appJs, /runs: document\.querySelector\('#office-sidebar-runs'\)/);
assert.match(appJs, /gates: document\.querySelector\('#office-sidebar-gates'\)/);
assert.match(appJs, /elements\.officeSidebarStatus\.project\.textContent = activeProject\?\.name \|\| '미지정';/);
assert.match(appJs, /elements\.officeSidebarStatus\.surface\.textContent = getSurfaceDisplayName\(state\.surface\);/);
assert.match(appJs, /elements\.officeSidebarStatus\.runs\.textContent = `\$\{activeRuns\}건`;/);
assert.match(appJs, /elements\.officeSidebarStatus\.gates\.textContent = `\$\{context\.pendingGateCount\}건`;/);
assert.match(appJs, /function renderCompanyDirectory\(data\)/);
assert.match(appJs, /company-directory-summary-grid/);
assert.match(appJs, /company-directory-row/);

assert.match(styles, /\.office-sidebar-section-status \{/);
assert.match(styles, /\.office-sidebar-status-register \{/);
assert.match(styles, /\.office-sidebar-status-cell \{/);
assert.match(styles, /\.office-sidebar-status-value \{/);
assert.match(styles, /\.office-sidebar-chip-live \{/);
assert.match(styles, /\.company-directory-summary-grid \{/);
assert.match(styles, /\.company-directory-row \{/);
assert.doesNotMatch(styles, /\.company-directory-note \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      officeStatusRegister: {
        labels: ['회사 디렉터리', '현재 프로젝트', '현재 데스크', '열린 실행', '열린 승인선'],
        ids: ['office-sidebar-project', 'office-sidebar-surface', 'office-sidebar-runs', 'office-sidebar-gates'],
        directory: ['company-directory-summary', 'company-directory-shell'],
      },
    },
    null,
    2,
  ),
);
