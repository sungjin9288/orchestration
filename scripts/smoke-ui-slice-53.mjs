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

assert.match(appJs, />안건 접수</);
assert.match(appJs, /form-actions form-actions-inline/);
assert.match(appJs, /안건 접수 흐름/);
assert.match(appJs, /참모 회의 초안 만들기/);
assert.doesNotMatch(appJs, /Create Mission &amp; Draft Council/);
assert.doesNotMatch(appJs, /Council drafts right away for visible role discussion\./);

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
      missionFormSubmitCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedSubmitCopy: 2,
      },
    },
    null,
    2,
  ),
);
