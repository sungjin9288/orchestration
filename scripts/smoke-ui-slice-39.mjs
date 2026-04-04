import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const activeStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');
const completedStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-29', 'state.json');

assert.equal(fs.existsSync(activeStatePath), true, 'runtime-ui-slice-20 state.json is required');
assert.equal(fs.existsSync(completedStatePath), true, 'runtime-ui-slice-29 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const activeState = JSON.parse(fs.readFileSync(activeStatePath, 'utf8'));
const completedState = JSON.parse(fs.readFileSync(completedStatePath, 'utf8'));

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];
const activeApprovals = Object.values(activeState.approvals).filter((approval) => approval.taskId === activeTask.id);
const latestActiveApproval = activeApprovals.sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];

const completedMission = Object.values(completedState.missions)[0];
const completedTask = completedState.tasks[completedMission.linkedTaskId];
const closeOutArtifact = Object.values(completedState.artifacts).find(
  (artifact) => artifact.taskId === completedTask.id && artifact.type === 'close-out',
);

assert.match(appJs, /종료 정리 .* · 다음 안건을 바로 준비할 수 있습니다\./);
assert.match(appJs, /다음: 미션에서 다음 안건 준비/);
assert.match(appJs, /label: '회의'/);
assert.match(appJs, /label: '실행'/);
assert.match(appJs, /label: '보고'/);
assert.match(appJs, /다음안건:준비/);
assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(latestActiveApproval.status, 'pending');
assert.equal(latestActiveApproval.allowedNextAction, 'builder-live-mutation');
assert.equal(completedTask.lifecycleState, 'Done');
assert.equal(closeOutArtifact?.type, 'close-out');

console.log(
  JSON.stringify(
    {
      ok: true,
      rowScanability: {
        activeMissionId: activeMission.id,
        activeMissionStatus: activeMission.status,
        activeTaskId: activeTask.id,
        activeWaitingApproval: activeTask.flags.waitingApproval,
        activeApprovalId: latestActiveApproval.id,
        activeApprovalStatus: latestActiveApproval.status,
        completedMissionId: completedMission.id,
        completedTaskId: completedTask.id,
        completedTaskLifecycleState: completedTask.lifecycleState,
        closeOutArtifactId: closeOutArtifact?.id || null,
      },
    },
    null,
    2,
  ),
);
