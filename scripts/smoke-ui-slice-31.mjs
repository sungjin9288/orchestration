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

assert.equal(smoke30.ok, true);
assert.match(appJs, /다음 안건 준비/);
assert.match(appJs, /미션으로 이동해 다음 사이클 시작/);
assert.match(
  appJs,
  /다음 안건 초안을 준비했습니다/,
);
assert.match(
  appJs,
  /다음 사이클은 미션에서 시작합니다\. 실행을 다시 열지 않고 다음 초안을 준비합니다\./,
);
assert.match(appJs, /function prepareNextMissionDraft/);
assert.match(appJs, /action === 'prepare-next-mission'/);
assert.match(appJs, /action === 'open-mission'/);
assert.match(appJs, /state\.missionDraftConstraints = mission\?\.constraints \|\| ''/);
assert.equal(mission.status, 'executing');
assert.equal(task.lifecycleState, 'Done');
assert.equal(Object.keys(runtimeState.missions).length, 1);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      nextCycleEntry: {
        missionId: mission.id,
        missionStatus: mission.status,
        linkedTaskId: mission.linkedTaskId,
        taskLifecycleState: task.lifecycleState,
        missionCount: Object.keys(runtimeState.missions).length,
      },
    },
    null,
    2,
  ),
);
