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
const councilDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');

assert.equal(fs.existsSync(councilDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const councilDraftState = JSON.parse(fs.readFileSync(councilDraftStatePath, 'utf8'));
const councilSession = Object.values(councilDraftState.councilSessions)[0];

assert.match(indexHtml, /오케스트레이션 1\.0 관제 셸/);
assert.match(indexHtml, /AI 실행 관제실/);
assert.match(indexHtml, /shell-window-bar/);
assert.match(indexHtml, /shell-agent-row/);
assert.match(indexHtml, /본부 운영 표면/);

assert.match(appJs, /본부 브리핑실/);
assert.match(appJs, /오늘의 안건/);
assert.match(appJs, /안건 접수 데스크/);
assert.match(appJs, /안건 접수/);
assert.match(appJs, /빠른 접수/);
assert.match(appJs, /즉시 착석/);
assert.match(appJs, /오늘의 안건을 접수하면 네 역할이 바로 회의를 엽니다/);
assert.match(appJs, /네 역할이 안건을 두고 목표와 방향을 정하는 회의실/);
assert.match(appJs, /renderCouncilBoardroomStage\(/);
assert.match(appJs, /boardroom-seat-lead/);
assert.match(appJs, /boardroom-seat-left/);
assert.match(appJs, /boardroom-seat-right/);
assert.match(appJs, /boardroom-seat-bottom/);
assert.match(appJs, /참모진 착석/);

assert.match(styles, /\.briefing-hero \{/);
assert.match(styles, /\.boardroom-stage \{/);
assert.match(styles, /\.boardroom-table \{/);
assert.match(styles, /\.boardroom-seat \{/);
assert.match(styles, /\.boardroom-seat-lead \{/);
assert.match(styles, /\.boardroom-seat-left \{/);
assert.match(styles, /\.boardroom-seat-right \{/);
assert.match(styles, /\.boardroom-seat-bottom \{/);

assert.doesNotMatch(appJs, /회의 안건 등록/);

assert.ok(councilSession, 'expected a council session fixture');
assert.equal(councilSession.missionId, 'mission-0001');
assert.deepEqual(
  councilSession.participants.map((participant) => participant.role),
  ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
);

console.log(
  JSON.stringify(
    {
      ok: true,
      hqMeetingShell: {
        headline: 'AI 실행 관제실',
        flow: ['안건 접수', '참모진 착석', '회의', '방향 선택'],
        stageClasses: [
          'briefing-hero',
          'boardroom-stage',
          'boardroom-table',
          'boardroom-seat-lead',
        ],
      },
    },
    null,
    2,
  ),
);
