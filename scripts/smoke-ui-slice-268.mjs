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

assert.match(appJs, /workflow-overview-shell/);
assert.match(appJs, /review-overview-shell/);
assert.match(appJs, /ops-overview-shell/);
assert.match(appJs, /업무 흐름/);
assert.match(appJs, /선택된 work order/);
assert.match(appJs, /실행 인계/);
assert.match(appJs, /검토 큐/);
assert.match(appJs, /회사 구조/);
assert.match(appJs, /인력 편집/);
assert.match(appJs, /roster와 회사 구조에 추가합니다\./);
assert.match(appJs, /renderCompanyDirectory\(data\)/);
assert.match(appJs, /renderCompanyRosterList\(members, emptyCopy = '배정된 인력이 아직 없습니다\.'\)/);
assert.match(appJs, /renderOpsRosterMatrix\(members\)/);

assert.match(styles, /\.workflow-overview-shell,\s*\.review-overview-shell,\s*\.ops-overview-shell \{/s);
assert.match(styles, /\.workflow-stage-stack \{/);
assert.match(styles, /\.review-lane-stack \{/);
assert.match(styles, /\.ops-roster-sheet \{/);
assert.match(styles, /\.company-roster-list,\s*\.ops-roster-matrix \{/s);
assert.match(styles, /\.ops-team-section-list \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      groupedWorkspaceShapes: {
        shells: ['workflow-overview-shell', 'review-overview-shell', 'ops-overview-shell'],
        labels: ['업무 흐름', '선택된 work order', '실행 인계', '검토 큐', '회사 구조'],
        companyStructure: ['renderCompanyDirectory(data)', '인력 편집', 'roster와 회사 구조에 추가합니다.'],
      },
    },
    null,
    2,
  ),
);
