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

assert.match(appJs, /Mission stays primary\. Advanced Ops stays secondary\./);
assert.match(appJs, /One strip keeps council, execution, deliverables, and next step together\./);
assert.match(appJs, /Primary actions live here\. Advanced Ops stays secondary\./);
assert.match(appJs, /Linked task setup stays on the v1 engine\. Advanced Ops remains secondary\./);
assert.match(appJs, /Secondary escape hatch for full Taskboard control\./);

assert.doesNotMatch(appJs, /Mission stays default\. Advanced Ops stays the escape hatch\./);
assert.doesNotMatch(appJs, /Preview density trimmed for active missions so council, execution, deliverables, and next-step signals can be scanned in one strip\./);
assert.doesNotMatch(appJs, /Grouped primary actions live here\. Advanced Ops stays secondary\./);
assert.doesNotMatch(appJs, /Creates one linked task and leaves execution on the v1 engine\. Advanced Ops remains the secondary escape hatch\./);
assert.doesNotMatch(appJs, /Secondary escape hatch for full Taskboard control and provenance detail\./);

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
      detailSurfaceCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedHelpers: 5,
      },
    },
    null,
    2,
  ),
);
