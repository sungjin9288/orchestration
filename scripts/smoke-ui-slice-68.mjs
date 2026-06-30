import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const inboxLabelsPath = path.join(repoRoot, 'ui', 'inbox-labels.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const inboxLabels = fs.readFileSync(inboxLabelsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /from '\.\/inbox-labels\.js'/);
assert.match(inboxLabels, /export function getInboxKindDisplay\(kind\) \{/);
assert.match(inboxLabels, /export function getInboxStatusDisplay\(status\) \{/);
assert.match(inboxLabels, /export function getInboxResolutionActionDisplay\(action\) \{/);
assert.match(appJs, /function renderSurfaceLeadStrip\(options = \{\}\)/);
assert.match(appJs, /copy: '아래 deck은 현재 실행 기록과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다\.'/);
assert.match(appJs, /copy: '아래 deck은 현재 증적과 다음 확인만 먼저 요약하고, 구조 미리보기와 원문은 오른쪽 상세로 넘깁니다\.'/);
assert.match(appJs, /copy: '아래 deck은 현재 안건과 다음 처리만 먼저 요약하고, 실제 선택과 처리 버튼은 바로 아래에서 이어갑니다\.'/);
assert.match(appJs, /실행 프로바이더/);
assert.match(appJs, /프로바이더 업데이트/);
assert.match(appJs, /선택된 실행 기록 없음/);
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
assert.doesNotMatch(appJs, /고급 provenance/);

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
        headings: ['로그', '아티팩트', '결정함'],
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
