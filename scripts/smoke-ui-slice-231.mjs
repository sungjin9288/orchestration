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
assert.match(readinessDoc, /browser rehearsal은 실행마다 짧은 고유 Playwright daemon session name을 만들어 stale page\/server state를 피하되/);
assert.match(readinessDoc, /macOS socket path length 한계도 넘지 않게 유지한다/);
assert.match(readinessDoc, /exact entrypoint 기준으로 순차 실행한다/);

assert.match(todo, /`pre-real-test-readiness-contract-m6-51`/);
assert.match(todo, /`ops-rehearsal-m6-52`/);
assert.match(todo, /`node scripts\/smoke-qa-slice-07\.mjs` passed as the local-stub canonical mission-first browser path/);
assert.match(todo, /`node scripts\/smoke-provider-live-slice-05\.mjs` passed as the live provider representative planner-through-builder-preflight path/);
assert.match(todo, /`node scripts\/smoke-qa-live-slice-07\.mjs` passed as the live browser representative mission-to-reviewer path/);

assert.match(lessons, /pre-real-test readiness는 freeze gate 자체를 바꾸는 문서가 아니라, current `main` 위에서 `local-stub` 와 `live` 를 동등한 acceptance path로 고정하는 operator runbook으로 따로 문서화하는 편이 안전했다\./);
assert.match(lessons, /QA browser runner는 고정 Playwright daemon session name을 재사용하면 stale page\/server state가 다음 rehearsal에 섞일 수 있고/);
assert.match(lessons, /너무 긴 고유 name은 macOS socket path length 한계에 걸릴 수 있다\./);
assert.match(lessons, /실행마다 짧은 고유 session name을 만들고, operator evidence 수집은 exact entrypoint를 순차 재실행해 runtime\/output evidence 해석을 분리하는 편이 false red를 줄인다\./);

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
