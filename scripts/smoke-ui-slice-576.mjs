import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');
const surfaceConfigPath = path.join(repoRoot, 'ui', 'surface-config.js');

const appJs = fs.readFileSync(appPath, 'utf8');
const surfaceConfigJs = fs.readFileSync(surfaceConfigPath, 'utf8');

assert.match(appJs, /const playbookTitleId = `workspace-playbook-title-\$\{activeGroupId\}`;/);
assert.match(appJs, /const playbookSummaryId = `workspace-playbook-summary-\$\{activeGroupId\}`;/);
assert.match(appJs, /aria-labelledby="\$\{escapeHtml\(playbookTitleId\)\}"\$\{meta\.copy \? ` aria-describedby="\$\{escapeHtml\(playbookSummaryId\)\}"` : ''\}/);
assert.match(appJs, /<p class="workspace-playbook-summary" id="\$\{escapeHtml\(playbookSummaryId\)\}">\$\{escapeHtml\(meta\.copy\)\}<\/p>/);
assert.match(surfaceConfigJs, /copy: '왼쪽 버튼을 누르면 해당 desk만 열립니다\. 작업 결과는 산출물, 근거는 아티팩트, 실행 흐름은 로그에서 확인합니다\.'/);
assert.match(surfaceConfigJs, /copy: '승인이 필요하면 결정함, 실제 작업 근거는 아티팩트, 실행 중 무슨 일이 있었는지는 로그에서 봅니다\.'/);
assert.match(surfaceConfigJs, /copy: '작업판은 세부 실행 셀의 관제 위치입니다\. 여기서 담당 desk와 역할을 정리하고 실제 결과 확인은 산출물·아티팩트로 돌아갑니다\.'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      workspacePlaybookDescribedSection: {
        section: 'aria-describedby',
        summary: 'visible summary paragraph',
        idSource: 'active nav group',
      },
    },
    null,
    2,
  ),
);
