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
assert.match(appJs, /진행 안건 등록대장/);
assert.match(appJs, /종료 안건 보관대장/);
assert.match(appJs, /종료 정리까지 끝난 안건이 생기면 이 줄에 보관됩니다\./);
assert.match(appJs, /종료 정리 .* · 다음 안건을 바로 준비할 수 있습니다\./);
assert.match(appJs, /다음: 미션에서 다음 안건 준비/);
assert.match(appJs, /완료:봉인/);
assert.match(appJs, /다음안건:준비/);
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
