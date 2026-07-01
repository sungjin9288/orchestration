import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const councilConfigPath = path.join(repoRoot, 'ui', 'council-config.js');
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const councilDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');

assert.equal(fs.existsSync(councilDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const councilConfig = fs.readFileSync(councilConfigPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const councilDraftState = JSON.parse(fs.readFileSync(councilDraftStatePath, 'utf8'));
const councilSession = Object.values(councilDraftState.councilSessions)[0];

assert.match(appJs, /from '\.\/council-config\.js'/);
assert.match(councilConfig, /export const COUNCIL_CAST_ORDER = \['Conductor', 'Strategist', 'Architect', 'Decomposer'\];/);
assert.match(appJs, /참여 역할/);
assert.match(appJs, /참여 역할', 'accent'/);
assert.match(councilConfig, /정렬 책임/);
assert.match(councilConfig, /목표 정리/);
assert.match(councilConfig, /경계 보호/);
assert.match(councilConfig, /첫 실행 단위/);
assert.match(councilConfig, /displayName: '리드'/);
assert.match(councilConfig, /displayName: '전략'/);
assert.match(councilConfig, /displayName: '설계'/);
assert.match(councilConfig, /displayName: '실행'/);
assert.match(appJs, /renderCouncilCastCards\(selectedCouncilSession, \{ compact: true \}\)/);
assert.match(appJs, /renderCouncilCastCards\(null\)/);
assert.match(executionLabels, /export function getMissionStatusDisplay\(status\) \{/);
assert.match(executionLabels, /export function getCouncilStatusDisplay\(status\) \{/);
assert.match(executionLabels, /export function getTaskLifecycleDisplay\(state\) \{/);
assert.match(executionLabels, /export function getReviewStatusDisplay\(status\) \{/);
assert.match(executionLabels, /export function getApprovalStatusDisplay\(status\) \{/);
assert.match(appJs, /getCouncilCastEntry\(entry\.role, selectedCouncilSession\)\.displayName/);
assert.match(appJs, /createToken\(getMissionStatusDisplay\(selectedMission\.status\)/);
assert.match(appJs, /createToken\(`태스크:\$\{getTaskLifecycleDisplay\(linkedTask\.lifecycleState\)\}`/);
assert.match(appJs, /createToken\(\s*`리뷰:\$\{getReviewStatusDisplay\(/);
assert.match(appJs, /createToken\(\s*`승인:\$\{getApprovalStatusDisplay\(/);

assert.match(styles, /\.cast-grid \{/);
assert.match(styles, /\.cast-card \{/);
assert.match(styles, /\.cast-mark \{/);
assert.match(styles, /\.cast-quote \{/);
assert.match(styles, /\.cast-mark-accent \{/);
assert.match(styles, /\.cast-mark-warning \{/);

assert.ok(councilSession, 'expected a council session fixture');
assert.deepEqual(
  councilSession.participants.map((participant) => participant.role),
  ['Conductor', 'Strategist', 'Architect', 'Decomposer'],
);
assert.deepEqual(
  councilSession.transcript.map((entry) => entry.role),
  ['Strategist', 'Architect', 'Decomposer', 'Conductor'],
);
assert.deepEqual(
  councilSession.participants.map((participant) => participant.focus),
  ['정렬 체크포인트와 한정된 인계', '사용자 목표, 결과 프레이밍, 범위 제어', '시스템 경계와 의미론 안전', '첫 슬라이스 분해와 실행 인계'],
);
assert.deepEqual(
  councilSession.transcript.map((entry) => entry.stance),
  ['목표 정리', '경계 보호', '실행 절단', '추천안'],
);
assert.match(councilSession.summary, /한정된 슬라이스/);
assert.match(councilSession.recommendation, /한정된 슬라이스/);
assert.equal(
  councilSession.openQuestions.some((question) =>
    /(constraints|bounded slice|alignment|advanced ops|evidence)/.test(question),
  ),
  false,
);
assert.equal(councilSession.selectedPlan.title, '단일 한정 슬라이스');

console.log(
  JSON.stringify(
    {
      ok: true,
      councilCastVisibility: {
        roles: councilSession.participants.map((participant) => participant.role),
        transcriptRoles: councilSession.transcript.map((entry) => entry.role),
        castClasses: ['cast-grid', 'cast-card', 'cast-mark', 'cast-quote'],
      },
    },
    null,
    2,
  ),
);
