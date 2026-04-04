import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const stylesPath = path.join(repoRoot, 'ui', 'styles.css');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const styles = fs.readFileSync(stylesPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /function getExecutionRoleDisplay\(role\)/);
assert.match(appJs, /function getExecutionStageDisplay\(stage\)/);
assert.match(appJs, /function renderExecutionCommandDeck\(options = \{\}\)/);
assert.match(appJs, /<h2>안건 브리프<\/h2>/);
assert.match(appJs, /브리프 핵심 4줄/);
assert.match(appJs, /브리프 액션/);
assert.match(appJs, /<h2>참모 회의<\/h2>/);
assert.match(appJs, /회의 발언 기록/);
assert.match(appJs, /<h2>회의 결론<\/h2>/);
assert.match(appJs, /결론 승인/);
assert.match(appJs, /작전 지휘실/);
assert.match(appJs, /회의에서 정한 방향을 실행 셀에 내리는 작전실/);
assert.match(appJs, /<h2>작전실<\/h2>/);
assert.match(appJs, /작전 개요/);
assert.match(appJs, /지휘 승인선/);
assert.match(appJs, /작전 보류 사유/);
assert.match(appJs, /사전 점검 준비/);
assert.match(appJs, /즉시 이동/);
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
        missionDetail: ['안건 브리프', '브리프 핵심 4줄', '브리프 액션'],
        council: ['참모 회의', '회의 발언 기록', '회의 결론', '결론 승인'],
        execution: ['작전 지휘실', '작전실', '지휘 승인선', '작전 보류 사유', '사전 점검 준비'],
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
