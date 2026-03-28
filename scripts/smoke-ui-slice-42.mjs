import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const activeStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(activeStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const activeState = JSON.parse(fs.readFileSync(activeStatePath, 'utf8'));

const detailStart = appJs.indexOf('<h2>Mission Detail</h2>');
const detailEnd = appJs.indexOf('<strong>Advanced Ops Mode</strong>', detailStart);

assert.notEqual(detailStart, -1, 'Mission Detail section should exist');
assert.notEqual(detailEnd, -1, 'Advanced Ops Mode section should exist');

const detailSource = appJs.slice(detailStart, detailEnd + 64);

const titleIndex = detailSource.indexOf('<strong>${escapeHtml(selectedMission.title)}</strong>');
const snapshotIndex = detailSource.indexOf('<strong>Mission Snapshot</strong>');
const linkedTaskIndex = detailSource.indexOf('<strong>Linked Task</strong>');
const missionActionsIndex = detailSource.indexOf('<strong>Mission Actions</strong>');
const completionIndex = detailSource.indexOf('<strong>Mission Completion</strong>');
const councilIndex = detailSource.indexOf('<strong>Council</strong>');
const constraintsIndex = detailSource.indexOf('<strong>Constraints</strong>');
const advancedOpsIndex = detailSource.indexOf('<strong>Advanced Ops Mode</strong>');

assert.notEqual(titleIndex, -1, 'Mission title section should exist');
assert.notEqual(snapshotIndex, -1, 'Mission Snapshot section should exist');
assert.notEqual(linkedTaskIndex, -1, 'Linked Task section should exist');
assert.notEqual(missionActionsIndex, -1, 'Mission Actions section should exist');
assert.notEqual(completionIndex, -1, 'Mission Completion section should exist');
assert.notEqual(councilIndex, -1, 'Council section should exist');
assert.notEqual(constraintsIndex, -1, 'Constraints section should exist');
assert.notEqual(advancedOpsIndex, -1, 'Advanced Ops Mode section should exist');

assert.equal(titleIndex < snapshotIndex, true);
assert.equal(snapshotIndex < linkedTaskIndex, true);
assert.equal(linkedTaskIndex < missionActionsIndex, true);
assert.equal(missionActionsIndex < completionIndex, true);
assert.equal(completionIndex < councilIndex, true);
assert.equal(councilIndex < constraintsIndex, true);
assert.equal(constraintsIndex < advancedOpsIndex, true);

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];
const activeApproval = Object.values(activeState.approvals).find((approval) => approval.status === 'pending');

assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);
assert.equal(activeApproval?.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      detailSectionBalance: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        titleIndex,
        snapshotIndex,
        linkedTaskIndex,
        missionActionsIndex,
        completionIndex,
        councilIndex,
        constraintsIndex,
        advancedOpsIndex,
      },
    },
    null,
    2,
  ),
);
