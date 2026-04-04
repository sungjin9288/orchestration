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

assert.match(appJs, /회의실, 작전실, 관제실 기본 동선만 엽니다\./);
assert.match(appJs, /세부 제어와 provenance는 관제실에 남기고, 여기선 안건 동선만 엽니다\./);
assert.match(appJs, /연결 태스크 \$\{linkedTask\.id\}를 선택한 상태로 작업판을 엽니다\./);

assert.doesNotMatch(appJs, /Use Mission Actions for linked task setup and execution handoff\./);
assert.doesNotMatch(appJs, /Use Mission Actions for the next bounded cycle once completion is sealed\./);
assert.doesNotMatch(appJs, /Use Mission Actions to open or draft council without leaving the primary shell\./);
assert.doesNotMatch(appJs, /Mission Actions opens Taskboard with linked task \$\{linkedTask\.id\} selected\./);
assert.doesNotMatch(appJs, /Primary actions live here\. Advanced Ops stays secondary\./);
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
      detailSummaryDedup: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        removedMissionActionsSummaryRepeats: 4,
      },
    },
    null,
    2,
  ),
);
