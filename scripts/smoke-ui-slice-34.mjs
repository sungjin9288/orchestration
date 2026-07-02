import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-20');
const statePath = path.join(runtimeRoot, 'state.json');

const smoke20Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-20.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke20 = JSON.parse(smoke20Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke20.mission.id];
const task = runtimeState.tasks[mission.linkedTaskId];
const latestRun = runtimeState.runs[task.latestRunId];
const latestApproval = runtimeState.approvals[smoke20.approvalBridge.approvalId];

assert.equal(smoke20.ok, true);
assert.match(appJs, /function getMissionExecutionPreview/);
assert.match(appJs, /가장 최근 실행 로그:/);
assert.match(appJs, /연결된 태스크가 아직 없어서 실행 게이트도 없습니다\./);
assert.match(appJs, /지금 활성화된 실행 게이트는 없습니다\./);
assert.match(appJs, /현재 실행은 .* 전까지 진행할 수 없습니다\./);
assert.equal(mission.status, 'executing');
assert.equal(task.lifecycleState, 'In Progress');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestRun.role, 'builder');
assert.equal(latestRun.summary.nextStage, 'request-builder-live-mutation-approval');
assert.equal(latestApproval.status, 'pending');
assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      executionPreview: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        taskLifecycleState: task.lifecycleState,
        latestRunId: latestRun.id,
        latestRunRole: latestRun.role,
        nextStage: latestRun.summary.nextStage,
        approvalId: latestApproval.id,
        approvalStatus: latestApproval.status,
      },
    },
    null,
    2,
  ),
);
