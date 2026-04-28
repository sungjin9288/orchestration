import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');

assert.match(indexHtml, /class="nav-group-summary"/);
assert.match(indexHtml, /업무 메뉴/);
assert.match(indexHtml, /목표부터 결과 패킷까지/);
assert.match(indexHtml, /미션 · 협의회 · 실행 · 산출물을 순서대로 확인합니다\./);
assert.match(indexHtml, /검토 메뉴/);
assert.match(indexHtml, /승인·근거·로그 확인/);
assert.match(indexHtml, /결정함 · 아티팩트 · 로그에서 판단 근거를 교차 확인합니다\./);
assert.match(indexHtml, /운영 메뉴/);
assert.match(indexHtml, /작업 셀과 담당 desk 관제/);
assert.match(indexHtml, /작업판에서 실행 셀 상태와 역할 배정을 확인합니다\./);

assert.match(styles, /\.nav-group-summary \{/);
assert.match(styles, /\.nav-group-summary-label \{/);
assert.match(styles, /\.nav-group-summary-title \{/);
assert.match(styles, /\.nav-group-summary-copy \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      navGroupOrientation: {
        groups: ['업무 메뉴', '검토 메뉴', '운영 메뉴'],
        summaries: ['목표부터 결과 패킷까지', '승인·근거·로그 확인', '작업 셀과 담당 desk 관제'],
        cssMarkers: ['nav-group-summary', 'nav-group-summary-copy'],
      },
    },
    null,
    2,
  ),
);
