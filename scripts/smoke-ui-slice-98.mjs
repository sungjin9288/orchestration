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

assert.match(appJs, /heading: '로그실 아래는 실행 기록 목록과 현재 실행 기록으로 나눕니다'/);
assert.match(appJs, /label: '왼쪽 목록'/);
assert.match(appJs, /label: '오른쪽 판단'/);
assert.match(appJs, /title: '실행 기록 목록 \+ 현재 상태'/);
assert.match(appJs, /label: '영향 셀'/);
assert.match(appJs, /heading: '선택된 실행 기록만 세 칸으로 요약하는 로그실'/);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const runs = Object.values(executionGateState.runs);
const latestRun = runs[runs.length - 1];

assert.ok(mission);
assert.ok(task);
assert.ok(latestRun);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestRun.taskId, task.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      logsViewportHandoff: {
        strip: ['왼쪽 목록', '오른쪽 판단', '바로'],
        missionStatus: mission.status,
        taskId: task.id,
        runId: latestRun.id,
        waitingApproval: task.flags.waitingApproval,
      },
    },
    null,
    2,
  ),
);
