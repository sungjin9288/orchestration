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

assert.match(appJs, /선택된 실행 셀만 세 칸으로 요약하는 작업판/);
assert.match(appJs, /copy: '아래 deck은 현재 셀 판단만 먼저 남기고, 새 셀 추가는 바로 아래 접수 폼으로 넘깁니다\.'/);
assert.match(appJs, /desk: '작업판'/);
assert.match(appJs, /label: '현재 셀'/);
assert.match(appJs, /label: '다음 행동'/);
assert.match(appJs, /<strong>새 실행 셀<\/strong>/);
assert.match(appJs, /여기서는 새 셀만 빠르게 추가합니다\. 현재 상태 판단은 위 카드에서 끝냅니다\./);
assert.match(appJs, /빠른 추가/);
assert.match(appJs, /세부 제어는 선택된 셀 상세에서 이어갑니다\./);
assert.match(appJs, /선택 사항: 원하는 결과나 경계만 짧게 적으세요/);
assert.match(appJs, /실행 셀 추가/);
assert.match(appJs, /현재 셀/);
assert.match(appJs, /다음 행동/);
assert.match(appJs, /승인선/);
assert.match(appJs, /class="card taskboard-task-card/);
assert.match(appJs, /class="card-title-row taskboard-task-head"/);
assert.match(appJs, /class="card-copy detail-copy-compact taskboard-task-intent"/);
assert.match(appJs, /class="card-copy detail-copy-compact taskboard-task-summary"/);
assert.match(appJs, /class="taskboard-task-foot"/);
assert.match(appJs, /class="card-copy detail-copy-compact taskboard-task-next"/);
assert.match(appJs, /class="task-create-form task-create-form-compact taskboard-order-desk"/);
assert.match(appJs, /class="taskboard-order-head"/);
assert.match(appJs, /class="form-actions form-actions-inline form-actions-compact taskboard-order-actions"/);

assert.match(styles, /\.taskboard-task-card \{/);
assert.match(styles, /\.taskboard-task-head \{/);
assert.match(styles, /\.taskboard-task-intent \{/);
assert.match(styles, /\.taskboard-task-summary \{/);
assert.match(styles, /\.taskboard-task-foot \{/);
assert.match(styles, /\.taskboard-task-next \{/);
assert.match(styles, /\.taskboard-order-desk \{/);
assert.match(styles, /\.taskboard-order-head \{/);
assert.match(styles, /\.taskboard-order-actions \{/);

assert.doesNotMatch(appJs, /작업판은 프로젝트 준비, 라이프사이클, 게이트 처리, 후속 실행을 다루는 세부 제어 표면입니다\./);

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
      hqTaskboardDensity: {
        cards: ['현재 셀', '다음 행동', '승인선'],
        orderDesk: ['실행 셀 접수', '빠른 추가', '세부 제어는 아래'],
        taskCardClasses: [
          'taskboard-task-card',
          'taskboard-task-head',
          'taskboard-task-intent',
          'taskboard-task-summary',
          'taskboard-task-foot',
          'taskboard-task-next',
        ],
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
