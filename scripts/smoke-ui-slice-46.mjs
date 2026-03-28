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

assert.match(appJs, /Pick the project first, then create the mission\./);
assert.match(appJs, /Project starts here\. Advanced Ops keeps provider, worktree, and operator detail\./);
assert.match(appJs, /Pick a project above, then create the first mission\./);
assert.match(appJs, /Provider, worktree, logs, artifacts, and decisions stay in Advanced Ops\./);
assert.match(appJs, /<strong>No mission selected<\/strong>[\s\S]*?<p>Select or create a mission\.<\/p>/);

assert.doesNotMatch(appJs, /Start orchestration here by choosing the project first, then move directly into mission creation\./);
assert.doesNotMatch(appJs, /Project registration and selection now start here\. Provider setup, linked worktrees, and detailed operator controls remain in Advanced Ops Mode\./);
assert.doesNotMatch(appJs, /Register the local project or select one of the existing project roots above, then create the first mission without opening Taskboard first\./);
assert.doesNotMatch(appJs, /Execution Provider, linked worktree create\/switch, logs, artifact inspection, and decision handling stay on the advanced operator surfaces\./);
assert.doesNotMatch(appJs, /Select or create a mission to continue\./);

const activeMission = Object.values(activeState.missions)[0];
const activeTask = activeState.tasks[activeMission.linkedTaskId];

assert.equal(activeMission.status, 'executing');
assert.equal(activeTask.flags.waitingApproval, true);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionEmptyStateCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedEmptyStateHelpers: 5,
      },
    },
    null,
    2,
  ),
);
