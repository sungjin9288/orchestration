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

const smoke37Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-37.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke37 = JSON.parse(smoke37Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = runtimeState.missions[smoke37.densityTrim.missionId];
const task = runtimeState.tasks[mission.linkedTaskId];
const latestApproval = runtimeState.approvals[smoke37.densityTrim.approvalId];

assert.equal(smoke37.ok, true);
assert.match(appJs, /See Council for recommendation detail and alignment\./);
assert.match(appJs, /See Execution for current gate and blocked reason\./);
assert.match(appJs, /See Deliverables for artifact, review, and approval detail\./);
assert.match(appJs, /Current owner surface is/);
assert.match(appJs, /createToken\(`surface:\$\{item\.surface\}`/);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestApproval.status, 'pending');
assert.equal(latestApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      surfaceHandoff: {
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
