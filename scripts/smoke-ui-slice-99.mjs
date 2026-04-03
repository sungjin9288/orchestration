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

assert.match(appJs, /heading: '보관실 아래는 증적 목록과 현재 증적으로 나눕니다'/);
assert.match(appJs, /label: '왼쪽 목록'/);
assert.match(appJs, /label: '오른쪽 판단'/);
assert.match(appJs, /title: '증적 목록 \+ 현재 상태'/);
assert.match(appJs, /label: '영향 셀 열기'/);
assert.match(appJs, /heading: '선택된 증적만 세 칸으로 요약하는 보관실'/);

const mission = Object.values(executionGateState.missions)[0];
const task = executionGateState.tasks[mission.linkedTaskId];
const artifacts = Object.values(executionGateState.artifacts);
const latestArtifact = artifacts[artifacts.length - 1];

assert.ok(mission);
assert.ok(task);
assert.ok(latestArtifact);
assert.equal(mission.status, 'executing');
assert.equal(task.flags.waitingApproval, true);
assert.equal(latestArtifact.taskId, task.id);

console.log(
  JSON.stringify(
    {
      ok: true,
      artifactsViewportHandoff: {
        strip: ['왼쪽 목록', '오른쪽 판단', '지금 열기'],
        missionStatus: mission.status,
        taskId: task.id,
        artifactId: latestArtifact.id,
        artifactType: latestArtifact.type,
        waitingApproval: task.flags.waitingApproval,
      },
    },
    null,
    2,
  ),
);
