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

assert.match(appJs, /진행 안건 없음[\s\S]*?위 등록대장에서 새 안건을 올리면 바로 이 줄에 이어집니다\./);
assert.match(appJs, /종료 안건 없음[\s\S]*?종료 정리까지 끝난 안건이 생기면 이 줄에 보관됩니다\./);
assert.match(appJs, /<strong class="mission-empty-title">등록 안건 없음<\/strong>[\s\S]*?<p class="mission-empty-copy">위 등록대장에서 첫 안건을 만들면 이곳에 바로 쌓입니다\.<\/p>/);

assert.doesNotMatch(appJs, /No active missions[\s\S]*?Prepare the next mission when the next bounded cycle is ready\./);
assert.doesNotMatch(appJs, /No completed missions yet[\s\S]*?Completed rows land here after close-out seals the path\./);
assert.doesNotMatch(appJs, /Create the first mission above, then add the linked task when execution is needed\./);

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
      missionListEmptyStateCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedListEmptyStates: 3,
      },
    },
    null,
    2,
  ),
);
