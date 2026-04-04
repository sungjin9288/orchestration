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

assert.match(
  appJs,
  /copy: '아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다\.'/,
);
assert.match(appJs, /label: '현재 안건'/);
assert.match(appJs, /label: '다음 처리'/);
assert.match(appJs, /label: '현재 맥락'/);
assert.match(appJs, /title: selectedItem \? selectedItem\.title : '선택 대기'/);
assert.match(
  appJs,
  /title: selectedItem \? inboxDetailSnapshot\.nextTitle : pendingItems\.length > 0 \? '대기 큐 처리' : '최근 처리 확인'/,
);
assert.match(appJs, /copy: selectedItem\s*\?\s*inboxDetailSnapshot\.nextCopy/);
assert.match(appJs, /\$\{decisionViewportStrip\}\s*\n\s*\$\{decisionDeck\}/);

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
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(pendingInboxItem.kind, 'approval');
assert.equal(pendingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionInboxDeckDensity: {
        stripFirst: true,
        deckCards: ['현재 안건', '다음 처리', '현재 맥락'],
        missionStatus: mission.status,
        taskId: task.id,
        inboxKind: pendingInboxItem.kind,
        waitingApproval: task.flags.waitingApproval,
      },
    },
    null,
    2,
  ),
);
