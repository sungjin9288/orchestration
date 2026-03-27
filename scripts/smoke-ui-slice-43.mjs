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

const detailSource = appJs.slice(detailStart, detailEnd + 1600);

const linkedTaskSection = detailSource.match(/<strong>Linked Task<\/strong>[\s\S]*?<\/section>/);
const missionActionsSection = detailSource.match(/<strong>Mission Actions<\/strong>[\s\S]*?<\/section>/);
const missionCompletionSection = detailSource.match(/<strong>Mission Completion<\/strong>[\s\S]*?<\/section>/);
const councilSection = detailSource.match(/<strong>Council<\/strong>[\s\S]*?<\/section>/);
const advancedOpsSection = detailSource.match(/<strong>Advanced Ops Mode<\/strong>[\s\S]*?<\/section>/);

assert.ok(linkedTaskSection, 'Linked Task section should exist');
assert.ok(missionActionsSection, 'Mission Actions section should exist');
assert.ok(missionCompletionSection, 'Mission Completion section should exist');
assert.ok(councilSection, 'Council section should exist');
assert.ok(advancedOpsSection, 'Advanced Ops section should exist');

assert.match(missionActionsSection[0], /Primary actions live here\. Advanced Ops stays secondary\./);
assert.match(missionActionsSection[0], /data-action="create-linked-task-for-mission"/);
assert.match(missionActionsSection[0], /data-action="open-advanced-ops"/);
assert.match(missionActionsSection[0], /data-action="open-execution"/);
assert.match(missionActionsSection[0], /data-action="open-council"|data-action="draft-council-for-mission"/);

assert.doesNotMatch(linkedTaskSection[0], /data-action="create-linked-task-for-mission"/);
assert.doesNotMatch(linkedTaskSection[0], /data-action="open-execution"/);
assert.doesNotMatch(councilSection[0], /data-action="open-council"|data-action="draft-council-for-mission"/);
assert.doesNotMatch(missionCompletionSection[0], /data-action="prepare-next-mission"/);
assert.doesNotMatch(advancedOpsSection[0], /data-action="open-advanced-ops"/);

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
      detailActionBalance: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        groupedActions: [
          'create-linked-task-for-mission',
          'open-execution',
          'open-council-or-draft-council',
          'open-advanced-ops',
        ],
      },
    },
    null,
    2,
  ),
);
