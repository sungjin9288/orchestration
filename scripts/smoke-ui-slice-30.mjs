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

const smoke29Output = execFileSync(process.execPath, ['scripts/smoke-ui-slice-29.mjs'], {
  cwd: repoRoot,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
});
const smoke29 = JSON.parse(smoke29Output);
const appJs = fs.readFileSync(appJsPath, 'utf8');
const runtimeState = JSON.parse(fs.readFileSync(statePath, 'utf8'));
const { taskId, closeOutArtifactId, closeOutRunId, releasePackageArtifactId } = smoke29.closeOut;
const mission = Object.values(runtimeState.missions)[0];
const task = runtimeState.tasks[taskId];
const closeOutArtifact = runtimeState.artifacts[closeOutArtifactId];
const closeOutRun = runtimeState.runs[closeOutRunId];

assert.equal(smoke29.ok, true);
assert.match(appJs, /안건 종료 보고/);
assert.match(appJs, /현재 미션 상태/);
assert.match(appJs, /다음 안전한 후속 단계/);
assert.match(appJs, /한정된 전달은 종료 정리 아티팩트/);
assert.match(appJs, /저장된 종료 정리 번들을 최종 한정 요약으로 보고/);
assert.equal(task.lifecycleState, 'Done');
assert.equal(mission.linkedTaskId, taskId);
assert.equal(mission.status, 'executing');
assert.equal(closeOutArtifact.type, 'close-out');
assert.equal(closeOutRun.summary.executionMode, 'close-out');
assert.equal(closeOutRun.summary.lifecycleTransition, 'Review -> Done');
assert.equal(closeOutRun.summary.sourceReleasePackageArtifactId, releasePackageArtifactId);

console.log(
  JSON.stringify(
    {
      ok: true,
      runtimeRoot,
      missionDoneSummary: {
        missionId: mission.id,
        missionStatus: mission.status,
        taskId,
        taskLifecycleState: task.lifecycleState,
        closeOutArtifactId,
        closeOutRunId,
        releasePackageArtifactId,
      },
    },
    null,
    2,
  ),
);
