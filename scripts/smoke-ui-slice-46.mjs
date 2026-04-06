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

assert.match(appJs, /여기서 첫 로컬 프로젝트를 등록한 뒤 바로 미션 생성으로 넘어갑니다\./);
assert.match(appJs, /여기서 등록된 프로젝트를 고르거나 새로 등록한 뒤 미션 경로를 이어갑니다\./);
assert.match(appJs, /세부 제어와 근거는 관제실에 남기고, 여기선 안건 동선만 엽니다\./);
assert.match(appJs, /<strong class="mission-empty-title">선택된 안건 없음<\/strong>[\s\S]*?<p class="mission-empty-copy">왼쪽 목록에서 안건을 고르거나 위 데스크에서 새 안건을 접수합니다\.<\/p>/);
assert.match(appJs, /<strong class="mission-empty-title">미션 없음<\/strong>[\s\S]*?<p class="mission-empty-copy">위 접수 데스크에서 첫 안건을 만들면 이곳에 바로 쌓입니다\.<\/p>/);

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
