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

assert.match(appJs, /placeholder="오늘 등록할 안건 제목을 적으세요"/);
assert.match(appJs, /placeholder="이번 안건으로 무엇을 정리해야 하는지 적으세요"/);
assert.match(appJs, /placeholder="이번 안건에서 넘지 않을 범위나 제약을 적으세요"/);

assert.doesNotMatch(appJs, /placeholder="Mission title"/);
assert.doesNotMatch(appJs, /placeholder="What should the system make or improve\?"/);
assert.doesNotMatch(appJs, /placeholder="Scope limits or acceptance hints"/);

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
      missionFormPlaceholderCopyTighten: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        tightenedPlaceholders: 3,
      },
    },
    null,
    2,
  ),
);
