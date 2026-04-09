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

assert.match(indexHtml, /<title>Orchestration 1\.0 Workflow Control<\/title>/);
assert.match(indexHtml, /<h1>Orchestration<\/h1>/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /Orchestration 1\.0/);
assert.match(indexHtml, /single operator/);
assert.match(indexHtml, /Workflow desk/);
assert.match(indexHtml, /업무/);
assert.match(indexHtml, /office-sidebar/);
assert.match(indexHtml, /office-brand-card/);
assert.match(indexHtml, /업무/);
assert.match(indexHtml, /검토/);
assert.match(indexHtml, /운영/);
assert.match(indexHtml, /회사 디렉터리/);
assert.match(indexHtml, /열린 실행/);
assert.match(indexHtml, /열린 승인선/);
assert.match(indexHtml, /id="shell-header-project"/);
assert.match(indexHtml, /id="shell-header-surface"/);
assert.match(indexHtml, /id="shell-header-gates"/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);
assert.match(indexHtml, /회사 디렉터리 상태/);

assert.match(appJs, /kicker: '접수 라인'/);
assert.match(appJs, /kicker: '회의 라인'/);
assert.match(appJs, /kicker: '게이트 라인'/);
assert.match(appJs, /Workflow map/);
assert.match(appJs, /Selected work order/);
assert.match(appJs, /Execution handoff/);
assert.match(appJs, /Review queue/);
assert.match(appJs, /Company org/);
assert.match(appJs, /AI staffing desk/);
assert.match(appJs, /company-directory-section-title/);
assert.match(appJs, /\$\{label\} 팀/);
assert.match(appJs, /function renderCompanyDirectory\(data\)/);
assert.match(appJs, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /function renderOpsOverview\(data, context, activeGroupId\)/);

assert.match(styles, /\.office-sidebar \{/);
assert.match(styles, /\.office-brand-card \{/);
assert.match(styles, /\.office-rule-list,/);
assert.match(styles, /\.shell-header-main \{/);
assert.match(styles, /\.shell-header-register \{/);
assert.match(styles, /\.office-sidebar-status-register \{/);
assert.match(styles, /\.control-overview-register \{/);
assert.match(styles, /\.nav-group \{/);
assert.match(styles, /\.company-directory-row \{/);
assert.match(styles, /\.control-overview-grid-review \{/);
assert.match(styles, /\.control-overview-grid-ops \{/);

assert.doesNotMatch(indexHtml, /AI 실행 관제실/);
assert.doesNotMatch(indexHtml, /오케스트레이션 1\.0 관제 셸/);
assert.doesNotMatch(indexHtml, /임무 관제실/);
assert.doesNotMatch(indexHtml, /기본 운영 표면/);
assert.doesNotMatch(indexHtml, /오케스트레이션 1\.0 회사 운영 셸/);
assert.doesNotMatch(indexHtml, /company desk mode/);
assert.doesNotMatch(indexHtml, /회사 운영 콘솔/);
assert.doesNotMatch(indexHtml, /본부 운영 대시보드/);

console.log(
  JSON.stringify(
        {
          ok: true,
          companyShellFrameReset: {
        shell: ['Orchestration', 'Workflow Control', 'Workflow desk', '업무'],
        nav: ['업무', '검토', '운영'],
        summary: ['회사 디렉터리', '열린 실행', '열린 승인선', 'company-directory-summary', '회사 디렉터리 상태'],
        directory: ['company-directory-section-title', '${label} 팀'],
      },
    },
    null,
    2,
  ),
);
