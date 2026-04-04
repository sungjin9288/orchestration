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

assert.match(appJs, /heading: '결재함 아래는 큐와 처리 판단으로 나눕니다'/);
assert.match(appJs, /label: '왼쪽 큐'/);
assert.match(appJs, /label: '오른쪽 판단'/);
assert.match(appJs, /title: '대기 결재 \+ 최근 처리'/);
assert.match(appJs, /label: '영향 셀 열기'/);
assert.match(appJs, /action: 'open-taskboard-task'/);
assert.match(appJs, /heading: '선택된 결재 안건만 세 칸으로 요약하는 결재함'/);

const mission = Object.values(executionGateState.missions)[0];
const pendingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');
const pendingInboxItem = pendingApproval?.inboxItemId
  ? executionGateState.decisionInboxItems[pendingApproval.inboxItemId]
  : null;
const task = mission?.linkedTaskId ? executionGateState.tasks[mission.linkedTaskId] : null;

assert.ok(mission);
assert.ok(task);
assert.ok(pendingApproval);
assert.ok(pendingInboxItem);
assert.equal(task.flags.waitingApproval, true);
assert.equal(pendingInboxItem.kind, 'approval');
assert.equal(pendingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionInboxViewportHandoff: {
        strip: ['왼쪽 큐', '오른쪽 판단', '지금 열기'],
        selectedTaskId: task.id,
        inboxKind: pendingInboxItem.kind,
        waitingApproval: task.flags.waitingApproval,
        allowedNextAction: pendingApproval.allowedNextAction,
      },
    },
    null,
    2,
  ),
);
