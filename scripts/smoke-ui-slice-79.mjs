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

assert.match(appJs, /function getLogsDetailSnapshot\(selectedRun, selectedTask, runBundle, logs = \[\]\)/);
assert.match(appJs, /function getArtifactDetailSnapshot\(selectedArtifactMeta, selectedArtifactTask, data, policySummary = ''\)/);
assert.match(appJs, /function getInboxDetailSnapshot\(selectedItem, selectedTask, selectedApproval\)/);

assert.match(appJs, /eyebrow: '관제실 판단 요약'/);
assert.match(appJs, /heading: '현재 상태와 다음 확인을 먼저 보는 로그 상세'/);
assert.match(appJs, /heading: '현재 상태와 다음 확인을 먼저 보는 증적 상세'/);
assert.match(appJs, /heading: '현재 상태와 다음 확인을 먼저 보는 결재 상세'/);
assert.match(appJs, /label: '현재 상태'/);
assert.match(appJs, /label: '핵심 이유'/);
assert.match(appJs, /label: '다음 확인'/);
assert.match(appJs, /run을 고르면 현재 상태와 다음 확인만 먼저 판단합니다\./);
assert.match(appJs, /증적을 고르면 현재 상태와 다음 확인만 먼저 판단합니다\./);
assert.match(appJs, /결재를 고르면 현재 상태와 다음 확인만 먼저 판단합니다\./);
assert.match(appJs, /연결선과 원문 확인/);
assert.match(appJs, /미리보기와 원문 확인/);
assert.match(appJs, /승인 또는 반려/);
assert.match(appJs, /해결 처리/);
assert.match(appJs, /처리 메모 확인/);
assert.match(appJs, /wide: false/);

assert.match(styles, /\.command-deck-detail \{/);

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
      hqOpsDetailDensity: {
        headings: [
          '현재 상태와 다음 확인을 먼저 보는 로그 상세',
          '현재 상태와 다음 확인을 먼저 보는 증적 상세',
          '현재 상태와 다음 확인을 먼저 보는 결재 상세',
        ],
        labels: ['현재 상태', '핵심 이유', '다음 확인'],
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          allowedNextAction: executingApproval.allowedNextAction,
          inboxKind: executingApprovalItem.kind,
        },
      },
    },
    null,
    2,
  ),
);
