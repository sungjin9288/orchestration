import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const pivotSliceDocPath = path.join(repoRoot, 'docs', '07_mission-council-slice-m6-02.md');
const todoPath = path.join(repoRoot, 'tasks', 'todo.md');
const lessonsPath = path.join(repoRoot, 'tasks', 'lessons.md');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const pivotSliceDoc = fs.readFileSync(pivotSliceDocPath, 'utf8');
const todo = fs.readFileSync(todoPath, 'utf8');
const lessons = fs.readFileSync(lessonsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(pivotSliceDoc, /추가 primary-shell blocker는 없다\./);
assert.match(pivotSliceDoc, /이후 follow-up은 기존 non-blocking housekeeping backlog로 되돌린다/);
assert.match(pivotSliceDoc, /optional real-live\/provider evidence cleanup/);
assert.match(
  pivotSliceDoc,
  /`pivot-postcompletion-housekeeping-m6-50` is now implemented on current `main`/,
);
assert.doesNotMatch(pivotSliceDoc, /is now the next concrete implementation slice/);

assert.match(
  todo,
  /`pivot-postcompletion-housekeeping-m6-50` is now implemented on current `main`/,
);
assert.doesNotMatch(todo, /`pivot-[^`]+-m6-51` is now the next concrete implementation slice/);

assert.match(
  lessons,
  /completion baseline이 frozen 된 뒤에는 새 primary-shell slice를 계속 열기보다 남은 작업을 기존 non-blocking housekeeping backlog로 되돌리는 편이 drift를 가장 잘 막았다\./,
);

assert.match(indexHtml, /data-surface="mission"/);
assert.match(indexHtml, /data-surface="council"/);
assert.match(indexHtml, /data-surface="execution"/);
assert.match(indexHtml, /data-surface="deliverables"/);
assert.match(indexHtml, /<span class="office-register-label">Ops<\/span>\s*<strong class="office-register-value">advanced<\/strong>/);
assert.match(appJs, /<strong>등록 후속<\/strong>/);
assert.match(appJs, /<strong>안건 종료 보고<\/strong>/);

const executingMission = Object.values(executionGateState.missions)[0];
const executingTask = executionGateState.tasks[executingMission.linkedTaskId];
const executingApproval = Object.values(executionGateState.approvals).find((approval) => approval.status === 'pending');

assert.equal(executingMission.status, 'executing');
assert.equal(executingTask.flags.waitingApproval, true);
assert.equal(executingApproval?.allowedNextAction, 'builder-live-mutation');

console.log(
  JSON.stringify(
    {
      ok: true,
      pivotPostcompletionHousekeeping: {
        defaultSurfaces: ['mission', 'council', 'execution', 'deliverables'],
        activeMissionId: executingMission.id,
        activeTaskId: executingTask.id,
        allowedNextAction: executingApproval?.allowedNextAction || null,
      },
    },
    null,
    2,
  ),
);
