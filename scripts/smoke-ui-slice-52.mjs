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

assert.match(appJs, /<span class="field-label">Title<\/span>[\s\S]*?name="missionTitle"/);
assert.match(appJs, /<span class="field-label">Goal<\/span>[\s\S]*?name="missionGoal"/);
assert.match(appJs, /<span class="field-label">Scope<\/span>[\s\S]*?name="missionConstraints"/);

assert.doesNotMatch(appJs, /<span class="field-label">Mission Title<\/span>[\s\S]*?name="missionTitle"/);
assert.doesNotMatch(appJs, /<span class="field-label">Mission Goal<\/span>[\s\S]*?name="missionGoal"/);
assert.doesNotMatch(appJs, /<span class="field-label">Constraints<\/span>[\s\S]*?name="missionConstraints"/);

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
      missionFormLabelCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedLabels: 3,
      },
    },
    null,
    2,
  ),
);
