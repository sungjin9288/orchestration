import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /artifacts:\s*\{\s*copy: '현재 증적과 연결 근거를 검토합니다\.',\s*kicker: '증적'/);
assert.match(appJs, /council:\s*\{\s*copy: '회의 결론과 이견 정리를 한 지점에서 봅니다\.',\s*kicker: '회의'/);
assert.match(appJs, /'decision-inbox':\s*\{\s*copy: '현재 승인 안건과 다음 처리를 판단합니다\.',\s*kicker: '승인선'/);
assert.match(appJs, /deliverables:\s*\{\s*copy: '현재 보고 상태와 다음 인계선을 확인합니다\.',\s*kicker: '보고'/);
assert.match(appJs, /execution:\s*\{\s*copy: '현재 작업 지시와 다음 실행을 정리합니다\.',\s*kicker: '실행'/);
assert.match(appJs, /logs:\s*\{\s*copy: '현재 실행 로그와 다음 확인 대상을 빠르게 훑습니다\.',\s*kicker: '실행 로그'/);
assert.match(appJs, /mission:\s*\{\s*copy: '현재 안건과 다음 등록 동선을 정리합니다\.',\s*kicker: '접수 라인'/);
assert.match(appJs, /taskboard:\s*\{\s*copy: '현재 작업 셀과 다음 배정을 조정합니다\.',\s*kicker: '실행 셀'/);

assert.match(appJs, /class="nav-button-main"/);
assert.match(appJs, /nav-button-count">\$\{escapeHtml\(String\(count\)\)\}<\/span>/);
assert.doesNotMatch(appJs, /nav-button-kicker/);
assert.doesNotMatch(appJs, /nav-button-meta/);

assert.doesNotMatch(appJs, /kicker: 'Evidence'/);
assert.doesNotMatch(appJs, /kicker: 'Council'/);
assert.doesNotMatch(appJs, /kicker: 'Gate'/);
assert.doesNotMatch(appJs, /kicker: 'Report'/);
assert.doesNotMatch(appJs, /kicker: 'Execute'/);
assert.doesNotMatch(appJs, /kicker: 'Runs'/);
assert.doesNotMatch(appJs, /kicker: 'Intake'/);
assert.doesNotMatch(appJs, /kicker: 'Cells'/);
assert.doesNotMatch(appJs, /'Surface'/);

console.log(
  JSON.stringify(
    {
      ok: true,
      surfaceMenuBaseline: {
        dockMetadata: ['증적', '회의', '승인선', '보고', '실행', '실행 로그', '접수 라인', '실행 셀'],
        navMarkup: ['nav-button-main', 'nav-button-title', 'nav-button-count'],
      },
    },
    null,
    2,
  ),
);
