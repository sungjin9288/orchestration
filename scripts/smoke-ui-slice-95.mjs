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
assert.match(appJs, /heading: '브리핑실 아래는 입력선과 판단선으로 나눕니다'/);
assert.match(appJs, /heading: '회의실 아래는 기록선과 결론선으로 나눕니다'/);
assert.match(appJs, /label: '왼쪽 데스크'/);
assert.match(appJs, /label: '오른쪽 판단판'/);
assert.match(appJs, /label: '왼쪽 회의록'/);
assert.match(appJs, /label: '오른쪽 결론판'/);
assert.match(appJs, /label: '지금 열기'/);
assert.match(appJs, /왼쪽은 입력과 안건 선택만 남깁니다\./);
assert.match(appJs, /오른쪽은 결론, 승인, 다음 이동만 먼저 봅니다\./);

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
        missionStrip: ['왼쪽 데스크', '오른쪽 판단판', '지금 열기'],
        councilStrip: ['왼쪽 회의록', '오른쪽 결론판', '지금 열기'],
        draftMissionStatus: draftMission.status,
        approvedCouncilAlignment: approvedCouncil.alignment.status,
        approvedCouncilNextSurface: linkedTask ? 'execution' : 'mission',
      },
    },
    null,
    2,
  ),
);
