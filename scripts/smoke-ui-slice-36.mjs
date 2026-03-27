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
const latestApproval = runtimeState.approvals[smoke20.approvalBridge.approvalId];

assert.equal(smoke20.ok, true);
assert.match(appJs, /function getMissionNextActionPreview/);
assert.match(appJs, /Current Best Next Step/);
assert.match(appJs, /Next owner ·/);
assert.match(appJs, /selectedMissionNextActionPreview\.surface/);
assert.match(appJs, /Execution is the current best next step because/);
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
