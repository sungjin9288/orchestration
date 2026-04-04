import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /copy: '아래 deck은 현재 셀 판단만 먼저 남기고, 새 셀 추가는 바로 아래 접수 폼으로 넘깁니다\.'/);
assert.match(appJs, /<strong>새 실행 셀<\/strong>/);
assert.match(appJs, /여기서는 새 셀만 빠르게 추가합니다\. 현재 상태 판단은 위 카드에서 끝냅니다\./);
assert.match(appJs, /createToken\('제목만으로 시작', 'accent'\)/);
assert.match(appJs, /createToken\('의도는 선택', 'neutral'\)/);
assert.match(appJs, /세부 제어는 선택된 셀 상세에서 이어갑니다\./);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const pendingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(mission);
assert.ok(task);
assert.ok(pendingApproval);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(pendingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardOrderDeskDensity: {
        deckRole: '현재 셀 판단 우선',
        orderDeskTitle: '새 실행 셀',
        orderDeskTokens: ['제목만으로 시작', '의도는 선택'],
        missionStatus: mission.status,
        waitingApproval: task.flags.waitingApproval,
        allowedNextAction: pendingApproval.allowedNextAction,
      },
    },
    null,
    2,
  ),
);
