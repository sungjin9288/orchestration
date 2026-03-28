import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const todo = fs.readFileSync(path.join(repoRoot, 'tasks', 'todo.md'), 'utf8');
const lessons = fs.readFileSync(path.join(repoRoot, 'tasks', 'lessons.md'), 'utf8');

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

const trackedBuckets = {
  policyContracts: [
    'docs/00_master-brief.md',
    'docs/01_decision-log.md',
    'docs/02_ia-v1.md',
    'docs/03_architecture-roadmap-v1.md',
    'packs/development/pack.md',
    'tasks/lessons.md',
    'tasks/todo.md',
  ],
  runtimeRetention: [
    'scripts/serve-ui-slice-01.mjs',
    'src/runtime/contracts.js',
    'src/runtime/file-store.js',
    'src/runtime/runtime-service.js',
  ],
  shellUi: [
    'scripts/smoke-ui-slice-02.mjs',
    'ui/app.js',
    'ui/index.html',
    'ui/styles.css',
  ],
  browserCoverage: [
    'scripts/smoke-qa-slice-01.mjs',
    'scripts/smoke-qa-slice-02.mjs',
  ],
};

const untrackedBuckets = {
  pivotDocs: [
    'docs/06_ai-orchestration-pivot.md',
    'docs/07_mission-council-slice-m6-02.md',
  ],
  retentionSmokes: [
    'scripts/smoke-retention-slice-01.mjs',
    'scripts/smoke-retention-slice-02.mjs',
  ],
  uiSliceSmokes: Array.from({ length: 66 - 13 + 1 }, (_, index) => `scripts/smoke-ui-slice-${index + 13}.mjs`),
};

const expectedTracked = Object.values(trackedBuckets).flat().sort();
const expectedUntracked = Object.values(untrackedBuckets).flat().sort();

assert.deepEqual([...trackedModified].sort(), expectedTracked, 'Tracked modified inventory drifted from cleanup-readiness buckets.');
assert.deepEqual([...untracked].sort(), expectedUntracked, 'Untracked inventory drifted from cleanup-readiness buckets.');

assert.equal(trackedBuckets.policyContracts.length, 7);
assert.equal(trackedBuckets.runtimeRetention.length, 4);
assert.equal(trackedBuckets.shellUi.length, 4);
assert.equal(trackedBuckets.browserCoverage.length, 2);
assert.equal(untrackedBuckets.pivotDocs.length, 2);
assert.equal(untrackedBuckets.retentionSmokes.length, 2);
assert.equal(untrackedBuckets.uiSliceSmokes.length, 54);

assert.match(
  todo,
  /`scripts\/smoke-ui-slice-65\.mjs` now pins the cleanup-readiness inventory for that same dirty baseline: tracked modifications are bucketed into `policy\/contracts`, `runtime\/retention`, `shell\/ui`, and `browser coverage`, while untracked files stay bucketed as `pivot docs`, `retention smokes`, and `ui slice smokes` so future hygiene work can stage by bucket instead of ad-hoc file picking/,
);
assert.match(
  lessons,
  /dirty worktree를 실제로 정리할 시점이 오더라도 파일 하나씩 ad-hoc으로 고르기보다 `policy\/contracts`, `runtime\/retention`, `shell\/ui`, `browser coverage`, `docs\/smokes`처럼 stable bucket inventory를 먼저 고정해 두는 편이 staging 실수와 cleanup drift를 줄이기 쉬웠다\./,
);

console.log(
  JSON.stringify(
    {
      ok: true,
      trackedBuckets: Object.fromEntries(
        Object.entries(trackedBuckets).map(([name, files]) => [name, files.length]),
      ),
      untrackedBuckets: Object.fromEntries(
        Object.entries(untrackedBuckets).map(([name, files]) => [name, files.length]),
      ),
    },
    null,
    2,
  ),
);
