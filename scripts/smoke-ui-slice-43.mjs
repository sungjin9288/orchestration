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

const detailStart = appJs.indexOf('<h2>안건 브리프</h2>');
const detailEnd = appJs.indexOf('</aside>', detailStart);
assert.notEqual(detailStart, -1, '안건 브리프 section should exist');
assert.notEqual(detailEnd, -1, '안건 브리프 aside should exist');

const detailSource = appJs.slice(detailStart, detailEnd + 1600);

const linkedTaskSection = detailSource.match(/<strong>실행 셀 연결<\/strong>[\s\S]*?<\/section>/);
const missionActionsSection = detailSource.match(/<strong>브리프 액션<\/strong>[\s\S]*?<\/section>/);
const missionCompletionSection = detailSource.match(/<strong>안건 종료 보고<\/strong>[\s\S]*?<\/section>/);
const councilSection = detailSource.match(/<strong>참여 역할<\/strong>[\s\S]*?<\/section>/);
const advancedOpsSection = detailSource.match(/<strong>관제실 직행<\/strong>[\s\S]*?<\/section>/);

assert.ok(linkedTaskSection, '실행 셀 연결 section should exist');
assert.ok(missionActionsSection, '브리프 액션 section should exist');
assert.ok(missionCompletionSection, '안건 종료 보고 section should exist');
assert.ok(councilSection, '참여 역할 section should exist');
assert.ok(advancedOpsSection, '관제실 직행 section should exist');

assert.match(missionActionsSection[0], /회의, 실행, 관제실 기본 동선만 엽니다\./);
assert.match(missionActionsSection[0], /data-action="create-linked-task-for-mission"/);
assert.match(missionActionsSection[0], /data-action="open-advanced-ops"/);
assert.match(missionActionsSection[0], /data-action="open-execution"/);
assert.match(missionActionsSection[0], /data-action="open-council"|data-action="draft-council-for-mission"/);

assert.doesNotMatch(linkedTaskSection[0], /data-action="create-linked-task-for-mission"/);
assert.doesNotMatch(linkedTaskSection[0], /data-action="open-execution"/);
assert.doesNotMatch(councilSection[0], /data-action="open-council"|data-action="draft-council-for-mission"/);
assert.doesNotMatch(missionCompletionSection[0], /data-action="open-advanced-ops"/);
assert.doesNotMatch(advancedOpsSection[0], /data-action="open-advanced-ops"/);

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
      detailActionBalance: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        groupedActions: [
          'create-linked-task-for-mission',
          'open-execution',
          'open-council-or-draft-council',
          'open-advanced-ops',
        ],
      },
    },
    null,
    2,
  ),
);
