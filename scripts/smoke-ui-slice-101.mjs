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

assert.match(appJs, /const renderInboxList = \(items, options\) =>/);
assert.match(appJs, /class="panel-header panel-header-tight"/);
assert.match(appJs, /class="panel-copy panel-copy-tight"/);
assert.match(appJs, /copy: '아래 deck은 현재 안건 판단만 먼저 요약하고, 실제 선택과 처리 큐는 바로 아래에서 이어갑니다\.'/);
assert.match(appJs, /copy: '지금 막힌 게이트만 고르고 바로 처리합니다\.'/);
assert.match(appJs, /copy: '방금 끝난 승인과 해결만 감사 추적으로 확인합니다\.'/);
assert.match(appJs, /scopeToken: '지금 처리'/);
assert.match(appJs, /scopeToken: '감사 추적'/);

const mission = Object.values(executionGateState.missions)[0];
const pendingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');
const pendingInboxItem = pendingApproval?.inboxItemId
  ? executionGateState.decisionInboxItems[pendingApproval.inboxItemId]
  : null;
const resolvedItems = Object.values(executionGateState.decisionInboxItems).filter((item) => item.status === 'resolved');

assert.ok(mission);
assert.ok(pendingApproval);
assert.ok(pendingInboxItem);
assert.equal(mission.status, 'executing');
assert.equal(pendingInboxItem.kind, 'approval');
assert.equal(resolvedItems.length, 0);

console.log(
  JSON.stringify(
    {
      ok: true,
      decisionInboxQueueDensity: {
        headers: ['대기 결재', '최근 처리'],
        deckRole: '현재 안건 판단 우선',
        queueRoles: ['지금 처리', '감사 추적'],
        pendingCount: 1,
        resolvedCount: resolvedItems.length,
        missionStatus: mission.status,
        inboxKind: pendingInboxItem.kind,
      },
    },
    null,
    2,
  ),
);
