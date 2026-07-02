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

const detailStart = appJs.indexOf('<h2>안건 배정 브리프</h2>');
const detailEnd = appJs.indexOf('</aside>', detailStart);

assert.notEqual(detailStart, -1, '안건 배정 브리프 section should exist');
assert.notEqual(detailEnd, -1, '안건 배정 브리프 aside should exist');

const detailSource = appJs.slice(detailStart, detailEnd + 64);

const titleIndex = detailSource.indexOf('<strong>${escapeHtml(selectedMission.title)}</strong>');
const evidenceRailIndex = detailSource.indexOf('${missionEvidenceRail}');
const snapshotIndex = detailSource.indexOf('<strong>브리프 핵심 4줄</strong>');
const linkedTaskIndex = detailSource.indexOf('<strong>실행 셀 연결</strong>');
const missionActionsIndex = detailSource.indexOf('<strong>등록 후속</strong>');
const completionIndex = detailSource.indexOf('<strong>안건 종료 보고</strong>');
const councilIndex = detailSource.indexOf('<strong>참여 역할</strong>');
const constraintsIndex = detailSource.indexOf('<strong>회의 경계</strong>');
const advancedOpsIndex = detailSource.indexOf('<strong>관제실 직행</strong>');

assert.notEqual(titleIndex, -1, '안건 제목 section should exist');
assert.notEqual(evidenceRailIndex, -1, '증적 인계선 injection should exist');
assert.notEqual(snapshotIndex, -1, '브리프 핵심 4줄 section should exist');
assert.notEqual(linkedTaskIndex, -1, '실행 셀 연결 section should exist');
assert.notEqual(missionActionsIndex, -1, '등록 후속 section should exist');
assert.notEqual(completionIndex, -1, '안건 종료 보고 section should exist');
assert.notEqual(councilIndex, -1, '참여 역할 section should exist');
assert.notEqual(constraintsIndex, -1, '회의 경계 section should exist');
assert.notEqual(advancedOpsIndex, -1, '관제실 직행 section should exist');

assert.equal(titleIndex < evidenceRailIndex, true);
assert.equal(evidenceRailIndex < snapshotIndex, true);
assert.equal(snapshotIndex < linkedTaskIndex, true);
assert.equal(linkedTaskIndex < missionActionsIndex, true);
assert.equal(missionActionsIndex < completionIndex, true);
assert.equal(completionIndex < councilIndex, true);
assert.equal(councilIndex < constraintsIndex, true);
assert.equal(constraintsIndex < advancedOpsIndex, true);

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
      detailSectionBalance: {
        activeMissionId: activeMission.id,
        activeTaskId: activeTask.id,
        titleIndex,
        evidenceRailIndex,
        snapshotIndex,
        linkedTaskIndex,
        missionActionsIndex,
        completionIndex,
        councilIndex,
        constraintsIndex,
        advancedOpsIndex,
      },
    },
    null,
    2,
  ),
);
