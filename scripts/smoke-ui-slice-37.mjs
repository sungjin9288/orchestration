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

const smoke36Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-36.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke36 = JSON.parse(smoke36Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke36.nextActionFraming.missionId];
const task = runtimeState.tasks[mission.linkedTaskId];
const latestApproval = runtimeState.approvals[smoke36.nextActionFraming.approvalId];

assert.equal(smoke36.ok, true);
assert.match(controlSnapshots, /export function renderMissionSnapshotList/);
assert.match(appJs, /브리프 핵심 4줄/);
assert.match(appJs, /지금 판단할 상태만 네 줄로 봅니다\./);
assert.match(appJs, /실행 지시 데스크 인계 미리보기/);
assert.match(appJs, /회의 결과물 미리보기/);
assert.match(appJs, /다음 지시/);
assert.equal(mission.status, 'executing');
assert.equal(task.lifecycleState, 'In Progress');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestApproval.status, 'pending');
assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      densityTrim: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        taskLifecycleState: task.lifecycleState,
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
