import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');
const masterBrief = fs.readFileSync(path.join(repoRoot, 'docs', '00_master-brief.md'), 'utf8');
const decisionLog = fs.readFileSync(path.join(repoRoot, 'docs', '01_decision-log.md'), 'utf8');
const ia = fs.readFileSync(path.join(repoRoot, 'docs', '02_ia-v1.md'), 'utf8');

assert.match(
  todo,
  /`provider adapter` remains explicitly deferred on current `main`; reopen only if optional real-live housekeeping or a concrete operator gap justifies a new decision/,
);
assert.match(
  todo,
  /`report\/content packs` remain outside the current `development`-pack-only baseline and do not reopen the shipped backlog/,
);
assert.match(
  todo,
  /`office\/radar view` remains rejected as a primary surface; at most it is a later read-only companion after an explicit new decision/,
);

assert.doesNotMatch(todo, /^- \[ \] provider adapter$/m);
assert.doesNotMatch(todo, /^- \[ \] report\/content packs$/m);
assert.doesNotMatch(todo, /^- \[ \] office\/radar view$/m);

assert.match(
  lessons,
  /deferred\/rejected section도 같은 원칙이 적용됐고, docs가 이미 `deferred` 또는 `rejected`로 못 박은 항목을 todo 끝에 `- \[ \]`로 남겨두면 실제 open implementation item처럼 오해되기 쉽다\./,
);
assert.match(
  decisionLog,
  /Do not start a second provider adapter after v1 completion unless optional real-live housekeeping or a concrete operator gap shows/,
);
assert.match(
  masterBrief,
  /broad pack marketplace or additional non-development packs/,
);
assert.match(
  ia,
  /office view or radar map as primary navigation/,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      deferredRejected: {
        officeRadarRejected: true,
        providerAdapterDeferred: true,
        reportContentPacksDeferred: true,
      },
    },
    null,
    2,
  ),
);
