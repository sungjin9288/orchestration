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

assert.match(appJs, /진행 중인 미션[\s\S]*?지금 움직이는 안건만 모읍니다\./);
assert.match(appJs, /완료된 미션[\s\S]*?봉인된 안건은 이 줄에 보관합니다\./);

assert.doesNotMatch(appJs, /Current bounded work stays here\./);
assert.doesNotMatch(appJs, /Sealed rows wait here for the next cycle\./);

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];
const activeApproval = Object.values(activeState.approvals).find((approval) => approval.status === 'pending');
const completedMission = Object.values(completedState.missions)[0];
const completedTask = completedState.tasks[completedMission.linkedTaskId];

assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(activeApproval?.allowedNextAction, 'builder-live-mutation');
assert.equal(completedMission.status, 'executing');
assert.equal(completedTask.lifecycleState, 'Done');

console.log(
  JSON.stringify(
    {
      ok: true,
      missionListSectionCopyTighten: {
        activeMissionId: activeMission.id,
        completedMissionId: completedMission.id,
        tightenedSectionHelpers: 2,
      },
    },
    null,
    2,
  ),
);
