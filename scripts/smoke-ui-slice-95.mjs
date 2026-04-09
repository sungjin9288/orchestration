import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const missionDraftStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-19', 'state.json');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(missionDraftStatePath), true, 'runtime-ui-slice-19 state.json is required');
assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const missionDraftState = JSON.parse(fs.readFileSync(missionDraftStatePath, 'utf8'));
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /function renderViewportHandoffStrip\(options = \{\}\)/);
assert.match(appJs, /eyebrow: '등록대장 인계선'/);
assert.match(appJs, /heading: '등록, 배정, 다음 처리를 같은 보드에서 나눕니다'/);
assert.match(appJs, /heading: '참석 기록선과 권고 선반으로 나눕니다'/);
assert.match(appJs, /label: '접수 라인'/);
assert.match(appJs, /label: '배정 판단선'/);
assert.match(appJs, /label: '왼쪽 참석 기록'/);
assert.match(appJs, /label: '오른쪽 권고 선반'/);
assert.match(appJs, /label: '다음 처리 트리거'/);
assert.match(appJs, /왼쪽은 신규 안건 등록과 현재 안건 대장을 다루고, 오른쪽은 현재 판단과 가장 먼저 열어야 할 처리선을 보여 줍니다\./);
assert.match(appJs, /오른쪽은 권고안, 이견, 승인 상태만 먼저 봅니다\./);

const draftMission = Object.values(missionDraftState.missions)[0];
const approvedMission = Object.values(executionGateState.missions)[0];
const approvedCouncil = Object.values(executionGateState.councilSessions)[0];
const linkedTask = executionGateState.tasks[approvedMission.linkedTaskId];

assert.ok(draftMission);
assert.ok(approvedMission);
assert.ok(approvedCouncil);
assert.ok(linkedTask);
assert.equal(draftMission.status, 'aligning');
assert.equal(approvedMission.status, 'executing');
assert.equal(approvedCouncil.alignment.status, 'approved');
assert.equal(linkedTask.id, approvedMission.linkedTaskId);

console.log(
  JSON.stringify(
    {
      ok: true,
      missionCouncilViewportHandoff: {
        missionStrip: ['접수 라인', '배정 판단선', '다음 처리 트리거'],
        councilStrip: ['왼쪽 참석 기록', '오른쪽 권고 선반', '다음 처리'],
        draftMissionStatus: draftMission.status,
        approvedCouncilAlignment: approvedCouncil.alignment.status,
        approvedCouncilNextSurface: linkedTask ? 'execution' : 'mission',
      },
    },
    null,
    2,
  ),
);
