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
const completedMission = Object.values(completedState.missions)[0];
const completedTask = completedState.tasks[completedMission.linkedTaskId];

assert.match(appJs, /Mission stays primary\. Advanced Ops stays secondary\./);
assert.match(appJs, /Linked task setup stays on the v1 engine\. Advanced Ops remains secondary\./);
assert.match(appJs, /No council session yet for this mission\./);
assert.match(appJs, /Alignment State: unavailable until a council session exists\./);
assert.match(appJs, /Secondary escape hatch for full Taskboard control\./);
assert.match(appJs, /Select or create a mission\./);
assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(completedMission.status, 'executing');
assert.equal(completedTask.lifecycleState, 'Done');

console.log(
  JSON.stringify(
    {
      ok: true,
      detailCopyTighten: {
        activeMissionId: activeMission.id,
        activeMissionStatus: activeMission.status,
        activeTaskId: activeTask.id,
        activeWaitingApproval: activeTask.flags.waitingApproval,
        completedMissionId: completedMission.id,
        completedMissionStatus: completedMission.status,
        completedTaskId: completedTask.id,
        completedTaskLifecycleState: completedTask.lifecycleState,
      },
    },
    null,
    2,
  ),
);
