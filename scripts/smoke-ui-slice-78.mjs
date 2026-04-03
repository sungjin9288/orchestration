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

assert.match(appJs, /function getTaskboardTaskSnapshot\(task, data\)/);
assert.match(appJs, /eyebrow: '작업판 판단 요약'/);
assert.match(appJs, /heading: '현재 상태와 다음 실행을 먼저 보는 상세'/);
assert.match(appJs, /label: '현재 상태'/);
assert.match(appJs, /label: '막힌 이유'/);
assert.match(appJs, /label: '다음 실행'/);
assert.match(appJs, /detailHoldTitle = task\.flags\?\.waitingApproval/);
assert.match(appJs, /detailNextTitle = '승인 처리'/);
assert.match(appJs, /detailNextTitle = '결정 처리'/);
assert.match(appJs, /detailNextTitle = '플래너 실행'/);
assert.match(appJs, /detailNextTitle = '사전 점검 준비'/);
assert.match(appJs, /detailNextTitle = '로컬 커밋'/);
assert.match(appJs, /detailNextTitle = '종료 정리'/);
assert.match(appJs, /wide: false/);

assert.match(styles, /\.command-deck-detail \{/);

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
      hqTaskboardDetailDensity: {
        labels: ['현재 상태', '막힌 이유', '다음 실행'],
        detailDeckClass: 'command-deck-detail',
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
