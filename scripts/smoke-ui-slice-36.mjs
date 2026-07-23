import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-20');
const statePath = path.join(runtimeRoot, 'state.json');

const smoke20Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-20.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke20 = JSON.parse(smoke20Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke20.mission.id];
const task = runtimeState.tasks[mission.linkedTaskId];
const latestApproval = runtimeState.approvals[smoke20.approvalBridge.approvalId];

assert.equal(smoke20.ok, true);
assert.match(controlSnapshots, /export function getMissionNextActionPreview/);
assert.match(controlSnapshots, /현재 사람 게이트와 다음 한정 명령을 실행에서 확인합니다/);
assert.match(controlSnapshots, /다음 미션 준비/);
assert.match(appJs, /회의 초안/);
assert.match(controlSnapshots, /태스크 연결/);
assert.match(controlSnapshots, /actionLabel: '실행'/);
assert.match(appJs, /selectedMissionNextActionPreview\.surface/);
assert.match(controlSnapshots, /지금 가장 먼저 열어야 할 표면은/);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestApproval.status, 'pending');
assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      nextActionFraming: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        waitingApproval: task.flags.waitingApproval,
        approvalId: latestApproval.id,
        approvalStatus: latestApproval.status,
        allowedNextAction: latestApproval.allowedNextAction,
      },
    },
    null,
    2,
  ),
);
