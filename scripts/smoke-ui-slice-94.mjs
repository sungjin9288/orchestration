import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(appJs, /function getExecutionLeftSnapshot\(task, latestRun, executionControl, artifacts = \{\}\)/);
assert.match(appJs, /function getDeliverablesLeftSnapshot\(mission, task, currentArtifact, deliverablesControl, artifacts = \{\}\)/);

assert.match(appJs, /eyebrow: '실행 개요판'/);
assert.match(appJs, /copy: '왼쪽 패널은 현재 판단, 다음 행동, 연결 근거부터 먼저 보여 줍니다\.'/);
assert.match(appJs, /eyebrow: '보고 개요판'/);
assert.match(appJs, /copy: '결과 보고실 왼쪽 패널도 현재 보고 판단, 다음 행동, 연결 근거부터 먼저 보여 줍니다\.'/);

assert.match(appJs, /label: '현재 판단'/);
assert.match(appJs, /label: '다음 행동'/);
assert.match(appJs, /label: '연결 근거'/);

assert.match(appJs, /준비 체인 \+ 최신 보고/);
assert.match(appJs, /상류 \+ 후속 보고 연결/);
assert.match(appJs, /상류 준비 보고/);
assert.match(appJs, /후속 전달 보고/);

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
        executionLeft: ['실행 개요판', '현재 판단', '다음 행동', '연결 근거'],
        deliverablesLeft: ['보고 개요판', '현재 판단', '다음 행동', '연결 근거'],
        preservedDetail: ['상류 준비 보고', '후속 전달 보고'],
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
