import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const runtimeRoot = path.join(repoRoot, 'var', 'runtime-ui-slice-29');
const statePath = path.join(runtimeRoot, 'state.json');

const smoke30Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-30.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke30 = JSON.parse(smoke30Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const mission = Object.values(runtimeState.missions)[0];
const task = runtimeState.tasks[mission.linkedTaskId];
const closeOutArtifact = runtimeState.artifacts[smoke30.missionDoneSummary.closeOutArtifactId];

assert.equal(smoke30.ok, true);
assert.match(appJs, /Active Missions/);
assert.match(appJs, /Completed Missions/);
assert.match(appJs, /Sealed rows wait here for the next cycle\./);
assert.match(appJs, /Completed · close-out artifact/);
assert.match(appJs, /Next owner · Mission via Prepare Next Mission\./);
assert.match(appJs, /completion:sealed/);
assert.match(appJs, /next-cycle:ready/);
assert.match(appJs, /function getMissionCompletionSummary/);
assert.equal(mission.status, 'executing');
assert.equal(task.lifecycleState, 'Done');
assert.equal(closeOutArtifact.type, 'close-out');

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      completedMissionFraming: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        taskLifecycleState: task.lifecycleState,
        closeOutArtifactId: closeOutArtifact.id,
      },
    },
    null,
    2,
  ),
);
