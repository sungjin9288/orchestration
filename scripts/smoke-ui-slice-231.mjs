import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const readinessDoc = fs.readFileSync(
  path.join(repoRoot, 'docs', '09_pre-real-test-readiness.md'),
  'utf8',
);
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');

assert.match(readinessDoc, /^# Pre-Real-Test Readiness$/m);
assert.match(readinessDoc, /실 테스트 readiness에서는 아래 두 경로를 같은 무게로 취급한다\./);
assert.match(readinessDoc, /Mission -> Council -> Execution -> Deliverables/);
assert.match(readinessDoc, /## Operator Runbook/);
assert.match(readinessDoc, /`OPENAI_API_KEY`/);
assert.match(readinessDoc, /`OPENAI_RESPONSES_MODEL`/);
assert.match(readinessDoc, /`node scripts\/smoke-qa-slice-07\.mjs`/);
assert.match(readinessDoc, /`node scripts\/smoke-provider-live-slice-05\.mjs`/);
assert.match(readinessDoc, /`node scripts\/smoke-qa-live-slice-07\.mjs`/);
assert.match(readinessDoc, /browser rehearsal은 같은 `qa-slice-07` daemon session을 공유하므로/);

assert.match(todo, /`pre-real-test-readiness-contract-m6-51`/);
assert.match(todo, /`ops-rehearsal-m6-52`/);
assert.match(todo, /`node scripts\/smoke-qa-slice-07\.mjs` passed as the local-stub canonical mission-first browser path/);
assert.match(todo, /`node scripts\/smoke-provider-live-slice-05\.mjs` passed as the live provider representative planner-through-builder-preflight path/);
assert.match(todo, /`node scripts\/smoke-qa-live-slice-07\.mjs` passed as the live browser representative mission-to-reviewer path/);

assert.match(lessons, /pre-real-test readiness는 freeze gate 자체를 바꾸는 문서가 아니라, current `main` 위에서 `local-stub` 와 `live` 를 동등한 acceptance path로 고정하는 operator runbook으로 따로 문서화하는 편이 안전했다\./);
assert.match(lessons, /`smoke-qa-slice-07\.mjs` 와 `smoke-qa-live-slice-07\.mjs` 는 같은 Playwright daemon session을 공유하므로, browser rehearsal evidence를 모을 때는 병렬로 돌리지 말고 exact entrypoint를 순차로 재실행하는 편이 false red를 가장 빨리 줄였다\./);

console.log(
  JSON.stringify(
    {
      ok: true,
      readiness: {
        docPinned: true,
        todoPinned: true,
        lessonsPinned: true,
      },
    },
    null,
    2,
  ),
);
