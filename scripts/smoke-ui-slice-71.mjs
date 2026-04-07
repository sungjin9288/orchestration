import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const councilDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');

assert.equal(fs.existsSync(councilDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const councilDraftState = JSON.parse(fs.readFileSync(councilDraftStatePath, 'utf8'));
const councilSession = Object.values(councilDraftState.councilSessions)[0];

assert.match(appJs, /rank: '총지휘관'/);
assert.match(appJs, /rank: '수석 전략관'/);
assert.match(appJs, /rank: '수석 설계관'/);
assert.match(appJs, /rank: '선임 실행관'/);
assert.match(appJs, /orderLabel: '지휘 서열 1'/);
assert.match(appJs, /orderLabel: '지휘 서열 2'/);
assert.match(appJs, /orderLabel: '지휘 서열 3'/);
assert.match(appJs, /orderLabel: '지휘 서열 4'/);
assert.match(appJs, /최종 추천안과 인계 승인 흐름을 한 지점에서 총괄합니다\./);
assert.match(appJs, /목표 해석과 범위 제한을 맡는 수석 참모입니다\./);
assert.match(appJs, /설계 파급을 막고 시스템 경계를 봉인하는 참모입니다\./);
assert.match(appJs, /첫 실행 단위를 편성하고 바로 인계 가능한 수준으로 자릅니다\./);
assert.match(appJs, /cast-card-lead/);
assert.match(appJs, /cast-mark-stack/);
assert.match(appJs, /cast-order/);
assert.match(appJs, /cast-rank-row/);
assert.match(appJs, /cast-rank/);
assert.match(appJs, /cast-command/);
assert.match(appJs, /직급 체계/);
assert.match(appJs, /네 역할이 현재 정렬을/);
assert.match(appJs, /같은 네 역할이 계속 참여해, 결론이 숨은 메타데이터가 아니라 실제 협의 흐름처럼 읽힙니다\./);
assert.match(appJs, /createToken\('최종 권고', 'accent'\)/);
assert.match(appJs, /createToken\('참모진', 'neutral'\)/);

assert.match(styles, /\.cast-card-lead \{/);
assert.match(styles, /\.cast-mark-stack \{/);
assert.match(styles, /\.cast-order \{/);
assert.match(styles, /\.cast-rank-row \{/);
assert.match(styles, /\.cast-rank \{/);
assert.match(styles, /\.cast-command \{/);

assert.ok(councilSession, 'expected a council session fixture');
assert.deepEqual(
  councilSession.participants.map((participant) => participant.role),
  ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
);

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastRankDesign: {
        ranks: ['총지휘관', '수석 전략관', '수석 설계관', '선임 실행관'],
        order: ['지휘 서열 1', '지휘 서열 2', '지휘 서열 3', '지휘 서열 4'],
        classes: ['cast-card-lead', 'cast-mark-stack', 'cast-order', 'cast-rank', 'cast-command'],
      },
    },
    null,
    2,
  ),
);
