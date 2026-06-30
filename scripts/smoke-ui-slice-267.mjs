import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const companyConfigPath = path.join(repoRoot, 'ui', 'company-config.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');
const companyConfig = fs.readFileSync(companyConfigPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);
assert.match(indexHtml, /data-nav-group-tab="workflows"/);
assert.match(indexHtml, /data-nav-group-tab="review"/);
assert.match(indexHtml, /data-nav-group-tab="ops"/);

assert.match(appJs, /from '\.\/company-config\.js'/);
assert.match(companyConfig, /export const COMPANY_ROLE_OPTIONS = \[/);
assert.match(companyConfig, /export const COMPANY_DESK_OPTIONS = \[/);
assert.match(appJs, /function renderCompanyDirectory\(data\)/);
assert.match(appJs, /function renderReviewOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /function renderOpsOverview\(data, context, activeGroupId\)/);
assert.match(appJs, /data-form="create-company-member"/);
assert.match(appJs, /data-form="update-company-member"/);
assert.match(appJs, /AI 에이전트 추가/);
assert.match(appJs, /배정 저장/);
assert.match(appJs, /company-directory-section-title">\$\{escapeHtml\(`\$\{label\} 팀`\)\}<\/strong>/);
assert.match(appJs, /company-directory-section-list/);
assert.match(appJs, /company-directory-section-title/);

assert.match(styles, /\.company-directory-summary-grid \{/);
assert.match(styles, /\.company-directory-section-list \{/);
assert.match(styles, /\.company-directory-section \{/);
assert.match(styles, /\.company-directory-row \{/);
assert.match(styles, /\.company-directory-assignment \{/);
assert.match(styles, /\.control-overview-grid-review \{/);
assert.match(styles, /\.control-overview-grid-ops \{/);
assert.match(styles, /\.company-member-create-form \{/);
assert.match(styles, /\.company-member-admin-card \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      groupedWorkspaceDirectory: {
        persistentSidebar: ['company-directory-summary', 'company-directory-shell'],
        workspaces: ['workflows', 'review', 'ops'],
        opsControls: ['create-company-member', 'update-company-member', 'AI 에이전트 추가', '배정 저장'],
      },
    },
    null,
    2,
  ),
);
