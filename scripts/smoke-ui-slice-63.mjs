import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');
const masterBrief = fs.readFileSync(path.join(repoRoot, 'docs', '00_master-brief.md'), 'utf8');
const roadmap = fs.readFileSync(
  path.join(repoRoot, 'docs', '03_architecture-roadmap-v1.md'),
  'utf8',
);

const uncheckedItems = [...todo.matchAll(/^- \[ \] /gm)].map((match) => match[0]);

assert.equal(uncheckedItems.length, 0, `Expected zero unchecked todo items, found ${uncheckedItems.length}`);
assert.match(
  todo,
  /`scripts\/smoke-ui-slice-63\.mjs` now pins the zero-open backlog state so future follow-up must start from an explicit new decision or a newly-added backlog item, not a stale unchecked checkbox/,
);
assert.match(
  lessons,
  /todo에 active unchecked item이 0개가 된 시점은 그냥 상태가 아니라 baseline contract라서, `rg` 확인만 하고 끝내기보다 zero-open 상태 자체를 smoke로 고정해 두는 편이 이후 stale checkbox 재유입을 가장 빨리 잡아냈다\./,
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
      backlog: {
        uncheckedItems: uncheckedItems.length,
        zeroOpenPinned: true,
      },
    },
    null,
    2,
  ),
);
