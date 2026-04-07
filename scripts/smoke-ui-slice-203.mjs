import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appPath = path.join(repoRoot, 'ui', 'app.js');

const appJs = fs.readFileSync(appPath, 'utf8');

assert.match(appJs, /artifacts:\s*\{\s*copy: '현재 증적과 연결 근거를 확인합니다\.',\s*kicker: '증적'/);
assert.match(appJs, /council:\s*\{\s*copy: '추천안과 방향을 함께 정리합니다\.',\s*kicker: '협의'/);
assert.match(appJs, /'decision-inbox':\s*\{\s*copy: '현재 안건과 다음 처리를 판단합니다\.',\s*kicker: '승인'/);
assert.match(appJs, /deliverables:\s*\{\s*copy: '현재 보고 판단과 다음 행동을 확인합니다\.',\s*kicker: '보고'/);
assert.match(appJs, /execution:\s*\{\s*copy: '현재 실행 판단과 다음 행동을 정리합니다\.',\s*kicker: '실행'/);
assert.match(appJs, /logs:\s*\{\s*copy: '현재 실행 기록과 다음 확인을 빠르게 훑습니다\.',\s*kicker: '실행 기록'/);
assert.match(appJs, /mission:\s*\{\s*copy: '현재 안건 판단과 바로 이동을 시작합니다\.',\s*kicker: '접수'/);
assert.match(appJs, /taskboard:\s*\{\s*copy: '현재 실행 셀과 다음 실행을 조정합니다\.',\s*kicker: '실행 셀'/);

assert.match(appJs, /createToken\(`도크:\$\{metadata\.kicker \|\| '표면'\}`,\s*'accent'\)/);
assert.match(appJs, /nav-button-kicker">\$\{escapeHtml\(metadata\.kicker \|\| '표면'\)\}<\/span>/);

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
      surfaceKickerBaseline: {
        dockMetadata: ['증적', '협의', '승인', '보고', '실행', '실행 기록', '접수', '실행 셀'],
        fallback: '표면',
      },
    },
    null,
    2,
  ),
);
