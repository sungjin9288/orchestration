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

assert.match(appJs, /No active missions[\s\S]*?Prepare the next mission when the next bounded cycle is ready\./);
assert.match(appJs, /No completed missions yet[\s\S]*?Completed rows land here after close-out seals the path\./);
assert.match(appJs, /<strong>No missions yet<\/strong>[\s\S]*?<p>Create the first mission above, then add the linked task when execution is needed\.<\/p>/);

assert.doesNotMatch(appJs, /Once the current bounded path is sealed through close-out, rows move into the completed section below\./);
assert.doesNotMatch(appJs, /Completed missions appear here after the linked task reaches Done and the close-out bundle is saved\./);
assert.doesNotMatch(appJs, /Start with one mission, then create a linked task when you are ready to enter advanced ops execution\./);

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
      missionListEmptyStateCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedListEmptyStates: 3,
      },
    },
    null,
    2,
  ),
);
