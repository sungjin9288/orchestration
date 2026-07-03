import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const controlSnapshotsPath = path.join(repoRoot, 'ui', 'control-snapshots.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const controlSnapshots = fs.readFileSync(controlSnapshotsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(controlSnapshots, /export function getExecutionLeftSnapshot\(task, latestRun, executionControl, artifacts = \{\}\)/);
assert.match(controlSnapshots, /export function getDeliverablesLeftSnapshot\(mission, task, currentArtifact, deliverablesControl, artifacts = \{\}\)/);

assert.match(appJs, /eyebrow: '작업 지시 개요'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 작업 지시, 다음 처리, 연결 근거를 먼저 보여 줍니다\.'/);
assert.match(appJs, /eyebrow: '전달 패킷 개요'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 결과 패킷, 다음 인계, 연결 근거부터 먼저 보여 줍니다\.'/);

assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '다음 행동'/);
assert.match(appJs, /label: '연결 근거'/);

assert.match(controlSnapshots, /상류 \+ 전달 패킷 연결/);
assert.match(appJs, /상류 준비 패킷/);
assert.match(appJs, /전달 패킷 선반/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.ok(executingMission);
assert.ok(executingTask);
assert.ok(executingApproval);
assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      repoExecutionDeliverablesLeftDensity: {
        executionLeft: ['작업 지시 개요', '현재 작업 지시', '다음 처리', '연결 근거'],
        deliverablesLeft: ['전달 패킷 개요', '현재 결과 패킷', '다음 인계', '연결 근거'],
        preservedDetail: ['상류 준비 패킷', '전달 패킷 선반'],
        executionGate: {
          missionStatus: executingMission.status,
          waitingApproval: executingTask.flags.waitingApproval,
          allowedNextAction: executingApproval.allowedNextAction,
        },
      },
    },
    null,
    2,
  ),
);
