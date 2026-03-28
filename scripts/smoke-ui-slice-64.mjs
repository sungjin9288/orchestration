import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');
const masterBrief = fs.readFileSync(path.join(repoRoot, 'docs', '00_master-brief.md'), 'utf8');
const roadmap = fs.readFileSync(path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md'), 'utf8');

const statusOutput = execFileSync('git', ['status', '--short'], {
  cwd: repoRoot,
  encoding: 'utf8',
});

const lines = statusOutput
  .split('\n')
  .map((line) => line.trimEnd())
  .filter(Boolean);

const trackedModified = [];
const untracked = [];

for (const line of lines) {
  const code = line.slice(0, 2);
  const file = line.slice(3);
  if (code === ' M') {
    trackedModified.push(file);
    continue;
  }
  if (code === '??') {
    untracked.push(file);
    continue;
  }
  throw new Error(`Unexpected git status entry: ${line}`);
}

const expectedTrackedModified = [
  'docs/00_master-brief.md',
  'docs/01_decision-log.md',
  'docs/02_ia-v1.md',
  'docs/03_architecture-roadmap-v1.md',
  'packs/development/pack.md',
  'scripts/serve-ui-slice-01.mjs',
  'scripts/smoke-qa-slice-01.mjs',
  'scripts/smoke-qa-slice-02.mjs',
  'scripts/smoke-ui-slice-02.mjs',
  'src/runtime/contracts.js',
  'src/runtime/file-store.js',
  'src/runtime/runtime-service.js',
  'tasks/lessons.md',
  'tasks/todo.md',
  'ui/app.js',
  'ui/index.html',
  'ui/styles.css',
].sort();

const expectedUntracked = [
  'docs/06_ai-orchestration-pivot.md',
  'docs/07_mission-council-slice-m6-02.md',
  'scripts/smoke-retention-slice-01.mjs',
  'scripts/smoke-retention-slice-02.mjs',
  ...Array.from({ length: 66 - 13 + 1 }, (_, index) => `scripts/smoke-ui-slice-${index + 13}.mjs`),
].sort();

assert.deepEqual(
  [...trackedModified].sort(),
  expectedTrackedModified,
  'Tracked modified files drifted from the known hygiene baseline.',
);
assert.deepEqual(
  [...untracked].sort(),
  expectedUntracked,
  'Untracked files drifted from the known hygiene baseline.',
);

const uncheckedItems = [...todo.matchAll(/^- \[ \] /gm)];
assert.equal(uncheckedItems.length, 0, 'Expected zero unchecked todo items while hygiene baseline is pinned.');
assert.match(
  todo,
  /`scripts\/smoke-ui-slice-64\.mjs` now pins the known dirty worktree hygiene baseline: zero-open backlog stays true, staged\/deleted paths stay absent, tracked modifications stay limited to the current pivot\/runtime\/docs set, and untracked files stay limited to the current docs\/smoke additions until an explicit cleanup decision reopens that boundary/,
);
assert.match(
  lessons,
  /zero-open backlog가 곧 clean worktree를 뜻하지는 않으므로, cleanup decision 없이 바로 정리하려 들기보다 현재 dirty state를 known baseline smoke로 먼저 고정하는 편이 accidental drift와 cumulative intended changes를 가장 잘 분리했다\./,
);
assert.match(
  masterBrief,
  /future post-v1 follow-up returns to non-blocking housekeeping or later explicit `vNext` backlog items/,
);
assert.match(
  roadmap,
  /future post-freeze follow-up returns to explicit non-blocking housekeeping or later `vNext` backlog entries/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      hygiene: {
        uncheckedItems: uncheckedItems.length,
        trackedModified: trackedModified.length,
        untracked: untracked.length,
        stagedOrDeletedPresent: false,
      },
    },
    null,
    2,
  ),
);
