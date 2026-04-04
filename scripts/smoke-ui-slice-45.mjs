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

assert.match(appJs, /현재 안건 판단과 바로 이동을 시작합니다\./);
assert.match(appJs, /현재 작전 판단과 다음 행동을 조정합니다\./);
assert.match(appJs, /현재 보고 판단과 다음 행동을 확인합니다\./);
assert.match(appJs, /프로바이더, worktree, 로그, 아티팩트, 결정함은 고급 운영 모드에 남습니다\./);
assert.match(appJs, /고급 운영 모드에서 현재 프로젝트를 고른 뒤/);

assert.doesNotMatch(appJs, /Mission stays default\. Advanced Ops stays the escape hatch\./);
assert.doesNotMatch(appJs, /Grouped primary actions live here\. Advanced Ops stays secondary\./);
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
