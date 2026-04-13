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

assert.match(appJs, /heading: '작업판 아래는 레인과 상세 판단으로 나눕니다'/);
assert.match(appJs, /label: '왼쪽 레인'/);
assert.match(appJs, /label: '오른쪽 상세'/);
assert.match(appJs, /title: '실행 셀 목록 \+ 빠른 추가'/);
assert.match(appJs, /title: focusedTask \? '현재 상태 \+ 다음 실행' : '선택 셀 대기'/);
assert.match(appJs, /action: 'open-surface'/);
assert.match(appJs, /targetSurface: 'decision-inbox'/);
assert.match(appJs, /label: '결재함'/);
assert.match(appJs, /heading: '선택된 실행 셀만 세 칸으로 요약하는 작업판'/);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const pendingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');
const pendingInboxItem = pendingApproval?.inboxItemId
  ? executionGateState.decisionInboxItems[pendingApproval.inboxItemId]
  : null;

assert.ok(mission);
assert.ok(task);
assert.ok(pendingApproval);
assert.ok(pendingInboxItem);
assert.equal(task.flags.waitingApproval, true);
assert.equal(pendingApproval.allowedNextAction, 'builder-live-mutation');
assert.equal(pendingInboxItem.kind, 'approval');

console.log(
  JSON.stringify(
    {
      ok: true,
      taskboardViewportHandoff: {
        strip: ['왼쪽 레인', '오른쪽 상세', '바로'],
        immediateSurface: 'decision-inbox',
        waitingApproval: task.flags.waitingApproval,
        allowedNextAction: pendingApproval.allowedNextAction,
        inboxKind: pendingInboxItem.kind,
      },
    },
    null,
    2,
  ),
);
