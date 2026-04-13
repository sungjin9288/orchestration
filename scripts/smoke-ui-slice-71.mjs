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

assert.match(appJs, /rank: '회의 리드'/);
assert.match(appJs, /rank: '전략 역할'/);
assert.match(appJs, /rank: '설계 역할'/);
assert.match(appJs, /rank: '실행 역할'/);
assert.match(appJs, /orderLabel: '역할 순서 1'/);
assert.match(appJs, /orderLabel: '역할 순서 2'/);
assert.match(appJs, /orderLabel: '역할 순서 3'/);
assert.match(appJs, /orderLabel: '역할 순서 4'/);
assert.match(appJs, /현재 결론과 다음 인계 판단을 한 지점에서 정리합니다\./);
assert.match(appJs, /목표 해석과 범위 조정을 맡는 전략 역할입니다\./);
assert.match(appJs, /설계 파급을 줄이고 시스템 경계를 지키는 역할입니다\./);
assert.match(appJs, /첫 실행 단위를 정리하고 바로 인계 가능한 수준으로 나눕니다\./);
assert.match(appJs, /cast-card-lead/);
assert.match(appJs, /cast-mark-stack/);
assert.match(appJs, /cast-order/);
assert.match(appJs, /cast-rank-row/);
assert.match(appJs, /cast-rank/);
assert.match(appJs, /cast-command/);
assert.match(appJs, /직급 체계/);
assert.match(appJs, /네 역할이 현재 정렬을/);
assert.match(appJs, /참석 역할이 끝까지 기록되어 권고와 승인선의 근거를 같은 회의 흐름에서 확인할 수 있습니다\./);
assert.match(appJs, /createToken\('최종 권고', 'accent'\)/);
assert.match(appJs, /createToken\('참여 역할', 'neutral'\)/);

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
        ranks: ['회의 리드', '전략 역할', '설계 역할', '실행 역할'],
        order: ['역할 순서 1', '역할 순서 2', '역할 순서 3', '역할 순서 4'],
        classes: ['cast-card-lead', 'cast-mark-stack', 'cast-order', 'cast-rank', 'cast-command'],
      },
    },
    null,
    2,
  ),
);
