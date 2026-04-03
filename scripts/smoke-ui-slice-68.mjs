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

assert.match(appJs, /function getInboxStatusDisplay\(status\)/);
assert.match(appJs, /function getInboxResolutionActionDisplay\(action\)/);
assert.match(appJs, /function renderSurfaceLeadStrip\(options = \{\}\)/);
assert.match(appJs, /title: '관제실 로그실'/);
assert.match(appJs, /title: '증적 보관실'/);
assert.match(appJs, /title: '관제실 결재함'/);
assert.match(appJs, /실행 프로바이더/);
assert.match(appJs, /프로바이더 업데이트/);
assert.match(appJs, /로그는 여전히 고급 점검 표면입니다/);
assert.match(appJs, /아티팩트는 의도적으로 고급 provenance 표면에 남깁니다/);
assert.match(appJs, /결정함은 명시적인 승인과 결정 처리에 계속 열려 있지만/);
assert.match(appJs, /선택된 run 없음/);
assert.match(appJs, /선택된 증적 없음/);
assert.match(appJs, /선택된 결재 없음/);
assert.match(appJs, /리뷰어 실행/);
assert.match(appJs, /커밋 패키지 준비/);
assert.match(appJs, /릴리스 패키지 준비/);
assert.match(appJs, /승인된 종료 정리 이어가기/);
assert.match(appJs, /getInboxKindDisplay\(item\.kind\)/);
assert.match(appJs, /getInboxStatusDisplay\(item\.status\)/);
assert.match(appJs, /getInboxResolutionActionDisplay\(selectedItem\.resolution\.action\)/);
assert.match(appJs, /createToken\(getRunStatusDisplay\(selectedRun\.status\), getRunTone\(selectedRun\.status\)\)/);
assert.match(appJs, /createToken\(getTaskLifecycleDisplay\(selectedTask\.lifecycleState\), 'neutral'\)/);
assert.match(appJs, /createToken\(`리뷰:\$\{getReviewStatusDisplay\(selectedTask\.review\.status\)\}`/);
assert.match(appJs, /createToken\(getApprovalStatusDisplay\(selectedApproval\.status\), getApprovalTone\(selectedApproval\.status\)\)/);

assert.doesNotMatch(appJs, /Logs remains an advanced inspection surface\./);
assert.doesNotMatch(appJs, /Artifacts is intentionally an advanced provenance surface\./);
assert.doesNotMatch(appJs, /Decision Inbox stays available for explicit approval and decision handling/);
assert.doesNotMatch(appJs, /No run selected/);
assert.doesNotMatch(appJs, /No artifact selected/);
assert.doesNotMatch(appJs, /No inbox item selected/);
assert.doesNotMatch(appJs, /Execution Provider/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');
const executingApprovalItem = executingApproval?.inboxItemId
  ? executionGateState.decisionInboxItems[executingApproval.inboxItemId]
  : null;

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.ok(executingApprovalItem);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');
assert.equal(executingApprovalItem.kind, 'approval');

console.log(
  JSON.stringify(
    {
      ok: true,
      advancedOpsKoreanShell: {
        headings: ['관제실 로그실', '증적 보관실', '관제실 결재함'],
        providerBootstrap: '실행 프로바이더',
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          approvalAction: executingApproval.allowedNextAction,
          inboxKind: executingApprovalItem.kind,
        },
      },
    },
    null,
    2,
  ),
);
