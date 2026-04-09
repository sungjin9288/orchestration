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

assert.match(indexHtml, /Orchestration/);
assert.match(indexHtml, /Workflow Control/);
assert.match(indexHtml, /office-sidebar/);
assert.match(indexHtml, /office-brand-card/);
assert.match(indexHtml, /shell-window-bar/);
assert.match(indexHtml, /업무/);
assert.match(indexHtml, /검토/);
assert.match(indexHtml, /운영/);
assert.match(indexHtml, /회사 디렉터리/);
assert.match(indexHtml, /id="company-directory-summary"/);
assert.match(indexHtml, /id="company-directory-shell"/);

assert.match(appJs, /안건 등록대장/);
assert.match(appJs, /오늘 안건을 등록대장에 올리고 바로 다음 회의를 엽니다/);
assert.match(appJs, /Mission은 새 안건 등록, 현재 배정, 다음 처리 트리거를 같은 접수 보드에서 다룹니다\./);
assert.match(appJs, /신규 안건 등록/);
assert.match(appJs, /배정 등록대장/);
assert.match(appJs, /다음 처리 트리거/);
assert.match(appJs, /renderMissionIntakeBoard\(/);
assert.match(appJs, /등록, 배정, 다음 처리를 같은 보드에서 나눕니다/);
assert.match(appJs, /등록 즉시 회의 초안이 열리고, 승인 전까지는 실행 셀로 넘어가지 않습니다\./);

assert.match(styles, /\.office-sidebar \{/);
assert.match(styles, /\.office-brand-card \{/);
assert.match(styles, /\.shell-header-main \{/);
assert.match(styles, /\.mission-intake-board \{/);
assert.match(styles, /\.mission-intake-grid \{/);
assert.match(styles, /\.mission-intake-card \{/);
assert.match(styles, /\.mission-intake-card-primary \{/);
assert.match(styles, /\.mission-intake-label \{/);
assert.match(styles, /\.mission-intake-title \{/);
assert.match(styles, /\.mission-intake-copyline \{/);

assert.doesNotMatch(appJs, /회의 안건 등록/);
assert.doesNotMatch(appJs, /빠른 접수/);
assert.doesNotMatch(appJs, /즉시 착석/);

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
      missionRegisterShell: {
        headline: 'Orchestration',
        shell: ['Workflow Control', '회사 디렉터리', '업무'],
        flow: ['안건 등록대장', '신규 안건 등록', '배정 등록대장', '다음 처리 트리거'],
        stageClasses: [
          'office-sidebar',
          'office-brand-card',
          'shell-header-main',
          'mission-intake-board',
          'mission-intake-grid',
          'mission-intake-card-primary',
        ],
      },
    },
    null,
    2,
  ),
);
