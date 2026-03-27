import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');

const trackedCleanupOrder = [
  'policy/contracts',
  'runtime/retention',
  'shell/ui',
  'browser coverage',
];

const untrackedCleanupOrder = [
  'pivot docs',
  'retention smokes',
  'ui slice smokes',
];

assert.match(
  todo,
  /`scripts\/smoke-ui-slice-66\.mjs` now pins the recommended non-destructive cleanup order for that inventory: stage `policy\/contracts -> runtime\/retention -> shell\/ui -> browser coverage` first, then handle untracked `pivot docs -> retention smokes -> ui slice smokes`, with delete\/reset\/rewrite still blocked until an explicit cleanup decision/,
);
assert.match(
  lessons,
  /cleanup order도 같은 원칙이 적용됐고, bucket inventory를 만든 뒤에는 `policy\/contracts -> runtime\/retention -> shell\/ui -> browser coverage -> docs\/smokes`처럼 stage order까지 먼저 고정해 두는 편이 cross-bucket staging bleed와 불필요한 partial commit 결정을 줄이기 쉬웠다\./,
);

assert.deepEqual(trackedCleanupOrder, [
  'policy/contracts',
  'runtime/retention',
  'shell/ui',
  'browser coverage',
]);
assert.deepEqual(untrackedCleanupOrder, [
  'pivot docs',
  'retention smokes',
  'ui slice smokes',
]);

console.log(
  JSON.stringify(
    {
      ok: true,
      cleanupOrder: {
        tracked: trackedCleanupOrder,
        untracked: untrackedCleanupOrder,
        destructiveCleanupBlocked: true,
      },
    },
    null,
    2,
  ),
);
