import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const masterBriefPath = path.join(repoRoot, 'docs', '00_master-brief.md');
const architectureRoadmapPath = path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md');
const todoPath = path.join(repoRoot, 'tasks', 'todo.md');
const lessonsPath = path.join(repoRoot, 'tasks', 'lessons.md');
const indexPath = path.join(repoRoot, 'ui', 'index.html');
const appJsPath = path.join(repoRoot, 'ui', 'app.js');
const executionGateStatePath = path.join(repoRoot, 'var', 'runtime-ui-slice-20', 'state.json');

assert.equal(fs.existsSync(executionGateStatePath), true, 'runtime-ui-slice-20 state.json is required');

const masterBrief = fs.readFileSync(masterBriefPath, 'utf8');
const architectureRoadmap = fs.readFileSync(architectureRoadmapPath, 'utf8');
const todo = fs.readFileSync(todoPath, 'utf8');
const lessons = fs.readFileSync(lessonsPath, 'utf8');
const indexHtml = fs.readFileSync(indexPath, 'utf8');
const appJs = fs.readFileSync(appJsPath, 'utf8');
const executionGateState = JSON.parse(fs.readFileSync(executionGateStatePath, 'utf8'));

assert.match(
  masterBrief,
  /`ai-orchestration-pivot-v2` is now implemented on current `main`/,
);
assert.match(
  masterBrief,
  /future post-v1 follow-up returns to non-blocking housekeeping or later explicit `vNext` backlog items/,
);
assert.doesNotMatch(masterBrief, /the primary post-v1 direction is `ai-orchestration-pivot-v2`/);

assert.match(
  architectureRoadmap,
  /`ai-orchestration-pivot-v2` is now implemented on current `main`/,
);
assert.match(
  architectureRoadmap,
  /future post-freeze follow-up returns to explicit non-blocking housekeeping or later `vNext` backlog entries/,
);
assert.doesNotMatch(architectureRoadmap, /the primary post-v1 backlog item is `ai-orchestration-pivot-v2`/);

assert.match(
  todo,
  /- \[x\] `ai-orchestration-pivot-v2` is now implemented on current `main`/,
);
assert.doesNotMatch(todo, /- \[ \] `ai-orchestration-pivot-v2`/);

assert.match(
  lessons,
  /상위 방향성 항목\(`ai-orchestration-pivot-v2`\)이 실제로 구현된 뒤에도 backlog에 `\[ \]`로 남겨두면 이후 housekeeping이 다시 product blocker처럼 보인다\./,
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
      pivotBacklogAlignment: {
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
