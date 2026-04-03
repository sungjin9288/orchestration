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

assert.match(appJs, /copy: '아래 deck은 현재 run과 다음 확인만 먼저 요약하고, 원문 확인은 오른쪽 상세로 넘깁니다\.'/);
assert.match(appJs, /label: '현재 run'/);
assert.match(appJs, /label: '다음 확인'/);
assert.match(appJs, /title: selectedRun \? selectedRun\.id : 'run 선택 대기'/);
assert.match(appJs, /title: selectedRun \? logsDetailSnapshot\.nextTitle : 'run 하나 고르기'/);
assert.match(appJs, /copy: selectedRun\s*\?\s*logsDetailSnapshot\.nextCopy/);
assert.match(appJs, /\$\{logsViewportStrip\}\s*\n\s*\$\{logsDeck\}/);

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
      logsDeckDensity: {
        stripFirst: true,
        deckCards: ['현재 run', '다음 확인', '현재 맥락'],
        missionStatus: mission.status,
        runId: latestRun.id,
        waitingApproval: task.flags.waitingApproval,
      },
    },
    null,
    2,
  ),
);
