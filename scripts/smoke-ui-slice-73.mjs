import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionLabelsPath = path.join(repoRoot, 'ui', 'execution-labels.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionLabels = fs.readFileSync(executionLabelsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /from '\.\/execution-labels\.js'/);
assert.match(executionLabels, /export function getExecutionRoleDisplay\(role\) \{/);
assert.match(executionLabels, /export function getExecutionStageDisplay\(stage\) \{/);
assert.match(appJs, /function renderExecutionCommandDeck\(options = \{\}\)/);
assert.match(appJs, /<h2>안건 등록대장<\/h2>/);
assert.match(appJs, /신규 안건 등록/);
assert.match(appJs, /등록 후속/);
assert.match(appJs, /<h2>회의 참석 등록부<\/h2>/);
assert.match(appJs, /회의 발언 기록/);
assert.match(appJs, /<h2>권고와 승인 선반<\/h2>/);
assert.match(appJs, /승인 선반/);
assert.match(appJs, /작업 지시 보드/);
assert.match(appJs, /현재 작업 지시와 승인 게이트를 같은 제어선에서 다룹니다/);
assert.match(appJs, /<h2>실행 지시 데스크<\/h2>/);
assert.match(appJs, /작업 지시 개요/);
assert.match(appJs, /승인선/);
assert.match(appJs, /차단 사유/);
assert.match(appJs, /실행 준비 패킷/);
assert.match(appJs, /빠른 이동/);
assert.doesNotMatch(appJs, /회의 브리프 한눈에/);

assert.match(styles, /\.command-deck \{/);
assert.match(styles, /\.command-deck-card \{/);
assert.match(styles, /\.command-deck-label \{/);
assert.match(styles, /\.command-deck-title \{/);
assert.match(styles, /\.command-deck-copy \{/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      hqMeetingFlowthrough: {
        missionDetail: ['안건 등록대장', '신규 안건 등록', '등록 후속'],
        council: ['회의 참석 등록부', '회의 발언 기록', '권고와 승인 선반', '승인 선반'],
        execution: ['작업 지시 보드', '실행 지시 데스크', '승인선', '차단 사유', '실행 준비 패킷'],
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          allowedNextAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
