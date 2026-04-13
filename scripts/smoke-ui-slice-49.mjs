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

assert.match(appJs, /<h2>안건 등록대장<\/h2>[\s\S]*?왼쪽은 신규 안건 등록과 현재 안건 배정만 둡니다\./);
assert.match(appJs, /신규 안건 등록[\s\S]*?다음 처리 트리거가 같이 준비됩니다\./);
assert.doesNotMatch(appJs, /Intent starts here\. Task-level execution stays in Advanced Ops\./);

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
      missionRegisterPanelReadability: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedMissionHelpers: 2,
      },
    },
    null,
    2,
  ),
);
