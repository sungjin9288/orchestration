import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(indexHtml, /회사 디렉터리/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);
assert.match(appJs, /const COMPANY_ROLE_OPTIONS = \[/);
assert.match(appJs, /const COMPANY_DESK_OPTIONS = \[/);
assert.match(appJs, /function renderCompanyDirectory\(data\)/);
assert.match(appJs, /function addCompanyMember\(\)/);
assert.match(appJs, /function updateCompanyMember\(memberId, values\)/);
assert.match(appJs, /function removeCompanyMember\(memberId\)/);
assert.match(appJs, /data-form="create-company-member"/);
assert.match(appJs, /data-form="update-company-member"/);
assert.match(appJs, /AI 에이전트 추가/);
assert.match(appJs, /배정 저장/);
assert.match(appJs, /Chief of Staff/);
assert.match(appJs, /Ops Manager/);
assert.doesNotMatch(indexHtml, /오늘 근무 라인업/);
assert.doesNotMatch(indexHtml, /운영 규정/);
assert.doesNotMatch(indexHtml, /오늘 처리 동선/);

console.log(
  JSON.stringify(
    {
      ok: true,
      companyDirectoryManagement: {
        markers: [
          '회사 디렉터리',
          'company-directory-summary',
          'company-directory-shell',
          'AI 에이전트 추가',
          '배정 저장',
        ],
      },
    },
    null,
    2,
  ),
);
