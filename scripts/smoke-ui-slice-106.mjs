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

assert.match(indexHtml, /shell-command-strip/);
assert.match(indexHtml, /project_path 먼저/);
assert.match(indexHtml, /런타임 상태/);
assert.match(indexHtml, /프로젝트 도크/);
assert.match(indexHtml, /런타임 연결/);
assert.match(indexHtml, /흐름 현황/);
assert.match(indexHtml, /사람 게이트/);
assert.match(indexHtml, /id="summary-card-runtime"/);
assert.match(indexHtml, /id="pending-gate-copy"/);
assert.match(indexHtml, /안건 접수부터 결과 보고까지 한 줄 흐름으로 넘깁니다\./);
assert.match(indexHtml, /작업 셀, 런 로그, 증적, 사람 승인을 깊게 훑는 관제 도크입니다\./);

assert.match(appJs, /const SURFACE_DOCK_METADATA = \{/);
assert.match(appJs, /현재 안건과 다음 처리를 판단합니다\./);
assert.match(appJs, /runtime bridge 연결 유지/);
assert.match(appJs, /사람 검토가 필요한 게이트/);
assert.match(appJs, /nav-button-topline/);
assert.match(appJs, /최근 갱신/);
assert.match(appJs, /런타임 상태 요약 연결 실패/);
assert.doesNotMatch(indexHtml, /mission control/);
assert.doesNotMatch(indexHtml, /runtime status/);
assert.doesNotMatch(indexHtml, /project dock/);
assert.doesNotMatch(indexHtml, /runtime link/);
assert.doesNotMatch(indexHtml, /flow traffic/);
assert.doesNotMatch(indexHtml, /human gate/);
assert.doesNotMatch(appJs, /runtime snapshot 연결 실패/);

assert.match(styles, /\.shell-command-strip \{/);
assert.match(styles, /\.shell-status-card \{/);
assert.match(styles, /\.summary-card\.is-alert \{/);
assert.match(styles, /\.nav-group-copy \{/);
assert.match(styles, /\.nav-button-topline \{/);
assert.match(styles, /\.nav-button-count \{/);

console.log(
  JSON.stringify(
    {
      ok: true,
      homeControlPlane: {
        directives: ['project_path 먼저', '리뷰 후 완료', '승인 후 커밋'],
        summaryPods: ['현재 프로젝트', '런타임', '실행 수', '대기 게이트'],
        modeDock: ['미션', '협의회', '실행', '산출물', '작업판', '로그', '아티팩트', '결정함'],
      },
    },
    null,
    2,
  ),
);
